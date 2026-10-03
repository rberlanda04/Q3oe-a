/**
 * Teste de ponta a ponta do Q3 Orça num navegador real (Playwright), contra o site publicado.
 * Cria uma conta de teste, percorre o produto inteiro e termina excluindo a conta pelo próprio app.
 * Se alguma etapa falhar, apaga a conta e os dados de teste no fim.
 *
 * Uso:
 *   npx playwright install chromium        (uma vez por máquina)
 *   npm run test:e2e                        (produção)
 *   BASE=https://q3orca--teste-xxxx.web.app npm run test:e2e   (canal de pré-visualização)
 *
 * Capturas de tela das falhas ficam na pasta temporária do sistema (q3orca-e2e).
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { limparContaDeTeste } from './limpar-conta.mjs'

const PASTA = join(tmpdir(), 'q3orca-e2e')
mkdirSync(PASTA, { recursive: true })

const BASE = process.env.BASE || 'https://q3orca.web.app'
const LOGO = process.env.LOGO || 'public/icone-512.png'
const email = `teste-automatizado-${Date.now()}@example.com`
const senha = `Teste-${Math.random().toString(36).slice(2)}-9`

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true })
const page = await ctx.newPage()
const erros = []
page.on('pageerror', (e) => erros.push('pageerror: ' + e.message))
page.on('console', (m) => {
  if (m.type() === 'error') erros.push('console: ' + m.text().slice(0, 200))
})
page.on('dialog', (d) => d.accept())

const passo = async (nome, fn) => {
  try {
    await fn()
    console.log('OK   ', nome)
  } catch (e) {
    console.log('FALHA', nome, '-', e.message.split('\n')[0])
    await page.screenshot({ path: join(PASTA, `falha-${nome.replace(/\W+/g, '-')}.png`), fullPage: true })
    throw e
  }
}

let linkPublico = ''
let contaExcluida = false
let falhou = false
try {
  await passo('página do beta abre e leva ao cadastro', async () => {
    await page.goto(BASE + '/beta', { waitUntil: 'load' })
    await page.getByRole('heading', { name: /Ajude a construir/ }).waitFor()
    await page.getByRole('link', { name: /Quero testar/ }).waitFor()
  })

  await passo('página de modelo leva ao cadastro e abre orçamento de pintor', async () => {
    await page.goto(BASE + '/modelo-de-orcamento/pintor', { waitUntil: 'load' })
    await page.getByRole('heading', { name: /Modelo de orçamento para pintor/ }).waitFor()
    await page.screenshot({ path: join(PASTA, 'tela-modelo-pintor.png'), fullPage: true })
    await page.getByRole('link', { name: /Usar este modelo grátis/ }).click()
    await page.getByText('Ao criar a conta, você concorda com os').waitFor()
    await page.getByLabel('E-mail').fill(email)
    await page.getByLabel('Senha').fill(senha)
    await page.getByRole('button', { name: 'Criar conta grátis' }).click()
    await page.getByText('Orçamento nº 2026-0001').waitFor({ timeout: 20000 })
    await page.getByText('Sugestões para pintor').waitFor()
  })

  await passo('painel mostra teste Pro e primeiros passos', async () => {
    await page.getByRole('link', { name: 'Orçamentos' }).first().click()
    await page.getByText('Complete seus dados').waitFor()
  })

  await passo('buscar dados públicos pelo CNPJ', async () => {
    await page.getByRole('link', { name: 'Meus dados' }).click()
    // Fase beta: 90 dias de Pro grátis; fora do beta: 14 dias de teste.
    await page.getByText(/Pro grátis no beta: 90 dias|Teste Pro: 14 dias/).waitFor()
    await page.getByLabel('CPF ou CNPJ').fill('00.000.000/0001-91')
    await page.getByRole('button', { name: /Buscar CNPJ/ }).click()
    await page.getByText(/Dados públicos preenchidos/).waitFor({ timeout: 20000 })
    const razao = await page.getByLabel('Razão social').inputValue()
    if (!/Banco do Brasil/i.test(razao)) throw new Error('razão social inesperada: ' + razao)
  })

  await passo('enviar logo, escolher cor e salvar perfil', async () => {
    await page.getByLabel('Nome da empresa ou seu nome').fill('Teste Pinturas')
    await page.getByLabel('WhatsApp').fill('(11) 97777-6666')
    await page.getByLabel('Cidade e estado').fill('Campinas - SP')
    await page.getByLabel('Chave Pix').fill('teste@example.com')
    await page.locator('input[type="file"]').setInputFiles(LOGO)
    await page.getByAltText('Seu logo').waitFor()
    await page.getByRole('button', { name: 'Usar a cor #1f418f' }).click()
    await page.getByRole('button', { name: 'Salvar' }).click()
    await page.getByRole('button', { name: 'Salvo' }).waitFor()
    await page.screenshot({ path: join(PASTA, 'tela-perfil-pro.png'), fullPage: true })
  })

  await passo('pedido de assinatura Pro é registrado', async () => {
    await page.getByRole('link', { name: /Pro grátis no beta|Teste Pro/ }).first().click()
    await page.getByRole('button', { name: 'Quero o Pro' }).click()
    await page.getByText('Pedido recebido!').waitFor({ timeout: 15000 })
    await page.screenshot({ path: join(PASTA, 'tela-planos.png'), fullPage: true })
  })

  await passo('criar orçamento com cliente e itens', async () => {
    await page.getByRole('link', { name: 'Novo orçamento' }).first().click()
    await page.getByRole('button', { name: /Pintor/ }).click()
    await page.getByText('Orçamento nº 2026-0002').waitFor()
    await page.getByLabel('Nome', { exact: true }).fill('Cliente Teste Silva')
    await page.getByLabel('WhatsApp').fill('(11) 98888-7777')
    await page.getByRole('button', { name: '+ Pintura de parede interna (2 demãos)' }).click()
    await page.getByLabel('Quantidade').first().fill('20')
    await page.locator('input[placeholder="0,00"]').first().fill('18,50')
    await page.getByText('R$ 370,00').first().waitFor()
  })

  await passo('enviar link pelo WhatsApp', async () => {
    const popup = ctx.waitForEvent('page')
    await page.getByRole('button', { name: 'Enviar link' }).click()
    const wa = await popup
    if (!wa.url().includes('5511988887777')) throw new Error('URL do WhatsApp inesperada: ' + wa.url())
    await wa.close()
    linkPublico = await page.getByRole('link', { name: 'Abrir' }).getAttribute('href')
    await page.waitForTimeout(2500)
  })

  await passo('cliente vê a marca do profissional e aprova', async () => {
    const anonimo = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const cli = await anonimo.newPage()
    cli.on('pageerror', (e) => erros.push('cliente pageerror: ' + e.message))
    await cli.goto(BASE + linkPublico, { waitUntil: 'load' })
    await cli.getByText('Para Cliente Teste Silva').waitFor({ timeout: 20000 })
    await cli.getByAltText('Logo de Teste Pinturas').waitFor()
    if (await cli.getByText('Feito com').count()) throw new Error('marca Q3 aparece para cliente de assinante Pro')
    await cli.screenshot({ path: join(PASTA, 'tela-cliente-pro.png'), fullPage: true })
    await cli.getByRole('button', { name: 'Aprovar orçamento' }).click()
    await cli.getByRole('button', { name: 'Confirmar' }).click()
    await cli.getByText('✅ Orçamento aprovado').waitFor({ timeout: 15000 })
    await anonimo.close()
  })

  await passo('status muda sozinho para aprovado', async () => {
    await page.waitForFunction(() => document.querySelector('select[aria-label="Status"]')?.value === 'aprovado', null, { timeout: 20000 })
  })

  await passo('PDF do orçamento Pro é gerado', async () => {
    const download = page.waitForEvent('download', { timeout: 30000 })
    await page.getByRole('button', { name: /Registrar pagamento/ }).click()
    await page.getByRole('button', { name: 'Salvar e enviar recibo' }).click()
    const arquivo = await download
    await arquivo.saveAs(join(PASTA, 'e2e2-recibo.pdf'))
  })

  await passo('excluir orçamento remove o link público', async () => {
    await page.getByRole('button', { name: 'Excluir', exact: true }).click()
    await page.getByText('Seus orçamentos').waitFor()
    await page.waitForTimeout(2000)
    const anonimo = await browser.newContext()
    const cli = await anonimo.newPage()
    await cli.goto(BASE + linkPublico, { waitUntil: 'load' })
    await cli.getByText('não existe mais').waitFor({ timeout: 15000 })
    await anonimo.close()
  })
  await passo('termos e privacidade abrem', async () => {
    await page.goto(BASE + '/termos', { waitUntil: 'load' })
    await page.getByRole('heading', { name: 'Termos de uso' }).waitFor()
    await page.goto(BASE + '/privacidade', { waitUntil: 'load' })
    await page.getByRole('heading', { name: 'Política de privacidade' }).waitFor()
    await page.getByText('Excluir minha conta', { exact: false }).first().waitFor()
  })

  await passo('painel admin bloqueado para quem não é admin', async () => {
    await page.goto(BASE + '/admin', { waitUntil: 'load' })
    await page.getByText('Acesso restrito').waitFor({ timeout: 20000 })
  })

  await passo('botão Dar opinião abre a sugestão pronta', async () => {
    await page.getByRole('link', { name: 'Orçamentos' }).first().click()
    await page.getByRole('link', { name: 'Dar opinião' }).click()
    await page.getByLabel('Resumo').waitFor()
    const assunto = await page.getByLabel('Resumo').inputValue()
    if (!assunto.includes('beta')) throw new Error('assunto da sugestão não veio preenchido: ' + assunto)
    await page.getByLabel(/O que você achou/).waitFor()
  })

  await passo('abrir chamado na central de ajuda', async () => {
    await page.goto(BASE + '/ajuda', { waitUntil: 'load' })
    await page.getByRole('heading', { name: 'Central de ajuda' }).waitFor()
    await page.getByLabel('Resumo').fill('Teste automatizado: dúvida sobre o PDF')
    await page.getByLabel('Conte o que aconteceu').fill('Mensagem de teste automatizado. Pode ignorar.')
    await page.getByRole('button', { name: 'Enviar para a equipe' }).click()
    await page.getByRole('heading', { name: 'Teste automatizado: dúvida sobre o PDF' }).waitFor({ timeout: 15000 })
    await page.getByText('Mensagem de teste automatizado. Pode ignorar.').waitFor()
    await page.getByText('Aguardando equipe').waitFor()
  })

  await passo('continuar a conversa e marcar como resolvido', async () => {
    await page.getByLabel('Escreva para a equipe').fill('Segunda mensagem do teste.')
    await page.getByRole('button', { name: 'Enviar', exact: true }).click()
    await page.getByText('Segunda mensagem do teste.').waitFor()
    await page.getByRole('button', { name: 'Marcar como resolvido' }).click()
    await page.getByText('Resolvido').first().waitFor()
    await page.screenshot({ path: join(PASTA, 'tela-chamado.png'), fullPage: true })
    await page.getByRole('link', { name: 'Central de ajuda' }).click()
    await page.getByText('Teste automatizado: dúvida sobre o PDF').waitFor()
  })

  await passo('visitante envia o formulário Fale conosco', async () => {
    const anonimo = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const visitante = await anonimo.newPage()
    await visitante.goto(BASE + '/contato', { waitUntil: 'load' })
    await visitante.getByLabel('Seu nome').fill('Teste automatizado')
    await visitante.getByLabel('E-mail para resposta').fill('teste-automatizado@example.com')
    await visitante.getByLabel('Mensagem').fill('Mensagem de teste do formulário. Pode apagar.')
    await visitante.getByRole('button', { name: 'Enviar mensagem' }).click()
    await visitante.getByText('Mensagem enviada!').waitFor({ timeout: 15000 })
    await anonimo.close()
  })

  await passo('usuário exclui a própria conta e todos os dados', async () => {
    await page.getByRole('link', { name: 'Meus dados' }).click()
    await page.getByRole('button', { name: 'Excluir minha conta' }).click()
    await page.getByLabel(/para confirmar/).fill('excluir')
    await page.getByLabel('Sua senha').fill(senha)
    await page.getByRole('button', { name: 'Excluir tudo' }).click()
    await page.getByRole('heading', { name: /Orçamento rápido/ }).waitFor({ timeout: 30000 })
    contaExcluida = true
  })
} catch {
  falhou = true
} finally {
  console.log('ERROS:', JSON.stringify(erros, null, 1))
  await browser.close()
  if (!contaExcluida) await limparContaDeTeste(email, senha).catch((e) => console.log('Limpeza falhou:', e.message))
  // Mensagens de teste do Fale conosco: visitantes não podem apagar; usa o acesso de administrador do Firebase CLI.
  try {
    const { firestore } = createRequire(import.meta.url)('../../scripts/ops/google.cjs')
    for (const c of await firestore.listar('contatos')) {
      if (c.email === 'teste-automatizado@example.com') await firestore.apagar(`contatos/${c.id}`)
    }
  } catch (e) {
    console.log('Aviso: não apaguei a mensagem de teste do Fale conosco:', e.message)
  }
  console.log(falhou || erros.length ? 'Resultado: FALHOU' : 'Resultado: todas as etapas passaram')
  process.exit(falhou || erros.length ? 1 : 0)
}
