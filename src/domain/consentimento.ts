/*
 * Consentimento para receber modelos e dicas por e-mail (LGPD, base legal: consentimento).
 * A caixa começa sempre desmarcada; só quem marca entra na lista. O registro fica no
 * documento do usuário com a data e o lugar onde a pessoa escolheu, e pode ser desfeito
 * em "Meus dados" ou pelo link de descadastro de cada e-mail.
 */

export type OrigemConsentimento = 'cadastro' | 'gerador' | 'perfil'

export interface ConsentimentoEmail {
  aceitaEmail: boolean
  /** Quando a pessoa marcou ou desmarcou (milissegundos desde 1970). */
  aceitaEmailEm: number
  aceitaEmailOrigem: OrigemConsentimento
}

export const TEXTO_CAIXA_EMAIL = 'Quero receber modelos e dicas por e-mail. Posso sair quando quiser.'

/** Registro do que a pessoa escolheu, para gravar na conta. */
export function registroConsentimento(aceita: boolean, origem: OrigemConsentimento, agora: number): ConsentimentoEmail {
  return { aceitaEmail: aceita, aceitaEmailEm: agora, aceitaEmailOrigem: origem }
}

/**
 * O que gravar na conta recém-criada. Só grava quando a caixa está marcada: sem marca,
 * não há consentimento e nada vai para a conta. A origem é o gerador quando a pessoa já
 * tinha marcado lá; senão, o cadastro.
 */
export function consentimentoNaCriacao(marcado: boolean, marcadoNoGerador: boolean, agora: number): ConsentimentoEmail | null {
  if (!marcado) return null
  return registroConsentimento(true, marcadoNoGerador ? 'gerador' : 'cadastro', agora)
}

/*
 * Do gerador até o cadastro, a escolha fica guardada no navegador junto do rascunho,
 * com a mesma validade dele.
 */
export const VALIDADE_ESCOLHA_MS = 7 * 24 * 60 * 60 * 1000

export interface EscolhaGuardada {
  versao: 1
  em: number
  aceita: boolean
}

export function escolhaParaGuardar(aceita: boolean, agora: number): EscolhaGuardada {
  return { versao: 1, em: agora, aceita }
}

/** true só se a pessoa marcou a caixa no gerador há menos de 7 dias; qualquer outra coisa vale como desmarcada. */
export function lerEscolhaGuardada(bruto: string | null, agora: number): boolean {
  if (!bruto) return false
  try {
    const e = JSON.parse(bruto) as Partial<EscolhaGuardada>
    if (e.versao !== 1 || typeof e.em !== 'number' || agora - e.em > VALIDADE_ESCOLHA_MS || e.em > agora + 60_000) return false
    return e.aceita === true
  } catch {
    return false
  }
}
