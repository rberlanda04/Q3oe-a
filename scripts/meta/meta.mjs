/**
 * Publicação orgânica do Q3 Orça na página do Facebook e no Instagram (@q3orca) pela API da Meta
 * (Graph API), sem navegador.
 *
 *   npm run meta -- configurar                 (uma vez, no PC: pede App ID, App Secret e token; grava no cofre)
 *   npm run meta -- verificar                  (confere token, página, Instagram e validade)
 *   npm run meta -- previa  <post.json>        (mostra o que vai sair; não publica)
 *   npm run meta -- publicar <post.json> --confirmar   (publica ou agenda; só depois do OK do Rogério no chat)
 *   npm run meta -- programados                (posts agendados na página)
 *   npm run meta -- resultados [dias]          (alcance e reações dos últimos posts)
 *
 * Regras:
 * - O token mora só no cofre (C:\Users\rberl\.secrets\q3orca\meta.env), nunca no repositório nem no OneDrive.
 * - Só a página chamada "Q3 Orça" e o Instagram ligado a ela; qualquer outra (ex.: a de clips de GTA) é recusada.
 * - Sem --confirmar nada é publicado. O --confirmar só pode ser usado depois do "ok" do Rogério na conversa.
 * - Cada publicação é registrada no DIARIO.md da pasta q3orca-facebook.
 * - Grupos do Facebook não têm API de publicação desde 2024: grupos continuam pelo navegador.
 *
 * Formato do post (JSON):
 * { "id": "F25-facebook", "rede": "facebook" | "instagram", "tipo": "foto" | "reel",
 *   "texto": "legenda", "midia": "C:\\...\\midia\\v2\\facebook\\05-pintor.png",
 *   "quando": "2026-11-24T12:00:00-03:00" (opcional; só Facebook agenda pela API) }
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync, appendFileSync, statSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { homedir } from 'node:os'
import { createInterface } from 'node:readline/promises'

const VERSAO = process.env.META_GRAPH_VERSAO || 'v23.0'
const GRAPH = `https://graph.facebook.com/${VERSAO}`
const COFRE = join(homedir(), '.secrets', 'q3orca')
const ARQ_TOKEN = join(COFRE, 'meta.env')
const NOME_PAGINA = 'Q3 Orça'
const DIARIO = 'C:\\Users\\rberl\\Downloads\\q3orca-facebook\\DIARIO.md'

const [comando, ...args] = process.argv.slice(2)

function lerCofre() {
  if (!existsSync(ARQ_TOKEN)) throw new Error('Sem configuração. Rode no PC: npm run meta -- configurar')
  const cfg = {}
  for (const linha of readFileSync(ARQ_TOKEN, 'utf8').split(/\r?\n/)) {
    const m = linha.match(/^([A-Z_]+)=(.*)$/)
    if (m) cfg[m[1]] = m[2]
  }
  for (const k of ['META_PAGE_ID', 'META_PAGE_TOKEN']) if (!cfg[k]) throw new Error(`Falta ${k} no cofre. Rode: npm run meta -- configurar`)
  return cfg
}

async function graph(metodo, caminho, params = {}, token) {
  const url = new URL(GRAPH + caminho)
  let corpo
  if (metodo === 'GET') {
    for (const [k, v] of Object.entries({ ...params, access_token: token })) url.searchParams.set(k, String(v))
  } else if (params instanceof FormData) {
    params.set('access_token', token)
    corpo = params
  } else {
    corpo = new URLSearchParams({ ...params, access_token: token })
  }
  const r = await fetch(url, { method: metodo, body: corpo })
  const json = await r.json().catch(() => ({}))
  if (!r.ok || json.error) {
    const e = json.error || {}
    throw new Error(`Meta ${metodo} ${caminho}: ${e.message || r.status} (código ${e.code ?? '-'}${e.error_subcode ? '/' + e.error_subcode : ''})`)
  }
  return json
}

/* ---------- configurar ---------- */

