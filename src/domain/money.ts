const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** Formata centavos inteiros como moeda brasileira. */
export function formatarBRL(centavos: number): string {
  return formatador.format(centavos / 100).replace(/ /g, ' ')
}

/**
 * Converte texto digitado em centavos inteiros.
 * Aceita "1.234,56", "1234,5", "1234.56", "R$ 10" e similares.
 */
export function parseBRL(texto: string): number {
  const limpo = texto.replace(/[^\d,.-]/g, '')
  if (!limpo) return 0
  let normalizado: string
  if (limpo.includes(',')) {
    normalizado = limpo.replace(/\./g, '').replace(',', '.')
  } else if (/\.\d{3}(\.|$)/.test(limpo) && !/\.\d{1,2}$/.test(limpo)) {
    normalizado = limpo.replace(/\./g, '')
  } else {
    normalizado = limpo
  }
  const valor = Number(normalizado)
  return Number.isFinite(valor) ? Math.round(valor * 100) : 0
}

/** Converte quantidade digitada ("2,5") em número. */
export function parseQuantidade(texto: string): number {
  const valor = Number(texto.replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(valor) && valor >= 0 ? valor : 0
}

/** Exibe centavos no formato de edição, sem símbolo: "1.234,56". */
export function centavosParaInput(centavos: number): string {
  if (!centavos) return ''
  return (centavos / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatarQuantidade(valor: number): string {
  return valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}
