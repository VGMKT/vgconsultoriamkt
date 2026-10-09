import { Globe, Instagram, Linkedin } from "lucide-react";

type ProposalPdfProps = {
  variant?: "mixed" | "single-recurring";
};

export function ProposalPdf({ variant = "mixed" }: ProposalPdfProps) {
  const generatedDate = new Intl.DateTimeFormat("pt-BR").format(new Date());
  const isSingleRecurring = variant === "single-recurring";

  return (
    <main
      className="proposal-shell min-h-[100dvh] w-full px-4 py-8 sm:px-8"
      style={{ background: "#F1F3F6", color: "#263248", fontFamily: "Manrope, sans-serif" }}
    >
      <style>{`
        @page {
          size: A4 portrait;
          margin: 12mm 14mm;
        }
        @media print {
          html, body, #root {
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body * {
            visibility: hidden;
          }
          .proposal-sheet, .proposal-sheet * {
            visibility: visible;
          }
          .proposal-shell {
            display: block !important;
            width: 100% !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          .proposal-sheet {
            display: block !important;
            position: relative !important;
            inset: auto !important;
            width: auto !important;
            max-width: none !important;
            height: auto !important;
            min-height: 273mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          .proposal-content {
            display: block !important;
            padding: 0 !important;
          }
          .proposal-header,
          .proposal-client,
          .proposal-section-title,
          .proposal-service,
          .proposal-totals,
          .proposal-footer {
            break-inside: avoid-page;
            page-break-inside: avoid;
          }
          .proposal-service-list {
            overflow: visible !important;
          }
          .proposal-services-title {
            break-after: avoid-page;
            page-break-after: avoid;
          }
          .proposal-footer {
            margin-top: 12mm !important;
          }
          .proposal-sheet a {
            color: inherit !important;
            text-decoration: none !important;
          }
        }
      `}</style>

      <article
        className="proposal-sheet relative mx-auto flex min-h-[1123px] w-full max-w-[794px] flex-col overflow-visible bg-white shadow-[0_24px_80px_rgba(38,50,72,0.12)]"
        style={{ minHeight: "1123px" }}
      >
        <div className="h-[8px] w-full" style={{ background: "#5D78A9" }} />
        <div className="proposal-content flex flex-1 flex-col px-8 pb-7 pt-7 sm:px-[58px] sm:pb-[38px] sm:pt-[43px]">
          <header className="proposal-header flex items-center justify-between gap-5 border-b pb-6" style={{ borderColor: "#D9E0E8" }}>
            <div className="flex items-center gap-3">
              <img
                src="/__mockup/images/logo-vg-marketing.png"
                alt="Logo oficial da VG"
                className="h-[58px] w-[58px] shrink-0 object-contain"
              />
              <div>
                <p className="text-[14px] font-extrabold leading-tight tracking-[-0.02em] sm:text-[16px]">
                  VG Consultoria em Marketing
                </p>
              </div>
            </div>
            <div className="pt-1 text-right">
              <p className="text-[10px] font-semibold" style={{ color: "#66758A" }}>
                Emissão: {generatedDate}
              </p>
              <p className="mt-1 text-[10px] font-semibold" style={{ color: "#66758A" }}>
                Validade: 30 dias
              </p>
            </div>
          </header>

          <section className="proposal-section-title pb-5 pt-6">
            <h1 className="text-[25px] font-bold leading-tight tracking-[-0.035em] sm:text-[29px]">
              Proposta comercial
            </h1>
          </section>

          <section
            className="proposal-client mb-6 grid grid-cols-1 gap-4 rounded-md border px-4 py-4 sm:px-5"
            style={{ background: "#F5F7FA", borderColor: "#D9E0E8" }}
          >
            <div>
              <p className="mb-2 text-[8px] font-extrabold uppercase tracking-[0.16em]" style={{ color: "#708091" }}>
                Cliente
              </p>
              <p className="text-[14px] font-extrabold tracking-[-0.025em]">Empresa Demonstração Ltda.</p>
            </div>
          </section>

          <section className="mb-5">
            <div className="proposal-services-title mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-[17px] font-bold tracking-[-0.025em]">Serviços e valores</h2>
              </div>
            </div>

            <div className="proposal-service-list rounded-md border" style={{ borderColor: "#D9E0E8" }}>
              <div className="proposal-service grid grid-cols-[1fr_auto] gap-4 px-4 py-4 sm:px-5">
                <div>
                  <div className="mb-2">
                    <h3 className="text-[13px] font-bold tracking-[-0.015em]">Tráfego pago como consultoria</h3>
                  </div>
                  <p className="max-w-[425px] text-[9px] leading-[1.65]" style={{ color: "#5E6E80" }}>
                    Gestão de campanhas com visão estratégica da aquisição, analisando o caminho entre anúncios, geração de leads e vendas para identificar oportunidades de melhoria.
                  </p>
                  <div className="mt-3 border-l-2 pl-3" style={{ borderColor: "#5D78A9" }}>
                    <p className="mb-1 text-[8px] font-extrabold uppercase tracking-[0.11em]" style={{ color: "#708091" }}>
                      Escopo
                    </p>
                    <p className="text-[9px] leading-[1.6]" style={{ color: "#344960" }}>
                      10 horas de consultoria por mês;<br />
                      análise de campanhas, leads e vendas.
                    </p>
                  </div>
                </div>
                <div className="min-w-[116px] pt-1 text-right">
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.1em]" style={{ color: "#7D8997" }}>
                    Recorrente
                  </p>
                  <p className="mt-2 whitespace-nowrap text-[16px] font-extrabold tracking-[-0.045em]">R$ 2.800,00</p>
                </div>
              </div>

              {!isSingleRecurring && (
                <>
                  <div className="h-px w-full" style={{ background: "#E1E5EB" }} />
                  <div className="proposal-service grid grid-cols-[1fr_auto] gap-4 px-4 py-4 sm:px-5">
                    <div>
                      <div className="mb-2">
                        <h3 className="text-[13px] font-bold tracking-[-0.015em]">Sites e Landing Pages</h3>
                      </div>
                      <p className="max-w-[425px] text-[9px] leading-[1.65]" style={{ color: "#5E6E80" }}>
                        Criação de presença digital que facilita a descoberta da empresa, comunica sua oferta com clareza e conduz o visitante à próxima etapa de contato ou conversão.
                      </p>
                      <div className="mt-3 border-l-2 pl-3" style={{ borderColor: "#5D78A9" }}>
                        <p className="mb-1 text-[8px] font-extrabold uppercase tracking-[0.11em]" style={{ color: "#708091" }}>
                          Escopo
                        </p>
                        <p className="text-[9px] leading-[1.6]" style={{ color: "#344960" }}>
                          Site institucional de até 5 páginas, com formulário de contato e versão para celular.
                        </p>
                      </div>
                    </div>
                    <div className="min-w-[116px] pt-1 text-right">
                      <p className="text-[8px] font-extrabold uppercase tracking-[0.1em]" style={{ color: "#7D8997" }}>
                        Pontual
                      </p>
                      <p className="mt-2 whitespace-nowrap text-[16px] font-extrabold tracking-[-0.045em]">R$ 6.500,00</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className={`proposal-totals mb-6 grid ${isSingleRecurring ? "grid-cols-1" : "grid-cols-2"} gap-3`}>
            <div className="rounded-md px-4 py-3.5" style={{ background: "#263248", color: "#FFFFFF" }}>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "#C8D2E1" }}>
                Total recorrente
              </p>
              <div className="mt-1 flex items-baseline justify-between gap-2">
                <p className="text-[19px] font-extrabold tracking-[-0.045em]">R$ 2.800,00</p>
              </div>
            </div>
            {!isSingleRecurring && (
              <div className="rounded-md border px-4 py-3.5" style={{ background: "#E9EEF5", borderColor: "#D3DCE8" }}>
                <p className="text-[8px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "#526B95" }}>
                  Total pontual
                </p>
                <div className="mt-1 flex items-baseline justify-between gap-2">
                  <p className="text-[19px] font-extrabold tracking-[-0.045em]">R$ 6.500,00</p>
                </div>
              </div>
            )}
          </section>

          <footer className="proposal-footer mt-auto border-t pt-4" style={{ borderColor: "#D9E0E8" }}>
            <div className="mb-3">
              <p className="text-[9px] font-extrabold">VG Consultoria em Marketing</p>
            </div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-1 text-[8px] sm:grid-cols-3">
              <a
                href="https://vgconsultoriamkt.com.br/"
                aria-label="Site da VG"
                className="inline-flex items-center gap-2 font-semibold underline-offset-2 hover:underline"
                style={{ color: "#526B95" }}
              >
                <Globe className="h-4 w-4 shrink-0" aria-hidden="true" />
                vgconsultoriamkt.com.br
              </a>
              <a
                href="https://www.instagram.com/vgconsultoriamkt/"
                aria-label="Instagram da VG"
                title="Instagram da VG"
                className="inline-flex h-7 items-center gap-2 px-1 font-semibold"
                style={{ color: "#526B95" }}
              >
                <Instagram className="h-[18px] w-[18px]" aria-hidden="true" />
                <span>@vgconsultoriamkt</span>
              </a>
              <a
                href="https://www.linkedin.com/company/vg-consultoria-em-marketing/"
                aria-label="LinkedIn da VG"
                title="LinkedIn da VG"
                className="inline-flex h-7 items-center gap-2 px-1 font-semibold"
                style={{ color: "#526B95" }}
              >
                <Linkedin className="h-[18px] w-[18px]" aria-hidden="true" />
                <span>VG Consultoria em Marketing</span>
              </a>
            </div>
          </footer>
        </div>
      </article>
    </main>
  );
}

export default ProposalPdf;
