import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'

/** Eventos do funil (veja PLANO-DE-ESCALA.md, seção 3). */
export type Evento = 'conta_criada' | 'orcamento_enviado' | 'link_aprovado' | 'pro_pedido'

/** Registra um evento no Google Analytics sem nunca atrapalhar o uso do app. */
export function registrarEvento(evento: Evento, parametros?: Record<string, string | number>) {
  analytics
    .then((a) => {
      if (a) logEvent(a, evento as string, parametros)
    })
    .catch(() => {})
}
