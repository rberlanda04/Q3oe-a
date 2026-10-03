# Gestão do Q3 Orça

Painel único de andamento do projeto. O agente `gerente-q3orca` lê este arquivo no início de cada sessão e atualiza ao final. Status possíveis: **Feito**, **Em andamento**, **A fazer**, **Bloqueado**, **Aguardando dono**.

Última atualização: 3 de outubro de 2026.

**Fase atual: beta aberto em https://q3orca.web.app** (`MODO_BETA` ligado, Pro grátis por 90 dias). Condução em `GUIA-DE-TESTES.md`.

## Prioridades da semana

1. Testes reais no celular: 5 orçamentos, PDF pelo WhatsApp, QR Code de R$ 0,01 e instalação na tela inicial.
2. Convidar os primeiros 10 testadores com o link https://q3orca.web.app/beta?utm_source=whatsapp&utm_medium=convite.
3. Material impresso para Curitiba: cartaz e panfleto com QR Codes rastreáveis.
4. Lista de 30 profissionais conhecidos de Curitiba e cadastro no Balaroti PRO.

## 1. Produto e engenharia

| Tarefa | Responsável | Status | Próximo passo |
|---|---|---|---|
| Orçamento, link de aprovação, Pix, recibo, garantia, clientes, catálogo | Agente | Feito | Manter |
| Marca do assinante Pro (logo, cor, CNPJ) | Agente | Feito | Manter |
| Central de ajuda, Fale conosco e painel admin | Agente | Feito | Manter |
| Modo beta: selo, página /beta, "Dar opinião" e Pro grátis por 90 dias | Agente | Feito | Encerrar conforme GUIA-DE-TESTES.md |
| Botão de ativação de Fundador no painel admin | Agente | A fazer | Hoje: `npm run ops:fundador` |
| Programa de indicação (link pessoal, 1 mês de Pro) | Agente | A fazer | Aguardando aprovação do dono |
| Cupom de fundador no checkout por Pix | Agente | A fazer | Depois do programa de indicação |
| Orçamento de exemplo no primeiro acesso | Agente | A fazer | Fase 2 |
| Página pública do profissional (/p/nome) | Agente | A fazer | Fase 3 |
| Emissão de NFS-e | Agente | A fazer | Pesquisar API e custo |

## 2. Infraestrutura e pagamentos

| Tarefa | Responsável | Status | Próximo passo |
|---|---|---|---|
| Plano Blaze do Firebase | Dono | Feito | Criar alerta de orçamento no Google Cloud |
| Funções do Pix publicadas e testadas em produção (chave de teste) | Agente | Feito | Webhook liberou o Pro em ~10 s |
| Webhook da AbacatePay (Dev mode) apontando para o Q3 Orça | Agente | Feito | Criar o de produção junto com a chave |
| Chave de **produção** da AbacatePay no Secret Manager | Dono | Aguardando dono | `firebase functions:secrets:set ABACATEPAY_API_KEY` |
| Ligar `PIX_ATIVO_EM_PRODUCAO` | Agente | Bloqueado | Depende da chave de produção |
| Webhook "izicodev1" do outro projeto recebe os Pix do Q3 | Dono | Aguardando dono | Confirmar que o izicode ignora pagamentos que não são dele |
| Domínio q3orça.com.br | Dono | Aguardando dono | Resposta do Registro.br sobre q3orca.com.br (equivalente) |
| DNS e domínio no Firebase Hosting | Agente | Bloqueado | Depende da decisão do domínio |
| Google Search Console e sitemap | Dono | A fazer | Cadastrar o site |

## 3. Lançamento em Curitiba

Plano completo em `ESTRATEGIA-CURITIBA.md`.

