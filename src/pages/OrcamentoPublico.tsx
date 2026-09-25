import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ouvirCompartilhamento, responderOrcamento } from '../data/repo'
import { calcularTotais, dataValidade, subtotalItem } from '../domain/calc'
import { pixDoOrcamento } from '../domain/cobranca'
import { formatarBRL, formatarQuantidade } from '../domain/money'
import type { Compartilhamento, RespostaCliente } from '../domain/types'
import { baixarArquivo, gerarPdfOrcamento, linkWhatsApp, qrCodeDataUrl } from '../pdf/compartilhar'
import { APP_NOME, Simbolo } from '../ui/Logo'
import { Regua } from '../ui/Regua'

export function OrcamentoPublico() {
  const { id = '' } = useParams()
  const [dados, setDados] = useState<Compartilhamento | null | undefined>(undefined)
  const [erro, setErro] = useState('')

  useEffect(
    () =>
      ouvirCompartilhamento(id, setDados, (e) => {
        console.error(e)
        setErro('Não foi possível abrir este orçamento. Verifique sua conexão e tente de novo.')
      }),
    [id],
  )

  if (erro) return <Centro>{erro}</Centro>
  if (dados === undefined) return <Centro>Carregando orçamento...</Centro>
  if (dados === null) return <Centro>Este orçamento não existe mais ou o link está incorreto.</Centro>
  return <Conteudo dados={dados} />
}

