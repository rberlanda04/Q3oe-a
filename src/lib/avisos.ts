/**
 * Avisos que o profissional pode dispensar. A dispensa fica só neste aparelho
 * (localStorage), por conta, com a hora em que foi fechado; por quanto tempo
 * o aviso some é regra de cada aviso, em src/domain/.
 */
const chave = (aviso: string, uid: string) => `q3:aviso:${aviso}:${uid}`

/** Quando o aviso foi dispensado, em milissegundos. 0 se nunca foi. */
export function avisoDispensadoEm(aviso: string, uid: string): number {
  try {
    return Number(localStorage.getItem(chave(aviso, uid))) || 0
  } catch {
    return 0
  }
}

export function dispensarAviso(aviso: string, uid: string, agora: number) {
  try {
    localStorage.setItem(chave(aviso, uid), String(agora))
  } catch {
    /* Navegação privada: o aviso some nesta visita e volta na próxima. */
  }
}
