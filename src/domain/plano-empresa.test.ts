import { describe, expect, it } from 'vitest'
import { capitalizar, cnpjValido, empresaDaResposta, formatarCnpj } from './empresa'
import { situacaoPlano } from './plano'

const DIA = 24 * 60 * 60 * 1000
const agora = Date.UTC(2026, 8, 28)

describe('plano', () => {
  it('dá 14 dias de teste do Pro para contas novas', () => {
    expect(situacaoPlano(null, agora - 3 * DIA, agora)).toEqual({ pro: true, motivo: 'teste', diasRestantes: 11 })
  })

  it('volta ao grátis quando o teste acaba', () => {
    expect(situacaoPlano(null, agora - 15 * DIA, agora)).toEqual({ pro: false, motivo: 'gratis', testeEncerrado: true })
  })

  it('reconhece assinatura válida e ignora a vencida', () => {
    const antiga = agora - 60 * DIA
    expect(situacaoPlano({ plano: 'pro', validoAte: agora + DIA }, antiga, agora).motivo).toBe('assinatura')
    expect(situacaoPlano({ plano: 'pro', validoAte: agora - DIA }, antiga, agora).pro).toBe(false)
  })
})

describe('empresa', () => {
  it('valida CNPJ pelo dígito verificador', () => {
    expect(cnpjValido('11.222.333/0001-81')).toBe(true)
    expect(cnpjValido('11.222.333/0001-82')).toBe(false)
    expect(cnpjValido('00.000.000/0000-00')).toBe(false)
    expect(formatarCnpj('11222333000181')).toBe('11.222.333/0001-81')
  })

  it('deixa nomes da Receita legíveis', () => {
    expect(capitalizar('JOAO DA SILVA PINTURAS LTDA')).toBe('Joao da Silva Pinturas LTDA')
  })

  it('converte o cadastro público nos campos do perfil', () => {
    const dados = empresaDaResposta({
      cnpj: '11222333000181',
      razao_social: 'MARCOS OLIVEIRA SERVICOS ELETRICOS LTDA',
      nome_fantasia: 'MARCOS ELETRICA',
      descricao_tipo_de_logradouro: 'RUA',
      logradouro: 'DAS FLORES',
      numero: '120',
      complemento: '',
      bairro: 'CENTRO',
      municipio: 'CAMPINAS',
      uf: 'SP',
      ddd_telefone_1: '1932345678',
      email: 'CONTATO@MARCOS.COM.BR',
      descricao_situacao_cadastral: 'ATIVA',
    })
    expect(dados).toEqual({
      nome: 'Marcos Eletrica',
      razaoSocial: 'Marcos Oliveira Servicos Eletricos LTDA',
      documento: '11.222.333/0001-81',
      endereco: 'Rua das Flores, 120, Centro',
      cidade: 'Campinas - SP',
      telefone: '(19) 3234-5678',
      email: 'contato@marcos.com.br',
      situacao: 'Ativa',
    })
  })

  it('não repete o tipo de logradouro e padroniza sem número', () => {
    const dados = empresaDaResposta({
      cnpj: '00000000000191',
      descricao_tipo_de_logradouro: 'QUADRA',
      logradouro: 'QUADRA 5 SETOR NORTE',
      numero: 'SN',
      bairro: 'ASA NORTE',
      municipio: 'BRASILIA',
      uf: 'DF',
    })
    expect(dados.endereco).toBe('Quadra 5 Setor Norte, S/N, Asa Norte')
    expect(dados.cidade).toBe('Brasilia - DF')
  })

  it('usa a razão social quando não há nome fantasia', () => {
    expect(empresaDaResposta({ cnpj: '11222333000181', razao_social: 'ANA DIARISTA MEI', nome_fantasia: null }).nome).toBe(
      'Ana Diarista MEI',
    )
  })
})
