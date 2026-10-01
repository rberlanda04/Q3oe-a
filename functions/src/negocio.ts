/**
 * Regras de negócio do pagamento do Pro, sem dependência do Firebase,
 * para poder testar sem servidor.
 */

export type Periodo = 'mensal' | 'anual'

/** Preços em centavos. O servidor é a única fonte do valor cobrado. */
export const PRECOS: Record<Periodo, number> = { mensal: 1490, anual: 9900 }

export const MESES: Record<Periodo, number> = { mensal: 1, anual: 12 }

/** O Pix gerado vale por 1 hora. Depois, o app gera outro. */
export const VALIDADE_PIX_SEGUNDOS = 60 * 60

export function periodoValido(valor: unknown): valor is Periodo {
  return valor === 'mensal' || valor === 'anual'
}

/**
 * Nova data de validade ao pagar alguns meses de Pro.
 * Se ainda houver período pago, soma a partir do fim dele; senão, a partir de agora.
 * Mesma regra de src/domain/plano.ts, no app.
 */
export function novaValidade(validoAteAtual: number | null | undefined, agora: number, meses: number): number {
  const base = new Date(Math.max(validoAteAtual ?? 0, agora))
  const dia = base.getDate()
  base.setMonth(base.getMonth() + meses)
  if (base.getDate() < dia) base.setDate(0)
  return base.getTime()
}

/** Converte o campo validoAte, que pode ser número ou Timestamp do Firestore. */
export function emMilissegundos(valor: unknown): number {
  if (typeof valor === 'number') return valor
  if (valor && typeof (valor as { toMillis?: unknown }).toMillis === 'function') return (valor as { toMillis: () => number }).toMillis()
  return 0
}

/**
 * Encontra o ID da cobrança Pix ("pix_char_...") em qualquer parte do evento.
 * A documentação da AbacatePay não detalha o formato de cada evento, então
 * procuramos o ID onde ele estiver. O pagamento é sempre reconfirmado na API.
 */
export function extrairIdCobranca(evento: unknown, profundidade = 0): string | null {
  if (profundidade > 6 || evento === null || evento === undefined) return null
  if (typeof evento === 'string') return /^pix_char_[A-Za-z0-9]+$/.test(evento) ? evento : null
  if (typeof evento !== 'object') return null
  const valores = Array.isArray(evento) ? evento : Object.values(evento as Record<string, unknown>)
  for (const valor of valores) {
    const id = extrairIdCobranca(valor, profundidade + 1)
    if (id) return id
  }
  return null
}

/** Eventos da AbacatePay que podem indicar um Pix pago. */
export const EVENTOS_PAGAMENTO = ['transparent.completed', 'checkout.completed']
