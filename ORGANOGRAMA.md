# Organograma do Q3 Orça

O Rogério é o dono e o CEO: aprova o que vai ao ar, o que é publicado nas redes, o que custa dinheiro e o que fala com pessoas. Os agentes preparam, executam o que é técnico e medem. Eles ficam em `.claude/agents/` e são chamados pelo nome.

```
                    Rogério (CEO, aprova)
                            │
          Coordenador (Claude, sessão do portfólio)
                            │
                 gerente-q3orca (COO, GESTAO.md)
   ┌──────────────┬─────────┴────────┬─────────────────────┐
cto-q3orca     cfo-q3orca      marketing-q3orca     sucesso-cliente-q3orca
   │                            │           │
dev-q3orca              campanha-q3orca  conteudo-q3orca
                                            │
                          agente executor (Claude Desktop, Meta)
```

| Agente | Responde por | Decide | Não pode |
|---|---|---|---|
| `gerente-q3orca` | Andamento geral, `GESTAO.md`, prioridades entre as áreas | A ordem do trabalho da semana | Publicar, gastar |
| `cto-q3orca` | Arquitetura, qualidade, segurança, publicação | A fila técnica e se algo está pronto para ir ao ar | Publicar sem "pode publicar" |
| `dev-q3orca` | Código, testes e páginas | Como implementar | Push e deploy |
| `cfo-q3orca` | Receita, preços, custos, CNPJ e Pix, verba | Propostas de preço e verba (como experimento) | Pagar, assinar, ligar cobrança sozinho |
| `marketing-q3orca` | Crescimento: funis, experimentos, anúncios | O próximo experimento | Ativar anúncio sem OK |
| `campanha-q3orca` | Lançamento em Curitiba: metas, parceiros, painel da campanha | O foco da semana da campanha | Falar com parceiros (o Rogério fala) |
| `conteudo-q3orca` | Posts, Reels, Stories, textos de grupos e fila do executor | O calendário de conteúdo | Publicar ou agendar (só o executor, com OK) |
| `sucesso-cliente-q3orca` | Ativação, suporte, depoimentos, venda do Pro | Quem recebe mensagem e qual | Enviar mensagem (o Rogério envia) |
| Agente executor (Claude Desktop) | Agendar e publicar no Facebook e Instagram | Nada sozinho | Publicar sem o "ok" do Rogério no chat dele |

## Como o trabalho anda

1. **Número primeiro.** `npm run ops:campanha` e `npm run ops:metricas` mostram onde o funil perde gente. Todo agente começa por aí.
2. **Gargalo no site ou no app** → `cto-q3orca` põe na fila técnica → `dev-q3orca` implementa com teste → CTO revisa → Rogério diz "pode publicar".
3. **Gargalo em atrair gente** → `marketing-q3orca` escolhe o experimento → `conteudo-q3orca` produz e põe no `FILA.md` → Rogério dá o OK → executor agenda.
4. **Gente que entrou e parou** → `sucesso-cliente-q3orca` prepara as mensagens → Rogério envia pelo WhatsApp.
5. **Dinheiro** → `cfo-q3orca` acompanha o MRR, o fim dos testes grátis e o CNPJ, e diz quando e como cobrar.
6. O coordenador junta tudo na Central de Projetos e no painel Gestão de Campanhas.

## Regras que valem para todos

- Nada vai ao ar, é publicado, agendado ou pago sem o OK explícito do Rogério.
- Commits só locais; push e deploy só com "pode publicar".
- Segredos nunca no repositório nem no OneDrive (cofre `C:\Users\rberl\.secrets`).
- Dado pessoal de cliente não sai do PC.
- Nenhum agente marca tarefa do Rogério como feita nem aprova em nome dele.
