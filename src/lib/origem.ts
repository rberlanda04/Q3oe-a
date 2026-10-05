import { escolherOrigem, origemDaVisita, type Origem } from '../domain/origem'

// Guarda no navegador de onde veio a primeira visita (utm do QR Code, anúncio ou convite).
// Na criação da conta, a origem vai para o perfil e o funil por canal sai do Firestore
// (npm run ops:campanha), sem depender do Google Analytics.
const CHAVE = 'q3:origem'
const VALIDADE = 90 * 24 * 60 * 60 * 1000

export function guardarOrigemDaVisita() {
  try {
    const nova = origemDaVisita(location.href, document.referrer, Date.now(), location.hostname)
    const bruta = localStorage.getItem(CHAVE)
    const guardada = bruta ? (JSON.parse(bruta) as Origem) : null
    const escolhida = escolherOrigem(guardada, nova, VALIDADE)
    if (escolhida !== guardada) localStorage.setItem(CHAVE, JSON.stringify(escolhida))
  } catch {
    /* Navegação privada ou URL estranha: segue sem origem. */
  }
}

export function origemGuardada(): Origem | null {
  try {
    const bruta = localStorage.getItem(CHAVE)
    return bruta ? (JSON.parse(bruta) as Origem) : null
  } catch {
    return null
  }
}
