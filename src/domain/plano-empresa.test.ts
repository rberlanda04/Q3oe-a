import { describe, expect, it } from 'vitest'
import { capitalizar, cnpjValido, empresaDaResposta, formatarCnpj } from './empresa'
import { DIAS_PRO_BETA, DIAS_TESTE_PRO, diasDeTesteDaConta, FIM_CADASTRO_BETA, novaValidade, pdfComMarcaQ3, situacaoPlano } from './plano'

const DIA = 24 * 60 * 60 * 1000

describe('plano', () => {
  // Datas depois do corte do beta: contas novas, com 30 dias de teste.
  const agora = Date.UTC(2027, 2, 20, 15)

  it('dá 30 dias de teste do Pro para contas novas, contados da criação', () => {
    expect(DIAS_TESTE_PRO).toBe(30)
    expect(situacaoPlano(null, agora - 3 * DIA, agora)).toEqual({ pro: true, motivo: 'teste', diasRestantes: 27, diasTeste: 30 })
    expect(situacaoPlano(null, agora - 29 * DIA, agora)).toEqual({ pro: true, motivo: 'teste', diasRestantes: 1, diasTeste: 30 })
  })

  it('conta recém-criada mostra 30 dias, mesmo com relógio de referência atrasado', () => {
    const criada = agora + 5000
    expect(situacaoPlano(null, criada, agora)).toEqual({ pro: true, motivo: 'teste', diasRestantes: 30, diasTeste: 30 })
  })

  it('volta ao grátis quando os 30 dias acabam', () => {
    expect(situacaoPlano(null, agora - 30 * DIA, agora)).toEqual({ pro: false, motivo: 'gratis', testeEncerrado: true })
    expect(situacaoPlano(null, agora - 31 * DIA, agora).pro).toBe(false)
  })

  it('aceita um período de teste explícito', () => {
    expect(situacaoPlano(null, agora - 20 * DIA, agora, 90)).toEqual({ pro: true, motivo: 'teste', diasRestantes: 70, diasTeste: 90 })
  })

  it('reconhece assinatura válida e ignora a vencida', () => {
    const antiga = agora - 60 * DIA
    expect(situacaoPlano({ plano: 'pro', validoAte: agora + DIA }, antiga, agora).motivo).toBe('assinatura')
    expect(situacaoPlano({ plano: 'pro', validoAte: agora - DIA }, antiga, agora).pro).toBe(false)
  })
})

describe('contas do beta mantêm os 90 dias', () => {
  // 15/11/2026, 00:00 em Brasília (UTC-3).
  const corte = Date.UTC(2026, 10, 15, 3)

  it('o corte é a virada de 14 para 15/11/2026 no horário de Brasília', () => {
    expect(FIM_CADASTRO_BETA).toBe(corte)
    expect(DIAS_PRO_BETA).toBe(90)
  })

  it('quem se cadastrou antes do corte tem 90 dias; depois, 30', () => {
    expect(diasDeTesteDaConta(Date.UTC(2026, 8, 1))).toBe(90)
    expect(diasDeTesteDaConta(Date.UTC(2026, 10, 14, 12))).toBe(90) // 14/11, 9h em Brasília
    expect(diasDeTesteDaConta(corte - 1)).toBe(90) // 14/11, 23:59:59.999 em Brasília
    expect(diasDeTesteDaConta(corte)).toBe(30)
    expect(diasDeTesteDaConta(Date.UTC(2027, 0, 10))).toBe(30)
  })

  it('conta do beta não perde nenhum dia: o fim continua sendo criação + 90 dias', () => {
    const criada = Date.UTC(2026, 9, 1, 13) // 01/10/2026
    // No dia em que a mudança entra, faltam os mesmos dias de antes.
    const hoje = Date.UTC(2026, 10, 20, 13)
    const antes = situacaoPlano(null, criada, hoje, 90)
    expect(situacaoPlano(null, criada, hoje)).toEqual(antes)
    expect(antes).toEqual({ pro: true, motivo: 'teste', diasRestantes: 40, diasTeste: 90 })
    // Continua Pro até o último instante dos 90 dias e só então vai para o grátis.
    expect(situacaoPlano(null, criada, criada + 90 * DIA - 1).pro).toBe(true)
    expect(situacaoPlano(null, criada, criada + 90 * DIA).pro).toBe(false)
  })

  it('conta criada no último minuto do beta ainda tem 90 dias', () => {
    const criada = corte - 60_000
    expect(situacaoPlano(null, criada, criada + 60 * DIA)).toEqual({ pro: true, motivo: 'teste', diasRestantes: 30, diasTeste: 90 })
  })

  it('conta criada no primeiro minuto depois do corte tem 30 dias', () => {
    const criada = corte + 60_000
    expect(situacaoPlano(null, criada, criada)).toEqual({ pro: true, motivo: 'teste', diasRestantes: 30, diasTeste: 30 })
    expect(situacaoPlano(null, criada, criada + 30 * DIA).pro).toBe(false)
  })

  it('sem data de criação, não há teste', () => {
    expect(situacaoPlano(null, 0, Date.UTC(2026, 10, 1))).toEqual({ pro: false, motivo: 'gratis', testeEncerrado: false })
  })
})

describe('marca Q3 Orça no PDF', () => {
  const agora = Date.UTC(2027, 2, 20, 15)
  const marca = (plano: { pro: boolean }) => pdfComMarcaQ3(plano.pro)

  it('plano grátis: PDF com marca d’água e rodapé do site', () => {
    expect(marca(situacaoPlano(null, agora - 45 * DIA, agora))).toBe(true)
    expect(pdfComMarcaQ3(false)).toBe(true)
    expect(pdfComMarcaQ3(undefined)).toBe(true)
  })

  it('no teste de 30 dias ou no Pro pago: sem marca d’água e sem rodapé', () => {
    expect(marca(situacaoPlano(null, agora - 5 * DIA, agora))).toBe(false)
    expect(marca(situacaoPlano(null, Date.UTC(2026, 9, 1), Date.UTC(2026, 11, 20)))).toBe(false) // conta do beta, ainda nos 90 dias
    expect(marca(situacaoPlano({ plano: 'pro', validoAte: agora + DIA }, agora - 400 * DIA, agora))).toBe(false)
    expect(pdfComMarcaQ3(true)).toBe(false)
  })
})

describe('validade do Pro', () => {
  it('soma meses a partir de agora ou do fim do período pago', () => {
    const hoje = new Date(2026, 8, 28, 12).getTime()
    expect(new Date(novaValidade(null, hoje, 1)).toDateString()).toBe(new Date(2026, 9, 28).toDateString())
    const vence = new Date(2026, 9, 10, 12).getTime()
    expect(new Date(novaValidade(vence, hoje, 12)).toDateString()).toBe(new Date(2027, 9, 10).toDateString())
  })

  it('não pula mês em datas de fim de mês', () => {
    const jan31 = new Date(2027, 0, 31, 12).getTime()
    expect(new Date(novaValidade(null, jan31, 1)).toDateString()).toBe(new Date(2027, 1, 28).toDateString())
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
