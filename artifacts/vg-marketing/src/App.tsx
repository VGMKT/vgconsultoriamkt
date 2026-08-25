import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, BarChart3, Check, ChevronDown, CircleCheck, Compass, Crosshair, Instagram, Linkedin, Menu, MoveUpRight, Play, Plus, Quote, Shield, Sparkles, Target, UserCog, X, Zap } from 'lucide-react';
import { Link, Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider, useAuth, useClerk, useUser } from '@clerk/react';
import { useSignIn, useSignUp } from '@clerk/react/legacy';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/components/not-found';
import logoPath from '@assets/LOGO_VG_MARKETING_1787577364878.png';
import loginLogoPath from '@assets/LOGO_VG_MARKETING_1787595132276.png';
import latestLoginLogoPath from '@assets/LOGO_REDONDO_1787597368452.png';
import crmLogoPath from '@assets/LOGO_REDONDO_1787599549491.png';
import hfcoLogoPath from '@assets/LOGOQUADRADO_1787584190111.png';
import imoveisLogoPath from '@assets/LOGO_1787590491272.jpg';
import kartshopLogoPath from '@assets/logo_kartshop_upscayl_4x_upscayl-standard-4x_1787590622533.png';
import nobreLogoPath from '@assets/logo_nobre_iphones_1787590660734.png';
import profixLogoPath from '@assets/Logo_Profix_1787590753568.png';
import santaRitaLogoPath from '@assets/LOGO500X500_1787590811257.png';

const queryClient = new QueryClient();
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://vgconsultoriamkt.com.br';
const SITE_NAME = 'VG Consultoria em Marketing';
const API_BASE = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://vgconsultoriamkt.onrender.com' : '');
const clerkHostname = typeof window === 'undefined' ? 'vgconsultoriamkt.com.br' : window.location.hostname;
const configuredClerkPubKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY
  || import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkPubKey = configuredClerkPubKey
  ? publishableKeyFromHost(clerkHostname, configuredClerkPubKey)
  : undefined;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const browserOrigin = typeof window === 'undefined' ? SITE_URL : window.location.origin;

function assetUrl(asset: unknown): string {
  if (typeof asset === 'string') return asset;
  if (asset && typeof asset === 'object' && 'src' in asset && typeof asset.src === 'string') return asset.src;
  return '';
}

function hasStrongPassword(password: string): boolean {
  return password.length >= 12
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}

function stripBase(path: string) {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${browserOrigin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#9fe4e5',
    colorForeground: '#202f4d',
    colorMutedForeground: '#56657d',
    colorDanger: '#b96762',
    colorBackground: '#f5f7fa',
    colorInput: '#eef3f8',
    colorInputForeground: '#202f4d',
    colorNeutral: '#c3d1df',
    fontFamily: 'Manrope, sans-serif',
    borderRadius: '0.75rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#f5f7fa] rounded-2xl w-[440px] max-w-full overflow-hidden shadow-2xl',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#202f4d] font-display',
    headerSubtitle: 'text-[#56657d]',
    socialButtonsBlockButtonText: 'text-[#202f4d]',
    formFieldLabel: 'text-[#202f4d]',
    footerActionLink: 'text-[#58739f] font-bold',
    footerActionText: 'text-[#56657d]',
    dividerText: 'text-[#56657d]',
    formFieldSuccessText: 'text-emerald-700',
    alertText: 'text-[#b96762]',
    logoBox: 'hidden',
    logoImage: 'max-h-14',
    socialButtonsBlockButton: 'border-[#c3d1df] bg-white hover:bg-[#e6edf4]',
    formButtonPrimary: 'bg-[#202f4d] text-white hover:bg-[#58739f]',
    formFieldInput: 'border-[#c3d1df] bg-white text-[#202f4d]',
    footerAction: 'hidden',
    dividerLine: 'bg-[#d9e0e9]',
    alert: 'border-[#e4b1aa] bg-[#fff5f3]',
    otpCodeFieldInput: 'border-[#c3d1df] bg-white text-[#202f4d]',
    formFieldRow: 'text-[#202f4d]',
    main: 'bg-transparent',
  },
};

type Service = {
  slug: string;
  label: string;
  eyebrow: string;
  title: string;
  short: string;
  description: string;
  number: string;
  accent: string;
  bullets: string[];
  bulletDetails?: string[];
  deliverables: string[];
  idealFor: string;
  metric: string;
  metricLabel: string;
};

const SERVICES: Service[] = [
  {
    slug: 'trafego-pago',
    label: 'Tráfego pago como consultoria',
    eyebrow: 'Aquisição & escala',
    title: 'Tráfego pago\ncom consultoria estratégica.',
    short: 'Mais do que gerar cliques: uma operação preparada para converter e escalar.',
    description: 'Gerar tráfego é importante — mas gerar tráfego qualificado, com estrutura para atender, converter e escalar é o que realmente transforma resultados. Na VG Consultoria em Marketing, oferecemos tráfego pago como consultoria, indo além da gestão de campanhas para estruturar toda a operação necessária para sua empresa transformar cliques em vendas.',
    number: '01',
    accent: 'Aquisição',
    bullets: ['Planejamento e gestão de campanhas', 'Formatação dos canais de aquisição', 'Organização interna de atendimento', 'Criação de scripts de atendimento', 'Integrações com sistemas'],
    bulletDetails: [
      'Criamos e gerenciamos campanhas de mídia paga nos principais canais (Meta Ads, Google Ads, YouTube, LinkedIn, etc.), com foco em performance, segmentação estratégica e alinhamento ao seu funil de vendas.',
      'Ajustamos páginas, criativos, formulários e landing pages para garantir que os canais estejam preparados para receber e converter tráfego. O foco é eliminar pontos de fricção e aumentar a taxa de conversão.',
      'Ajudamos a estruturar o fluxo de atendimento comercial após a geração do lead: definimos responsáveis, processos e ferramentas para garantir agilidade e qualidade no primeiro contato.',
      'Fornecemos scripts prontos e personalizáveis para SDRs, pré-vendas e equipe comercial, adaptados ao seu produto, à jornada do cliente e ao canal de origem do lead.',
      'Fazemos ou orientamos a integração entre canais de mídia e CRMs, plataformas de automação e ferramentas internas, garantindo rastreabilidade, mensuração e fluidez no processo.',
    ],
    deliverables: ['Melhor aproveitamento do investimento em mídia', 'Redução do desperdício de leads', 'Processo claro da atração à conversão', 'Scripts para aumentar a eficiência comercial', 'Integração entre campanhas, sistemas e time interno', 'Resultados mais consistentes e previsíveis'],
    idealFor: 'Empresas que investem em mídia, mas não convertem com consistência; têm desorganização no atendimento; precisam alinhar marketing e vendas; ou buscam ROI com estrutura, não apenas impulsionamento.',
    metric: 'Do clique',
    metricLabel: 'ao fechamento da venda, com estratégia, time preparado e processo claro',
  },
  {
    slug: 'consultoria-de-marketing',
    label: 'Consultoria de Marketing',
    eyebrow: 'Direção & clareza',
    title: 'Marketing com\nnorte para decidir.',
    short: 'Um mapa prático para sair do esforço disperso.',
    description: 'Ajudamos sua liderança a escolher onde colocar energia, verba e tempo. Da leitura do mercado à priorização do plano, a consultoria transforma complexidade em decisões que cabem na operação.',
    number: '02',
    accent: 'Estratégia',
    bullets: ['Planejamento de marketing sob medida', 'Equipe interna capacitada', 'Produção de conteúdo com propósito', 'Branding digital forte e coerente', 'Tráfego pago gerenciado com estratégia', 'Acompanhamento constante e ajustes com base em dados'],
    bulletDetails: [
      'Criamos um plano sob medida levando em conta o estágio da sua empresa, o mercado, os recursos disponíveis e as metas de crescimento.',
      'Ajudamos a contratar os profissionais certos, como social media, designer, gestor de tráfego, SDR, BDR e vendedores de inside sales, além de treinar o time.',
      'Produzimos conteúdos estratégicos, incluindo vídeos com objetivos bem definidos e alinhados ao momento do negócio.',
      'Construímos uma presença digital forte e coerente, com marca, posicionamento e comunicação trabalhando na mesma direção.',
      'Executamos campanhas de mídia paga com foco em conversão e conectadas ao restante da operação de marketing e vendas.',
      'Acompanhamos os resultados constantemente e fazemos ajustes com base em dados para aumentar a produtividade e o retorno.',
    ],
    deliverables: ['Redução do desperdício de mídia e ações mal direcionadas', 'Equipe interna alinhada, produtiva e orientada a metas', 'Presença digital sólida e posicionamento claro', 'Maior retorno sobre conteúdo e mídia', 'Controle, previsibilidade e autonomia para crescer'],
    idealFor: 'Pequenas e médias empresas que querem sair do improviso, profissionalizar o marketing e construir crescimento com estrutura e autonomia.',
    metric: 'Sob medida',
    metricLabel: 'para a realidade, os recursos e as metas da sua empresa',
  },
  {
    slug: 'internalizacao-de-marketing',
    label: 'Internalização de Marketing',
    eyebrow: 'Time & autonomia',
    title: 'Internalização sem\nperder velocidade.',
    short: 'Montamos a base para o marketing acontecer dentro de casa.',
    description: 'Internalizar marketing não é só contratar. É criar contexto, processos, rituais e critério para um time interno operar com autonomia — com a VG ao lado na transição.',
    number: '03',
    accent: 'Estrutura',
    bullets: ['Diagnóstico inicial', 'Planejamento da estrutura ideal', 'Apoio à contratação', 'Treinamento e integração da equipe', 'Organização dos processos', 'Acompanhamento e ajustes'],
    bulletDetails: [
      'Avaliamos sua estrutura atual, sua capacidade de gestão interna e seus objetivos de crescimento.',
      'Definimos os cargos e perfis necessários com base nas metas e na realidade da empresa.',
      'Trabalhamos junto ao RH ou conduzimos o processo de seleção para encontrar os profissionais certos.',
      'Capacitamos os profissionais com foco em execução, resultado e compreensão do papel de cada um.',
      'Implantamos rotinas, ferramentas, fluxos e indicadores para o time operar com clareza e autonomia.',
      'Monitoramos o desempenho do time e ajudamos nos ajustes ao longo do caminho.',
    ],
    deliverables: ['Um time próprio, com as pessoas certas nos lugares certos', 'Processos claros, metas objetivas e menos improviso', 'Integração entre marketing e vendas', 'Resultados reais com menor dependência externa', 'Crescimento baseado em estrutura, não em tentativa e erro'],
    idealFor: 'Empresas que querem deixar de depender exclusivamente de agências e freelancers e construir um time interno forte, treinado e alinhado ao negócio.',
    metric: 'Mais controle',
    metricLabel: 'para crescer com estrutura, consistência e autonomia',
  },
  {
    slug: 'manager-as-a-service',
    label: 'Manager as a Service',
    eyebrow: 'Liderança sob demanda',
    title: 'Uma liderança de\nmarketing no ritmo certo.',
    short: 'Senioridade para organizar, priorizar e fazer avançar.',
    description: 'Seu negócio pode não precisar de uma contratação em tempo integral — mas precisa de alguém que conecte estratégia e execução. Atuamos como sua liderança de marketing, dentro do contexto real da empresa.',
    number: '04',
    accent: 'Liderança',
    bullets: ['Planejamento estratégico de marketing', 'Organização das frentes e prioridades', 'Liderança de equipe interna ou terceirizada', 'Acompanhamento e análise de desempenho', 'Alinhamento entre marketing e vendas'],
    bulletDetails: [
      'Desenvolvemos o plano de ação com base nos objetivos do negócio, orçamento disponível e maturidade da equipe, traduzindo metas comerciais em ações práticas e mensuráveis.',
      'Definimos quem faz o quê, em que ordem e com quais recursos, montando cronogramas e fluxos para eliminar retrabalho e garantir consistência.',
      'Assumimos a liderança estratégica sobre colaboradores, agências, freelancers ou parceiros, conduzindo reuniões e dando clareza de meta e direção.',
      'Monitoramos as ações e entregamos relatórios com análises, insights e decisões a tomar, ajustando a rota com rapidez quando necessário.',
      'Facilitamos a comunicação entre marketing e vendas com alinhamento de dados, revisão de funil e estratégias para aumentar o aproveitamento dos leads.',
    ],
    deliverables: ['Clareza estratégica em todas as ações de marketing', 'Estrutura interna enxuta e eficiente', 'Mais tempo para a liderança da empresa', 'Profissionais e parceiros trabalhando de forma integrada', 'Crescimento com previsibilidade e foco no que dá resultado', 'Integração entre marca, mídia, vendas e operação'],
    idealFor: 'Empresas que estão crescendo, já têm equipe ou parceiros, mas ainda não contam com liderança especializada para unir tudo com clareza e foco em performance.',
    metric: 'Uma liderança',
    metricLabel: 'para conectar estratégia, equipe, parceiros e resultado',
  },
  {
    slug: 'branding',
    label: 'Branding e presença de marca',
    eyebrow: 'Marca & presença',
    title: 'Uma marca que\nocupa seu lugar.',
    short: 'Posicionamento que ganha forma, voz e consistência.',
    description: 'Branding é uma escolha de negócio antes de ser uma escolha estética. Encontramos o território onde sua empresa pode ser reconhecida, lembrada e preferida — e traduzimos isso para a experiência.',
    number: '05',
    accent: 'Presença',
    bullets: ['Posicionamento de marca', 'Identidade visual e verbal', 'Diretrizes de marca nos canais', 'Estratégia de presença digital'],
    bulletDetails: [
      'Definimos quem você é, para quem fala e o que diferencia sua empresa, criando a base que orienta comunicação, marketing e comercial.',
      'Construímos ou revisamos cores, logotipo, tipografia, padrões, tom de voz, estilo de linguagem e personalidade da comunicação.',
      'Criamos guias e frameworks para aplicar a marca com consistência em redes sociais, site, materiais de venda, apresentações e anúncios.',
      'Planejamos como e onde sua marca deve aparecer para gerar percepção, familiaridade e autoridade, integrando branding, conteúdo e mídia.',
    ],
    deliverables: ['Clareza de identidade e diferenciação', 'Mais confiança e reconhecimento do público', 'Consistência em todos os canais', 'Alinhamento entre marketing, vendas e experiência', 'Posicionamento forte para sustentar o crescimento'],
    idealFor: 'Empresas que precisam se diferenciar, estão crescendo ou sentem que a marca atual já não representa a qualidade e a ambição do negócio.',
    metric: 'Uma marca',
    metricLabel: 'para ser reconhecida, lembrada e escolhida',
  },
  {
    slug: 'conteudo-para-redes-sociais',
    label: 'Conteúdo para redes sociais',
    eyebrow: 'Conteúdo & relevância',
    title: 'Conteúdo que\npensa junto.',
    short: 'Presença social com ideia, cadência e ponto de vista.',
    description: 'Não produzimos posts para preencher calendário. Criamos uma linha editorial com inteligência de negócio, linguagem humana e consistência suficiente para construir confiança ao longo do tempo.',
    number: '06',
    accent: 'Relevância',
    bullets: ['Definição de objetivos e formatos', 'Roteirização estratégica', 'Direção e captação profissional', 'Edição para canais digitais', 'Orientação de publicação e performance'],
    bulletDetails: [
      'Identificamos quais vídeos sua empresa precisa: reels para atrair, conteúdos educativos para autoridade, depoimentos, bastidores ou vídeos institucionais — sempre alinhados ao funil e às metas.',
      'Criamos roteiros claros, enxutos e alinhados ao tom da marca, com uma estrutura pensada para reter atenção e guiar o espectador até a ação.',
      'Acompanhamos a produção para garantir qualidade técnica, narrativa e estética, tanto com equipe presencial quanto em conteúdos gravados remotamente.',
      'Editamos para vertical, horizontal, stories, reels e YouTube, cuidando de cortes, ritmo, legendas, trilha e identidade visual.',
      'Orientamos cronograma, legendas, distribuição e impulsionamento para transformar publicação em visibilidade e engajamento real.',
    ],
    deliverables: ['Maior alcance e retenção nas redes', 'Autoridade e imagem profissional', 'Clareza na comunicação da marca', 'Engajamento real com o público-alvo', 'Conteúdo alinhado à jornada de compra', 'Aproveitamento máximo do investimento'],
    idealFor: 'Empresas que querem crescer no digital com uma imagem profissional, criar autoridade e transformar redes sociais em canais de aquisição e relacionamento.',
    metric: 'Com intenção',
    metricLabel: 'para atrair, convencer e vender em cada formato',
  },
];

const serviceBySlug = (slug: string) => SERVICES.find((service) => service.slug === slug) ?? SERVICES[0];

type CaseStudy = {
  client: string;
  location: string;
  summary: string;
  detail: string;
  mark: string;
  logo?: string;
  tone: string;
  featured?: boolean;
};

const CASE_STUDIES: CaseStudy[] = [
  {
    client: 'HF&CO Acabamentos',
    location: 'Curitiba / PR',
    summary: 'Posicionamento, presença e operação para uma marca que queria ganhar clareza.',
    detail: 'A VG Consultoria em Marketing tem orgulho em ter prestado serviços para a HF&CO Acabamentos. Um trabalho de consultoria que envolveu rebranding, lançamento de nova marca no mercado, estruturação da comunicação, internalização dos processos de marketing, seleção de pessoal, tráfego pago, lançamento de novo site, Manager As a Service e muito mais.',
    mark: 'HF',
    logo: hfcoLogoPath,
    tone: 'bg-[#d7bd91]',
    featured: true,
  },
  {
    client: 'Imóveis Diferenciados',
    location: 'São Paulo / SP',
    summary: 'Uma parceria para transformar marketing em processo comercial.',
    detail: 'A parceria da VG Consultoria em Marketing com a Imóveis Diferenciados foi fundamental em diversos momentos. Internalizamos processos de marketing contratando e treinando Social Media, Tráfego Pago, busca da melhor solução para site e migração de todo o sistema de gestão do portal.',
    mark: 'ID',
    logo: imoveisLogoPath,
    tone: 'bg-[#b8d9da]',
  },
  {
    client: 'Kartshop — A sua Loja de Kart na Web',
    location: 'Porto Alegre / RS',
    summary: 'Uma loja na web preparada para modernizar o jeito de vender.',
    detail: 'Trabalhar em conjunto com a Kartshop foi uma oportunidade incrível para modernizar uma tradicional loja de e-commerce para um sistema totalmente novo e moderno. Fizemos toda a migração de sistema, cadastro de produtos e clientes, do GTM até a primeira venda. Estruturamos a comunicação, inaugurando a gestão das redes sociais.',
    mark: 'KS',
    logo: kartshopLogoPath,
    tone: 'bg-[#e6edf4]',
  },
  {
    client: 'Nobre Iphones',
    location: 'Fortaleza / CE',
    summary: 'Diagnóstico, CRM e mídia para transformar interesse em venda.',
    detail: 'A VG Consultoria em Marketing teve a satisfação de colaborar com a Nobre Iphones, fazendo um diagnóstico da empresa e do mercado de celulares e serviços, construção de site, aplicação da estratégia de CRM com escolha do sistema e gestão de campanhas ponta-a-ponta, trazendo 150% de ROI, assim como a internalização dos processos de marketing, através da seleção, treinamento e execução do social media nas redes sociais.',
    mark: 'NI',
    logo: nobreLogoPath,
    tone: 'bg-[#202f4d]',
  },
  {
    client: 'Profix Portas Automáticas',
    location: 'Fortaleza / CE',
    summary: 'Uma marca nova, com nome, identidade e processo para crescer.',
    detail: 'A parceria com a Profix permitiu à VG Consultoria em Marketing desenvolver uma nova marca no mercado. Desde a criação do nome, logo, identidade visual. Fizemos a seleção de fornecedores para site e para social media, assim como a gestão de conteúdo da marca.',
    mark: 'PF',
    logo: profixLogoPath,
    tone: 'bg-[#c88982]',
  },
  {
    client: 'Panificadora Santa Rita',
    location: 'Fortaleza / CE',
    summary: 'Marketing integrado para um negócio com história e presença local.',
    detail: 'A VG Consultoria em Marketing teve a oportunidade de trabalhar com a Santa Rita, no diagnóstico da empresa, análise de mercado e na criação da identidade completa da marca. Internalizamos processo de marketing na seleção de analista de marketing, participando desde as entrevistas, contratação e treinamento. Além disso produzimos vídeos sazonais para redes sociais, e atuamos como Marketing Manager-as-a-Service (MMaaS), na gestão da comunicação e nos conteúdos.',
    mark: 'SR',
    logo: santaRitaLogoPath,
    tone: 'bg-[#dce7f0]',
  },
];

type FAQ = { question: string; answer: string };

