import { describe, expect, it } from 'vitest'
import { consentimentoNaCriacao, escolhaParaGuardar, lerEscolhaGuardada, registroConsentimento, VALIDADE_ESCOLHA_MS } from './consentimento'

const T = Date.UTC(2026, 10, 26, 12)

describe('consentimento de e-mail', () => {
  it('registra a escolha com data e origem', () => {
    expect(registroConsentimento(true, 'cadastro', T)).toEqual({ aceitaEmail: true, aceitaEmailEm: T, aceitaEmailOrigem: 'cadastro' })
    expect(registroConsentimento(false, 'perfil', T)).toEqual({ aceitaEmail: false, aceitaEmailEm: T, aceitaEmailOrigem: 'perfil' })
  })

  it('na conta nova, só grava quando a caixa está marcada', () => {
    expect(consentimentoNaCriacao(false, false, T)).toBeNull()
    expect(consentimentoNaCriacao(false, true, T)).toBeNull()
    expect(consentimentoNaCriacao(true, false, T)).toEqual({ aceitaEmail: true, aceitaEmailEm: T, aceitaEmailOrigem: 'cadastro' })
    expect(consentimentoNaCriacao(true, true, T)?.aceitaEmailOrigem).toBe('gerador')
  })

  it('a escolha do gerador vale por 7 dias e qualquer dado estranho conta como desmarcada', () => {
    const marcada = JSON.stringify(escolhaParaGuardar(true, T))
    expect(lerEscolhaGuardada(marcada, T + 1000)).toBe(true)
    expect(lerEscolhaGuardada(marcada, T + VALIDADE_ESCOLHA_MS + 1)).toBe(false)
    expect(lerEscolhaGuardada(JSON.stringify(escolhaParaGuardar(false, T)), T)).toBe(false)
    expect(lerEscolhaGuardada(JSON.stringify({ versao: 2, em: T, aceita: true }), T)).toBe(false)
    expect(lerEscolhaGuardada(JSON.stringify({ versao: 1, em: T, aceita: 'sim' }), T)).toBe(false)
    expect(lerEscolhaGuardada(JSON.stringify({ versao: 1, em: T + 3_600_000, aceita: true }), T)).toBe(false)
    expect(lerEscolhaGuardada('{quebrado', T)).toBe(false)
    expect(lerEscolhaGuardada(null, T)).toBe(false)
  })
})
