import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Ao trocar de página pelo app, começa do topo. Sem isso, um link clicado no fim de
 * uma página abre a próxima já rolada até o rodapé. Links com âncora (#secao) rolam
 * até a seção.
 */
export function RolarParaTopo() {
  const { pathname, hash } = useLocation()
  useLayoutEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}
