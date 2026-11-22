import { describe, expect, it } from 'vitest'
import {
  camposDoRascunho,
  formInicial,
  lerRascunho,
  perfilDoRascunho,
  temConteudo,
  itensIniciais,
  itensPreenchidos,
  linkCadastroGerador,
  numeroDoGerador,
  orcamentoDoGerador,
  perfilDoGerador,
  totaisDoGerador,
  trocarProfissao,
} from './gerador'
import { origemDaVisita } from './origem'
import { MODELOS } from './templates'
import type { ItemOrcamento } from './types'

const item = (descricao: string, quantidade: number, preco: number, tipo: ItemOrcamento['tipo'] = 'servico'): ItemOrcamento => ({
  id: descricao,
  descricao,
  quantidade,
  unidade: 'un',
  precoUnitarioCentavos: preco,
  tipo,
})

describe('gerador de orçamento sem cadastro', () => {
  it('começa com os serviços do modelo da profissão, sem preço e com ids estáveis', () => {
    const itens = itensIniciais('eletricista')
    expect(itens.map((i) => i.id)).toEqual(['l1', 'l2', 'l3'])
    expect(itens[0]).toMatchObject({ descricao: 'Instalação de tomada', unidade: 'ponto', quantidade: 1, precoUnitarioCentavos: 0 })
    expect(itensIniciais('eletricista')).toEqual(itens)
  })

  it('tem linhas iniciais para todas as profissões, inclusive "Outro serviço"', () => {
    for (const m of MODELOS) expect(itensIniciais(m.id)).toHaveLength(3)
  })

  it('soma subtotal, aplica desconto percentual e chega ao total', () => {
    const totais = totaisDoGerador({
      itens: [item('Pintura', 40, 2500), item('Tinta', 2.5, 1999, 'material'), item('', 1, 0)],
      desconto: { tipo: 'percentual', valor: 10 },
    })
    expect(totais).toMatchObject({ servicos: 100000, materiais: 4998, subtotal: 104998, desconto: 10500, total: 94498 })
  })

  it('aplica desconto em reais sem passar do subtotal', () => {
    expect(totaisDoGerador({ itens: [item('Visita', 1, 15000)], desconto: { tipo: 'valor', valor: 2000 } }).total).toBe(13000)
    expect(totaisDoGerador({ itens: [item('Visita', 1, 15000)], desconto: { tipo: 'valor', valor: 99999 } }).total).toBe(0)
    expect(totaisDoGerador({ itens: [], desconto: { tipo: 'percentual', valor: 10 } }).total).toBe(0)
  })

  it('deixa de fora as linhas sem valor, inclusive as sugestões do modelo', () => {
    expect(itensPreenchidos([item('', 1, 0), item('Troca de disjuntor', 1, 0), item('Visita', 1, 500)]).map((i) => i.id)).toEqual(['Visita'])
  })

  it('troca a profissão sem apagar o que já tem preço', () => {
    const inicial = formInicial('eletricista')
    const pintor = trocarProfissao(inicial, 'pintor')
    expect(pintor.itens[0].descricao).toMatch(/Pintura/)
    expect(pintor.garantia).toBe(formInicial('pintor').garantia)

    const comPreco = { ...inicial, itens: [{ ...inicial.itens[0], precoUnitarioCentavos: 8000 }], garantia: 'Minha garantia' }
    const trocado = trocarProfissao(comPreco, 'pintor')
    expect(trocado.itens).toEqual(comPreco.itens)
    expect(trocado.garantia).toBe('Minha garantia')
  })

  it('monta o orçamento para o PDF sem Pix e com número pela data', () => {
    const agora = new Date(2026, 9, 17, 14, 30).getTime()
    expect(numeroDoGerador(agora)).toBe('20261017-1430')
    const form = { ...formInicial('pintor'), cliente: { nome: ' Maria ', telefone: '', endereco: '' }, validadeDias: 7.4 }
    const orcamento = orcamentoDoGerador(form, agora)
    expect(orcamento).toMatchObject({ numero: '20261017-1430', criadoEm: agora, validadeDias: 7, status: 'rascunho' })
    expect(orcamento.cliente.nome).toBe('Maria')
    expect(orcamento.pix.modo).toBe('nao-incluir')
    expect(perfilDoGerador(form)).toMatchObject({ pix: '', pro: false })
  })

  it('o link de cadastro abre o modelo e chega ao funil como canal gerador', () => {
    const link = linkCadastroGerador('pintor')
    const url = new URL(link, 'https://www.q3orca.com.br')
    expect(url.pathname).toBe('/entrar')
    expect(url.searchParams.get('modo')).toBe('criar')
    expect(url.searchParams.get('modelo')).toBe('pintor')
    expect(origemDaVisita(url.href, '', 0, 'www.q3orca.com.br')).toMatchObject({ fonte: 'gerador', meio: 'site', campanha: 'gerador-sem-cadastro' })
  })
})

describe('rascunho do gerador levado para a conta', () => {
  const T = Date.UTC(2026, 10, 22, 15)
  const preenchido = () => {
    const f = formInicial('pintor')
    f.cliente.nome = ' Ana '
    f.profissional = { nome: 'João Pinturas', telefone: '41999990000', cidade: 'Curitiba' }
    f.itens[0] = { ...f.itens[0], precoUnitarioCentavos: 25000 }
    return f
  }
  it('só guarda quando há valor ou cliente', () => {
    expect(temConteudo(formInicial('pintor'))).toBe(false)
    expect(temConteudo(preenchido())).toBe(true)
  })
  it('lê o rascunho válido e recusa vencido, de outra versão ou quebrado', () => {
    const bruto = JSON.stringify({ versao: 1, em: T, form: preenchido() })
    expect(lerRascunho(bruto, T + 1000)?.cliente.nome).toBe(' Ana ')
    expect(lerRascunho(bruto, T + 8 * 24 * 3600 * 1000)).toBeNull()
    expect(lerRascunho(JSON.stringify({ versao: 2, em: T, form: preenchido() }), T)).toBeNull()
    expect(lerRascunho(JSON.stringify({ versao: 1, em: T, form: { ...preenchido(), profissao: 'astronauta' } }), T)).toBeNull()
    expect(lerRascunho('{quebrado', T)).toBeNull()
    expect(lerRascunho(null, T)).toBeNull()
  })
  it('leva só os itens com valor e o cliente sem espaços', () => {
    const c = camposDoRascunho(preenchido())
    expect(c.cliente.nome).toBe('Ana')
    expect(c.itens).toHaveLength(1)
    expect(c.itens[0].precoUnitarioCentavos).toBe(25000)
  })
  it('preenche o perfil só onde está vazio', () => {
    expect(perfilDoRascunho(preenchido(), { nome: '', telefone: '4130000000', cidade: '' })).toEqual({ nome: 'João Pinturas', cidade: 'Curitiba' })
  })
  it('o link de cadastro avisa que há rascunho', () => {
    expect(linkCadastroGerador('pintor', true)).toContain('&rascunho=1&')
    expect(linkCadastroGerador('pintor')).not.toContain('rascunho')
  })
})
