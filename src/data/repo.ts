import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { chaveCatalogo, formatarNumero, normalizarOrcamento, PIX_PADRAO, proximaSequencia } from '../domain/calc'
import { modeloPorId } from '../domain/templates'
import type {
  Cliente,
  ClienteCadastro,
  Compartilhamento,
  ItemCatalogo,
  ItemOrcamento,
  Orcamento,
  Perfil,
  PerfilPublico,
  ProfissaoId,
  RespostaCliente,
} from '../domain/types'
import type { Assinatura } from '../domain/plano'
import { db } from '../lib/firebase'

// Escritas no Firestore entram no cache local na hora. Não esperamos a
// confirmação do servidor, para o app continuar rápido mesmo sem internet.
function gravar(promessa: Promise<unknown>) {
  promessa.catch((erro) => console.error('Falha ao sincronizar com o Firebase', erro))
}

export const PERFIL_VAZIO: Perfil = {
  nome: '',
  documento: '',
  telefone: '',
  email: '',
  endereco: '',
  cidade: '',
  razaoSocial: '',
  site: '',
  instagram: '',
  logo: '',
  corMarca: '',
  pix: '',
  textoPagamento: '50% de entrada e 50% na conclusão do serviço, via Pix ou dinheiro.',
  textoGarantia: '',
  proximoNumero: 0,
  precosSalvos: {},
}

const perfilRef = (uid: string) => doc(db, 'users', uid)
const orcamentosCol = (uid: string) => collection(db, 'users', uid, 'orcamentos')
const clientesCol = (uid: string) => collection(db, 'users', uid, 'clientes')
const catalogoCol = (uid: string) => collection(db, 'users', uid, 'catalogo')
const compartilhamentosCol = collection(db, 'compartilhamentos')

/* ---------- Perfil ---------- */

export type AoErrar = (erro: Error) => void

const registrarErro: AoErrar = (erro) => console.error('Falha ao ler do Firebase', erro)

/** Erro de permissão costuma significar regras do Firestore ainda não publicadas. */
export function mensagemErroLeitura(erro: Error): string {
  return erro.message.includes('permission')
    ? 'Sem permissão para ler os dados. Publique as regras do Firestore (veja o README).'
    : 'Não foi possível carregar os dados. Verifique sua conexão.'
}

export function ouvirPerfil(uid: string, callback: (perfil: Perfil) => void, erro: AoErrar = registrarErro): Unsubscribe {
  return onSnapshot(
    perfilRef(uid),
    (snap) => callback({ ...PERFIL_VAZIO, ...(snap.data() as Partial<Perfil> | undefined) }),
    (e) => {
      erro(e)
      callback(PERFIL_VAZIO)
    },
  )
}

export function salvarPerfil(uid: string, dados: Partial<Perfil>) {
  gravar(setDoc(perfilRef(uid), dados, { merge: true }))
}

/* ---------- Orçamentos ---------- */

export function ouvirOrcamentos(
  uid: string,
  callback: (lista: Orcamento[]) => void,
  erro: AoErrar = registrarErro,
): Unsubscribe {
  const consulta = query(orcamentosCol(uid), orderBy('atualizadoEm', 'desc'))
  return onSnapshot(
    consulta,
    (snap) => callback(snap.docs.map((d) => normalizarOrcamento({ ...(d.data() as Orcamento), id: d.id }))),
    erro,
  )
}

export function ouvirOrcamento(
  uid: string,
  id: string,
  callback: (orcamento: Orcamento | null) => void,
  erro: AoErrar = registrarErro,
): Unsubscribe {
  return onSnapshot(
    doc(orcamentosCol(uid), id),
    (snap) => callback(snap.exists() ? normalizarOrcamento({ ...(snap.data() as Orcamento), id: snap.id }) : null),
    erro,
  )
}

function proximoNumero(uid: string, perfil: Perfil): string {
  const sequencia = proximaSequencia(perfil)
  gravar(setDoc(perfilRef(uid), { ultimoNumero: sequencia }, { merge: true }))
  return formatarNumero(new Date().getFullYear(), sequencia)
}

