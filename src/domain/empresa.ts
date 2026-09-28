/** Dados públicos de empresas: validação de CNPJ e leitura do cadastro da Receita Federal. */

export function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

export function cnpjValido(valor: string): boolean {
  const d = somenteDigitos(valor)
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false
  const digito = (base: string) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const soma = base.split('').reduce((t, n, i) => t + Number(n) * pesos[i], 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }
  return digito(d.slice(0, 12)) === Number(d[12]) && digito(d.slice(0, 13)) === Number(d[13])
}

export function formatarCnpj(valor: string): string {
  const d = somenteDigitos(valor)
  if (d.length !== 14) return valor
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}

function formatarTelefone(ddd: string): string {
  const d = somenteDigitos(ddd)
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  return ddd.trim()
}

/** Palavras em maiúsculas, como vêm da Receita, viram "Nome Próprio". */
export function capitalizar(texto: string): string {
  const minusculas = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em'])
  const siglas = new Set(['ltda', 'me', 'epp', 'eireli', 'sa', 's/a', 'mei'])
  return texto
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((p, i) => {
      if (siglas.has(p)) return p.toUpperCase()
      if (i > 0 && minusculas.has(p)) return p
      return p.charAt(0).toUpperCase() + p.slice(1)
    })
    .join(' ')
}

/** Campos do perfil preenchidos a partir do cadastro público. */
export interface DadosEmpresa {
  nome: string
  razaoSocial: string
  documento: string
  endereco: string
  cidade: string
  telefone: string
  email: string
  situacao: string
}

/** Resposta da BrasilAPI (https://brasilapi.com.br/api/cnpj/v1/{cnpj}), só com os campos usados. */
export interface RespostaCnpj {
  cnpj: string
  razao_social?: string
  nome_fantasia?: string | null
  logradouro?: string
  descricao_tipo_de_logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  municipio?: string
  uf?: string
  cep?: string
  ddd_telefone_1?: string
  email?: string | null
  descricao_situacao_cadastral?: string
}

export function empresaDaResposta(r: RespostaCnpj): DadosEmpresa {
  const razao = capitalizar(r.razao_social ?? '')
  const fantasia = capitalizar(r.nome_fantasia ?? '')
  const tipo = (r.descricao_tipo_de_logradouro ?? '').trim()
  const logradouro = (r.logradouro ?? '').trim()
  // Às vezes o logradouro já começa com o tipo ("QUADRA SAUN..."). Não repete.
  const rua = tipo && !logradouro.toUpperCase().startsWith(tipo.toUpperCase()) ? `${tipo} ${logradouro}` : logradouro
  const numero = /^S\/?N$/i.test(r.numero?.trim() ?? '') ? 'S/N' : r.numero?.trim()
  const endereco = [capitalizar(rua), numero, capitalizar(r.complemento ?? ''), capitalizar(r.bairro ?? '')]
    .filter(Boolean)
    .join(', ')
  return {
    nome: fantasia || razao,
    razaoSocial: razao,
    documento: formatarCnpj(r.cnpj),
    endereco,
    cidade: r.municipio ? `${capitalizar(r.municipio)} - ${(r.uf ?? '').toUpperCase()}`.replace(/ - $/, '') : '',
    telefone: r.ddd_telefone_1 ? formatarTelefone(r.ddd_telefone_1) : '',
    email: (r.email ?? '').toLowerCase(),
    situacao: capitalizar(r.descricao_situacao_cadastral ?? ''),
  }
}
