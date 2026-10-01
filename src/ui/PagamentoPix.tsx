import { FirebaseError } from 'firebase/app'
import { useEffect, useState } from 'react'
import { formatarBRL } from '../domain/money'
import { conferirPagamento, gerarPixDoPro, ouvirPagamento, type CobrancaPix, type StatusPagamento } from '../lib/pagamentos'
import { registrarEvento } from '../lib/eventos'
import { IconeCheck, IconeCopiar, IconePix } from './Icones'

interface Props {
  periodo: 'mensal' | 'anual'
  /** Renovação: o período novo soma à validade atual. */
  renovacao: boolean
  onFechar: () => void
}

type Estado = 'gerando' | 'aguardando' | 'pago' | 'expirado' | 'erro'

function mensagemErro(e: unknown): string {
  if (e instanceof FirebaseError && e.message && !e.message.startsWith('internal')) return e.message
  return 'Não foi possível gerar o Pix agora. Tente de novo em instantes.'
}

/** Pagamento do Pro por Pix (AbacatePay): QR Code, copia-e-cola e confirmação automática. */
export function PagamentoPix({ periodo, renovacao, onFechar }: Props) {
  const [cobranca, setCobranca] = useState<CobrancaPix | null>(null)
  const [estado, setEstado] = useState<Estado>('gerando')
  const [erro, setErro] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [conferindo, setConferindo] = useState(false)
  const [agora, setAgora] = useState(() => Date.now())
  const [tentativa, setTentativa] = useState(0)

  // Gera (ou reaproveita) o Pix no servidor.
  useEffect(() => {
    let ativo = true
    gerarPixDoPro(periodo)
      .then((c) => {
        if (!ativo) return
        setCobranca(c)
        setEstado('aguardando')
      })
      .catch((e) => {
        if (!ativo) return
        console.error(e)
        setErro(mensagemErro(e))
        setEstado('erro')
      })
    return () => {
      ativo = false
    }
  }, [periodo, tentativa])

  // O webhook da AbacatePay marca o pagamento; a tela acompanha em tempo real.
  useEffect(() => {
    if (!cobranca) return
    return ouvirPagamento(cobranca.id, (status: StatusPagamento) => {
      if (status === 'PAID') {
        setEstado('pago')
        registrarEvento('pro_pedido', { plano: periodo, forma: 'pix_pago' })
      }
    })
  }, [cobranca, periodo])

  // Contagem regressiva e, a cada 15 segundos, uma conferência direta na AbacatePay.
  useEffect(() => {
    if (estado !== 'aguardando' || !cobranca) return
    const relogio = setInterval(() => setAgora(Date.now()), 1000)
    const conferencia = setInterval(() => {
      conferirPagamento(cobranca.id)
        .then((r) => {
          if (r.status === 'PAID') setEstado('pago')
          if (r.status === 'EXPIRED') setEstado('expirado')
        })
        .catch(() => {})
    }, 15000)
    return () => {
      clearInterval(relogio)
      clearInterval(conferencia)
    }
  }, [estado, cobranca])

  const restante = cobranca ? Math.max(cobranca.expiraEm - agora, 0) : 0
  // Quando a contagem chega a zero, o Pix é tratado como expirado.
  const situacao: Estado = estado === 'aguardando' && cobranca && restante === 0 ? 'expirado' : estado

  async function jaPaguei() {
    if (!cobranca) return
    setConferindo(true)
    try {
      const r = await conferirPagamento(cobranca.id)
      if (r.status === 'PAID') setEstado('pago')
      else setErro('Ainda não recebemos o pagamento. Pode levar alguns segundos depois de pagar.')
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setConferindo(false)
    }
  }

  const minutos = Math.floor(restante / 60000)
  const segundos = Math.floor((restante % 60000) / 1000)

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-grafite-950/60 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Pagamento por Pix">
      <div className="max-h-dvh w-full max-w-md overflow-y-auto rounded-t-[2rem] bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-flutuante sm:rounded-[2rem]">
        {situacao === 'pago' ? (
          <div className="space-y-4 py-6 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-aprovado-500 text-white">
              <IconeCheck tamanho={32} strokeWidth={3} />
            </span>
            <h2 className="text-2xl font-extrabold">Pagamento confirmado!</h2>
            <p className="text-grafite-600">
              {renovacao ? 'Seu Pro foi renovado.' : 'Seu Pro está ativo.'} Seu logo e sua marca já aparecem nos documentos.
            </p>
            <button className="btn-primary w-full" onClick={onFechar}>
              Continuar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="rotulo !text-brasa-700">{renovacao ? 'Renovar' : 'Assinar'} o Pro · {periodo}</p>
                <h2 className="mt-1 flex items-center gap-2 text-2xl font-extrabold">
                  <IconePix tamanho={24} className="text-aprovado-600" /> Pague com Pix
                </h2>
              </div>
              <button className="rounded-full px-3 py-1 text-sm text-grafite-500 hover:bg-areia-100" onClick={onFechar}>
                Fechar
              </button>
            </div>

            {situacao === 'gerando' && <p className="py-10 text-center text-grafite-500">Gerando seu Pix...</p>}

            {situacao === 'erro' && (
              <div className="space-y-3 py-4 text-center">
                <p className="text-alerta-600">{erro}</p>
                <button className="btn-secondary" onClick={() => { setErro(''); setEstado('gerando'); setTentativa((t) => t + 1) }}>
                  Tentar de novo
                </button>
              </div>
            )}

            {situacao === 'expirado' && (
              <div className="space-y-3 py-4 text-center">
                <p className="text-grafite-700">Este Pix expirou. Gere um novo para continuar.</p>
                <button className="btn-primary" onClick={() => { setCobranca(null); setEstado('gerando'); setTentativa((t) => t + 1) }}>
                  Gerar novo Pix
                </button>
              </div>
            )}

            {situacao === 'aguardando' && cobranca && (
              <>
                <p className="text-center font-display text-3xl font-extrabold">{formatarBRL(cobranca.valorCentavos)}</p>
                <img src={cobranca.brCodeBase64} alt="QR Code Pix para pagamento" className="mx-auto h-56 w-56 rounded-xl border border-areia-200 p-2" />
                <p className="text-center text-sm text-grafite-600">Abra o app do seu banco, escolha Pix e aponte a câmera, ou copie o código.</p>
                <button
                  className="btn-escuro w-full"
                  onClick={async () => {
                    await navigator.clipboard.writeText(cobranca.brCode)
                    setCopiado(true)
                    setTimeout(() => setCopiado(false), 2500)
                  }}
                >
                  <IconeCopiar tamanho={18} /> {copiado ? 'Código copiado!' : 'Copiar código Pix'}
                </button>
                <div className="flex items-center justify-between rounded-xl bg-areia-100 px-4 py-3 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-regua-400" /> Aguardando pagamento
                  </span>
                  <span className="font-mono tabular-nums text-grafite-500">
                    {minutos}:{String(segundos).padStart(2, '0')}
                  </span>
                </div>
                <button className="btn-secondary w-full" disabled={conferindo} onClick={jaPaguei}>
                  {conferindo ? 'Conferindo...' : 'Já paguei'}
                </button>
                {erro && <p className="text-center text-sm text-grafite-600">{erro}</p>}
                <p className="text-center text-xs text-grafite-400">Pagamento processado pela AbacatePay. A confirmação é automática.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
