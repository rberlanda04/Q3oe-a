/** Planos do Q3 Orça: grátis, teste do Pro e Pro pago. */

export const DIAS_TESTE_PRO = 14
const DIA = 24 * 60 * 60 * 1000

/** Documento em assinaturas/{uid}. Só o administrador escreve; o profissional apenas lê. */
export interface Assinatura {
  plano: 'pro'
  /** Fim do período pago, em milissegundos. */
  validoAte: number
  /** Para o painel admin identificar o assinante. */
  nome?: string
  email?: string
  /** Último período vendido, para estimar a receita mensal no painel admin. */
  periodo?: 'mensal' | 'anual'
  atualizadoEm?: number
}

/**
 * Nova data de validade ao ativar ou renovar o Pro por alguns meses.
 * Se ainda houver período pago, soma a partir do fim dele; senão, a partir de agora.
 */
export function novaValidade(validoAteAtual: number | null | undefined, agora: number, meses: number): number {
  const base = new Date(Math.max(validoAteAtual ?? 0, agora))
  const dia = base.getDate()
  base.setMonth(base.getMonth() + meses)
  // 31 de janeiro + 1 mês não pode virar 3 de março: fica no último dia de fevereiro.
  if (base.getDate() < dia) base.setDate(0)
  return base.getTime()
}

export type SituacaoPlano =
  | { pro: true; motivo: 'assinatura'; validoAte: number }
  | { pro: true; motivo: 'teste'; diasRestantes: number }
  | { pro: false; motivo: 'gratis'; testeEncerrado: boolean }

/**
 * Decide se o profissional tem os recursos Pro agora.
 * Contas novas ganham 14 dias de teste, contados da criação da conta.
 */
export function situacaoPlano(assinatura: Assinatura | null, contaCriadaEm: number, agora: number): SituacaoPlano {
  if (assinatura?.plano === 'pro' && assinatura.validoAte > agora) {
    return { pro: true, motivo: 'assinatura', validoAte: assinatura.validoAte }
  }
  const fimTeste = contaCriadaEm + DIAS_TESTE_PRO * DIA
  if (contaCriadaEm > 0 && agora < fimTeste) {
    return { pro: true, motivo: 'teste', diasRestantes: Math.ceil((fimTeste - agora) / DIA) }
  }
  return { pro: false, motivo: 'gratis', testeEncerrado: contaCriadaEm > 0 }
}
