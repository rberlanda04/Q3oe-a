# Guia da fase de testes (beta)

Como conduzir os testes do Q3 Orça com profissionais reais em https://q3orca.web.app, enquanto o domínio próprio não fica pronto.

## O que já está no ar

- **Selo "Beta"** no site e no app, ligado à página de convite.
- **Página de convite:** https://q3orca.web.app/beta
- **Pro grátis por 90 dias** para toda conta nova, sem cobrança. É a oferta de Fundador da estratégia, automática.
- **Botão "Dar opinião"** em todas as telas do app. Ele abre a central de ajuda já como sugestão.
- **Suporte:** central de ajuda no app e formulário Fale conosco no site. As respostas são dadas pelo painel `/admin`.
- **Pagamento por Pix desligado.** Ninguém é cobrado durante os testes.

## Links de convite

Use um link diferente por canal. O Google Analytics separa os cadastros pela origem.

| Canal | Link |
|---|---|
| Conhecidos pelo WhatsApp | https://q3orca.web.app/beta?utm_source=whatsapp&utm_medium=convite |
| Grupos de profissionais | https://q3orca.web.app/beta?utm_source=grupos&utm_medium=post |
| Loja de material (cartaz) | https://q3orca.web.app/beta?utm_source=loja-NOME&utm_medium=cartaz |
| Balaroti PRO | https://q3orca.web.app/beta?utm_source=balaroti&utm_medium=parceria |
| Instagram | https://q3orca.web.app/beta?utm_source=instagram&utm_medium=bio |

## Mensagem de convite

> Fala, [nome]! Estou testando um app de orçamento para quem trabalha com [elétrica/pintura/reforma]. Você monta o orçamento no celular em 2 minutos, manda um link pelo WhatsApp, o cliente aprova por ali e paga a entrada no Pix. Está em fase de testes e é grátis, com tudo liberado por 90 dias. Topa testar e me dizer o que achou? É só entrar aqui: [link]

## Acompanhamento de cada testador

| Quando | O que fazer |
|---|---|
| Dia 1 | Fazer o primeiro orçamento junto, por chamada ou pessoalmente |
| Dia 3 | Perguntar se o cliente recebeu e abriu o orçamento |
| Dia 7 | Perguntar: o que quase te fez desistir? O que você mostraria a um colega? |
| Dia 21 | Perguntar: você continuaria usando? Quanto pagaria por mês pelo Pro? |

Anote as respostas como sugestão no próprio app, para tudo ficar no mesmo lugar.

## Rotina da equipe

- **Todo dia:** abrir `/admin`, responder chamados e mensagens do Fale conosco.
- **Toda segunda:** rodar `npm run ops:metricas` e registrar a linha no `GESTAO.md`. O agente `gerente-q3orca` faz isso quando pedido.
- **A cada problema relatado:** reproduzir, corrigir, publicar na pré-visualização, rodar `npm run test:e2e` e só então publicar no site oficial.

### Gravidade dos problemas

| Gravidade | Exemplos | Prazo de correção |
|---|---|---|
| Crítico | Perda de dados, não consegue entrar, PDF não gera, link do cliente não abre | No mesmo dia |
| Alto | Conta errada no orçamento, Pix com código inválido, aprovação não aparece | Em até 2 dias |
| Médio | Texto confuso, botão difícil de achar, lentidão | Na semana |
| Baixo | Sugestão de recurso novo | Avaliar no fim do beta |

## Metas do beta

Iguais às da estratégia de Curitiba:

- 50 profissionais testando, com 35 ativos na quarta semana.
- 60% enviando o primeiro orçamento em até 24 horas.
- 10 depoimentos reais com autorização.
- Uma resposta clara sobre quanto pagariam pelo Pro.

## Como encerrar o beta

Faça nesta ordem:

1. **Ative os fundadores antes de desligar.** Ao desligar o beta, o teste volta a ser de 14 dias, e quem se cadastrou há mais tempo perde o Pro na hora. Para quem deve continuar no Pro, rode `npm run ops:fundador -- email meses`.
2. Ligue o pagamento: grave a chave de produção da AbacatePay e mude `PIX_ATIVO_EM_PRODUCAO` para `true`.
3. Em `src/config.ts`, mude `MODO_BETA` para `false`.
4. Rode os portões de qualidade, publique e rode `npm run test:e2e`.
5. Avise os testadores pelo WhatsApp, agradecendo e explicando o que muda.
