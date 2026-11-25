import { describe, expect, it } from 'vitest'
import { avisarFimDoBeta, marcoAvisoFimDoBeta, situacaoPlano } from './plano'

const DIA = 24 * 60 * 60 * 1000
/** Conta criada no beta (antes de 15/11/2026): 90 dias de Pro grátis, até 30/12/2026 12h. */
const CRIADA_NO_BETA = Date.UTC(2026, 9, 1, 15)
const FIM_BETA = CRIADA_NO_BETA + 90 * DIA
const faltando = (dias: number) => situacaoPlano(null, CRIADA_NO_BETA, FIM_BETA - dias * DIA)

describe('marco do aviso de fim do Pro grátis do beta', () => {
  it('não avisa com mais de 30 dias pela frente', () => {
    expect(marcoAvisoFimDoBeta(faltando(60))).toBeNull()
    expect(marcoAvisoFimDoBeta(faltando(30.5))).toBeNull()
  })

  it('avisa em 30, 15 e 3 dias, cada marco até o próximo', () => {
    expect(marcoAvisoFimDoBeta(faltando(30))).toBe(30)
    expect(marcoAvisoFimDoBeta(faltando(16))).toBe(30)
    expect(marcoAvisoFimDoBeta(faltando(15))).toBe(15)
    expect(marcoAvisoFimDoBeta(faltando(4))).toBe(15)
    expect(marcoAvisoFimDoBeta(faltando(3))).toBe(3)
    expect(marcoAvisoFimDoBeta(faltando(0.2))).toBe(3)
  })

  it('arredonda como o resto do app: 15,5 dias contam como 16 (marco 30)', () => {
    expect(faltando(15.5)).toMatchObject({ diasRestantes: 16 })
    expect(marcoAvisoFimDoBeta(faltando(15.5))).toBe(30)
  })

  it('acabou o Pro grátis: sem este aviso (vale o de "Seu Pro terminou")', () => {
    expect(marcoAvisoFimDoBeta(situacaoPlano(null, CRIADA_NO_BETA, FIM_BETA))).toBeNull()
    expect(marcoAvisoFimDoBeta(situacaoPlano(null, CRIADA_NO_BETA, FIM_BETA + 5 * DIA))).toBeNull()
  })

  it('não vale para o teste de 30 dias de conta nova, nem para assinante', () => {
    const nova = Date.UTC(2026, 10, 20, 12)
    expect(marcoAvisoFimDoBeta(situacaoPlano(null, nova, nova + 28 * DIA))).toBeNull()
    expect(marcoAvisoFimDoBeta(situacaoPlano({ plano: 'pro', validoAte: FIM_BETA + 300 * DIA }, CRIADA_NO_BETA, FIM_BETA - 10 * DIA))).toBeNull()
  })

  it('conta criada no último dia do beta (14/11/2026 em Brasília) termina em 12/02/2027 e é avisada a partir de 14/01', () => {
    const criada = Date.UTC(2026, 10, 15, 2, 59)
    expect(marcoAvisoFimDoBeta(situacaoPlano(null, criada, Date.UTC(2027, 0, 12, 12)))).toBeNull()
    expect(marcoAvisoFimDoBeta(situacaoPlano(null, criada, Date.UTC(2027, 0, 14, 12)))).toBe(30)
  })
})

describe('dispensa do aviso de fim do beta', () => {
  it('"Agora não" esconde só o marco atual', () => {
    const dispensados = new Set([30])
    expect(avisarFimDoBeta(faltando(20), (m) => dispensados.has(m))).toBeNull()
    expect(avisarFimDoBeta(faltando(10), (m) => dispensados.has(m))).toBe(15)
  })

  it('sem dispensa, mostra o marco', () => {
    expect(avisarFimDoBeta(faltando(2), () => false)).toBe(3)
    expect(avisarFimDoBeta(faltando(40), () => false)).toBeNull()
  })
})