export function criarOrcamento(
  uid: string,
  perfil: Perfil,
  profissao: ProfissaoId,
  cliente?: ClienteCadastro,
): string {
  const ref = doc(orcamentosCol(uid))
  const modelo = modeloPorId(profissao)
  const agora = Date.now()
  const orcamento: Orcamento = {
    id: ref.id,
    numero: proximoNumero(uid, perfil),
    profissao,
    ...(cliente ? { clienteId: cliente.id } : {}),
    cliente: cliente
      ? { nome: cliente.nome, telefone: cliente.telefone, endereco: cliente.endereco }
      : { nome: '', telefone: '', endereco: '' },
    itens: [],
    desconto: { tipo: 'percentual', valor: 0 },
    deslocamentoCentavos: 0,
    condicoesPagamento: perfil.textoPagamento,
    prazoExecucao: modelo.prazo,
    validadeDias: 15,
    garantia: perfil.textoGarantia || modelo.garantia,
    observacoes: '',
    status: 'rascunho',
    pix: PIX_PADRAO,
    pagamentos: [],
    criadoEm: agora,
    atualizadoEm: agora,
  }
  gravar(setDoc(ref, orcamento))
  return ref.id
}

export function duplicarOrcamento(uid: string, perfil: Perfil, original: Orcamento): string {
  const ref = doc(orcamentosCol(uid))
  const agora = Date.now()
  // Remove campos ligados ao orçamento original: cliente, link, pagamentos e resposta.
  const { clienteId: _c, linkId: _l, respondidoEm: _r, enviadoEm: _e, ...base } = original
  const copia: Orcamento = {
    ...base,
    id: ref.id,
    numero: proximoNumero(uid, perfil),
    cliente: { nome: '', telefone: '', endereco: '' },
    status: 'rascunho',
    pagamentos: [],
    criadoEm: agora,
    atualizadoEm: agora,
  }
  gravar(setDoc(ref, copia))
  return ref.id
}

export function salvarOrcamento(uid: string, orcamento: Orcamento) {
  gravar(setDoc(doc(orcamentosCol(uid), orcamento.id), { ...orcamento, atualizadoEm: Date.now() }))
}

export function excluirOrcamento(uid: string, orcamento: Orcamento) {
  gravar(deleteDoc(doc(orcamentosCol(uid), orcamento.id)))
  if (orcamento.linkId) gravar(deleteDoc(doc(compartilhamentosCol, orcamento.linkId)))
}

/* ---------- Clientes ---------- */

export function ouvirClientes(
  uid: string,
  callback: (lista: ClienteCadastro[]) => void,
  erro: AoErrar = registrarErro,
): Unsubscribe {
  return onSnapshot(
    query(clientesCol(uid), orderBy('nome')),
    (snap) => callback(snap.docs.map((d) => ({ ...(d.data() as ClienteCadastro), id: d.id }))),
    erro,
  )
}

/** Cria ou atualiza um cliente e devolve o id. */
export function salvarCliente(uid: string, cliente: Cliente & { id?: string }): string {
  const ref = cliente.id ? doc(clientesCol(uid), cliente.id) : doc(clientesCol(uid))
  const agora = Date.now()
  const dados = {
    id: ref.id,
    nome: cliente.nome.trim(),
    telefone: cliente.telefone.trim(),
    endereco: cliente.endereco.trim(),
    atualizadoEm: agora,
    ...(cliente.id ? {} : { criadoEm: agora }),
  }
  gravar(setDoc(ref, dados, { merge: true }))
  return ref.id
}

export function excluirCliente(uid: string, id: string) {
  gravar(deleteDoc(doc(clientesCol(uid), id)))
}

/* ---------- Catálogo ---------- */

export function ouvirCatalogo(
  uid: string,
  callback: (lista: ItemCatalogo[]) => void,
  erro: AoErrar = registrarErro,
): Unsubscribe {
  return onSnapshot(
    query(catalogoCol(uid), orderBy('descricao')),
    (snap) => callback(snap.docs.map((d) => ({ ...(d.data() as ItemCatalogo), id: d.id }))),
    erro,
  )
}

export function salvarItemCatalogo(uid: string, item: Omit<ItemCatalogo, 'id' | 'atualizadoEm'> & { id?: string }) {
  const id = item.id ?? chaveCatalogo(item.descricao)
  gravar(setDoc(doc(catalogoCol(uid), id), { ...item, id, descricao: item.descricao.trim(), atualizadoEm: Date.now() }))
}

