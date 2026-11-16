import { existsSync } from 'node:fs'
import { describe, expect, it, vi } from 'vitest'
import { MODELOS } from '../domain/templates'
import { CAMINHO_GERADOR, headDaPagina, PAGINAS_SEO, robotsTxt, sitemapXml } from './paginas'
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
    expect(head).toContain('<link rel="canonical" href="https://www.q3orca.com.br/" />')
    expect(head).toContain('og:image')
    const json = head.match(/<script type="application\/ld\+json">(.*)<\/script>/)?.[1]
    expect(() => JSON.parse(json!)).not.toThrow()
  })

  it('dá a cada profissão a própria imagem de prévia do link, e o arquivo existe', () => {
    for (const p of PROFISSOES_SEO) {
      const pagina = PAGINAS_SEO.find((x) => x.caminho === `/modelo-de-orcamento/${p.slug}`)!
      expect(headDaPagina(pagina)).toContain(`<meta property="og:image" content="https://www.q3orca.com.br/og/${p.slug}.jpg" />`)
      expect(existsSync(`public/og/${p.slug}.jpg`), p.slug).toBe(true)
    }
    expect(headDaPagina(PAGINAS_SEO[0])).toContain('content="https://www.q3orca.com.br/og-imagem.png"')
  })

  it('bloqueia orçamentos de clientes e área logada no robots.txt', () => {
    const robots = robotsTxt()
    expect(robots).toContain('Disallow: /o/')
    expect(robots).toContain('Sitemap: https://www.q3orca.com.br/sitemap.xml')
    expect(sitemapXml('2026-09-28')).toContain('<loc>https://www.q3orca.com.br/modelo-de-orcamento/eletricista</loc>')
  })

  it('publica o gerador de orçamento no sitemap, com FAQ e fora do robots', () => {
    const pagina = PAGINAS_SEO.find((p) => p.caminho === CAMINHO_GERADOR)!
    expect(pagina.titulo).toMatch(/gerador de orçamento/i)
    expect(JSON.stringify(pagina.dados)).toContain('FAQPage')
    expect(sitemapXml('2026-10-17')).toContain(`<loc>https://www.q3orca.com.br${CAMINHO_GERADOR}</loc>`)
    expect(robotsTxt()).not.toContain(CAMINHO_GERADOR)
  })
})
