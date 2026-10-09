import { useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, Download, FileText, LoaderCircle, X } from 'lucide-react';
import { getListLeadServicesQueryKey, useListLeadServices } from '@workspace/api-client-react';
import type { LeadService } from '@workspace/api-client-react';

type ProposalLead = { id: number; name: string; company: string | null; email: string; whatsapp: string };

const money = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const billingLabel = (value: LeadService['billingType']) => value === 'recurring' ? 'Recorrente' : 'Pontual';

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

export function ProposalGenerator({ lead, logoPath }: { lead: ProposalLead; logoPath: string }) {
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
    try {
      const [{ jsPDF }, logoData] = await Promise.all([
        import('jspdf'),
        imageAsPng(logoPath),
      ]);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const left = 17;
      const right = 17;
      const width = pageWidth - left - right;
      let y = 16;
      let page = 1;
      const navy: [number, number, number] = [38, 50, 72];
      const blue: [number, number, number] = [82, 107, 149];
      const muted: [number, number, number] = [94, 110, 128];
      const pale: [number, number, number] = [245, 247, 250];
      const fmtDate = (date: Date) => new Intl.DateTimeFormat('pt-BR').format(date);
      const issue = new Date();

      const header = () => {
        pdf.setFillColor(...blue);
        pdf.rect(0, 0, pageWidth, 3, 'F');
        pdf.addImage(logoData, 'PNG', left, 10, 20, 20);
        pdf.setTextColor(...navy);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.text('VG Consultoria em Marketing', 41, 17);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(...muted);
        pdf.text(`Emissão: ${fmtDate(issue)}`, pageWidth - right, 15, { align: 'right' });
        pdf.text('Validade: 30 dias', pageWidth - right, 20, { align: 'right' });
        pdf.setDrawColor(217, 224, 232);
        pdf.line(left, 34, pageWidth - right, 34);
      };
      const newPage = () => {
        pdf.addPage();
        page += 1;
        y = 16;
        header();
        y = 42;
      };
      const ensure = (height: number) => {
        if (y + height > 266) newPage();
      };
      const drawWrapped = (text: string, x: number, maxWidth: number, size: number, color: [number, number, number], lineHeight = 4.2) => {
        pdf.setFontSize(size);
        pdf.setTextColor(...color);
        const lines = pdf.splitTextToSize(text || ' ', maxWidth) as string[];
        lines.forEach((line) => {
          if (y + lineHeight > 266) newPage();
          pdf.text(line, x, y);
          y += lineHeight;
        });
      };
      header();
      y = 44;
      pdf.setTextColor(...navy);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('Proposta comercial', left, y);
      y += 11;
      const clientLines = [
        lead.name,
        ...(lead.company ? [lead.company] : []),
        lead.email,
        lead.whatsapp,
      ];
      const clientHeight = 12 + clientLines.length * 5;
      ensure(clientHeight + 7);
      pdf.setFillColor(...pale);
      pdf.setDrawColor(217, 224, 232);
      pdf.roundedRect(left, y, width, clientHeight, 2, 2, 'FD');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(...muted);
      pdf.text('CLIENTE', left + 5, y + 6);
      pdf.setFontSize(9);
      pdf.setTextColor(...navy);
      clientLines.forEach((line, index) => {
        pdf.setFont('helvetica', index === 0 ? 'bold' : 'normal');
        pdf.text(line, left + 5, y + 12 + index * 5);
      });
      y += clientHeight + 9;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.setTextColor(...navy);
      pdf.text('Serviços e valores', left, y);
      y += 7;

      services.forEach((service, index) => {
        ensure(23);
        if (index > 0) {
          pdf.setDrawColor(225, 229, 235);
          pdf.line(left, y, pageWidth - right, y);
          y += 6;
        }
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10.5);
        pdf.setTextColor(...navy);
        const titleLines = pdf.splitTextToSize(service.name, width - 48) as string[];
        titleLines.forEach((line) => {
          if (y > 263) newPage();
          pdf.text(line, left, y);
          y += 5;
        });
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(...muted);
        pdf.text(billingLabel(service.billingType), pageWidth - right, y - titleLines.length * 5 + 1, { align: 'right' });
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(...navy);
        pdf.text(money(service.price as number), pageWidth - right, y - titleLines.length * 5 + 6, { align: 'right' });

        pdf.setFont('helvetica', 'normal');
        drawWrapped(service.description, left, width - 4, 8.2, muted, 4.1);
        const scope = scopes[service.id]?.trim();
        if (scope) {
          y += 2;
          pdf.setDrawColor(...blue);
          pdf.setLineWidth(0.7);
          pdf.line(left + 1, y - 1, left + 1, y + 4);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(7);
          pdf.setTextColor(...muted);
          pdf.text('ESCOPO / OBSERVAÇÃO', left + 4, y + 1);
          y += 5;
          pdf.setFont('helvetica', 'normal');
          drawWrapped(scope, left + 4, width - 8, 8.2, navy, 4.1);
        }
        y += 4;
      });

      const recurringTotal = services.filter((service) => service.billingType === 'recurring').reduce((sum, service) => sum + (service.price ?? 0), 0);
      const oneTimeTotal = services.filter((service) => service.billingType === 'one_time').reduce((sum, service) => sum + (service.price ?? 0), 0);
      const hasRecurring = services.some((service) => service.billingType === 'recurring');
      const hasOneTime = services.some((service) => service.billingType === 'one_time');
      const totalsCount = Number(hasRecurring) + Number(hasOneTime);
      const totalsHeight = 21;
      ensure(totalsHeight + 27);
      const cardGap = 3;
      const cardWidth = (width - (totalsCount === 2 ? cardGap : 0)) / totalsCount;
      const drawTotal = (position: number, label: string, amount: number, dark: boolean) => {
        const x = left + position * (cardWidth + cardGap);
        if (dark) pdf.setFillColor(...navy);
        else pdf.setFillColor(233, 238, 245);
        pdf.setDrawColor(211, 220, 232);
        pdf.roundedRect(x, y, cardWidth, totalsHeight, 2, 2, 'FD');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(...(dark ? [200, 210, 225] as [number, number, number] : blue));
        pdf.text(`TOTAL ${label.toLocaleUpperCase('pt-BR')}`, x + 5, y + 7);
        pdf.setFontSize(13);
        pdf.setTextColor(...(dark ? [255, 255, 255] as [number, number, number] : navy));
        pdf.text(money(amount), x + 5, y + 16);
      };
      let totalIndex = 0;
      if (hasRecurring) drawTotal(totalIndex++, 'recorrente', recurringTotal, true);
      if (hasOneTime) drawTotal(totalIndex, 'pontual', oneTimeTotal, !hasRecurring);
      y += totalsHeight + 10;

      const footerY = Math.max(y, 264);
      if (footerY + 21 > 289) newPage();
      const finalFooterY = Math.min(Math.max(y, 264), 268);
      pdf.setDrawColor(217, 224, 232);
      pdf.line(left, finalFooterY, pageWidth - right, finalFooterY);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(...navy);
      pdf.text('VG Consultoria em Marketing', left, finalFooterY + 6);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(...blue);
      const rowY = finalFooterY + 13;
      // Small vector marks keep the footer self-contained in the PDF.
      pdf.setDrawColor(...blue);
      pdf.circle(left + 1.5, rowY - 1, 1.5, 'S');
      pdf.line(left, rowY - 1, left + 3, rowY - 1);
      pdf.line(left + 1.5, rowY - 2.5, left + 1.5, rowY + 0.5);
      pdf.text('https://vgconsultoriamkt.com.br/', left + 5, rowY);
      const socialX = left + 68;
      pdf.roundedRect(socialX, rowY - 3, 4, 4, 1, 1, 'S');
      pdf.circle(socialX + 2, rowY - 1, 0.8, 'S');
      pdf.circle(socialX + 3.1, rowY - 2.2, 0.25, 'F');
      pdf.text('@vgconsultoriamkt', socialX + 7, rowY);
      const linkedX = left + 119;
      pdf.rect(linkedX, rowY - 3, 4, 4, 'S');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.text('in', linkedX + 0.55, rowY - 0.2);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.text('VG Consultoria em Marketing', linkedX + 7, rowY);
      pdf.save(`proposta-${lead.name.trim().toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-')}.pdf`);
      setOpen(false);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'Não foi possível gerar o PDF. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  return <>
    <button type="button" onClick={() => setOpen(true)} data-testid="button-open-proposal" className="fixed bottom-5 right-5 z-40 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#9fe4e5] px-5 text-sm font-extrabold text-[#202f4d] shadow-[0_12px_32px_rgba(20,39,67,.22)] transition-colors hover:bg-[#b8d9da] sm:bottom-8 sm:right-8">
      <FileText className="h-4 w-4" aria-hidden="true" /> Gerar proposta em PDF
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
