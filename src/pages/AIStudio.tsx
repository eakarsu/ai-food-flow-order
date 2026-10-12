import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import FoodAIWorkspace, { type FoodAIRecord } from '@/components/FoodAIWorkspace';
import { useAuth } from '@/context/AuthContext';
import { apiRequest } from '@/services/api';

const presets = [
  { label: 'Queue readiness', prompt: 'Review a restaurant order queue before a busy service. Explain the observations needed to distinguish a kitchen bottleneck from a handoff delay, list the checks staff should perform in priority order, and draft a concise internal escalation brief. No live queue counts, menu availability or delivery estimates are supplied: identify these as missing rather than inventing them. Keep actions advisory and require staff confirmation before changing orders or promising a time.' },
  { label: 'Fulfillment handoff', prompt: 'Prepare a restaurant fulfillment handoff review covering preparation, packing, pickup confirmation and customer updates. Describe a practical checklist, ownership questions and warning signs that require an operator review. No actual order, menu item, staff assignment or customer record is supplied; request the relevant observed facts without inventing identifiers. Recommend checks and draft wording only; do not mark an order complete, contact a customer or initiate a refund.' },
  { label: 'Customer communication', prompt: 'Create a restaurant order-delay communication review. Provide an empathetic message template, a short verification checklist for staff and clear escalation criteria. Distinguish confirmed facts from facts that still need checking. No order status, delay duration, stock count or customer information is supplied, so do not manufacture any. Use neutral wording that can be adapted after staff verify the actual order; do not promise a delivery time or execute operational changes.' },
];
type Stored = { id: number; input: { prompt?: string; question?: string; message?: string; context?: string }; output: unknown; model: string; createdAt: string };
const history = async (signal: AbortSignal): Promise<FoodAIRecord[]> => {
  const response = await apiRequest<{ history?: Stored[]; data?: Stored[] }>('/ai/history', { signal });
  const rows = Array.isArray(response?.history) ? response.history : response?.data;
  if (!Array.isArray(rows)) throw new Error('Saved reports could not be loaded: unexpected history response.');
  return rows.map(row => ({ id: row.id, prompt: row.input?.prompt || row.input?.question || row.input?.message || row.input?.context || '', response: row.output, model: row.model, createdAt: row.createdAt }));
};
const request = async (prompt: string, signal: AbortSignal): Promise<FoodAIRecord> => {
  const response = await apiRequest<{ interactionId: number; content: string; model: string }>('/ai/order-operations', { method: 'POST', signal, body: JSON.stringify({ prompt }) });
  if (!Number.isSafeInteger(response.interactionId) || response.interactionId <= 0 || !response.content) throw new Error('The service did not return a saved provider report.');
  return { id: response.interactionId, prompt, response, model: response.model };
};

export default function AIStudio() {
  const { user, isAuthenticated, isLoading } = useAuth();
  return <><Navbar /><main className="min-h-screen bg-slate-50 pt-24">
    {isLoading ? <p className="p-8" role="status">Checking your session…</p> : isAuthenticated && user ? <FoodAIWorkspace identityKey={user.id} title="Order operations review" description="Review queue readiness, fulfillment handoffs and customer communication with the live order-operations assistant. Add verified observations to your brief and review the saved report before taking action." presets={presets} request={request} history={history} /> : <div className="mx-auto max-w-xl p-8"><h1 className="text-2xl font-semibold">AI Studio</h1><p className="my-4">Sign in to generate an order-operations review and see your saved reports.</p><Link className="text-emerald-700 underline" to="/login">Sign in</Link></div>}
  </main></>;
}
