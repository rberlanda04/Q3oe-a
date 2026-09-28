import { describe, expect, it, vi } from 'vitest'
import { MODELOS } from '../domain/templates'
import { headDaPagina, PAGINAS_SEO, robotsTxt, sitemapXml } from './paginas'
import { PROFISSOES_SEO } from './profissoes'

vi.mock('../lib/firebase', () => ({ db: {} }))

describe('SEO', () => {
  it('cobre todas as profissões com páginas únicas', () => {
    const ids = MODELOS.filter((m) => m.id !== 'outro').map((m) => m.id)
    expect(PROFISSOES_SEO.map((p) => p.id).sort()).toEqual([...ids].sort())
    const caminhos = PAGINAS_SEO.map((p) => p.caminho)
    expect(new Set(caminhos).size).toBe(caminhos.length)
  })

  it('mantém títulos e descrições no tamanho que o Google mostra', () => {
    for (const p of PAGINAS_SEO) {
      expect(p.titulo.length, p.titulo).toBeLessThanOrEqual(70)
      expect(p.descricao.length, p.descricao).toBeGreaterThanOrEqual(50)
      expect(p.descricao.length, p.descricao).toBeLessThanOrEqual(170)
    }
    const descricoes = PAGINAS_SEO.map((p) => p.descricao)
    expect(new Set(descricoes).size).toBe(descricoes.length)
  })

  it('gera head com canônico, Open Graph e JSON-LD válido', () => {
    const head = headDaPagina(PAGINAS_SEO[0])
    expect(head).toContain('<link rel="canonical" href="https://q3orca.web.app/" />')
    expect(head).toContain('og:image')
    const json = head.match(/<script type="application\/ld\+json">(.*)<\/script>/)?.[1]
    expect(() => JSON.parse(json!)).not.toThrow()
  })

  it('bloqueia orçamentos de clientes e área logada no robots.txt', () => {
    const robots = robotsTxt()
    expect(robots).toContain('Disallow: /o/')
    expect(robots).toContain('Sitemap: https://q3orca.web.app/sitemap.xml')
    expect(sitemapXml('2026-09-28')).toContain('<loc>https://q3orca.web.app/modelo-de-orcamento/eletricista</loc>')
  })
})
