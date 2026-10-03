# Estratégia de lançamento do Q3 Orça

Outubro de 2026. Este documento responde a três perguntas: estamos prontos para lançar, para quem vamos vender primeiro e como chegar até essas pessoas. Ele complementa o [PLANO-DE-ESCALA.md](PLANO-DE-ESCALA.md), que trata de metas de longo prazo.

O plano de aplicação na primeira praça está em [ESTRATEGIA-CURITIBA.md](ESTRATEGIA-CURITIBA.md).

## 1. Estamos prontos?

**Resposta curta:** estamos prontos para um lançamento fechado e gratuito com os primeiros profissionais, depois de duas tarefas de uma hora. Não estamos prontos para o lançamento oficial pago: faltam empresa, pagamento ativo, domínio e revisão jurídica.

### Diagnóstico em 3 de outubro de 2026

| Área | Situação | O que falta |
|---|---|---|
| Produto | **Pronto.** Orçamento por profissão, link de aprovação, Pix, recibo, garantia, clientes, marca Pro, suporte e exclusão de conta. O fluxo completo passou em 17 etapas no site oficial. | Nada para o beta |
| Segurança | **Pronta.** 56 regras de acesso testadas e 61 testes automáticos. | Nada |
| SEO | **Pronto no código.** 18 páginas pré-renderizadas, sitemap e dados estruturados. | Cadastrar no Google Search Console |
| Canal de contato | **Bloqueante.** Nenhum e-mail ou WhatsApp configurado em `src/config.ts`. | Preencher `EMAIL_CONTATO` e `WHATSAPP_SUPORTE` |
| Painel admin | **Falta ativar.** Ninguém tem acesso ainda. | Criar `admins/{seu UID}` no Firestore |
| Pagamento do Pro | **Construído e testado com a AbacatePay real, mas desligado.** | Plano Blaze, segredos, deploy das funções e webhook |
| Empresa e termos | **Incompleto.** Termos e privacidade no ar, mas sem razão social e CNPJ. | Abrir a empresa, preencher os dados e revisar com advogado |
| Domínio | **Em espera.** q3orça.com.br registrado, sem DNS. Pedido de troca para q3orca.com.br enviado ao Registro.br. | Resposta do Registro.br e configuração do DNS |

### O que isso significa na prática

- **Beta gratuito (pode começar esta semana):** basta o canal de contato e o acesso ao painel admin. Os 14 dias de Pro grátis cobrem a experiência completa, e quem quiser continuar no Pro faz o pedido, que você ativa manualmente pelo painel.
- **Lançamento oficial pago (meta: semana 6):** exige empresa aberta, Pix ligado, domínio no ar e revisão dos termos.

## 2. O mercado

### Tamanho

