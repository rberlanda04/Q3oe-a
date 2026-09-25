import type { ProfissaoId, TipoItem } from './types'

export interface ItemSugerido {
  descricao: string
  unidade: string
  tipo: TipoItem
}

export interface Modelo {
  id: ProfissaoId
  nome: string
  icone: string
  unidades: string[]
  itens: ItemSugerido[]
  garantia: string
  prazo: string
}

const s = (descricao: string, unidade: string): ItemSugerido => ({ descricao, unidade, tipo: 'servico' })
const m = (descricao: string, unidade: string): ItemSugerido => ({ descricao, unidade, tipo: 'material' })

export const UNIDADES_PADRAO = ['un', 'serviço', 'hora', 'diária', 'm²', 'm', 'm³', 'ponto', 'visita', 'peça', 'kg', 'L', 'mês']

export const MODELOS: Modelo[] = [
  {
    id: 'eletricista',
    nome: 'Eletricista',
    icone: '⚡',
    unidades: ['ponto', 'un', 'm', 'hora', 'serviço'],
    itens: [
      s('Instalação de tomada', 'ponto'),
      s('Instalação de interruptor', 'ponto'),
      s('Instalação de luminária', 'un'),
      s('Instalação de chuveiro elétrico', 'un'),
      s('Troca de disjuntor', 'un'),
      s('Montagem de quadro de distribuição', 'serviço'),
      s('Passagem de fiação', 'm'),
      s('Instalação de ventilador de teto', 'un'),
      s('Visita técnica e diagnóstico', 'serviço'),
      m('Cabo flexível 2,5 mm²', 'm'),
      m('Disjuntor', 'un'),
      m('Tomada completa', 'un'),
    ],
    garantia: 'Garantia de 90 dias sobre a mão de obra, conforme o Código de Defesa do Consumidor.',
    prazo: '1 dia útil',
  },
  {
    id: 'encanador',
    nome: 'Encanador',
    icone: '🔧',
    unidades: ['ponto', 'un', 'm', 'hora', 'serviço'],
    itens: [
      s('Conserto de vazamento', 'serviço'),
      s('Desentupimento de pia', 'serviço'),
      s('Desentupimento de vaso sanitário', 'serviço'),
      s('Instalação de torneira', 'un'),
      s('Troca de sifão', 'un'),
      s('Instalação de vaso sanitário', 'un'),
      s('Limpeza de caixa d\'água', 'serviço'),
      s('Instalação de ponto de água', 'ponto'),
      s('Troca de reparo de válvula de descarga', 'un'),
      m('Tubo PVC 25 mm', 'm'),
      m('Conexões e vedação', 'un'),
    ],
    garantia: 'Garantia de 90 dias sobre a mão de obra, conforme o Código de Defesa do Consumidor.',
    prazo: '1 dia útil',
  },
  {
    id: 'pintor',
    nome: 'Pintor',
    icone: '🎨',
    unidades: ['m²', 'diária', 'un', 'serviço'],
    itens: [
      s('Pintura de parede interna (2 demãos)', 'm²'),
      s('Pintura de parede externa (2 demãos)', 'm²'),
      s('Pintura de teto', 'm²'),
      s('Aplicação de massa corrida', 'm²'),
      s('Lixamento e preparação de superfície', 'm²'),
      s('Pintura de porta', 'un'),
      s('Pintura de grade ou portão', 'm²'),
      s('Textura ou grafiato', 'm²'),
      m('Tinta acrílica 18 L', 'un'),
      m('Massa corrida 25 kg', 'un'),
      m('Lixas, fitas e lona', 'un'),
    ],
    garantia: 'Garantia de 1 ano contra descascamento por falha na aplicação.',
    prazo: '5 dias úteis',
  },
  {
    id: 'pedreiro',
    nome: 'Pedreiro',
    icone: '🧱',
    unidades: ['m²', 'm³', 'm', 'diária', 'serviço'],
    itens: [
      s('Assentamento de piso cerâmico', 'm²'),
      s('Assentamento de porcelanato', 'm²'),
      s('Reboco de parede', 'm²'),
      s('Contrapiso', 'm²'),
      s('Levantamento de parede de bloco', 'm²'),
      s('Assentamento de revestimento de parede', 'm²'),
      s('Demolição e retirada de entulho', 'serviço'),
      s('Diária de pedreiro', 'diária'),
      s('Diária de ajudante', 'diária'),
      m('Argamassa AC-II 20 kg', 'un'),
      m('Cimento 50 kg', 'un'),
      m('Areia', 'm³'),
    ],
    garantia: 'Garantia de 1 ano sobre a mão de obra executada.',
    prazo: '10 dias úteis',
  },
  {
    id: 'diarista',
    nome: 'Diarista e limpeza',
    icone: '🧹',
    unidades: ['diária', 'hora', 'm²', 'serviço'],
    itens: [
      s('Faxina completa', 'diária'),
      s('Limpeza pesada', 'diária'),
      s('Limpeza pós-obra', 'm²'),
      s('Limpeza de vidros e janelas', 'serviço'),
      s('Passadoria', 'hora'),
      s('Organização de armários', 'hora'),
      m('Produtos de limpeza', 'un'),
    ],
    garantia: 'Caso algum ponto não fique satisfatório, o retoque é feito sem custo em até 24 horas.',
    prazo: '1 dia',
  },
  {
    id: 'ar-condicionado',
    nome: 'Ar-condicionado',
    icone: '❄️',
    unidades: ['un', 'm', 'serviço', 'visita'],
    itens: [
      s('Instalação de split até 12.000 BTUs', 'un'),
      s('Instalação de split 18.000 a 24.000 BTUs', 'un'),
      s('Limpeza e higienização de split', 'un'),
      s('Manutenção preventiva', 'un'),
      s('Carga de gás refrigerante', 'un'),
      s('Desinstalação de aparelho', 'un'),
      s('Visita técnica e diagnóstico', 'visita'),
      m('Tubulação de cobre com isolamento', 'm'),
      m('Suporte para condensadora', 'un'),
      m('Cabo PP e disjuntor', 'un'),
    ],
    garantia: 'Garantia de 90 dias sobre a instalação. A garantia do aparelho segue as regras do fabricante.',
    prazo: '1 dia útil',
  },
  {
    id: 'marceneiro',
    nome: 'Marceneiro',
    icone: '🪚',
    unidades: ['un', 'm²', 'm', 'serviço'],
    itens: [
      s('Armário de cozinha planejado', 'm'),
      s('Guarda-roupa planejado', 'm²'),
      s('Painel de TV', 'un'),
      s('Bancada sob medida', 'm'),
      s('Porta de madeira instalada', 'un'),
      s('Reforma e restauração de móvel', 'serviço'),
      s('Instalação no local', 'serviço'),
      m('Chapa de MDF 18 mm', 'un'),
      m('Ferragens e corrediças', 'un'),
    ],
    garantia: 'Garantia de 1 ano contra defeitos de fabricação e montagem.',
    prazo: '20 dias úteis',
  },
  {
    id: 'jardinagem',
    nome: 'Jardinagem',
    icone: '🌿',
    unidades: ['m²', 'visita', 'un', 'serviço'],
    itens: [
      s('Corte de grama', 'm²'),
      s('Poda de árvores e arbustos', 'un'),
      s('Manutenção mensal de jardim', 'visita'),
      s('Plantio de mudas', 'un'),
      s('Limpeza de terreno', 'm²'),
      s('Retirada de entulho verde', 'serviço'),
      m('Grama em placas', 'm²'),
      m('Terra adubada', 'un'),
      m('Mudas', 'un'),
    ],
    garantia: 'Plantio com garantia de pega de 30 dias, desde que a rega seja feita conforme orientação.',
    prazo: '1 dia',
  },
  {
    id: 'montador',
    nome: 'Montador de móveis',
    icone: '🪛',
    unidades: ['peça', 'un', 'serviço'],
    itens: [
      s('Montagem de guarda-roupa', 'peça'),
      s('Montagem de cozinha compacta', 'peça'),
      s('Montagem de cama', 'peça'),
      s('Montagem de rack ou painel', 'peça'),
      s('Montagem de mesa ou escrivaninha', 'peça'),
      s('Desmontagem de móvel', 'peça'),
      s('Instalação de prateleiras e nichos', 'un'),
      s('Fixação de móvel na parede', 'un'),
    ],
    garantia: 'Garantia de 90 dias sobre a montagem.',
    prazo: '1 dia',
  },
  {
    id: 'fotografo',
    nome: 'Fotógrafo',
    icone: '📷',
    unidades: ['hora', 'pacote', 'un', 'serviço'],
    itens: [
      s('Cobertura fotográfica de evento', 'hora'),
      s('Ensaio fotográfico', 'pacote'),
      s('Fotos editadas adicionais', 'un'),
      s('Fotografia de produtos', 'un'),
      s('Vídeo resumo do evento', 'serviço'),
      s('Segundo fotógrafo', 'hora'),
      m('Álbum impresso', 'un'),
      m('Fotos impressas', 'un'),
    ],
    garantia: 'Entrega das fotos editadas em galeria online, disponível por 90 dias.',
    prazo: 'Entrega em 15 dias após o evento',
  },
  {
    id: 'freelancer',
    nome: 'Freelancer digital',
    icone: '💻',
    unidades: ['projeto', 'hora', 'mês', 'un'],
    itens: [
      s('Criação de site institucional', 'projeto'),
      s('Loja virtual', 'projeto'),
      s('Criação de logotipo e identidade visual', 'projeto'),
      s('Gestão de redes sociais', 'mês'),
      s('Artes para redes sociais', 'un'),
      s('Gestão de tráfego pago', 'mês'),
      s('Hora de desenvolvimento ou design', 'hora'),
      s('Manutenção mensal', 'mês'),
    ],
    garantia: 'Inclui 2 rodadas de ajustes e 30 dias de suporte para correções após a entrega.',
    prazo: '15 dias úteis',
  },
  {
    id: 'confeitaria',
    nome: 'Confeitaria e buffet',
    icone: '🎂',
    unidades: ['kg', 'cento', 'un', 'pessoa', 'serviço'],
    itens: [
      s('Bolo decorado', 'kg'),
      s('Docinhos tradicionais', 'cento'),
      s('Docinhos finos', 'cento'),
      s('Salgados fritos', 'cento'),
      s('Salgados assados', 'cento'),
      s('Buffet completo', 'pessoa'),
      s('Mesa de doces montada', 'serviço'),
      s('Garçom', 'un'),
      s('Taxa de entrega', 'serviço'),
    ],
    garantia: 'Produtos feitos no dia, com ingredientes frescos. Consumir em até 24 horas.',
    prazo: 'Pedido com 7 dias de antecedência',
  },
  {
    id: 'outro',
    nome: 'Outro serviço',
    icone: '🛠️',
    unidades: UNIDADES_PADRAO,
    itens: [s('Mão de obra', 'serviço'), s('Visita técnica', 'visita'), m('Material', 'un')],
    garantia: 'Garantia de 90 dias sobre a mão de obra, conforme o Código de Defesa do Consumidor.',
    prazo: 'A combinar',
  },
]

export function modeloPorId(id: ProfissaoId): Modelo {
  return MODELOS.find((modelo) => modelo.id === id) ?? MODELOS[MODELOS.length - 1]
}
