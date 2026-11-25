import { SITE_URL } from '../config'
import { MODELOS } from '../domain/templates'
import { CALCULADORAS, caminhoCalculadora } from './calculadoras'
import { caminhoGuia, GUIAS } from './guias'
import { PROFISSOES_SEO, type ConteudoProfissao } from './profissoes'

/** Metadados de cada página pública pré-renderizada. */
export interface PaginaSeo {
  caminho: string
  titulo: string
  descricao: string
  /** Dados estruturados (schema.org) em JSON-LD. */
  dados: object[]
  prioridade: number
  /** Imagem da prévia do link (1200 × 630), a partir da raiz do site. Sem ela, vale a imagem geral. */
  imagem?: string
}

const ORGANIZACAO = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organizacao`,
  name: 'Q3 Orça',
  url: SITE_URL,
  logo: `${SITE_URL}/icone-512.png`,
  slogan: 'Orçamento rápido, aprovado pelo celular.',
}

export const PERGUNTAS_HOME: [string, string][] = [
  ['Preciso instalar alguma coisa?', 'Não. O Q3 Orça abre no navegador do celular. Se quiser, adicione à tela inicial e ele vira um app.'],
  ['Meu cliente precisa ter o app?', 'Não. Ele recebe um PDF ou um link no WhatsApp e abre em qualquer celular, sem cadastro.'],
  ['O Pix passa por vocês?', 'Não. O QR Code aponta direto para a sua chave Pix. O dinheiro cai na sua conta, sem intermediário e sem taxa.'],
  ['O orçamento tem valor fiscal?', 'Orçamento, recibo e garantia são documentos comerciais. Eles não substituem a nota fiscal quando ela for obrigatória.'],
  ['E se eu trocar de celular?', 'Seus dados ficam guardados na nuvem, ligados à sua conta. É só entrar de novo. Você também pode baixar uma cópia completa.'],
]

/** Dúvidas respondidas na página de contato, antes do formulário. */
export const PERGUNTAS_CONTATO: [string, string][] = [
  ['Em quanto tempo vocês respondem?', 'Respondemos por e-mail em horário comercial. Quem já tem conta também pode abrir um chamado em Ajuda, dentro do app, e acompanhar a conversa por lá.'],
  ['O Q3 Orça é grátis mesmo?', 'Sim. Orçamentos ilimitados, link de aprovação, Pix, recibo e garantia são grátis para sempre. O Pro, de R$ 14,90 por mês ou R$ 99 por ano, coloca o seu logo e a sua cor nos documentos.'],
  ['Minha profissão não está na lista. Consigo usar?', 'Consegue. Escolha "Outro serviço" e cadastre os seus itens: eles ficam salvos para os próximos orçamentos. Se quiser um modelo pronto para a sua área, peça pelo formulário.'],
  ['Vocês fazem parceria com lojas e associações?', 'Fazemos. Lojas de material, distribuidores, sindicatos e associações de profissionais podem divulgar o Q3 Orça para os seus clientes e associados. Conte pelo formulário como é o seu público.'],
  ['Como apago a minha conta e os meus dados?', 'No app, em Meus dados, há a opção de baixar uma cópia de tudo e de excluir a conta. A exclusão apaga orçamentos, clientes e links públicos, conforme a LGPD.'],
]

/** Endereço do gerador de orçamento sem cadastro. */
export const CAMINHO_GERADOR = '/gerador-de-orcamento'

/** Dúvidas da página do gerador de orçamento sem cadastro. */
export const PERGUNTAS_GERADOR: [string, string][] = [
  ['Preciso me cadastrar para gerar o orçamento?', 'Não. Escolha a profissão, preencha o cliente, os itens e os valores, e baixe o PDF. Nada fica salvo: ao fechar a página, o orçamento some.'],
  ['O gerador de orçamento é grátis?', 'É. Gerar, baixar e imprimir não custa nada e não tem limite. O PDF sai com a marca d’água e o link do Q3 Orça.'],
  ['Como fazer um orçamento fácil e rápido?', 'Comece pelo modelo da sua profissão: os serviços mais pedidos já vêm na lista. Ajuste a quantidade e o valor de cada item, coloque o desconto, se houver, e confira o total na prévia.'],
  ['Os dados que eu digito vão para algum lugar?', 'Não. O gerador funciona só no seu navegador. Cliente, itens e valores não são enviados nem guardados pelo Q3 Orça.'],
  ['O que muda quando eu crio a conta grátis?', 'Você envia o orçamento por link no WhatsApp, o cliente aprova pelo celular e você acompanha a resposta. Clientes, preços e orçamentos ficam salvos, e o documento ganha QR Code Pix, recibo e garantia.'],
  ['O orçamento gerado tem valor fiscal?', 'Orçamento é um documento comercial. Ele não substitui a nota fiscal quando ela for obrigatória.'],
]

function faq(perguntas: [string, string][]) {
  return {
    '@type': 'FAQPage',
    mainEntity: perguntas.map(([p, r]) => ({ '@type': 'Question', name: p, acceptedAnswer: { '@type': 'Answer', text: r } })),
  }
}

function migalhas(itens: [string, string][]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: itens.map(([nome, caminho], i) => ({ '@type': 'ListItem', position: i + 1, name: nome, item: `${SITE_URL}${caminho}` })),
  }
}

export const caminhoProfissao = (p: ConteudoProfissao) => `/modelo-de-orcamento/${p.slug}`

export const PAGINAS_SEO: PaginaSeo[] = [
  {
    caminho: '/',
    titulo: 'Q3 Orça · Orçamento rápido, aprovado pelo celular',
    descricao:
      'Monte orçamentos profissionais em 2 minutos, envie pelo WhatsApp e receba por Pix. Grátis para eletricista, pintor, pedreiro, diarista e mais 24 profissões.',
    prioridade: 1,
    dados: [
      ORGANIZACAO,
      {
        '@type': 'SoftwareApplication',
        name: 'Q3 Orça',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, Android, iOS',
        url: SITE_URL,
        description: 'Gerador de orçamentos para prestadores de serviço, com link de aprovação, QR Code Pix e recibo.',
        offers: [
          { '@type': 'Offer', name: 'Grátis', price: '0', priceCurrency: 'BRL' },
          { '@type': 'Offer', name: 'Pro mensal', price: '14.90', priceCurrency: 'BRL' },
        ],
        publisher: { '@id': `${SITE_URL}/#organizacao` },
      },
      faq(PERGUNTAS_HOME),
    ],
  },
  {
    caminho: CAMINHO_GERADOR,
    titulo: 'Gerador de orçamento grátis e sem cadastro · Q3 Orça',
    descricao:
      'Gere orçamento grátis, fácil e rápido, sem cadastro: escolha a profissão, preencha cliente, itens e valores e baixe o PDF ou imprima na hora.',
    prioridade: 0.9,
    dados: [
      migalhas([['Início', '/'], ['Gerador de orçamento', CAMINHO_GERADOR]]),
      {
        '@type': 'WebApplication',
        name: 'Gerador de orçamento grátis',
        url: `${SITE_URL}${CAMINHO_GERADOR}`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        publisher: { '@id': `${SITE_URL}/#organizacao` },
      },
      faq(PERGUNTAS_GERADOR),
    ],
  },
  {
    caminho: '/modelos-de-orcamento',
    titulo: 'Modelos de orçamento grátis por profissão · Q3 Orça',
    descricao: `Modelos de orçamento prontos para ${MODELOS.length - 1} profissões: eletricista, encanador, pintor, pedreiro, diarista e mais. Preencha no celular e envie pelo WhatsApp.`,
    prioridade: 0.9,
    dados: [ORGANIZACAO, migalhas([['Início', '/'], ['Modelos de orçamento', '/modelos-de-orcamento']])],
  },
  ...PROFISSOES_SEO.map(
    (p): PaginaSeo => ({
      caminho: caminhoProfissao(p),
      titulo: `Modelo de orçamento para ${p.para} grátis · Q3 Orça`,
      descricao: p.descricao,
      prioridade: 0.8,
      imagem: `/og/${p.slug}.jpg`,
      dados: [
        migalhas([
          ['Início', '/'],
          ['Modelos de orçamento', '/modelos-de-orcamento'],
          [`Orçamento para ${p.para}`, caminhoProfissao(p)],
        ]),
        faq(p.perguntas),
      ],
    }),
  ),
  {
    caminho: '/calculadoras',
    titulo: 'Calculadoras grátis para prestadores de serviço · Q3 Orça',
    descricao: 'Calculadoras grátis de tinta e pintura por m², piso, argamassa e rejunte, e de quanto cobrar por hora de serviço. Sem cadastro, direto no celular.',
    prioridade: 0.8,
    dados: [ORGANIZACAO, migalhas([['Início', '/'], ['Calculadoras', '/calculadoras']])],
  },
  ...CALCULADORAS.map(
    (c): PaginaSeo => ({
      caminho: caminhoCalculadora(c),
      titulo: `${c.titulo} · Q3 Orça`,
      descricao: c.descricao,
      prioridade: 0.8,
      dados: [
        migalhas([
          ['Início', '/'],
          ['Calculadoras', '/calculadoras'],
          [c.h1, caminhoCalculadora(c)],
        ]),
        {
          '@type': 'WebApplication',
          name: c.h1,
          url: `${SITE_URL}${caminhoCalculadora(c)}`,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'BRL' },
        },
        faq(c.perguntas),
      ],
    }),
  ),
  ...GUIAS.map(
    (g): PaginaSeo => ({
      caminho: caminhoGuia(g),
      titulo: `${g.titulo} · Q3 Orça`,
      descricao: g.descricao,
      prioridade: 0.8,
      dados: [
        migalhas([
          ['Início', '/'],
          [g.h1, caminhoGuia(g)],
        ]),
        faq(g.perguntas),
      ],
    }),
  ),
  {
    caminho: '/beta',
    titulo: 'Fase de testes do Q3 Orça · Pro grátis para os primeiros',
    descricao: 'Teste grátis o Q3 Orça, app de orçamento para eletricistas, pintores e prestadores de serviço. Pro liberado durante a fase de testes.',
    prioridade: 0.6,
    dados: [ORGANIZACAO],
  },
  {
    caminho: '/contato',
    titulo: 'Fale conosco · Q3 Orça',
    descricao: 'Fale com a equipe do Q3 Orça: dúvidas antes de começar, parcerias e sugestões. Respondemos por e-mail em horário comercial.',
    prioridade: 0.4,
    dados: [ORGANIZACAO, faq(PERGUNTAS_CONTATO)],
  },
  {
    caminho: '/termos',
    titulo: 'Termos de uso · Q3 Orça',
    descricao: 'Termos de uso do Q3 Orça: conta, planos grátis e Pro, pagamento, cancelamento e responsabilidades de quem usa o serviço.',
    prioridade: 0.2,
    dados: [ORGANIZACAO],
  },
  {
    caminho: '/privacidade',
    titulo: 'Política de privacidade · Q3 Orça',
    descricao: 'Como o Q3 Orça trata dados pessoais conforme a LGPD: o que guardamos, com quem compartilhamos e como baixar ou apagar seus dados.',
    prioridade: 0.2,
    dados: [ORGANIZACAO],
  },
  {
    caminho: '/marca',
    titulo: 'Manual da marca · Q3 Orça',
    descricao: 'Manual da marca Q3 Orça: logotipo, símbolo, cores, tipografia, tom de voz e exemplos de uso em cartazes, redes sociais e documentos.',
    prioridade: 0.3,
    dados: [ORGANIZACAO],
  },
]

