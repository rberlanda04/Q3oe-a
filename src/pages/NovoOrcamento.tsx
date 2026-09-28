import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { criarOrcamento, ouvirClientes } from '../data/repo'
import { MODELOS } from '../domain/templates'
import type { ClienteCadastro } from '../domain/types'
import { useUsuario } from '../lib/auth'
import { IconeVoltar } from '../ui/Icones'

export function NovoOrcamento() {
  const { user, perfil } = useUsuario()
  const navegar = useNavigate()
  const [parametros] = useSearchParams()
  const clienteId = parametros.get('cliente')
  const modeloPedido = MODELOS.find((m) => m.id === parametros.get('modelo'))
  const [cliente, setCliente] = useState<ClienteCadastro | undefined>()
  const criado = useRef(false)

  // Chegou de uma página "modelo de orçamento para ...": já abre o orçamento daquela profissão.
  useEffect(() => {
    if (!modeloPedido || criado.current) return
    criado.current = true
    navegar(`/orcamento/${criarOrcamento(user.uid, perfil, modeloPedido.id)}`, { replace: true })
  }, [modeloPedido, navegar, perfil, user.uid])

  useEffect(() => {
    if (!clienteId) return
    return ouvirClientes(user.uid, (lista) => setCliente(lista.find((c) => c.id === clienteId)))
  }, [user.uid, clienteId])

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-grafite-500 hover:text-brasa-700">
        <IconeVoltar tamanho={16} /> Voltar
      </Link>
      <p className="rotulo mt-4 !text-brasa-700">Passo 1 de 3 · Monta</p>
      <h1 className="mt-1 text-3xl font-extrabold">Qual é o serviço?</h1>
      <p className="mt-1 text-grafite-600">
        {cliente ? (
          <>
            Orçamento para <strong>{cliente.nome}</strong>.{' '}
          </>
        ) : null}
        Cada modelo já traz os itens mais pedidos da profissão.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MODELOS.map((modelo) => (
          <button
            key={modelo.id}
            className="card group flex flex-col items-start gap-3 !p-4 text-left transition hover:-translate-y-0.5 hover:border-brasa-300 active:scale-[0.98]"
            onClick={() => navegar(`/orcamento/${criarOrcamento(user.uid, perfil, modelo.id, cliente)}`, { replace: true })}
          >
            <span
              className="grid h-12 w-12 place-items-center rounded-2xl bg-brasa-50 text-2xl transition group-hover:bg-brasa-100"
              aria-hidden
            >
              {modelo.icone}
            </span>
            <span>
              <span className="block font-display font-bold">{modelo.nome}</span>
              <span className="text-xs text-grafite-500">{modelo.itens.length} itens prontos</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