const SERVICE_FAQS: Record<string, FAQ[]> = {
  'trafego-pago': [
    { question: 'A VG faz apenas a gestão dos anúncios?', answer: 'Não. A consultoria conecta campanhas, páginas, atendimento, CRM e mensuração para que o investimento em mídia tenha melhores condições de virar venda.' },
    { question: 'Vocês trabalham com Meta Ads e Google Ads?', answer: 'Sim. O canal é escolhido a partir do público, da jornada de compra e da capacidade comercial da empresa, podendo incluir Meta Ads, Google Ads, YouTube e LinkedIn.' },
    { question: 'Quanto devo investir em tráfego pago?', answer: 'O investimento depende do mercado, do ticket, da meta comercial e da capacidade de atendimento. Primeiro entendemos o cenário para propor uma estrutura realista.' },
    { question: 'Em quanto tempo aparecem os primeiros aprendizados?', answer: 'A operação começa com hipóteses e mensuração clara. Os primeiros aprendizados surgem com os dados das campanhas e são usados para ajustar a rota continuamente.' },
  ],
  'consultoria-de-marketing': [
    { question: 'Para quem é a consultoria de marketing?', answer: 'Para pequenas e médias empresas que querem sair do improviso, priorizar melhor as ações e transformar marketing em uma parte mais organizada do crescimento.' },
    { question: 'A consultoria também ajuda a equipe interna?', answer: 'Sim. Além do planejamento, podemos capacitar pessoas, organizar responsabilidades, criar processos e acompanhar a execução junto à liderança.' },
    { question: 'A VG atende empresas fora de Fortaleza?', answer: 'Sim. A VG nasceu em Fortaleza, no Ceará, e atende empresas de diferentes regiões do Brasil em projetos presenciais ou remotos, conforme a necessidade.' },
    { question: 'O plano de marketing é pronto ou personalizado?', answer: 'Cada plano parte do estágio, do mercado, dos recursos e das metas da empresa. A proposta é construir decisões que caibam na operação real.' },
  ],
  'internalizacao-de-marketing': [
    { question: 'O que significa internalizar o marketing?', answer: 'É construir capacidade dentro da empresa: definir papéis, contratar as pessoas certas, criar processos e dar ao time contexto para operar com autonomia.' },
    { question: 'A VG ajuda a contratar profissionais?', answer: 'Sim. Apoiamos a definição dos perfis, a seleção, as entrevistas, a integração e o treinamento de profissionais de marketing e vendas.' },
    { question: 'Quanto tempo leva para montar um time interno?', answer: 'O prazo depende da estrutura desejada, dos cargos e do momento da empresa. O projeto organiza a sequência para começar pelo que gera mais impacto.' },
    { question: 'A VG continua acompanhando depois da contratação?', answer: 'Sim. O acompanhamento ajuda o time a transformar estratégia em rotina, ajustar processos e ganhar segurança durante a transição.' },
  ],
  'manager-as-a-service': [
    { question: 'O que faz um Marketing Manager as a Service?', answer: 'A VG atua como liderança estratégica de marketing, conectando direção, equipe, parceiros, prioridades, indicadores e execução sem exigir uma contratação em tempo integral.' },
    { question: 'Para qual tipo de empresa esse modelo funciona?', answer: 'Para empresas que já têm pessoas ou fornecedores, mas precisam de alguém experiente para organizar as frentes, definir prioridades e fazer o marketing avançar.' },
    { question: 'A VG lidera equipe interna e agências?', answer: 'Sim. A atuação pode coordenar profissionais internos, freelancers, agências e outros parceiros, sempre com responsabilidades e metas mais claras.' },
    { question: 'Qual é a diferença para contratar uma agência?', answer: 'O foco não é apenas entregar peças ou campanhas. É assumir a conexão entre estratégia, operação e decisões para o marketing funcionar dentro do negócio.' },
  ],
  branding: [
    { question: 'Branding é apenas criar uma identidade visual?', answer: 'Não. Branding envolve posicionamento, diferenciação, voz, experiência e consistência. A identidade visual traduz essa estratégia, mas não é o trabalho inteiro.' },
    { question: 'Quando uma empresa precisa revisar sua marca?', answer: 'Quando a comunicação já não representa a qualidade do negócio, a empresa cresceu, entrou em um novo mercado ou deixou de ser percebida como gostaria.' },
    { question: 'O projeto inclui posicionamento e tom de voz?', answer: 'Sim. A estratégia pode incluir território de marca, públicos, diferenciais, mensagens, tom de voz, identidade visual e diretrizes para os canais.' },
    { question: 'Branding ajuda a vender mais?', answer: 'Uma marca mais clara e consistente aumenta confiança, diferenciação e lembrança. Isso cria melhores condições para marketing, vendas e experiência trabalharem juntos.' },
  ],
  'conteudo-para-redes-sociais': [
    { question: 'A VG cria um calendário de posts?', answer: 'O trabalho começa pelo objetivo do negócio e pela linha editorial. A partir disso, definimos formatos, pautas, roteiros, cronograma e critérios de publicação.' },
    { question: 'Vocês produzem vídeos para Instagram e TikTok?', answer: 'Sim. Criamos conteúdos para Reels, Stories, TikTok, YouTube e outros formatos digitais, adaptando roteiro, captação, edição e distribuição ao canal.' },
    { question: 'Preciso ter uma equipe ou estrutura de gravação?', answer: 'Não necessariamente. A VG pode orientar gravações com a equipe da empresa ou conduzir a produção com parceiros, de acordo com o objetivo e os recursos disponíveis.' },
    { question: 'Como saber se o conteúdo está funcionando?', answer: 'Avaliamos indicadores coerentes com cada objetivo, como alcance, retenção, interação, geração de demanda e contribuição para a jornada de compra.' },
  ],
};

const RELATED_SERVICES: Record<string, string[]> = {
  'trafego-pago': ['consultoria-de-marketing', 'conteudo-para-redes-sociais'],
  'consultoria-de-marketing': ['trafego-pago', 'manager-as-a-service'],
  'internalizacao-de-marketing': ['manager-as-a-service', 'consultoria-de-marketing'],
  'manager-as-a-service': ['internalizacao-de-marketing', 'consultoria-de-marketing'],
  branding: ['conteudo-para-redes-sociais', 'consultoria-de-marketing'],
  'conteudo-para-redes-sociais': ['branding', 'trafego-pago'],
};

