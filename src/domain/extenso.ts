const UNIDADES = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
const DEZ_A_DEZENOVE = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
const DEZENAS = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
const CENTENAS = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

/** Escreve por extenso um número de 1 a 999. */
function ate999(n: number): string {
  if (n === 100) return 'cem'
  const partes: string[] = []
  const c = Math.floor(n / 100)
  const resto = n % 100
  if (c) partes.push(CENTENAS[c])
  if (resto >= 10 && resto < 20) partes.push(DEZ_A_DEZENOVE[resto - 10])
  else {
    const d = Math.floor(resto / 10)
    const u = resto % 10
    if (d) partes.push(DEZENAS[d])
    if (u) partes.push(UNIDADES[u])
  }
  return partes.join(' e ')
}

const ESCALAS: [singular: string, plural: string][] = [
  ['', ''],
  ['mil', 'mil'],
  ['milhão', 'milhões'],
  ['bilhão', 'bilhões'],
]

/** Escreve por extenso um número inteiro não negativo. */
export function numeroPorExtenso(n: number): string {
  if (n === 0) return 'zero'
  const grupos: number[] = []
  for (let resto = Math.floor(n); resto > 0; resto = Math.floor(resto / 1000)) grupos.push(resto % 1000)

  const partes: { texto: string; valor: number }[] = []
  for (let i = grupos.length - 1; i >= 0; i--) {
    const g = grupos[i]
    if (!g) continue
    const [singular, plural] = ESCALAS[i]
    let texto: string
    if (i === 1) texto = g === 1 ? 'mil' : `${ate999(g)} mil`
    else if (i > 1) texto = `${ate999(g)} ${g === 1 ? singular : plural}`
    else texto = ate999(g)
    partes.push({ texto, valor: g })
  }

  // "mil e cem", "mil e vinte", mas "mil duzentos e trinta".
  return partes
    .map((p, i) => {
      if (i === 0) return p.texto
      const ultimo = i === partes.length - 1
      const usaE = ultimo && (p.valor < 100 || p.valor % 100 === 0)
      return `${usaE ? ' e ' : ' '}${p.texto}`
    })
    .join('')
}

/** Valor em centavos por extenso, em reais. Ex.: 125050 = "mil duzentos e cinquenta reais e cinquenta centavos". */
export function reaisPorExtenso(centavos: number): string {
  const total = Math.max(Math.round(centavos), 0)
  const reais = Math.floor(total / 100)
  const cent = total % 100
  if (reais === 0 && cent === 0) return 'zero real'

  const partes: string[] = []
  if (reais > 0) {
    const texto = numeroPorExtenso(reais)
    const exatoMilhoes = reais >= 1_000_000 && reais % 1_000_000 === 0
    partes.push(`${texto}${exatoMilhoes ? ' de' : ''} ${reais === 1 ? 'real' : 'reais'}`)
  }
  if (cent > 0) partes.push(`${numeroPorExtenso(cent)} ${cent === 1 ? 'centavo' : 'centavos'}`)
  return partes.join(' e ')
}
