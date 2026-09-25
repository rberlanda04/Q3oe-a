import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { calcularTotais, dataValidade, subtotalItem } from '../domain/calc'
import { formatarBRL, formatarQuantidade } from '../domain/money'
import type { Orcamento, PerfilPublico } from '../domain/types'
import { Assinaturas, Cabecalho, CINZA, dataBR, Rodape, Secao, st } from './base'

const t = StyleSheet.create({
  tabelaCab: { flexDirection: 'row', backgroundColor: '#fff4ed', paddingVertical: 6, paddingHorizontal: 6, fontFamily: 'Helvetica-Bold', fontSize: 9 },
  linha: { flexDirection: 'row', paddingVertical: 6, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: '#e7ddcd' },
  cDesc: { flex: 1 },
  cQtd: { width: 70, textAlign: 'right' },
  cUnit: { width: 75, textAlign: 'right' },
  cTotal: { width: 80, textAlign: 'right' },
  totais: { marginTop: 10, marginLeft: 'auto', width: 230 },
  totalLinha: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  totalFinal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, paddingTop: 6, borderTopWidth: 1.5, borderTopColor: '#ff5a1f', fontSize: 13, fontFamily: 'Helvetica-Bold' },
  pix: { marginTop: 16, padding: 10, backgroundColor: '#edfaf2', borderRadius: 4, flexDirection: 'row', gap: 12, alignItems: 'center' },
  qr: { width: 96, height: 96 },
  codigo: { fontSize: 6.5, color: CINZA, marginTop: 4 },
  execucao: { marginTop: 16, flexDirection: 'row', gap: 24 },
  campoLinha: { flex: 1, borderBottomWidth: 0.5, borderBottomColor: '#0f172a', paddingBottom: 14 },
})

export type TipoDocumento = 'orcamento' | 'ordem'

export interface PixPdf {
  codigo: string
  valorCentavos: number
  qrDataUrl: string
}

interface Props {
  orcamento: Orcamento
  perfil: PerfilPublico
  marcaDagua: boolean
  tipo?: TipoDocumento
  pix?: PixPdf | null
  /** Momento em que o documento é gerado. Usado como data de emissão da ordem de serviço. */
  geradoEm?: number
}

