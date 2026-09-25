import { describe, expect, it } from 'vitest'
import { reaisPorExtenso } from './extenso'
import { cpfValido, crc16, detectarTipoChave, gerarPixCopiaECola, normalizarChave } from './pix'

describe('Pix', () => {
  it('calcula o CRC16 no padrão do Banco Central', () => {
    expect(crc16('123456789')).toBe('29B1')
    // Exemplo do manual do BR Code do Banco Central.
    const exemplo =
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304'
    expect(crc16(exemplo)).toBe('1D3D')
  })

  it('detecta e normaliza o tipo de chave', () => {
    expect(detectarTipoChave('joao@email.com')).toBe('email')
    expect(detectarTipoChave('123e4567-e12b-12d1-a456-426655440000')).toBe('aleatoria')
    expect(detectarTipoChave('(11) 98888-7777')).toBe('telefone')
    expect(detectarTipoChave('529.982.247-25')).toBe('cpf')
    expect(detectarTipoChave('11.222.333/0001-81')).toBe('cnpj')
    expect(normalizarChave('(11) 98888-7777', 'telefone')).toBe('+5511988887777')
    expect(normalizarChave('529.982.247-25', 'cpf')).toBe('52998224725')
    expect(cpfValido('111.111.111-11')).toBe(false)
  })

  it('monta um código copia-e-cola válido', () => {
    const codigo = gerarPixCopiaECola({
      chave: 'joao@email.com',
      nome: 'João da Silva Pinturas e Reformas Ltda',
      cidade: 'São Paulo - SP',
      valorCentavos: 149756,
      txid: 'ORC-2026-0001',
    })
    expect(codigo).toContain('0014br.gov.bcb.pix0114joao@email.com')
    expect(codigo).toContain('54071497.56')
    expect(codigo).toContain('5924JOAO DA SILVA PINTURAS E6009')
    expect(codigo).toContain('6009SAO PAULO')
    expect(codigo).toContain('0511ORC20260001')
    expect(codigo.slice(-4)).toBe(crc16(codigo.slice(0, -4)))
  })

  it('omite o valor quando não informado', () => {
    const codigo = gerarPixCopiaECola({ chave: '52998224725', nome: 'Ana', cidade: '' })
    expect(codigo).not.toMatch(/54\d{2}\d/)
    expect(codigo).toContain('6006BRASIL')
  })
})

describe('valor por extenso', () => {
  it.each([
    [100, 'um real'],
    [2100, 'vinte e um reais'],
    [10000, 'cem reais'],
    [10100, 'cento e um reais'],
    [100000, 'mil reais'],
    [110000, 'mil e cem reais'],
    [125050, 'mil duzentos e cinquenta reais e cinquenta centavos'],
    [149756, 'mil quatrocentos e noventa e sete reais e cinquenta e seis centavos'],
    [1, 'um centavo'],
    [200000000, 'dois milhões de reais'],
    [123456789, 'um milhão duzentos e trinta e quatro mil quinhentos e sessenta e sete reais e oitenta e nove centavos'],
  ])('%i centavos', (centavos, esperado) => {
    expect(reaisPorExtenso(centavos)).toBe(esperado)
  })
})
