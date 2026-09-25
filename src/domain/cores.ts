/** Paletas da marca Q3 Orça. Os mesmos valores estão em src/index.css. */

export interface Cor {
  nome: string
  hex: string
  uso?: string
}

export interface Escala {
  nome: string
  descricao: string
  tons: { tom: string; hex: string }[]
}

export const PRINCIPAIS: Cor[] = [
  { nome: 'Brasa 500', hex: '#ff5a1f', uso: 'Símbolo, destaques e fundos de chamada.' },
  { nome: 'Grafite 900', hex: '#1b1f2a', uso: 'Textos, títulos e superfícies escuras.' },
  { nome: 'Areia 100', hex: '#faf6f0', uso: 'Fundo padrão. Quente, lembra papel.' },
]

export const APOIO: Cor[] = [
  { nome: 'Brasa 700', hex: '#c43e0c', uso: 'Botões e links. Contraste AA com branco.' },
  { nome: 'Aprovado 600', hex: '#167c42', uso: 'Aprovação, pagamento recebido, WhatsApp.' },
  { nome: 'Régua 400', hex: '#ffc53d', uso: 'Realce pontual, sublinhados e avisos.' },
  { nome: 'Planta 500', hex: '#2b59c3', uso: 'Informação e links secundários.' },
  { nome: 'Alerta 600', hex: '#c8342b', uso: 'Erros e ações destrutivas.' },
]

export const ESCALAS: Escala[] = [
  {
    nome: 'Brasa',
    descricao: 'A energia do trabalho. O laranja da obra, do capacete, da chama do fogão.',
    tons: [
      { tom: '50', hex: '#fff4ed' },
      { tom: '100', hex: '#ffe4d3' },
      { tom: '200', hex: '#ffc5a6' },
      { tom: '300', hex: '#ff9b6b' },
      { tom: '400', hex: '#ff7a45' },
      { tom: '500', hex: '#ff5a1f' },
      { tom: '600', hex: '#e64a12' },
      { tom: '700', hex: '#c43e0c' },
      { tom: '800', hex: '#9c330e' },
      { tom: '900', hex: '#6e2106' },
    ],
  },
  {
    nome: 'Grafite',
    descricao: 'A seriedade do profissional. Firme, legível, confiável.',
    tons: [
      { tom: '50', hex: '#f4f5f7' },
      { tom: '100', hex: '#e6e8ec' },
      { tom: '200', hex: '#c9cdd6' },
      { tom: '300', hex: '#a3a9b6' },
      { tom: '400', hex: '#7a8292' },
      { tom: '500', hex: '#5b6372' },
      { tom: '600', hex: '#454c59' },
      { tom: '700', hex: '#343a45' },
      { tom: '800', hex: '#252a33' },
      { tom: '900', hex: '#1b1f2a' },
    ],
  },
  {
    nome: 'Areia',
    descricao: 'O acolhimento. Um fundo quente que descansa a vista, longe do branco hospitalar.',
    tons: [
      { tom: '50', hex: '#fdfbf8' },
      { tom: '100', hex: '#faf6f0' },
      { tom: '200', hex: '#f3ece1' },
      { tom: '300', hex: '#e7ddcd' },
      { tom: '400', hex: '#d6c7af' },
    ],
  },
]

/** Paletas de campanha: combinações prontas para redes sociais, anúncios e materiais impressos. */
export const CAMPANHAS: { nome: string; ideia: string; cores: Cor[] }[] = [
  {
    nome: 'Canteiro',
    ideia: 'Energia máxima. Para lançamentos e chamadas de ação.',
    cores: [
      { nome: 'Brasa 500', hex: '#ff5a1f' },
      { nome: 'Régua 400', hex: '#ffc53d' },
      { nome: 'Grafite 900', hex: '#1b1f2a' },
      { nome: 'Branco', hex: '#ffffff' },
    ],
  },
  {
    nome: 'Dinheiro na conta',
    ideia: 'Pagamento, aprovação e resultado. Para falar de Pix e recebimentos.',
    cores: [
      { nome: 'Aprovado 600', hex: '#167c42' },
      { nome: 'Aprovado 100', hex: '#d3f3df' },
      { nome: 'Grafite 900', hex: '#1b1f2a' },
      { nome: 'Areia 100', hex: '#faf6f0' },
    ],
  },
  {
    nome: 'Planta baixa',
    ideia: 'Técnica e precisa. Para conteúdo educativo e dicas de profissão.',
    cores: [
      { nome: 'Planta 700', hex: '#1f418f' },
      { nome: 'Planta 50', hex: '#eef3fd' },
      { nome: 'Brasa 500', hex: '#ff5a1f' },
      { nome: 'Branco', hex: '#ffffff' },
    ],
  },
  {
    nome: 'Noite de obra',
    ideia: 'Sofisticada e noturna. Para depoimentos e comunicados.',
    cores: [
      { nome: 'Grafite 950', hex: '#11141b' },
      { nome: 'Grafite 700', hex: '#343a45' },
      { nome: 'Brasa 400', hex: '#ff7a45' },
      { nome: 'Areia 200', hex: '#f3ece1' },
    ],
  },
]

function canal(valor: number): number {
  const c = valor / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function luminancia(hex: string): number {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = canal((n >> 16) & 255)
  const g = canal((n >> 8) & 255)
  const b = canal(n & 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Razão de contraste da WCAG entre duas cores, de 1 a 21. */
export function contraste(a: string, b: string): number {
  const [claro, escuro] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (claro + 0.05) / (escuro + 0.05)
}

export function nivelWcag(razao: number): 'AAA' | 'AA' | 'AA grande' | 'Não usar em texto' {
  if (razao >= 7) return 'AAA'
  if (razao >= 4.5) return 'AA'
  if (razao >= 3) return 'AA grande'
  return 'Não usar em texto'
}

/** Cor de texto legível sobre um fundo. */
export function textoSobre(fundo: string): string {
  return contraste(fundo, '#ffffff') >= contraste(fundo, '#1b1f2a') ? '#ffffff' : '#1b1f2a'
}
