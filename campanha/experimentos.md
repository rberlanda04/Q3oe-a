# Q3 Orça: fila de experimentos de crescimento

Mantida pelo agente `marketing-q3orca` (método em `FUNIS.md`). ICE = média de Impacto, Confiança e
Facilidade, de 1 a 10. No máximo 3 rodando ao mesmo tempo. Resultado só com número real.

## Fila

| # | Funil | Hipótese | Como testar | Medida de sucesso | I | C | F | ICE | Estado |
|---|---|---|---|---|---|---|---|---|---|
| 1 | F1 | Quem busca "gerador de orçamento" converte melhor no gerador sem cadastro do que na home | Google Ads, R$ 15/dia por 14 dias, destino `/gerador-de-orcamento` | Custo por cadastro até R$ 8 | 8 | 7 | 7 | 7,3 | Aguarda contas de anúncio e site publicado |
| 2 | F2 | O gancho "seu cliente aprova pelo link" vence "orçamento em 2 minutos" | 3 conjuntos na Meta, mesmo público, R$ 10/dia | Menor custo por cadastro depois de R$ 30 por conjunto | 7 | 5 | 7 | 6,3 | Aguarda contas de anúncio |
| 3 | F3 | A marca d'água com o site no PDF grátis traz cadastros sem verba | Publicar a marca d'água e ler a origem `orcamento-cliente` por 30 dias | 2 cadastros a cada 100 orçamentos enviados | 9 | 5 | 8 | 7,3 | Em desenvolvimento |
| 4 | F6 | Mostrar "você enviou N orçamentos" no aviso de fim de teste aumenta a assinatura | Texto do aviso dos dias 23 e 27 | Teste → Pro acima de 10% | 8 | 5 | 6 | 6,3 | Proposta |
| 5 | F6 | Anual a R$ 99 em destaque rende mais caixa que o mensal | Trocar a ordem e o destaque em Planos | Mais da metade dos Pro no anual | 7 | 6 | 8 | 7,0 | Proposta |
| 6 | F4 | Pedir indicação logo depois de um orçamento aprovado gera mais convites | Convite na tela de aprovação | 1 convite a cada 5 aprovações | 6 | 5 | 6 | 5,7 | Proposta |
| 7 | F1 | Página por profissão e cidade ("orçamento de pintura em Curitiba") ganha busca local | 5 páginas piloto | Impressões no Search Console em 30 dias | 6 | 4 | 5 | 5,0 | Ideia |
| 8 | F2 | Depoimento em vídeo de um profissional real vence a demonstração de tela | 1 vídeo de fundador contra o melhor criativo | Custo por cadastro 20% menor | 8 | 6 | 3 | 5,7 | Depende de depoimento autorizado |

## Resultados

| Data | # | O que rodou | Número | Decisão |
|---|---|---|---|---|
