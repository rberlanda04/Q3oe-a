# Q3 Orça: fila de experimentos de crescimento

Mantida pelo agente `marketing-q3orca` (método em `FUNIS.md`). ICE = média de Impacto, Confiança e
Facilidade, de 1 a 10. No máximo 3 rodando ao mesmo tempo. Resultado só com número real.

## Leitura mais recente: 14/11/2026 (arquivo `leituras/2026-11-15.json`, semana 6 da campanha)

Fontes: `ops:campanha` e `ops:metricas`, só consulta. Amostra muito pequena: os percentuais servem para
apontar a etapa, não para concluir.

| Canal | Visitas | Cadastros | Criaram orçamento | Enviaram | Pro |
|---|---|---|---|---|---|
| Antes da campanha (até 04/10) | sem dado | 5 | 4 | 4 | 0 |
| Direto / nenhum | sem dado | 3 | 3 | 0 | 0 |
| Google orgânico | 14 | 1 | 1 | 0 | 0 |
| Indicação (WhatsApp) | 3 | 1 | 1 | 1 | 0 |
| Referência (q3orca.web.app) | 4 | 1 | 1 | 1 | 0 |
| chatgpt.com | 1 | 1 | 1 | 0 | 0 |
| Sem origem | sem dado | 1 | 0 | 0 | 0 |
| Facebook | 5 | 0 | 0 | 0 | 0 |
| Instagram | 3 | 0 | 0 | 0 | 0 |
| Bing orgânico | 2 | 0 | 0 | 0 | 0 |
| Referência (q3orca.firebaseapp.com) | 1 | 0 | 0 | 0 | 0 |
| **Total** | **33 medidas** | **13** | **11** | **6** | **0** |

- Na campanha (desde 05/10): 8 cadastros, 7 criaram orçamento, 2 enviaram (25%). Abaixo dos 30% do
  `FUNIS.md`: pela regra, não comprar tráfego antes de consertar o primeiro uso.
- Métrica guia: 3 orçamentos enviados nos últimos 7 dias (semanas 1 a 6: 6, 9, 1, 2, 1, 3).
- Receita: 0 assinantes Pro, 0 pedidos do Pro pendentes. Teste → Pro: sem dado, porque as 13 contas são
  do beta (90 dias de Pro) e o teste de 30 dias só vale para contas criadas a partir de 15/11.
- Origem `orcamento-cliente` (F3) e `gerador`: nenhuma visita e nenhum cadastro na leitura.
- Gasto, cliques e custo por cadastro de anúncio: sem dado (não há anúncio rodando nem planilha).
- **Gargalo: criou orçamento → enviou** (na campanha, 7 criaram e 2 enviaram). O segundo problema é
  volume: 33 visitas medidas em 6 semanas.

## O que o código já faz (conferido em 14/11/2026)

- **Aviso de fim de teste:** só dentro do app, na lista de Orçamentos, quando faltam 5 dias ou menos
  (`src/pages/Orcamentos.tsx`): "Seu teste do Pro acaba em N dias. Depois, os documentos voltam a sair sem
  seu logo." Leva à tela de Planos. Para a conta de 30 dias aparece do dia 25 ao 30. Não há aviso no dia
  23, não cita quantos orçamentos a pessoa enviou e não existe envio por e-mail ou WhatsApp.
- **Depois que o teste acaba:** nenhum aviso. Só o selo "Plano grátis" em Meus dados e em Planos.
- **Selo do plano** (`src/ui/SeloPlano.tsx`): mostra os dias restantes, mas só em Meus dados e em Planos.
- **Planos** (`src/pages/Planos.tsx`): o anual já vem primeiro e pré-selecionado, "R$ 99 por ano ·
  economize 44%". Não mostra o equivalente por mês (R$ 8,25).
- **"Quero o Pro":** com o Pix desligado (`PIX_ATIVO_EM_PRODUCAO = false`) e sem link de pagamento, grava o
  pedido para o painel admin, registra o evento `pro_pedido` com o plano escolhido, abre o WhatsApp de
  vendas com a mensagem pronta (plano e e-mail de acesso) e mostra "Pedido recebido!".
- **Texto errado para conta nova:** com `MODO_BETA = true`, a tela de Planos diz "o Pro é grátis por 90
  dias" e o selo diz "Pro grátis no beta" também para quem se cadastrar a partir de 15/11 e tem 30 dias.
- **Renovação:** `DIAS_AVISO_RENOVACAO = 5` vale só para assinante pago (aviso em Orçamentos e em Planos).
- **Indicação** (`src/domain/indicacao.ts`): cartão fixo "Conhece alguém que também faz orçamento?" com
  botão "Indicar" na lista de Orçamentos, para quem tem ao menos um orçamento aprovado. Mensagem pronta
  com `utm_source=indicacao`. O clique não gera evento: convites enviados são "sem dado". Não há pedido na
  hora da aprovação nem prêmio.