| Tarefa | Responsável | Status | Próximo passo |
|---|---|---|---|
| Estratégia regional | Agente | Feito | Revisar a cada 2 semanas |
| Cartaz e panfleto com QR Codes por parceiro | Agente | A fazer | Gerar PDF para impressão |
| Lista de 30 profissionais conhecidos | Dono | A fazer | Nome, profissão e WhatsApp |
| Cadastro no Balaroti PRO | Dono | A fazer | Entender o programa antes da proposta |
| Proposta ao Balaroti PRO | Dono | A fazer | Roteiro pronto na estratégia |
| Proposta à Sala do Empreendedor | Dono | A fazer | Roteiro pronto na estratégia |
| 5 lojas de bairro mapeadas | Dono | A fazer | Mesmo bairro, para concentrar |
| 50 Fundadores ativos | Dono e agente | A fazer | Semanas 2 a 5 |

## 4. Marketing, conteúdo e SEO

| Tarefa | Responsável | Status | Próximo passo |
|---|---|---|---|
| Identidade visual e manual da marca | Agente | Feito | Manter |
| Site com 18 páginas pré-renderizadas | Agente | Feito | Manter |
| 12 páginas de modelo por profissão | Agente | Feito | Acompanhar no Search Console |
| 3 vídeos curtos de demonstração | Dono | A fazer | Roteiro D da estratégia |
| Guias de preço para SEO | Agente | A fazer | Primeiro: "quanto cobrar por m² de pintura" |
| Depoimentos reais no site | Agente | Bloqueado | Depende dos fundadores |

## 5. Suporte e operação

| Tarefa | Responsável | Status | Próximo passo |
|---|---|---|---|
| Painel admin liberado para r.berlanda04@gmail.com | Agente | Feito | Manter |
| Contato oficial no app | Agente | Feito | Termos apontam para Fale conosco e central de ajuda; e-mail e WhatsApp são opcionais |
| Responder chamados e Fale conosco | Dono | Em andamento | Ver o painel admin diariamente |
| Ativar Pro de fundadores | Agente | Em andamento | `npm run ops:fundador -- email 3` |

## 6. Jurídico e empresa

| Tarefa | Responsável | Status | Próximo passo |
|---|---|---|---|
| Termos de uso e política de privacidade | Agente | Feito | Revisão de advogado antes do lançamento pago |
| Exclusão de conta pelo usuário (LGPD) | Agente | Feito | Manter |
| Abrir empresa (CNPJ) | Dono | Aguardando dono | Adiado por decisão do dono; necessário antes de cobrar com nota |
| Dados da empresa em `src/config.ts` | Agente | Bloqueado | Depende do CNPJ |

## 7. Métricas e finanças

| Tarefa | Responsável | Status | Próximo passo |
|---|---|---|---|
| Eventos do funil no Google Analytics | Agente | Feito | Marcar conversões no GA |
| Painel de métricas (`npm run ops:metricas`) | Agente | Feito | Registrar números toda segunda |
| Planilha semanal com as 6 métricas do funil | Agente | A fazer | Primeira leitura no início do beta |

## Registro de métricas

| Data | Contas | Novas 7 dias | Orçamentos | Aprovados | Pro ativos | Pedidos Pro | Chamados abertos |
|---|---|---|---|---|---|---|---|
| 2026-10-03 | 3 | 2 | 10 | 0 | 0 | 0 | 0 |

## Registro de decisões

| Data | Decisão | Motivo |
|---|---|---|
| 2026-09-28 | Pix como renovação simples, não cobrança automática | A AbacatePay só faz assinatura recorrente no cartão |
| 2026-10-03 | Lançar sem CNPJ por enquanto | Decisão do dono; beta gratuito não exige |
| 2026-10-03 | Curitiba como primeira praça | Escolha do dono; ecossistema local forte (Balaroti PRO, Salas do Empreendedor) |
| 2026-10-03 | Pix desligado no site até a chave de produção | Com chave de teste, o QR Code não recebe dinheiro de verdade |
| 2026-10-03 | Beta aberto em q3orca.web.app, com Pro grátis por 90 dias | Domínio próprio ainda pendente; oferta de Fundador automática |
