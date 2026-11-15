import { describe, expect, it } from 'vitest'
import { contarEnviados, efeitoDoEnvio } from './envio'

describe('efeito do envio', () => {
  it('orçamento compartilhado ou baixado conta como enviado e sai do rascunho', () => {
    for (const resultado of ['compartilhado', 'baixado'] as const) {
      expect(efeitoDoEnvio(resultado, true, 'rascunho')).toMatchObject({ aguardarToque: false, registrarEnviado: true, marcarEnviado: true })
    }
    expect(efeitoDoEnvio('baixado', true, 'rascunho').avisarBaixado).toBe(true)
    expect(efeitoDoEnvio('compartilhado', true, 'rascunho').avisarBaixado).toBe(false)
  })

  it('reenvio registra o evento, mas não mexe no status de quem já passou do rascunho', () => {
    for (const status of ['enviado', 'aprovado', 'recusado'] as const) {
      expect(efeitoDoEnvio('compartilhado', true, status)).toMatchObject({ registrarEnviado: true, marcarEnviado: false })
    }
  })

  it('à espera do segundo toque, ainda não conta: só guarda o arquivo', () => {
    expect(efeitoDoEnvio('precisa-toque', true, 'rascunho')).toEqual({
      aguardarToque: true,
      registrarEnviado: false,
      marcarEnviado: false,
      avisarBaixado: false,
    })
  })

  it('envio cancelado não conta', () => {
    expect(efeitoDoEnvio('cancelado', true, 'rascunho')).toMatchObject({ aguardarToque: false, registrarEnviado: false, marcarEnviado: false })
  })

  it('recibo, ordem e garantia nunca contam como orçamento enviado', () => {
    for (const resultado of ['compartilhado', 'baixado'] as const) {
      expect(efeitoDoEnvio(resultado, false, 'rascunho')).toMatchObject({ registrarEnviado: false, marcarEnviado: false })
    }
  })
})

describe('orçamentos enviados', () => {
  it('conta tudo o que saiu do rascunho', () => {
    expect(contarEnviados([])).toBe(0)
    expect(
      contarEnviados([{ status: 'rascunho' }, { status: 'enviado', enviadoEm: 1 }, { status: 'aprovado' }, { status: 'recusado' }, { status: 'rascunho' }]),
    ).toBe(3)
  })
})
