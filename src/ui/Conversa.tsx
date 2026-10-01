import { useEffect, useRef, useState, type FormEvent } from 'react'
import { atualizarChamado, enviarMensagemSuporte, ouvirMensagens, type Chamado, type MensagemSuporte } from '../data/repo'

export const CATEGORIAS = {
  duvida: 'Dúvida',
  problema: 'Algo não funciona',
  pagamento: 'Pagamento e plano',
  sugestao: 'Sugestão',
} as const

export const STATUS_CHAMADO = {
  aberto: { rotulo: 'Aguardando equipe', classe: 'bg-regua-300 text-grafite-900' },
  respondido: { rotulo: 'Respondido', classe: 'bg-aprovado-100 text-aprovado-700' },
  resolvido: { rotulo: 'Resolvido', classe: 'bg-areia-200 text-grafite-700' },
} as const

interface Props {
  chamado: Chamado
  /** Quem está escrevendo nesta tela. */
  lado: 'usuario' | 'equipe'
  nome: string
}

/** Conversa de um chamado de suporte, usada pelo profissional e pela equipe. */
export function Conversa({ chamado, lado, nome }: Props) {
  const [mensagens, setMensagens] = useState<MensagemSuporte[] | null>(null)
  const [texto, setTexto] = useState('')
  const fim = useRef<HTMLDivElement>(null)

  useEffect(() => ouvirMensagens(chamado.id, setMensagens), [chamado.id])

  // Quem abre a conversa marca as mensagens do outro lado como lidas.
  const naoLido = lado === 'usuario' ? chamado.naoLidoUsuario : chamado.naoLidoEquipe
  useEffect(() => {
    if (naoLido) atualizarChamado(chamado.id, lado === 'usuario' ? { naoLidoUsuario: false } : { naoLidoEquipe: false })
  }, [naoLido, chamado.id, lado])

  useEffect(() => {
    fim.current?.scrollIntoView({ block: 'end' })
  }, [mensagens?.length])

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return
    enviarMensagemSuporte(chamado.id, lado, nome, texto)
    setTexto('')
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {(mensagens ?? []).map((m) => {
          const minha = m.autor === lado
          return (
            <li key={m.id} className={`flex ${minha ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  minha ? 'rounded-br-md bg-grafite-900 text-white' : 'rounded-bl-md border border-areia-200 bg-white'
                }`}
              >
                <p className={`text-xs font-semibold ${minha ? 'text-grafite-300' : 'text-brasa-700'}`}>
                  {m.autor === 'equipe' ? 'Equipe Q3 Orça' : m.nome || 'Você'} · {new Date(m.em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                </p>
                <p className="mt-1 whitespace-pre-line">{m.texto}</p>
              </div>
            </li>
          )
        })}
        {mensagens === null && <li className="text-center text-sm text-grafite-500">Carregando conversa...</li>}
      </ol>
      <div ref={fim} />

      <form onSubmit={enviar} className="card space-y-3 !p-4">
        <label htmlFor="resposta">{lado === 'usuario' ? 'Escreva para a equipe' : 'Responder ao profissional'}</label>
        <textarea id="resposta" rows={3} maxLength={4000} value={texto} onChange={(e) => setTexto(e.target.value)} />
        <div className="flex flex-wrap items-center justify-between gap-2">
          {chamado.status === 'resolvido' ? (
            <button type="button" className="text-sm font-semibold text-grafite-500 underline" onClick={() => atualizarChamado(chamado.id, { status: 'aberto' })}>
              Reabrir chamado
            </button>
          ) : (
            <button type="button" className="text-sm font-semibold text-grafite-500 underline" onClick={() => atualizarChamado(chamado.id, { status: 'resolvido' })}>
              Marcar como resolvido
            </button>
          )}
          <button className="btn-primary !py-2.5" disabled={!texto.trim()}>
            Enviar
          </button>
        </div>
      </form>
    </div>
  )
}
