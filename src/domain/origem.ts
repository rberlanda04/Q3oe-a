/**
 * Origem de um cadastro (de onde a pessoa veio): os parâmetros utm do link, do QR Code
 * ou do anúncio, ou o site que trouxe a visita. Vale o PRIMEIRO acesso (first touch),
 * para cada canal da campanha receber o crédito de quem trouxe.
 */
export interface Origem {
  /** utm_source: parceiro ou canal (balaroti, whatsapp, instagram, google…). */
  fonte: string
  /** utm_medium: formato (cartaz, convite, anuncio, organico, referencia…). */
  meio: string
  /** utm_campaign, quando houver (ex.: fundadores-curitiba). */
  campanha: string
  /** Página em que a pessoa chegou. */
  pagina: string
  /** Quando chegou (ms). */
  em: number
}

const BUSCADORES = ['google.', 'bing.', 'duckduckgo.', 'yahoo.', 'ecosia.']
const SOCIAIS: Record<string, string> = {
  'facebook.com': 'facebook',
  'instagram.com': 'instagram',
  'l.instagram.com': 'instagram',
  'lm.facebook.com': 'facebook',
  'm.facebook.com': 'facebook',
  'wa.me': 'whatsapp',
  'web.whatsapp.com': 'whatsapp',
  'youtube.com': 'youtube',
  'tiktok.com': 'tiktok',
  'linkedin.com': 'linkedin',
}

const limpar = (v: string | null | undefined) =>
  (v ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .slice(0, 60)

/** Lê a origem de uma visita. Sem utm, deduz pelo site que trouxe (referrer). */
export function origemDaVisita(url: string, referrer: string, agora: number, hostProprio: string): Origem {
  const u = new URL(url)
  const p = u.searchParams
  const pagina = u.pathname.slice(0, 120)
  if (p.get('utm_source')) {
    return { fonte: limpar(p.get('utm_source')), meio: limpar(p.get('utm_medium')) || 'nao-informado', campanha: limpar(p.get('utm_campaign')), pagina, em: agora }
  }
  let host = ''
  try {
    host = referrer ? new URL(referrer).hostname.replace(/^www\./, '') : ''
  } catch {
    host = ''
  }
  if (!host || host === hostProprio.replace(/^www\./, '')) return { fonte: 'direto', meio: 'nenhum', campanha: '', pagina, em: agora }
  if (BUSCADORES.some((b) => host.includes(b))) return { fonte: host.split('.').find((x) => x !== 'www') ?? host, meio: 'organico', campanha: '', pagina, em: agora }
  const social = Object.entries(SOCIAIS).find(([dom]) => host === dom || host.endsWith(`.${dom}`))
  if (social) return { fonte: social[1], meio: 'social', campanha: '', pagina, em: agora }
  return { fonte: limpar(host), meio: 'referencia', campanha: '', pagina, em: agora }
}

/**
 * Vale a primeira origem dentro da validade. Exceção: se a primeira foi "direto" (sem pista),
 * a primeira origem com pista a substitui. Depois da validade, recomeça.
 */
export function escolherOrigem(guardada: Origem | null, nova: Origem, validadeMs: number): Origem {
  if (!guardada) return nova
  if (nova.em - guardada.em > validadeMs) return nova
  if (guardada.fonte === 'direto' && nova.fonte !== 'direto') return nova
  return guardada
}
