import { Pool } from 'pg';
import fs from 'node:fs';

const databaseUrl = process.env.DATABASE_URL || '';
if (!databaseUrl) throw new Error('DATABASE_URL is required');
const parsed = new URL(databaseUrl);
if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) throw new Error('DATABASE_URL must use PostgreSQL');
const remote = !['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
const caPath = process.env.PGSSLROOTCERT || '';
if (process.env.NODE_ENV === 'production' && remote && !caPath) {
  throw new Error('PGSSLROOTCERT is required for remote production databases');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: caPath ? { rejectUnauthorized: true, ca: fs.readFileSync(caPath, 'utf8') } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database client error', { name: err.name });
  process.exitCode = 1;
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.DB_QUERY_METRICS === 'true') console.log('Executed database query', { duration, rows: res.rowCount });
  return res;
};

export const getClient = () => pool.connect();
export const closePool = () => pool.end();

export default pool;
