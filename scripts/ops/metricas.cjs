/**
 * Painel de números do Q3 Orça, direto da produção.
 * Uso: npm run ops:metricas
 */
const { firestore, contas } = require('./google.cjs')

const DIA = 24 * 60 * 60 * 1000

;(async () => {
  const agora = Date.now()
  const todas = (await contas.todas()).filter((c) => !String(c.email ?? '').startsWith('teste-automatizado'))
  const criadaEm = (c) => Number(c.createdAt ?? 0)
  const ultimoLogin = (c) => Number(c.lastLoginAt ?? 0)

  const [orcamentos, enviados, aprovados, recusados, assinaturas, pedidos, chamadosAbertos, contatos] = await Promise.all([
    firestore.contar('orcamentos', { grupo: true }),
    firestore.contar('orcamentos', { grupo: true, igual: { status: 'enviado' } }),
    firestore.contar('orcamentos', { grupo: true, igual: { status: 'aprovado' } }),
    firestore.contar('orcamentos', { grupo: true, igual: { status: 'recusado' } }),
    firestore.listar('assinaturas'),
    firestore.contar('interesses'),
    firestore.contar('suporte', { igual: { status: 'aberto' } }),
    firestore.contar('contatos'),
  ])
  const proAtivos = assinaturas.filter((a) => Number(a.validoAte) > agora)
  const receitaMensal = proAtivos.reduce((t, a) => t + (a.periodo === 'anual' ? 9900 / 12 : 1490), 0)
  const respondidos = aprovados + recusados

  const linhas = [
    ['Contas', todas.length],
    ['Cadastros nos últimos 7 dias', todas.filter((c) => agora - criadaEm(c) < 7 * DIA).length],
    ['Cadastros nos últimos 30 dias', todas.filter((c) => agora - criadaEm(c) < 30 * DIA).length],
    ['Entraram nos últimos 7 dias', todas.filter((c) => agora - ultimoLogin(c) < 7 * DIA).length],
    ['Orçamentos criados', orcamentos],
    ['Orçamentos aguardando resposta', enviados],
    ['Orçamentos aprovados', aprovados],
    ['Taxa de aprovação', respondidos ? `${Math.round((aprovados / respondidos) * 100)}%` : '-'],
    ['Assinantes Pro ativos', proAtivos.length],
    ['Receita mensal estimada', `R$ ${(receitaMensal / 100).toFixed(2).replace('.', ',')}`],
    ['Pedidos do Pro pendentes', pedidos],
    ['Chamados de suporte aguardando equipe', chamadosAbertos],
    ['Mensagens do Fale conosco', contatos],
  ]
  console.log(`\nQ3 Orça · métricas em ${new Date(agora).toLocaleString('pt-BR')}\n`)
  for (const [nome, valor] of linhas) console.log(`${String(nome).padEnd(40, '.')} ${valor}`)
  console.log('')
})().catch((e) => {
  console.error('Erro:', e.message)
  process.exit(1)
})
