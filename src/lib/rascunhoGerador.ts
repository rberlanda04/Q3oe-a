import { lerRascunho, type FormGerador, type RascunhoGerador } from '../domain/gerador'
import { escolhaParaGuardar, lerEscolhaGuardada } from '../domain/consentimento'

// Rascunho do gerador sem cadastro guardado só neste navegador até a conta ser criada.
const CHAVE = 'q3:rascunho-gerador'

export function guardarRascunho(form: FormGerador) {
  try {
    const r: RascunhoGerador = { versao: 1, em: Date.now(), form }
    localStorage.setItem(CHAVE, JSON.stringify(r))
  } catch {
    /* Navegação privada: a conta nova só começa vazia. */
  }
}

/** Lê e apaga o rascunho (vale uma vez). */
export function tomarRascunho(): FormGerador | null {
  try {
    const form = lerRascunho(localStorage.getItem(CHAVE), Date.now())
    localStorage.removeItem(CHAVE)
    return form
  } catch {
    return null
  }
}

// Escolha da caixa "quero receber por e-mail" feita no gerador, levada até o cadastro.
const CHAVE_EMAIL = 'q3:aceita-email-gerador'

export function guardarEscolhaEmail(aceita: boolean) {
  try {
    if (aceita) localStorage.setItem(CHAVE_EMAIL, JSON.stringify(escolhaParaGuardar(true, Date.now())))
    else localStorage.removeItem(CHAVE_EMAIL)
  } catch {
    /* Navegação privada: a caixa do cadastro começa desmarcada. */
  }
}

/** A pessoa marcou a caixa no gerador (e ainda vale). Não apaga: o cadastro apaga ao concluir. */
export function escolhaEmailDoGerador(): boolean {
  try {
    return lerEscolhaGuardada(localStorage.getItem(CHAVE_EMAIL), Date.now())
  } catch {
    return false
  }
}

export function esquecerEscolhaEmail() {
  try {
    localStorage.removeItem(CHAVE_EMAIL)
  } catch {
    /* nada a fazer */
  }
}
