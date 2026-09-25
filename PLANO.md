# Plano: Gerador de Orçamentos para Prestadores de Serviço

## 1. Visão geral

Aplicativo web, instalável no celular, que permite a qualquer prestador de serviço criar um orçamento profissional em menos de 2 minutos e enviá-lo pelo WhatsApp em PDF ou por link.

**Público:** eletricistas, encanadores, pintores, pedreiros, marceneiros, técnicos de ar-condicionado, diaristas, jardineiros, montadores de móveis, fotógrafos, freelancers, confeiteiras e buffets.

**Princípios:**
- **Custo operacional zero.** O app roda no navegador e usa o plano gratuito do Firebase (Spark) para login, banco de dados e hospedagem.
- **Celular primeiro.** O público trabalha na rua, com o celular na mão.
- **Funciona offline.** O app abre e gera PDF sem internet.
- **Privacidade.** Cada profissional só acessa os próprios dados, garantido pelas regras de segurança do Firestore.

## 2. Funcionalidades

### 2.1 Perfil do profissional
- Nome ou razão social, CPF ou CNPJ, telefone, e-mail, endereço e cidade.
- Logo (imagem redimensionada e salva localmente).
- Chave Pix e nome do recebedor.
- Assinatura desenhada na tela.
- Textos padrão: condições de pagamento, garantia e observações.

### 2.2 Modelos por tipo de serviço
Cada modelo traz itens prontos, unidades de medida adequadas, campos extras e textos de garantia típicos da profissão.

| Profissão | Unidades comuns | Itens e campos específicos |
|---|---|---|
| Eletricista | ponto, unidade, hora | tomadas, disjuntores, quadro, chuveiro |
| Encanador | ponto, metro, hora | caixa d'água, vazamento, desentupimento |
| Pintor | m², diária | área, número de demãos, massa corrida |
| Pedreiro | m², m³, diária | contrapiso, reboco, assentamento de piso |
| Ar-condicionado | unidade | BTUs, instalação, limpeza, carga de gás |
| Marceneiro | unidade, m² | material, acabamento, prazo de fabricação |
| Diarista e limpeza | diária, hora, m² | limpeza pós-obra, pesada, comum |
| Jardinagem | m², visita | poda, corte de grama, manutenção mensal |
| Montador de móveis | peça | guarda-roupa, cozinha, desmontagem |
| Fotógrafo | hora, pacote | cobertura, fotos editadas, álbum |
| Freelancer digital | projeto, hora | site, logo, gestão de redes |
| Confeitaria e buffet | pessoa, kg, unidade | bolo por kg, salgados por cento, convidados |

- O usuário pode criar e editar os próprios modelos.
- Calculadoras embutidas: área de parede e piso (com desconto de portas e janelas), litros de tinta e quantidade de piso com perda.

### 2.3 Catálogo de itens
- Serviços e materiais salvos com preço, para reaproveitar em outros orçamentos.
- Separação entre mão de obra e material.
- Margem opcional sobre o custo do material.

### 2.4 Montagem do orçamento
- Cliente (novo ou do cadastro), endereço da obra e data.
- Itens agrupados por seção, por exemplo "Cozinha" e "Banheiro".
- Quantidade, unidade, preço unitário e subtotal automático.
- Desconto em percentual ou valor, taxa de deslocamento e outros acréscimos.
- Condições de pagamento: à vista com desconto, parcelado, ou entrada mais saldo.
- Prazo de execução e validade do orçamento.
- Fotos do local anexadas ao PDF.
- Numeração sequencial automática, por exemplo 2026-0042.
- Duplicar orçamento existente.

### 2.5 Saída e envio
- **PDF profissional** com três layouts visuais.
- **Envio pelo WhatsApp** usando o compartilhamento nativo do celular, com o PDF anexado.
- **Link do orçamento sem servidor.** Os dados vão comprimidos dentro do próprio link. O cliente abre a página, vê o orçamento formatado e toca em "Aprovar", que abre o WhatsApp com mensagem pronta para o profissional.
- **QR Code Pix** gerado no próprio aparelho, sem API, para cobrar o sinal ou o valor total.

