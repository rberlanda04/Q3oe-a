import type { ProfissaoId } from '../domain/types'

/** Mesmo endereço de CAMINHO_GERADOR (paginas.ts), repetido aqui para não criar import circular. */
const CAMINHO_GERADOR_SEM_CADASTRO = '/gerador-de-orcamento'

/**
 * Guias de preço (/quanto-cobrar/:slug) e de "como fazer" (/como-fazer/:slug), para quem
 * busca no Google como cobrar ou montar o orçamento. Público: o profissional que vai cobrar.
 * Regra: nenhum preço inventado. A conta usa os números do próprio leitor; faixa de mercado
 * só com fonte e data citadas na página.
 */
export interface ConteudoGuia {
  tipo: 'quanto-cobrar' | 'como-fazer'
  slug: string
  /** Título da aba e do Google (até 60 caracteres, sem o sufixo). */
  titulo: string
  h1: string
  descricao: string
  /** Resposta curta no topo (2 linhas). */
  resposta: string
  /** Conta ou roteiro, passo a passo. */
  passos: { titulo: string; texto: string }[]
  /** O que pôr no orçamento. */
  itens: string[]
  /** Profissão que o gerador abre; sem ela, a página mostra a escolha da profissão. */
  profissao?: ProfissaoId
  /** Profissões oferecidas quando o guia vale para qualquer serviço. */
  escolhas?: ProfissaoId[]
  perguntas: [string, string][]
  /** Links para modelo e calculadora relacionados: [texto, caminho]. */
  relacionados: [string, string][]
}

