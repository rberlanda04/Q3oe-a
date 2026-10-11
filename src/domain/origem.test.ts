import { describe, expect, it } from 'vitest'
import { chaveVisita, escolherOrigem, origemDaVisita } from './origem'

const HOST = 'q3orca.web.app'
const T = 1_700_000_000_000

describe('origem da visita', () => {
  it('usa os utm do QR Code ou anúncio', () => {
    const o = origemDaVisita('https://q3orca.web.app/?utm_source=Balaroti&utm_medium=cartaz&utm_campaign=Fundadores Curitiba', '', T, HOST)
    expect(o).toEqual({ fonte: 'balaroti', meio: 'cartaz', campanha: 'fundadores-curitiba', pagina: '/', em: T })
  })
  it('sem utm, deduz pelo site que trouxe', () => {
    expect(origemDaVisita('https://q3orca.web.app/modelos/eletricista', 'https://www.google.com/', T, HOST)).toMatchObject({ fonte: 'google', meio: 'organico', pagina: '/modelos/eletricista' })
    expect(origemDaVisita('https://q3orca.web.app/', 'https://l.instagram.com/x', T, HOST)).toMatchObject({ fonte: 'instagram', meio: 'social' })
    expect(origemDaVisita('https://q3orca.web.app/', 'https://blogdaobra.com.br/post', T, HOST)).toMatchObject({ fonte: 'blogdaobra.com.br', meio: 'referencia' })
    expect(origemDaVisita('https://q3orca.web.app/', '', T, HOST)).toMatchObject({ fonte: 'direto', meio: 'nenhum' })
    expect(origemDaVisita('https://q3orca.web.app/planos', 'https://q3orca.web.app/', T, HOST)).toMatchObject({ fonte: 'direto' })
  })
})

describe('primeiro acesso vale', () => {
  const dia = 24 * 60 * 60 * 1000
  const cartaz = { fonte: 'balaroti', meio: 'cartaz', campanha: '', pagina: '/', em: T }
  const direto = { fonte: 'direto', meio: 'nenhum', campanha: '', pagina: '/', em: T + dia }
  it('mantém a origem de campanha mesmo com visitas diretas depois', () => {
    expect(escolherOrigem(cartaz, direto, 90 * dia)).toBe(cartaz)
  })
  it('uma origem com pista substitui a primeira visita direta', () => {
    expect(escolherOrigem({ ...direto, em: T }, { ...cartaz, em: T + dia }, 90 * dia).fonte).toBe('balaroti')
  })
  it('depois da validade, recomeça', () => {
    expect(escolherOrigem(cartaz, { ...direto, em: T + 100 * dia }, 90 * dia).fonte).toBe('direto')
  })
})

describe('contador de visitas', () => {
  const T = Date.UTC(2026, 9, 11, 15)
  it('gera uma chave por dia e por origem, com a campanha do nicho', () => {
    const o = origemDaVisita('https://www.q3orca.com.br/modelo-de-orcamento/pintor?utm_source=facebook-grupo&utm_medium=post-dica&utm_campaign=nicho-pintor', '', T, 'www.q3orca.com.br')
    expect(chaveVisita(o, T)).toEqual({ id: '2026-10-11__facebook-grupo__post-dica__nicho-pintor', dia: '2026-10-11', fonte: 'facebook-grupo', meio: 'post-dica', campanha: 'nicho-pintor' })
  })
  it('visita direta não conta e visita social sem utm usa "-" na campanha', () => {
    expect(chaveVisita(origemDaVisita('https://www.q3orca.com.br/', '', T, 'www.q3orca.com.br'), T)).toBeNull()
    const fb = origemDaVisita('https://www.q3orca.com.br/', 'https://l.facebook.com/l.php?u=x', T, 'www.q3orca.com.br')
    expect(chaveVisita(fb, T)?.id).toBe('2026-10-11__facebook__social__-')
  })
})
