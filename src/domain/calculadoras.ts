/**
 * Calculadoras grátis do site (páginas /calculadora/...). Contas puras, sem Firebase,
 * para testar e para o servidor pré-renderizar o resultado com os valores padrão.
 */

const positivo = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0)
const arredondar = (n: number, casas = 2) => Math.round(n * 10 ** casas) / 10 ** casas

/* ---------- Pintura ---------- */

export interface EntradaPintura {
  /** Área das paredes ou do teto, em m². */
  area: number
  /** Área de portas e janelas a descontar, em m². */
  descontos: number
  demaos: number
  /** Rendimento da tinta por demão, em m² por litro (o fabricante informa na lata). */
  rendimento: number
  /** Preço da mão de obra por m² pintado (já contando as demãos). */
  precoM2: number
}

export interface ResultadoPintura {
  areaPintada: number
  litros: number
  latas18: number
  galoes36: number
  maoDeObra: number
}

export function calcularPintura(e: EntradaPintura): ResultadoPintura {
  const areaPintada = Math.max(positivo(e.area) - positivo(e.descontos), 0)
  const rendimento = positivo(e.rendimento)
  const litros = rendimento ? (areaPintada * Math.max(Math.round(positivo(e.demaos)), 1)) / rendimento : 0
  return {
    areaPintada: arredondar(areaPintada),
    litros: arredondar(litros, 1),
    latas18: Math.ceil(litros / 18),
    galoes36: Math.ceil(litros / 3.6),
    maoDeObra: arredondar(areaPintada * positivo(e.precoM2)),
  }
}

/* ---------- Piso e revestimento ---------- */

export interface EntradaPiso {
  area: number
  /** Sobra para recortes e quebras, em %. 10% é o padrão; diagonal pede 15%. */
  perda: number
  /** m² por caixa (vem na embalagem). */
  m2PorCaixa: number
  /** Medidas da peça em cm, para o rejunte. */
  pecaCm: [number, number]
  /** Espessura da peça e largura da junta, em mm. */
  espessuraMm: number
  juntaMm: number
  /** Consumo de argamassa em kg por m² (dupla colagem em porcelanato: cerca de 8). */
  argamassaKgM2: number
  precoM2: number
}

export interface ResultadoPiso {
  areaComPerda: number
  caixas: number
  sacosArgamassa20kg: number
  rejunteKg: number
  maoDeObra: number
}

/**
 * Rejunte pela fórmula usada pelos fabricantes:
 * kg/m² = (C + L) / (C × L) × espessura × junta × 1,58, com C e L em mm.
 */
export function rejunteKgPorM2(pecaCm: [number, number], espessuraMm: number, juntaMm: number): number {
  const c = positivo(pecaCm[0]) * 10
  const l = positivo(pecaCm[1]) * 10
  if (!c || !l) return 0
  return ((c + l) / (c * l)) * positivo(espessuraMm) * positivo(juntaMm) * 1.58
}

export function calcularPiso(e: EntradaPiso): ResultadoPiso {
  const area = positivo(e.area)
  const areaComPerda = area * (1 + positivo(e.perda) / 100)
  const m2PorCaixa = positivo(e.m2PorCaixa)
  return {
    areaComPerda: arredondar(areaComPerda),
    caixas: m2PorCaixa ? Math.ceil(areaComPerda / m2PorCaixa - 1e-9) : 0,
    sacosArgamassa20kg: Math.ceil((area * positivo(e.argamassaKgM2)) / 20 - 1e-9),
    rejunteKg: arredondar(area * rejunteKgPorM2(e.pecaCm, e.espessuraMm, e.juntaMm), 1),
    maoDeObra: arredondar(area * positivo(e.precoM2)),
  }
}

/* ---------- Valor da hora ---------- */

export interface EntradaHora {
  /** Quanto quer tirar por mês, livre. */
  rendaDesejada: number
  /** Gastos do trabalho no mês: transporte, ferramentas, celular, MEI, INSS. */
  custosMensais: number
  diasPorSemana: number
  horasPorDia: number
  /** Parte do tempo que não é paga: orçamento, deslocamento, compra de material, em %. */
  tempoNaoPago: number
}

export interface ResultadoHora {
  horasPagasNoMes: number
  valorHora: number
  valorDiaria: number
}

/** 4,33 semanas por mês (52 semanas ÷ 12). */
export function calcularValorHora(e: EntradaHora): ResultadoHora {
  const horasNoMes = positivo(e.diasPorSemana) * positivo(e.horasPorDia) * (52 / 12)
  const horasPagas = horasNoMes * (1 - Math.min(positivo(e.tempoNaoPago), 90) / 100)
  const valorHora = horasPagas ? (positivo(e.rendaDesejada) + positivo(e.custosMensais)) / horasPagas : 0
  return {
    horasPagasNoMes: Math.round(horasPagas),
    valorHora: arredondar(valorHora),
    valorDiaria: arredondar(valorHora * positivo(e.horasPorDia)),
  }
}

export interface EntradaPrecoM2 {
  /** Quanto você quer ganhar por dia de trabalho (a sua diária). */
  diaria: number
  /** Quantos m² você pinta num dia, já com as demãos e a preparação. */
  m2PorDia: number
  /** Material por m², quando você fornece (0 se o cliente compra). */
  materialPorM2: number
  /** Área a pintar, já sem portas e janelas. */
  area: number
}

export interface ResultadoPrecoM2 {
  maoDeObraM2: number
  precoM2: number
  dias: number
  total: number
}

/** Preço da pintura por m² a partir da diária e da produtividade do próprio profissional. */
export function calcularPrecoM2(e: EntradaPrecoM2): ResultadoPrecoM2 {
  const produtividade = positivo(e.m2PorDia)
  const maoDeObraM2 = produtividade ? positivo(e.diaria) / produtividade : 0
  const precoM2 = maoDeObraM2 + positivo(e.materialPorM2)
  return {
    maoDeObraM2: arredondar(maoDeObraM2),
    precoM2: arredondar(precoM2),
    dias: produtividade ? Math.ceil((positivo(e.area) / produtividade) * 10) / 10 : 0,
    total: arredondar(precoM2 * positivo(e.area)),
  }
}
