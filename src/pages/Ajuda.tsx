import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { EMAIL_CONTATO, WHATSAPP_SUPORTE } from '../config'
import { abrirChamado, mensagemErroLeitura, ouvirChamado, ouvirMeusChamados, type CategoriaSuporte, type Chamado } from '../data/repo'
import { useUsuario } from '../lib/auth'
import { linkWhatsApp } from '../pdf/compartilhar'
import { CATEGORIAS, Conversa, STATUS_CHAMADO } from '../ui/Conversa'
import { IconeVoltar, IconeWhatsApp } from '../ui/Icones'

const PERGUNTAS: [string, string][] = [
  ['Como mando o orçamento pelo WhatsApp?', 'No orçamento, toque em "Enviar PDF" para anexar o arquivo ou em "Enviar link" para o cliente aprovar pelo celular.'],
  ['O cliente aprovou e o status não mudou.', 'A aprovação aparece sozinha quando o app está aberto e com internet. Abra a lista de orçamentos para sincronizar.'],
  ['Meu QR Code Pix não funciona no banco.', 'Em "Meus dados", confira a chave Pix e o tipo dela. Um celular salvo como CPF, por exemplo, gera um código que o banco recusa.'],
  ['Como coloco meu logo?', 'Em "Meus dados", na seção "Sua marca". O logo aparece nos documentos durante o teste e no plano Pro.'],
  ['Como cancelo o Pro?', 'O Pro por Pix não renova sozinho: basta não renovar. Se pagou há menos de 7 dias, peça o reembolso por aqui.'],
]

/** Central de ajuda: dúvidas comuns, novo chamado e lista dos chamados do profissional. */
export function Ajuda() {
  const { user, perfil } = useUsuario()
  const navegar = useNavigate()
  const [chamados, setChamados] = useState<Chamado[] | null>(null)
  const [erro, setErro] = useState('')
  // "Dar opinião" abre esta tela com ?categoria=sugestao, já pronta para escrever.
  const [parametros] = useSearchParams()
  const categoriaInicial = parametros.get('categoria')
  const [categoria, setCategoria] = useState<CategoriaSuporte>(
    categoriaInicial && categoriaInicial in CATEGORIAS ? (categoriaInicial as CategoriaSuporte) : 'duvida',
  )
  const [assunto, setAssunto] = useState(categoriaInicial === 'sugestao' ? 'Opinião sobre o Q3 Orça (beta)' : '')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => ouvirMeusChamados(user.uid, setChamados, (e) => setErro(mensagemErroLeitura(e))), [user.uid])

  function enviar(e: FormEvent) {
    e.preventDefault()
    if (!assunto.trim() || !mensagem.trim()) return
    const id = abrirChamado(user.uid, { nome: perfil.nome, email: user.email ?? perfil.email, assunto, categoria, mensagem })
    navegar(`/ajuda/${id}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Central de ajuda</h1>
        <p className="mt-1 text-grafite-600">Tire sua dúvida aqui ou fale com a equipe. Respondemos em horário comercial.</p>
      </div>

      <section className="space-y-2">
        {PERGUNTAS.map(([p, r]) => (
          <details key={p} className="group card !p-0 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 font-semibold">
              {p}
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-areia-200 transition group-open:rotate-45">+</span>
            </summary>
            <p className="px-5 pb-4 text-grafite-600">{r}</p>
          </details>
        ))}
      </section>

      <form onSubmit={enviar} className="card space-y-4">
        <h2 className="text-lg font-bold">Falar com a equipe</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <div>
            <label htmlFor="categoria">Assunto é sobre</label>
            <select id="categoria" value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaSuporte)}>
              {Object.entries(CATEGORIAS).map(([id, rotulo]) => (
                <option key={id} value={id}>
                  {rotulo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="assunto">Resumo</label>
            <input id="assunto" maxLength={120} placeholder="Ex.: o PDF não abre no meu celular" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
          </div>
        </div>
        <div>
          <label htmlFor="mensagem">{categoria === 'sugestao' ? 'O que você achou? O que falta ou atrapalha?' : 'Conte o que aconteceu'}</label>
          <textarea id="mensagem" rows={4} maxLength={4000} value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
        </div>
        <button className="btn-primary w-full" disabled={!assunto.trim() || !mensagem.trim()}>
          Enviar para a equipe
        </button>
        {(WHATSAPP_SUPORTE || EMAIL_CONTATO) && (
          <p className="flex flex-wrap items-center justify-center gap-3 text-sm text-grafite-500">
            Prefere outro canal?
            {WHATSAPP_SUPORTE && (
              <a className="inline-flex items-center gap-1 font-semibold text-aprovado-700" href={linkWhatsApp(WHATSAPP_SUPORTE, 'Olá! Preciso de ajuda com o Q3 Orça.')} target="_blank" rel="noreferrer">
                <IconeWhatsApp tamanho={16} /> WhatsApp
              </a>
            )}
            {EMAIL_CONTATO && (
              <a className="font-semibold text-brasa-700" href={`mailto:${EMAIL_CONTATO}`}>
                {EMAIL_CONTATO}
              </a>
            )}
          </p>
        )}
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-bold">Suas solicitações</h2>
        {erro ? (
          <p className="card text-alerta-600">{erro}</p>
        ) : chamados === null ? (
          <p className="text-grafite-500">Carregando...</p>
        ) : chamados.length === 0 ? (
          <p className="card text-center text-grafite-500">Você ainda não abriu nenhuma solicitação.</p>
        ) : (
          <ul className="space-y-2">
            {chamados.map((c) => (
              <li key={c.id}>
                <Link to={`/ajuda/${c.id}`} className="card flex items-center justify-between gap-3 !p-4 hover:border-brasa-200">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-semibold">
                      {c.naoLidoUsuario && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brasa-500" aria-label="Resposta nova" />}
                      {c.assunto}
                    </p>
                    <p className="text-sm text-grafite-500">
                      {CATEGORIAS[c.categoria]} · {new Date(c.atualizadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CHAMADO[c.status].classe}`}>{STATUS_CHAMADO[c.status].rotulo}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

/** Um chamado aberto pelo profissional: /ajuda/:id */
export function ChamadoUsuario() {
  const { id = '' } = useParams()
  const { perfil } = useUsuario()
  const [chamado, setChamado] = useState<Chamado | null | undefined>(undefined)

  useEffect(() => ouvirChamado(id, setChamado, () => setChamado(null)), [id])

  return (
    <div className="space-y-5">
      <Link to="/ajuda" className="inline-flex items-center gap-1.5 text-sm font-semibold text-grafite-500 hover:text-brasa-700">
        <IconeVoltar tamanho={16} /> Central de ajuda
      </Link>
      {chamado === undefined ? (
        <p className="text-grafite-500">Carregando...</p>
      ) : chamado === null ? (
        <p className="card text-center">Solicitação não encontrada.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="rotulo">{CATEGORIAS[chamado.categoria]}</p>
              <h1 className="text-2xl font-extrabold">{chamado.assunto}</h1>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_CHAMADO[chamado.status].classe}`}>{STATUS_CHAMADO[chamado.status].rotulo}</span>
          </div>
          <Conversa chamado={chamado} lado="usuario" nome={perfil.nome} />
        </>
      )}
    </div>
  )
}
