import { useState, type FormEvent } from 'react'
import { totalRecebido } from '../domain/calc'
import { FORMAS_PAGAMENTO, proximoNumeroRecibo } from '../domain/cobranca'
import { formatarBRL } from '../domain/money'
import type { FormaPagamento, Orcamento, Pagamento } from '../domain/types'
import { CampoDinheiro } from './CampoDinheiro'

interface Props {
  orcamento: Orcamento
  total: number
  ocupado: boolean
  onRegistrar: (pagamento: Pagamento) => void
  onReenviar: (pagamento: Pagamento) => void
  onExcluir: (id: string) => void
}

/** Data de hoje no fuso local, no formato do campo de data (AAAA-MM-DD). */
const hoje = () => {
  const d = new Date()
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-')
}

/** Data "AAAA-MM-DD" do campo de data, ao meio-dia local para evitar troca de dia pelo fuso. */
const dataParaMs = (valor: string) => new Date(`${valor}T12:00:00`).getTime()

export function Pagamentos({ orcamento: o, total, ocupado, onRegistrar, onReenviar, onExcluir }: Props) {
  const recebido = totalRecebido(o)
  const saldo = Math.max(total - recebido, 0)
  const [aberto, setAberto] = useState(false)
  const [valor, setValor] = useState(saldo)
  const [forma, setForma] = useState<FormaPagamento>('pix')
  const [data, setData] = useState(hoje())
  const [referente, setReferente] = useState('')

  function abrir() {
    setValor(saldo)
    setData(hoje())
    setReferente('')
    setAberto(true)
  }

  function salvar(evento: FormEvent) {
    evento.preventDefault()
    if (valor <= 0) return
    const quitando = valor >= saldo
    onRegistrar({
      id: crypto.randomUUID(),
      numeroRecibo: proximoNumeroRecibo(o),
      valorCentavos: valor,
      forma,
      data: dataParaMs(data),
      // O texto completa a frase "referente ...", por isso já leva o artigo.
      referente: referente.trim()
        ? `a ${referente.trim()}`
        : recebido === 0 && !quitando
          ? `à entrada dos serviços do orçamento nº ${o.numero}`
          : quitando && recebido > 0
            ? `ao saldo final dos serviços do orçamento nº ${o.numero}`
            : `aos serviços do orçamento nº ${o.numero}`,
    })
    setAberto(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Pagamentos recebidos</span>
        <span className={saldo === 0 && recebido > 0 ? 'font-semibold text-aprovado-700' : 'text-grafite-600'}>
          {saldo === 0 && recebido > 0 ? 'Quitado ✓' : `Falta receber ${formatarBRL(saldo)}`}
        </span>
      </div>

      {o.pagamentos.length > 0 && (
        <ul className="divide-y divide-areia-200 rounded-lg border border-areia-300 text-sm">
          {o.pagamentos.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 px-3 py-2">
              <div>
                <p className="font-medium">
                  {formatarBRL(p.valorCentavos)} · {FORMAS_PAGAMENTO[p.forma]}
                </p>
                <p className="text-xs text-grafite-500">
                  Recibo {p.numeroRecibo} · {new Date(p.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" className="rounded-md px-2 py-1 text-brasa-700 hover:bg-brasa-50" disabled={ocupado} onClick={() => onReenviar(p)}>
                  Recibo
                </button>
                <button
                  type="button"
                  aria-label="Excluir pagamento"
                  className="rounded-md px-2 py-1 text-grafite-400 hover:text-alerta-600"
                  onClick={() => {
                    if (confirm(`Excluir o pagamento de ${formatarBRL(p.valorCentavos)}?`)) onExcluir(p.id)
                  }}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {aberto ? (
        <form onSubmit={salvar} className="space-y-3 rounded-lg border border-aprovado-100 bg-aprovado-50 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="pg-valor">Valor recebido</label>
              <CampoDinheiro id="pg-valor" valor={valor} onChange={setValor} />
            </div>
            <div>
              <label htmlFor="pg-forma">Forma</label>
              <select id="pg-forma" value={forma} onChange={(e) => setForma(e.target.value as FormaPagamento)}>
                {Object.entries(FORMAS_PAGAMENTO).map(([id, rotulo]) => (
                  <option key={id} value={id}>
                    {rotulo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="pg-data">Data</label>
              <input id="pg-data" type="date" required value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div>
              <label htmlFor="pg-ref">Referente a</label>
              <input id="pg-ref" placeholder="Ex.: pintura da sala" value={referente} onChange={(e) => setReferente(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={() => setAberto(false)}>
              Cancelar
            </button>
            <button className="btn-whatsapp flex-1" disabled={valor <= 0 || ocupado}>
              Salvar e enviar recibo
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn-secondary w-full" onClick={abrir}>
          💰 Registrar pagamento e gerar recibo
        </button>
      )}
    </div>
  )
}
