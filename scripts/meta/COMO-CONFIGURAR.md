# API da Meta: configuração (uma vez, no PC)

Leva uns 10 minutos. Quem faz é o Rogério, logado no Facebook que administra a página Q3 Orça.

## 1. Criar o app

1. Abra https://developers.facebook.com/apps e clique em **Criar app**.
2. Caso de uso: **Outro** → tipo **Empresa**. Nome: `Q3 Orça Publicador`. Portfólio: o do Q3 Orça (não o de outros negócios).
3. No painel do app, em **Configurações do app → Básico**, anote o **ID do app** e a **Chave secreta do app**.
4. O app fica em **modo de desenvolvimento**: funciona para a sua própria página sem análise da Meta.

## 2. Gerar o token

1. Abra https://developers.facebook.com/tools/explorer
2. Em **Aplicativo da Meta**, escolha `Q3 Orça Publicador`. Em **Usuário ou página**, deixe **Token do usuário**.
3. Em **Permissões**, adicione: `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `instagram_basic`, `instagram_content_publish`, `business_management`.
4. Clique em **Gerar token de acesso**, faça login e, na lista, marque **só a página Q3 Orça** e **só o Instagram @q3orca** (não marque a de clips de GTA).
5. Copie o token que aparece.

## 3. Gravar no cofre

No terminal, dentro da pasta do projeto:

```
npm run meta -- configurar
```

Cole o ID do app, a chave secreta e o token. O script troca o token por um permanente da página, confere que a página se chama "Q3 Orça" e grava tudo em `C:\Users\rberl\.secrets\q3orca\meta.env` (fora do OneDrive e do repositório). Não cole o token no chat.

## 4. Testar

```
npm run meta -- verificar
```

Deve mostrar a página Q3 Orça, o @q3orca, "token válido · não expira" e as permissões.

## O que dá e o que não dá pela API

| Pode | Não pode |
|---|---|
| Foto e vídeo/Reel na página, na hora ou agendados (até 29 dias) | Postar em grupos (a Meta tirou essa API em 2024): grupos continuam pelo navegador |
| Foto e Reel no Instagram, na hora | Agendar no Instagram pela API (o script publica na hora; para horário marcado, usar o agendador do Windows) |
| Ler reações, comentários e posts agendados | Responder comentário sem o OK do Rogério (regra nossa) |

Publicar sempre segue a regra: prévia (`npm run meta -- previa <post.json>`), "ok" do Rogério no chat, depois `publicar <post.json> --confirmar`.
