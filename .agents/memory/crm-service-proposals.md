---
name: CRM service proposals
description: User-defined service catalog and proposal behavior for the VG CRM.
---

The user's seven service names and catalog descriptions are:

1. **Tráfego pago como consultoria** — Gestão de campanhas com visão estratégica da aquisição, analisando o caminho entre anúncios, geração de leads e vendas para identificar oportunidades de melhoria.
2. **Consultoria de Marketing** — Organização da estratégia, equipe, conteúdo e mídia, considerando o momento, os recursos e as metas da empresa para estruturar um marketing com direção e consistência.
3. **Internalização de Marketing** — Estruturação de uma operação própria de marketing, com equipe, processos e rotinas que aumentam a autonomia da empresa e reduzem a dependência de terceiros.
4. **Manager as a Service** — Liderança estratégica do marketing como extensão do negócio, conectando estratégia, equipe, parceiros e resultados.
5. **Branding e presença de marca** — Fortalecimento do posicionamento e da percepção da marca, construindo uma presença coerente para que a empresa seja reconhecida, lembrada e escolhida.
6. **Sites e Landing Pages** — Criação de presença digital que facilita a descoberta da empresa, comunica sua oferta com clareza e conduz o visitante à próxima etapa de contato ou conversão.
7. **Conteúdo para redes sociais** — Planejamento estratégico e produção de conteúdo para atrair atenção, reforçar a marca, gerar autoridade e comunicar com objetivos definidos.

The CRM catalog stores each service's name, description, and scope as separate fields. Seed the seven services above with their supplied descriptions; leave scope, base price, and billing type unset unless the user provides them. The owner/admin must be able to add, edit, and remove catalog entries. Removal should be logical so old lead/proposal records can retain their service history.

In the CRM, the Services catalog should sit beside Team access. A Lead stores the client/company details and linked service names; do not show the long catalog descriptions in the Lead. When a catalog service is linked to a lead, snapshot its current name, base price, and billing type so later catalog edits do not silently change existing lead terms. A lead/proposal may override its own price without changing the catalog price. Removing a link should preserve its history. The Lead's status alone determines whether the deal is closed; there is no separate contract-status requirement.

Generating a proposal from the Lead should produce a branded PDF containing company and client data. Each selected service includes its catalog description, price, billing type, and a free-text scope/observation entered for that proposal (for example, hours, number of posts/videos, or website type). Billing type is **recurring** or **one-time/pontual**. The user explicitly does not want a payment-method field such as Pix or boleto.

Proposals must use the system-generated issue date and state a **30-day validity**. Do not show an “A/C” recipient field because the CRM does not provide that data. In the footer, show the website URL with a globe icon; follow the Instagram icon with **@vgconsultoriamkt** and the LinkedIn icon with **VG Consultoria em Marketing**, without printing the platform names. Scope text should expand naturally and continue onto additional A4 pages rather than being clipped or forced into a fixed-height page. Total cards show only billing type and amount, without service names. If only one billing type is present, show only that total in a full-width card; show both recurring and one-time totals when both are present.

**Why:** The user wants a maintainable service catalog with concise Lead records while proposals carry the service detail and client-specific scope needed to define an offer. Per-lead snapshots keep existing client terms stable as the catalog changes; they also specified system-generated issue dates, no unsupported recipient field, context-sensitive totals without repeated service names, 30-day validity, automatic pagination, and social account identifiers without platform labels.

**How to apply:** Keep catalog name, description, and scope separate; copy the current name, price, and billing type into each lead-service link and preserve that snapshot when the catalog changes. Do not invent defaults for unset prices, billing types, or scopes. Show only the service name in Lead summaries, show descriptions in proposal output, keep scope notes per service line, allow per-proposal price edits, distinguish recurring from one-time charges without adding a payment-method field, set the issue date automatically, omit the unsupported “A/C” field, show only the total types that occur without listing the included services below them, show the 30-day validity, display a globe with the site and social icons followed only by their VG account identifiers, let long text flow across A4 pages, and do not include test, demo, or fictitious-data notices in the proposal header.
