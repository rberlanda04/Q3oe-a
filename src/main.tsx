import { lazy, StrictMode, Suspense, type ComponentType } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useSearchParams } from 'react-router-dom'
import './index.css'
import { SessaoProvider, useSessao } from './lib/auth'
import { monitorarErros } from './lib/eventos'
import { guardarOrigemDaVisita } from './lib/origem'
import { Login } from './pages/Login'
import { Beta } from './pages/site/Beta'
import { Home } from './pages/site/Home'
import { Contato } from './pages/site/Contato'
import { Marca } from './pages/site/Marca'
import { Privacidade, Termos } from './pages/site/Legal'
import { ModeloProfissao, ModelosIndice } from './pages/site/Modelos'
import { CalculadoraPagina, CalculadorasIndice } from './pages/site/Calculadoras'
import { Simbolo } from './ui/Logo'
import { RolarParaTopo } from './ui/RolarParaTopo'

/**
 * Telas do app (só para quem entrou) e páginas pouco visitadas carregam sob demanda:
 * o visitante do site não baixa o editor, o PDF e o painel admin.
 */
const sobDemanda = <T extends Record<string, unknown>>(carregar: () => Promise<T>, nome: keyof T) =>
  lazy(() => carregar().then((m) => ({ default: m[nome] as ComponentType })))
const Admin = sobDemanda(() => import('./pages/Admin'), 'Admin')
const Ajuda = sobDemanda(() => import('./pages/Ajuda'), 'Ajuda')
const ChamadoUsuario = sobDemanda(() => import('./pages/Ajuda'), 'ChamadoUsuario')
const Catalogo = sobDemanda(() => import('./pages/Catalogo'), 'Catalogo')
const Clientes = sobDemanda(() => import('./pages/Clientes'), 'Clientes')
const Editor = sobDemanda(() => import('./pages/Editor'), 'Editor')
const NovoOrcamento = sobDemanda(() => import('./pages/NovoOrcamento'), 'NovoOrcamento')
const OrcamentoPublico = sobDemanda(() => import('./pages/OrcamentoPublico'), 'OrcamentoPublico')
const Orcamentos = sobDemanda(() => import('./pages/Orcamentos'), 'Orcamentos')
const Perfil = sobDemanda(() => import('./pages/Perfil'), 'Perfil')
const Planos = sobDemanda(() => import('./pages/Planos'), 'Planos')
const Layout = sobDemanda(() => import('./ui/Layout'), 'Layout')
const GeradorOrcamento = sobDemanda(() => import('./pages/site/Gerador'), 'GeradorOrcamento')

/** Quem nunca entrou neste navegador é visitante: o site aparece sem esperar o login responder. */
function provavelmenteLogado(): boolean {
  try {
    return localStorage.getItem('q3:logado') === '1'
  } catch {
    return false
  }
}

function Abertura() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Simbolo tamanho={56} className="animate-pulse" />
    </div>
  )
}

/** Login: quem já entrou vai direto para o painel. */
function Entrar() {
  const { user, carregando } = useSessao()
  const [parametros] = useSearchParams()
  if (carregando) return <Abertura />
  if (!user) return <Login />
  // Veio de uma página de modelo: abre direto um orçamento daquela profissão.
  const modelo = parametros.get('modelo')
  return <Navigate to={modelo ? `/novo?modelo=${encodeURIComponent(modelo)}` : '/'} replace />
}

/** Na raiz, visitantes veem o site e profissionais logados veem o painel. */
function Raiz() {
  const { user, carregando } = useSessao()
  if (carregando && provavelmenteLogado()) return <Abertura />
  if (!user) {
    return (
      <Routes>
        <Route index element={<Home />} />
        <Route path="*" element={<Navigate to="/entrar" replace />} />
      </Routes>
    )
  }
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Orcamentos />} />
        <Route path="novo" element={<NovoOrcamento />} />
        <Route path="orcamento/:id" element={<Editor />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="catalogo" element={<Catalogo />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="planos" element={<Planos />} />
        <Route path="admin" element={<Admin />} />
        <Route path="ajuda" element={<Ajuda />} />
        <Route path="ajuda/:id" element={<ChamadoUsuario />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

monitorarErros()

guardarOrigemDaVisita()

const app = (
  <StrictMode>
    <SessaoProvider>
      <BrowserRouter>
        <RolarParaTopo />
        <Suspense fallback={<Abertura />}>
        <Routes>
          {/* Páginas públicas: abrem sem login. */}
          <Route path="/o/:id" element={<OrcamentoPublico />} />
          <Route path="/marca" element={<Marca />} />
          <Route path="/modelos-de-orcamento" element={<ModelosIndice />} />
          <Route path="/termos" element={<Termos />} />
          <Route path="/privacidade" element={<Privacidade />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/beta" element={<Beta />} />
          <Route path="/modelo-de-orcamento/:slug" element={<ModeloProfissao />} />
          <Route path="/calculadoras" element={<CalculadorasIndice />} />
          <Route path="/calculadora/:slug" element={<CalculadoraPagina />} />
          <Route path="/gerador-de-orcamento" element={<GeradorOrcamento />} />
          <Route path="/site" element={<Home />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/*" element={<Raiz />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </SessaoProvider>
  </StrictMode>
)

/**
 * Página do site pré-renderizada e visitante: o React reaproveita o HTML que já está na
 * tela (hidratação) em vez de apagar e desenhar de novo, e o conteúdo aparece antes.
 * Quem está logado vê o app, que é outra tela: aí o HTML do site é descartado.
 */
const raiz = document.getElementById('root')!
if (raiz.hasAttribute('data-ssg') && !provavelmenteLogado()) {
  hydrateRoot(raiz, app)
} else {
  raiz.removeAttribute('data-ssg')
  raiz.replaceChildren()
  createRoot(raiz).render(app)
}