/** Guarda no catálogo os itens com preço, para reaproveitar nos próximos orçamentos. */
export function aprenderItens(uid: string, itens: ItemOrcamento[], profissao: ProfissaoId, catalogo: ItemCatalogo[]) {
  const existentes = new Map(catalogo.map((i) => [i.id, i]))
  for (const item of itens) {
    const descricao = item.descricao.trim()
    if (!descricao || item.precoUnitarioCentavos <= 0) continue
    const id = chaveCatalogo(descricao)
    const atual = existentes.get(id)
    if (
      atual &&
      atual.precoUnitarioCentavos === item.precoUnitarioCentavos &&
      atual.unidade === item.unidade &&
      atual.tipo === item.tipo
    )
      continue
    salvarItemCatalogo(uid, {
      id,
      descricao,
      unidade: item.unidade,
      precoUnitarioCentavos: item.precoUnitarioCentavos,
      tipo: item.tipo,
      profissao: atual?.profissao ?? profissao,
    })
  }
}

export function excluirItemCatalogo(uid: string, id: string) {
  gravar(deleteDoc(doc(catalogoCol(uid), id)))
}

/* ---------- Link público de aprovação ---------- */

/** Dados que o cliente vê. A marca própria só vai junto quando o profissional tem Pro. */
export function perfilPublico(p: Perfil, pro: boolean): PerfilPublico {
  return {
    nome: p.nome,
    documento: p.documento,
    telefone: p.telefone,
    email: p.email,
    endereco: p.endereco,
    cidade: p.cidade,
    pix: p.pix,
    ...(p.pixTipo ? { pixTipo: p.pixTipo } : {}),
    razaoSocial: p.razaoSocial,
    site: p.site,
    instagram: p.instagram,
    pro,
    ...(pro ? { logo: p.logo, corMarca: p.corMarca } : {}),
  }
}

/**
 * Publica (ou atualiza) a cópia pública do orçamento e devolve o id do link.
 * A resposta do cliente, se já existir, é preservada.
 */
export function publicarLink(uid: string, orcamento: Orcamento, perfilDoCliente: PerfilPublico): string {
  const ref = orcamento.linkId ? doc(compartilhamentosCol, orcamento.linkId) : doc(compartilhamentosCol)
  // O cliente não precisa ver pagamentos nem identificadores internos.
  const { pagamentos: _p, clienteId: _c, linkId: _l, ...publico } = orcamento
  const dados = {
    id: ref.id,
    uid,
    orcamento: { ...publico, pagamentos: [] },
    perfil: perfilDoCliente,
    atualizadoEm: Date.now(),
  }
  if (orcamento.linkId) {
    gravar(updateDoc(ref, dados))
  } else {
    const novo: Compartilhamento = { ...dados, resposta: null, nomeResposta: '', respondidoEm: null, pendenteSync: false }
    gravar(setDoc(ref, novo))
  }
  return ref.id
}

export function ouvirCompartilhamento(
  id: string,
  callback: (dados: Compartilhamento | null) => void,
  erro: (e: Error) => void,
): Unsubscribe {
  return onSnapshot(
    doc(compartilhamentosCol, id),
    (snap) => {
      if (!snap.exists()) return callback(null)
      const dados = snap.data() as Compartilhamento
      callback({ ...dados, orcamento: normalizarOrcamento(dados.orcamento) })
    },
    erro,
  )
}

/** Usado pelo cliente, sem login. Aqui esperamos o servidor para confirmar. */
export async function responderOrcamento(id: string, resposta: RespostaCliente, nome: string) {
  await updateDoc(doc(compartilhamentosCol, id), {
    resposta,
    nomeResposta: nome.trim().slice(0, 100),
    respondidoEm: Date.now(),
    pendenteSync: true,
  })
}

/**
 * Registra no orçamento as respostas que os clientes deram pelo link.
 * Fica ativo enquanto o profissional está com o app aberto.
 */
export function sincronizarRespostas(uid: string): Unsubscribe {
  const consulta = query(compartilhamentosCol, where('uid', '==', uid), where('pendenteSync', '==', true))
  return onSnapshot(
    consulta,
    (snap) => {
      for (const d of snap.docs) {
        const dados = d.data() as Compartilhamento
        if (!dados.resposta) continue
        gravar(
          setDoc(
            doc(orcamentosCol(uid), dados.orcamento.id),
            { status: dados.resposta, respondidoEm: dados.respondidoEm ?? Date.now(), atualizadoEm: Date.now() },
            { merge: true },
          ),
        )
        gravar(updateDoc(d.ref, { pendenteSync: false }))
      }
    },
    (erro) => console.error('Falha ao sincronizar respostas', erro),
  )
}

/* ---------- Plano e interesse no Pro ---------- */

