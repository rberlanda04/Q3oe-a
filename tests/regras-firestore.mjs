/**
 * Testes das regras de segurança do Firestore, no emulador.
 * Requer Java 11+. Rode com: npm run test:regras
 */
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore'
import { readFileSync } from 'node:fs'

const env = await initializeTestEnvironment({
  projectId: 'demo-q3orca',
  firestore: { rules: readFileSync(process.env.REGRAS ?? 'firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
})

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore()
  await setDoc(doc(db, 'admins/admin1'), { nome: 'Admin' })
  await setDoc(doc(db, 'users/ana'), { nome: 'Ana' })
  await setDoc(doc(db, 'compartilhamentos/link1'), {
    id: 'link1', uid: 'ana', orcamento: { id: 'o1' }, perfil: {}, resposta: null, nomeResposta: '', respondidoEm: null, pendenteSync: false, atualizadoEm: 1,
  })
})

const ana = env.authenticatedContext('ana').firestore()
const bia = env.authenticatedContext('bia').firestore()
const adm = env.authenticatedContext('admin1').firestore()
const anonimo = env.unauthenticatedContext().firestore()

let ok = 0
let falhas = 0
async function caso(nome, promessa) {
  try {
    await promessa
    ok++
    console.log('OK   ', nome)
  } catch (e) {
    falhas++
    console.log('FALHA', nome, '-', e.message.split('\n')[0])
  }
}

// Dados do profissional
await caso('dono lê e grava o próprio perfil', assertSucceeds(setDoc(doc(ana, 'users/ana'), { nome: 'Ana 2' }, { merge: true })))
await caso('outro usuário não lê perfil alheio', assertFails(getDoc(doc(bia, 'users/ana'))))
await caso('outro usuário não grava orçamento alheio', assertFails(setDoc(doc(bia, 'users/ana/orcamentos/x'), { a: 1 })))
await caso('anônimo não lê perfil', assertFails(getDoc(doc(anonimo, 'users/ana'))))

// Administração
await caso('ninguém se torna admin pelo app', assertFails(setDoc(doc(bia, 'admins/bia'), { nome: 'Bia' })))
await caso('usuário se promove a Pro: negado', assertFails(setDoc(doc(ana, 'assinaturas/ana'), { plano: 'pro', validoAte: 9e12 })))
await caso('admin ativa Pro', assertSucceeds(setDoc(doc(adm, 'assinaturas/ana'), { plano: 'pro', validoAte: 9e12, nome: 'Ana', email: 'a@x.com' })))
await caso('admin não grava plano inválido', assertFails(setDoc(doc(adm, 'assinaturas/bia'), { plano: 'ouro', validoAte: 1 })))
await caso('dono lê a própria assinatura', assertSucceeds(getDoc(doc(ana, 'assinaturas/ana'))))
await caso('outro usuário não lê assinatura alheia', assertFails(getDoc(doc(bia, 'assinaturas/ana'))))
await caso('admin lista assinaturas', assertSucceeds(getDocs(collection(adm, 'assinaturas'))))

// Pedidos do Pro
const pedido = { uid: 'bia', nome: 'Bia', email: 'b@x.com', telefone: '', plano: 'anual', criadoEm: 1 }
await caso('usuário registra o próprio pedido', assertSucceeds(setDoc(doc(bia, 'interesses/bia'), pedido)))
await caso('pedido com campo extra: negado', assertFails(setDoc(doc(bia, 'interesses/bia'), { ...pedido, desconto: 100 })))
await caso('pedido em nome de outro: negado', assertFails(setDoc(doc(ana, 'interesses/bia'), pedido)))
await caso('usuário comum não lista pedidos', assertFails(getDocs(collection(bia, 'interesses'))))
await caso('admin lista pedidos', assertSucceeds(getDocs(collection(adm, 'interesses'))))
await caso('usuário apaga o próprio pedido', assertSucceeds(deleteDoc(doc(bia, 'interesses/bia'))))

// Link público
await caso('anônimo abre o link', assertSucceeds(getDoc(doc(anonimo, 'compartilhamentos/link1'))))
await caso('anônimo não lista links', assertFails(getDocs(collection(anonimo, 'compartilhamentos'))))
await caso('usuário não lista links de outros', assertFails(getDocs(query(collection(bia, 'compartilhamentos'), where('uid', '==', 'ana')))))
await caso('dono lista os próprios links', assertSucceeds(getDocs(query(collection(ana, 'compartilhamentos'), where('uid', '==', 'ana')))))
await caso('dono não forja aprovação', assertFails(updateDoc(doc(ana, 'compartilhamentos/link1'), { resposta: 'aprovado' })))
await caso('cliente não altera o valor do orçamento', assertFails(updateDoc(doc(anonimo, 'compartilhamentos/link1'), { orcamento: { id: 'o1', total: 1 } })))
const resposta = { resposta: 'aprovado', nomeResposta: 'Cliente', respondidoEm: 123, pendenteSync: true }
await caso('cliente aprova sem login', assertSucceeds(updateDoc(doc(anonimo, 'compartilhamentos/link1'), resposta)))
await caso('cliente não responde duas vezes', assertFails(updateDoc(doc(anonimo, 'compartilhamentos/link1'), { ...resposta, resposta: 'recusado' })))
await caso('dono marca a resposta como sincronizada', assertSucceeds(updateDoc(doc(ana, 'compartilhamentos/link1'), { pendenteSync: false })))
await caso('outro usuário não apaga o link', assertFails(deleteDoc(doc(bia, 'compartilhamentos/link1'))))
await caso('dono apaga o link', assertSucceeds(deleteDoc(doc(ana, 'compartilhamentos/link1'))))

console.log(`\n${ok} regras confirmadas, ${falhas} falhas.`)
await env.cleanup()
process.exit(falhas ? 1 : 0)
