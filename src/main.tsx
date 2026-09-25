import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { SessaoProvider, useSessao } from './lib/auth'
import { Catalogo } from './pages/Catalogo'
import { Clientes } from './pages/Clientes'
import { Editor } from './pages/Editor'
import { Login } from './pages/Login'
import { NovoOrcamento } from './pages/NovoOrcamento'
import { OrcamentoPublico } from './pages/OrcamentoPublico'
import { Orcamentos } from './pages/Orcamentos'
import { Perfil } from './pages/Perfil'
import { Home } from './pages/site/Home'
import { Marca } from './pages/site/Marca'
import { Layout } from './ui/Layout'
import { Simbolo } from './ui/Logo'

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
  if (carregando) return <Abertura />
  return user ? <Navigate to="/" replace /> : <Login />
}

/** Na raiz, visitantes veem o site e profissionais logados veem o painel. */
function Raiz() {
  const { user, carregando } = useSessao()
  if (carregando) return <Abertura />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SessaoProvider>
      <BrowserRouter>
        <Routes>
          {/* Páginas públicas: abrem sem login. */}
          <Route path="/o/:id" element={<OrcamentoPublico />} />
          <Route path="/marca" element={<Marca />} />
          <Route path="/site" element={<Home />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/*" element={<Raiz />} />
        </Routes>
      </BrowserRouter>
    </SessaoProvider>
  </StrictMode>,
)
