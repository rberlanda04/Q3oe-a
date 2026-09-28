# Plano de ação para escalar o Q3 Orça

Setembro de 2026. Este plano parte do que já está no ar e define o que fazer, em que ordem e como medir. Os números de meta são estimativas de partida e devem ser revistos a cada mês com os dados reais.

## 1. Onde estamos

**Produto pronto e publicado em https://q3orca.web.app:**
- Orçamento em 12 profissões, link de aprovação, QR Code Pix, recibo, ordem de serviço e garantia.
- Plano Pro com logo, cor da marca e dados do CNPJ. Contas novas ganham 14 dias de teste.
- Site com 15 páginas pré-renderizadas para o Google, sitemap e dados estruturados.

**Custo fixo atual:** zero. Tudo roda no plano gratuito do Firebase.

**O que ainda falta para cobrar de verdade:** cobrança recorrente automática, termos de uso, política de privacidade e empresa aberta para emitir nota.

## 2. Metas

| Prazo | Cadastros | Ativos na semana | Assinantes Pro | Receita mensal |
|---|---|---|---|---|
| 90 dias | 500 | 150 | 15 | R$ 180 |
| 6 meses | 3.000 | 800 | 100 | R$ 1.200 |
| 12 meses | 15.000 | 4.000 | 600 | R$ 7.200 |

Premissas: 4% dos ativos assinam o Pro, receita média de R$ 12 por assinante, considerando a mistura de planos mensal e anual.

**Métrica principal:** orçamentos enviados por semana. Ela mostra se o produto está sendo usado de verdade, antes de qualquer receita.

## 3. Funil e metas de conversão

| Etapa | Meta | Como medir |
|---|---|---|
| Visitante que cria conta | 8% | Google Analytics: visitas no site e cadastros |
| Conta que envia o primeiro orçamento em 24 horas | 60% | Firestore: contas com orçamento `enviado` |
| Ativo na 4ª semana | 35% | Contas que enviaram orçamento na semana 4 |
| Ativo que assina o Pro | 4% | Documentos em `assinaturas` |
| Cancelamento mensal do Pro | abaixo de 6% | Assinaturas não renovadas |

Com cancelamento de 6% ao mês, cada assinante fica em média 16 meses. A R$ 12 por mês, isso dá cerca de R$ 200 de receita por assinante ao longo da vida. Esse é o teto do que se pode gastar para conquistar um cliente pago.

## 4. Fase 0: fundação (semanas 1 e 2)

Sem estes itens, não dá para cobrar nem crescer com segurança.

1. **Domínio próprio.** Registre q3orca.com.br no Registro.br, por cerca de R$ 40 por ano, e conecte no Firebase Hosting. Depois, troque `SITE_URL` em `src/config.ts`. Domínio próprio passa confiança e concentra a autoridade de SEO.
2. **Google Search Console.** Verifique o domínio e envie o `sitemap.xml`. Acompanhe as buscas que trazem visitas.
3. **Termos de uso e política de privacidade.** São obrigatórios pela LGPD, porque o app guarda dados de clientes dos profissionais. Crie as páginas e ponha o link no rodapé e no cadastro.
4. **Empresa para receber.** A maioria das atividades de software não é permitida no MEI. Confirme com um contador o melhor enquadramento, normalmente uma ME no Simples Nacional.
5. **Cobrança do Pro.** Crie links de assinatura recorrente no Mercado Pago ou no Asaas. Preencha `LINK_PAGAMENTO_MENSAL`, `LINK_PAGAMENTO_ANUAL` e `WHATSAPP_VENDAS` em `src/config.ts`. No começo, a ativação é manual, como descrito no README.
6. **Eventos no Analytics.** Os eventos `conta_criada`, `orcamento_enviado`, `link_aprovado` e `pro_pedido` já são registrados. No Google Analytics, marque `orcamento_enviado` e `pro_pedido` como eventos principais (conversões) para acompanhar o funil.

## 5. Fase 1: validação com profissionais reais (semanas 3 a 8)

O objetivo é chegar a 50 profissionais usando toda semana e entender por que eles ficam ou saem.

- **Abordagem direta.** Converse com 10 profissionais por semana, entre conhecidos, grupos de bairro e lojas de material. Instale o app com eles e acompanhe o primeiro orçamento.
- **Grupos de WhatsApp e Facebook** de eletricistas, pintores, diaristas e confeiteiras. Ofereça ajuda, sem spam, e mostre um orçamento real.
- **Entrevista curta** com quem parou de usar: o que faltou?
- **Pedidos de interesse no Pro.** A coleção `interesses` no Firestore mostra quem clicou em "Quero o Pro". Chame cada um no mesmo dia.
- **Critério para seguir para a fase 2:** 35% dos cadastros ainda ativos na 4ª semana. Se não chegar lá, corrija o produto antes de investir em aquisição.

## 6. Fase 2: crescimento orgânico (meses 3 a 6)

