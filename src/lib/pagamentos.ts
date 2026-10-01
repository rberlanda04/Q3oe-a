import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'
import { app, db, USANDO_EMULADORES } from './firebase'

/** As funções rodam em São Paulo, perto dos usuários. */
const funcoes = getFunctions(app, 'southamerica-east1')
if (USANDO_EMULADORES) connectFunctionsEmulator(funcoes, '127.0.0.1', 5001)

export interface CobrancaPix {
  id: string
  brCode: string
  brCodeBase64: string
  expiraEm: number
  valorCentavos: number
}

export type StatusPagamento = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | string

/** Pede ao servidor um Pix da AbacatePay. O valor é definido pelo servidor, não pelo app. */
export async function gerarPixDoPro(periodo: 'mensal' | 'anual'): Promise<CobrancaPix> {
  const chamar = httpsCallable<{ periodo: string }, CobrancaPix>(funcoes, 'criarCobrancaPix')
  return (await chamar({ periodo })).data
}

/** Pede ao servidor para conferir o pagamento direto na AbacatePay. */
export async function conferirPagamento(id: string): Promise<{ status: StatusPagamento; validoAte: number | null }> {
  const chamar = httpsCallable<{ id: string }, { status: StatusPagamento; validoAte: number | null }>(funcoes, 'verificarPagamento')
  return (await chamar({ id })).data
}

/** Acompanha o pagamento em tempo real: o webhook da AbacatePay atualiza este documento. */
export function ouvirPagamento(id: string, callback: (status: StatusPagamento) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'pagamentos', id),
    (snap) => callback((snap.data()?.status as StatusPagamento) ?? 'PENDING'),
    () => {},
  )
}
