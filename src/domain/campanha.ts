/**
 * Números da campanha de lançamento, calculados a partir de contas, perfis (com a origem
 * do cadastro) e orçamentos. Puro e testado: o script ops:campanha só busca os dados.
 */
export interface ContaCampanha {
  uid: string
  criadaEm: number
  ultimoLogin: number
  /** utm_source / meio do primeiro acesso; vazio para contas antigas, de antes da medição. */
  fonte?: string
  meio?: string
  /** utm_campaign do primeiro acesso, como nicho-pintor. */
  campanha?: string
}

export interface OrcamentoCampanha {
  uid: string
  status: string
  criadoEm: number
  enviadoEm?: number
}

const DIA = 24 * 60 * 60 * 1000

export function semanaDaCampanha(inicioISO: string, agora: number): number {
  const [a, m, d] = inicioISO.split('-').map(Number)
  const inicio = new Date(a, m - 1, d).getTime()
  return Math.floor((agora - inicio) / (7 * DIA)) + 1
}

export interface Canal {
  canal: string
  cadastros: number
  criaramOrcamento: number
  enviaram: number
  tiveramAprovacao: number
}

export interface LeituraCampanha {
  em: number
  semana: number
  contas: number
  cadastrosNaCampanha: number
  cadastros7dias: number
  fundadoresAtivos: number
  orcamentosEnviados7dias: number
  aprovados: number
  taxaAprovacao: number | null
  canais: Canal[]
  semanas: { semana: number; cadastros: number; enviados: number }[]
}

const foiEnviado = (o: OrcamentoCampanha) => Boolean(o.enviadoEm) || ['enviado', 'aprovado', 'recusado', 'pago'].includes(o.status)

export function lerCampanha(inicioISO: string, contas: ContaCampanha[], orcamentos: OrcamentoCampanha[], agora: number, totalSemanas = 12): LeituraCampanha {
  const [a, m, d] = inicioISO.split('-').map(Number)
  const inicio = new Date(a, m - 1, d).getTime()
  const semana = semanaDaCampanha(inicioISO, agora)
  const porUid = new Map<string, OrcamentoCampanha[]>()
  for (const o of orcamentos) porUid.set(o.uid, [...(porUid.get(o.uid) ?? []), o])

  const naCampanha = contas.filter((c) => c.criadaEm >= inicio)
  const enviados7 = orcamentos.filter((o) => foiEnviado(o) && (o.enviadoEm ?? o.criadoEm) >= agora - 7 * DIA)
  const ativos = new Set(enviados7.map((o) => o.uid))
  const aprovados = orcamentos.filter((o) => o.status === 'aprovado' || o.status === 'pago').length
  const recusados = orcamentos.filter((o) => o.status === 'recusado').length

  const grupos = new Map<string, ContaCampanha[]>()
  for (const c of contas) {
    const canal = c.criadaEm < inicio && !c.fonte ? 'antes da campanha' : c.fonte ? `${c.fonte}${c.meio ? ` / ${c.meio}` : ''}` : 'sem origem'
    grupos.set(canal, [...(grupos.get(canal) ?? []), c])
  }
  const canais: Canal[] = [...grupos.entries()]
    .map(([canal, lista]) => {
      const dele = (c: ContaCampanha) => porUid.get(c.uid) ?? []
      return {
        canal,
        cadastros: lista.length,
        criaramOrcamento: lista.filter((c) => dele(c).length > 0).length,
        enviaram: lista.filter((c) => dele(c).some(foiEnviado)).length,
        tiveramAprovacao: lista.filter((c) => dele(c).some((o) => o.status === 'aprovado' || o.status === 'pago')).length,
      }
    })
    .sort((x, y) => y.cadastros - x.cadastros)

  const semanas = Array.from({ length: Math.max(0, Math.min(semana, totalSemanas)) }, (_, i) => {
    const ini = inicio + i * 7 * DIA
    const fim = ini + 7 * DIA
    return {
      semana: i + 1,
      cadastros: contas.filter((c) => c.criadaEm >= ini && c.criadaEm < fim).length,
      enviados: orcamentos.filter((o) => foiEnviado(o) && (o.enviadoEm ?? o.criadoEm) >= ini && (o.enviadoEm ?? o.criadoEm) < fim).length,
    }
  })

  return {
    em: agora,
    semana,
    contas: contas.length,
    cadastrosNaCampanha: naCampanha.length,
    cadastros7dias: contas.filter((c) => c.criadaEm >= agora - 7 * DIA).length,
    fundadoresAtivos: ativos.size,
    orcamentosEnviados7dias: enviados7.length,
    aprovados,
    taxaAprovacao: aprovados + recusados ? Math.round((aprovados / (aprovados + recusados)) * 100) : null,
    canais,
    semanas,
  }
}

