# Q3 Orça: funis de venda e método de crescimento

Manual do agente `marketing-q3orca`. Diz **como** decidir; os números do momento vêm de
`npm run ops:campanha` e os textos prontos de anúncio ficam no kit do dono
(`agent/estudos/q3orca-kit-anuncios-2026-11-14.md`).

Oferta atual (decisão do dono, 14/11/2026): grátis para sempre, com marca d'água e link do site no PDF;
30 dias de Pro grátis para conta nova; Pro a R$ 14,90/mês ou R$ 99/ano, fechado pelo WhatsApp de vendas
até o Pix automático entrar.

## 1. Método (de onde vem cada regra)

| Regra | Origem | Como aplicamos |
|---|---|---|
| Uma métrica guia | North Star (Sean Ellis) | **Orçamentos enviados por semana.** Cadastro sem orçamento enviado não conta como resultado |
| Funil em 5 etapas | AARRR (Dave McClure) | Aquisição → Ativação → Retenção → Receita → Indicação, medidas por canal |
| O produto vende | Product-led growth (Wes Bush) | A pessoa sente o valor antes de pagar e antes até de se cadastrar (gerador sem cadastro) |
| Caminho reto até o "aha" | Bowling alley (Wes Bush) | Tudo que não leva ao primeiro orçamento enviado sai da frente no primeiro uso |
| Ciclos, não campanhas | Growth loops (Brian Balfour) | Preferir o que se realimenta: cada PDF e cada link aprovado traz gente nova |
| Canal certo antes de verba | Bullseye (Gabriel Weinberg) | Testar barato 3 canais, concentrar no que der o menor custo por orçamento enviado |
| Fila de experimentos | ICE (Sean Ellis) | Nota de 1 a 10 para Impacto, Confiança e Facilidade; roda primeiro a maior média |
| Mensagem pelo grau de consciência | Eugene Schwartz | Quem busca "modelo de orçamento" recebe a solução; quem rola o Instagram recebe o problema |
| Posicionamento | April Dunford | Contra o quê competimos de verdade: papel, bloco de notas e mensagem digitada no WhatsApp, não outros apps |
| Oferta difícil de recusar | Equação de valor (Alex Hormozi) | Resultado desejado e certeza altos, tempo e esforço baixos: "PDF profissional em 2 minutos, grátis" |
| Sinal de encaixe | Teste dos 40% (Sean Ellis) | Perguntar a quem enviou 3+ orçamentos: "como se sentiria sem o Q3?" Meta: 40% "muito decepcionado" |

## 2. Para quem e com qual mensagem

**Público:** autônomo ou MEI de serviço (pintor, eletricista, pedreiro, marido de aluguel, gesseiro; depois
solar, câmeras, limpeza pós-obra, fretes, ar-condicionado) que hoje manda o preço digitado no WhatsApp.

**Trabalho que ele quer resolver:** "passar confiança e fechar o serviço sem perder a noite montando orçamento".

| Grau de consciência | Onde está | Mensagem | Destino |
|---|---|---|---|
| Sabe a solução, procura ferramenta | Google: "gerador de orçamento", "modelo de orçamento de pintura" | "Orçamento em PDF em 2 minutos. Comece sem cadastro." | `/gerador-de-orcamento` ou `/modelo-de-orcamento/<profissão>` |
| Sente o problema, não procura | Instagram, Facebook, grupos | "Ainda manda orçamento digitado no WhatsApp? O cliente compara com quem mandou PDF." | Página da profissão |
| Não vê problema | Balcão de loja, indicação de colega | Prova social: depoimento real e autorizado de um colega da mesma profissão | QR da loja ou link de indicação |

Sempre uma promessa e um pedido por peça. Nada de lista de funções.

## 3. Os funis

Cada funil tem a etapa, o que mede e o alvo inicial. Alvos são hipóteses: trocar pelo número real depois de
30 cadastros no funil.

### F1. Busca com intenção (Google Ads e SEO)
Pesquisa → gerador sem cadastro ou página da profissão → PDF gerado → convite para criar conta → primeiro
orçamento enviado.
- Mede: custo por clique, visita → cadastro (alvo 8%), cadastro → orçamento enviado (alvo 50%).
- Alavancas: título do anúncio igual à busca, página da profissão com o modelo já preenchido, convite de
  cadastro logo depois do PDF ("salve seus itens e saiba quando o cliente aprovar").

