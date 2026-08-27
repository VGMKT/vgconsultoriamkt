import { useState, type FormEvent } from 'react';
import { ArrowDownRight, ArrowRight, Check, ChevronDown, Crosshair, MoveUpRight, Search, SlidersHorizontal, Target } from 'lucide-react';
import './_group.css';

const pillars = [
  { number: '01', title: 'Encontrabilidade', text: 'A presença começa antes do clique. Organizamos SEO técnico, conteúdo, busca local e arquitetura da informação para sua empresa aparecer nas perguntas certas.', icon: Search, tone: 'bg-[#dce7f0]' },
  { number: '02', title: 'Clareza', text: 'Quem chega precisa entender rapidamente o que você faz, para quem e por que escolher você. A proposta ganha hierarquia, contexto e linguagem.', icon: Crosshair, tone: 'bg-[#d7bd91]' },
  { number: '03', title: 'Conversão', text: 'Cada página conduz uma próxima ação possível. Formulário, WhatsApp, ligação ou pedido de orçamento, com menos fricção e mais intenção.', icon: Target, tone: 'bg-[#c88982]' },
  { number: '04', title: 'Aprendizado', text: 'Mensuramos o que acontece depois da visita e conectamos site, mídia e CRM para que a operação aprenda com os sinais do mercado.', icon: SlidersHorizontal, tone: 'bg-[#9fd6d7]' },
];

const process = [
  ['01', 'Ler o momento', 'Entendemos a oferta, o público, o ciclo de venda e a capacidade atual de atendimento. Um site precisa caber no negócio que vai sustentá-lo.'],
  ['02', 'Organizar a história', 'Definimos a arquitetura, as mensagens, as páginas prioritárias e os caminhos de navegação. Conteúdo antes de decoração.'],
  ['03', 'Construir para descobrir', 'Aplicamos boas práticas técnicas, SEO, busca local e uma experiência responsiva que funciona em cada tela e contexto.'],
  ['04', 'Colocar em movimento', 'Publicamos, conectamos mídia e CRM, acompanhamos os eventos e ajustamos a presença com base no comportamento real.'],
];

const findabilityPoints = [
  ['01', 'Busca ativa', 'Um site otimizado ajuda sua empresa a aparecer quando alguém pesquisa por uma solução, uma categoria ou um serviço na sua região.'],
  ['02', 'Ativo próprio', 'Redes sociais são terreno alugado. O site é uma presença que você controla, mesmo quando o algoritmo muda.'],
  ['03', 'Validação', 'Em negócios B2B, quem está prestes a contratar pesquisa. Portfólio, cases e clareza reforçam a credibilidade antes da conversa.'],
  ['04', 'Disponível sempre', 'O site apresenta seu trabalho, seus contatos e seus próximos passos 24 horas por dia, sem depender de alguém estar online.'],
];
const findabilityTones = ['bg-[#dce7f0]', 'bg-[#d7bd91]', 'bg-[#c88982]', 'bg-[#9fd6d7]'];

const faqItems = [
  ['Qual é a diferença entre um site institucional e uma landing page?', 'O site institucional organiza a presença completa da empresa, com páginas como serviços, sobre, cases e contato. A landing page é uma página mais objetiva, criada para uma oferta, campanha ou ação específica.'],
  ['Quanto custa criar um site?', 'O investimento depende do tipo de presença, do número de páginas, do conteúdo, das integrações e do nível de estratégia necessário. Primeiro entendemos o objetivo para propor uma estrutura que faça sentido para o negócio.'],
  ['Quanto tempo leva para criar um site?', 'O prazo varia conforme o escopo, a quantidade de conteúdo e a velocidade das aprovações. Uma landing page costuma ter uma jornada mais enxuta; um site institucional exige mais etapas de arquitetura, conteúdo e publicação.'],
  ['Um site novo vai aparecer no Google?', 'Criamos a base para a encontrabilidade com estrutura técnica, arquitetura de informação, conteúdo e sinais locais. Nenhum projeto sério promete uma posição específica, porque os resultados dependem também do mercado e da evolução contínua.'],
];

const objectiveOptions = [
  ['sell_more_online', 'Quero vender mais pela internet'],
  ['build_marketing_team', 'Quero estruturar minha própria equipe de marketing'],
  ['train_current_team', 'Quero treinar e capacitar meu time atual'],
  ['managed_marketing', 'Quero um marketing gerenciado pela VG'],
  ['strengthen_brand', 'Quero fortalecer minha marca e presença'],
  ['sites_landing_pages', 'Quero criar meu site ou landing page'],
];

