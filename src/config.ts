/**
 * Configurações do negócio. Ajuste aqui sem mexer no resto do código.
 * Antes do lançamento, rode `npm run checar-lancamento` para ver o que falta.
 */

import { DIAS_TESTE_PRO } from './domain/plano'

/* ---------- Fase de testes (beta) ---------- */

/**
 * Fase de testes aberta: mostra o selo "Beta" no site e no app e dá Pro grátis
 * por DIAS_PRO_BETA dias a todo cadastro (a oferta de Fundador da estratégia).
 * Para encerrar o beta, mude para false: o teste volta a ser de DIAS_TESTE_PRO dias.
 */
export const MODO_BETA = true
export const DIAS_PRO_BETA = 90

/** Dias de Pro grátis para contas novas, conforme a fase atual. */
export const DIAS_TESTE_ATUAL = MODO_BETA ? DIAS_PRO_BETA : DIAS_TESTE_PRO

/** Endereço público do site. Troque quando tiver domínio próprio (ex.: https://q3orca.com.br). */
export const SITE_URL = 'https://q3orca.web.app'

/* ---------- Empresa responsável (aparece nos termos e na política de privacidade) ---------- */

/** Razão social da empresa que opera o Q3 Orça. */
export const EMPRESA_RAZAO_SOCIAL = ''
/** CNPJ da empresa, formatado (ex.: '12.345.678/0001-90'). */
export const EMPRESA_CNPJ = ''
/** Cidade e estado do foro e do endereço da empresa (ex.: 'Campinas - SP'). */
export const EMPRESA_CIDADE = ''

/* ---------- Canais de contato ---------- */

/** E-mail de atendimento e do encarregado de dados pessoais (LGPD). */
export const EMAIL_CONTATO = ''

/**
 * WhatsApp de suporte, só números com DDI e DDD (ex.: '5511999999999').
 * Aparece como "Precisa de ajuda?" no app.
 */
export const WHATSAPP_SUPORTE = ''

/**
 * WhatsApp do time de vendas. Quando preenchido, o botão "Quero o Pro"
 * também abre uma conversa. Vazio: o pedido fica só registrado no painel admin.
 */
export const WHATSAPP_VENDAS = ''

/* ---------- Pagamento do Pro ---------- */

/**
 * Liga o pagamento por Pix via AbacatePay dentro do app.
 * Só ative depois de publicar as funções do servidor (pasta functions, veja o README),
 * que exigem o plano Blaze do Firebase. Desligado, o botão registra um pedido no painel admin.
 */
export const PIX_ATIVO_EM_PRODUCAO = false

/** Também liga no build de teste com emuladores (VITE_PIX_ATIVO=1). */
export const PAGAMENTO_PIX_ATIVO = PIX_ATIVO_EM_PRODUCAO || import.meta.env.VITE_PIX_ATIVO === '1'

/** Avisa sobre a renovação do Pro quando faltarem estes dias para vencer. */
export const DIAS_AVISO_RENOVACAO = 5

/**
 * Links de pagamento (Mercado Pago, Asaas...). Quando preenchidos, o botão
 * leva direto ao checkout. A ativação é feita no painel admin (/admin).
 */
export const LINK_PAGAMENTO_MENSAL = ''
export const LINK_PAGAMENTO_ANUAL = ''

export const PRECO_MENSAL = 'R$ 14,90'
export const PRECO_ANUAL = 'R$ 99'

/** Data de vigência dos termos e da política. Atualize sempre que mudar o texto. */
export const VIGENCIA_DOCUMENTOS_LEGAIS = '28 de setembro de 2026'