### 2.6 Acompanhamento
- Status: rascunho, enviado, aprovado, recusado e expirado.
- Lembrete de orçamentos enviados há mais de três dias sem resposta.
- Conversão de orçamento aprovado em **ordem de serviço**, **recibo** e **termo de garantia**.
- Painel com total orçado no mês, total aprovado e taxa de aprovação.

### 2.7 Clientes
- Cadastro com nome, telefone e endereço.
- Histórico de orçamentos e recibos por cliente.
- Importação de contato do celular, quando o navegador permitir.

### 2.8 Backup
- Exportar e importar todos os dados em arquivo.
- Aviso periódico para fazer backup, já que os dados ficam só no aparelho.

## 3. Monetização

Modelo freemium, sem custo fixo.

| Recurso | Grátis | Pro |
|---|---|---|
| Orçamentos ilimitados | Sim | Sim |
| Modelos por profissão | Sim | Sim |
| Envio por WhatsApp | Sim | Sim |
| Marca "feito com o app" no PDF | Sim | Removida |
| Logo e assinatura no PDF | Não | Sim |
| Layouts extras | Não | Sim |
| QR Code Pix e link de aprovação | Não | Sim |
| Recibo, ordem de serviço e garantia | Não | Sim |
| Painel e relatórios | Não | Sim |

**Preço sugerido:** R$ 14,90 por mês ou R$ 99 por ano.

**Venda sem servidor próprio:**
1. O pagamento é feito na Kiwify ou no Mercado Pago, que só cobram taxa por venda.
2. O webhook da venda chega a um Cloudflare Worker, que é gratuito até 100 mil requisições por dia.
3. O Worker gera uma chave de licença assinada digitalmente e envia por e-mail pelo plano gratuito do Resend.
4. O app valida a assinatura da chave offline, sem consultar servidor.

A marca d'água no PDF da versão grátis funciona como divulgação: cada cliente que recebe um orçamento vê o nome do app.

## 4. Aquisição de usuários

- **Páginas de SEO por profissão**, como "modelo de orçamento para eletricista" e "orçamento de pintura por m²". São buscas frequentes no Google. Cada página traz exemplo pronto e botão para abrir o app já com o modelo certo.
- **Marca d'água viral** nos PDFs da versão grátis.
- **Vídeos curtos** no TikTok, Reels e Shorts mostrando um orçamento feito em 60 segundos.
- **Grupos de Facebook e WhatsApp** de profissionais, sem spam, com ajuda genuína.

## 5. Arquitetura técnica

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Vite, React e TypeScript | Rápido, tipado e com ecossistema grande |
| Estilo | Tailwind CSS | Interface mobile rápida de construir |
| Login | Firebase Authentication | Google e e-mail com senha, grátis |
| Dados | Cloud Firestore com cache offline | Sincroniza entre aparelhos e funciona sem internet |
| PDF | @react-pdf/renderer | Layout em componentes, gerado no aparelho |
| Validação | Zod | Protege importação de backup e links |
| Link sem servidor | lz-string | Comprime o orçamento dentro do link |
| QR Code Pix | Geração do BR Code no próprio app e biblioteca qrcode | Sem API e sem custo |
| Offline e instalação | vite-plugin-pwa | App instalável e offline |
| Hospedagem | Firebase Hosting | Gratuita, com CDN e HTTPS |
| Testes | Vitest e Playwright | Cálculos e fluxo principal cobertos |

### Regras técnicas importantes
- Valores em dinheiro são guardados em **centavos inteiros**, nunca em número decimal, para evitar erro de arredondamento.
- Todo cálculo fica em funções puras testadas, separadas da interface.
- O esquema de dados tem versão, para permitir migração sem perder dados do usuário.
- Imagens, como o logo, são comprimidas e guardadas no próprio documento do Firestore. O Cloud Storage exige o plano pago Blaze e fica fora do MVP.

### Modelo de dados

```
Perfil        { nome, documento, telefone, email, endereco, logo, pix, assinatura, textosPadrao }
Cliente       { id, nome, telefone, endereco, criadoEm }
ItemCatalogo  { id, descricao, unidade, precoCentavos, tipo: "servico" | "material", profissao }
Modelo        { id, profissao, nome, secoes[], itensSugeridos[], camposExtras[], textos }
Orcamento     { id, numero, clienteId, modeloId, secoes[], descontos, acrescimos,
                condicoesPagamento, prazoExecucao, validadeDias, fotos[], observacoes,
                status, criadoEm, enviadoEm, respondidoEm }
ItemOrcamento { descricao, quantidade, unidade, precoUnitarioCentavos, tipo }
Documento     { id, orcamentoId, tipo: "recibo" | "ordem" | "garantia", numero, criadoEm }
Licenca       { chave, plano, validaAte }
```

