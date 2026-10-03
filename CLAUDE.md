# Q3 Orça

Gerador de orçamentos para prestadores de serviço (eletricistas, pintores, encanadores e outros), com envio pelo WhatsApp, link de aprovação, Pix, recibo e garantia. Site e app em https://q3orca.web.app. Repositório: https://github.com/rberlanda04/Q3oe-a.

Toda comunicação com o dono do projeto e todo texto do produto são em **português do Brasil**.

## Documentos de referência

| Arquivo | Conteúdo |
|---|---|
| `GUIA-DE-TESTES.md` | Como conduzir a fase beta: convites, acompanhamento, gravidade de problemas e como encerrar |
| `GESTAO.md` | Painel de gestão: frentes, tarefas, responsáveis e status. **Fonte da verdade do andamento.** |
| `ESTRATEGIA-DE-LANCAMENTO.md` | Diagnóstico de prontidão, público-alvo, fases e roteiros |
| `ESTRATEGIA-CURITIBA.md` | Lançamento na primeira praça: parceiros, metas e cronograma |
| `PLANO-DE-ESCALA.md` | Metas de 12 meses, funil e custos |
| `PLANO.md` | Plano original do produto |
| `README.md` | Arquitetura, configuração, Pix, SEO, suporte e comandos |
| `/marca` no site | Manual da marca: cores, tipografia, voz e tom |

## Arquitetura

- **Front-end:** React, TypeScript, Vite e Tailwind 4 (tokens da marca em `src/index.css`). App instalável (PWA).
- **Firebase:** Authentication, Firestore com cache offline, Hosting e Cloud Functions (plano Blaze).
- **Funções do servidor** (`functions/`, região `southamerica-east1`): `criarCobrancaPix`, `verificarPagamento` e `webhookAbacatePay`. Pagamento do Pro por Pix via AbacatePay.
- **Páginas públicas pré-renderizadas** no build (`src/ssg.tsx`, `scripts/prerender.mjs`). Rotas do app caem em `app.html`, com noindex.
- **Configuração do negócio** em `src/config.ts` (contatos, empresa, preços, chave de ativação do Pix).

### Pastas

```
src/domain/   regras de negócio puras e testadas (dinheiro, cálculos, Pix, plano, cores, empresa)
src/data/     acesso ao Firestore (repo.ts)
src/lib/      Firebase, sessão, eventos, pagamentos, imagem, CNPJ
src/pages/    telas do app; src/pages/site/ são as páginas públicas
src/pdf/      documentos em PDF
src/seo/      metadados e conteúdo das páginas de SEO
functions/    servidor de pagamentos (AbacatePay)
scripts/ops/  operações administrativas em produção (métricas, fundador, Firestore)
tests/        regras do Firestore, pagamento no emulador e teste de ponta a ponta
```

## Comandos

| Comando | Para que serve |
|---|---|
| `npm run dev` | Rodar localmente |
| `npm test` | Testes unitários (Vitest), inclusive das funções |
| `npm run lint` | Lint (oxlint) |
| `npm run build` | Build completo com pré-renderização |
| `npm run test:regras` | Regras do Firestore no emulador (requer Java 11+) |
| `npm run test:pagamento` | Fluxo do Pix no emulador, com AbacatePay simulada (requer Java 11+) |
| `npm run test:e2e` | Teste de ponta a ponta no navegador contra o site publicado (`BASE=` para outro endereço) |
| `npm run checar-lancamento` | Lista o que falta configurar antes do lançamento |
| `npm run ops:metricas` | Números de produção: contas, orçamentos, aprovações, assinantes, suporte |
| `npm run ops:fundador -- email [meses]` | Ativa ou renova o Pro de um profissional |
| `npm run ops:firestore -- ler/listar/gravar/apagar caminho` | Leitura e escrita administrativa no Firestore |
| `firebase deploy --only hosting` | Publicar o site |
| `firebase deploy --only functions` | Publicar as funções do servidor |
| `firebase hosting:channel:deploy teste --expires 7d` | Publicar numa URL de pré-visualização |

Os scripts `ops:*` usam o login do Firebase CLI desta máquina e ignoram as regras do Firestore.

## Regras de trabalho

1. **Antes de publicar em produção:** `npx tsc -b`, `npm run lint`, `npm test` e `npm run build` limpos. Mudou `firestore.rules`: rode `npm run test:regras`. Mudou `functions/`: rode `npm run test:pagamento`. Mudança visível ao usuário: publique no canal de pré-visualização e rode `BASE=<url> npm run test:e2e` antes de publicar no site oficial.
2. **Dinheiro sempre em centavos inteiros.** Cálculos ficam em `src/domain/`, com testes.
3. **Nunca grave segredos no repositório.** Chaves da AbacatePay ficam no Secret Manager (`firebase functions:secrets:set`). Arquivos `*.local` são só para emuladores e estão no `.gitignore`.
4. **Fase beta:** `MODO_BETA` em `src/config.ts` liga o selo Beta, a página `/beta`, o botão "Dar opinião" e o Pro grátis por `DIAS_PRO_BETA` dias. Antes de desligar, siga "Como encerrar o beta" em `GUIA-DE-TESTES.md`.
5. **Pix:** `PIX_ATIVO_EM_PRODUCAO` só pode ser `true` com a chave de **produção** da AbacatePay gravada. Com chave de teste, o QR Code é falso.
6. **Dados de usuários reais** nunca são apagados ou alterados sem pedido explícito do dono. Contas de teste usam e-mails que começam com `teste-automatizado` e são apagadas ao fim de cada teste.
7. **Textos do produto:** voz da marca (direta, de colega para colega, sem jargão). Nada de depoimentos, números ou parcerias inventados.
8. **Commits** em português, terminando com a linha `Co-Authored-By` indicada pelo ambiente.
