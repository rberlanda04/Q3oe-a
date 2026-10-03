/**
 * Apaga uma conta de teste e todos os dados dela, entrando como a própria conta.
 * As regras do Firestore permitem que o dono apague tudo o que é dele.
 * Usado pelo teste de ponta a ponta quando ele falha antes de excluir a conta pelo app.
 */
import { initializeApp } from 'firebase/app'
import { deleteUser, getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { collection, deleteDoc, doc, getDocs, getFirestore, query, where } from 'firebase/firestore'

export async function limparContaDeTeste(email, senha) {
  if (!email.startsWith('teste-automatizado')) throw new Error('Por segurança, só apaga contas de teste.')
  const app = initializeApp(
    { apiKey: 'AIzaSyBdjEcOdEoNIuenwzbYsTnfF2ZF_OkrtjA', authDomain: 'q3orca.firebaseapp.com', projectId: 'q3orca' },
    `limpeza-${Date.now()}`,
  )
  const auth = getAuth(app)
  const db = getFirestore(app)
  let user
  try {
    user = (await signInWithEmailAndPassword(auth, email, senha)).user
  } catch {
    console.log('Conta de teste não existe (nada a limpar).')
    return
  }
  let apagados = 0
  const apagar = async (ref) => {
    await deleteDoc(ref)
    apagados++
  }
  for (const sub of ['orcamentos', 'clientes', 'catalogo']) {
    for (const d of (await getDocs(collection(db, 'users', user.uid, sub))).docs) await apagar(d.ref)
  }
  for (const d of (await getDocs(query(collection(db, 'compartilhamentos'), where('uid', '==', user.uid)))).docs) await apagar(d.ref)
  for (const chamado of (await getDocs(query(collection(db, 'suporte'), where('uid', '==', user.uid)))).docs) {
    for (const m of (await getDocs(collection(db, 'suporte', chamado.id, 'mensagens'))).docs) await apagar(m.ref)
    await apagar(chamado.ref)
  }
  await deleteDoc(doc(db, 'interesses', user.uid)).catch(() => {})
  await apagar(doc(db, 'users', user.uid))
  await deleteUser(user)
  console.log(`Conta de teste ${email} apagada, com ${apagados} documentos.`)
}