### Estrutura de pastas

```
src/
  app/            rotas e layout
  features/
    perfil/
    clientes/
    catalogo/
    modelos/      modelos por profissão em arquivos de dados
    orcamentos/   editor, lista, status
    documentos/   recibo, ordem de serviço, garantia
    pdf/          layouts do PDF
    compartilhar/ WhatsApp, link comprimido
    pix/          geração do BR Code
    licenca/      validação da chave Pro
  domain/         cálculos puros e tipos
  db/             Dexie, esquema e migrações
  ui/             componentes visuais reutilizáveis
public/
  landing/        páginas de SEO por profissão
```

## 6. Fases de desenvolvimento

### Fase 1: MVP (2 a 3 semanas)
- Perfil do profissional.
- Cinco modelos: eletricista, encanador, pintor, pedreiro e diarista.
- Editor de orçamento com itens, desconto e condições de pagamento.
- PDF com um layout e marca d'água.
- Envio pelo WhatsApp.
- Armazenamento local e app instalável offline.

**Meta:** 20 profissionais reais usando e dando opinião.

### Fase 2: Produto completo (3 a 4 semanas)
- Cadastro de clientes e catálogo de itens.
- Status, numeração e painel.
- Link de aprovação e QR Code Pix.
- Recibo, ordem de serviço e termo de garantia.
- Todos os 12 modelos e calculadoras de área.
- Backup em arquivo.

### Fase 3: Monetização (1 a 2 semanas)
- Plano Pro com chave de licença.
- Worker de venda, e-mail da chave e bloqueio dos recursos Pro.
- Logo, assinatura e layouts extras.

### Fase 4: Crescimento (contínuo)
- Páginas de SEO por profissão e cidade.
- Conteúdo em vídeo curto.
- Ajustes guiados pelo uso real.

### Fase 5: Opcional, quando houver receita
- Conta para equipes pequenas com mais de um profissional.

## 7. Métricas

- Orçamentos criados por usuário por semana.
- Percentual de orçamentos enviados pelo WhatsApp.
- Taxa de aprovação dos orçamentos, que mostra se o app ajuda a fechar serviço.
- Conversão de grátis para Pro. A meta inicial é de 2% a 4%.
- Visitas orgânicas nas páginas de SEO.

Para medir sem custo e sem cookies, usar o Cloudflare Web Analytics.

## 8. Riscos e respostas

| Risco | Resposta |
|---|---|
| Passar do limite gratuito do Firestore | O plano Spark cobre 50 mil leituras por dia, suficiente para centenas de usuários ativos. Monitorar no console |
| PDF lento ou quebrado em celulares simples | Testar em aparelhos Android baratos desde o MVP |
| Compartilhar arquivo no WhatsApp falha no iPhone | Oferecer download do PDF e link como alternativa |
| Link comprimido longo demais com muitos itens | Limitar fotos no link e avisar quando passar do tamanho |
| Baixa disposição a pagar | Plano anual barato e recursos Pro que ajudam a fechar serviço |
| Concorrentes gratuitos | Foco em modelos por profissão, rapidez e visual profissional |

## 9. Andamento

- **Fase 1: concluída.** Login, 5 modelos, editor, PDF e envio pelo WhatsApp.
- **Fase 2: concluída.** Clientes, catálogo, QR Code Pix, link de aprovação, recibo, ordem de serviço, termo de garantia, 12 modelos e exportação de dados.
- **Fase 3: próxima.** Plano Pro, logo e assinatura no PDF e remoção da marca d'água.

## 10. Próximos passos (versão original)

1. Criar o projeto com Vite, React, TypeScript e Tailwind.
2. Implementar os cálculos em centavos com testes.
3. Montar o editor de orçamento e o primeiro modelo, de eletricista.
4. Gerar o PDF e testar o envio pelo WhatsApp num celular real.
5. Publicar no Cloudflare Pages e entregar para os primeiros profissionais.
