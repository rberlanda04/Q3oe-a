/**
 * Configurações do negócio. Ajuste aqui sem mexer no resto do código.
 */

/** Endereço público do site. Troque quando tiver domínio próprio (ex.: https://q3orca.com.br). */
export const SITE_URL = 'https://q3orca.web.app'

/**
 * WhatsApp do time de vendas, só números com DDI e DDD (ex.: '5511999999999').
 * Quando preenchido, o botão "Quero o Pro" também abre uma conversa com vocês.
 * Vazio: o pedido fica só registrado em Firestore > interesses.
 */
export const WHATSAPP_VENDAS = ''

/**
 * Links de pagamento (Mercado Pago, Kiwify, Asaas...). Quando preenchidos,
 * o botão leva direto ao checkout. A ativação continua manual até existir
 * a integração automática (veja PLANO-DE-ESCALA.md).
 */
export const LINK_PAGAMENTO_MENSAL = ''
export const LINK_PAGAMENTO_ANUAL = ''

export const PRECO_MENSAL = 'R$ 14,90'
export const PRECO_ANUAL = 'R$ 99'
