import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { EMAIL_CONTATO, WHATSAPP_SUPORTE } from '../../config'
import { enviarContato } from '../../data/repo'
import { IconeCheck, IconeWhatsApp } from '../../ui/Icones'
import { CabecalhoSite, RodapeSite, useTitulo } from './Moldura'

/** Formulário "Fale conosco" para visitantes, sem login: /contato */
export function Contato() {
  useTitulo('Fale conosco · Q3 Orça')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  // Campo escondido: pessoas não preenchem, robôs de spam costumam preencher.
  const [armadilha, setArmadilha] = useState('')
  const [estado, setEstado] = useState<'livre' | 'enviando' | 'enviado' | 'erro'>('livre')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (armadilha) {
      setEstado('enviado')
      return
    }
    setEstado('enviando')
    try {
      await enviarContato({ nome, email, mensagem })
      setEstado('enviado')
    } catch (erro) {
      console.error(erro)
      setEstado('erro')
    }
  }

  return (
    <div>
      <CabecalhoSite links={false} />
      <main className="mx-auto grid max-w-5xl gap-10 px-5 py-14 md:grid-cols-[1fr_1.2fr]">
        <div>
          <h1 className="text-4xl font-extrabold">Fale conosco</h1>
          <p className="mt-4 text-lg text-grafite-600">
            Dúvida antes de começar, proposta de parceria ou sugestão? Mande uma mensagem e respondemos por e-mail.
          </p>
          <p className="mt-4 text-grafite-600">
            Já tem conta? Use a{' '}
            <Link to="/ajuda" className="font-semibold text-brasa-700">
              central de ajuda
            </Link>{' '}
            dentro do app: a resposta fica junto do seu histórico.
          </p>
          {(WHATSAPP_SUPORTE || EMAIL_CONTATO) && (
            <div className="mt-6 space-y-2">
              {WHATSAPP_SUPORTE && (
                <a className="btn-whatsapp" href={`https://wa.me/${WHATSAPP_SUPORTE}`} target="_blank" rel="noreferrer">
                  <IconeWhatsApp tamanho={18} /> WhatsApp
                </a>
              )}
              {EMAIL_CONTATO && (
                <p>
                  <a className="font-semibold text-brasa-700" href={`mailto:${EMAIL_CONTATO}`}>
                    {EMAIL_CONTATO}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>

        {estado === 'enviado' ? (
          <div className="card flex flex-col items-center gap-3 py-12 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-aprovado-500 text-white">
              <IconeCheck tamanho={28} strokeWidth={3} />
            </span>
            <h2 className="text-2xl font-extrabold">Mensagem enviada!</h2>
            <p className="text-grafite-600">Vamos responder no e-mail {email || 'informado'}.</p>
          </div>
        ) : (
          <form onSubmit={enviar} className="card space-y-4">
            <div>
              <label htmlFor="contato-nome">Seu nome</label>
              <input id="contato-nome" required maxLength={100} value={nome} onChange={(e) => setNome(e.target.value)} />
            </div>
            <div>
              <label htmlFor="contato-email">E-mail para resposta</label>
              <input id="contato-email" type="email" required maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="contato-mensagem">Mensagem</label>
              <textarea id="contato-mensagem" required rows={5} maxLength={2000} value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
            </div>
            <div className="hidden" aria-hidden>
              <label htmlFor="contato-site">Site</label>
              <input id="contato-site" tabIndex={-1} autoComplete="off" value={armadilha} onChange={(e) => setArmadilha(e.target.value)} />
            </div>
            {estado === 'erro' && <p className="text-sm text-alerta-600">Não foi possível enviar. Verifique sua conexão e tente de novo.</p>}
            <button className="btn-primary w-full" disabled={estado === 'enviando'}>
              {estado === 'enviando' ? 'Enviando...' : 'Enviar mensagem'}
            </button>
            <p className="text-xs text-grafite-500">
              Usamos seus dados só para responder. Veja a{' '}
              <Link to="/privacidade" className="underline">
                política de privacidade
              </Link>
              .
            </p>
          </form>
        )}
      </main>
      <RodapeSite />
    </div>
  )
}
