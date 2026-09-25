import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { excluirCliente, mensagemErroLeitura, ouvirClientes, ouvirOrcamentos, salvarCliente } from '../data/repo'
import { calcularTotais } from '../domain/calc'
import { formatarBRL } from '../domain/money'
import type { Cliente, ClienteCadastro, Orcamento } from '../domain/types'
import { useUsuario } from '../lib/auth'
import { STATUS } from '../ui/status'

const VAZIO: Cliente & { id?: string } = { nome: '', telefone: '', endereco: '' }

export function Clientes() {
  const { user } = useUsuario()
  const [clientes, setClientes] = useState<ClienteCadastro[] | null>(null)
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<(Cliente & { id?: string }) | null>(null)
  const [aberto, setAberto] = useState<string | null>(null)

  useEffect(() => ouvirClientes(user.uid, setClientes, (e) => setErro(mensagemErroLeitura(e))), [user.uid])
  useEffect(() => ouvirOrcamentos(user.uid, setOrcamentos), [user.uid])

  const porCliente = useMemo(() => {
    const mapa = new Map<string, Orcamento[]>()
    for (const o of orcamentos) {
      if (!o.clienteId) continue
      mapa.set(o.clienteId, [...(mapa.get(o.clienteId) ?? []), o])
    }
    return mapa
  }, [orcamentos])

  const visiveis = (clientes ?? []).filter((c) => {
    const termo = busca.trim().toLowerCase()
    return !termo || c.nome.toLowerCase().includes(termo) || c.telefone.includes(termo)
  })

  function salvar(evento: FormEvent) {
    evento.preventDefault()
    if (!editando?.nome.trim()) return
    salvarCliente(user.uid, editando)
    setEditando(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Clientes</h1>
        <button className="btn-primary" onClick={() => setEditando(VAZIO)}>
          + Novo cliente
        </button>
      </div>
      <p className="text-sm text-grafite-600">Os clientes são salvos sozinhos quando você cria um orçamento.</p>

      {editando && (
        <form onSubmit={salvar} className="card space-y-3">
          <h2 className="font-semibold">{editando.id ? 'Editar cliente' : 'Novo cliente'}</h2>
          <div>
            <label htmlFor="c-nome">Nome</label>
            <input id="c-nome" required autoFocus value={editando.nome} onChange={(e) => setEditando({ ...editando, nome: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="c-tel">WhatsApp</label>
              <input id="c-tel" type="tel" value={editando.telefone} onChange={(e) => setEditando({ ...editando, telefone: e.target.value })} />
            </div>
            <div>
              <label htmlFor="c-end">Endereço</label>
              <input id="c-end" value={editando.endereco} onChange={(e) => setEditando({ ...editando, endereco: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setEditando(null)}>
              Cancelar
            </button>
            <button className="btn-primary flex-1">Salvar</button>
          </div>
        </form>
      )}

      <input placeholder="Buscar por nome ou telefone" value={busca} onChange={(e) => setBusca(e.target.value)} />

      {erro ? (
        <p className="card text-center text-alerta-600">{erro}</p>
      ) : clientes === null ? (
        <p className="text-center text-grafite-500">Carregando...</p>
      ) : visiveis.length === 0 ? (
        <p className="card text-center text-grafite-600">
          {clientes.length === 0 ? 'Nenhum cliente ainda.' : 'Nenhum cliente encontrado.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {visiveis.map((c) => {
            const historico = porCliente.get(c.id) ?? []
            const aprovado = historico
              .filter((o) => o.status === 'aprovado')
              .reduce((soma, o) => soma + calcularTotais(o).total, 0)
            return (
              <li key={c.id} className="card">
                <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setAberto(aberto === c.id ? null : c.id)}>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{c.nome}</p>
                    <p className="text-sm text-grafite-500">{c.telefone || 'Sem telefone'}</p>
                  </div>
                  <div className="shrink-0 text-right text-sm">
                    <p>
                      {historico.length} {historico.length === 1 ? 'orçamento' : 'orçamentos'}
                    </p>
                    {aprovado > 0 && <p className="text-aprovado-700">{formatarBRL(aprovado)} aprovados</p>}
                  </div>
                </button>

                {aberto === c.id && (
                  <div className="mt-3 space-y-3 border-t border-areia-200 pt-3">
                    {c.endereco && <p className="text-sm text-grafite-600">{c.endereco}</p>}
                    {historico.length > 0 && (
                      <ul className="space-y-1 text-sm">
                        {historico.map((o) => (
                          <li key={o.id}>
                            <Link to={`/orcamento/${o.id}`} className="flex justify-between gap-2 rounded-md px-2 py-1 hover:bg-areia-50">
                              <span>
                                Nº {o.numero} · {new Date(o.criadoEm).toLocaleDateString('pt-BR')}
                              </span>
                              <span>
                                {formatarBRL(calcularTotais(o).total)}{' '}
                                <span className={`rounded-full px-2 text-xs ${STATUS[o.status].classe}`}>{STATUS[o.status].rotulo}</span>
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/novo?cliente=${c.id}`} className="btn-primary flex-1 !py-2 text-sm">
                        Novo orçamento
                      </Link>
                      <button className="btn-secondary flex-1 !py-2 text-sm" onClick={() => setEditando(c)}>
                        Editar
                      </button>
                      <button
                        className="btn-secondary !py-2 text-sm !text-alerta-600"
                        onClick={() => {
                          if (confirm(`Excluir ${c.nome}? Os orçamentos dele continuam salvos.`)) excluirCliente(user.uid, c.id)
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
