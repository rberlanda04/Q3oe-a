import { Document, Page, Text, View } from '@react-pdf/renderer'
import { formatarQuantidade } from '../domain/money'
import type { Orcamento, PerfilPublico } from '../domain/types'
import { Assinaturas, Cabecalho, dataBR, Rodape, Secao, st } from './base'

const EXCLUSOES = [
  'Mau uso, falta de manutenção ou uso diferente do indicado.',
  'Intervenção, reparo ou alteração feita por terceiros.',
  'Desgaste natural de peças e materiais.',
  'Danos causados por eventos externos, como chuvas, infiltrações, descargas elétricas e variações de energia.',
  'Materiais fornecidos pelo próprio cliente.',
]

interface Props {
  orcamento: Orcamento
  perfil: PerfilPublico
  dataConclusao: number
  marcaDagua: boolean
}

export function GarantiaPdf({ orcamento: o, perfil: p, dataConclusao, marcaDagua }: Props) {
  return (
    <Document title={`Termo de garantia ${o.numero}`} author={p.nome || undefined}>
      <Page size="A4" style={st.pagina}>
        <Cabecalho
          perfil={p}
          titulo="TERMO DE GARANTIA"
          linhas={[`Orçamento nº ${o.numero}`, `Serviço concluído em ${dataBR(dataConclusao)}`]}
        />

        <View style={st.bloco}>
          <Text style={st.rotulo}>Cliente</Text>
          <Text style={st.negrito}>{o.cliente.nome || '-'}</Text>
          {o.cliente.endereco ? <Text>Local do serviço: {o.cliente.endereco}</Text> : null}
        </View>

        <View style={st.bloco}>
          <Text style={st.rotulo}>Serviços cobertos</Text>
          {o.itens.map((item) => (
            <Text key={item.id} style={st.texto}>
              •  {item.descricao} ({formatarQuantidade(item.quantidade)} {item.unidade})
            </Text>
          ))}
        </View>

        <Secao titulo="Prazo e condições da garantia" texto={o.garantia || 'Garantia de 90 dias sobre a mão de obra, conforme o Código de Defesa do Consumidor.'} />

        <View style={st.bloco} wrap={false}>
          <Text style={st.rotulo}>A garantia não cobre</Text>
          {EXCLUSOES.map((texto) => (
            <Text key={texto} style={st.texto}>
              •  {texto}
            </Text>
          ))}
        </View>

        <Secao
          titulo="Como acionar"
          texto={`Entre em contato${p.telefone ? ` pelo telefone ${p.telefone}` : ''}${p.email ? ` ou pelo e-mail ${p.email}` : ''}, informando o número do orçamento e uma descrição do problema. A visita de avaliação dentro do prazo de garantia não tem custo.`}
        />

        <Assinaturas esquerda={p.nome || 'Prestador'} direita={o.cliente.nome || 'Cliente'} />
        <Rodape marcaDagua={marcaDagua} />
      </Page>
    </Document>
  )
}