- **17 milhões de MEIs** no Brasil, e 77% das empresas abertas em 2026 são MEI ([DadosJá](https://dadosja.com/blog/cnpj/quantos-mei-existem-brasil-2026), [Agência Sebrae](https://agenciasebrae.com.br/dados/meis-lideram-abertura-de-empresas-no-pais-e-ja-representam-78-dos-novos-negocios-em-2026/)).
- **Mais de 25 milhões de pessoas** trabalham por conta própria, a maioria sem CNPJ ([meutudo, com dados do IBGE](https://meutudo.com.br/blog/trabalho-autonomo/)).
- Na construção civil, **64,8% da mão de obra é autônoma**. Eletricistas são o maior grupo (19,3%), seguidos de construtores, pedreiros e pintores ([Obramax](https://blog.obramax.com.br/noticias/panorama-construcao-civil-brasil/)).
- **Mais de 80% dos negócios de serviço** atendem clientes pelo WhatsApp, quase o dobro das redes sociais ([Fenacon, pesquisa Sebrae](https://fenacon.org.br/noticias/whatsapp-e-o-principal-meio-de-comunicacao-para-80-dos-negocios-de-servico/)).
- Pequenos negócios conduzem o relacionamento com clientes "de forma intuitiva e pouco sistematizada" ([Brasil 247, pesquisa com 1.300 empreendedores](https://www.brasil247.com/empreender/pequenos-negocios-apostam-no-whatsapp-mas-carecem-de-gestao-estruturada)). É exatamente a lacuna do Q3 Orça.

### Concorrência

O mercado já tem aplicativos de orçamento em PDF pelo WhatsApp, vários gratuitos ou com teste de 14 dias: [InteraUp](https://interaup.com.br/), [Fazer Orçamento](https://fazerorcamento.com/), [Orçamento Perfeito](https://apps.apple.com/us/app/or%C3%A7amento-perfeito/id6503016707), [Orçalize](https://orcalizeapp.vercel.app/), [Orça Obra](https://play.google.com/store/apps/details?id=com.senuntech.orcamento&hl=pt) e [Meu Trampo](https://meutrampo.app/para/eletricista).

**Conclusão:** "orçamento em PDF grátis" não diferencia mais. Precisamos vender o resultado, que é **fechar mais serviço e receber mais rápido**, e não a ferramenta.

### Nossos diferenciais, em ordem de força

1. **O cliente aprova pelo link e o profissional sabe na hora.** O status muda sozinho, e o painel avisa quem não respondeu, com lembrete pronto.
2. **Do orçamento ao dinheiro:** QR Code Pix da entrada ou do total, recibo com valor por extenso e termo de garantia.
3. **Modelos por profissão** com itens prontos e preços que ficam salvos.
4. **Parece empresa:** dados do CNPJ puxados automaticamente, logo e cor própria no Pro.
5. **Sem instalar nada e funciona sem sinal,** o que importa na obra.

Antes de afirmar em público que um diferencial é exclusivo, teste os concorrentes. Até lá, fale do benefício sem comparar.

## 3. Público-alvo

### Perfil ideal do primeiro cliente

> Profissional autônomo ou MEI de **reforma e manutenção residencial**, de 25 a 55 anos, que faz de 4 a 20 orçamentos por mês, atende pelo WhatsApp num celular Android e hoje manda o preço por áudio, mensagem de texto ou papel. Perde serviço porque o cliente "some" depois do orçamento e tem vergonha de parecer amador perto de empresas maiores.

**Por que esse perfil primeiro:**
- O valor do serviço é alto, então um orçamento formal faz diferença real para fechar.
- Ele faz muitos orçamentos por mês, então usa o app com frequência e cria hábito.
- A dor do cliente que some é forte, e o link de aprovação com lembrete resolve.
- É o maior grupo de autônomos da construção, com comunidades ativas onde é fácil chegar.

### Ondas de segmentos

| Onda | Profissões | Quando |
|---|---|---|
| 1 | Eletricista, pintor, encanador, pedreiro e reformas | Beta e lançamento |
| 2 | Ar-condicionado, montador de móveis, marceneiro, diarista e limpeza | A partir do mês 2 |
| 3 | Fotógrafo, freelancer digital, confeitaria e buffet | A partir do mês 4, com comunicação própria |

Os modelos de todas as profissões já existem. As ondas definem **onde concentrar a divulgação**, não quem pode usar.

### Persona da onda 1

**Marcos, 38 anos, eletricista em cidade média.** Tem MEI, trabalha sozinho e às vezes chama um ajudante. Recebe pedidos pelo WhatsApp, por indicação e pelo Instagram. Faz o orçamento de cabeça e manda o valor por mensagem. Usa o celular para tudo e não abre computador. Quer: fechar mais serviços, receber a entrada antes de comprar material e parar de correr atrás do cliente. Teme: gastar tempo aprendendo um app complicado e pagar por algo que não usa.

## 4. Posicionamento e mensagem

**Promessa:** Orçamento rápido, aprovado pelo celular.

**Frase de apoio:** Você monta em 2 minutos, o cliente aprova pelo link e paga a entrada no Pix.

### Mensagens por dor

| Dor | Mensagem |
|---|---|
| Cliente some depois do orçamento | "Saiba na hora quando o cliente aprova. Quem não respondeu em 3 dias recebe um lembrete com um toque." |
| Calote e falta de entrada | "Mande o orçamento com o QR Code da entrada. O cliente paga antes de você comprar o material." |
| Parecer amador | "Orçamento com seu nome, CNPJ e garantia. O cliente confia mais em quem se apresenta como empresa." |
| Medo de errar a conta | "Desconto, deslocamento e entrada calculados sozinhos. Pintor ainda ganha calculadora de m²." |
| Falta de tempo | "Toque nos itens da sua profissão. Seus preços ficam salvos para o próximo." |

### Tom

Direto, de colega para colega, com palavras de obra. Nunca "solução", "plataforma" ou "gestão integrada". O manual completo está em [/marca](https://q3orca.web.app/marca).

## 5. Fases do lançamento

### Fase 0: preparação (semana 1)

| Tarefa | Responsável | Tempo |
|---|---|---|
| Preencher `EMAIL_CONTATO` e `WHATSAPP_SUPORTE` e publicar | Você | 15 min |
| Criar `admins/{seu UID}` no Firestore e apagar os dados de teste pelo painel | Você | 15 min |
| Cadastrar o site no Google Search Console e enviar o sitemap | Você | 30 min |
| Fazer 5 orçamentos reais com o app, um de cada profissão da onda 1 | Você | 1 h |
| Pagar um QR Code de R$ 0,01 e compartilhar um PDF num celular real | Você | 15 min |
| Gravar 3 vídeos de 30 segundos mostrando um orçamento sendo feito | Você | 2 h |
| Abrir o processo da empresa com um contador | Você | 1 h |

### Fase 1: beta dos Fundadores (semanas 2 a 5)

**Meta:** 50 profissionais da onda 1 usando de verdade, numa cidade só.

Concentrar numa cidade facilita a abordagem presencial e cria indicação entre profissionais que se conhecem.

**Oferta Fundador**, limitada aos 100 primeiros:
- Pro grátis por 3 meses, ativado pelo painel admin.
- Depois disso, preço de fundador: **R$ 59 no primeiro ano**, em vez de R$ 99.
- Em troca: uma conversa de 15 minutos por semana no primeiro mês e um depoimento, se gostar.

**Como recrutar, em ordem de prioridade:**
1. **Rede pessoal.** Liste 30 profissionais que você já conhece ou que já fizeram serviço para conhecidos. Mande a mensagem do roteiro A, na seção 7.
2. **Lojas de material de construção do bairro.** O balconista conhece todos os eletricistas e pintores da região. Proponha um cartaz com QR Code no balcão. Em troca, a loja aparece como parceira. Use o roteiro C.
3. **Grupos de WhatsApp e Facebook** de profissionais da cidade. Entre, ajude primeiro e só depois mostre o app, com o roteiro B. Nunca mande a mesma mensagem em vários grupos no mesmo dia.
4. **Cursos profissionalizantes,** como SENAI e escolas de elétrica e pintura. Ofereça uma aula de 20 minutos sobre "como fazer orçamento que o cliente aprova".

**Primeiro uso acompanhado:** faça o primeiro orçamento junto com cada fundador, por chamada ou pessoalmente. A hipótese é que quem envia o primeiro orçamento no primeiro dia continua usando. Meça isso no beta.

**O que medir nesta fase:**
- Envio do primeiro orçamento em até 24 horas: meta de 60%.
- Uso na semana 4: meta de 35%.
- Respostas a três perguntas: o que quase te fez desistir, o que você mostraria para um colega e quanto pagaria.

**Critério para avançar:** 35% ou mais dos fundadores ainda ativos na quarta semana, e pelo menos 5 depoimentos reais com autorização.

### Fase 2: lançamento oficial (semanas 6 a 10)

**Pré-requisitos:** empresa aberta, termos revisados, Pix ligado, domínio no ar e depoimentos dos fundadores no site.

**Ações:**
- Ligar o Pix e anunciar o fim da fase fundador.
- Publicar os depoimentos reais na página inicial. Nunca use depoimentos inventados.
- **Indicação:** quem indicar um profissional que envie o primeiro orçamento ganha 1 mês de Pro. Veja a seção 8.
- **Conteúdo:** 3 vídeos curtos por semana no Instagram, TikTok e YouTube Shorts.
- **Imprensa local e Sebrae:** apresente o caso dos fundadores ao Sebrae da cidade e a portais de empreendedorismo.
- **Teste de anúncios** com R$ 800: metade no Google, para buscas como "modelo de orçamento eletricista", e metade no Instagram e Facebook, para profissionais da construção na cidade. Mantenha só o canal que trouxer cadastro com primeiro orçamento enviado por menos de R$ 15.

### Fase 3: escala (meses 3 a 12)

Expandir cidade por cidade, repetindo o que funcionou, e ligar os canais que crescem sozinhos.

| Canal | Como funciona | Custo | Meta no mês 12 |
|---|---|---|---|
| SEO | As 12 páginas de profissão, mais guias como "quanto cobrar por m² de pintura" | Tempo | 40% dos cadastros |
| Marca no PDF | Cada orçamento do plano grátis mostra o Q3 Orça para um cliente, muitas vezes também prestador | Zero | 15% dos cadastros |
| Indicação | 1 mês de Pro para quem indicar | Receita adiada | 20% dos cadastros |
| Lojas de material | Cartaz no balcão e parceria com redes regionais | Impressão | 10 lojas por cidade ativa |
| Criadores do ofício | Eletricistas e pintores com canal no YouTube, com comissão recorrente sobre o Pro | Comissão | 5 parceiros |
| Cursos profissionalizantes | Aula sobre orçamento e acesso para alunos | Tempo | 3 escolas |
| Anúncios | Só os conjuntos que pagaram o próprio custo no teste | Variável | Limite de R$ 15 por profissional ativo |

**Parcerias para investigar:** programas de relacionamento de fabricantes de tintas e materiais elétricos com pintores e eletricistas, e redes regionais de lojas de material de construção. Confirme quais programas existem na sua região antes de abordar.

## 6. Preço e oferta

| Plano | Preço | Para quem |
|---|---|---|
| Grátis | R$ 0, sem prazo | Todos. É o motor do boca a boca, por causa da marca no PDF. |
| Teste Pro | 14 dias grátis | Contas novas, automático |
| Pro | R$ 14,90 por mês ou R$ 99 por ano | Quem quer a própria marca |
| Fundador | 3 meses grátis e R$ 59 no primeiro ano | Os 100 primeiros, ativados pelo painel admin |

O preço do fundador ainda não existe no checkout por Pix, que cobra R$ 14,90 ou R$ 99. No beta, ative pelo painel admin. Antes do lançamento oficial, peça a criação de um cupom.

## 7. Roteiros prontos

### Roteiro A: mensagem para conhecidos

> Fala, [nome]! Tudo certo? Lancei um app de orçamento para quem trabalha com [elétrica/pintura/reforma]. Você monta o orçamento no celular em 2 minutos, manda um link pelo WhatsApp, o cliente aprova por ali e já pode pagar a entrada no Pix. Estou escolhendo 50 profissionais para usar de graça e me ajudar a melhorar. Topa testar comigo 15 minutos esta semana?

### Roteiro B: post em grupo de profissionais

> Pessoal, uma dúvida sincera: como vocês mandam orçamento hoje? Por áudio, texto, papel? Eu fiz um app grátis que monta o orçamento com os itens da profissão, calcula desconto e entrada e gera um link para o cliente aprovar pelo celular. Se alguém quiser testar e me falar o que falta, eu ajudo a fazer o primeiro. Não precisa instalar nada.

### Roteiro C: conversa com a loja de material

> Bom dia! Vocês atendem muito eletricista e pintor, né? Criei um app gratuito que ajuda esses profissionais a mandar orçamento profissional e receber a entrada no Pix antes de comprar o material, ou seja, compram mais rápido. Posso deixar um cartaz com QR Code aqui no balcão? Coloco a loja como parceira no material.

### Roteiro D: vídeo de 30 segundos

1. **0 a 3 s:** "Cliente sumiu depois do orçamento?"
2. **3 a 20 s:** tela do celular. Escolher "Eletricista", tocar em 3 itens, colocar o nome do cliente e tocar em "Enviar link".
3. **20 a 27 s:** outro celular recebe, toca em "Aprovar" e o primeiro celular mostra "Aprovado".
4. **27 a 30 s:** "Q3 Orça. Grátis. Link na bio."

### Texto do cartaz de balcão

> **Orçamento no papel de pão? Não mais.**
> Monte no celular em 2 minutos, o cliente aprova pelo link e paga a entrada no Pix.
> Grátis para eletricistas, pintores, encanadores e pedreiros.
> [QR Code para q3orca.web.app/modelos-de-orcamento]

## 8. O que construir para escalar

Em ordem de impacto no crescimento:

1. **Programa de indicação.** Link pessoal de convite e Pro de 1 mês liberado quando o indicado enviar o primeiro orçamento. É o canal mais barato para o público, que já se indica entre si.
2. **Cupom de fundador** no checkout por Pix.
3. **Orçamento de exemplo no primeiro acesso,** já preenchido com itens da profissão, para o profissional ver o resultado antes de digitar qualquer coisa.
4. **Página pública do profissional,** como q3orca.com.br/p/marcos-eletrica, com serviços e botão de orçamento. Ela ajuda o profissional a ser encontrado e cria páginas para o Google.
5. **Guias de preço** para SEO, como "quanto cobrar por m² de pintura".
6. **Emissão de NFS-e** para MEI e ME. É a dor mais forte do público e o principal motivo para pagar.

## 9. Métricas

**Métrica principal:** orçamentos enviados por semana.

| Etapa | Meta | Onde ver |
|---|---|---|
| Cadastro, entre os visitantes | 8% | Google Analytics |
| Primeiro orçamento em até 24 horas | 60% | Evento `orcamento_enviado` |
| Ativo na semana 4 | 35% | Contas com orçamento enviado na semana 4 |
| Aprovação pelo link | 40% dos links enviados | Evento `link_aprovado` |
| Pedido ou pagamento do Pro | 4% dos ativos | Evento `pro_pedido` e painel admin |
| Custo por profissional ativo, em anúncios | até R$ 15 | Gerenciador de anúncios |

Revise toda segunda-feira, numa planilha simples com essas seis linhas.

## 10. Investimento nos primeiros 90 dias

| Item | Valor estimado |
|---|---|
| Domínio | R$ 40 por ano |
| Impressão de cartazes para 10 lojas | R$ 150 |
| Teste de anúncios | R$ 800 |
| Contador para abrir e manter a empresa | R$ 150 a R$ 300 por mês |
| Firebase e AbacatePay | Cota gratuita, mais R$ 0,80 por Pix recebido |
| **Total aproximado** | **R$ 1.500 a R$ 2.000** |

## 11. Cronograma de 12 semanas

| Semana | Foco | Entregas |
|---|---|---|
| 1 | Preparação | Contato e admin configurados, Search Console, 3 vídeos, contador acionado |
| 2 | Recrutamento | 30 mensagens do roteiro A, 3 lojas visitadas, 2 grupos |
| 3 | Fundadores | 20 profissionais com o primeiro orçamento feito junto |
| 4 | Fundadores | 40 profissionais, primeira rodada de entrevistas |
| 5 | Ajustes | Correções vindas das entrevistas, 50 fundadores, decisão de avançar |
| 6 | Lançamento oficial | Pix ligado, domínio no ar, depoimentos no site |
| 7 | Indicação | Programa de indicação no ar, cartazes em 10 lojas |
| 8 | Conteúdo | 12 vídeos publicados, primeiro guia de preço |
| 9 | Anúncios | Teste de R$ 800, comparação dos canais |
| 10 | Segunda cidade | Repetir o que funcionou numa cidade vizinha |
| 11 | Parcerias | Proposta a uma rede de lojas e a um criador do ofício |
| 12 | Revisão | Metas revistas com os dados reais e plano do trimestre seguinte |

## 12. Riscos

| Risco | Como reduzir |
|---|---|
| Concorrentes gratuitos | Vender o resultado, que é fechar e receber, com depoimentos reais da sua cidade |
| Profissional instala e não usa | Primeiro orçamento acompanhado e lembrete no segundo dia |
| Baixa disposição a pagar | Medir no beta quanto pagariam. Testar o anual de fundador antes de mexer no preço |
| Lançar pago sem empresa aberta | Não ligar o Pix antes do CNPJ e da nota fiscal das assinaturas |
| Domínio indefinido | Manter q3orca.web.app até a resposta do Registro.br. Não imprimir material com domínio novo antes disso |
| Divulgação em grupos vista como spam | Ajudar antes de divulgar, uma mensagem por grupo e só com permissão do administrador |

## 13. Decisões que dependem de você

1. Qual cidade será a primeira.
2. Quais 4 profissões entram no beta. A sugestão é eletricista, pintor, encanador e pedreiro.
3. Se a oferta de fundador fica em R$ 59 no primeiro ano.
4. Quanto tempo por semana você consegue dedicar a falar com profissionais. O beta precisa de pelo menos 6 horas por semana.
5. Se o próximo recurso a construir é o programa de indicação.
