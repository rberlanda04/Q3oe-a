/**
 * Prepara o logo do profissional para guardar no Firestore.
 * O Cloud Storage exige o plano pago do Firebase, então o logo vai como PNG
 * pequeno dentro do próprio perfil (o limite de um documento é 1 MB).
 */

const LADO_MAXIMO = 480
const TAMANHO_MAXIMO = 250 * 1024

export class ErroImagem extends Error {}

function carregar(arquivo: File): Promise<HTMLImageElement> {
  return new Promise((resolver, rejeitar) => {
    const url = URL.createObjectURL(arquivo)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolver(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      rejeitar(new ErroImagem('Não foi possível ler esta imagem. Use PNG, JPG, WEBP ou SVG.'))
    }
    img.src = url
  })
}

function desenhar(img: HTMLImageElement, lado: number): string {
  const largura = img.naturalWidth || img.width || lado
  const altura = img.naturalHeight || img.height || lado
  const escala = Math.min(1, lado / Math.max(largura, altura))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(largura * escala))
  canvas.height = Math.max(1, Math.round(altura * escala))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ErroImagem('Seu navegador não conseguiu processar a imagem.')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  // PNG preserva a transparência e é aceito pelo gerador de PDF.
  return canvas.toDataURL('image/png')
}

/** Tamanho aproximado, em bytes, de um data URL em base64. */
export function bytesDoDataUrl(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.floor((base64.length * 3) / 4)
}

export async function prepararLogo(arquivo: File): Promise<string> {
  if (!arquivo.type.startsWith('image/')) throw new ErroImagem('Escolha um arquivo de imagem.')
  if (arquivo.size > 8 * 1024 * 1024) throw new ErroImagem('A imagem passa de 8 MB. Escolha uma menor.')
  const img = await carregar(arquivo)
  // Reduz até caber no limite. Logos simples costumam caber já na primeira tentativa.
  for (const lado of [LADO_MAXIMO, 360, 260, 180]) {
    const dataUrl = desenhar(img, lado)
    if (bytesDoDataUrl(dataUrl) <= TAMANHO_MAXIMO) return dataUrl
  }
  throw new ErroImagem('Este logo tem detalhes demais. Tente uma versão mais simples ou com fundo transparente.')
}
