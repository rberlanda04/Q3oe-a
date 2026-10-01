/**
 * Entrada da pré-renderização (SSG). O build gera HTML pronto das páginas
 * públicas para o Google ler sem precisar executar JavaScript.
 * Usado por scripts/prerender.mjs; não entra no bundle do navegador.
 */
import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { Route, Routes, StaticRouter } from 'react-router-dom'
import { Home } from './pages/site/Home'
import { Contato } from './pages/site/Contato'
import { Privacidade, Termos } from './pages/site/Legal'
import { Marca } from './pages/site/Marca'
import { ModeloProfissao, ModelosIndice } from './pages/site/Modelos'

export { headDaPagina, PAGINAS_SEO, robotsTxt, sitemapXml } from './seo/paginas'

export function render(url: string): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marca" element={<Marca />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/modelos-de-orcamento" element={<ModelosIndice />} />
          <Route path="/modelo-de-orcamento/:slug" element={<ModeloProfissao />} />
        </Routes>
      </StaticRouter>
    </StrictMode>,
  )
}