const budgetOptions = [
  ['not_investing', 'Ainda não investe'],
  ['up_to_3000', 'Até R$ 3.000'],
  ['3000_to_10000', 'R$ 3.000 a R$ 10.000'],
  ['10000_to_30000', 'R$ 10.000 a R$ 30.000'],
  ['above_30000', 'Acima de R$ 30.000'],
];

function ContactCard() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  if (sent) return <div className="flex min-h-[430px] flex-col justify-center rounded-[1.5rem] bg-[#263758] p-8 text-white sm:p-10"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#9fe4e5] text-[#202f4d]"><Check className="h-7 w-7"/></div><p className="mono mt-7 text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">Mensagem recebida</p><h3 className="mt-3 text-3xl font-semibold">Vamos olhar para o seu próximo passo.</h3><p className="mt-4 max-w-md text-sm leading-7 text-slate-300">Recebemos seus dados. Em breve a equipe da VG entra em contato para entender o momento da sua presença digital.</p><button type="button" onClick={() => setSent(false)} className="mt-8 flex w-fit items-center gap-2 text-sm font-bold text-[#9fe4e5]">Enviar outra mensagem <ArrowRight className="h-4 w-4"/></button></div>;
  return <form onSubmit={submit} className="rounded-[1.5rem] bg-[#263758] p-6 text-white shadow-2xl sm:p-9">
    <input type="hidden" name="service" value="sites-landing-pages" />
    <p className="mono text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">Primeiro passo</p>
    <h3 className="mt-3 text-3xl font-semibold tracking-tight">Seu próximo passo começa com uma boa <span className="text-[#9fe4e5]">pergunta.</span></h3>
    <p className="mt-4 text-sm leading-6 text-slate-300">Conte um pouco sobre a empresa e o papel que o site precisa cumprir agora.</p>
    <div className="mt-7 grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-semibold text-slate-300">Seu nome *
        <input required name="name" autoComplete="name" className="site-field mt-2" placeholder="Como podemos chamar você?" />
      </label>
      <label className="text-xs font-semibold text-slate-300">Seu melhor e-mail *
        <input required name="email" autoComplete="email" type="email" className="site-field mt-2" placeholder="voce@empresa.com.br" />
      </label>
      <label className="text-xs font-semibold text-slate-300">WhatsApp *
        <input required name="whatsapp" autoComplete="tel" inputMode="numeric" className="site-field mt-2" placeholder="(00) 00000-0000" />
      </label>
      <label className="text-xs font-semibold text-slate-300">Empresa *
        <input required name="organization" autoComplete="organization" className="site-field mt-2" placeholder="Nome da empresa" />
      </label>
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-semibold text-slate-300">O que você busca agora?
        <select name="objective" className="site-field mt-2" defaultValue="">
          <option value="" disabled>Selecione uma opção</option>
          {objectiveOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="text-xs font-semibold text-slate-300">Investimento mensal em marketing
        <select name="marketing_budget" className="site-field mt-2" defaultValue="">
          <option value="" disabled>Selecione uma faixa</option>
          {budgetOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
    </div>
    <label className="mt-4 block text-xs font-semibold text-slate-300">Um pouco sobre o desafio
      <textarea name="message" autoComplete="off" className="site-field mt-2 resize-none" rows={3} placeholder="O que precisa mudar nos próximos meses? Se a solicitação for sobre site ou landing page, conte o motivo." />
    </label>
    <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#9fe4e5] px-5 py-3.5 text-sm font-extrabold text-[#202f4d]">Quero estruturar minha presença digital <ArrowRight className="h-4 w-4"/></button>
    <p className="mt-4 text-center text-[10px] text-slate-500">Seus dados ficam entre nós. A conversa inicial não obriga contratação.</p>
  </form>;
}

function LegacyContactCard() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true); };
  if (sent) return <div className="flex min-h-[430px] flex-col justify-center rounded-[1.5rem] bg-[#263758] p-8 text-white sm:p-10"><div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#9fe4e5] text-[#202f4d]"><Check className="h-7 w-7"/></div><p className="mono mt-7 text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">Mensagem recebida</p><h3 className="mt-3 text-3xl font-semibold">Vamos olhar para o seu próximo passo.</h3><p className="mt-4 max-w-md text-sm leading-7 text-slate-300">Recebemos seus dados. Em breve a equipe da VG entra em contato para entender o momento da sua presença digital.</p><button type="button" onClick={() => setSent(false)} className="mt-8 flex w-fit items-center gap-2 text-sm font-bold text-[#9fe4e5]">Enviar outra mensagem <ArrowRight className="h-4 w-4"/></button></div>;
  return <form onSubmit={submit} className="rounded-[1.5rem] bg-[#263758] p-6 text-white shadow-2xl sm:p-9"><p className="mono text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">Primeiro passo</p><h3 className="mt-3 text-3xl font-semibold tracking-tight">Seu próximo passo começa com uma boa <span className="text-[#9fe4e5]">pergunta.</span></h3><p className="mt-4 text-sm leading-6 text-slate-300">Conte um pouco sobre a empresa e o papel que o site precisa cumprir agora.</p><div className="mt-7 grid gap-4 sm:grid-cols-2"><label className="text-xs font-semibold text-slate-300">Seu nome *<input required className="site-field mt-2" placeholder="Como podemos chamar você?" /></label><label className="text-xs font-semibold text-slate-300">Seu melhor e-mail *<input required type="email" className="site-field mt-2" placeholder="voce@empresa.com.br" /></label><label className="text-xs font-semibold text-slate-300">WhatsApp *<input required className="site-field mt-2" placeholder="(00) 00000-0000" /></label><label className="text-xs font-semibold text-slate-300">Empresa *<input required className="site-field mt-2" placeholder="Nome da empresa" /></label></div><label className="mt-4 block text-xs font-semibold text-slate-300">O que você precisa agora?<select className="site-field mt-2" defaultValue=""><option value="" disabled>Selecione uma opção</option><option>Um novo site institucional</option><option>Uma landing page para campanha</option><option>Revisar o site atual</option><option>Estruturar presença e mensuração</option></select></label><label className="mt-4 block text-xs font-semibold text-slate-300">Fale brevemente sobre o desafio<textarea className="site-field mt-2 resize-none" rows={3} placeholder="O que precisa mudar nos próximos meses?" /></label><button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#9fe4e5] px-5 py-3.5 text-sm font-extrabold text-[#202f4d]">Quero estruturar minha presença digital <ArrowRight className="h-4 w-4"/></button><p className="mt-4 text-center text-[10px] text-slate-500">Seus dados ficam entre nós. A conversa inicial não obriga contratação.</p></form>;
}