function Centro({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh items-center justify-center px-6 text-center text-grafite-600">{children}</div>
}

function Conteudo({ dados }: { dados: Compartilhamento }) {
  const { orcamento: o, perfil: p } = dados
  const totais = calcularTotais(o)
  const [agora] = useState(() => Date.now())
  const validade = dataValidade(o.criadoEm, o.validadeDias)
  const vencido = !dados.resposta && validade.getTime() < agora
  const pix = pixDoOrcamento(o, p)
  const temMaterial = totais.materiais > 0 && totais.servicos > 0

  const [qr, setQr] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [nome, setNome] = useState(o.cliente.nome)
  const [confirmando, setConfirmando] = useState<RespostaCliente | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [falha, setFalha] = useState('')
  const [baixando, setBaixando] = useState(false)

  const codigoPix = pix?.codigo
  useEffect(() => {
    if (codigoPix) qrCodeDataUrl(codigoPix).then(setQr).catch(console.error)
  }, [codigoPix])

  async function responder(resposta: RespostaCliente) {
    setEnviando(true)
    setFalha('')
    try {
      await responderOrcamento(dados.id, resposta, nome)
      setConfirmando(null)
    } catch (e) {
      console.error(e)
      setFalha('Não foi possível registrar sua resposta. Tente novamente.')
    } finally {
      setEnviando(false)
    }
  }

  async function baixarPdf() {
    setBaixando(true)
    try {
      baixarArquivo(await gerarPdfOrcamento(o, p))
    } finally {
      setBaixando(false)
    }
  }

  const avisoWhatsApp = p.telefone
    ? linkWhatsApp(
        p.telefone,
        dados.resposta === 'aprovado'
          ? `Olá! Acabei de aprovar o orçamento nº ${o.numero}. Podemos combinar o início do serviço?`
          : `Olá! Tenho uma dúvida sobre o orçamento nº ${o.numero}.`,
      )
    : ''

  return (
    <div className="min-h-dvh bg-areia-100 pb-10">
      <header className="relative overflow-hidden bg-grafite-900 px-4 pt-7 pb-20 text-white">
        <div className="relative z-10 mx-auto max-w-2xl">
          <p className="rotulo !text-brasa-400">Orçamento de serviço</p>
          <p className="mt-1 font-display text-3xl font-extrabold">{p.nome || 'Orçamento'}</p>
          <p className="mt-1 text-sm text-grafite-300">{[p.telefone, p.email, p.cidade].filter(Boolean).join(' · ')}</p>
        </div>
        <Regua className="opacity-60" />
      </header>

      <main className="relative z-10 mx-auto -mt-10 max-w-2xl space-y-4 px-4">
        <section className="card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm text-grafite-500">Orçamento nº {o.numero}</p>
              <p className="text-lg font-semibold">Para {o.cliente.nome || 'você'}</p>
            </div>
            <div className="text-sm text-grafite-500 sm:text-right">
              <p>Emitido em {new Date(o.criadoEm).toLocaleDateString('pt-BR')}</p>
              <p className={vencido ? 'font-medium text-alerta-600' : ''}>
                {vencido ? 'Venceu em ' : 'Válido até '}
                {validade.toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>

          <ul className="mt-4 divide-y divide-areia-200">
            {o.itens.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 py-2 text-sm">
                <div>
                  <p>
                    {item.descricao}
                    {temMaterial && item.tipo === 'material' && <span className="ml-1 text-xs text-grafite-800">(material)</span>}
                  </p>
                  <p className="text-xs text-grafite-500">
                    {formatarQuantidade(item.quantidade)} {item.unidade} × {formatarBRL(item.precoUnitarioCentavos)}
                  </p>
                </div>
                <p className="shrink-0 font-medium">{formatarBRL(subtotalItem(item))}</p>
              </li>
            ))}
          </ul>

          <div className="mt-3 space-y-1 border-t border-areia-300 pt-3 text-sm">
            {totais.desconto > 0 && (
              <>
                <Linha rotulo="Subtotal" valor={formatarBRL(totais.subtotal)} />
                <Linha rotulo="Desconto" valor={`- ${formatarBRL(totais.desconto)}`} />
              </>
            )}
            {totais.deslocamento > 0 && <Linha rotulo="Deslocamento" valor={formatarBRL(totais.deslocamento)} />}
            <div className="flex justify-between pt-1 text-lg font-bold">
              <span>Total</span>
              <span>{formatarBRL(totais.total)}</span>
            </div>
          </div>
        </section>

        <section className="card space-y-3 text-sm">
          <Info titulo="Condições de pagamento" texto={o.condicoesPagamento} />
          <Info titulo="Prazo de execução" texto={o.prazoExecucao} />
          <Info titulo="Garantia" texto={o.garantia} />
          <Info titulo="Observações" texto={o.observacoes} />
        </section>

        {/* Só mostra a resposta depois que o servidor confirmou a gravação.
            Antes disso, fechar a página poderia perder a aprovação. */}
        {dados.resposta && !enviando ? (
          <section
            className={`card text-center ${dados.resposta === 'aprovado' ? 'border-aprovado-100 bg-aprovado-50' : 'border-areia-400'}`}
          >
            <p className="text-lg font-semibold">
              {dados.resposta === 'aprovado' ? '✅ Orçamento aprovado' : 'Orçamento recusado'}
            </p>
            {dados.respondidoEm && (
              <p className="text-sm text-grafite-600">
                {dados.nomeResposta ? `Por ${dados.nomeResposta}, em ` : 'Em '}
                {new Date(dados.respondidoEm).toLocaleString('pt-BR')}
              </p>
            )}
            {avisoWhatsApp && (
              <a href={avisoWhatsApp} target="_blank" rel="noreferrer" className="btn-whatsapp mt-3 w-full">
                {dados.resposta === 'aprovado' ? 'Combinar o início pelo WhatsApp' : 'Falar pelo WhatsApp'}
              </a>
            )}
          </section>
        ) : (
          <section className="card space-y-3">
            {confirmando ? (
              <>
                <p className="font-semibold">
                  {confirmando === 'aprovado' ? 'Confirmar aprovação do orçamento?' : 'Confirmar recusa do orçamento?'}
                </p>
                <div>
                  <label htmlFor="nome-resposta">Seu nome</label>
                  <input id="nome-resposta" value={nome} maxLength={100} onChange={(e) => setNome(e.target.value)} />
                </div>
                {falha && <p className="text-sm text-alerta-600">{falha}</p>}
                <div className="flex gap-2">
                  <button className="btn-secondary flex-1" disabled={enviando} onClick={() => setConfirmando(null)}>
                    Voltar
                  </button>
                  <button
                    className={`${confirmando === 'aprovado' ? 'btn-whatsapp' : 'btn-secondary !text-alerta-600'} flex-1`}
                    disabled={enviando}
                    onClick={() => responder(confirmando)}
                  >
                    {enviando ? 'Enviando...' : 'Confirmar'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <button className="btn-whatsapp w-full !py-3 text-lg" onClick={() => setConfirmando('aprovado')}>
                  Aprovar orçamento
                </button>
                <div className="flex gap-2">
                  {avisoWhatsApp && (
                    <a href={avisoWhatsApp} target="_blank" rel="noreferrer" className="btn-secondary flex-1">
                      Tirar dúvida
                    </a>
                  )}
                  <button className="btn-secondary flex-1 !text-grafite-600" onClick={() => setConfirmando('recusado')}>
                    Recusar
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {pix && (
          <section className="card flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            {qr && <img src={qr} alt="QR Code Pix" className="h-40 w-40 shrink-0" />}
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-semibold">Pagar com Pix</p>
              {pix.valorCentavos > 0 && (
                <p className="text-xl font-bold">
                  {formatarBRL(pix.valorCentavos)}
                  {pix.valorCentavos < totais.total && <span className="ml-1 text-sm font-normal text-grafite-500">(entrada)</span>}
                </p>
              )}
              <p className="text-sm text-grafite-600">Aponte a câmera do app do banco para o QR Code ou copie o código.</p>
              <button
                className="btn-primary w-full"
                onClick={async () => {
                  await navigator.clipboard.writeText(pix.codigo)
                  setCopiado(true)
                  setTimeout(() => setCopiado(false), 2500)
                }}
              >
                {copiado ? 'Código copiado ✓' : 'Copiar código Pix'}
              </button>
            </div>
          </section>
        )}

        <button className="btn-secondary w-full" disabled={baixando} onClick={baixarPdf}>
          {baixando ? 'Gerando PDF...' : 'Baixar orçamento em PDF'}
        </button>

        <a href="/" className="flex items-center justify-center gap-2 pt-6 text-xs text-grafite-500">
          <Simbolo tamanho={20} />
          <span>
            Feito com <strong className="text-grafite-800">{APP_NOME}</strong>. Crie seus orçamentos grátis.
          </span>
        </a>
      </main>
    </div>
  )
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-grafite-600">{rotulo}</span>
      <span>{valor}</span>
    </div>
  )
}

function Info({ titulo, texto }: { titulo: string; texto: string }) {
  if (!texto.trim()) return null
  return (
    <div>
      <p className="text-xs font-semibold text-grafite-500 uppercase">{titulo}</p>
      <p className="whitespace-pre-line">{texto}</p>
    </div>
  )
}