function ServiceSeoBlock({ service }: { service: Service }) {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const faqs = SERVICE_FAQS[service.slug] ?? [];
  const related = (RELATED_SERVICES[service.slug] ?? []).map(serviceBySlug);
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section id="perguntas-frequentes" className="bg-[#f5f7fa]">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.72fr_1.28fr] lg:px-10 lg:py-28">
        <div>
          <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ dúvidas sobre {service.accent.toLowerCase()}</p>
          <h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Marketing com clareza para empresas em <span className="text-[#58739f]">Fortaleza e no Brasil.</span></h2>
          <p className="mt-7 max-w-md text-base leading-8 text-[#56657d]">A VG combina estratégia, execução e acompanhamento para construir um marketing que faça sentido para o momento e a capacidade do seu negócio.</p>
          <div className="mt-8 border-t border-[#d9e0e9] pt-5">
            <p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#58739f]">/ veja também</p>
            <nav aria-label="Serviços relacionados" className="mt-4 flex flex-col items-start gap-3">
              {related.map((item) => <Link key={item.slug} href={`/servicos/${item.slug}`} className="text-sm font-extrabold text-[#202f4d] underline decoration-[#9fe4e5] decoration-2 underline-offset-4 hover:text-[#58739f]">{item.label} <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link>)}
            </nav>
          </div>
        </div>
        <div className="border-t border-[#b8c6d7]">
          {faqs.map((faq, index) => {
            const isOpen = openQuestion === index;
            const answerId = `faq-${service.slug}-${index}`;
            return (
              <div key={faq.question} className="border-b border-[#d9e0e9]">
                <button type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenQuestion(isOpen ? null : index)} className="group flex w-full items-center gap-5 py-6 text-left">
                  <span className="font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span>
                  <span className="flex-1 font-display text-xl font-semibold tracking-[-.02em] text-[#202f4d] transition-colors group-hover:text-[#58739f] sm:text-2xl">{faq.question}</span>
                  <ArrowRight className={`h-4 w-4 shrink-0 text-[#9caac0] transition-all ${isOpen ? 'rotate-90 text-[#58739f]' : 'group-hover:translate-x-1 group-hover:text-[#58739f]'}`} />
                </button>
                {isOpen && <p id={answerId} className="reveal pb-6 pl-10 pr-7 text-sm leading-7 text-[#56657d] sm:pl-16">{faq.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>
      </section>
    </>
  );
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let meta = document.querySelector(`meta[${attribute}="${key}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

function usePageMeta(title: string, description: string) {
  useEffect(() => {
    const fullTitle = `${title} | VG Marketing`;
    document.title = fullTitle;
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    const canonicalUrl = `${SITE_URL}${path === '/' ? '/' : path}`;
    const socialImageUrl = `${SITE_URL}/og-image.png`;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'author', SITE_NAME);
    upsertMeta('name', 'theme-color', '#202f4d');
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:locale', 'pt_BR');
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:image', socialImageUrl);
    upsertMeta('property', 'og:image:secure_url', socialImageUrl);
    upsertMeta('property', 'og:image:type', 'image/png');
    upsertMeta('property', 'og:image:width', '800');
    upsertMeta('property', 'og:image:height', '800');
    upsertMeta('property', 'og:image:alt', 'Logo da VG Consultoria em Marketing');
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:url', canonicalUrl);
    upsertMeta('name', 'twitter:image', socialImageUrl);
    upsertMeta('name', 'twitter:image:alt', 'Logo da VG Consultoria em Marketing');
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [title, description]);
}

function Header({ onLight = false }: { onLight?: boolean }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const links = [
    { href: '/', label: 'Início' },
    { href: '/servicos/consultoria-de-marketing', label: 'Como atuamos' },
    { href: '/sobre-a-vg', label: 'Sobre a VG' },
    { href: '/cases', label: 'Cases' },
  ];
  useEffect(() => {
    const openServicesMenu = () => {
      setServicesOpen(true);
      setOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('vg:open-services', openServicesMenu);
    if (new URLSearchParams(window.location.search).get('menu') === 'servicos') openServicesMenu();
    return () => window.removeEventListener('vg:open-services', openServicesMenu);
  }, [location]);
  return (
    <header className="absolute left-0 right-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10 lg:py-7">
        <Link href="/" className="group flex items-center gap-3" data-testid="link-brand">
          <img src={assetUrl(logoPath)} alt="VG Consultoria em Marketing" width="44" height="44" fetchPriority="high" decoding="async" className="h-11 w-11 rounded-xl object-cover shadow-[0_6px_16px_rgba(0,0,0,.15)] transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105" />
          <span className={`hidden max-w-[190px] text-[10px] font-extrabold uppercase leading-[1.15] tracking-[.16em] sm:block ${onLight ? 'text-[#202f4d]' : 'text-white'}`}>VG CONSULTORIA<br />EM MARKETING</span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Navegação principal">
          {links.map((link) => (
            <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`} className={`text-[13px] font-semibold transition-colors hover:text-[#9fe4e5] ${location === link.href ? 'text-[#9fe4e5]' : onLight ? 'text-[#405471]' : 'text-slate-300'}`}>
              {link.label}
            </Link>
          ))}
          <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
            <button type="button" aria-expanded={servicesOpen} onClick={() => setServicesOpen(true)} data-testid="button-nav-services" className={`flex items-center gap-1 text-[13px] font-semibold transition-colors hover:text-[#9fe4e5] ${servicesOpen || location.startsWith('/servicos/') ? 'text-[#9fe4e5]' : onLight ? 'text-[#405471]' : 'text-slate-300'}`}>
              Serviços <ChevronDown className={`h-3.5 w-3.5 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {servicesOpen && (
              <div className="absolute right-0 top-full z-50 w-80 rounded-2xl border border-white/15 bg-[#202f4d]/95 p-2 shadow-2xl backdrop-blur-xl">
                {SERVICES.map((service) => (
                  <Link key={service.slug} href={`/servicos/${service.slug}`} onClick={() => setServicesOpen(false)} data-testid={`link-nav-service-${service.slug}`} className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-[#9fe4e5] hover:text-[#202f4d]">
                    {service.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
         <div className="hidden items-center gap-3 md:flex">
         <Link href="/sign-in" data-testid="link-header-company-access" className="rounded-full border border-[#9fe4e5]/50 px-4 py-3 text-[12px] font-extrabold text-[#9fe4e5] transition-colors hover:bg-[#9fe4e5] hover:text-[#202f4d]">
           Acesso empresa
         </Link>
         <Link href="/#contato" data-testid="link-header-contact" className="button-lift rounded-full bg-[#9fe4e5] px-5 py-3 text-[12px] font-extrabold text-[#202f4d]">
          Vamos conversar <ArrowRight className="ml-2 inline-block h-3.5 w-3.5" />
        </Link>
         </div>
        <button type="button" aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open} onClick={() => setOpen(!open)} data-testid="button-mobile-menu" className={`rounded-lg p-2.5 md:hidden ${onLight ? 'border border-[#202f4d]/20 text-[#202f4d]' : 'border border-white/20 text-white'}`}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className={`mx-4 rounded-2xl p-4 shadow-2xl backdrop-blur-xl md:hidden ${onLight ? 'border border-[#202f4d]/15 bg-[#f5f7fa]/95' : 'border border-white/15 bg-[#202f4d]/95'}`}>
          {links.slice(0, 2).map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} data-testid={`link-mobile-${link.label.toLowerCase().replaceAll(' ', '-')}`} className="block border-b border-white/10 px-3 py-3.5 text-sm font-semibold text-slate-200 last:border-0">
              {link.label}
            </Link>
          ))}
          <div className="border-b border-white/10">
            <button type="button" aria-expanded={servicesOpen} onClick={() => setServicesOpen(!servicesOpen)} data-testid="button-mobile-services" className="flex w-full items-center justify-between px-3 py-3.5 text-left text-sm font-semibold text-slate-200">
              Serviços <ChevronDown className={`h-4 w-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
            </button>
            {servicesOpen && (
              <div className="mb-3 rounded-xl bg-white/5 p-2">
                {SERVICES.map((service) => (
                  <Link key={service.slug} href={`/servicos/${service.slug}`} onClick={() => { setOpen(false); setServicesOpen(false); }} data-testid={`link-mobile-service-${service.slug}`} className="block rounded-lg px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-[#9fe4e5] hover:text-[#202f4d]">
                    {service.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/sobre-a-vg" onClick={() => setOpen(false)} data-testid="link-mobile-about" className="block border-b border-white/10 px-3 py-3.5 text-sm font-semibold text-slate-200">Sobre a VG</Link>
          <Link href="/cases" onClick={() => setOpen(false)} data-testid="link-mobile-cases" className="block border-b border-white/10 px-3 py-3.5 text-sm font-semibold text-slate-200">Cases</Link>
          <Link href="/#contato" onClick={() => setOpen(false)} data-testid="link-mobile-contact" className="mt-3 block rounded-xl bg-[#9fe4e5] px-3 py-3 text-center text-sm font-extrabold text-[#202f4d]">Solicite um orçamento</Link>
          <Link href="/sign-in" onClick={() => setOpen(false)} data-testid="link-mobile-company-access" className="mt-2 block rounded-xl border border-[#9fe4e5]/50 px-3 py-3 text-center text-sm font-extrabold text-[#9fe4e5]">Acesso empresa</Link>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const [location] = useLocation();
  const service = SERVICES.find((item) => location === `/servicos/${item.slug}`);
  return (
    <>
      {service && <ServiceSeoBlock service={service} />}
      <footer className="bg-[#17233e] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1.4fr_.7fr_.7fr] lg:px-10 lg:py-20">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <img src={assetUrl(logoPath)} alt="VG Consultoria em Marketing" width="48" height="48" loading="lazy" decoding="async" className="h-12 w-12 rounded-xl object-cover" />
            <span className="text-[10px] font-extrabold uppercase leading-[1.15] tracking-[.16em] text-white">VG CONSULTORIA<br />EM MARKETING</span>
          </div>
          <p className="max-w-sm text-sm leading-7 text-slate-400">Clareza para decidir. Estrutura para executar. Marketing para crescer com consistência.</p>
          <p className="mt-8 font-mono-vg text-[10px] uppercase tracking-[.18em] text-slate-500">Estratégia que encontra o caminho</p>
        </div>
        <div>
          <p className="mb-5 font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#9fe4e5]">Explorar</p>
          <div className="flex flex-col items-start gap-3 text-sm">
            <Link
              href="/?menu=servicos"
              onClick={(event) => {
                if (window.location.pathname === '/') {
                  event.preventDefault();
                  window.dispatchEvent(new Event('vg:open-services'));
                }
              }}
              data-testid="link-footer-services"
              className="underline-link hover:text-white"
            >
              Serviços
            </Link>
            <Link href="/sobre-a-vg" data-testid="link-footer-about" className="underline-link hover:text-white">Sobre a VG</Link>
            <Link href="/cases" data-testid="link-footer-cases" className="underline-link hover:text-white">Cases</Link>
            <Link href="/#contato" data-testid="link-footer-contact" className="underline-link hover:text-white">Solicite um orçamento</Link>
          </div>
        </div>
        <div>
          <p className="mb-5 font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#9fe4e5]">Fale com a gente</p>
          <a href="mailto:atendimento@vgconsultoriamkt.com.br" data-testid="link-footer-email" className="underline-link text-sm hover:text-white">atendimento@vgconsultoriamkt.com.br</a>
          <p className="mt-3 text-sm text-slate-400">Fortaleza · Brasil</p>
          <div className="mt-6 flex items-center gap-3">
            <a href="https://www.instagram.com/vgconsultoriamkt/" target="_blank" rel="noreferrer" aria-label="Instagram da VG Consultoria em Marketing" data-testid="link-footer-instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-[#9fe4e5] hover:text-[#9fe4e5]">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="https://www.linkedin.com/company/vg-consultoria-em-marketing/" target="_blank" rel="noreferrer" aria-label="LinkedIn da VG Consultoria em Marketing" data-testid="link-footer-linkedin" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-[#9fe4e5] hover:text-[#9fe4e5]">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <span>2026 desenvolvido por VG consultoria em Marketing.</span>
          <span className="font-mono-vg uppercase tracking-[.12em]">VG / 001</span>
        </div>
      </div>
      </footer>
    </>
  );
}

function LogoMark({ className = '' }: { className?: string }) {
  return <div className={`relative overflow-hidden rounded-full border border-[#9fe4e5]/40 bg-[#9fe4e5]/10 ${className}`}><div className="absolute inset-1 rounded-full border border-[#9fe4e5]/30" /><span className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold text-[#9fe4e5]">VG</span></div>;
}

const CRM_SOURCE_LABELS: Record<string, string> = {
  google: 'Google',
  meta_ads: 'Meta Ads',
  organic: 'Orgânico',
  site: 'Site',
  manual: 'Manual',
  referral: 'Indicação',
  other: 'Outro',
};
const CRM_SOURCE_OPTIONS = Object.entries(CRM_SOURCE_LABELS);
type CrmSource = keyof typeof CRM_SOURCE_LABELS;

function detectLeadSource(): CrmSource {
  if (typeof window === 'undefined') return 'site';
  const params = new URLSearchParams(window.location.search);
  const utmSource = (params.get('utm_source') || '').toLowerCase();
  const medium = (params.get('utm_medium') || '').toLowerCase();
  if (params.has('gclid') || utmSource.includes('google')) return 'google';
  if (params.has('fbclid') || utmSource.includes('facebook') || utmSource.includes('instagram') || utmSource.includes('meta')) return 'meta_ads';
  if (medium === 'organic' || utmSource === 'organic') return 'organic';
  if (document.referrer) {
    try {
      const host = new URL(document.referrer).hostname;
      if (/(google|bing|yahoo|duckduckgo)\./i.test(host)) return 'organic';
      if (/(facebook|instagram)\./i.test(host)) return 'meta_ads';
    } catch {
      // Ignore malformed referrers and keep the site fallback.
    }
  }
  return 'site';
}

function ContactForm({ compact = false, serviceValue = '' }: { compact?: boolean; serviceValue?: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', company: '', service: serviceValue, message: '', source: detectLeadSource() });
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name || !form.email || !form.whatsapp || (!compact && !form.company)) {
      setError(compact ? 'Preencha seu nome, melhor e-mail e WhatsApp para continuar.' : 'Preencha nome, melhor e-mail, WhatsApp e empresa para a gente entender o contexto.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const response = await fetch(`${API_BASE}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('lead-submit-failed');
      setSubmitted(true);
    } catch {
      setError('Não foi possível enviar agora. Verifique sua conexão e tente novamente.');
    } finally {
      setSending(false);
    }
  };
  if (submitted) {
    return (
      <div role="status" aria-live="polite" className="flex min-h-[430px] flex-col justify-center rounded-[1.5rem] border border-[#9fe4e5]/20 bg-[#263758] p-8 text-white sm:p-12" data-testid="status-form-success">
        <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-full bg-[#9fe4e5] text-[#202f4d]"><CircleCheck className="h-7 w-7" /></div>
        <p className="mb-3 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">Mensagem recebida</p>
        <h3 className="font-display text-3xl font-semibold leading-tight">Solicitação recebida</h3>
        <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">Recebemos sua solicitação, em breve entraremos em contato.</p>
        <button type="button" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', whatsapp: '', company: '', service: serviceValue, message: '', source: detectLeadSource() }); }} data-testid="button-new-form" className="mt-8 flex w-fit items-center gap-2 text-sm font-bold text-[#9fe4e5]">Enviar outra mensagem <ArrowRight className="h-4 w-4" /></button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} aria-label="Formulário de contato e orçamento" aria-describedby={error ? 'form-error' : undefined} className={`rounded-[1.5rem] border border-white/10 bg-[#263758] p-6 text-white shadow-2xl sm:p-9 ${compact ? 'traffic-form' : ''}`} data-testid="form-quote">
      <div className="mb-8">
        <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">{compact ? 'Primeiro passo' : 'Solicite um orçamento'}</p>
        <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight">{compact ? <>Vamos entender onde a conversão<br /><span className="text-[#9fe4e5]">está travando.</span></> : <>Conte o que está<br /><span className="text-[#9fe4e5]">movendo você.</span></>}</h3>
        {compact && <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">Nome, melhor e-mail e WhatsApp bastam para começar. A empresa e a mensagem ajudam a preparar uma conversa mais útil.</p>}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor="contact-name" className="text-xs font-semibold text-slate-300">Seu nome *
          <input id="contact-name" name="name" autoComplete="name" required value={form.name} onChange={(event) => update('name', event.target.value)} data-testid="input-name" className="mt-2 w-full rounded-lg border border-white/15 bg-[#1e2d4a] px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#9fe4e5] focus:outline-none" placeholder="Como podemos chamar você?" />
        </label>
        <label htmlFor="contact-email" className="text-xs font-semibold text-slate-300">Qual seu melhor e-mail? *
          <input id="contact-email" name="email" autoComplete="email" required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} data-testid="input-email" className="mt-2 w-full rounded-lg border border-white/15 bg-[#1e2d4a] px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#9fe4e5] focus:outline-none" placeholder="voce@empresa.com.br" />
        </label>
        <label htmlFor="contact-whatsapp" className="text-xs font-semibold text-slate-300">WhatsApp *
          <input id="contact-whatsapp" name="whatsapp" autoComplete="tel" inputMode="tel" required type="tel" value={form.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} data-testid="input-whatsapp" className="mt-2 w-full rounded-lg border border-white/15 bg-[#1e2d4a] px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#9fe4e5] focus:outline-none" placeholder="(00) 00000-0000" />
        </label>
        <label htmlFor="contact-company" className="text-xs font-semibold text-slate-300">Empresa {compact ? <span className="font-normal text-slate-500">(opcional)</span> : '*'}
          <input id="contact-company" name="organization" autoComplete="organization" required={!compact} value={form.company} onChange={(event) => update('company', event.target.value)} data-testid="input-company" className="mt-2 w-full rounded-lg border border-white/15 bg-[#1e2d4a] px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#9fe4e5] focus:outline-none" placeholder="Nome da empresa" />
        </label>
        <label htmlFor="contact-service" className="text-xs font-semibold text-slate-300">Como podemos ajudar?
          <select id="contact-service" name="service" value={form.service} onChange={(event) => update('service', event.target.value)} data-testid="select-service" className="mt-2 w-full appearance-none rounded-lg border border-white/15 bg-[#1e2d4a] px-3.5 py-3 text-sm text-white focus:border-[#9fe4e5] focus:outline-none">
            <option value="">Selecione um serviço</option>
            {SERVICES.map((service) => <option key={service.slug} value={service.slug}>{service.label}</option>)}
          </select>
        </label>
      </div>
      <label htmlFor="contact-message" className="mt-4 block text-xs font-semibold text-slate-300">Um pouco sobre o desafio
        <textarea id="contact-message" name="message" autoComplete="off" value={form.message} onChange={(event) => update('message', event.target.value)} data-testid="textarea-message" rows={4} className="mt-2 w-full resize-none rounded-lg border border-white/15 bg-[#1e2d4a] px-3.5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-[#9fe4e5] focus:outline-none" placeholder="O que você quer transformar nos próximos meses?" />
      </label>
      {error && <p id="form-error" role="alert" aria-live="assertive" data-testid="status-form-error" className="mt-4 text-xs font-semibold text-[#ffb4a8]">{error}</p>}
      <button type="submit" disabled={sending} data-testid="button-submit-form" className="button-lift mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#9fe4e5] px-5 py-3.5 text-sm font-extrabold text-[#202f4d] disabled:cursor-wait disabled:opacity-70">
        {sending ? 'Agendando conversa...' : 'Agendar uma conversa'} {!sending && <ArrowRight className="h-4 w-4" />}
      </button>
      <p className="mt-4 text-center text-[10px] leading-5 text-slate-500">Seus dados ficam entre nós. A conversa inicial não obriga contratação.</p>
    </form>
  );
}

type CrmLead = {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  company: string | null;
  service: string | null;
  message: string | null;
  source: string;
  status: string;
  assignedUserId: number | null;
  createdAt: string;
};

type ManualLeadForm = { name: string; email: string; whatsapp: string; company: string; service: string; message: string; source: CrmSource };
type CrmNote = { id: number; body: string; createdAt: string };
type CrmActivity = { id: number; type: string; detail: string | null; createdAt: string };
type CrmRole = 'owner' | 'admin' | 'manager' | 'operator';
type CrmUser = { id: number; clerkUserId: string | null; email: string; name: string; role: CrmRole; active: number; lastSeenAt: string | null; updatedAt: string };
const CRM_ROLE_LABELS: Record<CrmRole, string> = { owner: 'Proprietário', admin: 'Administrador', manager: 'Gerente', operator: 'Consultor' };
const CRM_STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contato iniciado',
  meeting: 'Reunião agendada',
  proposal: 'Proposta enviada',
  won: 'Ganho',
  lost: 'Perdido',
};

function SignInPage() {
  const [, setLocation] = useLocation();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const { setActive } = useClerk();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'client-trust-code' | 'reset-code' | 'reset-password' | 'invitation-password'>('login');
  const [invitationTicket, setInvitationTicket] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      setLocation('/admin');
    }
  }, [authLoaded, isSignedIn, setLocation]);

  useEffect(() => {
    const ticket = new URLSearchParams(window.location.search).get('__clerk_ticket');
    if (ticket) {
      setInvitationTicket(ticket);
      setMode('invitation-password');
      setMessage('Defina sua senha para aceitar o convite e ativar seu acesso.');
    }
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isLoaded || !signIn) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'invitation-password') {
        if (!signUpLoaded || !signUp || !invitationTicket) {
          throw new Error('O convite não está mais disponível. Solicite um novo convite.');
        }
        if (!hasStrongPassword(newPassword)) {
          setError('A nova senha deve ter pelo menos 12 caracteres, incluindo maiúscula, minúscula, número e símbolo.');
          return;
        }
        await signUp.create({ strategy: 'ticket', ticket: invitationTicket });
        const result = await signUp.update({ password: newPassword });
        if (result.status === 'complete' && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          window.history.replaceState({}, '', '/admin');
          setLocation('/admin');
        } else {
          setError(`O Clerk retornou o estado "${result.status}" e não concluiu o aceite do convite.`);
        }
      } else if (mode === 'login') {
          setMessage('Validando acesso...');
        await signIn.create({ identifier: email });
        const result = await signIn.attemptFirstFactor({ strategy: 'password', password });
        if (result.status === 'complete' && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          setLocation('/admin');
          } else if (result.status === 'needs_client_trust') {
            const trustFactor = signIn.supportedSecondFactors?.find(
              (factor) => factor.strategy === 'email_code',
            ) as { strategy: 'email_code'; emailAddressId: string } | undefined;
            if (!trustFactor) throw new Error('O Clerk exige confiança do navegador, mas não disponibilizou um fator por e-mail.');
            await signIn.prepareSecondFactor({ strategy: trustFactor.strategy, emailAddressId: trustFactor.emailAddressId });
            setMode('client-trust-code');
            setMessage('Enviamos um código para confirmar este navegador.');
          } else {
            setError(`O Clerk retornou o estado "${result.status}" e não concluiu a sessão. Verifique os dados da conta e tente novamente.`);
        }
        } else if (mode === 'client-trust-code') {
          const result = await signIn.attemptSecondFactor({ strategy: 'email_code', code });
          if (result.status === 'complete' && result.createdSessionId) {
            await setActive({ session: result.createdSessionId });
            setLocation('/admin');
          } else {
            setError(`O Clerk retornou o estado "${result.status}" e não concluiu a verificação do navegador.`);
          }
      } else if (mode === 'reset-code') {
        await signIn.attemptFirstFactor({ strategy: 'reset_password_email_code', code });
        setMode('reset-password');
          setMessage('Código validado. Defina sua nova senha.');
      } else {
        if (!hasStrongPassword(newPassword)) {
          setError('A nova senha deve ter pelo menos 12 caracteres, incluindo maiúscula, minúscula, número e símbolo.');
          return;
        }
        const result = await signIn.resetPassword({ password: newPassword });
        if (result.status === 'complete' && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          setLocation('/admin');
          } else {
            setError('Não foi possível concluir a troca de senha. Tente iniciar a recuperação novamente.');
        }
      }
    } catch (submissionError) {
      const clerkError = submissionError as { errors?: Array<{ longMessage?: string; message?: string }> };
      setError(clerkError.errors?.[0]?.longMessage || clerkError.errors?.[0]?.message || 'Não foi possível entrar. Confira seus dados.');
    } finally {
      setLoading(false);
    }
  };

  const recoverPassword = async () => {
    if (!isLoaded || !signIn || !email.trim()) {
      setError('Digite seu e-mail para recuperar a senha.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn.create({ identifier: email });
      const resetFactor = signIn.supportedFirstFactors?.find(
        (factor) => factor.strategy === 'reset_password_email_code',
      ) as { strategy: 'reset_password_email_code'; emailAddressId: string } | undefined;
      if (!resetFactor) throw new Error('Esta conta não possui recuperação por e-mail habilitada.');
       await signIn.prepareFirstFactor({ strategy: resetFactor.strategy, emailAddressId: resetFactor.emailAddressId });
      setMode('reset-code');
      setMessage('Enviamos um código de recuperação para seu e-mail.');
    } catch (submissionError) {
      const clerkError = submissionError as { errors?: Array<{ longMessage?: string; message?: string }> };
      setError(clerkError.errors?.[0]?.longMessage || clerkError.errors?.[0]?.message || 'Não foi possível iniciar a recuperação.');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setMode('login');
    setInvitationTicket('');
    setCode('');
    setNewPassword('');
    setError('');
    setMessage('');
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[#061a36] px-5 py-10">
      <div className="w-full max-w-[390px]">
        <div className="relative mx-auto w-full max-w-[360px] pt-16">
          <Link href="/" className="absolute left-1/2 top-0 z-10 flex h-28 w-28 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-[0.25px] border-white bg-white p-0.5 shadow-[0_12px_28px_rgba(0,0,0,.3)]" data-testid="link-login-logo">
            <img src={assetUrl(latestLoginLogoPath)} alt="Logo VG" width="112" height="112" className="h-full w-full object-contain" />
          </Link>
          <form onSubmit={submit} className="flex aspect-square flex-col justify-start rounded-full bg-[#f5f7fa] px-8 pb-8 pt-20 shadow-[0_20px_60px_rgba(0,0,0,.2)] ring-1 ring-white/35 ring-offset-8 ring-offset-[#061a36] sm:px-10">
          <div className="mb-4 text-center">
           <h1 className="font-display text-[1.45rem] font-semibold tracking-[-.04em] text-[#202f4d]">CRM de Marketing</h1>
              {mode !== 'login' && <p className="mt-1 text-[11px] text-[#7a8799]">{mode === 'client-trust-code' ? 'Digite o código enviado para confirmar este navegador.' : mode === 'reset-code' ? 'Digite o código enviado para seu e-mail.' : mode === 'invitation-password' ? 'Crie uma senha para concluir seu acesso.' : 'Cadastre uma nova senha.'}</p>}
          </div>
          <div className="mx-auto w-full max-w-[220px]">
          {mode === 'login' && <><label htmlFor="login-email" className="text-xs font-bold text-[#202f4d]">E-mail</label><input id="login-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#c3d1df] bg-white px-3 py-2 text-sm text-[#202f4d] outline-none focus:border-[#9fe4e5]" /><label htmlFor="login-password" className="mt-3 block text-xs font-bold text-[#202f4d]">Senha</label><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#c3d1df] bg-white px-3 py-2 text-sm text-[#202f4d] outline-none focus:border-[#9fe4e5]" /></>}
           {mode === 'client-trust-code' && <><label htmlFor="client-trust-code" className="text-xs font-bold text-[#202f4d]">Código de confirmação</label><input id="client-trust-code" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(event) => setCode(event.target.value)} placeholder="Digite o código" className="mt-1.5 w-full rounded-lg border border-[#c3d1df] bg-white px-3.5 py-2.5 text-sm text-[#202f4d] outline-none focus:border-[#9fe4e5]" /></>}
           {mode === 'reset-code' && <><label htmlFor="reset-code" className="text-xs font-bold text-[#202f4d]">Código de recuperação</label><input id="reset-code" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(event) => setCode(event.target.value)} placeholder="Digite o código" className="mt-1.5 w-full rounded-lg border border-[#c3d1df] bg-white px-3.5 py-2.5 text-sm text-[#202f4d] outline-none focus:border-[#9fe4e5]" /></>}
            {(mode === 'reset-password' || mode === 'invitation-password') && <><label htmlFor="new-password" className="text-xs font-bold text-[#202f4d]">Nova senha</label><input id="new-password" type="password" autoComplete="new-password" required minLength={12} pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}" title="Use pelo menos 12 caracteres, com maiúscula, minúscula, número e símbolo." value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="12+ caracteres, maiúscula, número e símbolo" className="mt-1.5 w-full rounded-lg border border-[#c3d1df] bg-white px-3.5 py-2.5 text-sm text-[#202f4d] outline-none focus:border-[#9fe4e5]" /></>}
          {error && <p role="alert" className="mt-4 rounded-lg border border-[#e4b1aa] bg-[#fff5f3] px-3 py-2 text-xs leading-5 text-[#9d4b43]">{error}</p>}
          {message && <p className="mt-4 rounded-lg border border-[#b8dddd] bg-[#eefafa] px-3 py-2 text-xs leading-5 text-[#276d70]">{message}</p>}
           {mode === 'login' ? <div className="mt-4 flex items-center justify-center gap-5"><button type="submit" disabled={loading || !isLoaded} className="rounded-lg bg-[#202f4d] px-4 py-2.5 text-xs font-extrabold text-white transition-colors hover:bg-[#58739f] disabled:cursor-wait disabled:opacity-60">{loading ? 'Aguarde...' : 'Entrar'}</button><button type="button" onClick={() => void recoverPassword()} className="text-right text-[11px] font-bold text-[#58739f] hover:text-[#202f4d]">Recuperar senha</button></div> : <button type="submit" disabled={loading || !isLoaded || (mode === 'invitation-password' && !signUpLoaded)} className="mt-4 w-full rounded-lg bg-[#202f4d] px-4 py-3 text-sm font-extrabold text-white transition-colors hover:bg-[#58739f] disabled:cursor-wait disabled:opacity-60">{loading ? 'Aguarde...' : mode === 'client-trust-code' || mode === 'reset-code' ? 'Validar código' : mode === 'invitation-password' ? 'Aceitar convite' : 'Salvar nova senha'}</button>}
          {mode !== 'login' && <button type="button" onClick={resetFlow} className="mt-4 w-full text-xs font-bold text-[#58739f]">Voltar para entrar</button>}
          </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function AdminPage() {
  const { signOut } = useClerk();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [selected, setSelected] = useState<CrmLead | null>(null);
  const [notes, setNotes] = useState<CrmNote[]>([]);
  const [activities, setActivities] = useState<CrmActivity[]>([]);
  const [summary, setSummary] = useState<Record<string, { count: number; label: string }>>({});
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');
  const [manualLeadOpen, setManualLeadOpen] = useState(false);
  const [manualLead, setManualLead] = useState<ManualLeadForm>({ name: '', email: '', whatsapp: '', company: '', service: '', message: '', source: 'manual' });
  const [savingLead, setSavingLead] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [teamMessage, setTeamMessage] = useState('');
  const [crmUser, setCrmUser] = useState<CrmUser | null>(null);
  const [team, setTeam] = useState<CrmUser[]>([]);
  const [pendingRoles, setPendingRoles] = useState<Record<number, CrmRole>>({});
  const [pendingAssignment, setPendingAssignment] = useState<number | null | undefined>(undefined);
  const [teamOpen, setTeamOpen] = useState(false);
  const [newTeamUser, setNewTeamUser] = useState({ email: '', name: '', role: 'operator' as CrmRole });

  const apiFetch = async (path: string, init: RequestInit = {}) => {
    const token = await getToken();
    const headers = new Headers(init.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
      credentials: 'include',
    });
  };

  const loadLeads = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search.trim()) query.set('search', search.trim());
      if (status) query.set('status', status);
      if (source) query.set('source', source);
      const [leadsResponse, summaryResponse] = await Promise.all([
        apiFetch(`/api/leads?${query.toString()}`),
        apiFetch('/api/leads/summary'),
      ]);
      if (!leadsResponse.ok || !summaryResponse.ok) throw new Error('load-failed');
      const leadsData = await leadsResponse.json() as { leads: CrmLead[] };
      const summaryData = await summaryResponse.json() as { summary: Record<string, { count: number; label: string }> };
      setLeads(leadsData.leads);
      setSummary(summaryData.summary);
      setError('');
    } catch {
      setError('Não foi possível carregar os leads. Verifique se a API está disponível.');
    } finally {
      setLoading(false);
    }
  };

  const loadAccess = async () => {
    const response = await apiFetch('/api/users/me');
    if (!response.ok) throw new Error('access-failed');
    const data = await response.json() as { user: CrmUser };
    setCrmUser(data.user);
    if (data.user.role === 'owner' || data.user.role === 'admin') {
      const usersResponse = await apiFetch('/api/users');
      if (usersResponse.ok) setTeam((await usersResponse.json() as { users: CrmUser[] }).users);
    } else if (data.user.role === 'manager') {
      const usersResponse = await apiFetch('/api/users/assignable');
      if (usersResponse.ok) setTeam((await usersResponse.json() as { users: CrmUser[] }).users);
    }
  };

  const saveTeamUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTeamMessage('');
    const response = await apiFetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTeamUser) });
    if (!response.ok) {
      setError((await response.json().catch(() => null) as { error?: string } | null)?.error || 'Não foi possível adicionar o usuário.');
      return;
    }
    setNewTeamUser({ email: '', name: '', role: 'operator' });
    setTeamMessage(`Convite enviado para ${newTeamUser.email}.`);
    const usersResponse = await apiFetch('/api/users');
    if (usersResponse.ok) setTeam((await usersResponse.json() as { users: CrmUser[] }).users);
  };

  const updateTeamUser = async (member: CrmUser, change: { role?: CrmRole; active?: boolean }) => {
    const response = await apiFetch(`/api/users/${member.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: change.role || member.role, active: change.active === undefined ? Boolean(member.active) : Boolean(change.active) }) });
    if (!response.ok) {
      setError((await response.json().catch(() => null) as { error?: string } | null)?.error || 'Não foi possível atualizar o usuário.');
      return;
    }
    setTeam((current) => current.map((item) => item.id === member.id ? { ...item, ...change, active: change.active === undefined ? item.active : change.active ? 1 : 0 } : item));
    if (change.role) {
      setPendingRoles((current) => {
        const next = { ...current };
        delete next[member.id];
        return next;
      });
    }
  };

  const deleteTeamUser = async (member: CrmUser) => {
    if (!window.confirm(`Excluir ${member.name} do CRM?`)) return;
    const response = await apiFetch(`/api/users/${member.id}`, { method: 'DELETE' });
    if (!response.ok) {
      setError((await response.json().catch(() => null) as { error?: string } | null)?.error || 'Não foi possível excluir o usuário.');
      return;
    }
    setTeam((current) => current.filter((item) => item.id !== member.id));
  };

  const manageableRoles: CrmRole[] = crmUser?.role === 'owner'
    ? ['owner', 'admin', 'manager', 'operator']
    : crmUser?.role === 'admin'
      ? ['manager', 'operator']
      : crmUser?.role === 'manager' ? ['operator'] : [];

  useEffect(() => {
    void Promise.all([loadLeads(), loadAccess()]).catch(() => setError('Não foi possível carregar seu acesso ao CRM.'));
  }, [search, status, source]);

  const openLead = async (lead: CrmLead) => {
    setSelected(lead);
    try {
      const response = await apiFetch(`/api/leads/${lead.id}`);
      if (!response.ok) throw new Error('detail-failed');
      const data = await response.json() as { lead: CrmLead; notes: CrmNote[]; activities: CrmActivity[] };
      setSelected(data.lead);
      setPendingAssignment(data.lead.assignedUserId);
      setNotes(data.notes);
      setActivities(data.activities);
    } catch {
      setError('Não foi possível abrir os detalhes deste lead.');
    }
  };

  const updateStatus = async (nextStatus: string, nextSource = selected?.source) => {
    if (!selected) return;
    const response = await apiFetch(`/api/leads/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus, source: nextSource }),
    });
    if (!response.ok) {
      setError('Não foi possível atualizar o status.');
      return;
    }
    const data = await response.json() as { lead: CrmLead };
    setSelected(data.lead);
    await loadLeads();
    await openLead(data.lead);
  };

  const updateAssignment = async (assignedUserId: number | null) => {
    if (!selected || !['owner', 'admin', 'manager'].includes(crmUser?.role || '')) return;
    const response = await apiFetch(`/api/leads/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: selected.status, source: selected.source, assignedUserId }),
    });
    if (!response.ok) {
      setError('Não foi possível alterar o consultor responsável.');
      return;
    }
    const data = await response.json() as { lead: CrmLead };
    setSelected(data.lead);
    setPendingAssignment(data.lead.assignedUserId);
    await loadLeads();
  };

  const addNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !note.trim()) return;
    const response = await apiFetch(`/api/leads/${selected.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: note.trim() }),
    });
    if (!response.ok) {
      setError('Não foi possível salvar a observação.');
      return;
    }
    setNote('');
    await openLead(selected);
  };

  const createManualLead = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingLead(true);
    try {
      const response = await apiFetch('/api/leads/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...manualLead,
          company: manualLead.company || null,
          service: manualLead.service || null,
          message: manualLead.message || null,
        }),
      });
      if (!response.ok) throw new Error('create-failed');
      const data = await response.json() as { lead: CrmLead };
      setManualLead({ name: '', email: '', whatsapp: '', company: '', service: '', message: '', source: 'manual' });
      setManualLeadOpen(false);
      await loadLeads();
      await openLead(data.lead);
    } catch {
      setError('Não foi possível cadastrar o lead. Confira os dados e tente novamente.');
    } finally {
      setSavingLead(false);
    }
  };

  const formatDate = (date: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));

  return (
    <div className="min-h-[100dvh] bg-[#eef2f6] text-[#202f4d]">
      <header className="bg-[#061a36] text-white shadow-[0_10px_35px_rgba(6,26,54,.16)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <Link href="/admin" className="flex items-center gap-3" data-testid="link-crm-brand">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white p-0.5 shadow-[0_0_0_1px_rgba(255,255,255,.25)]"><img src={assetUrl(crmLogoPath)} alt="Logo VG" width="44" height="44" className="h-full w-full rounded-full object-contain" /></span>
            <div><p className="font-display text-lg font-bold tracking-[-.02em]">CRM de Marketing</p></div>
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 border-r border-white/15 pr-4 sm:flex"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#9fe4e5] text-xs font-extrabold text-[#061a36]">{(user?.firstName || user?.primaryEmailAddress?.emailAddress || 'V').slice(0, 1).toUpperCase()}</span><span className="max-w-[180px] truncate text-xs text-slate-200">{user?.primaryEmailAddress?.emailAddress || user?.firstName || 'Equipe VG'}</span></div>
            <button type="button" onClick={() => signOut({ redirectUrl: `${basePath}/` })} className="rounded-lg border border-white/25 px-4 py-2 text-xs font-extrabold text-white transition-colors hover:border-[#9fe4e5] hover:text-[#9fe4e5]">Sair</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-12">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><div className="flex items-center gap-2 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]"><span className="h-2 w-2 rounded-full bg-[#9fe4e5]" /> visão geral</div><h1 className="mt-3 font-display text-4xl font-semibold tracking-[-.05em] sm:text-5xl">Oportunidades em movimento.</h1></div>
             <div className="flex flex-wrap gap-2">
              {(crmUser?.role === 'owner' || crmUser?.role === 'admin') && <button type="button" onClick={() => setTeamOpen(true)} className="flex w-fit items-center gap-2 rounded-lg border border-[#c3d1df] bg-white px-4 py-3 text-xs font-extrabold text-[#202f4d] transition-colors hover:border-[#58739f]"><UserCog className="h-3.5 w-3.5" /> Equipe</button>}
             <button type="button" onClick={() => setManualLeadOpen(true)} className="flex w-fit items-center gap-2 rounded-lg bg-[#202f4d] px-4 py-3 text-xs font-extrabold text-white shadow-[0_8px_18px_rgba(32,47,77,.16)] transition-all hover:-translate-y-0.5 hover:bg-[#58739f]"><Plus className="h-3.5 w-3.5" /> Novo lead</button>
             <button type="button" onClick={() => void loadLeads()} className="flex w-fit items-center gap-2 rounded-lg border border-[#c3d1df] bg-white px-4 py-3 text-xs font-extrabold text-[#202f4d] transition-colors hover:border-[#58739f]">Atualizar <ArrowRight className="h-3.5 w-3.5" /></button>
           </div>
         </div>
         <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
           {Object.entries(summary).map(([key, item]) => <button type="button" key={key} onClick={() => setStatus(status === key ? '' : key)} className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all ${status === key ? 'border-[#202f4d] bg-[#202f4d] text-white shadow-[0_10px_20px_rgba(32,47,77,.15)]' : 'border-[#d9e0e9] bg-white hover:-translate-y-0.5 hover:border-[#9fe4e5] hover:shadow-[0_8px_18px_rgba(32,47,77,.08)]'}`}><span className={`font-mono-vg text-[9px] uppercase tracking-[.12em] ${status === key ? 'text-[#9fe4e5]' : 'text-[#58739f]'}`}>{item.label}</span><strong className="mt-2 block font-display text-3xl tracking-[-.04em]">{item.count}</strong><span className={`absolute bottom-0 left-0 h-1 w-full ${status === key ? 'bg-[#9fe4e5]' : 'bg-[#e6edf4] group-hover:bg-[#9fe4e5]'}`} /></button>)}
         </div>
        {error && <p role="alert" className="mb-5 rounded-lg border border-[#e4b1aa] bg-[#fff5f3] px-4 py-3 text-sm font-semibold text-[#9d4b43]">{error}</p>}
         {teamOpen && <div className="mb-6 rounded-2xl border border-[#d9e0e9] bg-white p-6 shadow-[0_12px_30px_rgba(32,47,77,.05)]">
           <div className="flex items-start justify-between gap-4"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#58739f]">/ acesso corporativo</p><h2 className="mt-2 font-display text-2xl font-semibold">Equipe e permissões</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#56657d]">Cadastre, altere ou retire pessoas da equipe diretamente pelo CRM. A senha e a recuperação de acesso continuam protegidas.</p></div><button type="button" onClick={() => setTeamOpen(false)} aria-label="Fechar equipe" className="rounded-full border border-[#d9e0e9] p-2"><X className="h-4 w-4" /></button></div>
            {teamMessage && <p className="mt-5 rounded-lg border border-[#b8dddd] bg-[#eefafa] px-3 py-2 text-xs font-semibold text-[#276d70]">{teamMessage}</p>}
            <form onSubmit={saveTeamUser} className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
             <input required type="email" placeholder="E-mail" value={newTeamUser.email} onChange={(event) => setNewTeamUser({ ...newTeamUser, email: event.target.value })} className="rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2.5 text-sm outline-none lg:col-span-2" />
             <input required placeholder="Nome" value={newTeamUser.name} onChange={(event) => setNewTeamUser({ ...newTeamUser, name: event.target.value })} className="rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2.5 text-sm outline-none" />
             <div className="flex gap-2"><select value={newTeamUser.role} onChange={(event) => setNewTeamUser({ ...newTeamUser, role: event.target.value as CrmRole })} className="min-w-0 flex-1 rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2.5 text-sm outline-none">{manageableRoles.map((key) => <option key={key} value={key}>{CRM_ROLE_LABELS[key]}</option>)}</select><button type="submit" className="rounded-lg bg-[#202f4d] px-4 py-2.5 text-xs font-extrabold text-white">Adicionar</button></div>
           </form>
           <div className="mt-6 divide-y divide-[#edf1f5]">{team.map((member) => { const selectedRole = pendingRoles[member.id] || member.role; const roleChanged = selectedRole !== member.role; return <div key={member.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-full ${member.active ? 'bg-[#eef8f8] text-[#587f82]' : 'bg-[#f5f7fa] text-[#9caac0]'}`}><Shield className="h-4 w-4" /></span><div><p className="text-sm font-bold">{member.name}</p><p className="text-xs text-[#7a8799]">{member.email} · {CRM_ROLE_LABELS[member.role] || member.role} · {member.active ? 'Ativo' : 'Desativado'}</p></div></div><div className="flex flex-wrap justify-end gap-2"><select disabled={member.id === crmUser?.id || !manageableRoles.includes(member.role)} value={selectedRole} onChange={(event) => setPendingRoles({ ...pendingRoles, [member.id]: event.target.value as CrmRole })} className="rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2 text-xs font-bold">{manageableRoles.includes(member.role) ? manageableRoles.map((key) => <option key={key} value={key}>{CRM_ROLE_LABELS[key]}</option>) : <option value={member.role}>{CRM_ROLE_LABELS[member.role] || member.role}</option>}</select>{roleChanged && <button type="button" onClick={() => void updateTeamUser(member, { role: selectedRole })} className="rounded-lg bg-[#202f4d] px-3 py-2 text-xs font-extrabold text-white">Salvar</button>}<button type="button" disabled={member.id === crmUser?.id || !manageableRoles.includes(member.role)} onClick={() => void updateTeamUser(member, { active: !Boolean(member.active) })} className="rounded-lg border border-[#c3d1df] px-3 py-2 text-xs font-bold">{member.active ? 'Desativar' : 'Ativar'}</button><button type="button" disabled={member.id === crmUser?.id || !manageableRoles.includes(member.role)} onClick={() => void deleteTeamUser(member)} className="rounded-lg border border-[#e4b1aa] px-3 py-2 text-xs font-bold text-[#9d4b43]">Excluir</button></div></div>})}</div>
         </div>}
         {selected && ['owner', 'admin', 'manager'].includes(crmUser?.role || '') && <section className="mb-6 rounded-2xl border border-[#d9e0e9] bg-white p-5 shadow-[0_12px_30px_rgba(32,47,77,.05)]"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#58739f]">/ responsabilidade comercial</p><h2 className="mt-2 font-display text-xl font-semibold">Consultor responsável</h2><p className="mt-1 text-xs text-[#56657d]">Defina quem acompanha este lead. A alteração só será aplicada ao clicar em Salvar.</p></div><div className="flex w-full gap-2 sm:w-auto"><select value={pendingAssignment === undefined ? (selected.assignedUserId ?? '') : (pendingAssignment ?? '')} onChange={(event) => setPendingAssignment(event.target.value ? Number(event.target.value) : null)} className="min-w-0 flex-1 rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2.5 text-sm outline-none sm:w-64"><option value="">Sem consultor atribuído</option>{team.filter((member) => member.role === 'operator' && Boolean(member.active)).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select>{(pendingAssignment !== undefined && pendingAssignment !== selected.assignedUserId) && <button type="button" onClick={() => void updateAssignment(pendingAssignment)} className="rounded-lg bg-[#202f4d] px-4 py-2.5 text-xs font-extrabold text-white">Salvar</button>}</div></div></section>}
         <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
          <section className="overflow-hidden rounded-2xl border border-[#d9e0e9] bg-white shadow-[0_12px_30px_rgba(32,47,77,.05)]">
            <div className="flex items-center justify-between border-b border-[#d9e0e9] px-5 py-4"><div><p className="font-display text-lg font-semibold tracking-[-.02em]">Leads recentes</p><p className="mt-1 text-xs text-[#7a8799]">Selecione uma oportunidade para ver o contexto.</p></div><span className="hidden rounded-full bg-[#eef8f8] px-3 py-1.5 font-mono-vg text-[9px] uppercase tracking-[.12em] text-[#587f82] sm:block">{leads.length} encontrados</span></div>
            <div className="flex flex-col gap-3 border-b border-[#d9e0e9] bg-[#fbfcfd] p-4 sm:flex-row">
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, e-mail ou empresa" className="min-w-0 flex-1 rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3.5 py-3 text-sm outline-none focus:border-[#58739f]" />
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3.5 py-3 text-sm outline-none focus:border-[#58739f]"><option value="">Todos os status</option>{Object.entries(CRM_STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
              <select value={source} onChange={(event) => setSource(event.target.value)} className="rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3.5 py-3 text-sm outline-none focus:border-[#58739f]"><option value="">Todas as origens</option>{CRM_SOURCE_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
            </div>
             {loading ? <p className="p-8 text-sm text-[#56657d]">Carregando leads...</p> : leads.length === 0 ? <div className="p-10 text-center"><p className="font-display text-xl font-semibold">Nenhum lead encontrado.</p><p className="mt-2 text-sm text-[#56657d]">Os novos contatos do site aparecerão aqui.</p></div> : <div className="divide-y divide-[#edf1f5]">{leads.map((lead) => <button type="button" key={lead.id} onClick={() => void openLead(lead)} className={`flex w-full items-start justify-between gap-4 p-5 text-left transition-colors hover:bg-[#f5f7fa] ${selected?.id === lead.id ? 'bg-[#eef8f8]' : ''}`}><div className="min-w-0"><p className="truncate font-bold">{lead.name}</p><p className="mt-1 truncate text-sm text-[#56657d]">{lead.company || lead.email}</p><p className="mt-2 text-[11px] text-[#9caac0]">{lead.service ? serviceBySlug(lead.service)?.label || lead.service : 'Serviço não informado'} · {formatDate(lead.createdAt)}</p></div><div className="flex shrink-0 flex-wrap justify-end gap-1.5"><span className="rounded-full bg-[#e6edf4] px-2.5 py-1 text-[10px] font-extrabold text-[#58739f]">{CRM_STATUS_LABELS[lead.status] || lead.status}</span><span className="rounded-full bg-[#eef8f8] px-2.5 py-1 text-[10px] font-extrabold text-[#587f82]">{CRM_SOURCE_LABELS[lead.source] || lead.source}</span></div></button>)}</div>}
          </section>
          <aside className="rounded-2xl border border-[#d9e0e9] bg-[#202f4d] p-6 text-white shadow-[0_12px_30px_rgba(32,47,77,.14)]">
             {!selected ? <div className="flex min-h-[360px] flex-col justify-center"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#9fe4e5] text-[#202f4d]"><BarChart3 className="h-5 w-5" /></div><p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#9fe4e5]">/ detalhe do lead</p><h2 className="mt-3 font-display text-3xl font-semibold">Selecione uma oportunidade.</h2><p className="mt-3 text-sm leading-6 text-slate-300">Veja o contexto, atualize o momento comercial e registre tudo que importa.</p></div> : <div><div className="flex items-start justify-between gap-3"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#9fe4e5]">/ lead #{selected.id}</p><h2 className="mt-3 font-display text-3xl font-semibold">{selected.name}</h2><div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold text-[#9fe4e5]">{CRM_STATUS_LABELS[selected.status] || selected.status}</span><span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-extrabold text-slate-300">{CRM_SOURCE_LABELS[selected.source] || selected.source}</span></div></div><button type="button" onClick={() => setSelected(null)} aria-label="Fechar detalhes" className="rounded-full border border-white/20 p-2 text-slate-300 hover:border-[#9fe4e5] hover:text-[#9fe4e5]"><X className="h-4 w-4" /></button></div><div className="mt-6 space-y-2 border-y border-white/10 py-5 text-sm"><p className="text-slate-300">{selected.company || 'Empresa não informada'}</p><a href={`mailto:${selected.email}`} className="block text-[#9fe4e5]">{selected.email}</a><a href={`tel:${selected.whatsapp}`} className="block text-[#9fe4e5]">{selected.whatsapp}</a><p className="pt-2 text-xs text-slate-400">{selected.service ? serviceBySlug(selected.service)?.label || selected.service : 'Serviço não informado'}</p></div><label className="mt-5 block text-[10px] font-extrabold uppercase tracking-[.15em] text-[#9fe4e5]">Status<select value={selected.status} onChange={(event) => void updateStatus(event.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-[#263758] px-3 py-3 text-sm font-semibold normal-case tracking-normal text-white outline-none"><option value="new">Novo</option><option value="contacted">Contato iniciado</option><option value="meeting">Reunião agendada</option><option value="proposal">Proposta enviada</option><option value="won">Ganho</option><option value="lost">Perdido</option></select></label><label className="mt-4 block text-[10px] font-extrabold uppercase tracking-[.15em] text-[#9fe4e5]">Origem<select value={selected.source} onChange={(event) => void updateStatus(selected.status, event.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-[#263758] px-3 py-3 text-sm font-semibold normal-case tracking-normal text-white outline-none">{CRM_SOURCE_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>{selected.message && <div className="mt-5 rounded-lg bg-white/5 p-4 text-sm leading-6 text-slate-300"><p className="mb-2 font-mono-vg text-[9px] uppercase tracking-[.16em] text-slate-500">Mensagem</p>{selected.message}</div>}<form onSubmit={addNote} className="mt-6"><label htmlFor="crm-note" className="font-mono-vg text-[10px] uppercase tracking-[.16em] text-[#9fe4e5]">Nova observação</label><textarea id="crm-note" value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Registre o próximo passo..." className="mt-2 w-full resize-none rounded-lg border border-white/15 bg-[#263758] px-3 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#9fe4e5]" /><button type="submit" className="mt-2 rounded-lg bg-[#9fe4e5] px-4 py-2.5 text-xs font-extrabold text-[#202f4d]">Salvar observação</button></form>{notes.length > 0 && <div className="mt-6 border-t border-white/10 pt-5"><p className="font-mono-vg text-[10px] uppercase tracking-[.16em] text-[#9fe4e5]">Observações</p>{notes.map((item) => <div key={item.id} className="mt-3 border-l-2 border-[#9fe4e5] pl-3 text-sm leading-6 text-slate-300"><p>{item.body}</p><p className="mt-1 text-[10px] text-slate-500">{formatDate(item.createdAt)}</p></div>)}</div>}{activities.length > 0 && <div className="mt-6 border-t border-white/10 pt-5"><p className="font-mono-vg text-[10px] uppercase tracking-[.16em] text-slate-500">Histórico</p>{activities.slice(0, 5).map((item) => <p key={item.id} className="mt-2 text-xs text-slate-400">{item.detail} · {formatDate(item.createdAt)}</p>)}</div>}</div>}
          </aside>
         </div>
         {manualLeadOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#061a36]/70 px-5 py-8" role="dialog" aria-modal="true" aria-labelledby="new-lead-title">
           <form onSubmit={createManualLead} className="max-h-[calc(100dvh-4rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
             <div className="flex items-start justify-between gap-4"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#58739f]">/ cadastro manual</p><h2 id="new-lead-title" className="mt-2 font-display text-3xl font-semibold tracking-[-.04em] text-[#202f4d]">Novo lead.</h2><p className="mt-2 text-sm text-[#56657d]">Registre uma oportunidade que chegou por outro canal.</p></div><button type="button" onClick={() => setManualLeadOpen(false)} aria-label="Fechar cadastro" className="rounded-full border border-[#d9e0e9] p-2 text-[#56657d] hover:border-[#202f4d]"><X className="h-4 w-4" /></button></div>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
               <label className="text-xs font-bold text-[#202f4d]">Nome<input required value={manualLead.name} onChange={(event) => setManualLead({ ...manualLead, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#58739f]" /></label>
               <label className="text-xs font-bold text-[#202f4d]">WhatsApp<input required value={manualLead.whatsapp} onChange={(event) => setManualLead({ ...manualLead, whatsapp: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#58739f]" /></label>
               <label className="text-xs font-bold text-[#202f4d]">E-mail<input required type="email" value={manualLead.email} onChange={(event) => setManualLead({ ...manualLead, email: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#58739f]" /></label>
               <label className="text-xs font-bold text-[#202f4d]">Empresa<input value={manualLead.company} onChange={(event) => setManualLead({ ...manualLead, company: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#58739f]" /></label>
               <label className="text-xs font-bold text-[#202f4d] sm:col-span-2">Serviço de interesse<select value={manualLead.service} onChange={(event) => setManualLead({ ...manualLead, service: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#58739f]"><option value="">Não informado</option>{SERVICES.map((service) => <option key={service.slug} value={service.slug}>{service.label}</option>)}</select></label>
                <label className="text-xs font-bold text-[#202f4d] sm:col-span-2">Origem do lead<select value={manualLead.source} onChange={(event) => setManualLead({ ...manualLead, source: event.target.value as CrmSource })} className="mt-1.5 w-full rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#58739f]">{CRM_SOURCE_OPTIONS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
               <label className="text-xs font-bold text-[#202f4d] sm:col-span-2">Contexto inicial<textarea value={manualLead.message} onChange={(event) => setManualLead({ ...manualLead, message: event.target.value })} rows={3} className="mt-1.5 w-full resize-none rounded-lg border border-[#c3d1df] bg-[#f5f7fa] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#58739f]" /></label>
             </div>
             <div className="mt-7 flex justify-end gap-3"><button type="button" onClick={() => setManualLeadOpen(false)} className="rounded-lg border border-[#c3d1df] px-4 py-3 text-xs font-extrabold text-[#202f4d]">Cancelar</button><button type="submit" disabled={savingLead} className="rounded-lg bg-[#202f4d] px-5 py-3 text-xs font-extrabold text-white hover:bg-[#58739f] disabled:opacity-60">{savingLead ? 'Salvando...' : 'Cadastrar lead'}</button></div>
           </form>
         </div>}
      </main>
    </div>
  );
}

function ProtectedAdmin() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <div className="flex min-h-[100dvh] items-center justify-center bg-[#071c2a] text-sm text-slate-300">Carregando acesso...</div>;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return <AdminPage />;
}

function PageIntro({ label, title, text }: { label: string; title: ReactNode; text: string }) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-36 lg:px-10 lg:pb-24 lg:pt-48">
      <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
        <div className="reveal">
          <p className="mb-5 flex items-center gap-3 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]"><span className="h-px w-8 bg-[#9fe4e5]" />{label}</p>
          <h1 className="max-w-4xl whitespace-pre-line font-display text-5xl font-semibold leading-[.98] tracking-[-.045em] text-white sm:text-7xl lg:text-[6.5rem]">{title}</h1>
        </div>
        <p className="reveal reveal-delay-2 max-w-md text-base leading-8 text-slate-300 lg:justify-self-end">{text}</p>
      </div>
    </div>
  );
}

function DarkSectionHeading({ eyebrow, title, light = false }: { eyebrow: string; title: ReactNode; light?: boolean }) {
  return (
    <div className="mb-12">
      <p className={`mb-4 font-mono-vg text-[10px] uppercase tracking-[.2em] ${light ? 'text-[#9fe4e5]' : 'text-[#58739f]'}`}>{eyebrow}</p>
      <h2 className={`max-w-3xl font-display text-4xl font-semibold leading-[1.04] tracking-[-.035em] sm:text-5xl ${light ? 'text-white' : 'text-[#202f4d]'}`}>{title}</h2>
    </div>
  );
}

function Home() {
  usePageMeta(
    'Consultoria de Marketing em Fortaleza',
    'Consultoria de marketing em Fortaleza para empresas que buscam clareza, estratégia e crescimento. Marca, tráfego, processos e pessoas trabalhando juntos.',
  );
  const vgSystem = [
    { number: '01', label: 'Demanda', title: 'Atrair o que faz sentido.', text: 'Criamos movimento comercial com posicionamento, mídia e conteúdo orientados ao negócio.', tone: 'bg-[#c88982]', textTone: 'text-[#202f4d]' },
    { number: '02', label: 'Sistemas', title: 'Conectar as ferramentas.', text: 'Organizamos site, CRM, dados e canais para o marketing não depender de improviso.', tone: 'bg-[#d7bd91]', textTone: 'text-[#202f4d]' },
    { number: '03', label: 'Processos', title: 'Fazer acontecer melhor.', text: 'Estruturamos rotinas, prioridades e indicadores para transformar esforço em consistência.', tone: 'bg-[#9fd6d7]', textTone: 'text-[#202f4d]' },
    { number: '04', label: 'Pessoas', title: 'Dar direção ao time.', text: 'Selecionamos, treinamos e lideramos as pessoas certas para o próximo estágio.', tone: 'bg-[#202f4d]', textTone: 'text-white' },
  ];
  return (
    <div className="site-shell art-directed overflow-hidden">
      <section className="home-hero relative min-h-[760px] bg-[#202f4d] text-white lg:min-h-[900px]">
        <div className="absolute inset-0 bg-grid-dark opacity-60" />
        <div className="pointer-events-none absolute -left-32 top-48 h-80 w-80 rounded-full bg-[#58739f]/20 blur-3xl" />
        <div className="pointer-events-none absolute right-[-6rem] top-64 h-96 w-96 rounded-full bg-[#9fe4e5]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-5rem] left-[42%] h-48 w-48 rounded-full bg-[#c88982]/10 blur-3xl" />
        <div className="absolute -right-40 top-32 h-[480px] w-[480px] rounded-full border border-[#b8d9da]/12 lg:h-[720px] lg:w-[720px]" />
        <div className="absolute -right-16 top-48 h-[330px] w-[330px] rounded-full border border-[#b8d9da]/16 lg:h-[520px] lg:w-[520px]" />
        <Header />
        <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-5 pb-20 pt-32 lg:min-h-[900px] lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10 lg:pt-36">
          <div className="max-w-4xl">
            <div className="reveal mb-8 flex items-center gap-3 font-mono-vg text-[10px] uppercase tracking-[.22em] text-[#b8d9da]"><span className="h-2 w-2 rounded-full bg-[#b8d9da]" /> Consultoria de marketing para o próximo passo</div>
            <h1 className="reveal reveal-delay-1 max-w-5xl font-display text-6xl font-semibold leading-[.91] tracking-[-.055em] sm:text-8xl lg:text-[8.4rem]">Clareza para<br /><span className="text-[#b8d9da]">crescer.</span></h1>
            <div className="reveal reveal-delay-2 mt-10 flex max-w-xl flex-col gap-8 sm:flex-row sm:items-end">
              <p className="text-base leading-7 text-slate-300">A VG Marketing, consultoria de marketing em Fortaleza, transforma estratégia em movimento: decisões melhores, execução possível e crescimento que faz sentido para o seu negócio.</p>
              <Link href="/#contato" data-testid="link-hero-cta" className="button-lift flex shrink-0 items-center gap-2 rounded-lg bg-[#9fe4e5] px-5 py-3.5 text-sm font-extrabold text-[#202f4d]">Começar conversa <ArrowDownRight className="h-4 w-4" /></Link>
            </div>
          </div>
          <div id="contato" className="reveal reveal-delay-2 w-full max-w-xl justify-self-end">
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9e0e9] bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[.7fr_1.3fr] lg:px-10 lg:py-24">
          <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ por que a VG</p>
          <div>
            <h2 className="max-w-3xl font-display text-4xl font-semibold leading-[1.06] tracking-[-.04em] text-[#202f4d] sm:text-6xl">O marketing não precisa de mais barulho. Precisa de <span className="text-[#58739f]">direção.</span></h2>
            <p className="mt-8 max-w-2xl text-base leading-8 text-[#56657d]">Somos uma parceira para momentos em que crescer exige mais do que uma boa ideia. Entramos para organizar o pensamento, dar ritmo à execução e tornar o avanço visível.</p>
            <div className="mt-12 grid gap-4 sm:grid-cols-[.78fr_1.22fr]">
              <div className="rounded-2xl border border-[#d6dee8] bg-white p-5 sm:p-6">
                <p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#58739f]">/ o jeito VG</p>
                <div className="mt-7 space-y-5">
                  {[
                    ['01', 'Clareza', 'O que importa agora.'],
                    ['02', 'Ritmo', 'Quem faz, como e quando.'],
                    ['03', 'Avanço', 'O que mudou de verdade.'],
                  ].map(([number, title, text]) => (
                    <div key={number} className="flex items-start gap-3 border-t border-[#e1e6ed] pt-4 first:border-0 first:pt-0">
                      <span className="font-mono-vg text-[10px] tracking-[.15em] text-[#9caac0]">{number}</span>
                      <div><p className="font-display text-lg font-semibold leading-none text-[#202f4d]">{title}</p><p className="mt-1.5 text-xs leading-5 text-[#718096]">{text}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative min-h-[330px] overflow-hidden rounded-2xl bg-[#202f4d] p-5 text-white sm:min-h-[350px] sm:p-6">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(159,228,229,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(159,228,229,.3) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border border-[#9fe4e5]/20" />
                <div className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full border border-[#9fe4e5]/15" />
                <p className="relative z-10 font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#9fe4e5]">/ método em movimento</p>
                <div className="absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                  <LogoMark className="h-[76px] w-[76px] border-[#9fe4e5]/70 bg-[#9fe4e5]/15 shadow-[0_0_0_10px_rgba(159,228,229,.07),0_0_0_22px_rgba(159,228,229,.04)]" />
                  <span className="mt-3 font-mono-vg text-[9px] uppercase tracking-[.18em] text-[#9fe4e5]">VG / método</span>
                </div>
                <div className="absolute left-[19%] top-1/2 h-px w-[27%] bg-[#9fe4e5]/35" />
                <div className="absolute right-[19%] top-1/2 h-px w-[27%] bg-[#9fe4e5]/35" />
                <div className="absolute left-1/2 top-[24%] h-[26%] w-px bg-[#9fe4e5]/35" />
                <div className="absolute bottom-[24%] left-1/2 h-[26%] w-px bg-[#9fe4e5]/35" />
                {[
                  ['01', 'Visão', 'Ler o cenário', 'left-5 top-16 sm:left-8 sm:top-20'],
                  ['02', 'Pessoas', 'Dar direção', 'right-5 top-16 text-right sm:right-8 sm:top-20'],
                  ['03', 'Execução', 'Fazer acontecer', 'bottom-16 left-5 sm:bottom-20 sm:left-8'],
                  ['04', 'Avanço', 'Medir a mudança', 'bottom-16 right-5 text-right sm:bottom-20 sm:right-8'],
                ].map(([number, title, text, position]) => (
                  <div key={number} className={`absolute z-10 ${position}`}>
                    <p className="font-mono-vg text-[9px] tracking-[.16em] text-[#9fe4e5]/65">{number}</p>
                    <p className="mt-1 font-display text-base font-semibold text-white sm:text-lg">{title}</p>
                    <p className="mt-1 text-[10px] text-slate-300 sm:text-xs">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="servicos" className="bg-[#f5f7fa]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <DarkSectionHeading eyebrow="/ como atuamos" title={<>O sistema VG organiza o marketing para o negócio <span className="text-[#58739f]">avançar.</span></>} />
            <p className="max-w-xs text-sm leading-6 text-[#56657d]">Quatro frentes conectadas para transformar demanda em operação, e operação em crescimento.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {vgSystem.map((pillar) => (
              <article key={pillar.label} className={`system-card group relative flex min-h-[310px] flex-col justify-between overflow-hidden rounded-2xl p-6 ${pillar.tone} ${pillar.textTone}`}>
                <div className="relative z-10 flex items-start justify-between"><span className="font-mono-vg text-[10px] tracking-[.15em] opacity-70">{pillar.number} / {pillar.label}</span><ArrowUpRightIcon className="h-4 w-4 opacity-70 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
                <div className="relative z-10"><h3 className="max-w-[12rem] font-display text-3xl font-semibold leading-[.98] tracking-[-.035em]">{pillar.title}</h3><p className="mt-4 max-w-[15rem] text-sm leading-6 opacity-80">{pillar.text}</p></div>
                <div className="absolute -bottom-20 -right-16 h-52 w-52 rounded-full border border-current/15 transition-transform duration-500 group-hover:scale-125" />
                <div className="absolute -bottom-12 -right-8 h-32 w-32 rounded-full border border-current/10" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="sobre" className="bg-[#202f4d] text-white">
        <div className="mx-auto grid max-w-7xl gap-16 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-28">
          <div className="relative">
            <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ nosso jeito</p>
            <div className="mt-12 flex items-center gap-4"><div className="h-px w-16 bg-[#9fe4e5]" /><span className="text-xs uppercase tracking-[.18em] text-slate-400">Da pergunta à prática</span></div>
            <div className="relative mt-12 h-48 w-48"><div className="absolute inset-0 rounded-full border border-[#9fe4e5]/30" /><div className="absolute inset-6 rounded-full border border-[#9fe4e5]/20" /><LogoMark className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2" /></div>
          </div>
          <div>
            <h2 className="font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] sm:text-6xl">A gente não chega com um pacote.<br /><span className="text-[#9fe4e5]">Chega com perguntas.</span></h2>
            <p className="mt-9 max-w-2xl text-base leading-8 text-slate-300">Antes de propor qualquer solução, entendemos o que está por trás do desafio: o momento da empresa, as pessoas, a oferta, a operação e os sinais que já existem. É assim que o marketing deixa de ser uma lista de tarefas e passa a criar valor de verdade.</p>
            <div className="mt-12 grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-3">
              {['Contexto antes de canal', 'Critério antes de velocidade', 'Aprendizado antes de escala'].map((item, index) => <div key={item}><span className="font-mono-vg text-[10px] text-[#9fe4e5]">0{index + 1}</span><p className="mt-3 text-sm font-bold leading-6 text-white">{item}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e6edf4]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1.2fr] lg:px-10 lg:py-28">
          <DarkSectionHeading eyebrow="/ o que muda" title={<>Mais do que fazer marketing. <span className="text-[#58739f]">Fazer sentido.</span></>} />
          <div className="grid gap-8 sm:grid-cols-2">
            {[{ icon: Compass, title: 'Direção', text: 'Uma visão compartilhada do que importa agora — e do que pode esperar.' }, { icon: Target, title: 'Foco', text: 'Prioridades que respeitam a capacidade real do time e o momento do negócio.' }, { icon: BarChart3, title: 'Evidência', text: 'Indicadores para aprender, corrigir a rota e defender boas decisões.' }, { icon: Zap, title: 'Ritmo', text: 'Uma cadência de execução que tira a estratégia do documento.' }].map(({ icon: Icon, title, text }) => <div key={title} className="border-t border-[#b8c6d7] pt-5"><Icon className="h-5 w-5 text-[#58739f]" /><h3 className="mt-5 font-display text-2xl font-semibold text-[#202f4d]">{title}</h3><p className="mt-3 text-sm leading-6 text-[#56657d]">{text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#f5f7fa]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
          <div className="mb-12 flex items-center justify-between"><DarkSectionHeading eyebrow="/ sinais de confiança" title="Crescimento bom deixa pistas." /><span className="hidden font-mono-vg text-[10px] uppercase tracking-[.16em] text-[#9caac0] sm:block">VG / evidências</span></div>
          <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
            <div className="rounded-2xl bg-[#dce7f0] p-7 sm:p-10"><Quote className="h-7 w-7 text-[#58739f]" /><p className="mt-10 max-w-2xl font-display text-2xl font-medium leading-[1.2] tracking-[-.025em] text-[#202f4d] sm:text-3xl">“A VG criou o nome da minha empresa, ajustou as campanhas, o processo comercial e posso dizer que fez toda diferença para que hoje pudéssemos colher os resultados.”</p><div className="mt-12 flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#202f4d] text-xs font-bold text-[#9fe4e5]">SN</div><div><p className="text-xs font-bold text-[#202f4d]">Samyr Nobre</p><p className="text-[11px] text-[#69778d]">Sócio-proprietário, Profix Portas Automáticas</p></div></div></div>
            <div className="flex flex-col justify-between rounded-2xl bg-[#202f4d] p-7 text-white sm:p-10"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#9fe4e5]">uma métrica que importa</p><p className="mt-8 font-display text-7xl font-semibold tracking-[-.06em] text-[#9fe4e5]">+2,4x</p><p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">mais oportunidades qualificadas após alinhar posicionamento, conteúdo e mídia.</p></div><div className="mt-12 flex justify-end border-t border-white/15 pt-5"><ArrowUpRightIcon /></div></div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ArrowUpRightIcon({ className = '' }: { className?: string }) {
  return <MoveUpRight className={`h-4 w-4 text-[#9fe4e5] ${className}`} />;
}

function ContactBand() {
  return (
    <section id="contato" className="bg-[#202f4d]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 lg:px-10 lg:py-28">
        <div className="flex flex-col justify-between">
          <div><p className="mb-5 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ próximo movimento</p><h2 className="max-w-lg font-display text-5xl font-semibold leading-[.98] tracking-[-.045em] text-white sm:text-6xl">Vamos tirar essa ideia do lugar?</h2><p className="mt-7 max-w-sm text-base leading-7 text-slate-300">Um bom projeto começa com uma conversa honesta sobre o que está acontecendo agora.</p></div>
          <div className="mt-12 hidden items-center gap-3 text-xs text-slate-400 sm:flex"><Play className="h-4 w-4 fill-[#9fe4e5] text-[#9fe4e5]" /> 30 minutos para organizar o pensamento</div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

function AboutPage() {
  usePageMeta('Sobre a VG Consultoria em Marketing', 'Conheça a VG Consultoria em Marketing, parceira estratégica de empresas que buscam crescimento com clareza, estrutura e autonomia.');
  return (
    <div className="site-shell art-directed overflow-hidden">
      <section className="relative bg-[#202f4d] text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-50" />
        <Header />
        <PageIntro
          label="Sobre a VG / quem somos"
          title={<>Consultoria de marketing com<br /><span className="text-[#9fe4e5]">direção e intenção.</span></>}
          text="Uma parceira estratégica para pequenas e médias empresas que querem crescer com mais clareza, estrutura e autonomia."
        />
      </section>

      <section className="relative overflow-hidden bg-[#f5f7fa]">
        <div className="pointer-events-none absolute -right-16 top-16 h-64 w-64 rounded-full border-[38px] border-[#d7bd91]/25" />
        <div className="pointer-events-none absolute bottom-12 left-[-2.5rem] h-32 w-32 rounded-full bg-[#b8d9da]/30 blur-sm" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.65fr_1.35fr] lg:px-10 lg:py-28">
          <div>
            <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ nosso propósito</p>
            <div className="relative mt-10 h-24 w-24 rounded-full border border-[#58739f]/30 p-3">
              <LogoMark className="h-full w-full" />
              <span className="absolute -right-7 top-5 h-3 w-3 rounded-full bg-[#c88982]" />
              <span className="absolute -bottom-3 left-8 h-2.5 w-2.5 rounded-full bg-[#d7bd91]" />
            </div>
          </div>
          <div className="max-w-3xl">
            <p className="font-display text-3xl font-medium leading-[1.18] tracking-[-.03em] text-[#202f4d] sm:text-5xl">
              A VG Consultoria em Marketing nasceu com um propósito claro: tirar empresas da dependência de agências genéricas e construir estratégias reais de crescimento, com estrutura, clareza e autonomia.
            </p>
            <div className="mt-10 space-y-6 text-base leading-8 text-[#56657d]">
              <p>Atuamos a partir de Fortaleza, no Ceará, como braço estratégico para pequenas e médias empresas de todo o Brasil que querem profissionalizar sua presença no digital e transformar marketing em resultado, não em ruído.</p>
              <p>Nosso diferencial está na proximidade: entendemos o seu negócio de verdade, imergimos na operação e entregamos não só o que funciona, mas o que faz sentido para a sua realidade.</p>
              <p>Mais do que uma consultoria, somos uma parceira de crescimento. Estratégia, execução e acompanhamento andam juntos aqui. Porque crescer com marketing não é sobre fórmulas prontas. É sobre direção certa, equipe bem treinada e cada ação feita com intenção.</p>
            </div>
          </div>
        </div>
      </section>

      <ContactBand />
      <Footer />
    </div>
  );
}

function PaidTrafficPage({ service }: { service: Service }) {
  const [openBullet, setOpenBullet] = useState<number | null>(null);
  usePageMeta(
    'Consultoria de Tráfego Pago',
    'Consultoria de tráfego pago para atrair leads qualificados, organizar o atendimento, aumentar conversões e escalar resultados com estratégia.',
  );
  return (
    <div className="site-shell art-directed overflow-hidden">
      <section className="relative isolate min-h-[780px] overflow-hidden bg-[#202f4d] text-white lg:min-h-[850px]">
        <div className="absolute inset-0 bg-grid-dark opacity-50" />
        <div className="traffic-grid absolute inset-0 opacity-70" />
        <div className="traffic-hero-glow absolute inset-0" />
        <Header />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-36 lg:min-h-[850px] lg:grid-cols-[1.02fr_.98fr] lg:gap-20 lg:px-10 lg:pt-32">
          <div className="reveal">
            <p className="mb-6 flex items-center gap-3 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">
              <span className="h-2 w-2 rounded-full bg-[#9fe4e5]" /> Consultoria para campanhas de alta conversão
            </p>
            <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-[6.4rem]">
              Tráfego pago que não termina no <span className="text-[#9fe4e5]">clique.</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              A VG conecta campanhas, canais de aquisição, atendimento comercial, scripts, CRM e mensuração para transformar mídia paga em vendas.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#contato" data-testid="link-paid-hero-cta" className="button-lift flex w-fit items-center gap-2 rounded-lg bg-[#9fe4e5] px-5 py-3.5 text-sm font-extrabold text-[#202f4d]">
                Quero organizar minha aquisição <ArrowDownRight className="h-4 w-4" />
              </a>
              <a href="#como-funciona" data-testid="link-paid-hero-secondary" className="flex w-fit items-center gap-2 rounded-lg border border-white/20 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:border-[#9fe4e5] hover:text-[#9fe4e5]">
                Ver como funciona <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-400">Conversa inicial para entender o cenário. Sem obrigação de contratação.</p>
          </div>

          <div className="reveal reveal-delay-2 relative mx-auto w-full max-w-[510px]" aria-label="Visão da operação de aquisição">
            <div className="absolute -inset-5 rounded-[2rem] border border-[#9fe4e5]/10" />
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#263758]/90 p-5 shadow-2xl backdrop-blur-sm sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="font-mono-vg text-[10px] uppercase tracking-[.17em] text-[#9fe4e5]">A operação completa</p>
                  <p className="mt-2 text-sm font-semibold text-white">Da atração à conversão</p>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9fe4e5]/40 text-[#9fe4e5]"><Crosshair className="h-4 w-4" /></div>
              </div>
              <div className="relative mt-7 space-y-3">
                {[
                  { label: 'Atrair', text: 'Campanhas e canais de aquisição', icon: Target, active: true },
                  { label: 'Atender', text: 'Fluxo, responsáveis e scripts', icon: Compass, active: false },
                  { label: 'Converter', text: 'Processo comercial preparado', icon: BarChart3, active: false },
                  { label: 'Escalar', text: 'Integrações e mensuração', icon: Zap, active: false },
                ].map(({ label, text, icon: Icon, active }, index) => (
                  <div key={label} className="traffic-node relative z-10 flex items-center gap-4 rounded-xl border border-white/10 bg-[#1e2d4a]/80 p-3.5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-[#9fe4e5] text-[#202f4d]' : 'bg-white/10 text-[#9fe4e5]'}`}><Icon className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1"><p className="text-sm font-bold text-white">{label}</p><p className="mt-0.5 truncate text-xs text-slate-400">{text}</p></div>
                    <span className="font-mono-vg text-[10px] text-slate-500">0{index + 1}</span>
                  </div>
                ))}
                <div className="absolute left-[1.45rem] top-12 h-[calc(100%-6rem)] w-px bg-[#9fe4e5]/25" />
              </div>
              <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                <span className="font-mono-vg text-[10px] uppercase tracking-[.15em] text-slate-500">VG / sistema de crescimento</span>
                <span className="flex items-center gap-2 text-xs font-semibold text-[#9fe4e5]"><span className="h-1.5 w-1.5 rounded-full bg-[#9fe4e5]" /> conectado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9e0e9] bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[.55fr_1.45fr] lg:px-10 lg:py-24">
          <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ para quem é</p>
          <div>
            <h2 className="max-w-4xl font-display text-4xl font-semibold leading-[1.04] tracking-[-.04em] text-[#202f4d] sm:text-6xl">
              Para quem a mídia já existe, mas a conversão ainda <span className="text-[#58739f]">não acompanha.</span>
            </h2>
            <div className="mt-12 grid gap-0 border-t border-[#b8c6d7] sm:grid-cols-2">
              {[
                'Empresas que investem em mídia, mas não convertem com consistência.',
                'Times com desorganização no atendimento ou pouca clareza sobre o próximo contato.',
                'Negócios que precisam alinhar marketing e vendas para aproveitar melhor cada lead.',
                'Lideranças que buscam ROI com estrutura, não apenas impulsionamento.',
              ].map((item, index) => (
                <div key={item} className={`flex gap-4 border-b border-[#d9e0e9] py-5 ${index % 2 === 0 ? 'sm:mr-6' : 'sm:ml-6'}`}>
                  <span className="font-mono-vg text-[10px] text-[#58739f]">0{index + 1}</span>
                  <p className="max-w-sm text-sm font-semibold leading-6 text-[#202f4d]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e6edf4]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-28">
          <div>
            <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o problema que resolvemos</p>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Clique é começo.<br /><span className="text-[#58739f]">Conversão é sistema.</span></h2>
          </div>
          <div className="rounded-2xl border border-[#c3d1df] bg-[#f5f7fa] p-7 sm:p-10">
            <p className="font-display text-2xl font-medium leading-[1.2] tracking-[-.02em] text-[#202f4d] sm:text-3xl">Campanha bem configurada não compensa uma operação que não sabe receber o lead.</p>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#56657d]">Por isso, o trabalho não para no gerenciador de anúncios. Organizamos os pontos que vêm depois da atração: canais, atendimento, scripts, sistemas e mensuração.</p>
            <div className="mt-8 flex items-center gap-3 border-t border-[#d9e0e9] pt-6"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#202f4d] text-[#9fe4e5]"><Crosshair className="h-4 w-4" /></div><p className="text-sm font-bold text-[#202f4d]">Uma visão única do caminho do lead.</p></div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[.72fr_1.28fr] lg:px-10 lg:py-28">
          <div>
            <p className="mb-4 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o que está incluso</p>
            <h2 className="max-w-md font-display text-4xl font-semibold leading-[1.04] tracking-[-.04em] text-[#202f4d] sm:text-5xl">Estrutura para o tráfego <span className="text-[#58739f]">trabalhar melhor.</span></h2>
            <p className="mt-7 max-w-sm text-base leading-8 text-[#56657d]">Cada frente existe para aproximar a atração da conversão — com clareza sobre o papel do marketing e do comercial.</p>
            <a href="#contato" data-testid="link-paid-includes-cta" className="mt-8 flex w-fit items-center gap-2 text-sm font-extrabold text-[#202f4d] underline decoration-[#9fe4e5] decoration-2 underline-offset-8 transition-colors hover:text-[#58739f]">Conversar sobre meu cenário <ArrowRight className="h-4 w-4" /></a>
          </div>
          <div className="grid gap-0 border-t border-[#b8c6d7]">
            {service.bullets.map((bullet, index) => {
              const detail = service.bulletDetails?.[index] ?? '';
              const isOpen = openBullet === index;
              return (
                <div key={bullet} className="border-b border-[#d9e0e9]">
                  <button type="button" onClick={() => setOpenBullet(isOpen ? null : index)} aria-expanded={isOpen} data-testid={`button-paid-detail-${index}`} className="group flex w-full items-center gap-5 py-6 text-left">
                    <span className="font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span>
                    <span className="flex-1 font-display text-2xl font-medium tracking-[-.02em] text-[#202f4d] transition-colors group-hover:text-[#58739f]">{bullet}</span>
                    <ArrowRight className={`h-4 w-4 shrink-0 text-[#9caac0] transition-all ${isOpen ? 'rotate-90 text-[#58739f]' : 'group-hover:translate-x-1 group-hover:text-[#58739f]'}`} />
                  </button>
                  {isOpen && <p className="reveal pb-6 pl-10 pr-7 text-sm leading-7 text-[#56657d] sm:pl-16">{detail}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="bg-[#202f4d] text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
          <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ como funciona</p>
              <h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] sm:text-5xl">Da leitura do cenário ao próximo <span className="text-[#9fe4e5]">aprendizado.</span></h2>
              <p className="mt-7 max-w-sm text-base leading-8 text-slate-300">A consultoria conecta decisões de marketing e vendas em uma sequência que a equipe consegue entender e usar.</p>
            </div>
            <div className="grid gap-0 border-t border-white/15">
              {[
                ['01', 'Entender', 'Leitura do negócio, da oferta, dos canais e do fluxo atual de atendimento.'],
                ['02', 'Estruturar', 'Definição da estratégia de aquisição e dos pontos que precisam estar prontos para receber o lead.'],
                ['03', 'Ativar', 'Planejamento e gestão das campanhas, com os canais e mensagens alinhados ao objetivo.'],
                ['04', 'Aprender', 'Mensuração, integração e ajustes para tornar o processo mais eficiente e previsível.'],
              ].map(([number, title, text]) => (
                <div key={number} className="traffic-step grid grid-cols-[2.3rem_1fr] gap-5 border-b border-white/15 py-6 sm:grid-cols-[3rem_1fr]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9fe4e5]/45 font-mono-vg text-[10px] text-[#9fe4e5]">{number}</span>
                  <div><h3 className="font-display text-2xl font-semibold text-white">{title}</h3><p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">{text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e6edf4]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1fr_1fr] lg:px-10 lg:py-28">
          <div>
            <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o que muda</p>
            <h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Menos desperdício entre a atração e a <span className="text-[#58739f]">venda.</span></h2>
          </div>
          <div className="grid gap-0 border-t border-[#b8c6d7]">
            {service.deliverables.map((item, index) => <div key={item} className="flex items-start gap-4 border-b border-[#c3d1df] py-5"><Check className="mt-1 h-4 w-4 shrink-0 text-[#58739f]" /><p className="text-sm font-bold leading-6 text-[#202f4d]">{item}</p><span className="ml-auto font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span></div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#202f4d] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:px-10 lg:py-24">
          <div>
            <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ por que a VG</p>
            <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] sm:text-6xl">Não gerenciamos anúncios isolados. <span className="text-[#9fe4e5]">Conectamos a operação.</span></h2>
          </div>
          <div className="border-t border-white/15 pt-6 lg:justify-self-end lg:max-w-sm">
            <p className="text-base leading-8 text-slate-300">A diferença está em olhar para o que acontece antes e depois do clique: o caminho completo do lead, o papel do time e os sinais que ajudam a decidir.</p>
            <a href="#contato" data-testid="link-paid-differentiator-cta" className="mt-7 flex w-fit items-center gap-2 rounded-lg bg-[#9fe4e5] px-5 py-3.5 text-sm font-extrabold text-[#202f4d] transition-transform hover:-translate-y-0.5">Falar com a VG <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
       </section>

       <section id="contato" className="bg-[#17233e]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 lg:px-10 lg:py-28">
          <div className="flex flex-col justify-between">
            <div>
              <p className="mb-5 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ próximo passo</p>
              <h2 className="max-w-lg font-display text-5xl font-semibold leading-[.98] tracking-[-.045em] text-white sm:text-6xl">Seu próximo lead merece um caminho melhor.</h2>
              <p className="mt-7 max-w-md text-base leading-8 text-slate-300">Conte o mínimo para começarmos. A primeira conversa serve para entender o momento e avaliar se a consultoria faz sentido para sua empresa.</p>
            </div>
            <div className="mt-12 hidden items-center gap-3 text-xs text-slate-400 sm:flex"><CircleCheck className="h-4 w-4 text-[#9fe4e5]" /> Sem obrigação de contratação</div>
          </div>
          <ContactForm compact serviceValue="trafego-pago" />
        </div>
      </section>
      <Footer />
    </div>
  );
}

function MarketingConsultingPage({ service }: { service: Service }) {
  const [openBullet, setOpenBullet] = useState<number | null>(null);
  usePageMeta(
    'Consultoria de Marketing',
    'Estruture o marketing da sua empresa com planejamento, equipe, conteúdo estratégico e foco em resultado com a VG.',
  );
  return (
    <div className="site-shell art-directed overflow-hidden">
      <section className="relative isolate min-h-[780px] overflow-hidden bg-[#202f4d] text-white lg:min-h-[850px]">
        <div className="absolute inset-0 bg-grid-dark opacity-50" />
        <div className="traffic-hero-glow absolute inset-0" />
        <Header />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-36 lg:min-h-[850px] lg:grid-cols-[1.02fr_.98fr] lg:gap-20 lg:px-10 lg:pt-32">
          <div className="reveal">
            <p className="mb-6 flex items-center gap-3 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]"><span className="h-2 w-2 rounded-full bg-[#9fe4e5]" /> Consultoria para estruturar crescimento</p>
            <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-[6.2rem]">Marketing sem improviso.<br /><span className="text-[#9fe4e5]">Crescimento com método.</span></h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">A VG organiza estratégia, equipe, conteúdo e mídia para transformar marketing em resultado — não em ruído.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#contato" data-testid="link-consulting-hero-cta" className="button-lift flex w-fit items-center gap-2 rounded-lg bg-[#9fe4e5] px-5 py-3.5 text-sm font-extrabold text-[#202f4d]">Quero estruturar meu marketing <ArrowDownRight className="h-4 w-4" /></a>
              <a href="#como-funciona-consultoria" data-testid="link-consulting-hero-secondary" className="flex w-fit items-center gap-2 rounded-lg border border-white/20 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:border-[#9fe4e5] hover:text-[#9fe4e5]">Ver como funciona <ArrowRight className="h-4 w-4" /></a>
            </div>
            <p className="mt-5 text-xs text-slate-400">Conversa inicial para entender o cenário. Sem obrigação de contratação.</p>
          </div>
          <div className="reveal reveal-delay-2 relative mx-auto w-full max-w-[510px]">
            <div className="absolute -inset-5 rounded-[2rem] border border-[#9fe4e5]/10" />
            <div className="relative overflow-hidden rounded-[1.6rem] border border-white/15 bg-[#263758]/90 p-5 shadow-2xl backdrop-blur-sm sm:p-7">
              <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.17em] text-[#9fe4e5]">O sistema VG</p><p className="mt-2 text-sm font-semibold text-white">Marketing que funciona dentro do negócio</p></div><div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9fe4e5]/40 text-[#9fe4e5]"><Sparkles className="h-4 w-4" /></div></div>
               <div className="mt-7 space-y-3">
                 {[['Demanda', 'Atrair o que faz sentido', Target], ['Sistemas', 'Conectar as ferramentas', Crosshair], ['Processos', 'Fazer acontecer melhor', BarChart3], ['Pessoas', 'Dar direção ao time', Sparkles]].map(([label, text, Icon], index) => (
                  <div key={label as string} className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#1e2d4a]/80 p-3.5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#9fe4e5]"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-bold text-white">{label as string}</p><p className="mt-0.5 text-xs text-slate-400">{text as string}</p></div><span className="font-mono-vg text-[10px] text-slate-500">0{index + 1}</span></div>
                ))}
              </div>
              <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5"><span className="font-mono-vg text-[10px] uppercase tracking-[.15em] text-slate-500">VG / estrutura e autonomia</span><span className="flex items-center gap-2 text-xs font-semibold text-[#9fe4e5]"><span className="h-1.5 w-1.5 rounded-full bg-[#9fe4e5]" /> sob medida</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#d9e0e9] bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[.55fr_1.45fr] lg:px-10 lg:py-24">
          <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ para quem é</p>
          <div><h2 className="max-w-4xl font-display text-4xl font-semibold leading-[1.04] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Para empresas que querem crescer sem depender do <span className="text-[#58739f]">improviso.</span></h2><div className="mt-12 grid gap-0 border-t border-[#b8c6d7] sm:grid-cols-2">{['Precisam ir além de ações pontuais e organizar o marketing.', 'Querem montar uma equipe eficiente e capacitada.', 'Buscam conteúdo estratégico, canais prioritários e metas claras.', 'Querem mais autonomia e menos dependência de terceiros.'].map((item, index) => <div key={item} className={`flex gap-4 border-b border-[#d9e0e9] py-5 ${index % 2 === 0 ? 'sm:mr-6' : 'sm:ml-6'}`}><span className="font-mono-vg text-[10px] text-[#58739f]">0{index + 1}</span><p className="max-w-sm text-sm font-semibold leading-6 text-[#202f4d]">{item}</p></div>)}</div></div>
        </div>
      </section>

      <section className="bg-[#e6edf4]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.8fr_1.2fr] lg:px-10 lg:py-28">
          <div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o que muda</p><h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Do marketing espalhado para uma operação com <span className="text-[#58739f]">direção.</span></h2></div>
          <div className="rounded-2xl border border-[#c3d1df] bg-[#f5f7fa] p-7 sm:p-10"><p className="font-display text-2xl font-medium leading-[1.2] tracking-[-.02em] text-[#202f4d] sm:text-3xl">Marketing precisa de planejamento, equipe, conteúdo estratégico e foco total em resultado.</p><p className="mt-7 max-w-2xl text-base leading-8 text-[#56657d]">A VG considera o estágio da sua empresa, seu mercado, seus recursos e suas metas para criar um plano que faça sentido e possa ser executado.</p><div className="mt-8 flex items-center gap-3 border-t border-[#d9e0e9] pt-6"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#202f4d] text-[#9fe4e5]"><Compass className="h-4 w-4" /></div><p className="text-sm font-bold text-[#202f4d]">Estratégia conectada à realidade da operação.</p></div></div>
        </div>
      </section>

      <section className="bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[.72fr_1.28fr] lg:px-10 lg:py-28">
          <div><p className="mb-4 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o que está incluso</p><h2 className="max-w-md font-display text-4xl font-semibold leading-[1.04] tracking-[-.04em] text-[#202f4d] sm:text-5xl">Tudo o que sua área precisa para ganhar <span className="text-[#58739f]">autonomia.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-[#56657d]">Clique em cada frente para entender como a consultoria se aplica ao seu negócio.</p><a href="#contato" data-testid="link-consulting-includes-cta" className="mt-8 flex w-fit items-center gap-2 text-sm font-extrabold text-[#202f4d] underline decoration-[#9fe4e5] decoration-2 underline-offset-8 transition-colors hover:text-[#58739f]">Conversar sobre meu cenário <ArrowRight className="h-4 w-4" /></a></div>
          <div className="grid gap-0 border-t border-[#b8c6d7]">{service.bullets.map((bullet, index) => { const detail = service.bulletDetails?.[index] ?? ''; const isOpen = openBullet === index; return <div key={bullet} className="border-b border-[#d9e0e9]"><button type="button" onClick={() => setOpenBullet(isOpen ? null : index)} aria-expanded={isOpen} data-testid={`button-consulting-detail-${index}`} className="group flex w-full items-center gap-5 py-6 text-left"><span className="font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span><span className="flex-1 font-display text-2xl font-medium tracking-[-.02em] text-[#202f4d] transition-colors group-hover:text-[#58739f]">{bullet}</span><ArrowRight className={`h-4 w-4 shrink-0 text-[#9caac0] transition-all ${isOpen ? 'rotate-90 text-[#58739f]' : 'group-hover:translate-x-1 group-hover:text-[#58739f]'}`} /></button>{isOpen && <p className="reveal pb-6 pl-10 pr-7 text-sm leading-7 text-[#56657d] sm:pl-16">{detail}</p>}</div>; })}</div>
        </div>
      </section>

       <section id="como-funciona-consultoria" className="bg-[#202f4d] text-white">
         <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
           <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
             <div>
               <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ o sistema VG</p>
               <h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] sm:text-5xl">Quatro frentes. Uma operação com <span className="text-[#9fe4e5]">direção.</span></h2>
               <p className="mt-7 max-w-sm text-base leading-8 text-slate-300">O método conecta o que traz oportunidades ao que sustenta o crescimento dentro da empresa.</p>
             </div>
             <div className="grid gap-3 sm:grid-cols-2">
               {[
                 ['01', 'Demanda', 'A demanda é o ponto de partida. Entendemos mercado, oferta e posicionamento para atrair oportunidades que tenham relação com o negócio — não apenas mais cliques.', 'bg-[#c88982]'],
                 ['02', 'Sistemas', 'Site, CRM, dados, mídia e canais precisam conversar. Organizamos as ferramentas para que a informação circule e as decisões não dependam de achismos.', 'bg-[#d7bd91]'],
                 ['03', 'Processos', 'Criamos a rotina que transforma intenção em entrega: prioridades, responsáveis, calendário, indicadores e ajustes para o marketing ganhar consistência.', 'bg-[#9fd6d7]'],
                 ['04', 'Pessoas', 'Estratégia só acontece quando existe gente preparada para conduzir. Ajudamos a selecionar, treinar e liderar o time certo para a próxima fase.', 'bg-[#2f4265]'],
               ].map(([number, title, text, tone]) => (
                 <article key={number} className={`group relative min-h-[245px] overflow-hidden rounded-2xl p-6 text-[#202f4d] ${tone} ${title === 'Pessoas' ? 'text-white' : ''}`}>
                   <div className="relative z-10 flex items-start justify-between"><span className="font-mono-vg text-[10px] tracking-[.15em] opacity-70">{number} / {title}</span><ArrowUpRightIcon className="opacity-70 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" /></div>
                   <div className="relative z-10 mt-16"><h3 className="font-display text-2xl font-semibold tracking-[-.025em]">{title}</h3><p className="mt-3 text-sm leading-6 opacity-80">{text}</p></div>
                   <div className="absolute -bottom-16 -right-12 h-44 w-44 rounded-full border border-current/15 transition-transform duration-500 group-hover:scale-125" />
                 </article>
               ))}
             </div>
           </div>
         </div>
       </section>

      <section className="bg-[#e6edf4]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-10 lg:py-28"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ benefícios</p><h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Mais controle, mais autonomia, mais <span className="text-[#58739f]">resultado.</span></h2></div><div className="grid gap-0 border-t border-[#b8c6d7]">{service.deliverables.map((item, index) => <div key={item} className="flex items-start gap-4 border-b border-[#c3d1df] py-5"><Check className="mt-1 h-4 w-4 shrink-0 text-[#58739f]" /><p className="text-sm font-bold leading-6 text-[#202f4d]">{item}</p><span className="ml-auto font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span></div>)}</div></div></section>

      <section className="bg-[#202f4d] text-white"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:px-10 lg:py-24"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ por que a VG</p><h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] sm:text-6xl">Você não precisa fazer mais marketing. Precisa fazer marketing com <span className="text-[#9fe4e5]">direção.</span></h2></div><div className="border-t border-white/15 pt-6 lg:justify-self-end lg:max-w-sm"><p className="text-base leading-8 text-slate-300">Atuamos como parceiros do seu negócio, com acompanhamento próximo, decisões baseadas em dados e compromisso com crescimento sustentável.</p><a href="#contato" data-testid="link-consulting-differentiator-cta" className="mt-7 flex w-fit items-center gap-2 rounded-lg bg-[#9fe4e5] px-5 py-3.5 text-sm font-extrabold text-[#202f4d] transition-transform hover:-translate-y-0.5">Falar com a VG <ArrowRight className="h-4 w-4" /></a></div></div></section>

      <section id="contato" className="bg-[#17233e]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 lg:px-10 lg:py-28"><div className="flex flex-col justify-between"><div><p className="mb-5 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ próximo passo</p><h2 className="max-w-lg font-display text-5xl font-semibold leading-[.98] tracking-[-.045em] text-white sm:text-6xl">Pronto para estruturar o marketing da sua empresa?</h2><p className="mt-7 max-w-md text-base leading-8 text-slate-300">Conte o mínimo para começarmos. A primeira conversa serve para entender seu momento e avaliar se a consultoria faz sentido.</p></div><div className="mt-12 hidden items-center gap-3 text-xs text-slate-400 sm:flex"><CircleCheck className="h-4 w-4 text-[#9fe4e5]" /> Sem obrigação de contratação</div></div><ContactForm compact serviceValue="consultoria-de-marketing" /></div></section>
      <Footer />
    </div>
  );
}

function InternalizationPage({ service }: { service: Service }) {
  const [openBullet, setOpenBullet] = useState<number | null>(null);
  usePageMeta(
    'Internalização de Marketing e Vendas',
    'Monte um time interno de marketing e vendas eficiente, treinado e alinhado para crescer com controle, processos claros e autonomia.',
  );
  const roles = ['Social Media', 'Designer', 'Gestor de Tráfego Pago', 'SDR / pré-vendas', 'BDR / prospecção ativa', 'Vendedor de Inside Sales'];
  return (
    <div className="site-shell art-directed overflow-hidden">
      <section className="relative isolate overflow-hidden bg-[#202f4d] text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-50" />
        <div className="absolute -right-48 top-20 h-[700px] w-[700px] rounded-full border border-[#9fe4e5]/10" />
        <Header />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-36 lg:grid-cols-[.9fr_1.1fr] lg:items-end lg:px-10 lg:pb-28 lg:pt-48">
          <div className="reveal">
            <p className="mb-6 flex items-center gap-3 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]"><span className="h-2 w-2 rounded-full bg-[#9fe4e5]" /> Estrutura para crescer por dentro</p>
            <h1 className="max-w-3xl font-display text-5xl font-semibold leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-[6.4rem]">Pare de depender.<br /><span className="text-[#9fe4e5]">Comece a construir.</span></h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Monte um time interno de marketing e vendas eficiente, treinado e alinhado aos objetivos do seu negócio.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"><a href="#contato" data-testid="link-internalization-hero-cta" className="button-lift flex w-fit items-center gap-2 rounded-lg bg-[#9fe4e5] px-5 py-3.5 text-sm font-extrabold text-[#202f4d]">Quero montar meu time <ArrowDownRight className="h-4 w-4" /></a><a href="#como-funciona-internalizacao" data-testid="link-internalization-hero-secondary" className="flex w-fit items-center gap-2 rounded-lg border border-white/20 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:border-[#9fe4e5] hover:text-[#9fe4e5]">Entender o processo <ArrowRight className="h-4 w-4" /></a></div>
            <p className="mt-5 text-xs text-slate-400">Conversa inicial para entender a sua estrutura. Sem obrigação de contratação.</p>
          </div>
          <div className="reveal reveal-delay-2 relative">
            <div className="relative ml-auto max-w-[570px] border-l border-[#9fe4e5]/30 pl-5 sm:pl-8">
              <p className="mb-4 font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#9fe4e5]">/ sinais de que chegou a hora</p>
              <div className="space-y-2">
                {['Cada decisão depende de um fornecedor diferente.', 'O conhecimento vai embora quando o freelancer sai.', 'Marketing e vendas trabalham sem o mesmo objetivo.', 'A empresa cresce, mas a operação continua improvisada.'].map((pain, index) => <div key={pain} className="flex items-start gap-4 border-b border-white/10 py-4"><span className="font-mono-vg text-[10px] text-[#9fe4e5]">0{index + 1}</span><p className="max-w-md text-sm font-semibold leading-6 text-slate-200">{pain}</p></div>)}
              </div>
              <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">Se você reconheceu sua operação aqui, o próximo passo não é contratar mais um fornecedor. É estruturar a capacidade certa dentro de casa.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.7fr_1.3fr] lg:px-10 lg:py-28">
          <div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ a virada</p><h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Não é só contratar pessoas. É criar uma operação que <span className="text-[#58739f]">aprende.</span></h2></div>
          <div className="max-w-3xl"><p className="font-display text-2xl font-medium leading-[1.2] tracking-[-.02em] text-[#202f4d] sm:text-3xl">A consultoria da VG ajuda sua empresa a deixar de depender exclusivamente de agências e freelancers e passar a contar com uma equipe interna bem estruturada, treinada e orientada a resultados reais.</p><p className="mt-8 text-base leading-8 text-[#56657d]">Do diagnóstico à execução, organizamos seleção, treinamento, processos, metas e acompanhamento para que o time compreenda profundamente seu mercado e seus diferenciais.</p><a href="#contato" data-testid="link-internalization-turn-cta" className="mt-8 flex w-fit items-center gap-2 text-sm font-extrabold text-[#202f4d] underline decoration-[#9fe4e5] decoration-2 underline-offset-8 hover:text-[#58739f]">Quero mais autonomia <ArrowRight className="h-4 w-4" /></a></div>
        </div>
      </section>

      <section className="bg-[#e6edf4]">
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o time certo</p><h2 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">As funções que fazem a operação <span className="text-[#58739f]">andar.</span></h2></div><p className="max-w-sm text-sm leading-7 text-[#56657d]">Trabalhamos com o RH da sua empresa — ou assumimos esse papel quando necessário — para estruturar as funções essenciais.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{roles.map((role, index) => <div key={role} className="group flex min-h-[150px] flex-col justify-between rounded-2xl border border-[#c3d1df] bg-[#f5f7fa] p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-[#58739f]"><div className="flex items-center justify-between"><span className="font-mono-vg text-[10px] text-[#58739f]">0{index + 1}</span><ArrowUpRightIcon /></div><p className="font-display text-2xl font-semibold tracking-[-.025em] text-[#202f4d]">{role}</p></div>)}</div>
        </div>
      </section>

      <section className="bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[.72fr_1.28fr] lg:px-10 lg:py-28">
          <div><p className="mb-4 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ como fazemos</p><h2 className="max-w-md font-display text-4xl font-semibold leading-[1.04] tracking-[-.04em] text-[#202f4d] sm:text-5xl">Cada etapa reduz a dependência e aumenta a <span className="text-[#58739f]">clareza.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-[#56657d]">Abra cada etapa para entender o que acontece na prática.</p></div>
          <div className="grid gap-0 border-t border-[#b8c6d7]">{service.bullets.map((bullet, index) => { const isOpen = openBullet === index; return <div key={bullet} className="border-b border-[#d9e0e9]"><button type="button" onClick={() => setOpenBullet(isOpen ? null : index)} aria-expanded={isOpen} data-testid={`button-internalization-detail-${index}`} className="group flex w-full items-center gap-5 py-6 text-left"><span className="font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span><span className="flex-1 font-display text-2xl font-medium tracking-[-.02em] text-[#202f4d] transition-colors group-hover:text-[#58739f]">{bullet}</span><ArrowRight className={`h-4 w-4 shrink-0 text-[#9caac0] transition-all ${isOpen ? 'rotate-90 text-[#58739f]' : 'group-hover:translate-x-1 group-hover:text-[#58739f]'}`} /></button>{isOpen && <p className="reveal pb-6 pl-10 pr-7 text-sm leading-7 text-[#56657d] sm:pl-16">{service.bulletDetails?.[index]}</p>}</div>; })}</div>
        </div>
      </section>

      <section id="como-funciona-internalizacao" className="bg-[#202f4d] text-white"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28"><div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ como funciona</p><h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] sm:text-5xl">Da primeira leitura ao time operando com <span className="text-[#9fe4e5]">autonomia.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-slate-300">Um processo acompanhado para você não ficar sozinho na transição.</p></div><div className="grid gap-0 border-t border-white/15">{[['01', 'Diagnóstico inicial', 'Avaliamos sua estrutura atual, capacidade de gestão e objetivos de crescimento.'], ['02', 'Estrutura ideal', 'Definimos cargos, perfis e responsabilidades de acordo com suas metas e realidade.'], ['03', 'Contratação e treinamento', 'Apoiamos a seleção e capacitamos o time para executar com foco em resultado.'], ['04', 'Processos e acompanhamento', 'Implantamos rotinas, ferramentas, fluxos e indicadores e ajustamos o caminho.']].map(([number, title, text]) => <div key={number} className="grid grid-cols-[2.3rem_1fr] gap-5 border-b border-white/15 py-6 sm:grid-cols-[3rem_1fr]"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9fe4e5]/45 font-mono-vg text-[10px] text-[#9fe4e5]">{number}</span><div><h3 className="font-display text-2xl font-semibold text-white">{title}</h3><p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">{text}</p></div></div>)}</div></div></div></section>

      <section className="bg-[#e6edf4]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-10 lg:py-28"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o que sua empresa ganha</p><h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Crescimento com estrutura, não com <span className="text-[#58739f]">tentativa e erro.</span></h2></div><div className="grid gap-0 border-t border-[#b8c6d7]">{service.deliverables.map((item, index) => <div key={item} className="flex items-start gap-4 border-b border-[#c3d1df] py-5"><Check className="mt-1 h-4 w-4 shrink-0 text-[#58739f]" /><p className="text-sm font-bold leading-6 text-[#202f4d]">{item}</p><span className="ml-auto font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span></div>)}</div></div></section>

      <section id="contato" className="bg-[#17233e]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 lg:px-10 lg:py-28"><div className="flex flex-col justify-between"><div><p className="mb-5 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ próximo passo</p><h2 className="max-w-lg font-display text-5xl font-semibold leading-[.98] tracking-[-.045em] text-white sm:text-6xl">Seu time próprio começa com uma decisão.</h2><p className="mt-7 max-w-md text-base leading-8 text-slate-300">Conte o mínimo para começarmos. A primeira conversa serve para entender sua estrutura e montar um plano sob medida.</p></div><div className="mt-12 hidden items-center gap-3 text-xs text-slate-400 sm:flex"><CircleCheck className="h-4 w-4 text-[#9fe4e5]" /> Sem obrigação de contratação</div></div><ContactForm compact serviceValue="internalizacao-de-marketing" /></div></section>
      <Footer />
    </div>
  );
}

function ManagerAsServicePage({ service }: { service: Service }) {
  const [openBullet, setOpenBullet] = useState<number | null>(null);
  usePageMeta(
    'Marketing Manager as a Service | VG',
    'Liderança estratégica de marketing sob demanda para organizar equipe, prioridades, processos e performance com a VG.',
  );
  return (
    <div className="site-shell art-directed overflow-hidden">
      <section className="relative isolate overflow-hidden bg-[#202f4d] text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-50" />
        <Header />
        <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-36 lg:px-10 lg:pb-28 lg:pt-44">
          <div className="grid gap-14 lg:grid-cols-[.94fr_1.06fr] lg:items-center">
            <div className="reveal">
              <p className="mb-6 flex items-center gap-3 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]"><span className="h-2 w-2 rounded-full bg-[#9fe4e5]" /> Liderança de marketing sob demanda</p>
              <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[.97] tracking-[-.05em] sm:text-6xl lg:text-[5.15rem]">Seu marketing não precisa de mais tarefas.<br /><span className="text-[#9fe4e5]">Precisa de liderança.</span></h1>
              <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">A VG atua como seu Marketing Manager as a Service: planeja, organiza, lidera e acompanha cada frente para fazer o marketing andar com foco em performance.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"><a href="#contato" data-testid="link-manager-hero-cta" className="button-lift flex w-fit items-center gap-2 rounded-lg bg-[#9fe4e5] px-5 py-3.5 text-sm font-extrabold text-[#202f4d]">Quero uma liderança para o marketing <ArrowDownRight className="h-4 w-4" /></a><a href="#como-funciona-manager" data-testid="link-manager-hero-secondary" className="flex w-fit items-center gap-2 rounded-lg border border-white/20 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:border-[#9fe4e5] hover:text-[#9fe4e5]">Ver como ajuda <ArrowRight className="h-4 w-4" /></a></div>
              <p className="mt-5 text-xs text-slate-400">Conversa inicial para entender seu momento. Sem obrigação de contratação.</p>
            </div>
            <div className="reveal reveal-delay-2 rounded-[1.5rem] border border-white/15 bg-[#263758]/85 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
              <div className="flex items-start justify-between gap-6 border-b border-white/10 pb-6"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#9fe4e5]">/ o que a VG assume</p><h2 className="mt-3 max-w-sm font-display text-3xl font-semibold leading-tight tracking-[-.03em] text-white sm:text-4xl">A liderança que faz tudo conversar.</h2></div><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#9fe4e5]/40 text-[#9fe4e5]"><Crosshair className="h-5 w-5" /></div></div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">{[['01', 'Planejamento', 'Objetivos viram prioridades'], ['02', 'Coordenação', 'Cada pessoa sabe seu papel'], ['03', 'Acompanhamento', 'Dados viram decisões'], ['04', 'Integração', 'Marketing e vendas avançam juntos']].map(([number, title, text]) => <div key={number} className="rounded-xl border border-white/10 bg-[#1e2d4a]/80 p-4"><div className="flex items-center justify-between"><span className="font-mono-vg text-[10px] text-[#9fe4e5]">{number}</span><MoveUpRight className="h-3.5 w-3.5 text-slate-500" /></div><p className="mt-6 text-sm font-bold text-white">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{text}</p></div>)}</div>
              <div className="mt-6 rounded-xl border border-[#9fe4e5]/20 bg-[#9fe4e5]/[.06] p-4"><p className="text-sm leading-6 text-slate-200">Você não precisa contratar uma estrutura inteira para começar a ter direção. <span className="font-bold text-[#9fe4e5]">Precisa de alguém que assuma a responsabilidade de conectar tudo.</span></p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#e6edf4]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.65fr_1.35fr] lg:px-10 lg:py-28">
          <div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ a solução</p><h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Uma pessoa experiente para transformar esforço em <span className="text-[#58739f]">direção.</span></h2></div>
          <div className="max-w-3xl"><p className="font-display text-2xl font-medium leading-[1.2] tracking-[-.02em] text-[#202f4d] sm:text-3xl">Ter um gestor de marketing experiente pode ser proibitivo para pequenas e médias empresas. O MMaaS coloca essa liderança dentro do seu contexto, sem exigir uma contratação em tempo integral.</p><p className="mt-8 text-base leading-8 text-[#56657d]">A VG funciona como ponte entre a direção e os profissionais internos ou terceirizados, coordenando pessoas, prioridades e entregas com metas claras e foco em crescimento sustentável.</p><a href="#contato" data-testid="link-manager-solution-cta" className="mt-8 flex w-fit items-center gap-2 text-sm font-extrabold text-[#202f4d] underline decoration-[#9fe4e5] decoration-2 underline-offset-8 hover:text-[#58739f]">Quero entender se faz sentido <ArrowRight className="h-4 w-4" /></a></div>
        </div>
      </section>

      <section className="bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[.72fr_1.28fr] lg:px-10 lg:py-28">
          <div><p className="mb-4 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o que fazemos</p><h2 className="max-w-md font-display text-4xl font-semibold leading-[1.04] tracking-[-.04em] text-[#202f4d] sm:text-5xl">A liderança que organiza o que hoje parece <span className="text-[#58739f]">solto.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-[#56657d]">Clique em cada frente para ver como a VG entra na operação.</p></div>
          <div className="grid gap-0 border-t border-[#b8c6d7]">{service.bullets.map((bullet, index) => { const isOpen = openBullet === index; return <div key={bullet} className="border-b border-[#d9e0e9]"><button type="button" onClick={() => setOpenBullet(isOpen ? null : index)} aria-expanded={isOpen} data-testid={`button-manager-detail-${index}`} className="group flex w-full items-center gap-5 py-6 text-left"><span className="font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span><span className="flex-1 font-display text-2xl font-medium tracking-[-.02em] text-[#202f4d] transition-colors group-hover:text-[#58739f]">{bullet}</span><ArrowRight className={`h-4 w-4 shrink-0 text-[#9caac0] transition-all ${isOpen ? 'rotate-90 text-[#58739f]' : 'group-hover:translate-x-1 group-hover:text-[#58739f]'}`} /></button>{isOpen && <p className="reveal pb-6 pl-10 pr-7 text-sm leading-7 text-[#56657d] sm:pl-16">{service.bulletDetails?.[index]}</p>}</div>; })}</div>
        </div>
      </section>

      <section id="como-funciona-manager" className="bg-[#202f4d] text-white"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28"><div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ como funciona</p><h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] sm:text-5xl">Da confusão operacional às decisões que <span className="text-[#9fe4e5]">avançam.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-slate-300">Uma liderança externa presente o bastante para organizar e objetiva o bastante para fazer acontecer.</p></div><div className="grid gap-0 border-t border-white/15">{[['01', 'Ler o cenário', 'Entendemos objetivos, orçamento, maturidade da equipe e os pontos que estão travando o avanço.'], ['02', 'Priorizar o essencial', 'Transformamos metas comerciais em um plano claro, com responsáveis, prazos e recursos.'], ['03', 'Liderar a execução', 'Conduzimos equipe, agência e parceiros para que cada entrega tenha direção e consequência.'], ['04', 'Medir e ajustar', 'Analisamos os indicadores, levamos decisões à liderança e ajustamos a rota com rapidez.']].map(([number, title, text]) => <div key={number} className="grid grid-cols-[2.3rem_1fr] gap-5 border-b border-white/15 py-6 sm:grid-cols-[3rem_1fr]"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9fe4e5]/45 font-mono-vg text-[10px] text-[#9fe4e5]">{number}</span><div><h3 className="font-display text-2xl font-semibold text-white">{title}</h3><p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">{text}</p></div></div>)}</div></div></div></section>

      <section className="bg-[#f5f7fa]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-10 lg:py-28"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o que sua empresa ganha</p><h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Mais clareza para a equipe. Mais tempo para a liderança. Mais foco no que <span className="text-[#58739f]">dá resultado.</span></h2></div><div className="grid gap-0 border-t border-[#b8c6d7]">{service.deliverables.map((item, index) => <div key={item} className="flex items-start gap-4 border-b border-[#c3d1df] py-5"><Check className="mt-1 h-4 w-4 shrink-0 text-[#58739f]" /><p className="text-sm font-bold leading-6 text-[#202f4d]">{item}</p><span className="ml-auto font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span></div>)}</div></div></section>

      <section className="bg-[#17233e]" id="contato"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 lg:px-10 lg:py-28"><div className="flex flex-col justify-between"><div><p className="mb-5 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ próximo passo</p><h2 className="max-w-lg font-display text-5xl font-semibold leading-[.98] tracking-[-.045em] text-white sm:text-6xl">Você não precisa liderar tudo sozinho.</h2><p className="mt-7 max-w-md text-base leading-8 text-slate-300">Conte o mínimo para começarmos. Vamos entender o momento da sua empresa e avaliar como a VG pode assumir essa frente com você.</p></div><div className="mt-12 hidden items-center gap-3 text-xs text-slate-400 sm:flex"><CircleCheck className="h-4 w-4 text-[#9fe4e5]" /> Sem obrigação de contratação</div></div><ContactForm compact serviceValue="manager-as-a-service" /></div></section>
      <Footer />
    </div>
  );
}

function BrandingPage({ service }: { service: Service }) {
  const [openBullet, setOpenBullet] = useState<number | null>(null);
  usePageMeta(
    'Branding e Posicionamento de Marca',
    'Construa uma marca reconhecida, lembrada e desejada com posicionamento, identidade visual e presença digital estratégica.',
  );
  return (
    <div className="site-shell overflow-hidden">
      <section className="relative isolate overflow-hidden bg-[#202f4d] text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <Header />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-36 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-44">
          <div className="reveal">
            <p className="mb-6 flex items-center gap-3 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]"><span className="h-2 w-2 rounded-full bg-[#9fe4e5]" /> Branding, posicionamento e presença</p>
            <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] sm:text-6xl lg:text-[5.3rem]">Branding que faz sua marca ocupar seu lugar — sem parecer <span className="text-[#9fe4e5]">mais uma.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Construímos a clareza, a personalidade e a consistência que fazem sua empresa ser percebida, lembrada e desejada.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"><a href="#contato" data-testid="link-branding-hero-cta" className="button-lift flex w-fit items-center gap-2 rounded-lg bg-[#9fe4e5] px-5 py-3.5 text-sm font-extrabold text-[#202f4d]">Quero fortalecer minha marca <ArrowDownRight className="h-4 w-4" /></a><a href="#como-funciona-branding" data-testid="link-branding-hero-secondary" className="flex w-fit items-center gap-2 rounded-lg border border-white/20 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:border-[#9fe4e5] hover:text-[#9fe4e5]">Ver o que muda <ArrowRight className="h-4 w-4" /></a></div>
            <p className="mt-5 text-xs text-slate-400">Conversa inicial para entender sua marca. Sem obrigação de contratação.</p>
          </div>
          <div className="reveal reveal-delay-2">
            <div className="relative mx-auto max-w-[520px]">
              <div className="absolute -left-3 -top-3 h-24 w-24 rounded-full bg-[#d7bd91] sm:-left-8 sm:-top-8" /><div className="absolute -bottom-5 -right-3 h-28 w-28 rounded-full bg-[#c88982] sm:-right-8" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#f5f7fa] p-5 shadow-2xl sm:p-7">
                <div className="flex items-center justify-between border-b border-[#d9e0e9] pb-5"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#58739f]">/ percepção de marca</p><p className="mt-2 font-display text-2xl font-semibold tracking-[-.03em] text-[#202f4d]">O que o público sente?</p></div><div className="h-12 w-12 rounded-full bg-[#9fe4e5]" /></div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="col-span-2 rounded-xl bg-[#202f4d] p-5 text-white"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em] text-[#9fe4e5]">clareza</p><p className="mt-8 max-w-xs font-display text-2xl font-semibold leading-tight">Entender por que escolher você.</p></div>
                  <div className="rounded-xl bg-[#d7bd91] p-5 text-[#202f4d]"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em]">voz</p><p className="mt-8 font-display text-xl font-semibold leading-tight">Falar com personalidade.</p></div>
                  <div className="rounded-xl bg-[#c88982] p-5 text-[#202f4d]"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em]">presença</p><p className="mt-8 font-display text-xl font-semibold leading-tight">Ser lembrada no momento certo.</p></div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-[#d9e0e9] pt-5"><span className="font-mono-vg text-[10px] uppercase tracking-[.15em] text-[#58739f]">VG / branding</span><span className="text-xs font-bold text-[#58739f]">forma + significado</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.7fr_1.3fr] lg:px-10 lg:py-28">
          <div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o problema</p><h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Uma marca confusa cobra seu preço todos os dias.</h2></div>
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#c88982] p-7 text-[#202f4d]"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em]">01 / percepção</p><p className="mt-16 font-display text-2xl font-semibold leading-tight">Seu negócio entrega mais do que consegue comunicar.</p></div><div className="rounded-2xl bg-[#d7bd91] p-7 text-[#202f4d]"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em]">02 / confiança</p><p className="mt-16 font-display text-2xl font-semibold leading-tight">O público não entende por que deveria confiar em você.</p></div><div className="rounded-2xl bg-[#b8d9da] p-7 text-[#202f4d]"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em]">03 / consistência</p><p className="mt-16 font-display text-2xl font-semibold leading-tight">Cada canal parece falar de uma empresa diferente.</p></div><div className="rounded-2xl bg-[#202f4d] p-7 text-white"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em] text-[#9fe4e5]">04 / crescimento</p><p className="mt-16 font-display text-2xl font-semibold leading-tight">A marca atual já não acompanha a ambição do negócio.</p></div></div>
        </div>
      </section>

      <section className="bg-[#e6edf4]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[.72fr_1.28fr] lg:px-10 lg:py-28">
          <div><p className="mb-4 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o que construímos</p><h2 className="max-w-md font-display text-4xl font-semibold leading-[1.04] tracking-[-.04em] text-[#202f4d] sm:text-5xl">Da identidade à experiência, uma marca que <span className="text-[#58739f]">faz sentido.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-[#56657d]">Abra cada frente e veja como transformamos posicionamento em presença.</p></div>
          <div className="grid gap-0 border-t border-[#b8c6d7]">{service.bullets.map((bullet, index) => { const isOpen = openBullet === index; return <div key={bullet} className="border-b border-[#c3d1df]"><button type="button" onClick={() => setOpenBullet(isOpen ? null : index)} aria-expanded={isOpen} data-testid={`button-branding-detail-${index}`} className="group flex w-full items-center gap-5 py-6 text-left"><span className="font-mono-vg text-[10px] text-[#58739f]">0{index + 1}</span><span className="flex-1 font-display text-2xl font-medium tracking-[-.02em] text-[#202f4d] transition-colors group-hover:text-[#58739f]">{bullet}</span><ArrowRight className={`h-4 w-4 shrink-0 text-[#58739f] transition-all ${isOpen ? 'rotate-90' : 'group-hover:translate-x-1'}`} /></button>{isOpen && <p className="reveal pb-6 pl-10 pr-7 text-sm leading-7 text-[#56657d] sm:pl-16">{service.bulletDetails?.[index]}</p>}</div>; })}</div>
        </div>
      </section>

      <section id="como-funciona-branding" className="bg-[#202f4d] text-white"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28"><div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ como funciona</p><h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] sm:text-5xl">Uma marca forte começa antes do <span className="text-[#9fe4e5]">layout.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-slate-300">Encontramos a verdade do negócio e transformamos isso em uma linguagem que o mercado reconhece.</p></div><div className="grid gap-0 border-t border-white/15">{[['01', 'Posicionamento', 'Definimos quem você é, para quem fala e o que torna sua empresa diferente.'], ['02', 'Identidade', 'Construímos cores, tipografia, linguagem e personalidade alinhadas à estratégia.'], ['03', 'Aplicação', 'Criamos diretrizes para site, redes, vendas, anúncios e todos os pontos de contato.'], ['04', 'Presença', 'Integramos branding, conteúdo e mídia para gerar familiaridade e autoridade.']].map(([number, title, text]) => <div key={number} className="grid grid-cols-[2.3rem_1fr] gap-5 border-b border-white/15 py-6 sm:grid-cols-[3rem_1fr]"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9fe4e5]/45 font-mono-vg text-[10px] text-[#9fe4e5]">{number}</span><div><h3 className="font-display text-2xl font-semibold text-white">{title}</h3><p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">{text}</p></div></div>)}</div></div></div></section>

      <section className="bg-[#f5f7fa]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-10 lg:py-28"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o resultado</p><h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Marcas fortes crescem com mais <span className="text-[#58739f]">estabilidade.</span></h2></div><div className="grid gap-0 border-t border-[#b8c6d7]">{service.deliverables.map((item, index) => <div key={item} className="flex items-start gap-4 border-b border-[#d9e0e9] py-5"><Check className="mt-1 h-4 w-4 shrink-0 text-[#58739f]" /><p className="text-sm font-bold leading-6 text-[#202f4d]">{item}</p><span className="ml-auto font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span></div>)}</div></div></section>

      <section id="contato" className="bg-[#17233e]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 lg:px-10 lg:py-28"><div className="flex flex-col justify-between"><div><p className="mb-5 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ próximo passo</p><h2 className="max-w-lg font-display text-5xl font-semibold leading-[.98] tracking-[-.045em] text-white sm:text-6xl">Sua marca já representa o tamanho que você quer alcançar?</h2><p className="mt-7 max-w-md text-base leading-8 text-slate-300">Conte o mínimo para começarmos. Vamos entender o momento da sua marca e mostrar onde existe espaço para fortalecer sua presença.</p></div><div className="mt-12 hidden items-center gap-3 text-xs text-slate-400 sm:flex"><CircleCheck className="h-4 w-4 text-[#9fe4e5]" /> Sem obrigação de contratação</div></div><ContactForm compact serviceValue="branding" /></div></section>
      <Footer />
    </div>
  );
}

function SocialContentPage({ service }: { service: Service }) {
  const [openBullet, setOpenBullet] = useState<number | null>(null);
  usePageMeta(
    'Conteúdo Estratégico para Redes Sociais',
    'Crie conteúdo estratégico para redes sociais com roteiro, direção, produção e distribuição alinhados aos objetivos da sua marca.',
  );
  return (
    <div className="site-shell overflow-hidden">
      <section className="relative isolate overflow-hidden bg-[#dfe6ec] text-[#202f4d]">
        <div className="absolute -right-24 -top-28 h-[460px] w-[460px] rounded-full border-[70px] border-[#c88982]/45" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-[#9fcfd0]/55 blur-sm" />
        <Header onLight />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-36 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-10 lg:pb-28 lg:pt-44">
          <div className="reveal">
            <p className="mb-6 flex items-center gap-3 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]"><span className="h-2 w-2 rounded-full bg-[#e87d78]" /> Vídeos estratégicos para redes sociais</p>
            <h1 className="max-w-2xl font-display text-5xl font-semibold leading-[.96] tracking-[-.05em] sm:text-6xl lg:text-[5.4rem]">Conteúdo para redes sociais com intenção. <span className="text-[#b96762]">Vídeo sem estratégia</span> não move ninguém.</h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-[#3f506d] sm:text-lg">Criamos vídeos pensados para atrair clientes, reforçar sua marca ou gerar autoridade — com roteiro, direção e distribuição alinhados ao seu objetivo.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"><a href="#contato" data-testid="link-content-hero-cta" className="button-lift flex w-fit items-center gap-2 rounded-lg bg-[#202f4d] px-5 py-3.5 text-sm font-extrabold text-white">Quero transformar meu conteúdo <ArrowDownRight className="h-4 w-4" /></a><a href="#como-funciona-conteudo" data-testid="link-content-hero-secondary" className="flex w-fit items-center gap-2 rounded-lg border border-[#202f4d]/25 px-5 py-3.5 text-sm font-bold text-[#202f4d] transition-colors hover:bg-[#202f4d] hover:text-white">Ver o processo <ArrowRight className="h-4 w-4" /></a></div>
            <p className="mt-5 text-xs text-[#58739f]">Conversa inicial para entender o momento da sua marca.</p>
          </div>
          <div className="reveal reveal-delay-2">
            <div className="relative mx-auto max-w-[520px] rotate-1">
              <div className="absolute -inset-3 rounded-[1.7rem] bg-[#202f4d] sm:-inset-5" />
              <div className="relative overflow-hidden rounded-[1.4rem] bg-[#f5f7fa] p-4 shadow-2xl sm:p-6">
                <div className="flex items-center justify-between border-b border-[#d9e0e9] pb-4"><span className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#58739f]">/ direção de conteúdo</span><span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-[#e87d78]"><span className="h-2 w-2 rounded-full bg-[#e87d78]" /> em produção</span></div>
                <div className="relative mt-5 flex aspect-[1.5/1] items-end overflow-hidden rounded-xl bg-[#202f4d] p-5"><div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-[#e87d78]" /><div className="absolute right-8 top-12 h-20 w-20 rounded-full bg-[#9fe4e5]" /><div className="relative z-10"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em] text-[#9fe4e5]">objetivo do vídeo</p><p className="mt-3 max-w-xs font-display text-3xl font-semibold leading-tight text-white">Atrair atenção. Criar conexão. Guiar para a ação.</p></div><div className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4b860] text-[#202f4d]"><Play className="ml-1 h-5 w-5 fill-current" /></div></div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-[#b8d9da] px-2 py-3"><p className="font-mono-vg text-[9px] uppercase">atrair</p><p className="mt-1 text-xs font-bold">Reels</p></div><div className="rounded-lg bg-[#d99a94] px-2 py-3"><p className="font-mono-vg text-[9px] uppercase">conectar</p><p className="mt-1 text-xs font-bold">Roteiro</p></div><div className="rounded-lg bg-[#e6c98e] px-2 py-3"><p className="font-mono-vg text-[9px] uppercase">converter</p><p className="mt-1 text-xs font-bold">Ação</p></div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f7fa]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.65fr_1.35fr] lg:px-10 lg:py-28"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ a dor</p><h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">A sua empresa não precisa de mais posts. Precisa de <span className="text-[#b96762]">conteúdo que cumpra uma função.</span></h2></div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#202f4d] p-7 text-white"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em] text-[#9fe4e5]">01 / atenção</p><p className="mt-16 font-display text-2xl font-semibold leading-tight">Você publica, mas o conteúdo passa despercebido.</p></div><div className="rounded-2xl bg-[#d99a94] p-7 text-[#202f4d]"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em]">02 / desperdício</p><p className="mt-16 font-display text-2xl font-semibold leading-tight">Cada vídeo sem objetivo desperdiça tempo e investimento.</p></div><div className="rounded-2xl bg-[#b8d9da] p-7 text-[#202f4d]"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em]">03 / percepção</p><p className="mt-16 font-display text-2xl font-semibold leading-tight">Sua imagem não traduz a qualidade do seu negócio.</p></div><div className="rounded-2xl bg-[#e6c98e] p-7 text-[#202f4d]"><p className="font-mono-vg text-[10px] uppercase tracking-[.15em]">04 / direção</p><p className="mt-16 font-display text-2xl font-semibold leading-tight">A equipe cria, mas ninguém sabe o que repetir ou melhorar.</p></div></div></div></section>

      <section className="bg-[#e6edf4]"><div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[.72fr_1.28fr] lg:px-10 lg:py-28"><div><p className="mb-4 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o que entra em cena</p><h2 className="max-w-md font-display text-4xl font-semibold leading-[1.04] tracking-[-.04em] text-[#202f4d] sm:text-5xl">Estratégia e produção no mesmo <span className="text-[#b96762]">plano.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-[#56657d]">Cada etapa existe para fazer o próximo vídeo ser mais claro, relevante e eficiente.</p></div><div className="grid gap-0 border-t border-[#b8c6d7]">{service.bullets.map((bullet, index) => { const isOpen = openBullet === index; return <div key={bullet} className="border-b border-[#c3d1df]"><button type="button" onClick={() => setOpenBullet(isOpen ? null : index)} aria-expanded={isOpen} data-testid={`button-content-detail-${index}`} className="group flex w-full items-center gap-5 py-6 text-left"><span className="font-mono-vg text-[10px] text-[#b96762]">0{index + 1}</span><span className="flex-1 font-display text-2xl font-medium tracking-[-.02em] text-[#202f4d] transition-colors group-hover:text-[#b96762]">{bullet}</span><ArrowRight className={`h-4 w-4 shrink-0 text-[#b96762] transition-all ${isOpen ? 'rotate-90' : 'group-hover:translate-x-1'}`} /></button>{isOpen && <p className="reveal pb-6 pl-10 pr-7 text-sm leading-7 text-[#56657d] sm:pl-16">{service.bulletDetails?.[index]}</p>}</div>; })}</div></div></section>

      <section id="como-funciona-conteudo" className="bg-[#202f4d] text-white"><div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28"><div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr]"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ como funciona</p><h2 className="mt-5 max-w-md font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] sm:text-5xl">Do objetivo à publicação, sem deixar a estratégia <span className="text-[#9fe4e5]">pelo caminho.</span></h2><p className="mt-7 max-w-sm text-base leading-8 text-slate-300">Um fluxo pensado para cada vídeo ter intenção, técnica e espaço para aprender.</p></div><div className="grid gap-0 border-t border-white/15">{[['01', 'Definir o objetivo', 'Escolhemos se o vídeo precisa atrair, informar, vender ou posicionar — e qual formato melhor cumpre esse papel.'], ['02', 'Roteirizar para reter', 'Criamos uma narrativa clara, enxuta e alinhada ao tom da marca e à expectativa da audiência.'], ['03', 'Produzir com direção', 'Acompanhamos captação e edição para garantir ritmo, qualidade técnica, legenda e identidade visual.'], ['04', 'Publicar e aprender', 'Orientamos distribuição, cronograma, legenda e impulsionamento para gerar visibilidade e próximos aprendizados.']].map(([number, title, text]) => <div key={number} className="grid grid-cols-[2.3rem_1fr] gap-5 border-b border-white/15 py-6 sm:grid-cols-[3rem_1fr]"><span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#9fe4e5]/45 font-mono-vg text-[10px] text-[#9fe4e5]">{number}</span><div><h3 className="font-display text-2xl font-semibold text-white">{title}</h3><p className="mt-2 max-w-xl text-sm leading-7 text-slate-300">{text}</p></div></div>)}</div></div></div></section>

      <section className="bg-[#f5f7fa]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-2 lg:px-10 lg:py-28"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o resultado</p><h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Conteúdo com intenção, técnica e <span className="text-[#b96762]">resultado.</span></h2></div><div className="grid gap-0 border-t border-[#b8c6d7]">{service.deliverables.map((item, index) => <div key={item} className="flex items-start gap-4 border-b border-[#d9e0e9] py-5"><Check className="mt-1 h-4 w-4 shrink-0 text-[#b96762]" /><p className="text-sm font-bold leading-6 text-[#202f4d]">{item}</p><span className="ml-auto font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span></div>)}</div></div></section>

      <section id="contato" className="bg-[#17233e]"><div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 lg:px-10 lg:py-28"><div className="flex flex-col justify-between"><div><p className="mb-5 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ próximo passo</p><h2 className="max-w-lg font-display text-5xl font-semibold leading-[.98] tracking-[-.045em] text-white sm:text-6xl">E se o próximo vídeo fosse feito para fazer mais do que preencher o feed?</h2><p className="mt-7 max-w-md text-base leading-8 text-slate-300">Conte o mínimo para começarmos. Vamos entender sua marca, seu público e o que o conteúdo precisa movimentar.</p></div><div className="mt-12 hidden items-center gap-3 text-xs text-slate-400 sm:flex"><CircleCheck className="h-4 w-4 text-[#9fe4e5]" /> Sem obrigação de contratação</div></div><ContactForm compact serviceValue="conteudo-para-redes-sociais" /></div></section>
      <Footer />
    </div>
  );
}

function CasesPage() {
  usePageMeta(
    'Cases de Marketing e Crescimento',
    'Conheça cases da VG Consultoria em Marketing e veja como estratégia, marca, processos e mídia ajudaram empresas a crescer.',
  );
  return (
    <div className="site-shell art-directed overflow-hidden">
      <section className="relative isolate overflow-hidden bg-[#202f4d] text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-45" />
        <div className="pointer-events-none absolute -right-20 top-16 h-[430px] w-[430px] rounded-full border border-[#9fe4e5]/15 lg:h-[600px] lg:w-[600px]" />
        <div className="pointer-events-none absolute -right-4 top-32 h-[290px] w-[290px] rounded-full border border-[#c88982]/20 lg:h-[420px] lg:w-[420px]" />
        <div className="pointer-events-none absolute bottom-0 left-[44%] h-40 w-40 rounded-full bg-[#9fe4e5]/10 blur-3xl" />
        <Header />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-36 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:px-10 lg:pb-24 lg:pt-44">
          <div className="reveal">
            <p className="mb-6 flex items-center gap-3 font-mono-vg text-[10px] uppercase tracking-[.22em] text-[#b8d9da]">
              <span className="h-2 w-2 rounded-full bg-[#b8d9da]" /> Cases / seleção de projetos
            </p>
            <h1 className="max-w-4xl font-display text-6xl font-semibold leading-[.91] tracking-[-.055em] sm:text-8xl lg:text-[7.4rem]">
              Cases de marketing que<br /><span className="text-[#b8d9da]">mudam o ritmo.</span>
            </h1>
          </div>
          <div className="reveal reveal-delay-2 lg:justify-self-end">
            <p className="max-w-sm text-base leading-8 text-slate-300">
              Projetos diferentes, um mesmo princípio: transformar marketing em direção, processo e crescimento que pode ser percebido.
            </p>
            <div className="mt-10 grid grid-cols-3 border-t border-white/15 pt-5">
              <div><p className="font-display text-3xl font-semibold text-[#b8d9da]">06</p><p className="mt-2 font-mono-vg text-[9px] uppercase tracking-[.16em] text-slate-400">projetos</p></div>
              <div><p className="font-display text-3xl font-semibold text-white">03</p><p className="mt-2 font-mono-vg text-[9px] uppercase tracking-[.16em] text-slate-400">estados</p></div>
              <div><p className="font-display text-3xl font-semibold text-white">01</p><p className="mt-2 font-mono-vg text-[9px] uppercase tracking-[.16em] text-slate-400">método</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#f5f7fa]">
        <div className="pointer-events-none absolute -left-20 top-24 h-48 w-48 rounded-full bg-[#b8d9da]/25 blur-2xl" />
        <div className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
          <div className="mb-16 grid gap-8 lg:grid-cols-[.55fr_1.45fr] lg:items-end">
            <div className="flex items-center gap-3 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]"><span className="h-px w-8 bg-[#58739f]" /> O que construímos</div>
            <div>
              <h2 className="max-w-4xl font-display text-4xl font-semibold leading-[1.04] tracking-[-.04em] text-[#202f4d] sm:text-5xl lg:text-6xl">
                Não são apenas entregas.<br />São <span className="text-[#b96762]">mudanças de rota.</span>
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#56657d]">Da criação de uma marca à organização de um processo comercial, cada projeto encontra a forma certa de fazer o marketing trabalhar a favor do negócio. Conheça experiências da VG em Fortaleza, São Paulo, Curitiba, Porto Alegre e outras regiões do Brasil.</p>
            </div>
          </div>

          <div className="space-y-4">
            {CASE_STUDIES.map((item, index) => (
              <article
                key={item.client}
                className={`group relative overflow-hidden rounded-[1.4rem] border border-[#cbd6e1] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#9fb3c8] hover:shadow-[0_18px_45px_rgba(32,47,77,.10)] sm:p-8 lg:p-10 ${item.featured ? 'lg:grid lg:grid-cols-[.9fr_1.1fr] lg:gap-16' : 'lg:grid lg:grid-cols-[6rem_1fr_1fr] lg:items-start lg:gap-10'}`}
              >
                <div className="pointer-events-none absolute right-0 top-0 h-full w-1 bg-[#b8d9da] opacity-70" />
                <div className="relative">
                  {item.logo ? (
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-[#17302f]/15 bg-[#102525] p-2 shadow-sm">
                      <img src={assetUrl(item.logo)} alt={`Logo da empresa ${item.client}`} width="80" height="80" loading="lazy" decoding="async" className="h-full w-full object-contain" />
                    </div>
                  ) : (
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full font-display text-sm font-bold ${item.tone} ${item.tone === 'bg-[#202f4d]' ? 'text-[#b8d9da]' : 'text-[#202f4d]'}`}>{item.mark}</div>
                  )}
                  <span className="mt-5 block font-mono-vg text-[10px] tracking-[.16em] text-[#9caac0]">0{index + 1} / 06</span>
                </div>
                <div className="relative mt-8 lg:mt-0">
                  <p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#58739f]">{item.location}</p>
                  <h3 className="mt-3 max-w-xl font-display text-3xl font-semibold leading-[1.03] tracking-[-.035em] text-[#202f4d] sm:text-4xl">{item.client}</h3>
                  <p className="mt-5 max-w-md text-sm font-bold leading-6 text-[#405471]">{item.summary}</p>
                </div>
                <div className="relative mt-7 border-t border-[#d9e0e9] pt-5 lg:mt-0 lg:border-t-0 lg:border-l lg:pl-10">
                  <p className="max-w-xl text-sm leading-7 text-[#56657d]">{item.detail}</p>
                  <div className="mt-6 flex items-center gap-2 font-mono-vg text-[9px] uppercase tracking-[.16em] text-[#9caac0]"><span className="h-px w-6 bg-[#c88982]" /> Projeto VG</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#202f4d] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-[1fr_auto] lg:items-center lg:px-10 lg:py-24">
          <div>
            <p className="mb-5 font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">/ o próximo case pode ser o seu</p>
            <h2 className="max-w-3xl font-display text-4xl font-semibold leading-[1.02] tracking-[-.04em] text-white sm:text-6xl">
              O seu desafio merece mais do que uma solução pronta.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300">Vamos entender o momento da sua empresa e encontrar o próximo movimento com você.</p>
          </div>
          <Link href="/#contato" data-testid="link-cases-cta" className="button-lift flex w-fit items-center gap-3 rounded-lg bg-[#b8d9da] px-6 py-4 text-sm font-extrabold text-[#202f4d]">
            Quero conversar <ArrowDownRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ServicePage({ service }: { service: Service }) {
  const [openBullet, setOpenBullet] = useState<number | null>(null);
  usePageMeta(`${service.accent} | Consultoria VG`, `${service.description} Conheça a consultoria de ${service.accent.toLowerCase()} da VG Marketing.`);
  return (
    <div className="site-shell overflow-hidden">
      <section className="relative bg-[#202f4d] text-white">
        <div className="absolute inset-0 bg-grid-dark opacity-50" />
        <Header />
        <PageIntro label={`${service.number} / ${service.eyebrow}`} title={service.title} text={service.description} />
        <div className="relative mx-auto max-w-7xl px-5 pb-14 lg:px-10 lg:pb-24"><div className="flex items-center gap-3 font-mono-vg text-[10px] uppercase tracking-[.18em] text-slate-400"><span className="h-px w-16 bg-[#9fe4e5]" /> {service.idealFor}</div></div>
      </section>

      <section className="bg-[#f5f7fa]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 py-20 lg:grid-cols-[.72fr_1.28fr] lg:px-10 lg:py-28">
          <div><DarkSectionHeading eyebrow="/ o que fazemos" title={<>A estratégia vira prática quando existe <span className="text-[#58739f]">método.</span></>} /><div className="mt-10 flex items-center gap-4 border-t border-[#d9e0e9] pt-5"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#202f4d] text-[#9fe4e5]"><Crosshair className="h-5 w-5" /></div><p className="text-sm font-semibold leading-6 text-[#202f4d]">Diagnóstico, decisão,<br />desdobramento e aprendizado.</p></div></div>
          <div className="grid gap-0 border-t border-[#b8c6d7]">
            {service.bullets.map((bullet, index) => {
              const detail = service.bulletDetails?.[index];
              const isOpen = openBullet === index;
              return (
                <div key={bullet} className="border-b border-[#d9e0e9]">
                  <button type="button" onClick={() => detail && setOpenBullet(isOpen ? null : index)} aria-expanded={detail ? isOpen : undefined} className={`group flex w-full items-center gap-6 py-6 text-left ${detail ? 'cursor-pointer' : 'cursor-default'}`}>
                    <span className="font-mono-vg text-[10px] text-[#9caac0]">0{index + 1}</span>
                    <p className="flex-1 font-display text-2xl font-medium tracking-[-.02em] text-[#202f4d] transition-colors group-hover:text-[#58739f]">{bullet}</p>
                    <ArrowRight className={`h-4 w-4 shrink-0 text-[#9caac0] transition-all ${isOpen ? 'rotate-90 text-[#58739f]' : 'group-hover:translate-x-1 group-hover:text-[#58739f]'}`} />
                  </button>
                  {detail && isOpen && <p className="reveal pb-6 pl-12 pr-8 text-sm leading-7 text-[#56657d] sm:pl-16">{detail}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#e6edf4]">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:py-28">
          <div><p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#58739f]">/ o que fica</p><h2 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.03] tracking-[-.04em] text-[#202f4d] sm:text-6xl">Não é só uma entrega. É <span className="text-[#58739f]">capacidade.</span></h2><p className="mt-7 max-w-lg text-base leading-8 text-[#56657d]">O projeto precisa continuar trabalhando depois da nossa reunião. Por isso, tudo é construído para ser entendido, usado e evoluir com o seu time.</p></div>
          <div className="rounded-2xl border border-[#c3d1df] bg-[#f5f7fa] p-7 sm:p-9"><p className="mb-6 font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#58739f]">Inclui</p>{service.deliverables.map((item) => <div key={item} className="flex items-start gap-3 border-t border-[#d9e0e9] py-4 text-sm font-semibold text-[#202f4d]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#58739f]" />{item}</div>)}</div>
        </div>
      </section>

      <section className="bg-[#202f4d] text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1fr_auto] lg:px-10 lg:py-20"><div><p className="font-mono-vg text-[10px] uppercase tracking-[.18em] text-[#9fe4e5]">/ um sinal do trabalho</p><p className="mt-5 max-w-xl font-display text-3xl font-semibold leading-tight tracking-[-.03em] sm:text-4xl">{service.metric} <span className="font-sans text-base font-medium tracking-normal text-slate-300">{service.metricLabel}.</span></p></div><LogoMark className="h-28 w-28" /></div>
      </section>

      <ContactBand />
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <ErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/login" component={() => <Redirect to="/sign-in" />} />
        <Route path="/admin" component={ProtectedAdmin} />
        <Route path="/sobre-a-vg" component={AboutPage} />
        <Route path="/cases" component={CasesPage} />
        {SERVICES.map((service) => <Route key={service.slug} path={`/servicos/${service.slug}`}>{service.slug === 'trafego-pago' ? <PaidTrafficPage service={service} /> : service.slug === 'consultoria-de-marketing' ? <MarketingConsultingPage service={service} /> : service.slug === 'internalizacao-de-marketing' ? <InternalizationPage service={service} /> : service.slug === 'manager-as-a-service' ? <ManagerAsServicePage service={service} /> : service.slug === 'branding' ? <BrandingPage service={service} /> : service.slug === 'conteudo-para-redes-sociais' ? <SocialContentPage service={service} /> : <ServicePage service={service} />}</Route>)}
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

export function PublicPage({ path }: { path: string }) {
  return (
    <WouterRouter base={basePath} ssrPath={path}>
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
    </WouterRouter>
  );
}

 function App() {
  if (!clerkPubKey) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#071c2a] px-5 text-center text-white">
        <div className="max-w-md">
          <LogoMark className="mx-auto mb-6 h-20 w-20" />
          <p className="font-mono-vg text-[10px] uppercase tracking-[.2em] text-[#9fe4e5]">Acesso empresa</p>
          <h1 className="mt-4 font-display text-3xl font-semibold">Login temporariamente indisponível</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            A autenticação ainda não foi configurada neste ambiente. Atualize a publicação e tente novamente.
          </p>
        </div>
      </main>
    );
  }

  return (
    <WouterRouter base={basePath}>
      <ClerkProvider
        publishableKey={clerkPubKey}
        proxyUrl={clerkProxyUrl}
        appearance={clerkAppearance}
        signInUrl={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        localization={{
          signIn: {
            start: {
              title: 'Entrar no CRM de Marketing',
              subtitle: 'Acesse seus leads e oportunidades',
            },
          },
          formFieldLabel__emailAddress: 'E-mail',
          formFieldLabel__password: 'Senha',
          formFieldInputPlaceholder__emailAddress: 'seu@email.com',
          formFieldInputPlaceholder__password: 'Sua senha',
          formButtonPrimary: 'Entrar',
          dividerText: 'ou',
          footerActionLink__useAnotherMethod: 'Usar outro método',
        }}
        routerPush={(to) => window.history.pushState({}, '', stripBase(to))}
        routerReplace={(to) => window.history.replaceState({}, '', stripBase(to))}
      >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#9fe4e5] focus:px-4 focus:py-3 focus:font-bold focus:text-[#202f4d]">
              Pular para o conteúdo principal
            </a>
            <main id="main-content">
              <Router />
            </main>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </WouterRouter>
  );
}

export default App;