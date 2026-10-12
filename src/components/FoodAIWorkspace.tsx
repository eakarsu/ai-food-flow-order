import { useEffect, useRef, useState, type FormEvent } from 'react';
import AIResponseReport from './AIResponseReport';

export interface FoodAIRecord {
  id: string | number;
  prompt: string;
  response: unknown;
  model?: string;
  createdAt?: string;
}

export interface FoodAIWorkspaceProps {
  title: string;
  description: string;
  identityKey: string;
  presets: { label: string; prompt: string }[];
  request: (prompt: string, signal: AbortSignal) => Promise<FoodAIRecord>;
  history: (signal: AbortSignal) => Promise<FoodAIRecord[]>;
}

export default function FoodAIWorkspace({ title, description, identityKey, presets, request, history }: FoodAIWorkspaceProps) {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<FoodAIRecord | null>(null);
  const [records, setRecords] = useState<FoodAIRecord[]>([]);
  const [selected, setSelected] = useState<FoodAIRecord | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const requestController = useRef<AbortController | null>(null);
  const historyController = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    historyController.current = controller;
    setRecords([]); setSelected(null); setResult(null); setPrompt(''); setError(''); setNotice(''); setBusy(false);
    history(controller.signal).then(rows => {
      if (!controller.signal.aborted) {
        if (!Array.isArray(rows)) throw new Error('Saved reports could not be loaded: unexpected history response.');
        setRecords(rows);
      }
    }).catch(cause => {
      if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Saved reports could not be loaded.');
    });
    return () => { controller.abort(); historyController.current?.abort(); requestController.current?.abort(); requestController.current = null; };
  }, [identityKey, history]);

  useEffect(() => {
    if (!selected) return;
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [selected]);

  function cancel() {
    requestController.current?.abort(); requestController.current = null;
    setBusy(false); setNotice('Request cancelled.');
  }

  async function generate(event: FormEvent) {
    event.preventDefault();
    if (requestController.current || !prompt.trim()) return;
    const controller = new AbortController(); requestController.current = controller;
    setBusy(true); setResult(null); setError(''); setNotice('');
    try {
      const record = await request(prompt.trim(), controller.signal);
      if (controller.signal.aborted || requestController.current !== controller) return;
      setResult(record); setNotice('Report saved. Review its recommendations before use.');
      historyController.current?.abort();
      const refresh = new AbortController(); historyController.current = refresh;
      history(refresh.signal).then(rows => {
        if (!refresh.signal.aborted) {
          if (!Array.isArray(rows)) throw new Error('Saved reports could not be loaded: unexpected history response.');
          setRecords(rows);
        }
      }).catch(() => { if (!refresh.signal.aborted) setError('The report was saved, but history could not be refreshed.'); });
    } catch (cause) {
      if (!controller.signal.aborted && requestController.current === controller) setError(cause instanceof Error ? cause.message : 'The AI request failed.');
    } finally {
      if (requestController.current === controller) { requestController.current = null; setBusy(false); }
    }
  }

  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 text-slate-800">
    <header><p className="text-sm font-semibold text-emerald-700">AI Studio · OpenRouter</p><h1 className="mt-2 text-3xl font-semibold">{title}</h1><p className="mt-3 max-w-3xl leading-7 text-slate-600">{description}</p></header>
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
      <section className="min-w-0 space-y-5">
        <form onSubmit={generate} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div><h2 className="text-lg font-semibold">Review brief</h2><p className="mt-1 text-sm leading-6 text-slate-500">Choose an example to fill the complete brief, then add your actual observations. Examples fill fields without sending a request.</p></div>
          <div className="flex flex-wrap gap-2">{presets.map(preset => <button key={preset.label} type="button" disabled={busy} onClick={() => { setPrompt(preset.prompt); setNotice('Example filled. Add your actual facts before generating.'); }} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 disabled:opacity-50">Fill all · {preset.label}</button>)}</div>
          <label className="block text-sm font-medium" htmlFor="food-ai-brief">Instructions and observed context<textarea id="food-ai-brief" required maxLength={12000} rows={8} disabled={busy} value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Describe your actual workflow, observations, questions and constraints." className="mt-2 block w-full rounded-lg border border-slate-300 p-3 font-normal leading-6" /></label>
          <p className="text-xs leading-5 text-slate-500">Advisory review. This action creates a report; recommendations require your review before operational use.</p>
          <div className="flex flex-wrap gap-3"><button type="submit" disabled={busy || !prompt.trim()} className="rounded-lg bg-emerald-700 px-4 py-2.5 font-medium text-white disabled:opacity-50">{busy ? 'Generating…' : 'Generate with OpenRouter'}</button>{busy && <button type="button" onClick={cancel} className="rounded-lg border border-slate-300 px-4 py-2.5">Cancel request</button>}</div>
        </form>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
        {notice && <p role="status" className="text-sm text-slate-600">{notice}</p>}
        {result && <AIResponseReport value={result.response} title={title + ' report'} />}
      </section>
      <aside className="self-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Saved AI reports"><h2 className="text-lg font-semibold">Saved reports</h2><p className="mt-1 text-xs leading-5 text-slate-500">Your retained provider reports. Select a report to review it.</p><div className="mt-4 space-y-2">{records.map(record => <button key={record.id} type="button" onClick={() => setSelected(record)} className="block w-full rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50"><span className="block truncate text-sm font-medium">{record.prompt || 'Saved review'}</span><span className="mt-1 block text-xs text-slate-500">Report {record.id}{record.createdAt ? ' · ' + new Date(record.createdAt).toLocaleString() : ''}</span></button>)}{records.length === 0 && <p className="text-sm text-slate-500">No saved reports are available.</p>}</div></aside>
    </div>
    {selected && <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4" onClick={event => { if (event.target === event.currentTarget) setSelected(null); }}><section role="dialog" aria-modal="true" aria-labelledby="food-report-heading" className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"><header className="flex items-start justify-between gap-4"><div><h2 id="food-report-heading" className="text-xl font-semibold">Saved report {selected.id}</h2><p className="mt-1 text-xs text-slate-500">{selected.model ? 'Model: ' + selected.model : 'Retained provider response'}</p></div><button type="button" onClick={() => setSelected(null)} className="rounded-lg border px-3 py-2">Cancel</button></header><h3 className="mt-6 text-sm font-semibold">Original brief</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selected.prompt}</p><AIResponseReport value={selected.response} title={title + ' report'} /><footer className="space-y-3 border-t pt-4"><div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => { setPrompt(selected.prompt); setSelected(null); setNotice('Original brief loaded for a new report. The saved report remains retained.'); }} className="rounded-lg border px-4 py-2 disabled:opacity-50">Edit brief for new report</button><button type="button" disabled title="Provider reports are retained; this service has no report-deletion action." className="rounded-lg border px-4 py-2 text-slate-400">Delete unavailable</button><button type="button" onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2">Close</button></div><p className="text-xs text-slate-500">Saved provider reports are retained as evidence. Editing the brief creates a new request; deletion is unavailable in this service.</p></footer></section></div>}
  </div>;
}