export const GUIAS: ConteudoGuia[] = [
  {
    tipo: 'quanto-cobrar',
    slug: 'pintura-por-m2',
    titulo: 'Quanto cobrar por m² de pintura: conta e exemplo',
    h1: 'Quanto cobrar por m² de pintura',
    descricao:
      'Aprenda a calcular o preço da pintura por m²: área real das paredes, demãos, massa corrida e material. Monte o orçamento grátis no celular.',
    resposta:
      'Divida a diária que você precisa ganhar pelos m² que você pinta num dia: esse é o seu m² de mão de obra. Se você fornece o material, some o custo dele por m². Não existe tabela única: o preço certo sai da sua conta.',
    passos: [
      {
        titulo: '1. Meça a área real',
        texto:
          'Some as paredes: perímetro do cômodo × pé-direito. Exemplo de medida: um quarto de 3 × 4 m tem 14 m de perímetro; com pé-direito de 2,6 m, são 36,4 m². Tire a porta (cerca de 1,6 m²) e a janela (largura × altura). O teto é largura × comprimento.',
      },
      {
        titulo: '2. Descubra quantos m² você pinta por dia',
        texto:
          'Use a sua média real, já com lixar, proteger o piso e as demãos. Parede lisa rende mais; massa corrida, textura, grade e teto rendem menos. Se não sabe, anote os próximos três serviços.',
      },
      {
        titulo: '3. Divida a sua diária por essa produtividade',
        texto:
          'Mão de obra por m² = sua diária ÷ m² por dia. Se ainda não sabe a sua diária, a calculadora do valor da hora chega nela a partir da renda que você quer e dos gastos do trabalho.',
      },
      {
        titulo: '4. Some o material, se for seu',
        texto:
          'Tinta, massa, selador, lixa e fita. Some o que vai gastar na obra e divida pela área: é o material por m². Se o cliente compra, deixe fora do preço e escreva isso no orçamento.',
      },
      {
        titulo: '5. Cobre à parte o que não é parede lisa',
        texto:
          'Massa corrida, correção de trincas, textura, portas, janelas e grades levam mais tempo por m². Coloque cada um como item separado, com o seu preço, em vez de esconder no m² da parede.',
      },
    ],
    itens: [
      'Área de cada cômodo (paredes e teto separados), em m²',
      'Mão de obra por m² e número de demãos',
      'Preparação: lixamento, massa corrida, correção de trincas',
      'Material, se for seu (ou a frase "material por conta do cliente")',
      'Prazo em dias, validade do orçamento e garantia',
    ],
    profissao: 'pintor',
    perguntas: [
      ['Como calcular o preço da pintura por m²?', 'Divida a diária que você precisa ganhar pelos m² que pinta num dia. Se fornece o material, some o custo dele por m². Multiplique pela área real das paredes, já sem portas e janelas.'],
      ['O preço do m² inclui a tinta?', 'Só se você fornecer. O mais claro é separar no orçamento: mão de obra por m² de um lado e material do outro, ou a frase "material por conta do cliente".'],
      ['Massa corrida entra no mesmo preço?', 'Não. Massa corrida, textura e correção de trincas tomam mais tempo por m². Cobre como item separado, com o seu preço por m² para cada um.'],
      ['Cobro por m² ou por diária?', 'Por m² o cliente entende melhor e compara orçamentos. Por diária é melhor quando não dá para medir, como em retoques. Nos dois casos, a base é a mesma: a sua diária.'],
      ['Existe uma tabela oficial de preço de pintura?', 'Não há tabela obrigatória. O preço muda com a região, a superfície e quem fornece o material. Calcule pelo seu custo e pela sua produtividade.'],
    ],
    relacionados: [
      ['Calculadora de tinta e pintura', '/calculadora/pintura'],
      ['Quanto cobrar por hora', '/calculadora/valor-da-hora'],
      ['Modelo de orçamento para pintor', '/modelo-de-orcamento/pintor'],
    ],
  },
  {
    tipo: 'como-fazer',
    slug: 'orcamento-de-servico',
    titulo: 'Como fazer orçamento de serviço que o cliente aprova',
    h1: 'Como fazer orçamento de serviço',
    descricao:
      'Passo a passo para fazer orçamento de prestação de serviço: itens, mão de obra e material, prazo, validade e garantia. Com modelo grátis.',
    resposta:
      'Um bom orçamento diz o que vai ser feito, quanto custa cada parte, quando fica pronto e até quando o preço vale. Separe mão de obra de material e mande no mesmo dia da visita.',
    passos: [
      {
        titulo: '1. Seus dados e os do cliente',
        texto: 'Nome ou empresa, CPF ou CNPJ, telefone e WhatsApp. Do cliente: nome, telefone e o endereço do serviço.',
      },
      {
        titulo: '2. Um item por serviço',
        texto:
          'Descreva cada serviço numa linha, com quantidade e unidade (m², ponto, metro, hora, unidade). "Pintura de parede, 2 demãos, 36 m²" é melhor que "pintura do quarto".',
      },
      {
        titulo: '3. Preço de cada item pela sua conta',
        texto:
          'Estime as horas de cada serviço e multiplique pelo valor da sua hora. Some os gastos que são só daquela obra, como deslocamento longe ou aluguel de equipamento.',
      },
      {
        titulo: '4. Material separado da mão de obra',
        texto:
          'Liste o material com quantidade e preço, ou escreva "material por conta do cliente". Assim o cliente vê o que é seu trabalho e o que é compra.',
      },
      {
        titulo: '5. Prazo, pagamento, validade e garantia',
        texto:
          'Quantos dias leva, como paga (Pix, entrada e restante na entrega), até quando o preço vale e qual a garantia do serviço. Isso evita a briga depois.',
      },
      {
        titulo: '6. Envie rápido e acompanhe',
        texto:
          'Mande no mesmo dia, em PDF ou link pelo WhatsApp. Quem responde primeiro costuma fechar. Se o cliente não responder em dois ou três dias, pergunte se ficou alguma dúvida.',
      },
    ],
    itens: [
      'Seus dados e os dados do cliente',
      'Serviços, um por linha, com quantidade e unidade',
      'Valor de cada item e total',
      'Material (ou "por conta do cliente")',
      'Prazo de execução e forma de pagamento',
      'Validade do orçamento e garantia do serviço',
    ],
    escolhas: ['eletricista', 'pintor', 'pedreiro', 'encanador', 'marido-de-aluguel', 'ar-condicionado', 'diarista', 'gesseiro', 'outro'],
    perguntas: [
      ['O que não pode faltar num orçamento de serviço?', 'Seus dados e os do cliente, os serviços com quantidade e valor, o total, o prazo, a forma de pagamento, a validade do orçamento e a garantia.'],
      ['Como calcular o preço do serviço?', 'Estime as horas de cada serviço e multiplique pelo valor da sua hora, que precisa cobrir a renda que você quer, os gastos do trabalho e o tempo que não é pago, como deslocamento.'],
      ['Qual validade colocar no orçamento?', 'Use um prazo curto, que você consegue manter mesmo se o material subir. Escreva a data no próprio orçamento, e não só "X dias".'],
      ['Orçamento pelo WhatsApp vale?', 'Vale como proposta comercial. O ideal é mandar em PDF ou link, com os itens e a validade, e guardar a resposta do cliente aprovando.'],
      ['Orçamento substitui contrato ou nota fiscal?', 'Não. O orçamento aprovado registra o combinado, mas não substitui a nota fiscal quando ela for obrigatória, nem um contrato em obras maiores.'],
    ],
    relacionados: [
      ['Modelos de orçamento por profissão', '/modelos-de-orcamento'],
      ['Quanto cobrar por hora', '/calculadora/valor-da-hora'],
      ['Gerador de orçamento', CAMINHO_GERADOR_SEM_CADASTRO],
    ],
  },
]

export const caminhoGuia = (g: ConteudoGuia) => `/${g.tipo}/${g.slug}`

export function guiaPorCaminho(caminho: string): ConteudoGuia | undefined {
  const limpo = caminho.replace(/\/+$/, '')
  return GUIAS.find((g) => caminhoGuia(g) === limpo)
}

/** Botão do guia para o gerador sem cadastro, com a profissão e o utm do SEO (utm_campaign = slug da página). */
export function linkGeradorDoGuia(g: ConteudoGuia, profissao: ProfissaoId): string {
  const p = new URLSearchParams({ profissao, utm_source: 'site', utm_medium: 'seo', utm_campaign: g.slug })
  return `${CAMINHO_GERADOR_SEM_CADASTRO}?${p.toString()}`
}
