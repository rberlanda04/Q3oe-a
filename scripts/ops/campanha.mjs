/**
 * Leitura da campanha de lançamento, direto da produção.
 * Uso: npm run ops:campanha            (tabela no terminal e grava campanha/leituras/AAAA-MM-DD.json)
 *      npm run ops:campanha -- --json  (só o JSON, para o agente de campanha)
 */
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { cruzarVisitas, lerCampanha, situacaoDaMeta } from '../../src/domain/campanha.ts'

const require = createRequire(import.meta.url)
const { firestore, contas } = require('./google.cjs')
const raiz = new URL('../../', import.meta.url)
const config = JSON.parse(readFileSync(new URL('campanha/campanha.json', raiz), 'utf8'))
const soJson = process.argv.includes('--json')

const agora = Date.now()
const [usuarios, perfis, orcs, visitas] = await Promise.all([
  contas.todas(),
  firestore.listarTodos('users'),
  firestore.grupo('orcamentos', ['status', 'criadoEm', 'enviadoEm']),
  firestore.listarTodos('visitas').catch(() => []),
])
const origemDe = new Map(perfis.map((p) => [p.id, p.origem]))
const listaContas = usuarios
  .filter((u) => !String(u.email ?? '').startsWith('teste-automatizado'))
  .map((u) => ({
    uid: u.localId,
    criadaEm: Number(u.createdAt ?? 0),
    ultimoLogin: Number(u.lastLoginAt ?? 0),
    fonte: origemDe.get(u.localId)?.fonte,
    meio: origemDe.get(u.localId)?.meio,
    campanha: origemDe.get(u.localId)?.campanha,
  }))
const uidsValidos = new Set(listaContas.map((c) => c.uid))
const listaOrcamentos = orcs
  .map((o) => ({ uid: o.caminho.split('/')[1], status: String(o.status ?? ''), criadoEm: Number(o.criadoEm ?? 0), enviadoEm: o.enviadoEm ? Number(o.enviadoEm) : undefined }))
  .filter((o) => uidsValidos.has(o.uid))

const leitura = lerCampanha(config.inicio, listaContas, listaOrcamentos, agora, config.semanas)
const automatico = { fundadores: leitura.fundadoresAtivos, cadastros: leitura.cadastrosNaCampanha, orcamentosSemana: leitura.orcamentosEnviados7dias }
const metas = config.metas.map((m) => {
  const realizado = m.id in automatico ? automatico[m.id] : null
  return { ...m, realizado, situacao: situacaoDaMeta(m.meta, m.prazoSemana, realizado, leitura.semana) }
})
// Visitas anônimas por origem (coleção visitas) cruzadas com os cadastros, por canal e por nicho.
const cruz = cruzarVisitas(config.inicio, visitas, listaContas)
leitura.canais = leitura.canais.map((c) => ({ ...c, visitas: cruz.porCanal[c.canal] ?? 0 }))
for (const [canal, n] of Object.entries(cruz.porCanal)) {
  if (!leitura.canais.some((c) => c.canal === canal)) leitura.canais.push({ canal, cadastros: 0, criaramOrcamento: 0, enviaram: 0, tiveramAprovacao: 0, visitas: n })
}
const resultado = { campanha: config.nome, data: new Date(agora).toISOString().slice(0, 10), ...leitura, visitasTotal: cruz.total, nichos: cruz.nichos, metas,
  cronogramaDaSemana: config.cronograma.find((c) => c.semana === leitura.semana) ?? null }

mkdirSync(new URL('campanha/leituras/', raiz), { recursive: true })
writeFileSync(new URL(`campanha/leituras/${resultado.data}.json`, raiz), JSON.stringify(resultado, null, 2) + '\n')

// Documento pronto para o painel da campanha (artefato "Campanha Q3 Orça", doc painel/atual).
// O agente de campanha preenche resumo e proximasAcoes antes de gravar.
const painel = {
  campanha: config.nome, praca: config.praca, inicio: config.inicio, totalSemanas: config.semanas,
  semana: leitura.semana, atualizadoEm: agora, metas, canais: leitura.canais, semanas: leitura.semanas,
  visitasTotal: cruz.total, nichos: cruz.nichos,
  cronograma: config.cronograma, cronogramaDaSemana: resultado.cronogramaDaSemana,
  links: config.canais.map(({ descricao, link, fonte, meio }) => ({ descricao, link, fonte, meio })),
  numeros: {
    contas: leitura.contas, cadastrosNaCampanha: leitura.cadastrosNaCampanha, cadastros7dias: leitura.cadastros7dias,
    fundadoresAtivos: leitura.fundadoresAtivos, orcamentosEnviados7dias: leitura.orcamentosEnviados7dias,
    aprovados: leitura.aprovados, taxaAprovacao: leitura.taxaAprovacao,
  },
  resumo: '',
  proximasAcoes: [],
}
writeFileSync(new URL('campanha/painel.json', raiz), JSON.stringify(painel, null, 2) + '\n')

if (soJson) {
  console.log(JSON.stringify(resultado, null, 2))
} else {
  console.log(`\n${config.nome} · semana ${leitura.semana} de ${config.semanas}\n`)
  console.table(metas.map((m) => ({ Indicador: m.indicador, Meta: m.meta, Prazo: `sem. ${m.prazoSemana}`, Realizado: m.realizado ?? '(painel)', Situação: m.situacao })))
  console.log('Funil por canal:')
  console.table(leitura.canais.map((c) => ({ Canal: c.canal, Visitas: c.visitas ?? 0, Cadastros: c.cadastros, 'Fizeram orçamento': c.criaramOrcamento, Enviaram: c.enviaram, 'Tiveram aprovação': c.tiveramAprovacao })))
  if (cruz.nichos.length) {
    console.log('Por nicho:')
    console.table(cruz.nichos.map((n) => ({ Nicho: n.nicho, Visitas: n.visitas, Cadastros: n.cadastros, Conversão: n.conversao == null ? '-' : `${(n.conversao * 100).toFixed(1)}%` })))
  }
  if (resultado.cronogramaDaSemana) console.log(`Foco da semana: ${resultado.cronogramaDaSemana.foco}: ${resultado.cronogramaDaSemana.entregas.join('; ')}`)
}
