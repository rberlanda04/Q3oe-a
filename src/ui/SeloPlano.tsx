import { Link } from 'react-router-dom'
import { MODO_BETA } from '../config'
import type { SituacaoPlano } from '../domain/plano'

/** Mostra o plano atual e leva à página de planos. */
export function SeloPlano({ plano }: { plano: SituacaoPlano }) {
  const [texto, classe] =
    plano.motivo === 'assinatura'
      ? ['Pro ativo', 'bg-grafite-900 text-brasa-300']
      : plano.motivo === 'teste'
        ? [
            `${MODO_BETA ? 'Pro grátis no beta' : 'Teste Pro'}: ${plano.diasRestantes} ${plano.diasRestantes === 1 ? 'dia' : 'dias'}`,
            'bg-regua-300 text-grafite-900',
          ]
        : ['Plano grátis', 'bg-areia-200 text-grafite-700']
  return (
    <Link to="/planos" className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold ${classe}`}>
      {texto}
    </Link>
  )
}
