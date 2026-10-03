/**
 * Lista o que ainda falta configurar antes do lançamento oficial.
 * Rode com: npm run checar-lancamento
 */
import { readFileSync } from 'node:fs'

const config = readFileSync(new URL('../src/config.ts', import.meta.url), 'utf8')
const valor = (nome) => config.match(new RegExp(`export const ${nome} = '([^']*)'`))?.[1] ?? ''

const itens = [
  ['EMPRESA_RAZAO_SOCIAL', 'Razão social da empresa. Aparece nos termos de uso e na política de privacidade.', true],
  ['EMPRESA_CNPJ', 'CNPJ da empresa, para os documentos legais.', true],
  ['EMPRESA_CIDADE', 'Cidade da sede, usada nos documentos legais.', false],
  ['EMAIL_CONTATO', 'E-mail de atendimento e do encarregado de dados (LGPD).', false],
  ['WHATSAPP_SUPORTE', 'WhatsApp de suporte, mostrado em "Precisa de ajuda?".', false],
  ['WHATSAPP_VENDAS', 'WhatsApp que recebe os pedidos do Pro.', false],
  ['LINK_PAGAMENTO_MENSAL', 'Link de checkout do Pro mensal.', false],
  ['LINK_PAGAMENTO_ANUAL', 'Link de checkout do Pro anual.', false],
]

let obrigatorios = 0
let recomendados = 0
console.log('\nChecagem de lançamento do Q3 Orça\n')
for (const [nome, descricao, obrigatorio] of itens) {
  const preenchido = valor(nome).trim() !== ''
  if (!preenchido && obrigatorio) obrigatorios++
  if (!preenchido && !obrigatorio) recomendados++
  console.log(`${preenchido ? '[ok]' : obrigatorio ? '[FALTA]' : '[recomendado]'} ${nome}: ${descricao}`)
}

if (valor('SITE_URL').includes('.web.app')) {
  recomendados++
  console.log('[recomendado] SITE_URL: ainda usa o endereço do Firebase. Registre um domínio próprio para o SEO.')
}
if (!/export const PIX_ATIVO_EM_PRODUCAO = true/.test(config)) {
  recomendados++
  console.log('[recomendado] PIX_ATIVO_EM_PRODUCAO: pagamento por Pix desligado. Veja "Pagamento do Pro por Pix" no README.')
}
if (!valor('WHATSAPP_SUPORTE') && !valor('EMAIL_CONTATO')) {
  console.log('[ok] Contato: sem e-mail ou WhatsApp, os termos apontam para o Fale conosco e a central de ajuda.')
}
if (/export const MODO_BETA = true/.test(config)) {
  console.log('[info] MODO_BETA ligado: selo Beta, botão "Dar opinião" e Pro grátis estendido para contas novas.')
}

console.log('\nFora do código:')
for (const passo of [
  'Criar admins/{seu UID} no Firestore para acessar /admin (o UID aparece na própria página /admin).',
  'Cadastrar o site no Google Search Console e enviar /sitemap.xml.',
  'Revisar os termos e a política com um advogado.',
  'Testar no celular: pagar um QR Code de R$ 0,01, compartilhar o PDF e instalar na tela inicial.',
])
  console.log(`- ${passo}`)

console.log(`\n${obrigatorios} obrigatório(s) e ${recomendados} recomendado(s) pendentes.\n`)
