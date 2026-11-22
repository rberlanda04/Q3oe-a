import { calcularTotais, PIX_PADRAO } from './calc'
import { UTM_GERADOR } from './indicacao'
import { MODELOS, modeloPorId } from './templates'
import type { Cliente, Desconto, ItemOrcamento, Orcamento, Perfil, PerfilPublico, ProfissaoId, Totais } from './types'

/**
 * Gerador de orçamento sem cadastro (/gerador-de-orcamento): tudo fica na memória do
 * navegador, nada vai para o Firestore. As contas usam as mesmas regras do app (calc.ts).
 */
export interface FormGerador {
  profissao: ProfissaoId
  profissional: { nome: string; telefone: string; cidade: string }
  cliente: Cliente
  itens: ItemOrcamento[]
  desconto: Desconto
  condicoesPagamento: string
  prazoExecucao: string
  garantia: string
  validadeDias: number
  observacoes: string
}

/** Quantas linhas do modelo já vêm na tela ao escolher a profissão. */
export const LINHAS_INICIAIS = 3

/** Linhas iniciais com os serviços mais pedidos da profissão, sem preço. Ids estáveis, para a hidratação. */
export function itensIniciais(profissao: ProfissaoId, quantidade = LINHAS_INICIAIS): ItemOrcamento[] {
  const itens = modeloPorId(profissao).itens.slice(0, quantidade)
  const linhas = itens.map((s, i) => ({ id: `l${i + 1}`, descricao: s.descricao, unidade: s.unidade, tipo: s.tipo, quantidade: 1, precoUnitarioCentavos: 0 }))
  while (linhas.length < quantidade) linhas.push(itemVazio(`l${linhas.length + 1}`))
  return linhas
}

export function itemVazio(id: string): ItemOrcamento {
  return { id, descricao: '', quantidade: 1, unidade: 'un', precoUnitarioCentavos: 0, tipo: 'servico' }
}

/** Formulário inicial da profissão: itens do modelo, garantia e prazo sugeridos. */
export function formInicial(profissao: ProfissaoId): FormGerador {
  const modelo = modeloPorId(profissao)
  return {
    profissao,
    profissional: { nome: '', telefone: '', cidade: '' },
    cliente: { nome: '', telefone: '', endereco: '' },
    itens: itensIniciais(profissao),
    desconto: { tipo: 'percentual', valor: 0 },
    condicoesPagamento: 'Pix, dinheiro ou cartão. 50% na aprovação e 50% na entrega.',
    prazoExecucao: modelo.prazo,
    garantia: modelo.garantia,
    validadeDias: 15,
    observacoes: '',
  }
}

/** Troca a profissão mantendo o que a pessoa já digitou; os itens só mudam se ainda estiverem sem preço. */
export function trocarProfissao(form: FormGerador, profissao: ProfissaoId): FormGerador {
  const modeloAntigo = modeloPorId(form.profissao)
  const novo = formInicial(profissao)
  const intocado = form.itens.every((i) => i.precoUnitarioCentavos === 0)
  return {
    ...form,
    profissao,
    itens: intocado ? novo.itens : form.itens,
    prazoExecucao: form.prazoExecucao === modeloAntigo.prazo ? novo.prazoExecucao : form.prazoExecucao,
    garantia: form.garantia === modeloAntigo.garantia ? novo.garantia : form.garantia,
  }
}

/** Itens que entram no documento: os que já têm valor. Sugestões do modelo sem preço ficam de fora. */
export function itensPreenchidos(itens: ItemOrcamento[]): ItemOrcamento[] {
  return itens.filter((i) => i.precoUnitarioCentavos > 0)
}

/** Subtotal, desconto e total do gerador, com as mesmas regras do app. */
export function totaisDoGerador(form: Pick<FormGerador, 'itens' | 'desconto'>): Totais {
  return calcularTotais({ itens: itensPreenchidos(form.itens), desconto: form.desconto, deslocamentoCentavos: 0 })
}

