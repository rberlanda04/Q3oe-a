/**
 * Acesso administrativo às APIs do Google (Firestore, Auth, Cloud Run) com o login
 * do Firebase CLI de quem roda o comando. Não guarda nenhuma chave no repositório:
 * usa a credencial que o `firebase login` já salvou nesta máquina.
 *
 * Requer: firebase-tools instalado globalmente e `firebase login` feito com uma
 * conta dona do projeto q3orca.
 */
const path = require('node:path')
const fs = require('node:fs')
const { execSync } = require('node:child_process')

const PROJETO = 'q3orca'
const FIRESTORE = `https://firestore.googleapis.com/v1/projects/${PROJETO}/databases/(default)/documents`
const IDENTITY = `https://identitytoolkit.googleapis.com/v1/projects/${PROJETO}`

let tokenEmCache = null

async function token() {
  if (tokenEmCache) return tokenEmCache
  const global = execSync('npm root -g').toString().trim()
  const auth = require(path.join(global, 'firebase-tools', 'lib', 'auth.js'))
  const arquivo = path.join(process.env.USERPROFILE || process.env.HOME, '.config', 'configstore', 'firebase-tools.json')
  const cfg = JSON.parse(fs.readFileSync(arquivo, 'utf8'))
  if (!cfg.tokens?.refresh_token) throw new Error('Rode "firebase login" antes de usar os scripts de operação.')
  const t = await auth.getAccessToken(cfg.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform'])
  tokenEmCache = t.access_token
  return tokenEmCache
}

async function chamar(metodo, url, corpo) {
  const r = await fetch(url, {
    method: metodo,
    headers: { Authorization: `Bearer ${await token()}`, 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  })
  const texto = await r.text()
  let json = null
  try {
    json = texto ? JSON.parse(texto) : null
  } catch {
    /* resposta sem JSON */
  }
  if (!r.ok) throw new Error(`${metodo} ${url} -> ${r.status}: ${texto.slice(0, 300)}`)
  return json
}

/** Converte valores JS para o formato de campos do Firestore REST. */
function paraCampo(v) {
  if (v === null) return { nullValue: null }
  if (typeof v === 'string') return { stringValue: v }
  if (typeof v === 'boolean') return { booleanValue: v }
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(paraCampo) } }
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, paraCampo(x)])) } }
}

/** Converte campos do Firestore REST para valores JS. */
function deCampo(c) {
  if ('stringValue' in c) return c.stringValue
  if ('integerValue' in c) return Number(c.integerValue)
  if ('doubleValue' in c) return c.doubleValue
  if ('booleanValue' in c) return c.booleanValue
  if ('nullValue' in c) return null
  if ('timestampValue' in c) return new Date(c.timestampValue).getTime()
  if ('arrayValue' in c) return (c.arrayValue.values ?? []).map(deCampo)
  if ('mapValue' in c) return deDocumento({ fields: c.mapValue.fields ?? {} })
  return undefined
}

function deDocumento(doc) {
  return Object.fromEntries(Object.entries(doc.fields ?? {}).map(([k, v]) => [k, deCampo(v)]))
}

const firestore = {
  async ler(caminho) {
    try {
      return deDocumento(await chamar('GET', `${FIRESTORE}/${caminho}`))
    } catch (e) {
      if (String(e.message).includes('-> 404')) return null
      throw e
    }
  },
  async listar(colecao, limite = 300) {
    const r = await chamar('GET', `${FIRESTORE}/${colecao}?pageSize=${limite}`)
    return (r?.documents ?? []).map((d) => ({ id: d.name.split('/').pop(), ...deDocumento(d) }))
  },
  /** Grava (mesclando) os campos informados no documento. */
  async gravar(caminho, dados) {
    const mascara = Object.keys(dados).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&')
    const fields = Object.fromEntries(Object.entries(dados).map(([k, v]) => [k, paraCampo(v)]))
    return chamar('PATCH', `${FIRESTORE}/${caminho}?${mascara}`, { fields })
  },
  async apagar(caminho) {
    return chamar('DELETE', `${FIRESTORE}/${caminho}`)
  },
  /** Contagem com filtros opcionais de igualdade, em uma coleção ou em todas as subcoleções com o nome. */
  async contar(colecao, { grupo = false, igual = {} } = {}) {
    const filtros = Object.entries(igual).map(([campo, valor]) => ({
      fieldFilter: { field: { fieldPath: campo }, op: 'EQUAL', value: paraCampo(valor) },
    }))
    const where = filtros.length === 0 ? undefined : filtros.length === 1 ? filtros[0] : { compositeFilter: { op: 'AND', filters: filtros } }
    const r = await chamar('POST', `${FIRESTORE}:runAggregationQuery`, {
      structuredAggregationQuery: {
        structuredQuery: { from: [{ collectionId: colecao, allDescendants: grupo }], ...(where ? { where } : {}) },
        aggregations: [{ alias: 'total', count: {} }],
      },
    })
    return Number(r?.[0]?.result?.aggregateFields?.total?.integerValue ?? 0)
  },
}

const contas = {
  async porEmail(email) {
    const r = await chamar('POST', `${IDENTITY}/accounts:lookup`, { email: [email] })
    return r?.users?.[0] ?? null
  },
  async todas() {
    const lista = []
    let pagina
    do {
      const r = await chamar('POST', `${IDENTITY}/accounts:query`, { returnUserInfo: true, limit: '500', ...(pagina ? { offset: String(lista.length) } : {}) })
      lista.push(...(r?.userInfo ?? []))
      pagina = r?.userInfo?.length === 500
    } while (pagina)
    return lista
  },
  async apagar(uid) {
    return chamar('POST', `${IDENTITY}/accounts:delete`, { localId: uid })
  },
}

module.exports = { PROJETO, token, chamar, firestore, contas }