### F2. Descoberta (Reels e Stories da Meta)
Vídeo de 15 a 25 s por profissão → página da profissão → cadastro → primeiro orçamento enviado.
- Mede: custo por cadastro (alvo até R$ 8), retenção do vídeo nos 3 primeiros segundos.
- Alavancas: gancho nos 2 primeiros segundos, tela real do app, legenda queimada, um conjunto por gancho.

### F3. Ciclo do PDF e do link (viral, custo zero)
Profissional envia orçamento → cliente final abre o link ou o PDF com a marca do Q3 → parte dos clientes e
dos colegas chega ao site (`utm_source=orcamento-cliente`).
- Mede: visitas e cadastros com origem `orcamento-cliente` por 100 orçamentos enviados.
- Alavancas: marca d'água e rodapé no plano grátis, página pública do orçamento com "feito com Q3 Orça".
- É o ciclo mais importante: cresce junto com a métrica guia, sem verba.

### F4. Indicação entre colegas
Usuário ativo → "indique um colega" com a mensagem pronta → colega se cadastra (`utm_source=indicacao`).
- Mede: convites enviados por usuário ativo e cadastros por convite.
- Alavancas: pedir a indicação logo depois de um orçamento aprovado (melhor momento); proposta de prêmio
  (ex.: 1 mês de Pro para os dois) só com aprovação do dono.

### F5. Parceiros locais (Curitiba)
Loja de material, Sala do Empreendedor, Sebrae, SENAI → cartaz com QR por profissão → cadastro.
- Mede: cadastros por loja (`utm_source=loja-NOME`). Loja sem cadastro em 3 semanas: trocar o cartaz de lugar
  ou sair.
- O acompanhamento diário desse funil é do agente `campanha-q3orca`.

### F6. Do teste ao Pro (receita)
Cadastro → orçamento enviado na primeira sessão → 3 orçamentos em 7 dias → aviso de fim de teste → Pro.

| Dia | Gatilho | Mensagem |
|---|---|---|
| 0 | Criou a conta | "Faça seu primeiro orçamento agora: leva 2 minutos." Um botão só |
| 1 | Não enviou nenhum | Modelo da profissão dele já preenchido |
| 3 | Enviou 1 | "Seu cliente abriu?" + como acompanhar a aprovação |
| 7 | Enviou 3+ | Pedido de indicação (F4) e pergunta dos 40% |
| 23 | Faltam 7 dias de Pro | O que ele perde: PDF sem marca d'água, e o que usou no período ("você enviou N orçamentos") |
| 27 | Faltam 3 dias | Oferta anual em destaque: R$ 99/ano (R$ 8,25/mês) |
| 30 | Acabou | Continua grátis com a marca d'água; botão "Quero o Pro" (WhatsApp de vendas) |
| 37 | Não assinou e segue ativo | Último lembrete com depoimento real |

- Mede: ativação (alvo 50%), teste → Pro (alvo 10%; abaixo de 5%, rever a oferta antes de aumentar verba).
- Antes de propor qualquer mensagem, conferir no código o que o app já mostra (avisos em tela) e por onde
  dá para avisar. Envio por e-mail ou WhatsApp que ainda não existe vira proposta de desenvolvimento ou
  texto para o dono mandar à mão.

## 4. Ciclo semanal

1. **Ler:** `npm run ops:campanha -- --json` e a planilha de anúncios que o dono preencher. Achar a etapa
   com a maior perda (o gargalo).
2. **Escolher:** no máximo 3 experimentos da fila, pelo ICE, todos no gargalo.
3. **Preparar:** criativo, texto, link com utm e o que será medido. O dono publica.
4. **Fechar:** depois de 7 dias ou 30 conversões, registrar o resultado em `campanha/experimentos.md`:
   ganhou (vira padrão), perdeu (descarta) ou inconclusivo (repete uma vez).

Regras de corte de anúncio: conjunto com custo por cadastro acima de R$ 16 depois de R$ 30 gastos, pausar;
abaixo de R$ 4, aumentar 30% a cada 3 dias. Cadastro → orçamento enviado abaixo de 30%: o problema é o
primeiro uso, não o anúncio; parar de comprar tráfego e consertar a ativação.

## 5. Contas que mandam

- Um assinante Pro vale cerca de R$ 120 (R$ 14,90 × uns 8 meses; trocar pelo dado real quando houver).
- Custo máximo por assinante: R$ 40 (um terço do valor). Com 10% do teste virando Pro, custo por cadastro
  até R$ 4; com 20%, até R$ 8.
- Retorno do anúncio em até 3 meses, ou a verba não aumenta.
