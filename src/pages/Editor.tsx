import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  aprenderItens,
  duplicarOrcamento,
  excluirOrcamento,
  mensagemErroLeitura,
  ouvirCatalogo,
  ouvirClientes,
  ouvirOrcamento,
  publicarLink,
  salvarCliente,
  salvarOrcamento,
} from '../data/repo'
import { calcularTotais, chaveCatalogo, subtotalItem, totalRecebido } from '../domain/calc'
import { pixDoOrcamento } from '../domain/cobranca'
import { formatarBRL } from '../domain/money'
import { modeloPorId, UNIDADES_PADRAO, type ItemSugerido } from '../domain/templates'
import type {
  ClienteCadastro,
  ItemCatalogo,
  ItemOrcamento,
  ModoPix,
  Orcamento,
  Pagamento,
  Perfil,
  StatusOrcamento,
  PerfilPublico,
} from '../domain/types'
import { useUsuario } from '../lib/auth'
import { registrarEvento } from '../lib/eventos'
import {
  enviarArquivo,
  gerarPdfGarantia,
  gerarPdfOrcamento,
  gerarPdfRecibo,
  linkWhatsApp,
  mensagemDocumento,
  mensagemLink,
  mensagemWhatsApp,
} from '../pdf/compartilhar'
import { CalculadoraArea } from '../ui/CalculadoraArea'
import { CampoDinheiro } from '../ui/CampoDinheiro'
import { CampoNumero } from '../ui/CampoNumero'
import { Pagamentos } from '../ui/Pagamentos'
import { IconeCheck, IconeLink, IconeVoltar, IconeWhatsApp } from '../ui/Icones'
import { STATUS } from '../ui/status'

const novoId = () => crypto.randomUUID()

type Remoto = Pick<Orcamento, 'status' | 'respondidoEm'>

export function Editor() {
  const { id = '' } = useParams()
  const { user, perfil, publico } = useUsuario()
  const [orcamento, setOrcamento] = useState<Orcamento | null | undefined>(undefined)
  const [remoto, setRemoto] = useState<Remoto | null>(null)
  const [erro, setErro] = useState('')

  // O primeiro carregamento abastece a tela, que depois vira a fonte da verdade
  // e salva sozinha. Das atualizações seguintes, só aproveitamos a resposta do
  // cliente pelo link, que chega enquanto o orçamento está aberto.
  useEffect(() => {
    let carregado = false
    return ouvirOrcamento(
      user.uid,
      id,
      (dados) => {
        if (!carregado) {
          carregado = true
          setOrcamento(dados)
        } else if (dados) {
          setRemoto({ status: dados.status, respondidoEm: dados.respondidoEm })
        }
      },
      (e) => setErro(mensagemErroLeitura(e)),
    )
  }, [user.uid, id])

  if (erro) return <p className="card text-center text-alerta-600">{erro}</p>
  if (orcamento === undefined) return <p className="text-center text-grafite-500">Carregando...</p>
  if (orcamento === null)
    return (
      <div className="card text-center">
        <p>Orçamento não encontrado.</p>
        <Link to="/" className="mt-3 inline-block text-brasa-700">
          Voltar para a lista
        </Link>
      </div>
    )
  return <EditorOrcamento key={orcamento.id} inicial={orcamento} remoto={remoto} uid={user.uid} perfil={perfil} publico={publico} />
}

interface EnvioPendente {
  arquivo: File
  texto: string
}

