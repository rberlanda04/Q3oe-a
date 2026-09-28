import { cnpjValido, empresaDaResposta, somenteDigitos, type DadosEmpresa, type RespostaCnpj } from '../domain/empresa'

/**
 * Consulta os dados públicos de um CNPJ na BrasilAPI, que espelha o cadastro
 * aberto da Receita Federal. É gratuita e não precisa de chave.
 */
export async function buscarEmpresa(cnpj: string): Promise<DadosEmpresa> {
  if (!cnpjValido(cnpj)) throw new Error('CNPJ inválido. Confira os números.')
  let resposta: Response
  try {
    resposta = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${somenteDigitos(cnpj)}`)
  } catch {
    throw new Error('Sem conexão com a consulta de CNPJ. Tente de novo em instantes.')
  }
  if (resposta.status === 404) throw new Error('CNPJ não encontrado no cadastro da Receita.')
  if (!resposta.ok) throw new Error('A consulta de CNPJ está indisponível agora. Preencha manualmente ou tente mais tarde.')
  return empresaDaResposta((await resposta.json()) as RespostaCnpj)
}