### SEO
- **Páginas por profissão:** as 12 já estão no ar. Acompanhe no Search Console quais aparecem e melhore o texto das que ficam na segunda página.
- **Guias de preço:** escreva artigos como "quanto cobrar por m² de pintura" e "tabela de preços de eletricista". Esse tipo de busca tem muita procura e atrai exatamente o público do produto. Confirme o volume de cada termo no Planejador de Palavras-chave do Google antes de escrever.
- **Páginas por cidade,** só depois que as de profissão ganharem tração e com conteúdo local de verdade. Páginas geradas só trocando o nome da cidade são tratadas pelo Google como conteúdo fraco.

### Crescimento embutido no produto
- **Marca no PDF e no link:** cada orçamento do plano grátis mostra o Q3 Orça para um novo cliente, que muitas vezes também é prestador de serviço.
- **Programa de indicação:** quem indicar um profissional que envie o primeiro orçamento ganha 1 mês de Pro. O custo é zero, e o incentivo combina com o produto.
- **Página pública do profissional** (próximo recurso Pro): um endereço como q3orca.com.br/p/marcos-eletrica, com serviços, cidade e botão de orçamento. Ela ajuda o profissional a ser encontrado e gera páginas indexáveis para o Q3.

### Conteúdo e parcerias
- **Vídeos curtos** no TikTok, Reels e Shorts: um orçamento feito em 60 segundos, ou um antes e depois do papel de pão. Publique 3 por semana.
- **Lojas de material de construção:** cartaz com QR Code no balcão e parceria com a loja, que pode ganhar destaque nos orçamentos.
- **Cursos e instituições:** SENAI, Sebrae e escolas profissionalizantes. Ofereça o Q3 como ferramenta gratuita nas aulas de empreendedorismo.
- **Criadores do nicho:** profissionais com canal no YouTube, como eletricistas e pintores. Proponha afiliação com comissão recorrente sobre o Pro.

## 7. Fase 3: receita e produto (meses 6 a 12)

- **Cobrança automática:** o webhook do provedor de pagamento grava em `assinaturas/{uid}`. Isso exige Cloud Functions, no plano Blaze do Firebase, ou um Cloudflare Worker gratuito com o Firebase Admin SDK.
- **Plano Equipe**, a cerca de R$ 39 por mês: vários usuários na mesma empresa, orçamentos compartilhados e relatório por funcionário.
- **Recursos que aumentam a retenção:** agenda de serviços, lembrete automático de cobrança, contrato simples e relatório mensal.
- **Nota fiscal de serviço:** integrar a emissão da NFS-e Nacional para MEI e ME. Hoje isso é uma dor forte do público, e seria o principal motivo para migrar ao plano pago.
- **Receitas extras:** afiliação com contas PJ, maquininhas e contabilidade online, sempre com transparência para o usuário.

## 8. Custos e infraestrutura

| Item | Hoje | Quando muda |
|---|---|---|
| Firebase | Grátis (Spark) | O plano gratuito cobre 50 mil leituras e 20 mil gravações por dia. Migre para o Blaze quando passar de 70% desse limite em dias úteis, previsto por volta de mil ativos por dia. O custo segue baixo e é proporcional ao uso. |
| Domínio | R$ 40 por ano | Na fase 0 |
| Pagamentos | Taxa por transação | Cerca de 5% no Mercado Pago e no Asaas |
| Contador | R$ 150 a R$ 300 por mês | Ao abrir a empresa |

Configure um alerta de orçamento no Google Cloud assim que migrar para o Blaze.

## 9. Riscos e respostas

| Risco | Resposta |
|---|---|
| Profissional acha que não precisa de orçamento formal | Mostrar a aprovação pelo link e o Pix: eles fecham serviço mais rápido |
| Baixa conversão para pago | Testar preço anual menor e recursos Pro ligados a dinheiro, como NFS-e e cobrança |
| Concorrentes gratuitos | Foco em celular, WhatsApp, Pix e profissões brasileiras, que as ferramentas genéricas não cobrem |
| Limite do plano gratuito do Firebase | Monitorar o uso no console e migrar para o Blaze com alerta de custo |
| Dados de clientes vazarem | Regras do Firestore já isolam cada conta. Revisar as regras a cada recurso novo |

## 10. Cronograma dos primeiros 90 dias

| Semana | Entregas |
|---|---|
| 1 | Domínio, Search Console, sitemap enviado, eventos no Analytics |
| 2 | Termos e privacidade no ar, links de pagamento e WhatsApp de vendas configurados |
| 3 e 4 | 20 profissionais usando, com entrevista de cada um |
| 5 e 6 | Correções vindas das entrevistas, programa de indicação |
| 7 e 8 | 50 profissionais ativos, primeiras assinaturas Pro, decisão de seguir para a fase 2 |
| 9 e 10 | 4 guias de preço publicados, 12 vídeos curtos |
| 11 e 12 | Parceria com 3 lojas de material, revisão das metas com os dados reais |

## 11. Decisões que dependem de você

1. Registrar o domínio e escolher o nome definitivo do endereço.
2. Abrir a empresa e escolher o provedor de pagamento.
3. Definir quem responde os pedidos de Pro no WhatsApp.
4. Decidir se o preço de lançamento será R$ 14,90 por mês ou uma oferta de fundador, por exemplo R$ 79 no primeiro ano para os 100 primeiros.
