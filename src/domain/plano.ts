/** Planos do Q3 Orça: grátis, teste do Pro e Pro pago. */

const DIA = 24 * 60 * 60 * 1000

/** Teste grátis do Pro para toda conta nova, contado da criação da conta. */
export const DIAS_TESTE_PRO = 30

/** Prazo do Pro grátis de quem se cadastrou na fase beta. */
export const DIAS_PRO_BETA = 90

/**
 * Corte entre o beta (90 dias) e o teste de 30 dias: 15/11/2026, 00:00 em Brasília.
 * Contas criadas antes deste instante (inclusive durante todo o dia 14/11/2026)
 * mantêm os 90 dias que receberam no cadastro.
 */
export const FIM_CADASTRO_BETA = Date.UTC(2026, 10, 15, 3, 0, 0)

/** Dias de Pro grátis a que a conta tem direito, conforme a data de criação. */
export function diasDeTesteDaConta(contaCriadaEm: number): number {
  return contaCriadaEm > 0 && contaCriadaEm < FIM_CADASTRO_BETA ? DIAS_PRO_BETA : DIAS_TESTE_PRO
}

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
  | { pro: true; motivo: 'teste'; diasRestantes: number; /** Tamanho do teste desta conta: 30 dias, ou 90 para quem veio do beta. */ diasTeste: number }
  | { pro: false; motivo: 'gratis'; testeEncerrado: boolean }

/**
 * Decide se o profissional tem os recursos Pro agora.
 * Contas novas ganham DIAS_TESTE_PRO dias de teste, contados da criação da conta;
 * contas do beta (criadas antes de FIM_CADASTRO_BETA) mantêm DIAS_PRO_BETA dias.
 */
export function situacaoPlano(
  assinatura: Assinatura | null,
  contaCriadaEm: number,
  agora: number,
  diasTeste: number = diasDeTesteDaConta(contaCriadaEm),
): SituacaoPlano {
  if (assinatura?.plano === 'pro' && assinatura.validoAte > agora) {
    return { pro: true, motivo: 'assinatura', validoAte: assinatura.validoAte }
  }
  const fimTeste = contaCriadaEm + diasTeste * DIA
  if (contaCriadaEm > 0 && agora < fimTeste) {
    const dias = Math.ceil((fimTeste - Math.max(agora, contaCriadaEm)) / DIA)
    return { pro: true, motivo: 'teste', diasRestantes: Math.min(dias, diasTeste), diasTeste }
  }
  return { pro: false, motivo: 'gratis', testeEncerrado: contaCriadaEm > 0 }
}

/**
 * No plano grátis, os PDFs saem com a marca d'água e o rodapé do Q3 Orça.
 * Quem tem Pro, pago ou no teste, não vê nenhum dos dois.
 */
export function pdfComMarcaQ3(pro: boolean | undefined): boolean {
  return !pro
}

/**
 * A conta está no Pro grátis da fase beta (prazo maior que o teste comum)?
 * Os textos de "beta" só valem para ela; conta nova vê o teste de 30 dias.
 */
export function testeDoBeta(plano: SituacaoPlano): boolean {
  return plano.motivo === 'teste' && plano.diasTeste > DIAS_TESTE_PRO
}

/** Depois de dispensado, o aviso de fim do Pro fica este tempo sem aparecer. */
export const DIAS_SEM_AVISO_FIM_DO_PRO = 7

/**
 * Mostrar o aviso "seu Pro terminou" na lista de orçamentos?
 * Só para quem já teve Pro (teste ou assinatura) e está no grátis, e respeitando
 * a dispensa: `dispensadoEm` é quando a pessoa fechou o aviso (0 = nunca).
 */
export function avisarFimDoPro(plano: SituacaoPlano, dispensadoEm: number, agora: number): boolean {
  if (plano.pro || !plano.testeEncerrado) return false
  // Relógio do aparelho voltou no tempo: a dispensa "no futuro" não vale.
  const dispensado = dispensadoEm > 0 && dispensadoEm <= agora && agora - dispensadoEm < DIAS_SEM_AVISO_FIM_DO_PRO * DIA
  return !dispensado
}

/**
 * Preços do Pro em centavos, para contas na tela de Planos.
 * Quem cobra é o servidor (functions/src/negocio.ts); um teste garante que os valores batem.
 */
export const PRECOS_PRO = { mensal: 1490, anual: 9900 } as const

/** Quanto o plano anual custa por mês, em centavos (R$ 99 por ano = R$ 8,25 por mês). */
export function mensalDoAnualCentavos(anualCentavos: number = PRECOS_PRO.anual): number {
  return Math.round(anualCentavos / 12)
}
