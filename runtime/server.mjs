import http from 'node:http';
import crypto from 'node:crypto';
import { literal, query, transaction } from './db.mjs';

const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const serviceError = (status, message) => Object.assign(new Error(message), { status });

function verify(password, stored) {
  const [kind, salt, digest] = String(stored).split('$');
  if (kind !== 'scrypt' || !salt || !digest) return false;
  const candidate = crypto.scryptSync(password, salt, 32), expected = Buffer.from(digest, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

async function readBody(req) {
  let text = '';
  for await (const chunk of req) {
    text += chunk;
    if (text.length > 1_000_000) throw serviceError(413, 'Request is too large.');
  }
  try { return text ? JSON.parse(text) : {}; }
  catch { throw serviceError(400, 'The request body must be valid JSON.'); }
}

export function createRuntimeServer({ queryDb = query, transact = transaction, fetchProvider = (...args) => fetch(...args), env = process.env } = {}) {
  const frontendOrigin = `http://127.0.0.1:${env.FRONTEND_PORT}`;
  const selectedEndpoint = String(env.RUNTIME_AI_ENDPOINT || '');
  const feature = String(env.RUNTIME_AI_FEATURE || 'application-assistant');
  const project = String(env.RUNTIME_PROJECT_NAME || 'Application');
  const systemPrompt = String(env.RUNTIME_AI_SYSTEM_PROMPT || 'Provide a concise, practical, evidence-aware answer for this application workflow.');
  const json = (res, status, body) => {
    if (res.destroyed || res.writableEnded) return;
    res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': frontendOrigin, 'Access-Control-Allow-Headers': 'Authorization, Content-Type' });
    res.end(JSON.stringify(body));
  };
  async function actor(req) {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!token) return null;
    const row = await queryDb(`SELECT u.id,u.email,u.display_name,u.role FROM runtime_app_sessions s JOIN runtime_app_users u ON u.id=s.user_id WHERE s.token_hash=${literal(sha(token))} AND s.expires_at>NOW() AND u.active=TRUE LIMIT 1`, { rows: true });
    if (!row) return null;
    const [id, email, displayName, role] = row.split('\t');
    return { id, email, displayName, role };
  }

  return http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, { 'Access-Control-Allow-Origin': frontendOrigin, 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' });
      return res.end();
    }
    const url = new URL(req.url || '/', 'http://127.0.0.1');
    const controller = new AbortController();
    const abort = () => controller.abort(serviceError(499, 'Request cancelled.'));
    const onClose = () => { if (!res.writableEnded) abort(); };
    req.once('aborted', abort); res.once('close', onClose);
    let timeout;
    try {
      if (req.method === 'GET' && url.pathname === '/api/health') return json(res, 200, { status: 'ok', project });
      if (req.method === 'POST' && url.pathname === '/api/auth/login') {
        const body = await readBody(req), email = String(body.email || '').trim().toLowerCase(), password = String(body.password || '');
        const row = await queryDb(`SELECT id,email,password_hash,display_name,role FROM runtime_app_users WHERE email=${literal(email)} AND active=TRUE LIMIT 1`, { rows: true });
        if (!row) return json(res, 401, { error: 'Invalid credentials' });
        const [id, userEmail, passwordHash, displayName, role] = row.split('\t');
        if (!verify(password, passwordHash)) return json(res, 401, { error: 'Invalid credentials' });
        const token = crypto.randomBytes(32).toString('hex');
        await queryDb(`INSERT INTO runtime_app_sessions(token_hash,user_id,expires_at) VALUES(${literal(sha(token))},${literal(id)}::uuid,NOW()+INTERVAL '24 hours')`);
        return json(res, 200, { token, accessToken: token, refreshToken: token, user: { id, email: userEmail, name: displayName, role } });
      }
      if (req.method === 'GET' && url.pathname === '/api/auth/me') {
        const user = await actor(req);
        return user ? json(res, 200, { user, addresses: [] }) : json(res, 401, { error: 'Authentication required' });
      }
      if (req.method === 'GET' && /^\/api\/ai\/history(?:\/[^/]+)?$/.test(url.pathname)) {
        const user = await actor(req);
        if (!user) return json(res, 401, { error: 'Authentication required' });
        const id = url.pathname.slice('/api/ai/history'.length).replace(/^\//, '');
        if (id && !/^\d+$/.test(id)) return json(res, 404, { error: 'Report not found.' });
        const rows = await queryDb(`SELECT json_build_object('id',id,'feature',feature,'input',input,'output',output,'model',model,'createdAt',created_at)::text FROM runtime_ai_interactions WHERE user_id=${literal(user.id)}::uuid ${id ? `AND id=${literal(id)}::bigint` : ''} ORDER BY created_at DESC LIMIT 50`, { rows: true });
        const history = rows ? rows.split('\n').map(JSON.parse) : [];
        return id ? (history[0] ? json(res, 200, { report: history[0] }) : json(res, 404, { error: 'Report not found.' })) : json(res, 200, { history });
      }
      if (req.method === 'POST' && selectedEndpoint && url.pathname === selectedEndpoint) {
        const user = await actor(req);
        if (!user) return json(res, 401, { error: 'Authentication required' });
        const body = await readBody(req), input = body?.prompt || body?.question || body?.message || body?.context;
        if (typeof input !== 'string' || !input.trim() || input.trim().length > 12000) return json(res, 400, { error: 'A brief of 1–12,000 characters is required.' });
        const prompt = input.trim(), base = String(env.OPENROUTER_BASE_URL || '').replace(/\/+$/, ''), model = String(env.OPENROUTER_MODEL || '').trim(), key = String(env.OPENROUTER_API_KEY || '').trim();
        if (base !== 'https://openrouter.ai/api/v1' || !model || !key) throw serviceError(503, 'OpenRouter is unavailable until its canonical endpoint, model and credentials are configured.');
        timeout = setTimeout(() => controller.abort(serviceError(504, 'OpenRouter timed out. Please retry.')), 45000);
        controller.signal.throwIfAborted();
        let provider;
        try {
          const response = await fetchProvider(`${base}/chat/completions`, { method: 'POST', signal: controller.signal, headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-Title': project }, body: JSON.stringify({ model, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }], max_tokens: 650 }) });
          if (!response.ok) throw serviceError(502, 'OpenRouter could not complete the review. Please retry.');
          provider = await response.json();
        } catch (error) {
          if (controller.signal.aborted) throw controller.signal.reason;
          throw error.status ? error : serviceError(502, 'OpenRouter could not complete the review. Please retry.');
        }
        controller.signal.throwIfAborted();
        const choice = provider?.choices?.[0], message = choice?.message;
        if (!provider || provider.error || typeof provider.id !== 'string' || !provider.id || typeof provider.model !== 'string' || !provider.model || choice?.finish_reason !== 'stop' || message?.refusal || typeof message?.content !== 'string' || !message.content.trim()) throw serviceError(502, 'OpenRouter returned an incomplete or declined review. No report was saved.');
        const content = message.content.trim(), providerReceipt = { id: provider.id, model: provider.model, usage: provider.usage || null };
        const saved = await transact(async client => {
          controller.signal.throwIfAborted();
          const tokenHash = sha(String(req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
          const identity = await client.query('SELECT u.id FROM runtime_app_users u JOIN runtime_app_sessions s ON s.user_id=u.id WHERE u.id=$1 AND u.active=TRUE AND s.token_hash=$2 AND s.expires_at>NOW() FOR KEY SHARE OF u,s', [user.id, tokenHash]);
          if (!identity.rows.length) throw serviceError(401, 'Authentication required');
          const inserted = await client.query('INSERT INTO runtime_ai_interactions(user_id,feature,input,output,model) VALUES($1,$2,$3::jsonb,$4::jsonb,$5) RETURNING id', [user.id, feature, JSON.stringify({ prompt }), JSON.stringify({ content, providerReceipt }), providerReceipt.model]);
          controller.signal.throwIfAborted();
          const id = Number(inserted.rows[0]?.id);
          if (!Number.isSafeInteger(id) || id <= 0) throw serviceError(500, 'The report could not be saved.');
          return id;
        }, { signal: controller.signal });
        controller.signal.throwIfAborted();
        return json(res, 200, { content, model: providerReceipt.model, providerReceipt, interactionId: saved, feature });
      }
      return json(res, 404, { error: 'Not found' });
    } catch (error) {
      return json(res, error.status || 500, { error: error.status ? error.message : 'Internal service error' });
    } finally { clearTimeout(timeout); req.removeListener('aborted', abort); res.removeListener('close', onClose); }
  });
}
