import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { calcularTotais } from '../domain/calc'
import { FORMAS_PAGAMENTO } from '../domain/cobranca'
import { reaisPorExtenso } from '../domain/extenso'
import { formatarBRL } from '../domain/money'
import type { Orcamento, Pagamento, PerfilPublico } from '../domain/types'
import { AZUL, Cabecalho, CINZA, dataBR, Rodape, st } from './base'

const r = StyleSheet.create({
  valor: { marginTop: 20, padding: 14, borderWidth: 1.5, borderColor: AZUL, borderRadius: 4, alignItems: 'center' },
  valorTexto: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: AZUL },
  corpo: { marginTop: 20, fontSize: 11, lineHeight: 1.7, textAlign: 'justify' },
  resumo: { marginTop: 20, marginLeft: 'auto', width: 240 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
})

interface Props {
  orcamento: Orcamento
  perfil: PerfilPublico
  pagamento: Pagamento
  marcaDagua: boolean
}

export function ReciboPdf({ orcamento: o, perfil: p, pagamento, marcaDagua }: Props) {
  const total = calcularTotais(o).total
  // Soma os pagamentos até este recibo, inclusive, para mostrar o saldo daquele momento.
  const indice = o.pagamentos.findIndex((x) => x.id === pagamento.id)
  const ate = indice >= 0 ? o.pagamentos.slice(0, indice + 1) : [...o.pagamentos, pagamento]
  const recebido = ate.reduce((soma, x) => soma + x.valorCentavos, 0)
  const saldo = Math.max(total - recebido, 0)
  const pagador = o.cliente.nome || 'o cliente'
  const documento = p.documento ? `, CPF/CNPJ ${p.documento}` : ''
  const cidade = p.cidade ? `${p.cidade}, ` : ''

  return (
    <Document title={`Recibo ${pagamento.numeroRecibo}`} author={p.nome || undefined}>
      <Page size="A4" style={st.pagina}>
        <Cabecalho perfil={p} titulo="RECIBO" linhas={[`Nº ${pagamento.numeroRecibo}`, `Data: ${dataBR(pagamento.data)}`]} />

        <View style={r.valor}>
          <Text style={r.valorTexto}>{formatarBRL(pagamento.valorCentavos)}</Text>
        </View>

        <Text style={r.corpo}>
          Recebi de <Text style={st.negrito}>{pagador}</Text> a importância de{' '}
          <Text style={st.negrito}>
            {formatarBRL(pagamento.valorCentavos)} ({reaisPorExtenso(pagamento.valorCentavos)})
          </Text>
          , referente {pagamento.referente || `aos serviços do orçamento nº ${o.numero}`}, paga via{' '}
          {pagamento.forma === 'pix' ? 'Pix' : FORMAS_PAGAMENTO[pagamento.forma].toLowerCase()}.
        </Text>
        <Text style={r.corpo}>
          Para clareza e verdade, firmo o presente recibo{p.nome ? `, ${p.nome}${documento}` : ''}.
        </Text>

        <View style={r.resumo} wrap={false}>
          <View style={r.linha}>
            <Text style={{ color: CINZA }}>Valor total do serviço</Text>
            <Text>{formatarBRL(total)}</Text>
          </View>
          <View style={r.linha}>
            <Text style={{ color: CINZA }}>Total recebido até esta data</Text>
            <Text>{formatarBRL(recebido)}</Text>
          </View>
          <View style={r.linha}>
            <Text style={st.negrito}>{saldo > 0 ? 'Saldo a receber' : 'Situação'}</Text>
            <Text style={st.negrito}>{saldo > 0 ? formatarBRL(saldo) : 'Quitado'}</Text>
          </View>
        </View>

        <Text style={[st.bloco, { marginTop: 32 }]}>
          {cidade}
          {new Date(pagamento.data).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}.
        </Text>

        <View style={{ marginTop: 48, alignItems: 'center' }} wrap={false}>
          <Text style={[st.linhaAss, { width: 260 }]}>
            {p.nome || 'Assinatura do recebedor'}
            {p.documento ? `\nCPF/CNPJ ${p.documento}` : ''}
          </Text>
        </View>

        <Rodape marcaDagua={marcaDagua} />
      </Page>
    </Document>
  )
}

