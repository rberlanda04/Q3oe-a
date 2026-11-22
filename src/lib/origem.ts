import { chaveEtapa, chaveVisita, escolherOrigem, origemDaVisita, type Etapa, type Origem } from '../domain/origem'

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
    contarVisita(nova)
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

/**
 * Soma 1 no contador anônimo de visitas daquela origem (coleção visitas, só o total).
 * Uma vez por sessão do navegador e por origem; espera a página assentar e carrega o
 * Firestore só nessa hora, para não pesar na abertura do site.
 */
function contarVisita(origem: Origem) {
  const chave = chaveVisita(origem, Date.now())
  if (!chave) return
  try {
    const marca = 'q3:visita:' + chave.id
    if (sessionStorage.getItem(marca)) return
    sessionStorage.setItem(marca, '1')
  } catch {
    return
  }
  setTimeout(async () => {
    try {
      const [{ db }, { doc, increment, setDoc }] = await Promise.all([import('./firebase'), import('firebase/firestore')])
      const { id, ...campos } = chave
      await setDoc(doc(db, 'visitas', id), { ...campos, total: increment(1) }, { merge: true })
    } catch {
      /* Sem conexão ou bloqueado: a visita só não entra na conta. */
    }
  }, 3000)
}

/**
 * Soma 1 no contador anônimo da etapa do funil (coleção etapas), uma vez por sessão do
 * navegador e por etapa, com a origem guardada. Falha em silêncio: é só medição.
 */
export function contarEtapa(etapa: Etapa) {
  try {
    const chave = chaveEtapa(etapa, origemGuardada(), Date.now())
    const marca = 'q3:etapa:' + chave.id
    if (sessionStorage.getItem(marca)) return
    sessionStorage.setItem(marca, '1')
    void (async () => {
      try {
        const [{ db }, { doc, increment, setDoc }] = await Promise.all([import('./firebase'), import('firebase/firestore')])
        const { id, ...campos } = chave
        await setDoc(doc(db, 'etapas', id), { ...campos, total: increment(1) }, { merge: true })
      } catch {
        /* Sem conexão ou bloqueado: a etapa só não entra na conta. */
      }
    })()
  } catch {
    /* Navegação privada: segue sem medir. */
  }
}
