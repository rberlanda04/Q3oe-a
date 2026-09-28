import type { ProfissaoId } from '../domain/types'

/**
 * Conteúdo das páginas "modelo de orçamento para ...".
 * Cada página tem texto próprio, para o Google não tratar como conteúdo duplicado.
 */
export interface ConteudoProfissao {
  id: ProfissaoId
  slug: string
  /** Como a profissão aparece no meio da frase: "para eletricista". */
  para: string
  /** Termo principal de busca. */
  busca: string
  descricao: string
  intro: string
  dicas: string[]
  perguntas: [string, string][]
}

export const PROFISSOES_SEO: ConteudoProfissao[] = [
  {
    id: 'eletricista',
    slug: 'eletricista',
    para: 'eletricista',
    busca: 'modelo de orçamento para eletricista',
    descricao:
      'Modelo de orçamento para eletricista grátis: tomadas, disjuntores, quadro e chuveiro já prontos. Monte no celular e envie pelo WhatsApp com Pix.',
    intro:
      'Orçamento de elétrica precisa deixar claro o que é ponto, o que é peça e o que é mão de obra. Com o modelo pronto, você toca nos serviços, coloca seus preços e o cliente recebe um documento profissional.',
    dicas: [
      'Separe mão de obra e material. O cliente entende melhor e você evita discussão sobre peça comprada.',
      'Cobre por ponto quando o serviço se repete, como tomadas e interruptores.',
      'Informe a garantia da mão de obra. Pelo Código de Defesa do Consumidor, o mínimo é de 90 dias.',
      'Deixe a taxa de visita clara. Muitos eletricistas abatem a visita se o serviço for fechado.',
    ],
    perguntas: [
      ['Como cobrar instalação de tomada?', 'O mais comum é cobrar por ponto. No modelo, o item já vem com a unidade "ponto": você define o preço uma vez e ele fica salvo para os próximos orçamentos.'],
      ['Preciso colocar o material no orçamento?', 'Não é obrigatório, mas ajuda. Você pode marcar cada item como mão de obra ou material, e o total mostra os dois separados.'],
    ],
  },
  {
    id: 'encanador',
    slug: 'encanador',
    para: 'encanador',
    busca: 'modelo de orçamento para encanador',
    descricao:
      'Modelo de orçamento para encanador e hidráulica grátis: vazamento, desentupimento, torneira e caixa d’água. Envie pelo WhatsApp em 2 minutos.',
    intro:
      'Serviço de hidráulica costuma ser urgente, e quem manda o orçamento primeiro sai na frente. O modelo já traz os serviços mais pedidos para você responder o cliente ainda no local.',
    dicas: [
      'Descreva o problema encontrado nas observações. Isso justifica o valor e protege você.',
      'Deixe claro se o desentupimento inclui retorno em caso de novo entupimento.',
      'Cobre deslocamento separado quando o bairro for longe.',
      'Peça para o cliente aprovar pelo link antes de comprar peças.',
    ],
    perguntas: [
      ['Como fazer orçamento de vazamento sem saber a causa?', 'Cobre a visita técnica e o diagnóstico como um item. Depois, duplique o orçamento e acrescente o reparo quando souber o que precisa.'],
      ['Posso cobrar uma entrada?', 'Sim. O orçamento sai com QR Code Pix, e você pode definir que ele cobre só a entrada, como 50%.'],
    ],
  },
  {
    id: 'pintor',
    slug: 'pintor',
    para: 'pintor',
    busca: 'modelo de orçamento de pintura',
    descricao:
      'Modelo de orçamento de pintura grátis, com cálculo de m² que desconta portas e janelas. Pintura interna, externa, massa corrida e textura.',
    intro:
      'Orçamento de pintura depende da área certa. O modelo tem uma calculadora de m²: você soma as paredes, desconta portas e janelas e o valor sai automático.',
    dicas: [
      'Cobre por m² e informe o número de demãos. Duas demãos é o padrão para cobrir bem.',
      'Separe o preparo da superfície, como lixamento e massa corrida. É onde está a maior parte do trabalho.',
      'Diga se a tinta é por sua conta ou do cliente.',
      'Ofereça garantia contra descascamento por falha na aplicação.',
    ],
    perguntas: [
      ['Como calcular o m² de uma parede?', 'Multiplique a largura pela altura de cada parede e some tudo. Depois desconte as portas e janelas. A calculadora do Q3 Orça faz essa conta para você.'],
      ['Quanto de tinta preciso por m²?', 'Depende do rendimento indicado na lata e do número de demãos. Use o rendimento do fabricante e coloque a tinta como item de material.'],
    ],
  },
  {
    id: 'pedreiro',
    slug: 'pedreiro',
    para: 'pedreiro',
    busca: 'modelo de orçamento para pedreiro',
    descricao:
      'Modelo de orçamento para pedreiro e reforma grátis: piso, porcelanato, reboco, contrapiso e diárias. Calcule o m² e envie pelo WhatsApp.',
    intro:
      'Obra tem muitos itens, e é fácil esquecer um. O modelo de pedreiro já traz os serviços mais comuns de reforma, por m² ou por diária, para o orçamento sair completo.',
    dicas: [
      'Cobre por m² nos serviços de acabamento e por diária nos imprevisíveis, como demolição.',
      'Deixe claro quem fornece o material e quem retira o entulho.',
      'Combine a forma de pagamento por etapa em obras maiores.',
      'Informe o prazo de execução em dias úteis.',
    ],
    perguntas: [
      ['É melhor cobrar por m² ou por diária?', 'Para serviços de medida clara, como piso e reboco, o m² passa mais segurança ao cliente. Para demolição e reparos, a diária é mais justa. O modelo tem as duas opções.'],
      ['Como incluir o ajudante?', 'Use o item "Diária de ajudante". Ele aparece separado, e o cliente entende por que o valor sobe.'],
    ],
  },
  {
    id: 'diarista',
    slug: 'diarista',
    para: 'diarista e limpeza',
    busca: 'modelo de orçamento de limpeza',
    descricao:
      'Modelo de orçamento de limpeza e faxina grátis: diária, limpeza pesada, pós-obra por m² e passadoria. Envie pelo WhatsApp e receba por Pix.',
    intro:
      'Diaristas e empresas de limpeza fecham mais quando o preço vem por escrito e bem explicado. O modelo traz faxina, limpeza pesada e pós-obra, com o valor por diária, hora ou m².',
    dicas: [
      'Diga o que está incluso na faxina, como janelas, geladeira e forno.',
      'Cobre limpeza pós-obra por m². Ela dá muito mais trabalho que a faxina comum.',
      'Informe se os produtos de limpeza estão inclusos.',
      'Ofereça retoque sem custo em até 24 horas. Passa confiança.',
    ],
    perguntas: [
      ['Como cobrar limpeza pós-obra?', 'O mais justo é por m², porque o trabalho cresce com o tamanho do imóvel. O modelo já traz esse item.'],
      ['Posso mandar um orçamento para clientes fixos?', 'Sim. Duplique o orçamento de um cliente e ajuste a data. Os clientes e preços ficam salvos.'],
    ],
  },
  {
    id: 'ar-condicionado',
    slug: 'ar-condicionado',
    para: 'ar-condicionado',
    busca: 'modelo de orçamento de instalação de ar-condicionado',
    descricao:
      'Modelo de orçamento para instalação e manutenção de ar-condicionado grátis: split por BTUs, limpeza, carga de gás e tubulação por metro.',
    intro:
      'Instalação de ar-condicionado tem preço por potência e metro de tubulação. O modelo separa tudo isso para o cliente entender o valor e aprovar rápido.',
    dicas: [
      'Separe a instalação por faixa de BTUs.',
      'Cobre a tubulação extra por metro, além do padrão incluso.',
      'Diga que a garantia do aparelho é do fabricante e a da instalação é sua.',
      'Ofereça a limpeza periódica como serviço recorrente.',
    ],
    perguntas: [
      ['O que incluir no orçamento de instalação de split?', 'Mão de obra por faixa de BTUs, tubulação de cobre por metro, suporte da condensadora e parte elétrica, como cabo e disjuntor.'],
      ['Como cobrar a manutenção?', 'Por aparelho. No modelo, limpeza e manutenção preventiva já vêm com a unidade "un".'],
    ],
  },
  {
    id: 'marceneiro',
    slug: 'marceneiro',
    para: 'marceneiro',
    busca: 'modelo de orçamento de marcenaria',
    descricao:
      'Modelo de orçamento de marcenaria grátis: móveis planejados, armários, painéis e bancadas por metro ou m². Envie com prazo de fabricação.',
    intro:
      'Móvel sob medida é um orçamento alto, e o cliente compara. Um documento claro, com prazo de fabricação e garantia, ajuda a justificar o valor.',
    dicas: [
      'Cobre armários por metro linear e guarda-roupas por m² de frente.',
      'Descreva o material e o acabamento, como MDF 18 mm e ferragens com amortecedor.',
      'Informe o prazo de fabricação separado do prazo de instalação.',
      'Peça uma entrada para comprar o material.',
    ],
    perguntas: [
      ['Como cobrar móveis planejados?', 'Por metro linear ou m², conforme o móvel, mais a instalação. O modelo traz as duas unidades.'],
      ['Quanto pedir de entrada?', 'É comum pedir de 30% a 50% para a compra do material. Com o Q3 Orça, o QR Code Pix já cobra a entrada.'],
    ],
  },
  {
    id: 'jardinagem',
    slug: 'jardinagem',
    para: 'jardinagem',
    busca: 'modelo de orçamento de jardinagem',
    descricao:
      'Modelo de orçamento de jardinagem grátis: corte de grama por m², poda, plantio e manutenção mensal. Envie pelo WhatsApp com Pix.',
    intro:
      'Jardinagem vive de clientes recorrentes. Um orçamento bem feito na primeira visita vira contrato de manutenção mensal.',
    dicas: [
      'Cobre o corte de grama por m² e a poda por unidade.',
      'Ofereça a manutenção mensal como pacote de visitas.',
      'Inclua a retirada do entulho verde como item separado.',
      'Explique os cuidados com a rega no campo de garantia.',
    ],
    perguntas: [
      ['Como cobrar corte de grama?', 'Por m² é o mais comum. Use a calculadora de área do modelo para somar os canteiros.'],
      ['Posso vender manutenção mensal?', 'Sim. O item "Manutenção mensal de jardim" é cobrado por visita, e você ajusta a quantidade.'],
    ],
  },
  {
    id: 'montador',
    slug: 'montador-de-moveis',
    para: 'montador de móveis',
    busca: 'modelo de orçamento para montador de móveis',
    descricao:
      'Modelo de orçamento para montador de móveis grátis: guarda-roupa, cozinha, cama e rack por peça. Monte no celular e envie pelo WhatsApp.',
    intro:
      'Montagem se cobra por peça, e o cliente quer saber o total antes de marcar. O modelo lista os móveis mais comuns para você responder em segundos.',
    dicas: [
      'Cobre por peça e ajuste pelo tamanho, como guarda-roupa de 6 portas.',
      'Cobre a desmontagem separada da montagem.',
      'Fixação na parede é um item à parte e aumenta a segurança.',
      'Combine a taxa de deslocamento para bairros distantes.',
    ],
    perguntas: [
      ['Como cobrar montagem de guarda-roupa?', 'Por peça, com preço conforme o número de portas. Salve cada tamanho como um item seu.'],
      ['Posso cobrar desmontagem?', 'Sim. O modelo já traz o item "Desmontagem de móvel", por peça.'],
    ],
  },
  {
    id: 'fotografo',
    slug: 'fotografo',
    para: 'fotógrafo',
    busca: 'modelo de orçamento para fotógrafo',
    descricao:
      'Modelo de orçamento para fotógrafo grátis: cobertura de evento por hora, ensaio, fotos editadas e álbum. Envie a proposta pelo WhatsApp.',
    intro:
      'Cliente de fotografia compara pacotes. Uma proposta clara, com horas de cobertura, número de fotos e prazo de entrega, ajuda a fechar o contrato.',
    dicas: [
      'Informe as horas de cobertura e o valor da hora extra.',
      'Diga quantas fotos editadas estão incluídas.',
      'Coloque o prazo de entrega da galeria.',
      'Cobre álbum e impressões como material.',
    ],
    perguntas: [
      ['Como montar um pacote de fotografia?', 'Combine a cobertura por hora com as fotos editadas e o álbum. Cada item aparece separado na proposta.'],
      ['Posso cobrar sinal para reservar a data?', 'Sim. Configure o QR Code Pix para cobrar uma entrada e a data fica garantida quando o cliente pagar.'],
    ],
  },
  {
    id: 'freelancer',
    slug: 'freelancer',
    para: 'freelancer',
    busca: 'modelo de proposta comercial para freelancer',
    descricao:
      'Modelo de orçamento e proposta para freelancer grátis: site, logo, redes sociais e tráfego pago. Envie com link de aprovação e Pix.',
    intro:
      'Designers, desenvolvedores e social media perdem clientes com propostas demoradas. Com o modelo, a proposta sai em minutos, e o cliente aprova pelo link.',
    dicas: [
      'Cobre por projeto quando o escopo é fechado e por hora quando não é.',
      'Diga quantas rodadas de ajuste estão incluídas.',
      'Cobre serviços recorrentes, como gestão de redes, por mês.',
      'Peça uma entrada antes de começar.',
    ],
    perguntas: [
      ['Orçamento ou proposta comercial?', 'Para o cliente, é a mesma coisa: escopo, preço, prazo e condições. O Q3 Orça gera o documento com tudo isso.'],
      ['Como limitar as alterações?', 'Escreva o número de rodadas de ajuste no campo de garantia. Ele aparece no documento que o cliente aprova.'],
    ],
  },
  {
    id: 'confeitaria',
    slug: 'confeitaria-e-buffet',
    para: 'confeitaria e buffet',
    busca: 'modelo de orçamento para festa e buffet',
    descricao:
      'Modelo de orçamento para confeitaria e buffet grátis: bolo por kg, docinhos e salgados por cento, buffet por pessoa. Receba o sinal por Pix.',
    intro:
      'Encomenda de festa tem muitos itens e data marcada. O modelo organiza bolo, doces, salgados e serviço, e o sinal pode ser pago pelo Pix do próprio orçamento.',
    dicas: [
      'Cobre bolo por kg e doces e salgados por cento.',
      'Buffet completo se cobra por pessoa. Informe o número de convidados.',
      'Coloque a data do evento e o prazo mínimo para pedido.',
      'Peça o sinal para confirmar a encomenda.',
    ],
    perguntas: [
      ['Como fazer orçamento de festa?', 'Liste bolo, doces, salgados e serviços com as quantidades. O total sai automático, e você envia pelo WhatsApp.'],
      ['Como garantir a encomenda?', 'Configure o QR Code Pix para cobrar o sinal. O cliente paga pelo próprio orçamento.'],
    ],
  },
]

export function profissaoPorSlug(slug: string | undefined): ConteudoProfissao | undefined {
  return PROFISSOES_SEO.find((p) => p.slug === slug)
}
