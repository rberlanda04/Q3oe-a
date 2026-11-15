/** Regras do envio de documentos pelo WhatsApp. */
import type { StatusOrcamento } from './types'

/**
 * Como terminou a tentativa de enviar um arquivo. 'precisa-toque' acontece no celular,
 * quando o navegador só deixa compartilhar logo depois de um toque.
 */
export type ResultadoEnvio = 'compartilhado' | 'baixado' | 'cancelado' | 'precisa-toque'

export interface EfeitoDoEnvio {
  /** O arquivo fica guardado à espera do segundo toque ("Enviar agora"). */
  aguardarToque: boolean
  /** Registrar o evento orcamento_enviado no funil. */
  registrarEnviado: boolean
  /** Passar o orçamento de rascunho para enviado. */
  marcarEnviado: boolean
  /** O PDF foi baixado: avisar para anexar na conversa. */
  avisarBaixado: boolean
}

/**
 * O que fazer depois de uma tentativa de envio. Vale igual para o primeiro toque e para
 * o "Enviar agora": só conta como enviado o que saiu de verdade (compartilhado ou baixado),
 * e só o orçamento conta (recibo, ordem e garantia não mudam o status nem o funil).
 */
export function efeitoDoEnvio(resultado: ResultadoEnvio, contaComoEnviado: boolean, status: StatusOrcamento): EfeitoDoEnvio {
  const saiu = resultado === 'compartilhado' || resultado === 'baixado'
  return {
    aguardarToque: resultado === 'precisa-toque',
    registrarEnviado: saiu && contaComoEnviado,
    marcarEnviado: saiu && contaComoEnviado && status === 'rascunho',
    avisarBaixado: resultado === 'baixado',
  }
}
