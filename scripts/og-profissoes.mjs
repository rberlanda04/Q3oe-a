// Gera a imagem de prévia do link (1200 × 630) de cada página de profissão em public/og/<slug>.jpg.
// Rode quando mudar a primeira dica de uma profissão em src/seo/profissoes.ts: node scripts/og-profissoes.mjs
import { mkdirSync, readFileSync } from 'node:fs'
import { chromium } from 'playwright'

const fonte = readFileSync('src/seo/profissoes.ts', 'utf8')
const profissoes = fonte
  .split(/\r?\n {2}\{\r?\n {4}id: '/)
  .slice(1)
  .map((b) => ({
    slug: b.match(/slug: '([^']+)'/)[1],
    para: b.match(/para: '([^']+)'/)[1],
    dica: b
      .match(/dicas: \[\s*\n\s*'((?:[^'\\]|\\.)*)'/)[1]
      .replace(/\\'/g, "'"),
  }))

const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])
const tamanho = (dica) => (dica.length > 120 ? 44 : dica.length > 90 ? 50 : 58)
const pagina = (p) => `<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@800&family=Figtree:wght@500;700&display=swap">
<style>body{margin:0}.c{width:1200px;height:630px;background:#faf6f0;position:relative;font-family:Figtree,Segoe UI,sans-serif;color:#1b1f2a;box-sizing:border-box;padding:56px 70px 0}
.tag{display:inline-block;background:#ff5a1f;color:#fff;font-weight:700;font-size:24px;letter-spacing:2px;text-transform:uppercase;padding:9px 20px;border-radius:999px}
h1{font-family:'Bricolage Grotesque',Segoe UI,sans-serif;font-weight:800;font-size:${tamanho(p.dica)}px;line-height:1.08;letter-spacing:-1px;margin:28px 0 0}
.r{position:absolute;left:0;right:0;bottom:0;height:132px;background:#1b1f2a;color:#fff;display:flex;align-items:center;gap:22px;padding:0 70px;box-sizing:border-box}
.r p{margin:0;font-size:26px;line-height:1.25;font-weight:500}.r b{color:#ff9b6b;font-weight:700}
</style></head><body><div class="c"><span class="tag">Dica para ${esc(p.para)}</span><h1>${esc(p.dica)}</h1>
<div class="r"><svg width="76" height="76" viewBox="0 0 48 48" style="flex:none"><rect width="48" height="48" rx="13" fill="#ff5a1f"/><circle cx="20" cy="22.5" r="10" fill="none" stroke="#fff" stroke-width="5"/><path d="M27.1 29.6 L30.8 33.3 L40.5 21.5" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
<p>Modelo de orçamento pronto para ${esc(p.para)} · <b>q3orca.com.br</b></p></div></div></body></html>`

mkdirSync('public/og', { recursive: true })
const navegador = await chromium.launch()
const aba = await navegador.newPage({ viewport: { width: 1200, height: 630 } })
const estouros = []
for (const p of profissoes) {
  await aba.setContent(pagina(p), { waitUntil: 'networkidle' })
  await aba.evaluate(() => document.fonts.ready)
  const fim = await aba.evaluate(() => document.querySelector('h1').getBoundingClientRect().bottom)
  if (fim > 630 - 132 - 16) estouros.push(p.slug)
  await aba.screenshot({ path: `public/og/${p.slug}.jpg`, type: 'jpeg', quality: 88 })
}
await navegador.close()
console.log(`${profissoes.length} imagens em public/og`)
if (estouros.length) {
  console.error('Texto passou do espaço em:', estouros.join(', '))
  process.exit(1)
}
