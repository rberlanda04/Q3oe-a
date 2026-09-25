# Q3 Orça

Gerador de orçamentos profissionais para prestadores de serviço, com envio pelo WhatsApp.
O plano do produto está em [PLANO.md](PLANO.md).

## Identidade visual

O manual completo fica em `/marca` (https://q3orca.web.app/marca). As cores são tokens do Tailwind definidos em `src/index.css` e espelhados em `src/domain/cores.ts`. Um teste garante que os dois continuam iguais e que as combinações de uso obrigatório têm contraste AA.

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
```

As regras em `firestore.rules` só permitem que cada usuário leia e escreva os próprios dados.
Um compartilhamento pode ser lido por quem tem o link. O cliente, sem login, só consegue registrar uma resposta, uma única vez.
