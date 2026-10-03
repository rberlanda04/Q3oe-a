import { signOut } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { ouvirMeusChamados } from '../data/repo'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSessao } from '../lib/auth'
import { auth } from '../lib/firebase'
import { IconeAjuda, IconeCaixa, IconeDocumento, IconeMais, IconePessoas, IconeSair, IconeUsuario } from './Icones'
import { MODO_BETA } from '../config'
import { Logo } from './Logo'
import { SeloBeta } from './SeloBeta'

export { APP_NOME } from './Logo'

const LINKS = [
  { para: '/', rotulo: 'Orçamentos', curto: 'Orçamentos', Icone: IconeDocumento, fim: true },
  { para: '/clientes', rotulo: 'Clientes', curto: 'Clientes', Icone: IconePessoas },
  { para: '/catalogo', rotulo: 'Meus itens', curto: 'Itens', Icone: IconeCaixa },
  { para: '/perfil', rotulo: 'Meus dados', curto: 'Perfil', Icone: IconeUsuario },
]

export function Layout() {
  const { perfil, user, plano } = useSessao()
  const [respostasNovas, setRespostasNovas] = useState(0)
  useEffect(() => {
    if (!user) return
    return ouvirMeusChamados(user.uid, (lista) => setRespostasNovas(lista.filter((c) => c.naoLidoUsuario).length))
  }, [user])
  const local = useLocation()
  // O editor tem a própria barra de ações embaixo; a navegação sai do caminho.
  const telaDeTarefa = local.pathname.startsWith('/orcamento/')
  const iniciais = (perfil.nome || user?.email || '?')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-areia-200 bg-areia-100/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
          <span className="flex items-center gap-2">
            <Link to="/" aria-label="Início">
              <Logo tamanho={30} />
            </Link>
            <SeloBeta />
          </span>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {LINKS.map(({ para, rotulo, Icone, fim }) => (
              <NavLink
                key={para}
                to={para}
                end={fim}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-white text-brasa-700 shadow-cartao' : 'text-grafite-600 hover:bg-white/70'
                  }`
                }
              >
                <Icone tamanho={18} />
                {rotulo}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/novo" className="btn-primary hidden !py-2.5 md:inline-flex">
              <IconeMais tamanho={18} /> Novo orçamento
            </Link>
            <Link
              to="/ajuda"
              className="relative grid h-9 w-9 place-items-center rounded-full text-grafite-600 hover:bg-white"
              aria-label={respostasNovas ? `Ajuda: ${respostasNovas} resposta nova` : 'Ajuda'}
              title="Ajuda"
            >
              <IconeAjuda tamanho={20} />
              {respostasNovas > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full bg-brasa-500 ring-2 ring-areia-100" />}
            </Link>
            <Link
              to="/perfil"
              className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-grafite-900 text-xs font-bold text-white"
              title={perfil.nome || user?.email || ''}
              aria-label="Meu perfil"
            >
              {plano.pro && perfil.logo ? <img src={perfil.logo} alt="" className="h-full w-full bg-white object-contain p-1" /> : iniciais}
            </Link>
            <button
              className="grid h-9 w-9 place-items-center rounded-full text-grafite-500 hover:bg-white"
              onClick={() => signOut(auth)}
              aria-label="Sair"
              title="Sair"
            >
              <IconeSair tamanho={18} />
            </button>
          </div>
        </div>
      </header>

      <main className={`mx-auto max-w-3xl px-4 py-6 ${telaDeTarefa ? 'pb-40' : 'pb-32 md:pb-12'}`}>
        <Outlet />
      </main>

      {MODO_BETA && !telaDeTarefa && !local.pathname.startsWith('/ajuda') && (
        <Link
          to="/ajuda?categoria=sugestao"
          className="fixed right-4 bottom-24 z-10 rounded-full bg-grafite-900 px-4 py-2.5 text-sm font-semibold text-white shadow-flutuante md:bottom-6"
        >
          Dar opinião
        </Link>
      )}

      {!telaDeTarefa && (
        <nav
          aria-label="Navegação"
          className="fixed inset-x-0 bottom-0 z-20 border-t border-areia-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
        >
          <div className="mx-auto grid max-w-md grid-cols-5 items-end px-2">
            {LINKS.slice(0, 2).map((l) => (
              <ItemAba key={l.para} {...l} />
            ))}
            <Link
              to="/novo"
              aria-label="Novo orçamento"
              className="-mt-6 mb-1 grid h-14 w-14 place-items-center justify-self-center rounded-2xl bg-brasa-500 text-white shadow-flutuante transition active:scale-95"
            >
              <IconeMais tamanho={28} strokeWidth={2.5} />
            </Link>
            {LINKS.slice(2).map((l) => (
              <ItemAba key={l.para} {...l} />
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}

function ItemAba({ para, rotulo, curto, Icone, fim }: (typeof LINKS)[number]) {
  return (
    <NavLink
      to={para}
      end={fim}
      aria-label={rotulo}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${isActive ? 'text-brasa-700' : 'text-grafite-400'}`
      }
    >
      <Icone tamanho={22} />
      {curto}
    </NavLink>
  )
}
