/**
 * Teste de ponta a ponta do pagamento Pix do Pro, nos emuladores do Firebase,
 * com uma AbacatePay simulada (nenhuma chamada sai para a internet).
 *
 * Rode com: npm run test:pagamento   (requer Java 11+)
 */
import { createHmac } from 'node:crypto'
import { createServer } from 'node:http'
import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import { connectFirestoreEmulator, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore'
import { connectFunctionsEmulator, getFunctions, httpsCallable } from 'firebase/functions'

const CHAVE_PUBLICA =
  't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9'
const PROJETO = 'demo-q3orca'
const URL_WEBHOOK = `http://127.0.0.1:5001/${PROJETO}/southamerica-east1/webhookAbacatePay`
const DIA = 24 * 60 * 60 * 1000

/* ---------- AbacatePay simulada (porta 4999) ---------- */
const cobrancas = new Map()
let contador = 0
const abacate = createServer((req, res) => {
  const url = new URL(req.url, 'http://x')
  let corpo = ''
  req.on('data', (c) => (corpo += c))
  req.on('end', () => {
    const responder = (dados) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ success: true, error: null, data: dados }))
    }
    if (req.headers.authorization !== 'Bearer chave-de-teste') {
      res.writeHead(401).end(JSON.stringify({ success: false, error: 'Unauthorized', data: null }))
      return
    }
    if (url.pathname === '/v2/transparents/create') {
      const pedido = JSON.parse(corpo)
      const id = `pix_char_teste${++contador}`
      cobrancas.set(id, { id, status: 'PENDING', amount: pedido.data.amount })
      responder({ id, amount: pedido.data.amount, status: 'PENDING', devMode: true, brCode: '00020126PIXTESTE', brCodeBase64: 'data:image/png;base64,AAAA', expiresAt: new Date(Date.now() + 3600e3).toISOString(), metadata: pedido.data.metadata })
    } else if (url.pathname === '/v2/transparents/check') {
      responder(cobrancas.get(url.searchParams.get('id')) ?? { status: 'EXPIRED' })
    } else {
      res.writeHead(404).end('{}')
    }
  })
})
await new Promise((r) => abacate.listen(4999, '127.0.0.1', r))

/* ---------- App conectado aos emuladores ---------- */
const app = initializeApp({ apiKey: 'chave-falsa', projectId: PROJETO, authDomain: `${PROJETO}.firebaseapp.com` })
const auth = getAuth(app)
connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
const db = getFirestore(app)
connectFirestoreEmulator(db, '127.0.0.1', 8080)
const funcoes = getFunctions(app, 'southamerica-east1')
connectFunctionsEmulator(funcoes, '127.0.0.1', 5001)
const criar = httpsCallable(funcoes, 'criarCobrancaPix')
const verificar = httpsCallable(funcoes, 'verificarPagamento')

let ok = 0
let falhas = 0
function confere(nome, condicao, detalhe = '') {
  if (condicao) {
    ok++
    console.log('OK   ', nome)
  } else {
    falhas++
    console.log('FALHA', nome, detalhe)
  }
}

