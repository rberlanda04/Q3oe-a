# Q3 Orça

Gerador de orçamentos profissionais para prestadores de serviço, com envio pelo WhatsApp.
O plano do produto está em [PLANO.md](PLANO.md).

## Identidade visual

O manual completo fica em `/marca` (https://q3orca.web.app/marca). As cores são tokens do Tailwind definidos em `src/index.css` e espelhados em `src/domain/cores.ts`. Um teste garante que os dois continuam iguais e que as combinações de uso obrigatório têm contraste AA.

## Plano Pro

Contas novas ganham 14 dias de Pro grátis, contados da criação da conta. Com o Pro, o profissional usa logo, cor da marca e dados da empresa nos documentos e no link do cliente, e a marca Q3 Orça sai do rodapé.

**Pedidos de assinatura** ficam em Firestore, na coleção `interesses`, com nome, e-mail, telefone e plano escolhido.

**Para ativar o Pro de alguém,** use o painel em `/admin`. Ele lista os pedidos, ativa 1 mês ou 1 ano, renova, encerra e apaga pedidos. O app do profissional reconhece na hora.

**Para ter acesso ao painel admin** (uma vez só):
1. Entre no app e abra `/admin`. A página mostra o seu UID.
2. No console do Firebase, em Firestore, crie a coleção `admins` com um documento cujo ID é esse UID. Qualquer campo serve, por exemplo `nome`.

Só administradores gravam em `assinaturas`, e ninguém consegue se tornar admin pelo app.

## Pagamento do Pro por Pix (AbacatePay)

O app gera um Pix exclusivo para cada pagamento, pela API da AbacatePay. Quando o Pix cai, o Pro é liberado sozinho, e a renovação soma o novo período ao que ainda resta.

A AbacatePay só faz cobrança automática recorrente no cartão. Por isso, o Pix funciona como renovação simples: o app avisa 5 dias antes de vencer e o profissional renova em um toque.

**Como funciona por dentro** (pasta `functions`):
- `criarCobrancaPix`: o servidor define o valor (R$ 14,90 ou R$ 99), cria o Pix e guarda em `pagamentos/{id}`.
- `verificarPagamento`: confere o status direto na AbacatePay quando o app pede ("Já paguei" e a cada 15 segundos).
- `webhookAbacatePay`: recebe o aviso da AbacatePay, valida o segredo do endereço e a assinatura HMAC, reconfirma na API e libera o Pro.
- A liberação roda numa transação: o mesmo pagamento nunca soma o período duas vezes.

**Para ativar:**
1. Crie a conta na AbacatePay e gere uma chave de API em **Dev mode**, para testar sem dinheiro real.
2. No console do Firebase, mude o projeto para o plano **Blaze**, exigido pelas funções do servidor. Crie um alerta de orçamento no Google Cloud. No volume inicial, o uso fica dentro da cota gratuita.
3. Grave os segredos (o segundo é uma senha longa que você inventa):
   ```bash
   firebase functions:secrets:set ABACATEPAY_API_KEY
   firebase functions:secrets:set ABACATEPAY_WEBHOOK_SECRET
   ```
4. Publique as funções: `firebase deploy --only functions`. O terminal mostra o endereço do `webhookAbacatePay`.
5. Na AbacatePay, crie um webhook com esse endereço e `?webhookSecret=SEU_SEGREDO` no final, com o evento `transparent.completed`.
6. Em `src/config.ts`, mude `PIX_ATIVO_EM_PRODUCAO` para `true`, rode `npm run build` e `firebase deploy --only hosting`.
7. Teste: gere um Pix no app e simule o pagamento no painel da AbacatePay em Dev mode.
8. Para valer: gere a chave de **produção**, grave de novo em `ABACATEPAY_API_KEY` e publique as funções outra vez.

**Validado com a API real** da AbacatePay em Dev mode: criação do Pix, QR Code, consulta de status e liberação do Pro após o pagamento simulado. Nesse modo, a taxa informada foi de R$ 0,80 por Pix. Confira a tabela de produção no painel da AbacatePay.

**Testes locais** (requerem Java 11+): `npm run test:pagamento` roda o fluxo completo nos emuladores, com uma AbacatePay simulada. Ele cobre pagamento, renovação, webhook repetido, segredo errado e assinatura adulterada.

## Suporte

- **Central de ajuda** (`/ajuda`): o profissional abre chamados e conversa com a equipe. Respostas novas aparecem com um ponto no ícone de ajuda do cabeçalho.
- **Fale conosco** (`/contato`): formulário público do site, para quem ainda não tem conta.
- **Painel admin** (`/admin`): abas de suporte, com resposta direto na conversa, e de contatos do site.

## Antes do lançamento

```bash
npm run checar-lancamento
```

Lista o que falta configurar: empresa, contatos, pagamento e passos fora do código.

## Configuração do negócio

Em `src/config.ts`:
- `SITE_URL`: endereço público. Troque ao ter domínio próprio.
- `EMPRESA_RAZAO_SOCIAL`, `EMPRESA_CNPJ`, `EMPRESA_CIDADE`: aparecem nos termos de uso e na política de privacidade.
- `EMAIL_CONTATO` e `WHATSAPP_SUPORTE`: canais de atendimento e do encarregado de dados (LGPD).
- `VIGENCIA_DOCUMENTOS_LEGAIS`: atualize sempre que mudar os termos ou a política.
- `WHATSAPP_VENDAS`: número que recebe os pedidos de Pro.
- `LINK_PAGAMENTO_MENSAL` e `LINK_PAGAMENTO_ANUAL`: links de checkout do provedor de pagamento.

## SEO

O `npm run build` faz três etapas:
1. `vite build` gera o app. Uma cópia do index.html vazio vira `app.html`, com `noindex`, e atende as rotas do app.
2. `vite build --ssr src/ssg.tsx` gera um bundle de servidor das páginas públicas.
3. `scripts/prerender.mjs` grava o HTML pronto de cada página de `src/seo/paginas.ts`, com título, descrição, canônico, Open Graph e JSON-LD, além de `sitemap.xml` e `robots.txt`.

O Firebase Hosting serve as páginas prontas pelo endereço limpo e manda o resto para `app.html`. Orçamentos de clientes (`/o/...`) recebem `X-Robots-Tag: noindex`.

Para adicionar uma página pública: crie a rota em `src/ssg.tsx` e em `src/main.tsx`, e a entrada em `PAGINAS_SEO`. O teste `src/seo/seo.test.ts` confere tamanho de título, descrição e duplicidade.

O plano de crescimento está em [PLANO-DE-ESCALA.md](PLANO-DE-ESCALA.md).

## Tecnologia

- React, TypeScript e Vite
- Tailwind CSS
- Firebase: Authentication, Cloud Firestore (com cache offline) e Hosting
- PDF gerado no próprio aparelho com @react-pdf/renderer
- App instalável (PWA)

## Configuração do Firebase (uma vez)

No [console do Firebase](https://console.firebase.google.com/project/q3orca):

1. **Authentication > Método de login:** ative **Google** e **E-mail/senha**.
2. **Firestore Database > Criar banco de dados:** escolha o modo de produção e a região `southamerica-east1` (São Paulo).
3. **Authentication > Configurações > Domínios autorizados:** confirme que `localhost` está na lista. Adicione seu domínio próprio quando tiver um.

## Desenvolvimento

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm test         # testes de cálculo, Pix, SEO e geração do PDF
npm run test:regras  # testes das regras de segurança no emulador (requer Java 11+)
npm run test:pagamento  # fluxo completo do Pix com AbacatePay simulada (requer Java 11+)
npm run build    # build de produção em dist/
```

## Publicação

As regras de segurança precisam ser publicadas antes do primeiro uso. Sem elas, o banco em modo de produção recusa todas as leituras e gravações.

```bash
firebase login
npm run build
firebase deploy --only firestore:rules,hosting
```

O app fica disponível em https://q3orca.web.app.

Sem o CLI, dá para colar o conteúdo de `firestore.rules` em **Firestore Database > Regras** no console e clicar em **Publicar**.

## Estrutura

```
src/
  domain/   regras de negócio: dinheiro em centavos, cálculos, Pix, valor por extenso, modelos
  data/     leitura e escrita no Firestore
  lib/      inicialização do Firebase e sessão do usuário
  pages/    telas: login, orçamentos, editor, clientes, itens, perfil e página pública
  pdf/      orçamento, ordem de serviço, recibo, termo de garantia e envio pelo WhatsApp
  ui/       componentes reutilizáveis
```

## Rotas

| Rota | Tela |
|---|---|
| `/` | Site para visitantes. Painel com resumo do mês para quem entrou |
| `/entrar` | Login e criação de conta (`?modo=criar`) |
| `/marca` | Manual da marca |
| `/modelos-de-orcamento` | Índice de modelos por profissão |
| `/modelo-de-orcamento/:profissao` | Modelo de orçamento de uma profissão, para SEO |
| `/planos` | Plano Pro e pedido de assinatura |
| `/admin` | Painel de administração: pedidos e assinaturas |
| `/ajuda` | Central de ajuda e chamados de suporte |
| `/contato` | Fale conosco, para visitantes |
| `/termos` | Termos de uso |
| `/privacidade` | Política de privacidade |
| `/site` | Site, acessível também para quem está logado |
| `/novo` | Escolha da profissão |
| `/orcamento/:id` | Editor do orçamento |
| `/clientes` | Cadastro e histórico de clientes |
| `/catalogo` | Itens salvos com preço |
| `/perfil` | Dados do profissional e chave Pix |
| `/o/:id` | Página pública do cliente, sem login |

## Dados no Firestore

```
users/{uid}                        perfil, contador de numeração
users/{uid}/orcamentos/{id}        orçamentos, com pagamentos recebidos
users/{uid}/clientes/{id}          clientes
users/{uid}/catalogo/{id}          itens salvos com preço
compartilhamentos/{id}             cópia pública do orçamento, aberta pelo link
assinaturas/{uid}                  assinatura Pro, gravada só pelo administrador
interesses/{uid}                   pedidos de assinatura do Pro
admins/{uid}                       quem acessa o painel admin (criado só pelo console)
pagamentos/{id}                    cobranças Pix do Pro, gravadas só pelo servidor
suporte/{id}/mensagens/{id}        chamados de suporte e a conversa
contatos/{id}                      mensagens do formulário Fale conosco
```

As regras em `firestore.rules` só permitem que cada usuário leia e escreva os próprios dados.
Um compartilhamento pode ser lido por quem tem o link. O cliente, sem login, só consegue registrar uma resposta, uma única vez.
