import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'

/** Eventos do funil (veja PLANO-DE-ESCALA.md, seção 3). */
export type Evento = 'conta_criada' | 'orcamento_enviado' | 'link_aprovado' | 'pro_pedido'

/**
 * Registra no Analytics os erros inesperados do app, com a mensagem resumida.
 * No Google Analytics, veja o evento "exception" para acompanhar falhas dos usuários.
 */
export function monitorarErros() {
  let enviados = 0
  const registrar = (mensagem: string) => {
    // Evita inundar o Analytics se um erro se repetir em sequência.
    if (enviados++ > 10) return
    analytics
      .then((a) => {
        if (a) logEvent(a, 'exception', { description: mensagem.slice(0, 150), fatal: false })
      })
      .catch(() => {})
  }
  window.addEventListener('error', (e) => registrar(`${e.message} @ ${e.filename?.split('/').pop() ?? ''}:${e.lineno ?? ''}`))
  window.addEventListener('unhandledrejection', (e) => registrar(String(e.reason?.message ?? e.reason)))
}

/** Registra um evento no Google Analytics sem nunca atrapalhar o uso do app. */
export function registrarEvento(evento: Evento, parametros?: Record<string, string | number>) {
  analytics
    .then((a) => {
      if (a) logEvent(a, evento as string, parametros)
    })
    .catch(() => {})
}
