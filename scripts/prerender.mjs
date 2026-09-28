/**
 * Pré-renderização das páginas públicas (SSG), rodada depois do `vite build`.
 *
 * 1. Carrega o bundle de servidor gerado de src/ssg.tsx (pasta dist-ssg).
 * 2. Para cada página em PAGINAS_SEO, gera o HTML e injeta no index.html,
 *    trocando o bloco <!--seo--> pelos metadados da página.
 * 3. Escreve sitemap.xml e robots.txt.
 *
 * O Firebase Hosting serve esses arquivos direto (cleanUrls), e as demais rotas
 * caem em app.html, que é o index.html sem conteúdo e com noindex.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const raiz = process.cwd()
const dist = join(raiz, 'dist')
const ssg = await import(pathToFileURL(join(raiz, 'dist-ssg', 'ssg.js')).href)

const modelo = readFileSync(join(dist, 'app.html'), 'utf8')
if (!modelo.includes('<!--seo-->') || !modelo.includes('<div id="root"></div>')) {
  throw new Error('app.html sem os marcadores <!--seo--> ou <div id="root"></div>. Confira o index.html.')
}

let paginas = 0
for (const pagina of ssg.PAGINAS_SEO) {
  const corpo = ssg.render(pagina.caminho)
  const html = modelo
    .replace(/<meta name="robots"[^>]*>\s*/, '')
    .replace(/<!--seo-->[\s\S]*?<!--\/seo-->/, ssg.headDaPagina(pagina))
    .replace('<div id="root"></div>', `<div id="root"><div data-ssg>${corpo}</div></div>`)
  const arquivo = pagina.caminho === '/' ? join(dist, 'index.html') : join(dist, `${pagina.caminho.slice(1)}.html`)
  mkdirSync(dirname(arquivo), { recursive: true })
  writeFileSync(arquivo, html)
  paginas++
}

const hoje = new Date().toISOString().slice(0, 10)
writeFileSync(join(dist, 'sitemap.xml'), ssg.sitemapXml(hoje))
writeFileSync(join(dist, 'robots.txt'), ssg.robotsTxt())
console.log(`Pré-renderização: ${paginas} páginas, sitemap.xml e robots.txt gerados.`)
