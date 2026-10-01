import { Circle, Font, Image, Path, Rect, StyleSheet, Svg, Text, View } from '@react-pdf/renderer'
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
/** Tons bem claros da marca d'água: aparecem, mas não competem com o texto. */
const MARCA_DAGUA_FUNDO = '#fff1ea'
const MARCA_DAGUA_TEXTO = '#ede8e2'

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
  rodape: { position: 'absolute', bottom: 24, left: 36, right: 36, fontSize: 8, color: '#94a3b8', textAlign: 'center' },
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

export function Rodape({ marcaDagua }: { marcaDagua: boolean }) {
  return (
    <Text
      style={st.rodape}
      fixed
      render={({ pageNumber, totalPages }) =>
        `${marcaDagua ? `Feito com Q3 Orça  ·  Crie o seu grátis em ${SITE}  ·  ` : ''}Página ${pageNumber} de ${totalPages}`
      }
    />
  )
}

/**
 * Marca d'água do plano grátis: o símbolo do Q3 Orça grande, claro e na diagonal,
 * atrás do conteúdo, em todas as páginas. Fica bem visível sem atrapalhar a leitura.
 * Deve ser o primeiro filho da <Page>, para ficar por baixo do texto.
 */
export function MarcaDagua({ ativa }: { ativa: boolean }) {
  if (!ativa) return null
  return (
    <View fixed style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
      {/* Cores claras em vez de transparência: leitores de PDF nem sempre aplicam opacidade em vetores. */}
      <View style={{ alignItems: 'center', transform: 'rotate(-30deg)' }}>
        <Svg width={240} height={240} viewBox="0 0 48 48">
          <Rect width="48" height="48" rx="13" fill={MARCA_DAGUA_FUNDO} />
          <Circle cx="20" cy="22.5" r="10" fill="none" stroke="#ffffff" strokeWidth={5} />
          <Path d="M27.1 29.6 L30.8 33.3 L40.5 21.5" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={{ marginTop: 18, fontSize: 44, fontFamily: 'Helvetica-Bold', color: MARCA_DAGUA_TEXTO, letterSpacing: 1 }}>Q3 Orça</Text>
        <Text style={{ marginTop: 4, fontSize: 16, fontFamily: 'Helvetica', color: MARCA_DAGUA_TEXTO }}>Plano grátis</Text>
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
