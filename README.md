# Q3 Orça

Gerador de orçamentos profissionais para prestadores de serviço, com envio pelo WhatsApp.
O plano do produto está em [PLANO.md](PLANO.md).

## Identidade visual

O manual completo fica em `/marca` (https://q3orca.web.app/marca). As cores são tokens do Tailwind definidos em `src/index.css` e espelhados em `src/domain/cores.ts`. Um teste garante que os dois continuam iguais e que as combinações de uso obrigatório têm contraste AA.

## Plano Pro

Contas novas ganham 14 dias de Pro grátis, contados da criação da conta. Com o Pro, o profissional usa logo, cor da marca e dados da empresa nos documentos e no link do cliente, e a marca Q3 Orça sai do rodapé.

**Pedidos de assinatura** ficam em Firestore, na coleção `interesses`, com nome, e-mail, telefone e plano escolhido.

**Para ativar o Pro de alguém** (enquanto a cobrança automática não existe):
1. Em Authentication, copie o UID do usuário.
2. Em Firestore, crie o documento `assinaturas/{UID}` com os campos:
   - `plano`: texto `pro`
   - `validoAte`: carimbo de data (timestamp) com o fim do período pago
3. O app do profissional reconhece na hora, sem precisar sair e entrar.

Só o administrador consegue gravar em `assinaturas`. As regras do Firestore impedem que o próprio usuário se promova.

## Configuração do negócio

Em `src/config.ts`:
- `SITE_URL`: endereço público. Troque ao ter domínio próprio.
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
npm test         # testes de cálculo e de geração do PDF
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
```

As regras em `firestore.rules` só permitem que cada usuário leia e escreva os próprios dados.
Um compartilhamento pode ser lido por quem tem o link. O cliente, sem login, só consegue registrar uma resposta, uma única vez.
