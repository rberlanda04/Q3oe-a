import { describe, expect, it } from 'vitest'
import { calcularPintura, calcularPiso, calcularValorHora, rejunteKgPorM2 } from './calculadoras'

describe('calculadora de pintura', () => {
  it('desconta portas e janelas e soma as demãos', () => {
    const r = calcularPintura({ area: 100, descontos: 10, demaos: 2, rendimento: 10, precoM2: 20 })
    expect(r.areaPintada).toBe(90)
    expect(r.litros).toBe(18)
    expect(r.latas18).toBe(1)
    expect(r.galoes36).toBe(5)
    expect(r.maoDeObra).toBe(1800)
  })

  it('não quebra com campos vazios ou negativos', () => {
    const r = calcularPintura({ area: Number.NaN, descontos: -5, demaos: 0, rendimento: 0, precoM2: -1 })
    expect(r).toEqual({ areaPintada: 0, litros: 0, latas18: 0, galoes36: 0, maoDeObra: 0 })
  })
})

describe('calculadora de piso', () => {
  it('soma a perda, arredonda caixas e sacos para cima', () => {
    const r = calcularPiso({ area: 20, perda: 10, m2PorCaixa: 2.16, pecaCm: [60, 60], espessuraMm: 8, juntaMm: 2, argamassaKgM2: 8, precoM2: 50 })
    expect(r.areaComPerda).toBe(22)
    expect(r.caixas).toBe(11)
    expect(r.sacosArgamassa20kg).toBe(8)
    expect(r.maoDeObra).toBe(1000)
  })

  it('rejunte pela fórmula dos fabricantes', () => {
    // 60 × 60 cm, 8 mm, junta 2 mm: (600+600)/(600×600) × 8 × 2 × 1,58 ≈ 0,084 kg/m²
    expect(rejunteKgPorM2([60, 60], 8, 2)).toBeCloseTo(0.0843, 3)
    expect(rejunteKgPorM2([0, 60], 8, 2)).toBe(0)
  })
})

describe('calculadora do valor da hora', () => {
  it('divide renda e custos pelas horas realmente pagas', () => {
    const r = calcularValorHora({ rendaDesejada: 4000, custosMensais: 1000, diasPorSemana: 5, horasPorDia: 8, tempoNaoPago: 25 })
    // 5 × 8 × 4,33 = 173,3 h; 75% pagas = 130 h; 5000 / 130 ≈ 38,46
    expect(r.horasPagasNoMes).toBe(130)
    expect(r.valorHora).toBeCloseTo(38.46, 1)
    expect(r.valorDiaria).toBeCloseTo(307.69, 0)
  })

  it('sem horas de trabalho, o valor é zero', () => {
    expect(calcularValorHora({ rendaDesejada: 4000, custosMensais: 0, diasPorSemana: 0, horasPorDia: 8, tempoNaoPago: 0 }).valorHora).toBe(0)
  })
})
