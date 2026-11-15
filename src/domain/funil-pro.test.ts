import { describe, expect, it } from 'vitest'
import { PRECOS } from '../../functions/src/negocio'
import { formatarBRL } from './money'
import { avisarFimDoPro, DIAS_SEM_AVISO_FIM_DO_PRO, mensalDoAnualCentavos, PRECOS_PRO, situacaoPlano, testeDoBeta } from './plano'

const DIA = 24 * 60 * 60 * 1000

describe('textos do teste usam os dias reais da conta', () => {
  it('conta nova (depois do corte do beta) está no teste de 30 dias, não no beta', () => {
    const criada = Date.UTC(2026, 10, 16, 12)
    const plano = situacaoPlano(null, criada, criada + 2 * DIA)
    expect(plano).toMatchObject({ motivo: 'teste', diasTeste: 30, diasRestantes: 28 })
    expect(testeDoBeta(plano)).toBe(false)
  })

  it('conta criada no beta segue com os 90 dias', () => {
    const criada = Date.UTC(2026, 9, 1, 12)
    const plano = situacaoPlano(null, criada, criada + 40 * DIA)
    expect(plano).toMatchObject({ motivo: 'teste', diasTeste: 90, diasRestantes: 50 })
    expect(testeDoBeta(plano)).toBe(true)
  })

  it('quem não está em teste não é do beta', () => {
    const agora = Date.UTC(2027, 5, 1)
    expect(testeDoBeta(situacaoPlano(null, agora - 200 * DIA, agora))).toBe(false)
    expect(testeDoBeta(situacaoPlano({ plano: 'pro', validoAte: agora + DIA }, agora - 10 * DIA, agora))).toBe(false)
  })
})

describe('aviso de fim do Pro', () => {
  const agora = Date.UTC(2027, 2, 20, 15)
  const encerrado = situacaoPlano(null, agora - 31 * DIA, agora)

  it('aparece para quem terminou o teste e não assinou', () => {
    expect(avisarFimDoPro(encerrado, 0, agora)).toBe(true)
  })

  it('aparece também para quem deixou a assinatura vencer', () => {
    expect(avisarFimDoPro(situacaoPlano({ plano: 'pro', validoAte: agora - DIA }, agora - 400 * DIA, agora), 0, agora)).toBe(true)
  })

  it('não aparece durante o teste, para assinante, nem para conta sem data de criação', () => {
    expect(avisarFimDoPro(situacaoPlano(null, agora - 5 * DIA, agora), 0, agora)).toBe(false)
    expect(avisarFimDoPro(situacaoPlano({ plano: 'pro', validoAte: agora + DIA }, agora - 400 * DIA, agora), 0, agora)).toBe(false)
    expect(avisarFimDoPro(situacaoPlano(null, 0, agora), 0, agora)).toBe(false)
  })

  it('dispensado, fica uma semana sem aparecer e depois volta', () => {
    expect(DIAS_SEM_AVISO_FIM_DO_PRO).toBe(7)
    expect(avisarFimDoPro(encerrado, agora - 1000, agora)).toBe(false)
    expect(avisarFimDoPro(encerrado, agora - 7 * DIA + 1, agora)).toBe(false)
    expect(avisarFimDoPro(encerrado, agora - 7 * DIA, agora)).toBe(true)
  })

  it('dispensa com data no futuro (relógio mexido) não esconde o aviso', () => {
    expect(avisarFimDoPro(encerrado, agora + 30 * DIA, agora)).toBe(true)
  })
})

describe('preço do Pro', () => {
  it('o anual sai por R$ 8,25 por mês', () => {
    expect(mensalDoAnualCentavos()).toBe(825)
    expect(formatarBRL(mensalDoAnualCentavos())).toBe('R$ 8,25')
    expect(mensalDoAnualCentavos(10000)).toBe(833)
  })

  it('os preços da tela são os mesmos que o servidor cobra', () => {
    expect(PRECOS_PRO).toEqual(PRECOS)
  })
})
