import { FirebaseError } from 'firebase/app'
import { deleteUser, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, reauthenticateWithPopup } from 'firebase/auth'
import { useState, type FormEvent } from 'react'
import { excluirDadosDaConta } from '../data/repo'
import { clearIndexedDbPersistence, terminate } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { IconeLixeira } from './Icones'

const PALAVRA = 'EXCLUIR'

/**
 * Exclusão definitiva da conta (direito do titular pela LGPD).
 * Confirma a identidade antes, porque o Firebase exige login recente para apagar a conta.
 */
export function ExcluirConta() {
  const usuario = auth.currentUser
  const usaSenha = usuario?.providerData.some((p) => p.providerId === 'password') ?? false
  const [aberto, setAberto] = useState(false)
  const [confirmacao, setConfirmacao] = useState('')
  const [senha, setSenha] = useState('')
  const [etapa, setEtapa] = useState('')
  const [erro, setErro] = useState('')

  async function excluir(evento: FormEvent) {
    evento.preventDefault()
    if (!usuario || confirmacao !== PALAVRA) return
    setErro('')
    try {
      setEtapa('Confirmando sua identidade...')
      if (usaSenha) await reauthenticateWithCredential(usuario, EmailAuthProvider.credential(usuario.email ?? '', senha))
      else await reauthenticateWithPopup(usuario, new GoogleAuthProvider())
      setEtapa('Apagando orçamentos, clientes e itens...')
      await excluirDadosDaConta(usuario.uid)
      setEtapa('Encerrando a conta...')
      await deleteUser(usuario)
      // Apaga também a cópia offline guardada neste aparelho e volta para o site.
      try {
        await terminate(db)
        await clearIndexedDbPersistence(db)
      } catch {
        /* Outra aba aberta pode segurar o cache; ele não é mais acessível sem a conta. */
      }
      window.location.replace('/')
    } catch (e) {
      console.error(e)
      const codigo = e instanceof FirebaseError ? e.code : ''
      setErro(
        codigo === 'auth/invalid-credential' || codigo === 'auth/wrong-password'
          ? 'Senha incorreta.'
          : codigo === 'auth/popup-closed-by-user'
            ? 'A confirmação pelo Google foi cancelada.'
            : codigo === 'auth/network-request-failed' || codigo === 'unavailable'
              ? 'Sem conexão. A exclusão precisa de internet.'
              : 'Não foi possível excluir agora. Tente de novo ou fale com o suporte.',
      )
      setEtapa('')
    }
  }

  if (!aberto) {
    return (
      <button className="flex items-center gap-2 text-sm font-semibold text-alerta-600" onClick={() => setAberto(true)}>
        <IconeLixeira tamanho={16} /> Excluir minha conta
      </button>
    )
  }

  return (
    <form onSubmit={excluir} className="space-y-3 rounded-xl border border-alerta-600/30 bg-alerta-50 p-4">
      <p className="font-semibold text-alerta-600">Excluir conta de forma definitiva</p>
      <p className="text-sm text-grafite-700">
        Todos os seus orçamentos, clientes, itens e links de aprovação serão apagados. Isso não pode ser desfeito. Se quiser, baixe seus dados
        antes.
      </p>
      <div>
        <label htmlFor="confirma-exclusao">
          Digite <strong>{PALAVRA}</strong> para confirmar
        </label>
        <input id="confirma-exclusao" autoComplete="off" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value.toUpperCase())} />
      </div>
      {usaSenha && (
        <div>
          <label htmlFor="senha-exclusao">Sua senha</label>
          <input id="senha-exclusao" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </div>
      )}
      {!usaSenha && <p className="text-xs text-grafite-600">Vamos pedir para você confirmar com o Google.</p>}
      {erro && <p className="text-sm font-medium text-alerta-600">{erro}</p>}
      {etapa && (
        <p role="status" className="text-sm text-grafite-700">
          {etapa}
        </p>
      )}
      <div className="flex gap-2">
        <button type="button" className="btn-secondary flex-1" disabled={Boolean(etapa)} onClick={() => setAberto(false)}>
          Cancelar
        </button>
        <button
          className="btn flex-1 bg-alerta-600 text-white hover:bg-alerta-600/90"
          disabled={confirmacao !== PALAVRA || (usaSenha && !senha) || Boolean(etapa)}
        >
          Excluir tudo
        </button>
      </div>
    </form>
  )
}
