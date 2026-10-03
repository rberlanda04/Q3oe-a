import { Link } from 'react-router-dom'
import { MODO_BETA } from '../config'

/** Selo "Beta" ao lado do logo, enquanto a fase de testes estiver aberta. Leva à página do beta. */
export function SeloBeta({ claro = false }: { claro?: boolean }) {
  if (!MODO_BETA) return null
  return (
    <Link
      to="/beta"
      title="Versão de testes: saiba mais"
      className={`rounded-full px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase ${
        claro ? 'bg-white/15 text-white' : 'bg-regua-300 text-grafite-900'
      }`}
    >
      Beta
    </Link>
  )
}
