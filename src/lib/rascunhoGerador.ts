import { lerRascunho, type FormGerador, type RascunhoGerador } from '../domain/gerador'

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
