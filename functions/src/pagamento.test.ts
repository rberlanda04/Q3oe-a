import { createHmac } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { consultarPix, criarPix, ErroAbacatePay } from './abacatepay'
import { extrairIdCobranca, novaValidade, periodoValido, PRECOS } from './negocio'
import { assinaturaValida, CHAVE_PUBLICA_ABACATEPAY, segredoConfere } from './webhook'

describe('webhook da AbacatePay', () => {
  const corpo = Buffer.from(JSON.stringify({ event: 'transparent.completed', data: { id: 'pix_char_abc123' } }))
  const assinatura = createHmac('sha256', CHAVE_PUBLICA_ABACATEPAY).update(corpo).digest('base64')

  it('aceita a assinatura HMAC correta', () => {
    expect(assinaturaValida(corpo, assinatura)).toBe(true)
  })

  it('recusa corpo alterado, assinatura ausente ou de outra chave', () => {
    expect(assinaturaValida(Buffer.from(corpo.toString().replace('abc123', 'xyz789')), assinatura)).toBe(false)
    expect(assinaturaValida(corpo, undefined)).toBe(false)
    expect(assinaturaValida(corpo, createHmac('sha256', 'outra').update(corpo).digest('base64'))).toBe(false)
  })

  it('confere o segredo do endereço', () => {
    expect(segredoConfere('segredo-123', 'segredo-123')).toBe(true)
    expect(segredoConfere('segredo-12', 'segredo-123')).toBe(false)
    expect(segredoConfere(undefined, 'segredo-123')).toBe(false)
    expect(segredoConfere('qualquer', '')).toBe(false)
  })

  it('encontra o ID do Pix em formatos diferentes de evento', () => {
    expect(extrairIdCobranca({ event: 'x', data: { id: 'pix_char_A1' } })).toBe('pix_char_A1')
    expect(extrairIdCobranca({ data: { transparent: { id: 'pix_char_B2', status: 'PAID' } } })).toBe('pix_char_B2')
    expect(extrairIdCobranca({ data: { payments: [{ ref: 'pix_char_C3' }] } })).toBe('pix_char_C3')
    expect(extrairIdCobranca({ data: { id: 'bill_123' } })).toBeNull()
  })
})

describe('regras do pagamento', () => {
  it('cobra os preços do servidor e só aceita planos conhecidos', () => {
    expect(PRECOS).toEqual({ mensal: 1490, anual: 9900 })
    expect(periodoValido('anual')).toBe(true)
    expect(periodoValido('vitalicio')).toBe(false)
  })

  it('renovação soma ao fim do período ainda pago', () => {
    const agora = new Date(2026, 9, 1, 12).getTime()
    const venceDia20 = new Date(2026, 9, 20, 12).getTime()
    expect(new Date(novaValidade(venceDia20, agora, 1)).toDateString()).toBe(new Date(2026, 10, 20).toDateString())
  })
})

describe('cliente da API', () => {
  const resposta = (corpo: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(corpo), { status }))

  it('cria Pix com método, valor em centavos e chave no cabeçalho', async () => {
    const buscar = vi.fn(() =>
      resposta({ success: true, error: null, data: { id: 'pix_char_1', amount: 1490, status: 'PENDING', devMode: true, brCode: '000201', brCodeBase64: 'data:', expiresAt: '2026-10-01T13:00:00Z' } }),
    )
    const pix = await criarPix('chave-teste', { amount: 1490, description: 'x', expiresIn: 3600, externalId: 'e', metadata: { uid: 'u' } }, buscar as never)
    expect(pix.id).toBe('pix_char_1')
    const [url, init] = buscar.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://api.abacatepay.com/v2/transparents/create')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer chave-teste')
    expect(JSON.parse(String(init.body))).toMatchObject({ method: 'PIX', data: { amount: 1490 } })
  })

  it('consulta o status e trata erros da API', async () => {
    const ok = vi.fn(() => resposta({ success: true, error: null, data: { id: 'pix_char_1', status: 'PAID' } }))
    expect(await consultarPix('k', 'pix_char_1', ok as never)).toBe('PAID')
    const falha = vi.fn(() => resposta({ success: false, error: 'Unauthorized', data: null }, 401))
    await expect(consultarPix('k', 'pix_char_1', falha as never)).rejects.toBeInstanceOf(ErroAbacatePay)
  })
})
