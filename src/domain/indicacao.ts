/**
 * Crescimento orgânico: cada link leva a origem (utm) para o funil por canal
 * mostrar quantos cadastros vieram de indicação e do orçamento que o cliente recebeu.
 */

export const UTM_INDICACAO = 'utm_source=indicacao&utm_medium=whatsapp&utm_campaign=indique'
export const UTM_ORCAMENTO_CLIENTE = 'utm_source=orcamento-cliente&utm_medium=link&utm_campaign=viral'
/** Chamada para criar conta no fim do gerador de orçamento sem cadastro (/gerador-de-orcamento). */
export const UTM_GERADOR = 'utm_source=gerador&utm_medium=site&utm_campaign=gerador-sem-cadastro'

export function linkIndicacao(site: string): string {
  return `${site}/beta?${UTM_INDICACAO}`
}

/** Mensagem pronta para o profissional mandar a um colega pelo WhatsApp. */
export function textoIndicacao(site: string): string {
  return (
    'Tô usando o Q3 Orça pra fazer orçamento pelo celular: monta em 2 minutos, ' +
    'o cliente aprova pelo link e paga no Pix. É grátis, vale testar: ' +
    linkIndicacao(site)
  )
}

export function linkWhatsAppSemContato(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`
}
