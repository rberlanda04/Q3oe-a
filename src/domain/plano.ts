/** Planos do Q3 Orça: grátis, teste do Pro e Pro pago. */

export const DIAS_TESTE_PRO = 14
const DIA = 24 * 60 * 60 * 1000

/** Documento em assinaturas/{uid}. Só o administrador escreve; o profissional apenas lê. */
export interface Assinatura {
  plano: 'pro'
  /** Fim do período pago, em milissegundos. */
  validoAte: number
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