function EditorOrcamento({
  inicial,
  remoto,
  uid,
  perfil,
  publico,
}: {
  inicial: Orcamento
  remoto: Remoto | null
  uid: string
  perfil: Perfil
  /** Perfil como o cliente vê, com a marca própria quando há Pro. */
  publico: PerfilPublico
}) {
  const navegar = useNavigate()
  const [o, setO] = useState(inicial)
  const [catalogo, setCatalogo] = useState<ItemCatalogo[]>([])
  const [clientes, setClientes] = useState<ClienteCadastro[]>([])
  const [areaAberta, setAreaAberta] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState('')
  const [pendente, setPendente] = useState<EnvioPendente | null>(null)
  const [mensagem, setMensagem] = useState('')
  const [sugerirClientes, setSugerirClientes] = useState(false)
  const modelo = modeloPorId(o.profissao)
  const totais = calcularTotais(o)
  const unidades = Array.from(new Set([...modelo.unidades, ...UNIDADES_PADRAO]))

  useEffect(() => ouvirCatalogo(uid, setCatalogo), [uid])
  useEffect(() => ouvirClientes(uid, setClientes), [uid])

  // Resposta do cliente pelo link chegou com o orçamento aberto.
  // Ajuste de estado durante a renderização, como recomenda a documentação do React.
  const [remotoVisto, setRemotoVisto] = useState(remoto)
  if (remoto !== remotoVisto) {
    setRemotoVisto(remoto)
    if (remoto?.respondidoEm && remoto.respondidoEm !== o.respondidoEm) {
      setO((atual) => ({ ...atual, status: remoto.status, respondidoEm: remoto.respondidoEm }))
      setMensagem(remoto.status === 'aprovado' ? '🎉 O cliente aprovou o orçamento pelo link!' : 'O cliente recusou o orçamento pelo link.')
    }
  }

  // Salvamento automático com pequeno atraso. Se já existe link, ele é atualizado junto.
  const ultimo = useRef(o)
  const naoSalvo = useRef(false)
  const refs = useRef({ catalogo, clientes, publico })
  useEffect(() => {
    refs.current = { catalogo, clientes, publico }
  }, [catalogo, clientes, publico])
  useEffect(() => {
    ultimo.current = o
    if (o === inicial) return
    naoSalvo.current = true
    const timer = setTimeout(() => {
      salvarOrcamento(uid, o)
      if (o.linkId) publicarLink(uid, o, refs.current.publico)
      naoSalvo.current = false
    }, 600)
    return () => clearTimeout(timer)
  }, [o, inicial, uid])

  // Ao sair da tela: salva o que faltou, aprende os preços e guarda o cliente.
  useEffect(
    () => () => {
      let final = ultimo.current
      const { catalogo: cat, clientes: cli, publico: per } = refs.current
      const nome = final.cliente.nome.trim()
      if (nome) {
        const existente = cli.find((c) => c.id === final.clienteId)
        const mudou =
          !existente ||
          existente.nome !== nome ||
          existente.telefone !== final.cliente.telefone.trim() ||
          existente.endereco !== final.cliente.endereco.trim()
        if (mudou) {
          const clienteId = salvarCliente(uid, { ...final.cliente, id: existente?.id })
          if (clienteId !== final.clienteId) {
            final = { ...final, clienteId }
            naoSalvo.current = true
          }
        }
      }
      if (naoSalvo.current) {
        salvarOrcamento(uid, final)
        if (final.linkId) publicarLink(uid, final, per)
      }
      aprenderItens(uid, final.itens, final.profissao, cat)
    },
    [uid],
  )

  const alterar = (dados: Partial<Orcamento>) => {
    setPendente(null)
    setO((atual) => ({ ...atual, ...dados }))
  }
  const alterarItem = (itemId: string, dados: Partial<ItemOrcamento>) =>
    setO((atual) => ({ ...atual, itens: atual.itens.map((i) => (i.id === itemId ? { ...i, ...dados } : i)) }))

  const precoConhecido = (descricao: string) =>
    catalogo.find((c) => c.id === chaveCatalogo(descricao))?.precoUnitarioCentavos ?? perfil.precosSalvos[descricao] ?? 0

  function adicionarItem(sugerido?: ItemSugerido & { precoUnitarioCentavos?: number }) {
    const item: ItemOrcamento = {
      id: novoId(),
      descricao: sugerido?.descricao ?? '',
      quantidade: 1,
      unidade: sugerido?.unidade ?? modelo.unidades[0],
      precoUnitarioCentavos: sugerido ? (sugerido.precoUnitarioCentavos ?? precoConhecido(sugerido.descricao)) : 0,
      tipo: sugerido?.tipo ?? 'servico',
    }
    alterar({ itens: [...o.itens, item] })
  }

  /* ---------- Envio de documentos ---------- */

  async function enviarDocumento(rotulo: string, gerar: () => Promise<File>, texto: string, marcarEnviado = false) {
    setOcupado(rotulo)
    setMensagem('')
    try {
      const arquivo = await gerar()
      const resultado = await enviarArquivo(arquivo, texto, o.cliente.telefone)
      if (resultado === 'precisa-toque') {
        setPendente({ arquivo, texto })
        setMensagem('Documento pronto. Toque em "Enviar agora" para abrir o WhatsApp.')
        return
      }
      setPendente(null)
      if (resultado === 'cancelado') return
      if (marcarEnviado) registrarEvento('orcamento_enviado', { forma: 'pdf', profissao: o.profissao })
      if (marcarEnviado && o.status === 'rascunho') alterar({ status: 'enviado', enviadoEm: Date.now() })
      if (resultado === 'baixado') setMensagem('PDF baixado. Anexe o arquivo na conversa do WhatsApp que abrimos.')
    } catch (erro) {
      console.error(erro)
      setMensagem('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setOcupado('')
    }
  }

  async function enviarPendente() {
    if (!pendente) return
    const resultado = await enviarArquivo(pendente.arquivo, pendente.texto, o.cliente.telefone)
    if (resultado !== 'precisa-toque') {
      setPendente(null)
      setMensagem('')
    }
  }

  function validarItens(): boolean {
    if (o.itens.length > 0) return true
    setMensagem('Adicione pelo menos um item antes de enviar.')
    return false
  }

  function enviarPdf() {
    if (!validarItens()) return
    enviarDocumento('pdf', () => gerarPdfOrcamento(o, publico), mensagemWhatsApp(o, publico), true)
  }

  function enviarLink() {
    if (!validarItens()) return
    const linkId = publicarLink(uid, o, publico)
    registrarEvento('orcamento_enviado', { forma: 'link', profissao: o.profissao })
    alterar({ linkId, ...(o.status === 'rascunho' ? { status: 'enviado' as const, enviadoEm: Date.now() } : {}) })
    const url = `${window.location.origin}/o/${linkId}`
    window.open(linkWhatsApp(o.cliente.telefone, mensagemLink(o, publico, url)), '_blank', 'noopener')
  }

  async function copiarLink() {
    if (!o.linkId) return
    await navigator.clipboard.writeText(`${window.location.origin}/o/${o.linkId}`)
    setMensagem('Link copiado.')
  }

  async function visualizar() {
    const aba = window.open('', '_blank')
    try {
      const url = URL.createObjectURL(await gerarPdfOrcamento(o, publico))
      if (aba) aba.location.href = url
      else window.location.href = url
    } catch (erro) {
      aba?.close()
      console.error(erro)
      setMensagem('Não foi possível gerar o PDF.')
    }
  }

  function registrarPagamento(pagamento: Pagamento) {
    const pagamentos = [...o.pagamentos, pagamento]
    alterar({ pagamentos, status: o.status === 'rascunho' || o.status === 'enviado' ? 'aprovado' : o.status })
    const atualizado = { ...o, pagamentos }
    enviarDocumento('recibo', () => gerarPdfRecibo(atualizado, publico, pagamento), mensagemDocumento(o, publico, 'o recibo'))
  }

  /* ---------- Sugestões ---------- */

  const usadas = new Set(o.itens.map((i) => chaveCatalogo(i.descricao)))
  const meusItens = catalogo.filter((c) => (c.profissao === o.profissao || o.profissao === 'outro') && !usadas.has(c.id))
  const chavesCatalogo = new Set(catalogo.map((c) => c.id))
  const sugestoesModelo = modelo.itens.filter((s) => !usadas.has(chaveCatalogo(s.descricao)) && !chavesCatalogo.has(chaveCatalogo(s.descricao)))

  const termoCliente = o.cliente.nome.trim().toLowerCase()
  const clientesSugeridos = useMemo(
    () =>
      o.clienteId || termoCliente.length < 2
        ? []
        : clientes.filter((c) => c.nome.toLowerCase().includes(termoCliente) || c.telefone.includes(termoCliente)).slice(0, 5),
    [clientes, termoCliente, o.clienteId],
  )

  const cobrancaPix = pixDoOrcamento(o, publico)
  const recebido = totalRecebido(o)
  const mostrarDocumentos = o.status === 'aprovado' || o.pagamentos.length > 0

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-grafite-500 hover:text-brasa-700">
            <IconeVoltar tamanho={16} /> Orçamentos
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-xl font-extrabold sm:text-2xl">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brasa-50 text-xl" aria-hidden>
              {modelo.icone}
            </span>
            Orçamento nº {o.numero}
          </h1>
          {o.respondidoEm && (o.status === 'aprovado' || o.status === 'recusado') && (
            <p className="text-xs text-grafite-500">
              Respondido pelo cliente em {new Date(o.respondidoEm).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
        <select
          aria-label="Status"
          className={`!w-auto !rounded-full !border-0 !py-1.5 text-sm font-bold ${STATUS[o.status].classe}`}
          value={o.status}
          onChange={(e) => alterar({ status: e.target.value as StatusOrcamento })}
        >
          {Object.entries(STATUS).map(([valor, s]) => (
            <option key={valor} value={valor}>
              {s.rotulo}
            </option>
          ))}
        </select>
      </div>

      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <Etapa numero={1} titulo="Cliente" />
          {o.clienteId && (
            <button
              type="button"
              className="text-sm text-brasa-700"
              onClick={() => alterar({ clienteId: undefined, cliente: { nome: '', telefone: '', endereco: '' } })}
            >
              Trocar cliente
            </button>
          )}
        </div>
        <div className="relative">
          <label htmlFor="cliente-nome">Nome</label>
          <input
            id="cliente-nome"
            autoComplete="off"
            placeholder="Digite para buscar ou cadastrar"
            value={o.cliente.nome}
            onFocus={() => setSugerirClientes(true)}
            onBlur={() => setTimeout(() => setSugerirClientes(false), 150)}
            onChange={(e) => alterar({ cliente: { ...o.cliente, nome: e.target.value } })}
          />
          {sugerirClientes && clientesSugeridos.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-areia-300 bg-white shadow-lg">
              {clientesSugeridos.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-brasa-50"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      alterar({ clienteId: c.id, cliente: { nome: c.nome, telefone: c.telefone, endereco: c.endereco } })
                      setSugerirClientes(false)
                    }}
                  >
                    <span className="font-medium">{c.nome}</span>
                    {c.telefone && <span className="ml-2 text-sm text-grafite-500">{c.telefone}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="cliente-tel">WhatsApp</label>
            <input
              id="cliente-tel"
              type="tel"
              placeholder="(11) 99999-9999"
              value={o.cliente.telefone}
              onChange={(e) => alterar({ cliente: { ...o.cliente, telefone: e.target.value } })}
            />
          </div>
          <div>
            <label htmlFor="cliente-end">Endereço do serviço</label>
            <input
              id="cliente-end"
              value={o.cliente.endereco}
              onChange={(e) => alterar({ cliente: { ...o.cliente, endereco: e.target.value } })}
            />
          </div>
        </div>
      </section>

      <section className="card space-y-3">
        <Etapa numero={2} titulo="Itens" detalhe={`${o.itens.length} ${o.itens.length === 1 ? 'item' : 'itens'} · ${formatarBRL(totais.subtotal)}`} />
        {o.itens.length === 0 && (
          <p className="text-sm text-grafite-500">Toque nos itens sugeridos abaixo ou adicione um item em branco.</p>
        )}

        {o.itens.map((item) => (
          <div key={item.id} className="rounded-lg border border-areia-300 p-3">
            <div className="flex gap-2">
              <input
                aria-label="Descrição"
                placeholder="Descrição do serviço ou material"
                value={item.descricao}
                onChange={(e) => alterarItem(item.id, { descricao: e.target.value })}
              />
              <button
                type="button"
                aria-label="Remover item"
                className="px-2 text-grafite-400 hover:text-alerta-600"
                onClick={() => alterar({ itens: o.itens.filter((i) => i.id !== item.id) })}
              >
                ✕
              </button>
            </div>
            <div className="mt-2 grid grid-cols-[1fr_1fr_1.4fr] gap-2">
              <CampoNumero aria-label="Quantidade" valor={item.quantidade} onChange={(v) => alterarItem(item.id, { quantidade: v })} />
              <select aria-label="Unidade" value={item.unidade} onChange={(e) => alterarItem(item.id, { unidade: e.target.value })}>
                {Array.from(new Set([item.unidade, ...unidades])).map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </select>
              <CampoDinheiro valor={item.precoUnitarioCentavos} onChange={(v) => alterarItem(item.id, { precoUnitarioCentavos: v })} />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`rounded-full px-2 py-0.5 text-xs ${item.tipo === 'material' ? 'bg-regua-100 text-grafite-800' : 'bg-brasa-100 text-brasa-800'}`}
                  onClick={() => alterarItem(item.id, { tipo: item.tipo === 'material' ? 'servico' : 'material' })}
                >
                  {item.tipo === 'material' ? 'Material' : 'Mão de obra'}
                </button>
                {item.unidade === 'm²' && (
                  <button type="button" className="text-xs text-brasa-700" onClick={() => setAreaAberta(item.id)}>
                    📐 Calcular área
                  </button>
                )}
              </div>
              <strong>{formatarBRL(subtotalItem(item))}</strong>
            </div>
            {areaAberta === item.id && (
              <CalculadoraArea
                onFechar={() => setAreaAberta(null)}
                onAplicar={(area) => {
                  alterarItem(item.id, { quantidade: area })
                  setAreaAberta(null)
                }}
              />
            )}
          </div>
        ))}

        {meusItens.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-grafite-500 uppercase">Meus itens</p>
            <div className="flex flex-wrap gap-2">
              {meusItens.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="rounded-full border border-brasa-200 bg-brasa-50 px-3 py-1 text-sm text-brasa-900 hover:border-brasa-400"
                  onClick={() => adicionarItem(c)}
                >
                  + {c.descricao} · {formatarBRL(c.precoUnitarioCentavos)}
                </button>
              ))}
            </div>
          </div>
        )}

        {sugestoesModelo.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-grafite-500 uppercase">Sugestões para {modelo.nome.toLowerCase()}</p>
            <div className="flex flex-wrap gap-2">
              {sugestoesModelo.map((s) => (
                <button
                  key={s.descricao}
                  type="button"
                  className="rounded-full border border-areia-400 bg-white px-3 py-1 text-sm hover:border-brasa-400 hover:text-brasa-700"
                  onClick={() => adicionarItem(s)}
                >
                  + {s.descricao}
                </button>
              ))}
            </div>
          </div>
        )}
        <button type="button" className="btn-secondary w-full" onClick={() => adicionarItem()}>
          + Item em branco
        </button>
      </section>

      <section className="card space-y-3">
        <Etapa numero={3} titulo="Valores e Pix" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="desconto">Desconto</label>
            <div className="flex gap-2">
              <select
                aria-label="Tipo de desconto"
                className="!w-20"
                value={o.desconto.tipo}
                onChange={(e) => alterar({ desconto: { tipo: e.target.value as 'percentual' | 'valor', valor: 0 } })}
              >
                <option value="percentual">%</option>
                <option value="valor">R$</option>
              </select>
              {o.desconto.tipo === 'percentual' ? (
                <CampoNumero
                  id="desconto"
                  valor={o.desconto.valor}
                  maximo={100}
                  onChange={(v) => alterar({ desconto: { tipo: 'percentual', valor: v } })}
                />
              ) : (
                <CampoDinheiro
                  id="desconto"
                  className="flex-1"
                  valor={o.desconto.valor}
                  onChange={(v) => alterar({ desconto: { tipo: 'valor', valor: v } })}
                />
              )}
            </div>
          </div>
          <div>
            <label htmlFor="deslocamento">Taxa de deslocamento</label>
            <CampoDinheiro id="deslocamento" valor={o.deslocamentoCentavos} onChange={(v) => alterar({ deslocamentoCentavos: v })} />
          </div>
        </div>

        <div>
          <label htmlFor="pix-modo">QR Code Pix no orçamento</label>
          {perfil.pix ? (
            <div className="flex gap-2">
              <select
                id="pix-modo"
                value={o.pix.modo}
                onChange={(e) => alterar({ pix: { ...o.pix, modo: e.target.value as ModoPix } })}
              >
                <option value="total">Valor total</option>
                <option value="percentual">Entrada (percentual)</option>
                <option value="sem-valor">Sem valor definido</option>
                <option value="nao-incluir">Não incluir</option>
              </select>
              {o.pix.modo === 'percentual' && (
                <div className="flex w-28 shrink-0 items-center gap-1">
                  <CampoNumero
                    aria-label="Percentual da entrada"
                    valor={o.pix.percentual}
                    maximo={100}
                    onChange={(v) => alterar({ pix: { ...o.pix, percentual: v } })}
                  />
                  <span>%</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-grafite-600">
              <Link to="/perfil" className="text-brasa-700">
                Cadastre sua chave Pix
              </Link>{' '}
              para o orçamento sair com QR Code de pagamento.
            </p>
          )}
          {cobrancaPix && cobrancaPix.valorCentavos > 0 && (
            <p className="mt-1 text-xs text-grafite-500">O QR Code vai cobrar {formatarBRL(cobrancaPix.valorCentavos)}.</p>
          )}
        </div>
      </section>

      <section className="card space-y-3">
        <Etapa numero={4} titulo="Condições" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="prazo">Prazo de execução</label>
            <input id="prazo" value={o.prazoExecucao} onChange={(e) => alterar({ prazoExecucao: e.target.value })} />
          </div>
          <div>
            <label htmlFor="validade">Validade do orçamento</label>
            <select id="validade" value={o.validadeDias} onChange={(e) => alterar({ validadeDias: Number(e.target.value) })}>
              {[7, 10, 15, 30, 60].map((d) => (
                <option key={d} value={d}>
                  {d} dias
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="pagamento">Condições de pagamento</label>
          <textarea id="pagamento" rows={2} value={o.condicoesPagamento} onChange={(e) => alterar({ condicoesPagamento: e.target.value })} />
        </div>
        <div>
          <label htmlFor="garantia">Garantia</label>
          <textarea id="garantia" rows={2} value={o.garantia} onChange={(e) => alterar({ garantia: e.target.value })} />
        </div>
        <div>
          <label htmlFor="obs">Observações</label>
          <textarea
            id="obs"
            rows={2}
            placeholder="Ex.: material por conta do cliente, horário de trabalho..."
            value={o.observacoes}
            onChange={(e) => alterar({ observacoes: e.target.value })}
          />
        </div>
      </section>

      <section className="card space-y-1 text-sm">
        {totais.materiais > 0 && totais.servicos > 0 && (
          <>
            <LinhaTotal rotulo="Mão de obra" valor={totais.servicos} />
            <LinhaTotal rotulo="Materiais" valor={totais.materiais} />
          </>
        )}
        <LinhaTotal rotulo="Subtotal" valor={totais.subtotal} />
        {totais.desconto > 0 && <LinhaTotal rotulo="Desconto" valor={-totais.desconto} />}
        {totais.deslocamento > 0 && <LinhaTotal rotulo="Deslocamento" valor={totais.deslocamento} />}
        {recebido > 0 && (
          <>
            <LinhaTotal rotulo="Recebido" valor={recebido} />
            <LinhaTotal rotulo="A receber" valor={Math.max(totais.total - recebido, 0)} />
          </>
        )}
      </section>

      {o.linkId && (
        <section className="card flex items-center justify-between gap-3 text-sm">
          <div className="min-w-0">
            <p className="font-medium">Link de aprovação</p>
            <p className="truncate text-grafite-500">
              {window.location.host}/o/{o.linkId}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <a className="btn-secondary !px-3 !py-1.5 text-sm" href={`/o/${o.linkId}`} target="_blank" rel="noreferrer">
              Abrir
            </a>
            <button type="button" className="btn-secondary !px-3 !py-1.5 text-sm" onClick={copiarLink}>
              Copiar
            </button>
          </div>
        </section>
      )}

      {mostrarDocumentos && (
        <section className="card space-y-4">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-aprovado-500 text-white">
              <IconeCheck tamanho={16} strokeWidth={3} />
            </span>
            <h2 className="text-lg font-bold">Serviço aprovado: documentos</h2>
          </div>
          <Pagamentos
            orcamento={o}
            total={totais.total}
            ocupado={ocupado === 'recibo'}
            onRegistrar={registrarPagamento}
            onReenviar={(p) =>
              enviarDocumento('recibo', () => gerarPdfRecibo(o, publico, p), mensagemDocumento(o, publico, 'o recibo'))
            }
            onExcluir={(id) => alterar({ pagamentos: o.pagamentos.filter((p) => p.id !== id) })}
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              className="btn-secondary"
              disabled={Boolean(ocupado)}
              onClick={() =>
                enviarDocumento('ordem', () => gerarPdfOrcamento(o, publico, 'ordem'), mensagemDocumento(o, publico, 'a ordem de serviço'))
              }
            >
              {ocupado === 'ordem' ? 'Gerando...' : '📋 Enviar ordem de serviço'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={Boolean(ocupado)}
              onClick={() =>
                enviarDocumento('garantia', () => gerarPdfGarantia(o, publico), mensagemDocumento(o, publico, 'o termo de garantia'))
              }
            >
              {ocupado === 'garantia' ? 'Gerando...' : '🛡️ Enviar termo de garantia'}
            </button>
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary flex-1" onClick={visualizar}>
          Ver PDF
        </button>
        <button type="button" className="btn-secondary flex-1" onClick={() => navegar(`/orcamento/${duplicarOrcamento(uid, perfil, o)}`)}>
          Duplicar
        </button>
        <button
          type="button"
          className="btn-secondary flex-1 !text-alerta-600"
          onClick={() => {
            if (!confirm(`Excluir o orçamento nº ${o.numero}? Isso não pode ser desfeito.`)) return
            naoSalvo.current = false
            // Evita que a saída da tela recrie o orçamento ou o cliente.
            ultimo.current = { ...ultimo.current, cliente: { nome: '', telefone: '', endereco: '' }, itens: [] }
            excluirOrcamento(uid, o)
            navegar('/', { replace: true })
          }}
        >
          Excluir
        </button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-areia-200 bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(27,31,42,0.08)] backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          {mensagem && (
            <p className="mb-2.5 rounded-xl bg-areia-100 px-3 py-2 text-center text-sm font-medium text-grafite-700" role="status">
              {mensagem}
            </p>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="shrink-0">
              <p className="text-xs font-semibold text-grafite-500">Total</p>
              <p className="font-display text-xl leading-tight font-extrabold sm:text-2xl">{formatarBRL(totais.total)}</p>
            </div>
            {pendente ? (
              <button type="button" className="btn-whatsapp flex-1" onClick={enviarPendente}>
                <IconeWhatsApp tamanho={18} /> Enviar agora
              </button>
            ) : (
              <div className="flex flex-1 justify-end gap-2">
                <button
                  type="button"
                  className="btn-whatsapp flex-1 !px-3 text-sm whitespace-nowrap sm:flex-none sm:text-base"
                  disabled={Boolean(ocupado)}
                  onClick={enviarPdf}
                >
                  <IconeWhatsApp tamanho={18} className="hidden min-[420px]:block" /> {ocupado === 'pdf' ? 'Gerando...' : 'Enviar PDF'}
                </button>
                <button type="button" className="btn-escuro flex-1 !px-3 text-sm whitespace-nowrap sm:flex-none sm:text-base" onClick={enviarLink}>
                  <IconeLink tamanho={18} className="hidden min-[420px]:block" /> Enviar link
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function LinhaTotal({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="flex justify-between">
      <span className="text-grafite-600">{rotulo}</span>
      <span>{valor < 0 ? `- ${formatarBRL(-valor)}` : formatarBRL(valor)}</span>
    </div>
  )
}

function Etapa({ numero, titulo, detalhe }: { numero: number; titulo: string; detalhe?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-grafite-900 font-display text-sm font-bold text-white">
        {numero}
      </span>
      <h2 className="flex-1 text-lg font-bold">{titulo}</h2>
      {detalhe && <span className="text-sm font-medium text-grafite-500">{detalhe}</span>}
    </div>
  )
}
