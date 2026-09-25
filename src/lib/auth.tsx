import { onAuthStateChanged, type User } from 'firebase/auth'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ouvirPerfil, PERFIL_VAZIO, sincronizarRespostas } from '../data/repo'
import type { Perfil } from '../domain/types'
import { auth } from './firebase'

interface Sessao {
  user: User | null
  perfil: Perfil
  carregando: boolean
}

const SessaoContext = createContext<Sessao>({ user: null, perfil: PERFIL_VAZIO, carregando: true })

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Perfil>(PERFIL_VAZIO)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let pararPerfil: (() => void) | undefined
    let pararSync: (() => void) | undefined
    const pararAuth = onAuthStateChanged(auth, (novo) => {
      pararPerfil?.()
      pararSync?.()
      pararPerfil = undefined
      pararSync = undefined
      setUser(novo)
      if (novo) {
        pararPerfil = ouvirPerfil(novo.uid, (p) => {
          setPerfil(p)
          setCarregando(false)
        })
        pararSync = sincronizarRespostas(novo.uid)
      } else {
        setPerfil(PERFIL_VAZIO)
        setCarregando(false)
      }
    })
    return () => {
      pararAuth()
      pararPerfil?.()
      pararSync?.()
    }
  }, [])

  return <SessaoContext.Provider value={{ user, perfil, carregando }}>{children}</SessaoContext.Provider>
}

export function useSessao() {
  return useContext(SessaoContext)
}

/** Use apenas em páginas protegidas, onde o usuário já está logado. */
export function useUsuario(): { user: User; perfil: Perfil } {
  const { user, perfil } = useSessao()
  if (!user) throw new Error('Página protegida acessada sem login')
  return { user, perfil }
}
