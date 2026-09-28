import { describe, expect, it } from 'vitest'
import {
  calcularTotais,
  chaveCatalogo,
  formatarNumero,
  normalizarOrcamento,
  proximaSequencia,
  subtotalItem,
  totalRecebido,
  valorDesconto,
  valorPix,
} from './calc'
import { formatarBRL, parseBRL, parseQuantidade } from './money'
import type { ItemOrcamento } from './types'

const item = (quantidade: number, preco: number, tipo: ItemOrcamento['tipo'] = 'servico'): ItemOrcamento => ({
  id: String(Math.random()),
  descricao: 'x',
  quantidade,
  unidade: 'un',
  precoUnitarioCentavos: preco,
  tipo,
})

describe('dinheiro', () => {
  it('converte textos brasileiros em centavos', () => {
    expect(parseBRL('1.234,56')).toBe(123456)
    expect(parseBRL('R$ 10')).toBe(1000)
    expect(parseBRL('0,1')).toBe(10)
    expect(parseBRL('1234.5')).toBe(123450)
    expect(parseBRL('1.500')).toBe(150000)
    expect(parseBRL('')).toBe(0)
    expect(parseBRL('abc')).toBe(0)
  })

  it('formata centavos em reais', () => {
    expect(formatarBRL(123456)).toBe('R$ 1.234,56')
    expect(formatarBRL(0)).toBe('R$ 0,00')
  })

  it('lê quantidades com vírgula', () => {
    expect(parseQuantidade('2,5')).toBe(2.5)
    expect(parseQuantidade('-3')).toBe(0)
    expect(parseQuantidade('x')).toBe(0)
  })
})

describe('cálculos', () => {
  it('arredonda o subtotal de quantidades fracionadas', () => {
    expect(subtotalItem(item(2.5, 1999))).toBe(4998)
    expect(subtotalItem(item(-1, 1000))).toBe(0)
  })

  it('limita descontos', () => {
    expect(valorDesconto({ tipo: 'percentual', valor: 10 }, 10000)).toBe(1000)
    expect(valorDesconto({ tipo: 'percentual', valor: 150 }, 10000)).toBe(10000)
    expect(valorDesconto({ tipo: 'valor', valor: 50000 }, 10000)).toBe(10000)
    expect(valorDesconto({ tipo: 'valor', valor: -5 }, 10000)).toBe(0)
  })

  it('separa serviços e materiais e soma o deslocamento', () => {
    const totais = calcularTotais({
      itens: [item(3, 5000), item(10, 250, 'material')],
      desconto: { tipo: 'percentual', valor: 10 },
      deslocamentoCentavos: 3000,
    })
    expect(totais).toEqual({
      servicos: 15000,
      materiais: 2500,
      subtotal: 17500,
      desconto: 1750,
      deslocamento: 3000,
      total: 18750,
    })
  })

  it('não repete número de orçamento', () => {
    // Conta nova: começa em 1.
    expect(proximaSequencia({ proximoNumero: 0 })).toBe(1)
    // Conta antiga com 3 orçamentos pelo contador legado: o próximo é 4.
    expect(proximaSequencia({ proximoNumero: 3 })).toBe(4)
    // Depois da correção, o último número usado manda.
    expect(proximaSequencia({ proximoNumero: 3, ultimoNumero: 7 })).toBe(8)
  })

  it('numera orçamentos com o ano', () => {
    expect(formatarNumero(2026, 42)).toBe('2026-0042')
  })
})

describe('pix, recebimentos e catálogo', () => {
  it('calcula o valor do QR Code conforme a opção', () => {
    expect(valorPix({ pix: { modo: 'total', percentual: 50 } }, 10000)).toBe(10000)
    expect(valorPix({ pix: { modo: 'percentual', percentual: 50 } }, 10001)).toBe(5001)
    expect(valorPix({ pix: { modo: 'sem-valor', percentual: 50 } }, 10000)).toBe(0)
    expect(valorPix({ pix: { modo: 'nao-incluir', percentual: 50 } }, 10000)).toBeNull()
  })

  it('completa orçamentos antigos sem os campos novos', () => {
    const o = normalizarOrcamento({ id: 'a', numero: '2026-0001' })
    expect(o.pagamentos).toEqual([])
    expect(o.pix.modo).toBe('total')
    expect(totalRecebido({ pagamentos: [{ valorCentavos: 100 }, { valorCentavos: 250 }] as never })).toBe(350)
  })

  it('gera chaves de catálogo estáveis', () => {
    expect(chaveCatalogo('Instalação de Tomada')).toBe('instalacao-de-tomada')
    expect(chaveCatalogo(' Pintura / Teto (2 demãos) ')).toBe('pintura-teto-2-demaos')
    expect(chaveCatalogo('///')).toBe('item')
  })
})
