# Dia do lançamento: q3orca.com.br

Checklist em ordem. A branch `lancamento-dominio` já tem o app apontando para o domínio próprio
(endereço oficial, canonical, sitemap, PDFs e termos), o redirecionamento do endereço antigo e os links
da campanha com o domínio novo.

## 1. Domínio no ar (dono)

Zona DNS no Registro.br:

```
TXT    q3orca.com.br       hosting-site=q3orca
A      q3orca.com.br       199.36.158.100
CNAME  www.q3orca.com.br   q3orca.web.app
```

No Firebase Hosting, `www.q3orca.com.br` é o principal e `q3orca.com.br` redireciona para ele (configurado em 06/10).
Pronto quando `https://www.q3orca.com.br` abre com o cadeado e `q3orca.com.br` leva até ele.

## 2. Publicar (agente, com o OK do dono)

1. `git checkout main && git merge lancamento-dominio`
2. `npm test && npm run lint && npm run build`
3. Firebase Auth → Domínios autorizados: incluir `q3orca.com.br` e `www.q3orca.com.br`
   (sem isso o login com Google falha no domínio novo).
4. `firebase deploy --only hosting`
5. `npm run test:e2e -- ` com `BASE=https://www.q3orca.com.br` (teste de ponta a ponta no site publicado).
6. Conferir: `https://q3orca.web.app/modelo-de-orcamento/eletricista` sem login leva a
   `https://www.q3orca.com.br/modelo-de-orcamento/eletricista`; link de orçamento antigo `/o/...` continua abrindo.

## 3. Depois de publicar

- Google Search Console: cadastrar `q3orca.com.br` e enviar `https://www.q3orca.com.br/sitemap.xml` (dono).
- Painel da campanha: rodar `npm run ops:campanha` e gravar `painel/atual` com os links novos (agente).
- Reimprimir só o que ainda não foi impresso: os QR Codes do painel já usam o domínio novo.
- Cadastros feitos a partir de agora guardam o canal de origem (utm) e aparecem no funil por canal.

## 4. Semana 1 da campanha (dono)

Lista de 30 conhecidos, cadastro no Balaroti PRO, 5 lojas mapeadas e cartazes impressos.
Os textos prontos estão em "Tarefas da semana" no painel da campanha.

## Quem continua no endereço antigo

Quem já está logado em `q3orca.web.app` não é redirecionado (o cache offline é por endereço e um
orçamento ainda não sincronizado se perderia). Essas pessoas podem entrar em `www.q3orca.com.br` quando quiserem;
os dados ficam na conta.
