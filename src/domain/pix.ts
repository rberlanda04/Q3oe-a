/**
 * Geração do Pix copia-e-cola estático (BR Code), no padrão EMV do Banco Central.
 * Não usa nenhuma API: o código é montado no próprio aparelho.
 */

export type TipoChavePix = 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria'

export const TIPOS_CHAVE: { id: TipoChavePix; rotulo: string }[] = [
  { id: 'cpf', rotulo: 'CPF' },
  { id: 'cnpj', rotulo: 'CNPJ' },
  { id: 'telefone', rotulo: 'Celular' },
  { id: 'email', rotulo: 'E-mail' },
  { id: 'aleatoria', rotulo: 'Chave aleatória' },
]

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function cpfValido(valor: string): boolean {
  const d = valor.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const digito = (tamanho: number) => {
    let soma = 0
    for (let i = 0; i < tamanho; i++) soma += Number(d[i]) * (tamanho + 1 - i)
    const resto = (soma * 10) % 11
    return resto === 10 ? 0 : resto
  }
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10])
}

export function detectarTipoChave(chave: string): TipoChavePix {
  const limpa = chave.trim()
  if (limpa.includes('@')) return 'email'
  if (UUID.test(limpa)) return 'aleatoria'
  if (limpa.startsWith('+') || /[()]/.test(limpa)) return 'telefone'
  const digitos = limpa.replace(/\D/g, '')
  if (digitos.length === 14) return 'cnpj'
  if (digitos.length === 11 && cpfValido(digitos)) return 'cpf'
  if (digitos.length >= 10 && digitos.length <= 13) return 'telefone'
  return 'aleatoria'
}

export function normalizarChave(chave: string, tipo: TipoChavePix): string {
  const limpa = chave.trim()
  switch (tipo) {
    case 'cpf':
    case 'cnpj':
      return limpa.replace(/\D/g, '')
    case 'telefone': {
      const digitos = limpa.replace(/\D/g, '')
      return digitos.length <= 11 ? `+55${digitos}` : `+${digitos}`
    }
    case 'email':
    case 'aleatoria':
      return limpa.toLowerCase()
  }
}

/** Remove acentos e símbolos, como exige o padrão para nome e cidade. */
export function textoPix(texto: string, maximo: number): string {
  return texto
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^A-Za-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
    .slice(0, maximo)
    .trim()
}

/** CRC16-CCITT-FALSE (polinômio 0x1021, valor inicial 0xFFFF). */
export function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
      crc &= 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function campo(id: string, valor: string): string {
  return `${id}${String(valor.length).padStart(2, '0')}${valor}`
}

export interface DadosPix {
  chave: string
  tipo?: TipoChavePix
  nome: string
  cidade: string
  valorCentavos?: number
  /** Identificador exibido no extrato. Só letras e números, até 25 caracteres. */
  txid?: string
}

export function gerarPixCopiaECola(dados: DadosPix): string {
  const tipo = dados.tipo ?? detectarTipoChave(dados.chave)
  const conta = campo('00', 'br.gov.bcb.pix') + campo('01', normalizarChave(dados.chave, tipo))
  const txid = (dados.txid ?? '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25) || '***'
  const cidade = textoPix(dados.cidade.split(/[-,/]/)[0] ?? '', 15) || 'BRASIL'

  let payload =
    campo('00', '01') +
    campo('26', conta) +
    campo('52', '0000') +
    campo('53', '986') +
    (dados.valorCentavos && dados.valorCentavos > 0 ? campo('54', (dados.valorCentavos / 100).toFixed(2)) : '') +
    campo('58', 'BR') +
    campo('59', textoPix(dados.nome, 25) || 'RECEBEDOR') +
    campo('60', cidade) +
    campo('62', campo('05', txid)) +
    '6304'
  payload += crc16(payload)
  return payload
}
