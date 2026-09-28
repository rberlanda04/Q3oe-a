import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { registrarEvento } from '../lib/eventos'
import { auth } from '../lib/firebase'
import { IconeCheck } from '../ui/Icones'
import { Logo } from '../ui/Logo'
import { Regua } from '../ui/Regua'

const MENSAGENS: Record<string, string> = {
  'auth/invalid-credential': 'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'Este e-mail já tem conta. Use "Entrar".',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/invalid-email': 'E-mail inválido.',
  'auth/popup-closed-by-user': 'A janela do Google foi fechada antes de concluir.',
  'auth/network-request-failed': 'Sem conexão com a internet.',
  'auth/operation-not-allowed': 'Este método de login ainda não foi ativado no Firebase.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
}

function mensagemErro(erro: unknown): string {
  if (erro instanceof FirebaseError) return MENSAGENS[erro.code] ?? `Não foi possível entrar (${erro.code}).`
  return 'Não foi possível entrar.'
}

function IconeGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export function Login() {
  const [parametros] = useSearchParams()
  const [modo, setModo] = useState<'entrar' | 'criar'>(parametros.get('modo') === 'criar' ? 'criar' : 'entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function executar(acao: () => Promise<unknown>) {
    setErro('')
    setAviso('')
    setEnviando(true)
    try {
      await acao()
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setEnviando(false)
    }
  }

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    executar(() =>
      modo === 'entrar'
        ? signInWithEmailAndPassword(auth, email, senha)
        : createUserWithEmailAndPassword(auth, email, senha).then(() => registrarEvento('conta_criada', { metodo: 'email' })),
    )
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-grafite-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link to="/">
          <Logo tamanho={36} claro />
        </Link>
        <div className="relative z-10 max-w-md">
          <p className="font-display text-5xl leading-[1.05] font-extrabold">
            Monta. Manda. <span className="text-brasa-400">Recebe.</span>
          </p>
          <ul className="mt-8 space-y-3 text-grafite-200">
            {[
              'Orçamento profissional em 2 minutos',
              'Cliente aprova pelo link, sem baixar nada',
              'QR Code Pix e recibo prontos',
            ].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-aprovado-500">
                  <IconeCheck tamanho={14} strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-sm text-grafite-400">Grátis para começar. Sem cartão de crédito.</p>
        <Regua />
      </aside>

      <main className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 flex justify-center lg:hidden">
            <Logo tamanho={40} />
          </Link>
          <h1 className="text-3xl font-extrabold">{modo === 'entrar' ? 'Que bom te ver!' : 'Crie sua conta grátis'}</h1>
          <p className="mt-1 text-grafite-500">
            {modo === 'entrar' ? 'Entre para ver seus orçamentos.' : 'Seu primeiro orçamento sai em 2 minutos.'}
          </p>

          <div className="mt-8 space-y-4">
            <p className="text-center text-xs text-grafite-500">
              Entrando com Google, você concorda com os <Link to="/termos" className="underline">Termos</Link> e a{' '}
              <Link to="/privacidade" className="underline">Privacidade</Link>.
            </p>
            <button
              className="btn-secondary w-full"
              disabled={enviando}
              onClick={() =>
                executar(async () => {
                  const resultado = await signInWithPopup(auth, new GoogleAuthProvider())
                  if (getAdditionalUserInfo(resultado)?.isNewUser) registrarEvento('conta_criada', { metodo: 'google' })
                })
              }
            >
              <IconeGoogle /> Entrar com Google
            </button>

            <div className="flex items-center gap-3 text-xs font-semibold text-grafite-400">
              <span className="h-px flex-1 bg-areia-300" /> OU <span className="h-px flex-1 bg-areia-300" />
            </div>

            <form onSubmit={enviar} className="space-y-4">
              <div>
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="senha">Senha</label>
                <input
                  id="senha"
                  type="password"
                  autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  placeholder={modo === 'criar' ? 'Mínimo de 6 caracteres' : ''}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
              {erro && <p className="rounded-xl bg-alerta-50 px-3 py-2 text-sm text-alerta-600">{erro}</p>}
              {aviso && <p className="rounded-xl bg-aprovado-50 px-3 py-2 text-sm text-aprovado-700">{aviso}</p>}
              <button className="btn-primary w-full" disabled={enviando}>
                {modo === 'entrar' ? 'Entrar' : 'Criar conta grátis'}
              </button>
              {modo === 'criar' && (
                <p className="text-center text-xs text-grafite-500">
                  Ao criar a conta, você concorda com os{' '}
                  <Link to="/termos" className="font-semibold text-grafite-700 underline">
                    Termos de uso
                  </Link>{' '}
                  e a{' '}
                  <Link to="/privacidade" className="font-semibold text-grafite-700 underline">
                    Política de privacidade
                  </Link>
                  .
                </p>
              )}
            </form>

            <div className="flex justify-between text-sm">
              <button className="font-semibold text-brasa-700" onClick={() => setModo(modo === 'entrar' ? 'criar' : 'entrar')}>
                {modo === 'entrar' ? 'Criar conta' : 'Já tenho conta'}
              </button>
              {modo === 'entrar' && (
                <button
                  className="text-grafite-500"
                  onClick={() => {
                    if (!email) return setErro('Digite seu e-mail para recuperar a senha.')
                    executar(async () => {
                      await sendPasswordResetEmail(auth, email)
                      setAviso('Enviamos um link de recuperação para seu e-mail.')
                    })
                  }}
                >
                  Esqueci a senha
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