async function enviarWebhook(evento, { segredo = 'segredo-de-teste', assinar = true, adulterar = false } = {}) {
  const corpo = JSON.stringify(evento)
  const assinatura = createHmac('sha256', CHAVE_PUBLICA).update(assinar ? corpo : corpo + 'x').digest('base64')
  const enviado = adulterar ? corpo.replace('teste', 'TESTE') : corpo
  const r = await fetch(`${URL_WEBHOOK}?webhookSecret=${segredo}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': assinatura },
    body: enviado,
  })
  return r.status
}

try {
  const { user } = await createUserWithEmailAndPassword(auth, 'pro@teste.com', 'senha-123456')
  await setDoc(doc(db, 'users', user.uid), { nome: 'Marcos Elétrica' })

  // 1. Gerar Pix mensal: o valor vem do servidor.
  const pix = (await criar({ periodo: 'mensal' })).data
  confere('gera Pix com valor do servidor (R$ 14,90)', pix.valorCentavos === 1490 && pix.id.startsWith('pix_char_'))
  const registro = (await getDoc(doc(db, 'pagamentos', pix.id))).data()
  confere('registra o pagamento pendente para o usuário', registro?.uid === user.uid && registro?.status === 'PENDING')

  const repetido = (await criar({ periodo: 'mensal' })).data
  confere('reaproveita o Pix pendente em vez de gerar outro', repetido.id === pix.id)

  try {
    await criar({ periodo: 'vitalicio' })
    confere('recusa plano desconhecido', false)
  } catch (e) {
    confere('recusa plano desconhecido', String(e.code).includes('invalid-argument'))
  }

  // 2. Antes de pagar, "Já paguei" não libera nada.
  const antes = (await verificar({ id: pix.id })).data
  confere('não libera o Pro antes do pagamento', antes.status === 'PENDING')

  // 3. Cliente paga; o botão "Já paguei" confirma na API e libera.
  cobrancas.get(pix.id).status = 'PAID'
  const depois = (await verificar({ id: pix.id })).data
  const umMes = depois.validoAte - Date.now()
  confere('libera o Pro por cerca de 1 mês após o pagamento', depois.status === 'PAID' && umMes > 27 * DIA && umMes < 32 * DIA)
  const assinatura1 = (await getDoc(doc(db, 'assinaturas', user.uid))).data()
  confere('assinatura gravada como Pro', assinatura1?.plano === 'pro' && assinatura1?.validoAte === depois.validoAte)

  const deNovo = (await verificar({ id: pix.id })).data
  confere('conferir de novo não soma outro mês', deNovo.validoAte === depois.validoAte)

  // 4. Renovação anual pelo webhook: soma 12 meses ao fim do período atual.
  const anual = (await criar({ periodo: 'anual' })).data
  confere('Pix anual custa R$ 99', anual.valorCentavos === 9900)
  cobrancas.get(anual.id).status = 'PAID'
  const evento = { id: 'log_1', event: 'transparent.completed', devMode: true, data: { id: anual.id, status: 'PAID' } }

  confere('webhook com segredo errado é recusado', (await enviarWebhook(evento, { segredo: 'errado' })) === 401)
  confere('webhook com assinatura inválida é recusado', (await enviarWebhook(evento, { assinar: false })) === 401)
  confere('webhook com corpo adulterado é recusado', (await enviarWebhook(evento, { adulterar: true })) === 401)
  const semRenovar = (await getDoc(doc(db, 'assinaturas', user.uid))).data()
  confere('webhooks recusados não mexem na assinatura', semRenovar?.validoAte === depois.validoAte)

  confere('webhook válido é aceito', (await enviarWebhook(evento)) === 200)
  const assinatura2 = (await getDoc(doc(db, 'assinaturas', user.uid))).data()
  const somado = assinatura2.validoAte - depois.validoAte
  confere('renovação soma 12 meses ao período já pago', somado > 364 * DIA && somado < 367 * DIA, `(${Math.round(somado / DIA)} dias)`)

  confere('webhook repetido também é aceito', (await enviarWebhook(evento)) === 200)
  const assinatura3 = (await getDoc(doc(db, 'assinaturas', user.uid))).data()
  confere('webhook repetido não soma de novo', assinatura3.validoAte === assinatura2.validoAte)

  // 5. Evento de Pix que a API diz não estar pago não libera nada.
  const golpe = (await criar({ periodo: 'mensal' })).data
  await enviarWebhook({ event: 'transparent.completed', data: { id: golpe.id } })
  const assinatura4 = (await getDoc(doc(db, 'assinaturas', user.uid))).data()
  confere('evento de Pix não pago (conferido na API) não libera', assinatura4.validoAte === assinatura2.validoAte)
} catch (e) {
  falhas++
  console.log('FALHA inesperada', e)
} finally {
  console.log(`\n${ok} verificações passaram, ${falhas} falharam.`)
  abacate.close()
  process.exit(falhas ? 1 : 0)
}
