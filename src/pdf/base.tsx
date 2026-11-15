import { Font, Image, Link, StyleSheet, Text, View } from '@react-pdf/renderer'
import { SITE_URL } from '../config'
import { coresDoDocumento } from '../domain/cores'
import type { PerfilPublico } from '../domain/types'

// A hifenização automática do react-pdf segue regras do inglês e insere hífens
// no meio de palavras e códigos (como o Pix copia-e-cola). Desligamos.
Font.registerHyphenationCallback((palavra) => [palavra])

// Cores da marca (manual em /marca). O nome AZUL fica por compatibilidade:
// agora é a cor Brasa 700, que tem bom contraste impresso.
export const AZUL = '#c43e0c'
export const BRASA = '#ff5a1f'
export const GRAFITE = '#1b1f2a'
export const CINZA = '#5b6372'
/**
 * Cinza da marca d'água. Já é claro sozinho e ainda recebe transparência:
 * se o leitor de PDF ignorar a opacidade, continua sem competir com o texto.
 */
const MARCA_DAGUA_COR = '#c4c8cf'
const MARCA_DAGUA_OPACIDADE = 0.4

export const st = StyleSheet.create({
  pagina: { padding: 36, paddingBottom: 56, fontSize: 10, fontFamily: 'Helvetica', color: GRAFITE },
  topo: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 3, borderBottomColor: BRASA, paddingBottom: 12 },
  empresa: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: GRAFITE },
  pequeno: { fontSize: 9, color: CINZA, marginTop: 2 },
  direita: { textAlign: 'right' },
  titulo: { fontSize: 18, fontFamily: 'Helvetica-Bold', textAlign: 'right', color: AZUL },
  bloco: { marginTop: 16 },
  rotulo: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: CINZA, textTransform: 'uppercase', marginBottom: 4, letterSpacing: 0.6 },
  negrito: { fontFamily: 'Helvetica-Bold' },
  texto: { marginBottom: 3 },
  assinatura: { marginTop: 48, flexDirection: 'row', justifyContent: 'space-around' },
  linhaAss: { width: 200, borderTopWidth: 0.5, borderTopColor: '#0f172a', paddingTop: 4, textAlign: 'center', fontSize: 9, color: CINZA },
  rodape: { position: 'absolute', bottom: 24, left: 36, right: 36, fontSize: 8, color: '#94a3b8', flexDirection: 'row', justifyContent: 'center' },
})

/** Cores do documento conforme o plano: marca do profissional (Pro) ou Brasa do Q3. */
export const cores = (perfil: PerfilPublico) => coresDoDocumento(perfil.corMarca, perfil.pro)

export function Cabecalho({ perfil, titulo, linhas }: { perfil: PerfilPublico; titulo: string; linhas: string[] }) {
  const cor = cores(perfil)
  const contato = [perfil.telefone, perfil.email].filter(Boolean).join('  ·  ')
  const local = [perfil.endereco, perfil.cidade].filter(Boolean).join(' - ')
  const web = [perfil.site, perfil.instagram ? `@${perfil.instagram.replace(/^@/, '')}` : ''].filter(Boolean).join('  ·  ')
  const logo = perfil.pro && perfil.logo ? perfil.logo : ''
  return (
    <View style={[st.topo, { borderBottomColor: cor.destaque }]}>
      <View style={{ flexDirection: 'row', gap: 12, maxWidth: 330 }}>
        {logo ? <Image src={logo} style={{ width: 64, height: 64, objectFit: 'contain' }} /> : null}
        <View style={{ flexShrink: 1 }}>
          <Text style={st.empresa}>{perfil.nome || 'Seu nome aqui'}</Text>
          {perfil.razaoSocial && perfil.razaoSocial !== perfil.nome ? <Text style={st.pequeno}>{perfil.razaoSocial}</Text> : null}
          {perfil.documento ? <Text style={st.pequeno}>CPF/CNPJ: {perfil.documento}</Text> : null}
          {contato ? <Text style={st.pequeno}>{contato}</Text> : null}
          {local ? <Text style={st.pequeno}>{local}</Text> : null}
          {web ? <Text style={st.pequeno}>{web}</Text> : null}
        </View>
      </View>
      <View>
        <Text style={[st.titulo, { color: cor.texto }]}>{titulo}</Text>
        {linhas.map((linha) => (
          <Text key={linha} style={[st.pequeno, st.direita]}>
            {linha}
          </Text>
        ))}
      </View>
    </View>
  )
}

const SITE = SITE_URL.replace(/^https?:\/\//, '')

/** Link do rodapé do plano grátis, com origem medida no funil. */
export const LINK_RODAPE_GRATIS = `${SITE_URL}/?utm_source=pdf&utm_medium=rodape-gratis`

/**
 * Rodapé de todas as páginas: número da página e, no plano grátis,
 * "<documento> feito com Q3 Orça — www.q3orca.com.br", clicável.
 */
export function Rodape({ marcaDagua, feitoCom = 'Orçamento feito' }: { marcaDagua: boolean; feitoCom?: string }) {
  return (
    <View style={st.rodape} fixed>
      {marcaDagua ? (
        <Link src={LINK_RODAPE_GRATIS} style={{ color: CINZA, textDecoration: 'none' }}>
          {`${feitoCom} com Q3 Orça — ${SITE}`}
        </Link>
      ) : null}
      {/* Separador com margem: o react-pdf corta os espaços do começo e do fim de cada texto. */}
      {marcaDagua ? <Text style={{ marginHorizontal: 6 }}>·</Text> : null}
      <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
    </View>
  )
}

/**
 * Marca d'água do plano grátis: "Q3 Orça" e o endereço do site, grandes, em cinza claro
 * e transparente, na diagonal da folha, atrás do conteúdo, em todas as páginas.
 * Deve ser o primeiro filho da <Page>, para ficar por baixo do texto.
 */
export function MarcaDagua({ ativa }: { ativa: boolean }) {
  if (!ativa) return null
  const texto = { color: MARCA_DAGUA_COR, opacity: MARCA_DAGUA_OPACIDADE, textAlign: 'center' as const }
  return (
    <View fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
      {/* -55° acompanha a diagonal da folha A4 (de baixo à esquerda para cima à direita). */}
      <View style={{ width: 700, alignItems: 'center', transform: 'rotate(-55deg)' }}>
        <Text style={{ ...texto, fontSize: 110, fontFamily: 'Helvetica-Bold', letterSpacing: 2 }}>Q3 Orça</Text>
        <Text style={{ ...texto, fontSize: 34, fontFamily: 'Helvetica', marginTop: 6, letterSpacing: 1 }}>{SITE}</Text>
      </View>
    </View>
  )
}

export function Secao({ titulo, texto }: { titulo: string; texto: string }) {
  if (!texto.trim()) return null
  return (
    <View style={st.bloco} wrap={false}>
      <Text style={st.rotulo}>{titulo}</Text>
      <Text style={st.texto}>{texto}</Text>
    </View>
  )
}

export function Assinaturas({ esquerda, direita }: { esquerda: string; direita: string }) {
  return (
    <View style={st.assinatura} wrap={false}>
      <Text style={st.linhaAss}>{esquerda}</Text>
      <Text style={st.linhaAss}>{direita}</Text>
    </View>
  )
}

export const dataBR = (ms: number) => new Date(ms).toLocaleDateString('pt-BR')