async function configurar() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  console.log('Configuração da API da Meta para o Q3 Orça. Nada do que você digitar vai para o repositório.\n')
  const appId = (await rl.question('App ID: ')).trim()
  const appSecret = (await rl.question('App Secret: ')).trim()
  const curto = (await rl.question('Token de usuário (Graph API Explorer): ')).trim()
  rl.close()
  // Troca o token curto por um de 60 dias; o token de página derivado dele não expira.
  const longo = await graph('GET', '/oauth/access_token', { grant_type: 'fb_exchange_token', client_id: appId, client_secret: appSecret, fb_exchange_token: curto })
  const contas = await graph('GET', '/me/accounts', { fields: 'id,name,access_token,instagram_business_account{id,username}', limit: 100 }, longo.access_token)
  const pagina = (contas.data || []).find((p) => p.name.trim() === NOME_PAGINA)
  if (!pagina) {
    throw new Error(`Página "${NOME_PAGINA}" não encontrada. Páginas que o token vê: ${(contas.data || []).map((p) => p.name).join(', ') || 'nenhuma'}`)
  }
  const ig = pagina.instagram_business_account
  mkdirSync(COFRE, { recursive: true })
  writeFileSync(
    ARQ_TOKEN,
    [
      `META_APP_ID=${appId}`,
      `META_APP_SECRET=${appSecret}`,
      `META_PAGE_ID=${pagina.id}`,
      `META_PAGE_TOKEN=${pagina.access_token}`,
      `META_IG_ID=${ig?.id ?? ''}`,
      `META_IG_USUARIO=${ig?.username ?? ''}`,
      '',
    ].join('\n'),
    { mode: 0o600 },
  )
  console.log(`\nPronto. Página: ${pagina.name} (${pagina.id}). Instagram: ${ig ? '@' + ig.username : 'não ligado à página'}.`)
  console.log(`Guardado em ${ARQ_TOKEN}. Teste com: npm run meta -- verificar`)
}

/* ---------- verificar ---------- */

async function verificar() {
  const cfg = lerCofre()
  const pagina = await graph('GET', `/${cfg.META_PAGE_ID}`, { fields: 'name,fan_count,followers_count,instagram_business_account{username,followers_count}' }, cfg.META_PAGE_TOKEN)
  if (pagina.name.trim() !== NOME_PAGINA) throw new Error(`O token aponta para "${pagina.name}", não para "${NOME_PAGINA}". Parei.`)
  console.log(`Página: ${pagina.name} · ${pagina.followers_count ?? pagina.fan_count ?? '-'} seguidores`)
  const ig = pagina.instagram_business_account
  console.log(`Instagram: ${ig ? `@${ig.username} · ${ig.followers_count} seguidores` : 'não ligado'}`)
  if (cfg.META_APP_ID && cfg.META_APP_SECRET) {
    const dbg = await graph('GET', '/debug_token', { input_token: cfg.META_PAGE_TOKEN }, `${cfg.META_APP_ID}|${cfg.META_APP_SECRET}`)
    const d = dbg.data || {}
    console.log(`Token: ${d.is_valid ? 'válido' : 'INVÁLIDO'} · expira: ${d.expires_at ? new Date(d.expires_at * 1000).toLocaleString('pt-BR') : 'não expira'}`)
    console.log(`Permissões: ${(d.scopes || []).join(', ')}`)
    const faltam = ['pages_manage_posts', 'pages_read_engagement', 'instagram_basic', 'instagram_content_publish'].filter((s) => !(d.scopes || []).includes(s))
    if (faltam.length) console.log(`Faltam permissões: ${faltam.join(', ')}`)
  }
}

/* ---------- posts ---------- */

const TIPOS_IMAGEM = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg' }
const TIPOS_VIDEO = { '.mp4': 'video/mp4', '.mov': 'video/quicktime' }

