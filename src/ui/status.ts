import type { StatusOrcamento } from '../domain/types'

export const STATUS: Record<StatusOrcamento, { rotulo: string; classe: string }> = {
  rascunho: { rotulo: 'Rascunho', classe: 'bg-areia-200 text-grafite-700' },
  enviado: { rotulo: 'Enviado', classe: 'bg-regua-300 text-grafite-900' },
  aprovado: { rotulo: 'Aprovado', classe: 'bg-aprovado-100 text-aprovado-700' },
  recusado: { rotulo: 'Recusado', classe: 'bg-alerta-50 text-alerta-600' },
}
