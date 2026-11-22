import { describe, expect, it } from 'vitest'
import { cruzarVisitas, lerCampanha, semanaDaCampanha, situacaoDaMeta, type ContaCampanha, type OrcamentoCampanha, funilDeEtapas } from './campanha'

const DIA = 24 * 60 * 60 * 1000
const t = (iso: string) => new Date(iso).getTime()

describe('semana da campanha', () => {
  it('começa na semana 1 no dia de início', () => {
    expect(semanaDaCampanha('2026-10-05', t('2026-10-05T09:00:00'))).toBe(1)
    expect(semanaDaCampanha('2026-10-05', t('2026-10-11T23:00:00'))).toBe(1)
    expect(semanaDaCampanha('2026-10-05', t('2026-10-12T00:30:00'))).toBe(2)
    expect(semanaDaCampanha('2026-10-05', t('2026-10-01T10:00:00'))).toBe(0)
  })
})

describe('leitura da campanha', () => {
  const agora = t('2026-10-20T12:00:00') // semana 3
  const contas: ContaCampanha[] = [
    { uid: 'velho', criadaEm: t('2026-09-20T10:00:00'), ultimoLogin: agora },
    { uid: 'a', criadaEm: t('2026-10-06T10:00:00'), ultimoLogin: agora, fonte: 'balaroti', meio: 'cartaz' },
    { uid: 'b', criadaEm: t('2026-10-14T10:00:00'), ultimoLogin: agora, fonte: 'balaroti', meio: 'cartaz' },
    { uid: 'c', criadaEm: t('2026-10-19T10:00:00'), ultimoLogin: agora, fonte: 'whatsapp', meio: 'convite' },
  ]
  const orcamentos: OrcamentoCampanha[] = [
    { uid: 'a', status: 'aprovado', criadoEm: t('2026-10-07T10:00:00'), enviadoEm: t('2026-10-07T11:00:00') },
    { uid: 'b', status: 'enviado', criadoEm: t('2026-10-18T10:00:00'), enviadoEm: t('2026-10-18T11:00:00') },
    { uid: 'b', status: 'rascunho', criadoEm: t('2026-10-19T10:00:00') },
    { uid: 'c', status: 'recusado', criadoEm: t('2026-10-19T12:00:00'), enviadoEm: t('2026-10-19T13:00:00') },
  ]
  const l = lerCampanha('2026-10-05', contas, orcamentos, agora)

  it('conta cadastros da campanha, ativos e enviados da semana', () => {
    expect(l.semana).toBe(3)
    expect(l.contas).toBe(4)
    expect(l.cadastrosNaCampanha).toBe(3)
    expect(l.cadastros7dias).toBe(2)
    expect(l.fundadoresAtivos).toBe(2) // b e c enviaram nos últimos 7 dias
    expect(l.orcamentosEnviados7dias).toBe(2)
    expect(l.taxaAprovacao).toBe(50)
  })
  it('separa o funil por canal, com as contas antigas à parte', () => {
    const balaroti = l.canais.find((c) => c.canal === 'balaroti / cartaz')!
    expect(balaroti).toEqual({ canal: 'balaroti / cartaz', cadastros: 2, criaramOrcamento: 2, enviaram: 2, tiveramAprovacao: 1 })
    expect(l.canais.find((c) => c.canal === 'antes da campanha')!.cadastros).toBe(1)
  })
  it('série semanal de cadastros e envios', () => {
    expect(l.semanas).toEqual([
      { semana: 1, cadastros: 1, enviados: 1 },
      { semana: 2, cadastros: 1, enviados: 1 }, // envio de b em 18/10
      { semana: 3, cadastros: 1, enviados: 1 },
    ])
  })
})

describe('situação da meta', () => {
  it('compara com o ritmo esperado até o prazo', () => {
    expect(situacaoDaMeta(35, 4, 35, 2)).toBe('atingida')
    expect(situacaoDaMeta(35, 4, 0, 1)).toBe('no ritmo') // semana 1: nada cobrado ainda
    expect(situacaoDaMeta(35, 4, 18, 3)).toBe('no ritmo') // 2 semanas completas: 18 esperados
    expect(situacaoDaMeta(35, 4, 10, 3)).toBe('atrasada')
    expect(situacaoDaMeta(300, 12, null, 2)).toBe('sem dado')
    expect(situacaoDaMeta(300, 12, 0, 0)).toBe('no ritmo')
  })
})

describe('visitas da campanha', () => {
  it('soma visitas por canal e cruza com cadastros por nicho', () => {
    const r = cruzarVisitas('2026-10-05', [
      { dia: '2026-10-04', fonte: 'facebook-grupo', meio: 'post-dica', campanha: 'nicho-pintor', total: 50 },
      { dia: '2026-10-11', fonte: 'facebook-grupo', meio: 'post-dica', campanha: 'nicho-pintor', total: 8 },
      { dia: '2026-10-12', fonte: 'facebook-grupo', meio: 'post-dica', campanha: 'nicho-pintor', total: 2 },
      { dia: '2026-10-11', fonte: 'facebook-grupo', meio: 'post-pergunta', campanha: 'nicho-eletricista', total: 4 },
      { dia: '2026-10-11', fonte: 'facebook', meio: 'social', campanha: '-', total: 3 },
    ], [
      { criadaEm: Date.UTC(2026, 9, 11, 15), fonte: 'facebook-grupo', meio: 'post-dica', campanha: 'nicho-pintor' },
      { criadaEm: Date.UTC(2026, 9, 1), fonte: 'facebook-grupo', meio: 'post-dica', campanha: 'nicho-pintor' },
    ])
    expect(r.total).toBe(17)
    expect(r.porCanal).toEqual({ 'facebook-grupo / post-dica': 10, 'facebook-grupo / post-pergunta': 4, 'facebook / social': 3 })
    expect(r.nichos).toEqual([
      { nicho: 'nicho-pintor', visitas: 10, cadastros: 1, conversao: 0.1 },
      { nicho: 'nicho-eletricista', visitas: 4, cadastros: 0, conversao: 0 },
    ])
  })
})

describe('funil de etapas do site', () => {
  it('soma por canal, ignora dias antigos e etapas desconhecidas', () => {
    const e = (dia: string, etapa: string, fonte: string, total: number) => ({ dia, etapa, fonte, meio: 'pagina', campanha: 'pintor', total })
    const linhas = funilDeEtapas('2026-11-22', [
      e('2026-11-22', 'modelo', 'facebook', 5),
      e('2026-11-23', 'modelo', 'facebook', 2),
      e('2026-11-23', 'pdf', 'facebook', 1),
      e('2026-11-21', 'modelo', 'facebook', 9),
      e('2026-11-22', 'outra', 'facebook', 3),
      e('2026-11-22', 'gerador', 'google', 1),
    ])
    expect(linhas).toEqual([
      { canal: 'facebook / pagina', modelo: 7, gerador: 0, pdf: 1, 'clique-cadastro': 0, entrar: 0 },
      { canal: 'google / pagina', modelo: 0, gerador: 1, pdf: 0, 'clique-cadastro': 0, entrar: 0 },
    ])
  })
})
