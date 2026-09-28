import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  excluirPedidoPro,
  gravarAssinatura,
  mensagemErroLeitura,
  ouvirAssinaturas,
  ouvirPedidosPro,
  type AssinaturaAdmin,
  type PedidoPro,
} from '../data/repo'
import { formatarBRL } from '../domain/money'
import { novaValidade } from '../domain/plano'
import { useSessao, useUsuario } from '../lib/auth'
import { linkWhatsApp } from '../pdf/compartilhar'
import { IconeCopiar, IconeEscudo, IconeLixeira, IconeWhatsApp } from '../ui/Icones'

/** Receita mensal média por período, em centavos: R$ 14,90 no mensal e R$ 99 / 12 no anual. */
const RECEITA_MENSAL = { mensal: 1490, anual: Math.round(9900 / 12) }

const dataBR = (ms: number) => new Date(ms).toLocaleDateString('pt-BR')

export function Admin() {
  const { admin } = useSessao()
  return admin ? <PainelAdmin /> : <SemAcesso />
}

function SemAcesso() {
  const { user } = useUsuario()
  const [copiado, setCopiado] = useState(false)
  return (
    <div className="card space-y-4">
      <h1 className="flex items-center gap-2 text-2xl font-extrabold">
        <IconeEscudo tamanho={24} /> Acesso restrito
      </h1>
      <p className="text-grafite-600">Esta área é só para quem administra o Q3 Orça. Para liberar o acesso a esta conta:</p>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-grafite-700">
        <li>Abra o console do Firebase, em Firestore Database.</li>
        <li>
          Crie a coleção <code className="rounded bg-areia-200 px-1">admins</code> com um documento cujo ID é o identificador abaixo.
        </li>
        <li>Coloque qualquer campo, por exemplo nome. Esta página libera sozinha.</li>
      </ol>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-xl bg-areia-100 px-3 py-2.5 text-sm">{user.uid}</code>
        <button
          className="btn-secondary !px-3 !py-2.5 text-sm"
          onClick={async () => {
            await navigator.clipboard.writeText(user.uid)
            setCopiado(true)
          }}
        >
          <IconeCopiar tamanho={16} /> {copiado ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}

function PainelAdmin() {
  const [pedidos, setPedidos] = useState<PedidoPro[] | null>(null)
  const [assinaturas, setAssinaturas] = useState<AssinaturaAdmin[] | null>(null)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState('')
  const [agora] = useState(() => Date.now())

  useEffect(() => ouvirPedidosPro(setPedidos, (e) => setErro(mensagemErroLeitura(e))), [])
  useEffect(() => ouvirAssinaturas(setAssinaturas, (e) => setErro(mensagemErroLeitura(e))), [])

  const porUid = useMemo(() => new Map((assinaturas ?? []).map((a) => [a.uid, a])), [assinaturas])
  const ativas = (assinaturas ?? []).filter((a) => a.validoAte > agora)
  const receita = ativas.reduce((total, a) => total + RECEITA_MENSAL[a.periodo ?? 'mensal'], 0)

  async function executar(chave: string, acao: () => Promise<unknown>, sucesso: string) {
    setOcupado(chave)
    setAviso('')
    try {
      await acao()
      setAviso(sucesso)
    } catch (e) {
      console.error(e)
      setAviso('Não foi possível concluir. Confira sua conexão e se esta conta é admin.')
    } finally {
      setOcupado('')
    }
  }

  function ativar(uid: string, nome: string, email: string, periodo: 'mensal' | 'anual', apagarPedido: boolean) {
    // Chamado só a partir de cliques; a hora é lida no momento da ação.
    const validoAte = novaValidade(porUid.get(uid)?.validoAte, new Date().getTime(), periodo === 'anual' ? 12 : 1)
    return executar(
      `${uid}-${periodo}`,
      async () => {
        await gravarAssinatura(uid, { validoAte, nome, email, periodo })
        if (apagarPedido) await excluirPedidoPro(uid)
      },
      `Pro de ${nome || email || uid} ativo até ${dataBR(validoAte)}.`,
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="rotulo !text-brasa-700">Administração</p>
        <h1 className="text-3xl font-extrabold">Painel do Q3 Orça</h1>
      </div>

      {erro && <p className="card text-alerta-600">{erro}</p>}
      {aviso && (
        <p role="status" className="rounded-cartao bg-aprovado-50 p-4 text-sm font-medium text-aprovado-700">
          {aviso}
        </p>
      )}

      <section className="grid grid-cols-3 gap-3">
        <Numero titulo="Pedidos" valor={String(pedidos?.length ?? '-')} />
        <Numero titulo="Assinantes ativos" valor={String(assinaturas ? ativas.length : '-')} />
        <Numero titulo="Receita mensal" valor={assinaturas ? formatarBRL(receita) : '-'} destaque />
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Pedidos do Pro</h2>
        {pedidos === null ? (
          <p className="text-grafite-500">Carregando...</p>
        ) : pedidos.length === 0 ? (
          <p className="card text-center text-grafite-500">Nenhum pedido pendente.</p>
        ) : (
          <ul className="space-y-2">
            {pedidos.map((p) => (
              <li key={p.uid} className="card space-y-3 !p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.nome || 'Sem nome'}</p>
                    <p className="truncate text-sm text-grafite-500">{p.email}</p>
                    <p className="text-xs text-grafite-400">
                      Pediu o plano {p.plano} em {dataBR(p.criadoEm)}
                      {porUid.get(p.uid) && porUid.get(p.uid)!.validoAte > agora ? ' · já é Pro' : ''}
                    </p>
                  </div>
                  {p.telefone && (
                    <a
                      className="btn-whatsapp !px-3 !py-2 text-sm"
                      href={linkWhatsApp(p.telefone, `Olá, ${p.nome.split(' ')[0] || ''}! Aqui é do Q3 Orça, sobre o seu pedido do plano Pro.`)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <IconeWhatsApp tamanho={16} /> Conversar
                    </a>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="btn-primary !px-3 !py-2 text-sm"
                    disabled={Boolean(ocupado)}
                    onClick={() => ativar(p.uid, p.nome, p.email, 'mensal', true)}
                  >
                    Ativar 1 mês
                  </button>
                  <button
                    className="btn-escuro !px-3 !py-2 text-sm"
                    disabled={Boolean(ocupado)}
                    onClick={() => ativar(p.uid, p.nome, p.email, 'anual', true)}
                  >
                    Ativar 1 ano
                  </button>
                  <button
                    className="btn-secondary !px-3 !py-2 text-sm !text-alerta-600"
                    disabled={Boolean(ocupado)}
                    onClick={() => {
                      if (confirm(`Apagar o pedido de ${p.nome || p.email}?`))
                        executar(`${p.uid}-apagar`, () => excluirPedidoPro(p.uid), 'Pedido apagado.')
                    }}
                  >
                    <IconeLixeira tamanho={16} /> Apagar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Assinaturas</h2>
        {assinaturas === null ? (
          <p className="text-grafite-500">Carregando...</p>
        ) : assinaturas.length === 0 ? (
          <p className="card text-center text-grafite-500">Nenhuma assinatura ainda.</p>
        ) : (
          <ul className="space-y-2">
            {assinaturas.map((a) => {
              const ativa = a.validoAte > agora
              return (
                <li key={a.uid} className="card flex flex-wrap items-center justify-between gap-3 !p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{a.nome || a.email || a.uid}</p>
                    <p className={`text-sm ${ativa ? 'text-aprovado-700' : 'text-alerta-600'}`}>
                      {ativa ? 'Ativa' : 'Vencida'} até {dataBR(a.validoAte)}
                      {a.periodo ? ` · ${a.periodo}` : ''}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="btn-secondary !px-3 !py-2 text-sm"
                      disabled={Boolean(ocupado)}
                      onClick={() => ativar(a.uid, a.nome ?? '', a.email ?? '', 'mensal', false)}
                    >
                      +1 mês
                    </button>
                    <button
                      className="btn-secondary !px-3 !py-2 text-sm"
                      disabled={Boolean(ocupado)}
                      onClick={() => ativar(a.uid, a.nome ?? '', a.email ?? '', 'anual', false)}
                    >
                      +1 ano
                    </button>
                    {ativa && (
                      <button
                        className="btn-secondary !px-3 !py-2 text-sm !text-alerta-600"
                        disabled={Boolean(ocupado)}
                        onClick={() => {
                          if (confirm(`Encerrar agora o Pro de ${a.nome || a.email}? Use em caso de estorno ou cancelamento.`))
                            executar(
                              `${a.uid}-encerrar`,
                              () => gravarAssinatura(a.uid, { validoAte: Date.now(), nome: a.nome ?? '', email: a.email ?? '' }),
                              'Assinatura encerrada.',
                            )
                        }}
                      >
                        Encerrar
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <AtivarPorUid onAtivar={(uid, periodo) => ativar(uid, '', '', periodo, false)} ocupado={Boolean(ocupado)} />
    </div>
  )
}

function AtivarPorUid({ onAtivar, ocupado }: { onAtivar: (uid: string, periodo: 'mensal' | 'anual') => void; ocupado: boolean }) {
  const [uid, setUid] = useState('')
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal')
  function enviar(e: FormEvent) {
    e.preventDefault()
    if (uid.trim()) onAtivar(uid.trim(), periodo)
  }
  return (
    <form onSubmit={enviar} className="card space-y-3">
      <h2 className="text-lg font-bold">Ativar sem pedido</h2>
      <p className="text-sm text-grafite-600">Para quem pagou por fora. Copie o UID em Authentication, no console do Firebase.</p>
      <div className="flex flex-wrap gap-2">
        <input className="!w-auto flex-1" placeholder="UID do usuário" value={uid} onChange={(e) => setUid(e.target.value)} />
        <select className="!w-32" value={periodo} onChange={(e) => setPeriodo(e.target.value as 'mensal' | 'anual')}>
          <option value="mensal">1 mês</option>
          <option value="anual">1 ano</option>
        </select>
        <button className="btn-primary !py-2.5" disabled={ocupado || !uid.trim()}>
          Ativar
        </button>
      </div>
    </form>
  )
}

function Numero({ titulo, valor, destaque }: { titulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className={destaque ? 'rounded-cartao bg-grafite-900 p-4 text-white' : 'card !p-4'}>
      <p className={`text-xs font-semibold ${destaque ? 'text-grafite-300' : 'text-grafite-500'}`}>{titulo}</p>
      <p className={`mt-1 truncate font-display text-lg font-bold ${destaque ? 'text-brasa-300' : ''}`}>{valor}</p>
    </div>
  )
}
