/**
 * Funções do servidor do Q3 Orça: pagamento do Pro por Pix via AbacatePay.
 *
 * Fluxo:
 * 1. O app chama criarCobrancaPix. O servidor define o valor, cria o Pix na
 *    AbacatePay e guarda em pagamentos/{id}.
 * 2. O cliente paga. A AbacatePay avisa o webhookAbacatePay, e o app também
 *    pode chamar verificarPagamento enquanto a tela está aberta.
 * 3. Os dois caminhos reconfirmam o status na API e liberam o Pro numa
 *    transação, somando o período à validade atual (renovação).
 *
 * Segredos (Secret Manager): ABACATEPAY_API_KEY e ABACATEPAY_WEBHOOK_SECRET.
 */
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import { defineSecret } from 'firebase-functions/params'
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https'
import { consultarPix, criarPix, ErroAbacatePay } from './abacatepay.js'
import { emMilissegundos, EVENTOS_PAGAMENTO, extrairIdCobranca, MESES, novaValidade, periodoValido, PRECOS, VALIDADE_PIX_SEGUNDOS, type Periodo } from './negocio.js'
import { assinaturaValida, segredoConfere } from './webhook.js'

initializeApp()
const db = getFirestore()

const CHAVE_API = defineSecret('ABACATEPAY_API_KEY')
const SEGREDO_WEBHOOK = defineSecret('ABACATEPAY_WEBHOOK_SECRET')
const REGIAO = 'southamerica-east1'

interface Pagamento {
  uid: string
  periodo: Periodo
  valorCentavos: number
  status: string
  brCode: string
  brCodeBase64: string
  expiraEm: number
  devMode: boolean
  nome: string
  email: string
  criadoEm: number
  pagoEm?: number
  validoAteAplicado?: number
}

/** Libera o Pro de um pagamento confirmado. Idempotente: pagar duas vezes o mesmo Pix não soma de novo. */
async function aplicarPagamento(id: string): Promise<number | null> {
  return db.runTransaction(async (t) => {
    const refPagamento = db.doc(`pagamentos/${id}`)
    const snap = await t.get(refPagamento)
    if (!snap.exists) return null
    const pagamento = snap.data() as Pagamento
    if (pagamento.status === 'PAID') return pagamento.validoAteAplicado ?? null

    const refAssinatura = db.doc(`assinaturas/${pagamento.uid}`)
    const assinatura = await t.get(refAssinatura)
    const validoAte = novaValidade(emMilissegundos(assinatura.data()?.validoAte), Date.now(), MESES[pagamento.periodo])

    t.set(
      refAssinatura,
      {
        plano: 'pro',
        validoAte,
        periodo: pagamento.periodo,
        nome: pagamento.nome,
        email: pagamento.email,
        forma: 'pix',
        ultimoPagamento: id,
        atualizadoEm: Date.now(),
      },
      { merge: true },
    )
    t.update(refPagamento, { status: 'PAID', pagoEm: Date.now(), validoAteAplicado: validoAte })
    // O pedido de assinatura, se houver, foi atendido.
    t.delete(db.doc(`interesses/${pagamento.uid}`))
    return validoAte
  })
}

