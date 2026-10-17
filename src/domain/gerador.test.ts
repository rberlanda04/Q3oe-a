import { describe, expect, it } from 'vitest'
import {
  formInicial,
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

  it('deixa de fora as linhas em branco', () => {
    expect(itensPreenchidos([item('', 1, 0), item('  ', 2, 0), item('Troca de disjuntor', 1, 0), item('', 1, 500)]).map((i) => i.id)).toEqual([
      'Troca de disjuntor',
      '',
    ])
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
