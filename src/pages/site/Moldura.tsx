import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useSessao } from '../../lib/auth'
import { Logo } from '../../ui/Logo'

/** Define o título da aba e, se o endereço tiver âncora (#precos), rola até ela depois de montar a página. */
export function useTitulo(titulo: string) {
  useEffect(() => {
    const anterior = document.title
    document.title = titulo
    return () => {
      document.title = anterior
    }
  }, [titulo])
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1))
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
  }, [])
}

/** Âncoras do site: logados veem o site em /site, visitantes em /. */
function useBase() {
  const { user } = useSessao()
  return user ? '/site' : '/'
}

export function CabecalhoSite({ links = true }: { links?: boolean }) {
  const { user } = useSessao()
  const base = useBase()
  return (
    <header className="sticky top-0 z-30 border-b border-areia-200/70 bg-areia-100/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link to="/" aria-label="Q3 Orça, início">
          <Logo tamanho={30} />
        </Link>
        {links && (
          <nav className="hidden items-center gap-7 text-sm font-semibold text-grafite-600 md:flex">
            <a href={`${base}#como-funciona`} className="hover:text-brasa-700">
              Como funciona
            </a>
            <a href={`${base}#recursos`} className="hover:text-brasa-700">
              Recursos
            </a>
            <a href={`${base}#precos`} className="hover:text-brasa-700">
              Preços
            </a>
            <a href={`${base}#duvidas`} className="hover:text-brasa-700">
              Dúvidas
            </a>
          </nav>
        )}
        <div className="flex items-center gap-2">
          {user ? (
            <Link to="/" className="btn-primary !px-4 !py-2.5 text-sm">
              Abrir meu painel
            </Link>
          ) : (
            <>
              <Link to="/entrar" className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-grafite-700 hover:bg-white sm:block">
                Entrar
              </Link>
              <Link to="/entrar?modo=criar" className="btn-primary !px-4 !py-2.5 text-sm">
                Começar grátis
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export function RodapeSite() {
  const base = useBase()
  return (
    <footer className="border-t border-grafite-800 bg-grafite-950 text-grafite-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo tamanho={32} claro />
          <p className="max-w-xs text-sm">Orçamento rápido, aprovado pelo celular. Feito no Brasil para quem trabalha com as mãos.</p>
        </div>
        <Coluna titulo="Produto">
          <a href={`${base}#como-funciona`}>Como funciona</a>
          <a href={`${base}#recursos`}>Recursos</a>
          <a href={`${base}#precos`}>Preços</a>
          <Link to="/entrar">Entrar</Link>
        </Coluna>
        <Coluna titulo="Marca">
          <Link to="/marca">Manual da marca</Link>
          <a href="/favicon.svg" download="q3-orca-simbolo.svg">
            Baixar símbolo
          </a>
        </Coluna>
      </div>
      <div className="border-t border-grafite-800 py-5 text-center text-xs text-grafite-500">
        © {new Date().getFullYear()} Q3 Orça. Monta, manda, recebe.
      </div>
    </footer>
  )
}

function Coluna({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold tracking-wider text-grafite-500 uppercase">{titulo}</p>
      <div className="flex flex-col gap-2 text-sm [&_a:hover]:text-white">{children}</div>
    </div>
  )
}