/** Assinatura Pro, gravada apenas pelo administrador em assinaturas/{uid}. */
export function ouvirAssinatura(uid: string, callback: (assinatura: Assinatura | null) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'assinaturas', uid),
    (snap) => {
      if (!snap.exists()) return callback(null)
      const dados = snap.data() as { plano?: string; validoAte?: number | { toMillis: () => number } }
      // No console do Firebase, "validoAte" pode ser um carimbo de data ou um número em milissegundos.
      const validoAte = typeof dados.validoAte === 'number' ? dados.validoAte : (dados.validoAte?.toMillis?.() ?? 0)
      callback(dados.plano === 'pro' ? { plano: 'pro', validoAte } : null)
    },
    () => callback(null),
  )
}

/** Registra que o profissional quer assinar o Pro, para o time de vendas entrar em contato. */
export async function registrarInteressePro(uid: string, dados: { nome: string; email: string; telefone: string; plano: 'mensal' | 'anual' }) {
  await setDoc(doc(db, 'interesses', uid), { ...dados, uid, criadoEm: Date.now() })
}

/* ---------- Administração ---------- */

/** O usuário é administrador se existir admins/{uid}, criado só pelo console do Firebase. */
export function ouvirSouAdmin(uid: string, callback: (admin: boolean) => void): Unsubscribe {
  return onSnapshot(
    doc(db, 'admins', uid),
    (snap) => callback(snap.exists()),
    () => callback(false),
  )
}

export interface PedidoPro {
  uid: string
  nome: string
  email: string
  telefone: string
  plano: 'mensal' | 'anual'
  criadoEm: number
}

export function ouvirPedidosPro(callback: (lista: PedidoPro[]) => void, erro: AoErrar = registrarErro): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'interesses'), orderBy('criadoEm', 'desc')),
    (snap) => callback(snap.docs.map((d) => d.data() as PedidoPro)),
    erro,
  )
}

export type AssinaturaAdmin = Assinatura & { uid: string }

export function ouvirAssinaturas(callback: (lista: AssinaturaAdmin[]) => void, erro: AoErrar = registrarErro): Unsubscribe {
  return onSnapshot(
    collection(db, 'assinaturas'),
    (snap) =>
      callback(
        snap.docs
          .map((d) => {
            const dados = d.data() as { validoAte?: number | { toMillis: () => number } } & Omit<Assinatura, 'validoAte'>
            const validoAte = typeof dados.validoAte === 'number' ? dados.validoAte : (dados.validoAte?.toMillis?.() ?? 0)
            return { ...dados, validoAte, uid: d.id }
          })
          .sort((a, b) => b.validoAte - a.validoAte),
      ),
    erro,
  )
}

/** Grava a assinatura Pro. Espera o servidor, para o admin ter certeza de que valeu. */
export async function gravarAssinatura(
  uid: string,
  dados: { validoAte: number; nome: string; email: string; periodo?: 'mensal' | 'anual' },
) {
  await setDoc(doc(db, 'assinaturas', uid), { plano: 'pro', ...dados, atualizadoEm: Date.now() }, { merge: true })
}

export async function excluirPedidoPro(uid: string) {
  await deleteDoc(doc(db, 'interesses', uid))
}

/* ---------- Exclusão da conta (LGPD) ---------- */

/**
 * Apaga todos os dados do profissional. Espera o servidor confirmar cada etapa.
 * A conta de login é apagada depois, pela tela, porque pode exigir login recente.
 */
export async function excluirDadosDaConta(uid: string) {
  const refs = []
  for (const col of [orcamentosCol(uid), clientesCol(uid), catalogoCol(uid)]) {
    refs.push(...(await getDocs(col)).docs.map((d) => d.ref))
  }
  refs.push(...(await getDocs(query(compartilhamentosCol, where('uid', '==', uid)))).docs.map((d) => d.ref))
  // Lotes de até 500 gravações, o limite do Firestore.
  for (let i = 0; i < refs.length; i += 450) {
    const lote = writeBatch(db)
    for (const ref of refs.slice(i, i + 450)) lote.delete(ref)
    await lote.commit()
  }
  await deleteDoc(doc(db, 'interesses', uid))
  await deleteDoc(perfilRef(uid))
}

/* ---------- Exportação (LGPD e backup) ---------- */

export async function exportarDados(uid: string, perfil: Perfil) {
  const [orcamentos, clientes, catalogo] = await Promise.all(
    [orcamentosCol(uid), clientesCol(uid), catalogoCol(uid)].map(async (col) =>
      (await getDocs(col)).docs.map((d) => d.data()),
    ),
  )
  return { exportadoEm: new Date().toISOString(), perfil, orcamentos, clientes, catalogo }
}