export function OrcamentoPdf({ orcamento: o, perfil: p, marcaDagua, tipo = 'orcamento', pix, geradoEm }: Props) {
  const totais = calcularTotais(o)
  const ordem = tipo === 'ordem'
  const temMaterial = totais.materiais > 0 && totais.servicos > 0
  const linhas = ordem
    ? [`Referente ao orçamento nº ${o.numero}`, `Emitida em ${dataBR(geradoEm ?? o.atualizadoEm)}`]
    : [`Nº ${o.numero}`, `Emitido em ${dataBR(o.criadoEm)}`, `Válido até ${dataValidade(o.criadoEm, o.validadeDias).toLocaleDateString('pt-BR')}`]

  return (
    <Document title={`${ordem ? 'Ordem de serviço' : 'Orçamento'} ${o.numero}`} author={p.nome || undefined}>
      <Page size="A4" style={st.pagina}>
        <Cabecalho perfil={p} titulo={ordem ? 'ORDEM DE SERVIÇO' : 'ORÇAMENTO'} linhas={linhas} />

        <View style={st.bloco}>
          <Text style={st.rotulo}>Cliente</Text>
          <Text style={st.negrito}>{o.cliente.nome || '-'}</Text>
          {o.cliente.telefone ? <Text>{o.cliente.telefone}</Text> : null}
          {o.cliente.endereco ? <Text>{o.cliente.endereco}</Text> : null}
        </View>

        <View style={st.bloco}>
          <View style={t.tabelaCab} fixed>
            <Text style={t.cDesc}>Descrição</Text>
            <Text style={t.cQtd}>Qtd.</Text>
            <Text style={t.cUnit}>Valor unit.</Text>
            <Text style={t.cTotal}>Total</Text>
          </View>
          {o.itens.map((item) => (
            <View key={item.id} style={t.linha} wrap={false}>
              <Text style={t.cDesc}>
                {item.descricao || '-'}
                {temMaterial && item.tipo === 'material' ? '  (material)' : ''}
              </Text>
              <Text style={t.cQtd}>
                {formatarQuantidade(item.quantidade)} {item.unidade}
              </Text>
              <Text style={t.cUnit}>{formatarBRL(item.precoUnitarioCentavos)}</Text>
              <Text style={t.cTotal}>{formatarBRL(subtotalItem(item))}</Text>
            </View>
          ))}
        </View>

        <View style={t.totais} wrap={false}>
          {temMaterial && (
            <>
              <Linha rotulo="Mão de obra" valor={totais.servicos} />
              <Linha rotulo="Materiais" valor={totais.materiais} />
            </>
          )}
          <Linha rotulo="Subtotal" valor={totais.subtotal} />
          {totais.desconto > 0 && <Linha rotulo="Desconto" valor={-totais.desconto} />}
          {totais.deslocamento > 0 && <Linha rotulo="Deslocamento" valor={totais.deslocamento} />}
          <View style={t.totalFinal}>
            <Text>TOTAL</Text>
            <Text>{formatarBRL(totais.total)}</Text>
          </View>
        </View>

        {ordem ? (
          <View style={t.execucao} wrap={false}>
            <View style={t.campoLinha}>
              <Text style={st.rotulo}>Data de início</Text>
            </View>
            <View style={t.campoLinha}>
              <Text style={st.rotulo}>Data de conclusão</Text>
            </View>
          </View>
        ) : null}

        <Secao titulo="Condições de pagamento" texto={o.condicoesPagamento} />
        <Secao titulo="Prazo de execução" texto={o.prazoExecucao} />
        <Secao titulo="Garantia" texto={o.garantia} />
        <Secao titulo="Observações" texto={o.observacoes} />

        {!ordem && pix ? (
          <View style={t.pix} wrap={false}>
            <Image src={pix.qrDataUrl} style={t.qr} />
            <View style={{ flex: 1 }}>
              <Text style={st.rotulo}>Pague com Pix</Text>
              {pix.valorCentavos > 0 ? (
                <Text style={[st.negrito, { fontSize: 12 }]}>
                  {formatarBRL(pix.valorCentavos)}
                  {pix.valorCentavos < totais.total ? '  (entrada)' : ''}
                </Text>
              ) : null}
              <Text style={{ marginTop: 2 }}>Chave: {p.pix}</Text>
              <Text style={{ marginTop: 2, fontSize: 8, color: CINZA }}>
                Aponte a câmera do app do banco para o QR Code ou use o código abaixo.
              </Text>
              {/* Quebra o código em linhas fixas, sem hífen, para não corromper o conteúdo. */}
              {pix.codigo.match(/.{1,80}/g)?.map((trecho, i) => (
                <Text key={i} style={[t.codigo, i > 0 ? { marginTop: 0 } : {}]}>
                  {trecho}
                </Text>
              ))}
            </View>
          </View>
        ) : !ordem && p.pix ? (
          <View style={t.pix} wrap={false}>
            <View>
              <Text style={st.rotulo}>Pagamento via Pix</Text>
              <Text style={st.negrito}>Chave: {p.pix}</Text>
            </View>
          </View>
        ) : null}

        {ordem ? (
          <View style={st.bloco} wrap={false}>
            <Text style={[st.texto, { fontSize: 9, color: CINZA }]}>
              Declaro que o serviço descrito acima foi executado e entregue conforme o combinado.
            </Text>
          </View>
        ) : null}

        <Assinaturas esquerda={p.nome || 'Prestador'} direita={o.cliente.nome || 'Cliente'} />
        <Rodape marcaDagua={marcaDagua} />
      </Page>
    </Document>
  )
}

function Linha({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <View style={t.totalLinha}>
      <Text style={{ color: CINZA }}>{rotulo}</Text>
      <Text>{valor < 0 ? `- ${formatarBRL(-valor)}` : formatarBRL(valor)}</Text>
    </View>
  )
}
