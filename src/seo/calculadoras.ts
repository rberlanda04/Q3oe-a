import type { ProfissaoId } from '../domain/types'

/** Conteúdo das páginas /calculadora/:slug. Cada uma responde uma busca comum de quem presta serviço. */
export interface ConteudoCalculadora {
  slug: 'pintura' | 'piso' | 'valor-da-hora'
  /** Título da página (até 70 caracteres com o sufixo). */
  titulo: string
  h1: string
  descricao: string
  intro: string
  /** Modelo de orçamento que a chamada abre. */
  modelo: ProfissaoId
  perguntas: [string, string][]
}

export const CALCULADORAS: ConteudoCalculadora[] = [
  {
    slug: 'pintura',
    titulo: 'Calculadora de tinta e de preço de pintura por m²',
    h1: 'Calculadora de pintura: tinta e mão de obra por m²',
    descricao:
      'Calcule grátis quantos litros e latas de tinta precisa e quanto cobrar pela pintura por m², já descontando portas e janelas e somando as demãos.',
    intro:
      'Coloque a área das paredes, desconte portas e janelas e informe o rendimento da tinta. A conta mostra os litros, as latas e o valor da mão de obra para você passar ao cliente.',
    modelo: 'pintor',
    perguntas: [
      ['Como calcular a área de uma parede?', 'Multiplique a largura pela altura. Para um cômodo, some as quatro paredes (perímetro × pé-direito) e desconte portas (cerca de 1,6 m² cada) e janelas.'],
      ['Quantas demãos de tinta são necessárias?', 'Em geral duas. Paredes novas, cores fortes ou troca de escuro para claro podem pedir três. O rendimento por demão vem na lata.'],
      ['Quanto cobrar por m² de pintura?', 'Depende da região, do tipo de superfície e de quem fornece o material. Use a calculadora do valor da hora para chegar ao seu preço mínimo.'],
    ],
  },
  {
    slug: 'piso',
    titulo: 'Calculadora de piso, argamassa e rejunte',
    h1: 'Calculadora de piso: caixas, argamassa e rejunte',
    descricao:
      'Calcule grátis quantas caixas de piso ou porcelanato comprar com a perda, quantos sacos de argamassa e quantos quilos de rejunte, e o valor da mão de obra.',
    intro:
      'Informe a área, o tamanho da peça e quanto vem em cada caixa. A conta soma a sobra para recortes e mostra o material e a mão de obra, prontos para o orçamento.',
    modelo: 'azulejista',
    perguntas: [
      ['Quanto de perda considerar no piso?', 'Use 10% para assentamento reto e 15% para diagonal ou peças muito grandes. A sobra cobre recortes, quebras e uma reserva para reparo futuro.'],
      ['Quanta argamassa vai por m²?', 'Cerca de 5 kg por m² em colagem simples e 8 kg por m² em dupla colagem, usada em porcelanato acima de 60 × 60. Confira a indicação do fabricante.'],
      ['Como calcular o rejunte?', 'Os fabricantes usam (C + L) ÷ (C × L) × espessura × junta × 1,58, com as medidas em mm. A calculadora já faz essa conta.'],
    ],
  },
  {
    slug: 'valor-da-hora',
    titulo: 'Quanto cobrar por hora de serviço: calculadora grátis',
    h1: 'Quanto cobrar por hora e por diária de serviço',
    descricao:
      'Descubra o valor mínimo da sua hora e da sua diária a partir da renda que você quer, dos gastos do trabalho e do tempo que não é pago, como orçamento e deslocamento.',
    intro:
      'Muita gente cobra pouco porque esquece os gastos e o tempo que não vira dinheiro: visita para orçamento, trânsito, compra de material. A calculadora coloca tudo na conta.',
    modelo: 'outro',
    perguntas: [
      ['O que entra nos gastos do trabalho?', 'Transporte e combustível, ferramentas e manutenção, celular e internet, o DAS do MEI e a contribuição ao INSS. Some a média do mês.'],
      ['Por que descontar tempo não pago?', 'Uma parte do dia vai em orçamento, deslocamento e compras. Se essas horas não entram no preço, você trabalha de graça nelas. 20% a 30% é comum.'],
      ['Cobro por hora, por diária ou por serviço?', 'O valor da hora é a base. Para o cliente, muitas vezes é melhor fechar por serviço ou por m²: estime as horas e multiplique pelo seu valor.'],
    ],
  },
]

export const caminhoCalculadora = (c: ConteudoCalculadora) => `/calculadora/${c.slug}`

export function calculadoraPorSlug(slug: string | undefined): ConteudoCalculadora | undefined {
  return CALCULADORAS.find((c) => c.slug === slug)
}
