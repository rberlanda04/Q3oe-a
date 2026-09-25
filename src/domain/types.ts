import type { TipoChavePix } from './pix'

export type ProfissaoId =
  | 'eletricista'
  | 'encanador'
  | 'pintor'
  | 'pedreiro'
  | 'diarista'
  | 'ar-condicionado'
  | 'marceneiro'
  | 'jardinagem'
  | 'montador'
  | 'fotografo'
  | 'freelancer'
  | 'confeitaria'
  | 'outro'

export type TipoItem = 'servico' | 'material'

export type StatusOrcamento = 'rascunho' | 'enviado' | 'aprovado' | 'recusado'

export interface ItemOrcamento {
  id: string
  descricao: string
  quantidade: number
  unidade: string
  precoUnitarioCentavos: number
  tipo: TipoItem
}

export interface Desconto {
  tipo: 'percentual' | 'valor'
  /** Percentual (0 a 100) ou valor em centavos, conforme o tipo. */
  valor: number
}

export interface Cliente {
  nome: string
  telefone: string
  endereco: string
}

export interface ClienteCadastro extends Cliente {
  id: string
  criadoEm: number
  atualizadoEm: number
}

export interface ItemCatalogo {
  id: string
  descricao: string
  unidade: string
  precoUnitarioCentavos: number
  tipo: TipoItem
  profissao: ProfissaoId
  atualizadoEm: number
}

export type ModoPix = 'total' | 'percentual' | 'sem-valor' | 'nao-incluir'

export interface OpcaoPix {
  modo: ModoPix
  /** Usado no modo 'percentual', por exemplo 50 para cobrar a entrada. */
  percentual: number
}

export type FormaPagamento = 'pix' | 'dinheiro' | 'cartao' | 'transferencia' | 'outro'

export interface Pagamento {
  id: string
  numeroRecibo: string
  valorCentavos: number
  forma: FormaPagamento
  data: number
  referente: string
}

export interface Orcamento {
  id: string
  numero: string
  profissao: ProfissaoId
  clienteId?: string
  cliente: Cliente
  itens: ItemOrcamento[]
  desconto: Desconto
  deslocamentoCentavos: number
  condicoesPagamento: string
  prazoExecucao: string
  validadeDias: number
  garantia: string
  observacoes: string
  status: StatusOrcamento
  pix: OpcaoPix
  pagamentos: Pagamento[]
  /** Identificador do link público de aprovação, quando já foi criado. */
  linkId?: string
  respondidoEm?: number
  /** Quando foi enviado ao cliente pela primeira vez. Usado para lembretes. */
  enviadoEm?: number
  criadoEm: number
  atualizadoEm: number
}

export interface Perfil {
  nome: string
  documento: string
  telefone: string
  email: string
  endereco: string
  cidade: string
  pix: string
  pixTipo?: TipoChavePix
  textoPagamento: string
  textoGarantia: string
  proximoNumero: number
  /** Legado da primeira versão. O catálogo substitui este campo. */
  precosSalvos: Record<string, number>
}

/** Dados do profissional que aparecem para o cliente no link público. */
export type PerfilPublico = Pick<Perfil, 'nome' | 'documento' | 'telefone' | 'email' | 'endereco' | 'cidade' | 'pix' | 'pixTipo'>

export type RespostaCliente = 'aprovado' | 'recusado'

export interface Compartilhamento {
  id: string
  uid: string
  orcamento: Orcamento
  perfil: PerfilPublico
  resposta: RespostaCliente | null
  nomeResposta: string
  respondidoEm: number | null
  /** Verdadeiro quando o cliente respondeu e o app do profissional ainda não registrou. */
  pendenteSync: boolean
  atualizadoEm: number
}

export interface Totais {
  servicos: number
  materiais: number
  subtotal: number
  desconto: number
  deslocamento: number
  total: number
}
