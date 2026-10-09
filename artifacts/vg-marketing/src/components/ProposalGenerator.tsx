import { useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Download, FileText, LoaderCircle, X } from 'lucide-react';
import { getListLeadServicesQueryKey, useListLeadServices } from '@workspace/api-client-react';
import type { LeadService } from '@workspace/api-client-react';

type ProposalLead = { id: number; name: string; company: string | null; email: string; whatsapp: string };

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const billingLabel = (value: LeadService['billingType']) => value === 'recurring' ? 'Recorrente' : 'Pontual';

type ProposalWorkerResponse =
  | { type: 'generated'; blob: Blob; filename: string }
  | { type: 'error'; message: string };

function imageAsPng(source: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) return reject(new Error('Não foi possível preparar o logotipo.'));
      context.drawImage(image, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error('Não foi possível carregar o logotipo oficial.'));
    image.src = source;
  });
}

export function ProposalGenerator({
  lead,
  logoPath,
  buttonClassName = 'inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#9fe4e5]/35 bg-[#9fe4e5]/10 px-2.5 text-[11px] font-bold text-[#b8d9da] transition-colors hover:bg-[#9fe4e5]/20',
}: { lead: ProposalLead; logoPath: string; buttonClassName?: string }) {
  const [open, setOpen] = useState(false);
  const [scopes, setScopes] = useState<Record<number, string>>({});
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const servicesQuery = useListLeadServices(lead.id, {
    query: { enabled: open && !!lead.id, queryKey: getListLeadServicesQueryKey(lead.id) },
  });
  const services = servicesQuery.data?.services ?? [];
  const incomplete = useMemo(() => services.filter((service) => service.price === null || service.billingType === null), [services]);

  const close = () => {
    if (generating) return;
    setOpen(false);
    setScopes({});
    setGenerationError('');
  };

  const generatePdf = async () => {
    if (!services.length || incomplete.length) return;
    setGenerating(true);
    setGenerationError('');
    let worker: Worker | undefined;
    try {
      const logoData = await imageAsPng(logoPath);
      worker = new Worker(new URL('./proposal-pdf.worker.ts', import.meta.url), { type: 'module' });
      const result = await new Promise<{ blob: Blob; filename: string }>((resolve, reject) => {
        worker!.onmessage = (event: MessageEvent<ProposalWorkerResponse>) => {
          if (event.data.type === 'error') {
            reject(new Error(event.data.message));
            return;
          }
          resolve({ blob: event.data.blob, filename: event.data.filename });
        };
        worker!.onerror = () => reject(new Error('Não foi possível iniciar a geração do PDF.'));
        worker!.postMessage({ type: 'generate', lead, services, scopes, logoData });
      });
      const downloadUrl = URL.createObjectURL(result.blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = result.filename;
      downloadLink.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 30_000);
      setOpen(false);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      worker?.terminate();
      setGenerating(false);
    }
  };

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label="Gerar proposta em PDF" title="Gerar proposta em PDF" data-testid="button-open-proposal" className={buttonClassName}>
      <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Gerar proposta
    </button>
    {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#101c31]/70 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="proposal-title" data-testid="dialog-proposal" className="flex max-h-[min(92dvh,900px)] w-full max-w-[760px] flex-col overflow-hidden rounded-2xl border border-[#d9e0e8] bg-[#f6f8fb] text-[#263248] shadow-[0_28px_90px_rgba(10,22,42,.34)]">
        <header className="flex items-start justify-between gap-4 border-b border-[#d9e0e8] bg-white px-5 py-5 sm:px-7">
          <div>
            <p className="font-mono-vg text-[9px] font-bold uppercase tracking-[.18em] text-[#718095]">VG Consultoria em Marketing · CRM</p>
            <h2 id="proposal-title" className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-[29px]">Preparar proposta</h2>
            <p className="mt-1 text-xs text-[#718095]">Revise o escopo por serviço antes de baixar o documento.</p>
          </div>
          <button type="button" onClick={close} disabled={generating} aria-label="Fechar proposta" data-testid="button-close-proposal" className="rounded-lg border border-[#d9e0e8] p-2 text-[#56657d] transition-colors hover:bg-[#eef2f6] disabled:opacity-50"><X className="h-4 w-4" /></button>
        </header>
        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#d9e0e8] bg-white p-4" data-testid="text-proposal-client">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e8edf5] text-[#526b95]"><FileText className="h-4 w-4" /></div>
            <div className="min-w-0"><p className="font-bold">{lead.name}</p>{lead.company && <p className="mt-0.5 text-xs text-[#56657d]">{lead.company}</p>}<p className="mt-1 break-all text-xs text-[#718095]">{lead.email} · {lead.whatsapp}</p></div>
          </div>
          {servicesQuery.isLoading && <div className="space-y-3" data-testid="status-proposal-loading"><div className="h-20 animate-pulse rounded-xl bg-[#e4eaf1]" /><div className="h-20 animate-pulse rounded-xl bg-[#e4eaf1]" /><p className="text-center text-xs text-[#718095]">Carregando serviços vinculados…</p></div>}
          {servicesQuery.isError && <div className="flex items-start gap-3 rounded-xl border border-[#e7c9c5] bg-[#fff7f5] p-4 text-sm text-[#8f4942]" data-testid="status-proposal-error"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-bold">Não foi possível carregar os serviços.</p><button type="button" onClick={() => void servicesQuery.refetch()} data-testid="button-retry-proposal-services" className="mt-2 underline underline-offset-2">Tentar novamente</button></div></div>}
          {!servicesQuery.isLoading && !servicesQuery.isError && services.length === 0 && <div className="rounded-xl border border-dashed border-[#cbd6e2] bg-white px-5 py-8 text-center" data-testid="status-proposal-empty"><p className="font-semibold">Este lead ainda não tem serviços vinculados.</p><p className="mt-1 text-xs text-[#718095]">Adicione serviços ao lead para montar uma proposta.</p></div>}
          {services.length > 0 && <div className="space-y-3">
            {incomplete.length > 0 && <div role="alert" data-testid="status-proposal-incomplete" className="flex items-start gap-3 rounded-xl border border-[#e4c99e] bg-[#fff8ea] px-4 py-3 text-sm text-[#795b2b]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Proposta bloqueada.</strong> Complete preço e tipo de cobrança no CRM para: {incomplete.map((service) => service.name).join(', ')}.</p></div>}
            {services.map((service) => <article key={service.id} data-testid={`card-proposal-service-${service.id}`} className="rounded-xl border border-[#d9e0e8] bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h3 className="font-bold text-[#263248]">{service.name}</h3><p className="mt-1 text-xs leading-5 text-[#5e6e80]">{service.description}</p></div>
                <div className="shrink-0 rounded-lg bg-[#f1f4f8] px-3 py-2 text-right"><p className="text-[9px] font-extrabold uppercase tracking-[.12em] text-[#718095]">{service.billingType ? billingLabel(service.billingType) : 'Cobrança não definida'}</p><p className="mt-1 text-sm font-extrabold text-[#263248]">{service.price === null ? 'Preço não definido' : money(service.price)}</p></div>
              </div>
              <label htmlFor={`proposal-scope-${service.id}`} className="mt-4 block text-[10px] font-extrabold uppercase tracking-[.13em] text-[#526b95]">Escopo / observação desta proposta</label>
              <textarea id={`proposal-scope-${service.id}`} value={scopes[service.id] ?? ''} onChange={(event) => setScopes((current) => ({ ...current, [service.id]: event.target.value }))} rows={3} placeholder="Ex.: 10 horas de consultoria; 8 publicações por mês; site institucional com até 5 páginas." data-testid={`input-proposal-scope-${service.id}`} className="mt-2 w-full resize-y rounded-lg border border-[#d9e0e8] bg-[#f9fafc] px-3 py-2.5 text-sm leading-6 text-[#263248] outline-none transition-colors placeholder:text-[#9aa6b5] focus:border-[#6c83aa] focus:bg-white" />
            </article>)}
          </div>}
          {generationError && <p role="alert" data-testid="status-proposal-generation-error" className="mt-4 rounded-lg border border-[#e7c9c5] bg-[#fff7f5] px-3 py-2 text-sm text-[#8f4942]">{generationError}</p>}
        </div>
        <footer className="flex flex-col-reverse gap-2 border-t border-[#d9e0e8] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <button type="button" onClick={close} disabled={generating} data-testid="button-cancel-proposal" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#d9e0e8] px-4 text-sm font-bold text-[#56657d] hover:bg-[#f4f6f9] disabled:opacity-50"><ArrowLeft className="h-4 w-4" /> Voltar ao lead</button>
          <button type="button" onClick={() => void generatePdf()} disabled={generating || services.length === 0 || incomplete.length > 0 || servicesQuery.isLoading || servicesQuery.isError} data-testid="button-download-proposal" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#263248] px-5 text-sm font-extrabold text-white transition-colors hover:bg-[#40577d] disabled:cursor-not-allowed disabled:opacity-45">
            {generating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {generating ? 'Gerando PDF…' : 'Baixar proposta PDF'}
          </button>
        </footer>
      </section>
    </div>}
  </>;
}