export const criarCobrancaPix = onCall({ region: REGIAO, secrets: [CHAVE_API] }, async (requisicao) => {
  const uid = requisicao.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'Entre na sua conta para assinar.')
  const periodo = requisicao.data?.periodo
  if (!periodoValido(periodo)) throw new HttpsError('invalid-argument', 'Escolha o plano mensal ou anual.')

  // Reaproveita um Pix pendente do mesmo plano que ainda vale por pelo menos 10 minutos.
  const anteriores = await db.collection('pagamentos').where('uid', '==', uid).where('status', '==', 'PENDING').get()
  const reaproveitavel = anteriores.docs.find((d) => {
    const p = d.data() as Pagamento
    return p.periodo === periodo && p.expiraEm > Date.now() + 10 * 60 * 1000
  })
  if (reaproveitavel) {
    const p = reaproveitavel.data() as Pagamento
    return { id: reaproveitavel.id, brCode: p.brCode, brCodeBase64: p.brCodeBase64, expiraEm: p.expiraEm, valorCentavos: p.valorCentavos }
  }

  const perfil = (await db.doc(`users/${uid}`).get()).data() ?? {}
  const nome = String(perfil.nome ?? requisicao.auth?.token.name ?? '')
  const email = String(requisicao.auth?.token.email ?? '')

  try {
    const cobranca = await criarPix(CHAVE_API.value(), {
      amount: PRECOS[periodo],
      description: `Q3 Orça Pro ${periodo}`,
      expiresIn: VALIDADE_PIX_SEGUNDOS,
      externalId: `${uid}-${periodo}-${Date.now()}`,
      metadata: { uid, periodo },
    })
    const pagamento: Pagamento = {
      uid,
      periodo,
      valorCentavos: PRECOS[periodo],
      status: cobranca.status,
      brCode: cobranca.brCode,
      brCodeBase64: cobranca.brCodeBase64,
      expiraEm: new Date(cobranca.expiresAt).getTime() || Date.now() + VALIDADE_PIX_SEGUNDOS * 1000,
      devMode: cobranca.devMode,
      nome,
      email,
      criadoEm: Date.now(),
    }
    await db.doc(`pagamentos/${cobranca.id}`).set(pagamento)
    logger.info('Pix criado', { id: cobranca.id, uid, periodo, devMode: cobranca.devMode })
    return { id: cobranca.id, brCode: pagamento.brCode, brCodeBase64: pagamento.brCodeBase64, expiraEm: pagamento.expiraEm, valorCentavos: pagamento.valorCentavos }
  } catch (erro) {
    logger.error('Falha ao criar Pix', erro)
    throw new HttpsError('unavailable', erro instanceof ErroAbacatePay ? 'O sistema de pagamento não respondeu. Tente de novo em instantes.' : 'Não foi possível gerar o Pix.')
  }
})

export const verificarPagamento = onCall({ region: REGIAO, secrets: [CHAVE_API] }, async (requisicao) => {
  const uid = requisicao.auth?.uid
  if (!uid) throw new HttpsError('unauthenticated', 'Entre na sua conta.')
  const id = String(requisicao.data?.id ?? '')
  const snap = await db.doc(`pagamentos/${id}`).get()
  if (!snap.exists || (snap.data() as Pagamento).uid !== uid) throw new HttpsError('not-found', 'Pagamento não encontrado.')
  const pagamento = snap.data() as Pagamento
  if (pagamento.status === 'PAID') return { status: 'PAID', validoAte: pagamento.validoAteAplicado ?? null }

  const status = await consultarPix(CHAVE_API.value(), id)
  if (status === 'PAID') return { status, validoAte: await aplicarPagamento(id) }
  if (status !== pagamento.status) await snap.ref.update({ status })
  return { status, validoAte: null }
})

export const webhookAbacatePay = onRequest({ region: REGIAO, secrets: [CHAVE_API, SEGREDO_WEBHOOK] }, async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Use POST')
    return
  }
  // Duas travas da AbacatePay: segredo no endereço e assinatura HMAC do corpo.
  if (!segredoConfere(req.query.webhookSecret, SEGREDO_WEBHOOK.value())) {
    logger.warn('Webhook com segredo inválido')
    res.status(401).send('Segredo inválido')
    return
  }
  if (!assinaturaValida(req.rawBody, req.get('X-Webhook-Signature'))) {
    logger.warn('Webhook com assinatura inválida')
    res.status(401).send('Assinatura inválida')
    return
  }

  const evento = req.body as { event?: string; devMode?: boolean }
  if (!evento.event || !EVENTOS_PAGAMENTO.includes(evento.event)) {
    res.status(200).send('Evento ignorado')
    return
  }
  const id = extrairIdCobranca(evento)
  if (!id) {
    logger.warn('Evento de pagamento sem ID de Pix reconhecível', { evento: evento.event })
    res.status(200).send('Sem cobrança Pix')
    return
  }
  try {
    // Nunca confia só no corpo do evento: reconfirma na API antes de liberar.
    const status = await consultarPix(CHAVE_API.value(), id)
    if (status === 'PAID') {
      const validoAte = await aplicarPagamento(id)
      logger.info('Pagamento aplicado pelo webhook', { id, validoAte })
    }
    res.status(200).send('ok')
  } catch (erro) {
    logger.error('Falha ao processar webhook', erro)
    // 500 faz a AbacatePay tentar de novo mais tarde.
    res.status(500).send('Erro')
  }
})
