import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { mensagemErroLeitura, ouvirOrcamentos } from '../data/repo'
import { calcularTotais, totalRecebido } from '../domain/calc'
import { formatarBRL } from '../domain/money'
import { modeloPorId } from '../domain/templates'
import type { Orcamento, StatusOrcamento } from '../domain/types'
import { useUsuario } from '../lib/auth'
import { linkWhatsApp } from '../pdf/compartilhar'
import { IconeBusca, IconeCheck, IconeMais, IconeRelogio, IconeSeta, IconeWhatsApp } from '../ui/Icones'
import { STATUS } from '../ui/status'

const DIA = 24 * 60 * 60 * 1000

function saudacao(): string {
  const hora = new Date().getHours()
  return hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
}

export function Orcamentos() {
  const { user, perfil, plano } = useUsuario()
  const [lista, setLista] = useState<Orcamento[] | null>(null)
  const [filtro, setFiltro] = useState<StatusOrcamento | 'todos'>('todos')
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState('')
  const [agora] = useState(() => Date.now())

  useEffect(() => ouvirOrcamentos(user.uid, setLista, (e) => setErro(mensagemErroLeitura(e))), [user.uid])

  const resumo = useMemo(() => {
    const inicioMes = new Date(agora)
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)
    const todos = lista ?? []
    const doMes = todos.filter((o) => o.criadoEm >= inicioMes.getTime())
    const soma = (itens: Orcamento[]) => itens.reduce((total, o) => total + calcularTotais(o).total, 0)
    const aprovados = doMes.filter((o) => o.status === 'aprovado')
    const respondidos = doMes.filter((o) => o.status === 'aprovado' || o.status === 'recusado')
    const aReceber = todos
      .filter((o) => o.status === 'aprovado')
      .reduce((total, o) => total + Math.max(calcularTotais(o).total - totalRecebido(o), 0), 0)
    const aguardando = todos
      .filter((o) => o.status === 'enviado' && agora - (o.enviadoEm ?? o.atualizadoEm) > 3 * DIA)
      .slice(0, 3)
    return {
      orcado: soma(doMes),
      aprovado: soma(aprovados),
      taxa: respondidos.length ? Math.round((aprovados.length / respondidos.length) * 100) : null,
      aReceber,
      aguardando,
    }
  }, [lista, agora])

  const contagem = (s: StatusOrcamento) => (lista ?? []).filter((o) => o.status === s).length
  const visiveis = (lista ?? []).filter((o) => {
    if (filtro !== 'todos' && o.status !== filtro) return false
    const termo = busca.trim().toLowerCase()
    return !termo || o.cliente.nome.toLowerCase().includes(termo) || o.numero.includes(termo)
  })

  const passos = [
    { feito: Boolean(perfil.nome && perfil.telefone), titulo: 'Seus dados no cabeçalho', para: '/perfil' },
    { feito: Boolean(perfil.pix), titulo: 'Chave Pix para receber', para: '/perfil' },
    { feito: (lista?.length ?? 0) > 0, titulo: 'Primeiro orçamento', para: '/novo' },
  ]
  const onboarding = lista !== null && passos.some((p) => !p.feito)
  const primeiroNome = perfil.nome.trim().split(/\s+/)[0]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-grafite-500 first-letter:uppercase">
          {new Date(agora).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-3xl font-extrabold">
          {saudacao()}
          {primeiroNome ? `, ${primeiroNome}` : ''}!
        </h1>
      </div>

      {plano.motivo === 'teste' && plano.diasRestantes <= 5 && (
        <Link to="/planos" className="flex items-center justify-between gap-3 rounded-cartao bg-regua-300 p-4 text-grafite-900">
          <span className="text-sm">
            <strong>
              Seu teste do Pro acaba em {plano.diasRestantes} {plano.diasRestantes === 1 ? 'dia' : 'dias'}.
            </strong>{' '}
            Depois, os documentos voltam a sair sem seu logo.
          </span>
          <IconeSeta tamanho={18} className="shrink-0" />
        </Link>
      )}

      {onboarding && (
        <section className="card overflow-hidden !p-0">
          <div className="bg-grafite-900 px-5 py-4 text-white">
            <p className="font-display text-lg font-bold">Complete seus dados e comece em 3 passos</p>
            <p className="text-sm text-grafite-300">Leva menos de 3 minutos. Seu cliente vai notar a diferença.</p>
          </div>
          <ol className="divide-y divide-areia-200">
            {passos.map((p, i) => (
              <li key={p.titulo}>
                <Link to={p.para} className="flex items-center gap-3 px-5 py-3.5 hover:bg-areia-50">
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      p.feito ? 'bg-aprovado-500 text-white' : 'border-2 border-areia-300 text-grafite-400'
                    }`}
                  >
                    {p.feito ? <IconeCheck tamanho={16} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className={`flex-1 font-semibold ${p.feito ? 'text-grafite-400 line-through' : ''}`}>{p.titulo}</span>
                  {!p.feito && <IconeSeta tamanho={18} className="text-brasa-600" />}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Resumo titulo="Orçado no mês" valor={formatarBRL(resumo.orcado)} />
        <Resumo titulo="Aprovado no mês" valor={formatarBRL(resumo.aprovado)} destaque />
        <Resumo titulo="Aprovação" valor={resumo.taxa === null ? '-' : `${resumo.taxa}%`} />
        <Resumo titulo="A receber" valor={formatarBRL(resumo.aReceber)} />
      </section>

      {resumo.aguardando.length > 0 && (
        <section className="rounded-cartao border border-regua-300 bg-regua-100 p-4">
          <p className="flex items-center gap-2 font-semibold">
            <IconeRelogio tamanho={18} /> Aguardando resposta há mais de 3 dias
          </p>
          <ul className="mt-3 space-y-2">
            {resumo.aguardando.map((o) => {
              const nome = o.cliente.nome.trim().split(/\s+/)[0]
              const texto = `Oi${nome ? `, ${nome}` : ''}! Tudo bem? Conseguiu ver o orçamento nº ${o.numero}? Se quiser ajustar alguma coisa, é só me falar.`
              return (
                <li key={o.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/70 px-3 py-2">
                  <Link to={`/orcamento/${o.id}`} className="min-w-0">
                    <p className="truncate font-medium">{o.cliente.nome || 'Cliente sem nome'}</p>
                    <p className="text-xs text-grafite-500">
                      Nº {o.numero} · {formatarBRL(calcularTotais(o).total)}
                    </p>
                  </Link>
                  <a
                    href={linkWhatsApp(o.cliente.telefone, texto)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-whatsapp shrink-0 !px-3 !py-2 text-sm"
                  >
                    <IconeWhatsApp tamanho={16} /> Lembrar
                  </a>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Seus orçamentos</h2>
        <div className="relative">
          <IconeBusca tamanho={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-grafite-400" />
          <input className="!pl-10" placeholder="Buscar cliente ou número" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label="Filtrar por status">
          <Filtro ativo={filtro === 'todos'} onClick={() => setFiltro('todos')} rotulo="Todos" total={lista?.length ?? 0} />
          {(Object.keys(STATUS) as StatusOrcamento[]).map((s) => (
            <Filtro key={s} ativo={filtro === s} onClick={() => setFiltro(s)} rotulo={STATUS[s].rotulo} total={contagem(s)} />
          ))}
        </div>

        {erro ? (
          <p className="card text-center text-alerta-600">{erro}</p>
        ) : lista === null ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-cartao bg-areia-200" />
            ))}
          </div>
        ) : visiveis.length === 0 ? (
          <Vazio semNenhum={lista.length === 0} />
        ) : (
          <ul className="space-y-2">
            {visiveis.map((o) => {
              const modelo = modeloPorId(o.profissao)
              return (
                <li key={o.id}>
                  <Link
                    to={`/orcamento/${o.id}`}
                    className="card flex items-center gap-3 !p-4 transition hover:-translate-y-0.5 hover:border-brasa-200"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brasa-50 text-2xl" aria-hidden>
                      {modelo.icone}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{o.cliente.nome || 'Cliente sem nome'}</p>
                      <p className="text-sm text-grafite-500">
                        Nº {o.numero} · {new Date(o.criadoEm).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-display font-bold">{formatarBRL(calcularTotais(o).total)}</p>
                      <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[o.status].classe}`}>
                        {STATUS[o.status].rotulo}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function Resumo({ titulo, valor, destaque = false }: { titulo: string; valor: string; destaque?: boolean }) {
  return (
    <div className={destaque ? 'rounded-cartao bg-grafite-900 p-4 text-white' : 'card !p-4'}>
      <p className={`text-xs font-semibold ${destaque ? 'text-grafite-300' : 'text-grafite-500'}`}>{titulo}</p>
      <p className={`mt-1 truncate font-display text-lg font-bold ${destaque ? 'text-brasa-300' : ''}`}>{valor}</p>
    </div>
  )
}

function Filtro({ ativo, rotulo, total, onClick }: { ativo: boolean; rotulo: string; total: number; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
        ativo ? 'bg-grafite-900 text-white' : 'border border-areia-300 bg-white text-grafite-600 hover:border-grafite-300'
      }`}
    >
      {rotulo} <span className={ativo ? 'text-grafite-300' : 'text-grafite-400'}>{total}</span>
    </button>
  )
}

function Vazio({ semNenhum }: { semNenhum: boolean }) {
  return (
    <div className="card flex flex-col items-center gap-3 py-10 text-center">
      <svg width="120" height="96" viewBox="0 0 120 96" aria-hidden>
        <rect x="22" y="8" width="64" height="80" rx="10" fill="#fff4ed" stroke="#ffc5a6" strokeWidth="2" />
        <path d="M36 30h36M36 42h28M36 54h32" stroke="#ff9b6b" strokeWidth="4" strokeLinecap="round" />
        <circle cx="86" cy="68" r="18" fill="#ff5a1f" />
        <path d="m78 68 6 6 11-12" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="font-display text-lg font-bold">
        {semNenhum ? 'Você ainda não criou nenhum orçamento.' : 'Nenhum orçamento encontrado.'}
      </p>
      {semNenhum && (
        <>
          <p className="max-w-xs text-sm text-grafite-500">Escolha a profissão, toque nos itens e envie. Leva uns 2 minutos.</p>
          <Link to="/novo" className="btn-primary mt-1">
            <IconeMais tamanho={18} /> Criar primeiro orçamento
          </Link>
        </>
      )}
    </div>
  )
}