export function validarPost(p, agora = Date.now()) {
  const erros = []
  if (!p || typeof p !== 'object') return ['arquivo não é um objeto JSON']
  if (!['facebook', 'instagram'].includes(p.rede)) erros.push('rede deve ser "facebook" ou "instagram"')
  if (!['foto', 'reel'].includes(p.tipo)) erros.push('tipo deve ser "foto" ou "reel"')
  if (!p.texto || typeof p.texto !== 'string') erros.push('texto vazio')
  else if (p.rede === 'instagram' && p.texto.length > 2200) erros.push('legenda do Instagram passa de 2.200 caracteres')
  if (p.rede === 'instagram' && /https?:\/\//.test(p.texto ?? '')) erros.push('Instagram não abre link na legenda: use "Link na bio."')
  if (p.rede === 'facebook' && /q3orca\.com\.br/.test(p.texto ?? '') && !/utm_source=/.test(p.texto)) erros.push('link do site sem utm')
  const ext = extname(p.midia ?? '').toLowerCase()
  if (!p.midia || !existsSync(p.midia)) erros.push(`mídia não encontrada: ${p.midia}`)
  else if (p.tipo === 'foto' && !TIPOS_IMAGEM[ext]) erros.push('foto precisa ser .png ou .jpg')
  else if (p.tipo === 'reel' && !TIPOS_VIDEO[ext]) erros.push('reel precisa ser .mp4 ou .mov')
  if (p.quando) {
    const t = Date.parse(p.quando)
    if (Number.isNaN(t)) erros.push('quando não é uma data válida (use 2026-11-24T12:00:00-03:00)')
    else if (p.rede === 'instagram') erros.push('a API do Instagram não agenda: tire o "quando" e publique na hora certa')
    else if (t - agora < 15 * 60 * 1000) erros.push('agendamento no Facebook precisa ser pelo menos 15 minutos no futuro')
    else if (t - agora > 29 * 24 * 3600 * 1000) erros.push('agendamento no Facebook vai até 29 dias à frente')
  }
  return erros
}

function lerPost(arquivo) {
  if (!arquivo) throw new Error('Diga o arquivo do post: npm run meta -- previa caminho\\post.json')
  return JSON.parse(readFileSync(arquivo, 'utf8'))
}

function mostrar(p) {
  const tam = existsSync(p.midia ?? '') ? `${(statSync(p.midia).size / 1024).toFixed(0)} KB` : '-'
  console.log(`\n${p.id ?? '(sem id)'} · ${p.rede} · ${p.tipo} · ${p.quando ? 'agendar para ' + new Date(p.quando).toLocaleString('pt-BR') : 'publicar na hora'}`)
  console.log(`Mídia: ${p.midia} (${tam})`)
  console.log('Texto:\n' + p.texto.split('\n').map((l) => '  ' + l).join('\n') + '\n')
}

function arquivoComoBlob(caminho) {
  const ext = extname(caminho).toLowerCase()
  return new Blob([readFileSync(caminho)], { type: TIPOS_IMAGEM[ext] || TIPOS_VIDEO[ext] || 'application/octet-stream' })
}

async function esperarContainer(id, token) {
  for (let i = 0; i < 60; i++) {
    const s = await graph('GET', `/${id}`, { fields: 'status_code,status' }, token)
    if (s.status_code === 'FINISHED') return
    if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') throw new Error(`Instagram recusou a mídia: ${s.status}`)
    await new Promise((r) => setTimeout(r, 5000))
  }
  throw new Error('Instagram demorou mais de 5 minutos para processar a mídia')
}

async function publicarFacebook(p, cfg) {
  const fd = new FormData()
  const agendado = p.quando ? { published: 'false', scheduled_publish_time: String(Math.floor(Date.parse(p.quando) / 1000)) } : {}
  if (p.tipo === 'foto') {
    fd.set('source', arquivoComoBlob(p.midia), basename(p.midia))
    fd.set('message', p.texto)
    for (const [k, v] of Object.entries(agendado)) fd.set(k, v)
    const r = await graph('POST', `/${cfg.META_PAGE_ID}/photos`, fd, cfg.META_PAGE_TOKEN)
    return r.post_id || r.id
  }
  fd.set('source', arquivoComoBlob(p.midia), basename(p.midia))
  fd.set('description', p.texto)
  for (const [k, v] of Object.entries(agendado)) fd.set(k, v)
  const r = await graph('POST', `/${cfg.META_PAGE_ID}/videos`, fd, cfg.META_PAGE_TOKEN)
  return r.id
}

/** A API do Instagram só aceita imagem por URL pública: sobe a foto na página como não publicada e usa o endereço dela. */
async function urlPublicaDaImagem(p, cfg) {
  const fd = new FormData()
  fd.set('source', arquivoComoBlob(p.midia), basename(p.midia))
  fd.set('published', 'false')
  fd.set('temporary', 'true')
  const foto = await graph('POST', `/${cfg.META_PAGE_ID}/photos`, fd, cfg.META_PAGE_TOKEN)
  const info = await graph('GET', `/${foto.id}`, { fields: 'images' }, cfg.META_PAGE_TOKEN)
  const maior = (info.images || []).sort((a, b) => b.width - a.width)[0]
  if (!maior?.source) throw new Error('Não consegui um endereço público para a imagem')
  return maior.source
}

async function publicarInstagram(p, cfg) {
  if (!cfg.META_IG_ID) throw new Error('Instagram não está ligado à página. Ligue no Business Suite e rode "configurar" de novo.')
  let container
  if (p.tipo === 'foto') {
    const image_url = await urlPublicaDaImagem(p, cfg)
    container = await graph('POST', `/${cfg.META_IG_ID}/media`, { image_url, caption: p.texto }, cfg.META_PAGE_TOKEN)
  } else {
    // Reel: envio do arquivo local em upload retomável (não precisa de URL pública).
    container = await graph('POST', `/${cfg.META_IG_ID}/media`, { media_type: 'REELS', upload_type: 'resumable', caption: p.texto, share_to_feed: 'true' }, cfg.META_PAGE_TOKEN)
    const bytes = readFileSync(p.midia)
    const up = await fetch(`https://rupload.facebook.com/ig-api-upload/${VERSAO}/${container.id}`, {
      method: 'POST',
      headers: { Authorization: `OAuth ${cfg.META_PAGE_TOKEN}`, offset: '0', file_size: String(bytes.length) },
      body: bytes,
    })
    if (!up.ok) throw new Error(`Envio do vídeo ao Instagram falhou: ${up.status} ${(await up.text()).slice(0, 200)}`)
  }
  await esperarContainer(container.id, cfg.META_PAGE_TOKEN)
  const pub = await graph('POST', `/${cfg.META_IG_ID}/media_publish`, { creation_id: container.id }, cfg.META_PAGE_TOKEN)
  return pub.id
}

function registrarNoDiario(p, id, erro) {
  const agora = new Date()
  const quando = agora.toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 16)
  const acao = p.quando ? `agendado para ${new Date(p.quando).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}` : 'publicado'
  const linhas = erro
    ? [`\n## ${quando} · ${p.id ?? 'post'} (API da Meta)`, `Falha ao publicar no ${p.rede} (${p.tipo}): ${erro}`, 'Nada foi publicado.']
    : [`\n## ${quando} · ${p.id ?? 'post'} (API da Meta)`, `Feito: ${p.tipo} ${acao} no ${p.rede}, mídia ${basename(p.midia)}. Id na Meta: ${id}.`, 'Falhas: nenhuma.']
  try {
    appendFileSync(DIARIO, linhas.join('\n') + '\n')
  } catch {
    console.log('Aviso: não consegui escrever no DIARIO.md; registre à mão.')
  }
}

