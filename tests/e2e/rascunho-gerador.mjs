/**
 * Ponta a ponta: o orçamento feito no gerador sem cadastro entra salvo na conta nova.
 * Uso: BASE=https://q3orca--teste-xxxx.web.app node tests/e2e/rascunho-gerador.mjs
 * Cria uma conta de teste e a apaga no fim.
 */
import { chromium } from 'playwright'
import { limparContaDeTeste } from './limpar-conta.mjs'

const BASE = process.env.BASE || 'https://www.q3orca.com.br'
const email = `teste-automatizado-${Date.now()}@example.com`
const senha = `Teste-${Math.random().toString(36).slice(2)}-9`

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
await ctx.addInitScript(() => localStorage.setItem('q3:teste', '1'))
const page = await ctx.newPage()
let falhou = false
try {
  await page.goto(BASE + '/gerador-de-orcamento?profissao=pintor', { waitUntil: 'load' })
  await page.getByLabel('Seu nome ou da empresa').fill('Pinturas Teste Automatizado')
  await page.getByLabel('Cidade').fill('Curitiba')
  await page.getByLabel('Nome do cliente').fill('Cliente do Rascunho')
  const preco = page.locator('input[id^="g-preco-"]').first()
  await preco.fill('350,00')
  // Caixa de e-mail: começa desmarcada; marcada no gerador, chega marcada no cadastro.
  const caixaGerador = page.getByLabel(/Quero receber modelos e dicas por e-mail/)
  if (await caixaGerador.isChecked()) throw new Error('a caixa de e-mail do gerador veio marcada')
  await caixaGerador.check()
  await page.getByRole('link', { name: /Salvar este orçamento na conta grátis/ }).click()
  await page.getByText('O orçamento que você fez no gerador já entra salvo na conta.').waitFor()
  if (!(await page.getByLabel(/Quero receber modelos e dicas por e-mail/).isChecked())) throw new Error('a escolha do gerador não chegou ao cadastro')
  await page.getByLabel('E-mail', { exact: true }).fill(email)
  await page.getByLabel('Senha').fill(senha)
  await page.getByRole('button', { name: 'Criar conta grátis' }).click()
  await page.getByText('Orçamento nº 2026-0001').waitFor({ timeout: 20000 })
  await page.locator('input[value="Cliente do Rascunho"]').first().waitFor({ timeout: 10000 })
  await page.getByText(/350,00/).first().waitFor()
  console.log('OK    orçamento do gerador entrou na conta nova com o cliente e o valor')
} catch (e) {
  falhou = true
  console.log('FALHA', e.message.split('\n')[0])
  await page.screenshot({ path: 'falha-rascunho.png', fullPage: true }).catch(() => {})
} finally {
  await browser.close()
  await limparContaDeTeste(email, senha).catch((e) => console.log('Limpeza falhou:', e.message))
  process.exit(falhou ? 1 : 0)
}