export type SituacaoMeta = 'atingida' | 'no ritmo' | 'atrasada' | 'sem dado'

/**
 * Compara o realizado com a meta pelo ritmo linear até o prazo, contando só as semanas já
 * completas (na semana 1 ainda não se cobra nada; na semana 3, o esperado de 2 semanas).
 */
export function situacaoDaMeta(meta: number, prazoSemana: number, realizado: number | null, semanaAtual: number): SituacaoMeta {
  if (realizado === null || realizado === undefined) return 'sem dado'
  if (realizado >= meta) return 'atingida'
  const completas = Math.min(Math.max(semanaAtual - 1, 0), prazoSemana)
  const esperado = Math.ceil((meta * completas) / prazoSemana)
  return realizado >= esperado ? 'no ritmo' : 'atrasada'
}

/** Total de um dia e de uma origem, como gravado na coleção visitas. */
export interface VisitaDia {
  dia: string
  fonte: string
  meio: string
  campanha: string
  total: number
}

export interface Nicho {
  nicho: string
  visitas: number
  cadastros: number
  /** Cadastros ÷ visitas; null sem visitas. */
  conversao: number | null
}

export interface CruzamentoVisitas {
  total: number
  /** Visitas por canal, com o mesmo rótulo do funil ("fonte / meio"). */
  porCanal: Record<string, number>
  nichos: Nicho[]
}

/** Junta as visitas da campanha com os cadastros, por canal e por nicho (campanhas nicho-*). */
export function cruzarVisitas(inicioISO: string, visitas: VisitaDia[], contas: ContaCampanha[]): CruzamentoVisitas {
  const inicio = new Date(inicioISO + 'T00:00:00-03:00').getTime()
  const daCampanha = visitas.filter((v) => v.dia >= inicioISO)
  const porCanal: Record<string, number> = {}
  const visitasNicho = new Map<string, number>()
  let total = 0
  for (const v of daCampanha) {
    const n = Number(v.total) || 0
    total += n
    const canal = `${v.fonte} / ${v.meio}`
    porCanal[canal] = (porCanal[canal] ?? 0) + n
    if (v.campanha.startsWith('nicho-')) visitasNicho.set(v.campanha, (visitasNicho.get(v.campanha) ?? 0) + n)
  }
  const cadastrosNicho = new Map<string, number>()
  for (const c of contas) {
    if (c.criadaEm >= inicio && c.campanha?.startsWith('nicho-')) cadastrosNicho.set(c.campanha, (cadastrosNicho.get(c.campanha) ?? 0) + 1)
  }
  const nomes = new Set([...visitasNicho.keys(), ...cadastrosNicho.keys()])
  const nichos = [...nomes]
    .map((nicho) => {
      const vis = visitasNicho.get(nicho) ?? 0
      const cad = cadastrosNicho.get(nicho) ?? 0
      return { nicho, visitas: vis, cadastros: cad, conversao: vis ? cad / vis : null }
    })
    .sort((a, b) => b.cadastros - a.cadastros || b.visitas - a.visitas)
  return { total, porCanal, nichos }
}

/** Total de um dia, de uma etapa e de uma origem, como gravado na coleção etapas. */
export interface EtapaDia extends VisitaDia {
  etapa: string
}

export const ORDEM_ETAPAS = ['modelo', 'gerador', 'pdf', 'clique-cadastro', 'entrar'] as const

export type LinhaEtapas = { canal: string } & Record<(typeof ORDEM_ETAPAS)[number], number>

/** Soma as etapas do funil do site por canal ("fonte / meio") desde a data dada, canal com mais passagens primeiro. */
export function funilDeEtapas(desdeISO: string, etapas: EtapaDia[]): LinhaEtapas[] {
  const linhas = new Map<string, LinhaEtapas>()
  for (const e of etapas) {
    if (e.dia < desdeISO || !(ORDEM_ETAPAS as readonly string[]).includes(e.etapa)) continue
    const canal = `${e.fonte} / ${e.meio}`
    const linha = linhas.get(canal) ?? { canal, modelo: 0, gerador: 0, pdf: 0, 'clique-cadastro': 0, entrar: 0 }
    linha[e.etapa as (typeof ORDEM_ETAPAS)[number]] += Number(e.total) || 0
    linhas.set(canal, linha)
  }
  const soma = (l: LinhaEtapas) => ORDEM_ETAPAS.reduce((t, k) => t + l[k], 0)
  return [...linhas.values()].sort((a, b) => soma(b) - soma(a))
}