async function publicar(arquivo) {
  const p = lerPost(arquivo)
  const erros = validarPost(p)
  mostrar(p)
  if (erros.length) throw new Error('Post com problema:\n- ' + erros.join('\n- '))
  if (!args.includes('--confirmar')) {
    console.log('Prévia apenas. Para publicar, depois do "ok" do Rogério no chat: npm run meta -- publicar <post.json> --confirmar')
    return
  }
  const cfg = lerCofre()
  const pagina = await graph('GET', `/${cfg.META_PAGE_ID}`, { fields: 'name' }, cfg.META_PAGE_TOKEN)
  if (pagina.name.trim() !== NOME_PAGINA) throw new Error(`O token aponta para "${pagina.name}". Parei.`)
  try {
    const id = p.rede === 'facebook' ? await publicarFacebook(p, cfg) : await publicarInstagram(p, cfg)
    registrarNoDiario(p, id)
    console.log(`${p.quando ? 'Agendado' : 'Publicado'} no ${p.rede}. Id: ${id}`)
  } catch (e) {
    registrarNoDiario(p, null, e.message)
    throw e
  }
}

async function programados() {
  const cfg = lerCofre()
  const r = await graph('GET', `/${cfg.META_PAGE_ID}/scheduled_posts`, { fields: 'id,message,scheduled_publish_time', limit: 50 }, cfg.META_PAGE_TOKEN)
  const lista = (r.data || []).sort((a, b) => a.scheduled_publish_time - b.scheduled_publish_time)
  if (!lista.length) return console.log('Nenhum post agendado pela API na página.')
  for (const p of lista) console.log(`${new Date(p.scheduled_publish_time * 1000).toLocaleString('pt-BR')} · ${(p.message || '').split('\n')[0].slice(0, 80)}`)
}