const escapar = (texto: string) =>
  texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Tags do <head> de uma página: título, descrição, canônico, Open Graph e JSON-LD. */
export function headDaPagina(p: PaginaSeo): string {
  const url = `${SITE_URL}${p.caminho === '/' ? '/' : p.caminho}`
  const imagem = `${SITE_URL}${p.imagem ?? '/og-imagem.png'}`
  const jsonLd = JSON.stringify({ '@context': 'https://schema.org', '@graph': p.dados }).replace(/</g, '\\u003c')
  return [
    `<title>${escapar(p.titulo)}</title>`,
    `<meta name="description" content="${escapar(p.descricao)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:site_name" content="Q3 Orça" />`,
    `<meta property="og:title" content="${escapar(p.titulo)}" />`,
    `<meta property="og:description" content="${escapar(p.descricao)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${imagem}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ')
}

/** Caminhos que não devem aparecer no Google: área logada e orçamentos de clientes. */
export const CAMINHOS_PRIVADOS = ['/o/', '/entrar', '/novo', '/orcamento/', '/clientes', '/catalogo', '/perfil', '/planos', '/admin', '/ajuda', '/site']

export function robotsTxt(): string {
  return ['User-agent: *', 'Allow: /', ...CAMINHOS_PRIVADOS.map((c) => `Disallow: ${c}`), '', `Sitemap: ${SITE_URL}/sitemap.xml`, ''].join('\n')
}

export function sitemapXml(data: string): string {
  const urls = PAGINAS_SEO.map(
    (p) =>
      `  <url><loc>${SITE_URL}${p.caminho}</loc><lastmod>${data}</lastmod><priority>${p.prioridade.toFixed(1)}</priority></url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}