- **Ciclo do link (F3):** o "Feito com Q3 Orça" da página pública e a marca no PDF só aparecem para conta
  sem Pro. Como todas as contas estão no teste, o ciclo está desligado para 100% da base hoje.
- **Possível falha de contagem do envio:** no caminho em que o celular pede um segundo toque ("Enviar
  agora"), `enviarPendente` em `src/pages/Editor.tsx` envia o PDF mas não marca o orçamento como enviado
  nem registra `orcamento_enviado`. Parte dos "criou e não enviou" pode ser envio não contado.

## Fila

| # | Funil | Hipótese | Como testar | Medida de sucesso | I | C | F | ICE | Estado |
|---|---|---|---|---|---|---|---|---|---|
| 10 | Ativação | Quem criou e não enviou travou num ponto que só ele sabe dizer | O dono chama os 5 que criaram orçamento e não enviaram (pelo painel admin) com uma pergunta: "o que faltou para mandar ao cliente?" | 3 respostas e um motivo repetido | 8 | 7 | 9 | 8,0 | Pronto para rodar; depende do dono |
| 9 | Ativação | Parte do "não enviou" é envio pelo celular que o app não conta | Marcar como enviado e registrar o evento também no "Enviar agora"; comparar criou → enviou nos 14 dias seguintes | Criou → enviou acima de 50% nos cadastros novos | 8 | 6 | 8 | 7,3 | Proposta de desenvolvimento |
| 3 | F3 | A marca com o site no PDF e no link grátis traz cadastros sem verba | Ler a origem `orcamento-cliente` por 30 dias. Decisão do dono: manter o "Feito com Q3 Orça" no link público também durante o teste | 2 cadastros a cada 100 orçamentos enviados | 9 | 4 | 8 | 7,0 | No código, mas desligado na prática: todas as contas estão no teste. 0 visitas com essa origem em 14/11 |
| 11 | F6 | Quem perde o Pro sem nenhum aviso não volta à tela de Planos | Aviso na lista de Orçamentos depois do fim do teste, com botão "Quero o Pro"; junto, corrigir o texto "90 dias" para conta de 30 | Pedidos do Pro (`pro_pedido`) em 10% dos testes encerrados | 7 | 6 | 7 | 6,7 | Proposta; precisa estar pronto antes de 10/12 |
| 1 | F1 | Quem busca "gerador de orçamento" converte melhor no gerador sem cadastro do que na home | Google Ads, R$ 15/dia por 14 dias, destino `/gerador-de-orcamento` | Custo por cadastro até R$ 8 | 8 | 5 | 7 | 6,7 | Em espera: cadastro → enviado em 25% (regra dos 30%) e sem contas de anúncio |
| 6 | F4 | Pedir indicação logo depois de um orçamento aprovado gera mais convites | Já existe o cartão fixo na lista; falta o evento no clique e o convite na hora da aprovação | 1 convite a cada 5 aprovações | 6 | 6 | 8 | 6,7 | Parcial no código; convites sem dado. Indicação: 3 visitas, 1 cadastro, 1 enviou |
| 2 | F2 | O gancho "seu cliente aprova pelo link" vence "orçamento em 2 minutos" | 3 conjuntos na Meta, mesmo público, R$ 10/dia | Menor custo por cadastro depois de R$ 30 por conjunto | 7 | 5 | 7 | 6,3 | Em espera: mesma regra dos 30% e sem contas de anúncio |
| 4 | F6 | Mostrar "você enviou N orçamentos" no aviso de fim de teste aumenta a assinatura | Texto do aviso; hoje ele só existe a partir de 5 dias do fim e fala do logo | Teste → Pro acima de 10% | 8 | 5 | 6 | 6,3 | Proposta; só dá para medir quando houver testes acabando (a partir de dezembro) |
| 5 | F6 | Anual a R$ 99 em destaque rende mais caixa que o mensal | Já é o padrão em Planos; resta mostrar "R$ 8,25 por mês" e ler o plano no `pro_pedido` | Mais da metade dos Pro no anual | 4 | 6 | 9 | 6,3 | Destaque já no código; resultado sem dado (0 pedidos) |
| 8 | F2 | Depoimento em vídeo de um profissional real vence a demonstração de tela | 1 vídeo de fundador contra o melhor criativo | Custo por cadastro 20% menor | 8 | 6 | 3 | 5,7 | Depende de depoimento autorizado |
| 7 | F1 | Página por profissão e cidade ("orçamento de pintura em Curitiba") ganha busca local | 5 páginas piloto | Impressões no Search Console em 30 dias | 6 | 4 | 5 | 5,0 | Ideia |

Nenhum experimento rodando em 14/11/2026.

## Resultados

| Data | # | O que rodou | Número | Decisão |
|---|---|---|---|---|
