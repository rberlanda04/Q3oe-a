/**
 * Cliente mínimo da API v2 da AbacatePay, só com o que o Q3 Orça usa.
 * Documentação: https://docs.abacatepay.com
 * O ambiente (teste ou produção) é definido pela chave: chaves de Dev mode simulam pagamentos.
 */

/** Pode ser trocado por ABACATEPAY_URL para testes locais com uma API simulada. */
const BASE = process.env.ABACATEPAY_URL || 'https://api.abacatepay.com/v2'

export interface CobrancaPix {
  id: string
  amount: number
  status: string
  devMode: boolean
  brCode: string
  brCodeBase64: string
  expiresAt: string
}

export type StatusPix = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED' | 'UNDER_DISPUTE' | string

export class ErroAbacatePay extends Error {}

async function chamar<T>(chave: string, caminho: string, init: RequestInit = {}, buscar: typeof fetch = fetch): Promise<T> {
  const resposta = await buscar(`${BASE}${caminho}`, {
    ...init,
    headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json', ...init.headers },
  })
  let corpo: { data?: T; success?: boolean; error?: unknown } = {}
  try {
    corpo = (await resposta.json()) as typeof corpo
  } catch {
    /* Resposta sem JSON: tratada abaixo como erro. */
  }
  if (!resposta.ok || !corpo.success || !corpo.data) {
    const detalhe = typeof corpo.error === 'string' ? corpo.error : JSON.stringify(corpo.error ?? resposta.status)
    throw new ErroAbacatePay(`AbacatePay ${caminho} falhou: ${detalhe}`)
  }
  return corpo.data
}

export function criarPix(
  chave: string,
  dados: { amount: number; description: string; expiresIn: number; externalId: string; metadata: Record<string, string> },
  buscar: typeof fetch = fetch,
): Promise<CobrancaPix> {
  return chamar<CobrancaPix>(chave, '/transparents/create', { method: 'POST', body: JSON.stringify({ method: 'PIX', data: dados }) }, buscar)
}

export async function consultarPix(chave: string, id: string, buscar: typeof fetch = fetch): Promise<StatusPix> {
  const dados = await chamar<{ id: string; status: StatusPix }>(chave, `/transparents/check?id=${encodeURIComponent(id)}`, {}, buscar)
  return dados.status
}
