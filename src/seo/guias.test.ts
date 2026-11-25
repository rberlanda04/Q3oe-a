import { describe, expect, it, vi } from 'vitest'
import { MODELOS } from '../domain/templates'
import { caminhoGuia, GUIAS, guiaPorCaminho, linkGeradorDoGuia } from './guias'
import { CAMINHO_GERADOR, headDaPagina, PAGINAS_SEO, sitemapXml } from './paginas'

vi.mock('../lib/firebase', () => ({ db: {} }))

describe('guias de preço e de como fazer', () => {
  it('publica pintura por m² e orçamento de serviço nos endereços do rascunho', () => {
    expect(GUIAS.map(caminhoGuia)).toEqual(['/quanto-cobrar/pintura-por-m2', '/como-fazer/orcamento-de-servico'])
    const sitemap = sitemapXml('2026-11-25')
    for (const g of GUIAS) {
      const pagina = PAGINAS_SEO.find((p) => p.caminho === caminhoGuia(g))!
      expect(pagina.prioridade).toBe(0.8)
      expect(g.titulo.length, g.titulo).toBeLessThanOrEqual(60)
      expect(g.descricao.length, g.descricao).toBeLessThanOrEqual(155)
      expect(sitemap).toContain(`<loc>https://www.q3orca.com.br${caminhoGuia(g)}</loc><lastmod>2026-11-25</lastmod><priority>0.8</priority>`)
      const json = JSON.parse(headDaPagina(pagina).match(/<script type="application\/ld\+json">(.*)<\/script>/)![1])
      const faq = json['@graph'].find((d: { '@type': string }) => d['@type'] === 'FAQPage')
      expect(faq.mainEntity).toHaveLength(g.perguntas.length)
      expect(g.perguntas.length).toBeGreaterThanOrEqual(3)
      expect(g.perguntas.length).toBeLessThanOrEqual(5)
    }
  })

  it('não mostra preço em reais no texto (nenhum valor inventado)', () => {
    for (const g of GUIAS) {
      const texto = JSON.stringify(g)
      expect(texto, g.slug).not.toMatch(/R\$\s*\d/)
    }
  })

  it('leva ao gerador com a profissão e o utm do SEO', () => {
    const [pintura, servico] = GUIAS
    expect(linkGeradorDoGuia(pintura, 'pintor')).toBe(`${CAMINHO_GERADOR}?profissao=pintor&utm_source=site&utm_medium=seo&utm_campaign=pintura-por-m2`)
    expect(pintura.profissao).toBe('pintor')
    expect(servico.profissao).toBeUndefined()
    const ids = MODELOS.map((m) => m.id)
    for (const id of servico.escolhas ?? []) expect(ids).toContain(id)
    expect(servico.escolhas?.length).toBeGreaterThan(3)
  })

  it('acha o guia pelo endereço, com ou sem barra no fim', () => {
    expect(guiaPorCaminho('/quanto-cobrar/pintura-por-m2/')?.slug).toBe('pintura-por-m2')
    expect(guiaPorCaminho('/como-fazer/pintura-por-m2')).toBeUndefined()
  })
})
