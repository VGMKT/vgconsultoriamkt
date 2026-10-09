import { jsPDF } from 'jspdf';

type ProposalLead = {
  id: number;
  name: string;
  company: string | null;
  email: string;
  whatsapp: string;
};

type ProposalService = {
  id: number;
  name: string;
  description: string;
  price: number | null;
  billingType: 'recurring' | 'one_time' | null;
};

type GenerateProposalMessage = {
  type: 'generate';
  lead: ProposalLead;
  services: ProposalService[];
  scopes: Record<number, string>;
  logoData: string;
};

type WorkerScope = {
  onmessage: ((event: MessageEvent<GenerateProposalMessage>) => void) | null;
  postMessage: (message: unknown) => void;
};

const worker = self as unknown as WorkerScope;
const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const billingLabel = (value: ProposalService['billingType']) =>
  value === 'recurring' ? 'Recorrente' : 'Pontual';

worker.onmessage = (event: MessageEvent<GenerateProposalMessage>) => {
  if (event.data.type !== 'generate') return;

  const { lead, services, scopes, logoData } = event.data;

  try {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210;
    const left = 17;
    const right = 17;
    const width = pageWidth - left - right;
    let y = 16;
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
      y = 16;
      header();
      y = 42;
    };
    const ensure = (height: number) => {
      if (y + height > 266) newPage();
    };
    const drawWrapped = (
      text: string,
      x: number,
      maxWidth: number,
      size: number,
      color: [number, number, number],
      lineHeight = 4.2,
    ) => {
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
      pdf.text(
        billingLabel(service.billingType),
        pageWidth - right,
        y - titleLines.length * 5 + 1,
        { align: 'right' },
      );
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(...navy);
      pdf.text(money(service.price as number), pageWidth - right, y - titleLines.length * 5 + 6, {
        align: 'right',
      });

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

    const recurringTotal = services
      .filter((service) => service.billingType === 'recurring')
      .reduce((sum, service) => sum + (service.price ?? 0), 0);
    const oneTimeTotal = services
      .filter((service) => service.billingType === 'one_time')
      .reduce((sum, service) => sum + (service.price ?? 0), 0);
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

    const filename = `proposta-${lead.name.trim().toLocaleLowerCase('pt-BR').replace(/[^a-z0-9]+/g, '-')}.pdf`;
    worker.postMessage({ type: 'generated', blob: pdf.output('blob'), filename });
  } catch (error) {
    worker.postMessage({
      type: 'error',
      message: error instanceof Error ? error.message : 'Não foi possível gerar o PDF.',
    });
  }
};