export function SitesLandingPages() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return <main className="sites-landing-pages min-h-screen overflow-hidden">
    <section className="relative bg-[#202f4d] text-white">
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'linear-gradient(#9fe4e522 1px,transparent 1px),linear-gradient(90deg,#9fe4e522 1px,transparent 1px)', backgroundSize: '42px 42px' }} />
      <div className="absolute -right-40 top-20 h-[600px] w-[600px] rounded-full border border-[#9fe4e5]/15" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-10"><div className="flex items-center gap-3"><img src="/__mockup/images/home-redesign/logo-original.png" alt="VG Consultoria em Marketing" className="h-11 w-11 rounded-xl object-cover" /><span className="hidden text-[10px] font-extrabold uppercase leading-[1.15] tracking-[.16em] sm:block">VG CONSULTORIA<br />EM MARKETING</span></div><nav className="hidden items-center gap-7 text-xs font-bold text-slate-300 md:flex"><button onClick={() => document.getElementById('pilares')?.scrollIntoView()} className="hover:text-[#9fe4e5]">O que construímos</button><button onClick={() => document.getElementById('processo')?.scrollIntoView()} className="hover:text-[#9fe4e5]">Como atuamos</button><button onClick={() => document.getElementById('contato-sites')?.scrollIntoView()} className="rounded-full bg-[#9fe4e5] px-4 py-2.5 text-[#202f4d]">Vamos conversar</button></nav><button onClick={() => document.getElementById('contato-sites')?.scrollIntoView()} className="rounded-full border border-[#9fe4e5]/50 px-3 py-2 text-[11px] font-bold text-[#9fe4e5] md:hidden">Contato</button></header>
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-24 pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-32 lg:pt-24"><div className="site-reveal"><p className="mono flex items-center gap-3 text-[10px] uppercase tracking-[.22em] text-[#b8d9da]"><span className="h-2 w-2 rounded-full bg-[#b8d9da]" />Sites &amp; Landing Pages / presença digital</p><h1 className="mt-8 max-w-4xl text-6xl font-semibold leading-[.9] tracking-[-.06em] sm:text-8xl lg:text-[7.6rem]">Seu site precisa ser <span className="text-[#9fe4e5]">encontrado</span> antes de ser admirado.</h1><p className="mt-9 max-w-xl text-base leading-8 text-slate-300">Criamos sites e landing pages que organizam a história da sua empresa, facilitam a descoberta e transformam intenção em conversa.</p><button onClick={() => document.getElementById('pilares')?.scrollIntoView()} className="mt-8 flex items-center gap-2 text-sm font-extrabold text-[#9fe4e5]">Ver o que uma presença precisa fazer <ArrowDownRight className="h-4 w-4" /></button></div><div className="site-reveal site-delay-2 relative min-h-[380px]"><div className="absolute right-0 top-0 w-full max-w-[490px] rotate-3 rounded-2xl border border-white/15 bg-[#2d4264] p-4 shadow-2xl"><div className="flex items-center gap-2 border-b border-white/10 pb-3"><span className="h-2 w-2 rounded-full bg-[#c88982]" /><span className="h-2 w-2 rounded-full bg-[#e6c98e]" /><span className="h-2 w-2 rounded-full bg-[#9fe4e5]" /><span className="mono ml-auto text-[8px] text-slate-400">presenca.digital</span></div><div className="grid gap-4 p-5"><div className="h-3 w-2/5 rounded bg-[#9fe4e5]/70" /><div className="h-14 w-4/5 rounded bg-white/90" /><div className="h-2 w-full rounded bg-white/15" /><div className="h-2 w-3/4 rounded bg-white/15" /><div className="mt-4 flex gap-3"><div className="h-9 w-28 rounded bg-[#c88982]" /><div className="h-9 w-24 rounded border border-white/20" /></div></div></div><div className="absolute bottom-3 left-2 z-10 w-[72%] rounded-xl bg-[#9fe4e5] p-5 text-[#202f4d] shadow-xl"><div className="flex items-center justify-between"><span className="mono text-[9px] uppercase tracking-[.16em]">Próxima ação</span><MoveUpRight className="h-4 w-4" /></div><p className="mt-4 text-2xl font-semibold leading-none">Entender se faz sentido para mim.</p><div className="mt-5 h-1.5 w-full rounded-full bg-[#202f4d]/15"><div className="h-full w-[68%] rounded-full bg-[#202f4d]" /></div></div></div></div>
    </section>
     <section className="border-b border-[#d9e0e9] bg-[#f5f7fa] px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.58fr_1.42fr]"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ uma entrega própria</p></div><div><h2 className="max-w-4xl text-4xl font-semibold leading-[1.03] tracking-[-.04em] sm:text-6xl">Branding ajuda a marca a ocupar um lugar. O site ajuda as pessoas a <span className="text-[#58739f]">chegarem até ele.</span></h2><p className="mt-8 max-w-3xl text-base leading-8 text-[#62728a]">A presença digital precisa respeitar o momento e a operação do negócio. Às vezes é uma landing page objetiva para validar uma oferta. Às vezes é uma arquitetura completa para organizar portfólio, autoridade e aquisição. O ponto não é ter mais uma URL. É criar um ponto de encontro que faça sentido.</p></div></div></section>
      <section id="pilares" className="bg-[#e6edf4] px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ encontrabilidade</p><h2 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-.04em] sm:text-6xl">Ser encontrado também é uma forma de <span className="text-[#58739f]">ser lembrado.</span></h2></div><p className="max-w-xs text-sm leading-6 text-[#62728a]">Um site pode capturar uma busca, validar sua empresa e trabalhar enquanto o time está em outra conversa.</p></div><div className="mt-14 grid gap-4 md:grid-cols-2">{findabilityPoints.map(([number, title, text], index) => <article key={number} className={`site-card relative min-h-[235px] overflow-hidden rounded-[1.35rem] p-7 ${findabilityTones[index]}`}><div className="relative z-10 flex items-start justify-between"><span className="mono text-[10px] tracking-[.15em] opacity-60">{number} / encontrabilidade</span><Search className="h-5 w-5 opacity-70" /></div><div className="relative z-10 mt-12 max-w-lg"><h3 className="text-2xl font-semibold tracking-[-.03em] text-[#202f4d]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#56657d]">{text}</p></div><div className="absolute -bottom-20 -right-14 h-48 w-48 rounded-full border border-[#202f4d]/10" /></article>)}</div></div></section>
    <section id="processo" className="bg-[#202f4d] px-5 py-20 text-white lg:px-10 lg:py-28"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.72fr_1.28fr]"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ como atuamos</p><h2 className="mt-5 text-4xl font-semibold leading-[1.02] sm:text-6xl">Estratégia que chega até a tela, ao <span className="text-[#9fe4e5]">dado e à venda.</span></h2><p className="mt-7 max-w-md text-sm leading-7 text-slate-300">Não começamos escolhendo plataforma. Começamos entendendo qual papel a presença digital precisa cumprir e quais recursos a empresa consegue sustentar.</p></div><div className="divide-y divide-white/15">{process.map(([number, title, text]) => <div key={number} className="grid gap-5 py-7 sm:grid-cols-[70px_190px_1fr]"><span className="mono text-[10px] text-[#9fe4e5]">{number}</span><h3 className="text-2xl font-semibold">{title}</h3><p className="text-sm leading-7 text-slate-300">{text}</p></div>)}</div></div></section>
    <section id="contato-sites" className="bg-[#f5f7fa] px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.78fr_1.22fr]"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ vamos conversar</p><h2 className="mt-5 text-5xl font-semibold leading-[.98] tracking-[-.05em] sm:text-7xl">O site é parte do seu <span className="text-[#58739f]">movimento.</span></h2><p className="mt-7 max-w-md text-sm leading-7 text-[#62728a]">Se a sua presença digital precisa ser mais clara, mais encontrável ou mais próxima da operação comercial, vamos entender o cenário.</p><div className="mt-10 border-l-2 border-[#9fe4e5] pl-5 text-sm font-bold leading-6">Não entregamos uma vitrine isolada. Entregamos um ponto de encontro entre marca, busca, conteúdo, mídia e vendas.</div></div><ContactCard /></div></section>
    <section id="perguntas-frequentes" className="bg-[#f5f7fa] px-5 py-20 lg:px-10 lg:py-28"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.72fr_1.28fr]"><div><p className="mono text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ dúvidas sobre encontrabilidade</p><h2 className="mt-5 max-w-md text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Marketing com clareza para empresas em <span className="text-[#58739f]">Fortaleza e no Brasil.</span></h2><p className="mt-7 max-w-md text-base leading-8 text-[#56657d]">A VG combina estratégia, execução e acompanhamento para construir uma presença digital que faça sentido para o momento e a capacidade do seu negócio.</p></div><div className="border-t border-[#b8c6d7]">{faqItems.map(([question, answer], index) => { const isOpen = openFaq === index; return <div key={question} className="border-b border-[#d9e0e9]"><button type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : index)} className="group flex w-full items-center gap-5 py-6 text-left"><span className="mono text-[10px] text-[#9caac0]">0{index + 1}</span><span className="flex-1 text-xl font-semibold tracking-[-.02em] text-[#202f4d] transition-colors group-hover:text-[#58739f] sm:text-2xl">{question}</span><ChevronDown className={`h-4 w-4 shrink-0 text-[#9caac0] transition-transform ${isOpen ? 'rotate-180 text-[#58739f]' : 'group-hover:text-[#58739f]'}`} /></button>{isOpen && <p className="pb-6 pl-10 pr-7 text-sm leading-7 text-[#56657d] sm:pl-16">{answer}</p>}</div>; })}</div></div></section>
    <footer className="bg-[#17233e] px-5 py-12 text-slate-300 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><img src="/__mockup/images/home-redesign/logo-original.png" alt="VG Consultoria em Marketing" className="h-10 w-10 rounded-xl object-cover" /><p className="text-xs leading-5">Clareza para decidir.<br />Estrutura para executar.</p></div><div className="flex flex-col gap-2 text-right"><p className="mono text-[10px] uppercase tracking-[.14em] text-slate-500">Sites &amp; Landing Pages</p><p className="mono text-[10px] uppercase tracking-[.14em] text-slate-500">Fortaleza · Brasil</p></div></div></footer>
  </main>;
}