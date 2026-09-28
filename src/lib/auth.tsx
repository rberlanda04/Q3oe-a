import { onAuthStateChanged, type User } from 'firebase/auth'
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ouvirAssinatura, ouvirPerfil, PERFIL_VAZIO, perfilPublico, sincronizarRespostas } from '../data/repo'
import { situacaoPlano, type Assinatura, type SituacaoPlano } from '../domain/plano'
import type { Perfil, PerfilPublico } from '../domain/types'
import { auth } from './firebase'

interface Sessao {
  user: User | null
  perfil: Perfil
  /** Plano atual: Pro pago, teste do Pro ou grátis. */
  plano: SituacaoPlano
  /** O que o cliente vê nos documentos e no link, já com a marca própria quando há Pro. */
  publico: PerfilPublico
  carregando: boolean
}

const GRATIS: SituacaoPlano = { pro: false, motivo: 'gratis', testeEncerrado: false }

const SessaoContext = createContext<Sessao>({
  user: null,
  perfil: PERFIL_VAZIO,
  plano: GRATIS,
  publico: perfilPublico(PERFIL_VAZIO, false),
  carregando: true,
})

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VAZIO)
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null)
  const [carregando, setCarregando] = useState(true)
  // Recalcula o plano de hora em hora, para o fim do teste valer sem recarregar a página.
  const [agora, setAgora] = useState(() => Date.now())

  useEffect(() => {
    const timer = setInterval(() => setAgora(Date.now()), 60 * 60 * 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    let pararPerfil: (() => void) | undefined
    let pararSync: (() => void) | undefined
    let pararAssinatura: (() => void) | undefined
    const pararAuth = onAuthStateChanged(auth, (novo) => {
      pararPerfil?.()
      pararSync?.()
      pararAssinatura?.()
      pararPerfil = pararSync = pararAssinatura = undefined
      setUser(novo)
      setAssinatura(null)
      try {
        if (novo) localStorage.setItem('q3:logado', '1')
        else localStorage.removeItem('q3:logado')
      } catch {
        /* Navegação privada: sem problema, só perde a otimização visual. */
      }
      if (novo) {
        pararPerfil = ouvirPerfil(novo.uid, (p) => {
          setPerfil(p)
          setCarregando(false)
        })
        pararSync = sincronizarRespostas(novo.uid)
        pararAssinatura = ouvirAssinatura(novo.uid, setAssinatura)
      } else {
        setPerfil(PERFIL_VAZIO)
        setCarregando(false)
      }
    })
    return () => {
      pararAuth()
      pararPerfil?.()
      pararSync?.()
      pararAssinatura?.()
    }
  }, [])

  const valor = useMemo(() => {
    const criadaEm = user?.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : 0
    const plano = user ? situacaoPlano(assinatura, criadaEm, agora) : GRATIS
    return { user, perfil, plano, publico: perfilPublico(perfil, plano.pro), carregando }
  }, [user, perfil, assinatura, agora, carregando])

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>
}

export function useSessao() {
  return useContext(SessaoContext)
}

/** Use apenas em páginas protegidas, onde o usuário já está logado. */
export function useUsuario(): { user: User; perfil: Perfil; plano: SituacaoPlano; publico: PerfilPublico } {
  const { user, perfil, plano, publico } = useSessao()
  if (!user) throw new Error('Página protegida acessada sem login')
  return { user, perfil, plano, publico }
}
