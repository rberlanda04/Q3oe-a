/**
 * Captura as telas dos GIFs por profissão: página do modelo, orçamento montado com os
 * itens da profissão, o cliente recebendo e aprovando. Usa uma conta de teste única,
 * apagada no fim. Cada profissão vai para PASTA/<id>/ com o seu legendas.json.
 *
 * Uso: PASTA=... [BASE=...] [PROFISSOES=id1,id2] node scripts/marketing/capturar-profissoes.mjs
 */
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { limparContaDeTeste } from '../../tests/e2e/limpar-conta.mjs'
import { MODELOS } from '../../src/domain/templates.ts'
import { PROFISSOES_SEO } from '../../src/seo/profissoes.ts'

const BASE = process.env.BASE || 'https://www.q3orca.com.br'
const PASTA = process.env.PASTA || 'demo-profissoes'

/** Cliente, quantidades e preços de exemplo dos dois primeiros serviços de cada modelo. */
const EXEMPLOS = {
  'marido-de-aluguel': { cliente: 'Carla Mendes', itens: [[3, '90,00'], [1, '120,00']] },
  'limpeza-pos-obra': { cliente: 'Construtora Pinheiro', itens: [[120, '12,00'], [120, '6,00']] },
  fretes: { cliente: 'Rafael Costa', itens: [[42, '4,50'], [1, '1.200,00']] },
  cftv: { cliente: 'Padaria Bom Pão', itens: [[4, '150,00'], [1, '180,00']] },
  'energia-solar': { cliente: 'Sítio Recanto', itens: [[12, '25,00'], [1, '250,00']] },
  mecanico: { cliente: 'Juliana Prado', itens: [[1, '280,00'], [1, '120,00']] },
  dedetizacao: { cliente: 'Condomínio Araucária', itens: [[300, '2,50'], [1, '350,00']] },
  'assistencia-tecnica': { cliente: 'Pedro Lima', itens: [[1, '80,00'], [1, '450,00']] },
}
const escolhidas = (process.env.PROFISSOES || Object.keys(EXEMPLOS).join(',')).split(',')

const email = `teste-automatizado-gifs-${Date.now()}@example.com`
const senha = `Gifs-${Math.random().toString(36).slice(2)}-9`
const browser = await chromium.launch()
const opcoes = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'pt-BR' }
const ctx = await browser.newContext(opcoes)
const page = await ctx.newPage()
page.on('dialog', (d) => d.accept())
const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const fecharCookies = (p) => p.locator('button:has-text("Aceitar")').first().click({ timeout: 2500 }).catch(() => {})

try {
  // Conta e perfil, uma vez só.
  await page.goto(BASE + '/entrar?modo=criar', { waitUntil: 'load' })
  await fecharCookies(page)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Senha').fill(senha)
  await page.getByRole('button', { name: 'Criar conta grátis' }).click()
  await page.waitForURL((u) => !u.pathname.startsWith('/entrar'), { timeout: 20000 })
  await page.goto(BASE + '/perfil', { waitUntil: 'load' })
  await page.getByLabel('Nome da empresa ou seu nome').fill('Sua Empresa Serviços')
  await page.getByLabel('WhatsApp').fill('(41) 99999-1234')
  await page.getByLabel('Cidade e estado').fill('Curitiba - PR')
  await page.getByLabel('Chave Pix').fill('contato@exemplo.com')
  await page.locator('input[type="file"]').setInputFiles('public/icone-512.png')
  await page.getByAltText('Seu logo').waitFor()
  await page.getByRole('button', { name: 'Salvar' }).click()
  await page.getByRole('button', { name: 'Salvo' }).waitFor()

  for (const id of escolhidas) {
    const modelo = MODELOS.find((m) => m.id === id)
    const seo = PROFISSOES_SEO.find((p) => p.id === id)
    const ex = EXEMPLOS[id]
    const pasta = join(PASTA, id)
    mkdirSync(pasta, { recursive: true })
    const legendas = []
    let n = 0
    const foto = async (alvo, legenda, segundos = 2.2) => {
      await alvo.waitForTimeout(400)
      const arquivo = `${String(++n).padStart(2, '0')}.png`
      await alvo.screenshot({ path: join(pasta, arquivo) })
      legendas.push({ arquivo, legenda, segundos })
    }

    // 1. Página pública do modelo, como o visitante vê.
    const visitante = await browser.newContext(opcoes)
    const vis = await visitante.newPage()
    await vis.goto(BASE + `/modelo-de-orcamento/${seo.slug}`, { waitUntil: 'load' })
    await fecharCookies(vis)
    await foto(vis, `Orçamento para ${seo.para} pronto no celular`, 2.4)
    await visitante.close()

    // 2. Orçamento com os itens da profissão.
    await page.getByRole('link', { name: 'Novo orçamento' }).first().click()
    await page.getByRole('button', { name: new RegExp(escapar(modelo.nome)) }).first().click()
    await page.getByLabel('Nome', { exact: true }).waitFor({ timeout: 15000 })
    await page.getByLabel('Nome', { exact: true }).fill(ex.cliente)
    await page.getByLabel('WhatsApp').fill('(41) 98888-7777')
    const servicos = modelo.itens.filter((i) => i.tipo === 'servico').slice(0, 2)
    for (const [i, item] of servicos.entries()) {
      await page.getByRole('button', { name: `+ ${item.descricao}` }).click()
      await page.getByLabel('Quantidade').nth(i).fill(String(ex.itens[i][0]))
      await page.locator('input[placeholder="0,00"]').nth(i).fill(ex.itens[i][1])
    }
    await page.waitForTimeout(600)
    await page.getByLabel('Quantidade').nth(servicos.length - 1).scrollIntoViewIfNeeded()
    await foto(page, 'Toque nos serviços: o total sai sozinho', 2.4)

    // 3. Envio e aprovação pelo cliente.
    const popup = ctx.waitForEvent('page')
    await page.getByRole('button', { name: 'Enviar link' }).click()
    await (await popup).close()
    const link = await page.getByRole('link', { name: 'Abrir' }).getAttribute('href')
    await page.waitForTimeout(2500)
    const cliente = await browser.newContext(opcoes)
    const cli = await cliente.newPage()
    await cli.goto(BASE + link, { waitUntil: 'load' })
    await cli.getByText(`Para ${ex.cliente}`).waitFor({ timeout: 20000 })
    await fecharCookies(cli)
    await foto(cli, 'O cliente recebe pelo WhatsApp e aprova', 2.6)
    await cli.getByRole('button', { name: 'Aprovar orçamento' }).click()
    await cli.getByRole('button', { name: 'Confirmar' }).click()
    await cli.getByText('✅ Orçamento aprovado').waitFor({ timeout: 15000 })
    await cli.getByText('✅ Orçamento aprovado').scrollIntoViewIfNeeded()
    await foto(cli, 'Aprovado! E paga no Pix', 2.4)
    await cliente.close()

    writeFileSync(join(pasta, 'legendas.json'), JSON.stringify(legendas, null, 2))
    console.log(`${id}: ${legendas.length} capturas`)
    await page.getByRole('link', { name: 'Orçamentos' }).first().click()
  }
} finally {
  await browser.close()
  await limparContaDeTeste(email, senha)
}
