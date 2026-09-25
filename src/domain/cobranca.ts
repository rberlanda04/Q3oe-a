import { calcularTotais, valorPix } from './calc'
import { gerarPixCopiaECola } from './pix'
import type { FormaPagamento, Orcamento, PerfilPublico } from './types'

export interface CobrancaPix {
  codigo: string
  valorCentavos: number
}

/** Código Pix copia-e-cola do orçamento, conforme a opção escolhida. */
export function pixDoOrcamento(
  orcamento: Pick<Orcamento, 'numero' | 'pix' | 'itens' | 'desconto' | 'deslocamentoCentavos'>,
  perfil: Pick<PerfilPublico, 'pix' | 'pixTipo' | 'nome' | 'cidade'>,
): CobrancaPix | null {
  if (!perfil.pix.trim()) return null
  const valor = valorPix(orcamento, calcularTotais(orcamento).total)
  if (valor === null) return null
  return {
    valorCentavos: valor,
    codigo: gerarPixCopiaECola({
      chave: perfil.pix,
      tipo: perfil.pixTipo,
      nome: perfil.nome,
      cidade: perfil.cidade,
      valorCentavos: valor,
      txid: `ORC${orcamento.numero}`,
    }),
  }
}

export const FORMAS_PAGAMENTO: Record<FormaPagamento, string> = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao: 'Cartão',
  transferencia: 'Transferência bancária',
  outro: 'Outro',
}

/** Próximo número de recibo do orçamento: 2026-0001-R1, R2... */
export function proximoNumeroRecibo(orcamento: Pick<Orcamento, 'numero' | 'pagamentos'>): string {
  const maior = orcamento.pagamentos.reduce((max, p) => {
    const n = Number(p.numeroRecibo.split('-R').pop())
    return Number.isFinite(n) ? Math.max(max, n) : max
  }, 0)
  return `${orcamento.numero}-R${maior + 1}`
}