async function resultados() {
  const cfg = lerCofre()
  const dias = Number(args[0]) || 7
  const desde = Math.floor((Date.now() - dias * 24 * 3600 * 1000) / 1000)
  const fb = await graph('GET', `/${cfg.META_PAGE_ID}/posts`, { fields: 'created_time,message,reactions.summary(true),comments.summary(true),shares', since: desde, limit: 50 }, cfg.META_PAGE_TOKEN)
  console.log(`Facebook, últimos ${dias} dias:`)
  for (const p of fb.data || []) {
    console.log(`  ${p.created_time.slice(0, 10)} · ${p.reactions?.summary?.total_count ?? 0} reações · ${p.comments?.summary?.total_count ?? 0} comentários · ${p.shares?.count ?? 0} compart. · ${(p.message || '').split('\n')[0].slice(0, 60)}`)
  }
  if (cfg.META_IG_ID) {
    const ig = await graph('GET', `/${cfg.META_IG_ID}/media`, { fields: 'timestamp,caption,like_count,comments_count,media_product_type', limit: 25 }, cfg.META_PAGE_TOKEN)
    console.log('Instagram:')
    for (const m of (ig.data || []).filter((m) => Date.parse(m.timestamp) / 1000 >= desde)) {
      console.log(`  ${m.timestamp.slice(0, 10)} · ${m.media_product_type} · ${m.like_count ?? 0} curtidas · ${m.comments_count ?? 0} comentários · ${(m.caption || '').split('\n')[0].slice(0, 60)}`)
    }
  }
}

const comandos = { configurar, verificar, previa: () => publicar(args[0]), publicar: () => publicar(args[0]), programados, resultados }

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('meta.mjs')) {
  const fn = comandos[comando]
  if (!fn) {
    console.log('Comandos: configurar | verificar | previa <post.json> | publicar <post.json> --confirmar | programados | resultados [dias]')
    process.exit(comando ? 1 : 0)
  }
  // "previa" nunca publica, mesmo com --confirmar.
  if (comando === 'previa') {
    const i = args.indexOf('--confirmar')
    if (i >= 0) args.splice(i, 1)
  }
  fn().catch((e) => {
    console.error('Erro:', e.message)
    process.exit(1)
  })
}
