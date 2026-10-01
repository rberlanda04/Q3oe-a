import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Chave pública da AbacatePay para validar a assinatura HMAC dos webhooks.
 * É pública por definição e vem da documentação oficial:
 * https://docs.abacatepay.com/pages/webhooks
 */
export const CHAVE_PUBLICA_ABACATEPAY =
  't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9'

/** Confere o cabeçalho X-Webhook-Signature: HMAC-SHA256 do corpo bruto, em base64. */
export function assinaturaValida(corpoBruto: Buffer | undefined, assinatura: string | undefined, chave = CHAVE_PUBLICA_ABACATEPAY): boolean {
  if (!corpoBruto || !assinatura) return false
  const esperada = Buffer.from(createHmac('sha256', chave).update(corpoBruto).digest('base64'))
  const recebida = Buffer.from(assinatura)
  return esperada.length === recebida.length && timingSafeEqual(esperada, recebida)
}

/** Compara o segredo do endereço do webhook sem vazar informação pelo tempo de resposta. */
export function segredoConfere(recebido: unknown, esperado: string): boolean {
  if (typeof recebido !== 'string' || !esperado) return false
  const a = Buffer.from(recebido)
  const b = Buffer.from(esperado)
  return a.length === b.length && timingSafeEqual(a, b)
}
