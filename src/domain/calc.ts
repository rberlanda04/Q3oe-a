import type { Desconto, ItemOrcamento, OpcaoPix, Orcamento, Totais } from './types'

export function subtotalItem(item: ItemOrcamento): number {
  const quantidade = Math.max(item.quantidade, 0)
  const preco = Math.max(item.precoUnitarioCentavos, 0)
  return Math.round(quantidade * preco)
}

export function valorDesconto(desconto: Desconto, subtotal: number): number {
  const valor = Number.isFinite(desconto.valor) ? Math.max(desconto.valor, 0) : 0
  if (desconto.tipo === 'percentual') {
    return Math.round((subtotal * Math.min(valor, 100)) / 100)
  }
  return Math.min(Math.round(valor), subtotal)
}

export function calcularTotais(
  orcamento: Pick<Orcamento, 'itens' | 'desconto' | 'deslocamentoCentavos'>,
): Totais {
  let servicos = 0
  let materiais = 0
  for (const item of orcamento.itens) {
    if (item.tipo === 'material') materiais += subtotalItem(item)
    else servicos += subtotalItem(item)
  }
  const subtotal = servicos + materiais
  const desconto = valorDesconto(orcamento.desconto, subtotal)
  const deslocamento = Math.max(Math.round(orcamento.deslocamentoCentavos || 0), 0)
  return { servicos, materiais, subtotal, desconto, deslocamento, total: subtotal - desconto + deslocamento }
}

export function formatarNumero(ano: number, sequencia: number): string {
  return `${ano}-${String(sequencia).padStart(4, '0')}`
}

/**
 * Próximo número sequencial do orçamento. Usa o último número salvo; em contas
 * antigas, o contador legado já guarda essa mesma informação.
 */
export function proximaSequencia(perfil: { ultimoNumero?: number; proximoNumero?: number }): number {
  return Math.max(perfil.ultimoNumero ?? perfil.proximoNumero ?? 0, 0) + 1
}

export function dataValidade(criadoEm: number, validadeDias: number): Date {
  const data = new Date(criadoEm)
  data.setDate(data.getDate() + Math.max(validadeDias, 0))
  return data
}

export const PIX_PADRAO: OpcaoPix = { modo: 'total', percentual: 50 }

/** Completa orçamentos salvos por versões antigas do app com os campos novos. */
export function normalizarOrcamento(dados: Partial<Orcamento> & Pick<Orcamento, 'id'>): Orcamento {
  return {
    numero: '',
    profissao: 'outro',
    cliente: { nome: '', telefone: '', endereco: '' },
    itens: [],
    desconto: { tipo: 'percentual', valor: 0 },
    deslocamentoCentavos: 0,
    condicoesPagamento: '',
    prazoExecucao: '',
    validadeDias: 15,
    garantia: '',
    observacoes: '',
    status: 'rascunho',
    criadoEm: 0,
    atualizadoEm: 0,
    ...dados,
    pix: { ...PIX_PADRAO, ...dados.pix },
    pagamentos: dados.pagamentos ?? [],
  }
}

/** Valor que vai no QR Code Pix, ou null quando o Pix não deve aparecer. */
export function valorPix(orcamento: Pick<Orcamento, 'pix'>, total: number): number | null {
  switch (orcamento.pix.modo) {
    case 'nao-incluir':
      return null
    case 'sem-valor':
      return 0
    case 'percentual':
      return Math.round((total * Math.min(Math.max(orcamento.pix.percentual, 0), 100)) / 100)
    default:
      return total
  }
}

export function totalRecebido(orcamento: Pick<Orcamento, 'pagamentos'>): number {
  return orcamento.pagamentos.reduce((soma, p) => soma + p.valorCentavos, 0)
}

/** Identificador estável de um item do catálogo a partir da descrição. */
export function chaveCatalogo(descricao: string): string {
  return (
    descricao
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || 'item'
  )
}
