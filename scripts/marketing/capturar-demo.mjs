/**
 * Captura as telas do vídeo de demonstração do Q3 Orça (Reels, TikTok, Shorts).
 * Percorre o site publicado num celular simulado com uma conta de teste, que é
 * apagada no fim. As capturas ficam em PASTA, numeradas na ordem do vídeo, com
 * a legenda de cada uma em legendas.json.
 *
 * Uso: PASTA=caminho/da/pasta node scripts/marketing/capturar-demo.mjs
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { limparContaDeTeste } from '../../tests/e2e/limpar-conta.mjs'

const BASE = process.env.BASE || 'https://www.q3orca.com.br'
const PASTA = process.env.PASTA || 'demo-capturas'
mkdirSync(PASTA, { recursive: true })
const email = `teste-automatizado-video-${Date.now()}@example.com`
const senha = `Video-${Math.random().toString(36).slice(2)}-9`

const browser = await chromium.launch()
const opcoes = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'pt-BR' }
const ctx = await browser.newContext(opcoes)
const page = await ctx.newPage()
page.on('dialog', (d) => d.accept())

const legendas = []
let n = 0
async function foto(alvo, legenda, segundos = 2.2) {
  await alvo.waitForTimeout(400)
  const arquivo = `${String(++n).padStart(2, '0')}.png`
  await alvo.screenshot({ path: join(PASTA, arquivo) })
  legendas.push({ arquivo, legenda, segundos })
}
const devagar = async (campo, texto) => {
  await campo.click()
  await campo.fill('')
  await campo.pressSequentially(texto, { delay: 25 })
}

try {
  // 1. O site e a calculadora
  await page.goto(BASE + '/', { waitUntil: 'load' })
  await page.locator('[data-cookies-aceitar], button:has-text("Aceitar")').first().click({ timeout: 3000 }).catch(() => {})
  await foto(page, 'Orçamento no celular em 2 minutos', 2.5)

  await page.goto(BASE + '/calculadora/pintura', { waitUntil: 'load' })
  await devagar(page.getByLabel('Área das paredes'), '85')
  await devagar(page.getByLabel('Seu preço por m²'), '22')
  await page.getByText('Resultado').scrollIntoViewIfNeeded()
  await foto(page, 'Calcule tinta e mão de obra, grátis')

  // 2. Cadastro pelo modelo de pintor
  await page.goto(BASE + '/modelo-de-orcamento/pintor', { waitUntil: 'load' })
  await foto(page, 'Modelo pronto para a sua profissão')
  await page.getByRole('link', { name: /Usar este modelo grátis/ }).click()
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(senha)
  await page.getByRole('button', { name: 'Criar conta grátis' }).click()
  await page.getByText('Orçamento nº 2026-0001').waitFor({ timeout: 20000 })

  // 3. Dados da empresa com logo
  await page.getByRole('link', { name: 'Orçamentos' }).first().click()
  await page.getByText('Complete seus dados').waitFor()
  await page.getByRole('link', { name: 'Meus dados' }).click()
  await page.getByLabel('Nome da empresa ou seu nome').fill('Marcos Pinturas')
  await page.getByLabel('WhatsApp').fill('(41) 99999-1234')
  await page.getByLabel('Cidade e estado').fill('Curitiba - PR')
  await page.getByLabel('Chave Pix').fill('marcos@exemplo.com')
  await page.locator('input[type="file"]').setInputFiles('public/icone-512.png')
  await page.getByAltText('Seu logo').waitFor()
  await page.getByRole('button', { name: 'Usar a cor #1f418f' }).click()
  await page.getByRole('button', { name: 'Salvar' }).click()
  await page.getByRole('button', { name: 'Salvo' }).waitFor()
  await page.evaluate(() => window.scrollTo(0, 0))
  await foto(page, 'Seu logo e sua cor nos documentos')

  // 4. Orçamento
  await page.getByRole('link', { name: 'Novo orçamento' }).first().click()
  await page.getByRole('button', { name: /Pintor/ }).click()
  await page.getByText('Orçamento nº 2026-0002').waitFor()
  await devagar(page.getByLabel('Nome', { exact: true }), 'Ana Souza')
  await page.getByLabel('WhatsApp').fill('(41) 98888-7777')
  await foto(page, 'Escolha o cliente', 1.8)
  await page.getByRole('button', { name: '+ Pintura de parede interna (2 demãos)' }).click()
  await page.getByLabel('Quantidade').first().fill('85')
  await page.locator('input[placeholder="0,00"]').first().fill('22,00')
  await page.getByText('R$ 1.870,00').first().waitFor()
  await page.getByText('R$ 1.870,00').first().scrollIntoViewIfNeeded()
  await foto(page, 'Toque nos serviços: o total sai sozinho')

  // 5. Envio e aprovação pelo cliente
  const popup = ctx.waitForEvent('page')
  await page.getByRole('button', { name: 'Enviar link' }).click()
  await (await popup).close()
  const link = await page.getByRole('link', { name: 'Abrir' }).getAttribute('href')
  await page.waitForTimeout(2500)

  const cliente = await browser.newContext(opcoes)
  const cli = await cliente.newPage()
  await cli.goto(BASE + link, { waitUntil: 'load' })
  await cli.getByText('Para Ana Souza').waitFor({ timeout: 20000 })
  await cli.locator('button:has-text("Aceitar")').first().click({ timeout: 3000 }).catch(() => {})
  await foto(cli, 'O cliente recebe pelo WhatsApp', 2.5)
  await cli.getByRole('button', { name: 'Aprovar orçamento' }).scrollIntoViewIfNeeded()
  await foto(cli, 'Aprova com um toque e paga no Pix', 2.2)
  await cli.getByRole('button', { name: 'Aprovar orçamento' }).click()
  await cli.getByRole('button', { name: 'Confirmar' }).click()
  await cli.getByText('✅ Orçamento aprovado').waitFor({ timeout: 15000 })
  await cli.getByText('✅ Orçamento aprovado').scrollIntoViewIfNeeded()
  await foto(cli, 'Orçamento aprovado!', 2.2)
  await cliente.close()

  await page.waitForFunction(() => document.querySelector('select[aria-label="Status"]')?.value === 'aprovado', null, { timeout: 20000 })
  await page.evaluate(() => window.scrollTo(0, 0))
  await foto(page, 'E você vê na hora', 2.5)

  writeFileSync(join(PASTA, 'legendas.json'), JSON.stringify(legendas, null, 2))
  console.log(`${legendas.length} capturas em ${PASTA}`)
} finally {
  await browser.close()
  await limparContaDeTeste(email, senha)
}