/** Número do orçamento avulso pela data e hora: 20261017-1430. */
export function numeroDoGerador(agora: number): string {
  const d = new Date(agora)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`
}

/** Orçamento completo para o PDF do app (não é gravado em lugar nenhum). */
export function orcamentoDoGerador(form: FormGerador, agora: number): Orcamento {
  return {
    id: 'gerador',
    numero: numeroDoGerador(agora),
    profissao: form.profissao,
    cliente: { nome: form.cliente.nome.trim(), telefone: form.cliente.telefone.trim(), endereco: form.cliente.endereco.trim() },
    itens: itensPreenchidos(form.itens),
    desconto: form.desconto,
    deslocamentoCentavos: 0,
    condicoesPagamento: form.condicoesPagamento.trim(),
    prazoExecucao: form.prazoExecucao.trim(),
    validadeDias: Math.max(Math.round(form.validadeDias) || 0, 0),
    garantia: form.garantia.trim(),
    observacoes: form.observacoes.trim(),
    status: 'rascunho',
    pix: { ...PIX_PADRAO, modo: 'nao-incluir' },
    pagamentos: [],
    criadoEm: agora,
    atualizadoEm: agora,
  }
}

/** Dados do profissional no cabeçalho do PDF. Sem conta não há Pix, logo nem cor da marca. */
export function perfilDoGerador(form: FormGerador): PerfilPublico {
  return {
    nome: form.profissional.nome.trim(),
    documento: '',
    telefone: form.profissional.telefone.trim(),
    email: '',
    endereco: '',
    cidade: form.profissional.cidade.trim(),
    pix: '',
    pro: false,
  }
}

/** Cadastro a partir do gerador: abre o app já no modelo da profissão, com a origem medida no funil. */
export function linkCadastroGerador(profissao: ProfissaoId, comRascunho = false): string {
  return `/entrar?modo=criar&modelo=${encodeURIComponent(profissao)}${comRascunho ? '&rascunho=1' : ''}&${UTM_GERADOR}`
}

/*
 * Rascunho do gerador levado para a conta nova: ao clicar em criar conta, o formulário fica
 * guardado no navegador; depois do cadastro ele vira o primeiro orçamento, sem redigitar.
 */
export const VALIDADE_RASCUNHO_MS = 7 * 24 * 60 * 60 * 1000

export interface RascunhoGerador {
  versao: 1
  em: number
  form: FormGerador
}

/** Vale a pena guardar: algum item com valor ou o nome do cliente preenchido. */
export function temConteudo(form: Pick<FormGerador, 'itens' | 'cliente'>): boolean {
  return form.itens.some((i) => i.precoUnitarioCentavos > 0) || form.cliente.nome.trim() !== ''
}

/** Lê o rascunho guardado; null se não existir, estiver vencido ou com formato estranho. */
export function lerRascunho(bruto: string | null, agora: number): FormGerador | null {
  if (!bruto) return null
  try {
    const r = JSON.parse(bruto) as Partial<RascunhoGerador>
    const f = r.form
    if (r.versao !== 1 || typeof r.em !== 'number' || agora - r.em > VALIDADE_RASCUNHO_MS || r.em > agora + 60_000) return null
    if (!f || !MODELOS.some((m) => m.id === f.profissao) || !Array.isArray(f.itens) || !f.cliente || !f.profissional || !f.desconto) return null
    const itens = f.itens
      .filter((i) => i && typeof i.descricao === 'string' && Number.isFinite(i.quantidade) && Number.isInteger(i.precoUnitarioCentavos))
      .slice(0, 100)
    return { ...formInicial(f.profissao), ...f, itens }
  } catch {
    return null
  }
}

/** Campos do orçamento que vêm do rascunho (o resto segue o padrão da conta). */
export function camposDoRascunho(form: FormGerador): Pick<
  Orcamento,
  'cliente' | 'itens' | 'desconto' | 'condicoesPagamento' | 'prazoExecucao' | 'validadeDias' | 'garantia' | 'observacoes'
> {
  const o = orcamentoDoGerador(form, 0)
  return {
    cliente: o.cliente,
    itens: o.itens,
    desconto: o.desconto,
    condicoesPagamento: o.condicoesPagamento,
    prazoExecucao: o.prazoExecucao,
    validadeDias: o.validadeDias || 15,
    garantia: o.garantia,
    observacoes: o.observacoes,
  }
}

/** Nome, telefone e cidade do profissional vão para o perfil só onde o perfil ainda está vazio. */
export function perfilDoRascunho(form: FormGerador, perfil: Pick<Perfil, 'nome' | 'telefone' | 'cidade'>): Partial<Perfil> {
  const novo: Partial<Perfil> = {}
  for (const campo of ['nome', 'telefone', 'cidade'] as const) {
    const valor = form.profissional[campo].trim()
    if (valor && !perfil[campo]?.trim()) novo[campo] = valor
  }
  return novo
}
