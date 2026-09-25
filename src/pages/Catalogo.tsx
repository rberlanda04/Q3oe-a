import { useEffect, useState, type FormEvent } from 'react'
import { excluirItemCatalogo, mensagemErroLeitura, ouvirCatalogo, salvarItemCatalogo } from '../data/repo'
import { formatarBRL } from '../domain/money'
import { MODELOS, UNIDADES_PADRAO } from '../domain/templates'
import type { ItemCatalogo, ProfissaoId, TipoItem } from '../domain/types'
import { useUsuario } from '../lib/auth'
import { CampoDinheiro } from '../ui/CampoDinheiro'

type Rascunho = Omit<ItemCatalogo, 'id' | 'atualizadoEm'> & { id?: string }

const NOVO: Rascunho = { descricao: '', unidade: 'un', precoUnitarioCentavos: 0, tipo: 'servico', profissao: 'outro' }

export function Catalogo() {
  const { user } = useUsuario()
  const [itens, setItens] = useState<ItemCatalogo[] | null>(null)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<Rascunho | null>(null)

  useEffect(() => ouvirCatalogo(user.uid, setItens, (e) => setErro(mensagemErroLeitura(e))), [user.uid])

  const termo = busca.trim().toLowerCase()
  const visiveis = (itens ?? []).filter((i) => !termo || i.descricao.toLowerCase().includes(termo))
  const grupos = MODELOS.map((m) => ({ modelo: m, itens: visiveis.filter((i) => i.profissao === m.id) })).filter(
    (g) => g.itens.length > 0,
  )

  function salvar(evento: FormEvent) {
    evento.preventDefault()
    if (!editando?.descricao.trim()) return
    salvarItemCatalogo(user.uid, editando)
    setEditando(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Meus itens</h1>
        <button className="btn-primary" onClick={() => setEditando(NOVO)}>
          + Novo item
        </button>
      </div>
      <p className="text-sm text-grafite-600">
        Todo item com preço que você usa num orçamento é guardado aqui. No próximo orçamento, ele aparece com o preço já preenchido.
      </p>

      {editando && (
        <form onSubmit={salvar} className="card space-y-3">
          <h2 className="font-semibold">{editando.id ? 'Editar item' : 'Novo item'}</h2>
          <div>
            <label htmlFor="i-desc">Descrição</label>
            <input
              id="i-desc"
              required
              autoFocus
              disabled={Boolean(editando.id)}
              value={editando.descricao}
              onChange={(e) => setEditando({ ...editando, descricao: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="i-preco">Preço</label>
              <CampoDinheiro
                id="i-preco"
                valor={editando.precoUnitarioCentavos}
                onChange={(v) => setEditando({ ...editando, precoUnitarioCentavos: v })}
              />
            </div>
            <div>
              <label htmlFor="i-un">Unidade</label>
              <select id="i-un" value={editando.unidade} onChange={(e) => setEditando({ ...editando, unidade: e.target.value })}>
                {Array.from(new Set([editando.unidade, ...UNIDADES_PADRAO])).map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="i-tipo">Tipo</label>
              <select id="i-tipo" value={editando.tipo} onChange={(e) => setEditando({ ...editando, tipo: e.target.value as TipoItem })}>
                <option value="servico">Mão de obra</option>
                <option value="material">Material</option>
              </select>
            </div>
            <div>
              <label htmlFor="i-prof">Profissão</label>
              <select
                id="i-prof"
                value={editando.profissao}
                onChange={(e) => setEditando({ ...editando, profissao: e.target.value as ProfissaoId })}
              >
                {MODELOS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
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

      <input placeholder="Buscar item" value={busca} onChange={(e) => setBusca(e.target.value)} />

      {erro ? (
        <p className="card text-center text-alerta-600">{erro}</p>
      ) : itens === null ? (
        <p className="text-center text-grafite-500">Carregando...</p>
      ) : grupos.length === 0 ? (
        <p className="card text-center text-grafite-600">
          {itens.length === 0 ? 'Seus itens aparecem aqui depois do primeiro orçamento com preços.' : 'Nenhum item encontrado.'}
        </p>
      ) : (
        grupos.map(({ modelo, itens: lista }) => (
          <section key={modelo.id}>
            <h2 className="mb-2 text-sm font-semibold text-grafite-500">
              {modelo.icone} {modelo.nome}
            </h2>
            <ul className="card divide-y divide-areia-200 !p-0">
              {lista.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <button className="min-w-0 flex-1 text-left" onClick={() => setEditando(i)}>
                    <p className="truncate font-medium">{i.descricao}</p>
                    <p className="text-sm text-grafite-500">
                      {formatarBRL(i.precoUnitarioCentavos)} / {i.unidade} · {i.tipo === 'material' ? 'Material' : 'Mão de obra'}
                    </p>
                  </button>
                  <button
                    aria-label={`Excluir ${i.descricao}`}
                    className="px-2 text-grafite-400 hover:text-alerta-600"
                    onClick={() => {
                      if (confirm(`Excluir "${i.descricao}" dos seus itens?`)) excluirItemCatalogo(user.uid, i.id)
                    }}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

