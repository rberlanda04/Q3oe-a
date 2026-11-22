import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { dataValidade, subtotalItem } from '../../domain/calc'
import {
  formInicial,
  itemVazio,
  itensPreenchidos,
  linkCadastroGerador,
  temConteudo,
  orcamentoDoGerador,
  perfilDoGerador,
  totaisDoGerador,
  trocarProfissao,
  type FormGerador,
} from '../../domain/gerador'
import { formatarBRL, formatarQuantidade } from '../../domain/money'
import { contarEtapa } from '../../lib/origem'
import { guardarRascunho } from '../../lib/rascunhoGerador'
import { MODELOS, modeloPorId, UNIDADES_PADRAO } from '../../domain/templates'
import type { ItemOrcamento, ProfissaoId } from '../../domain/types'
import { caminhoProfissao, PERGUNTAS_GERADOR } from '../../seo/paginas'
import { PROFISSOES_SEO } from '../../seo/profissoes'
import { CampoDinheiro } from '../../ui/CampoDinheiro'
import { CampoNumero } from '../../ui/CampoNumero'
import { IconeCheck, IconeDocumento, IconeLixeira, IconeMais, IconeSeta } from '../../ui/Icones'
import { Migalhas } from './Modelos'
import { CabecalhoSite, RodapeSite, useTitulo } from './Moldura'

const PROFISSAO_PADRAO: ProfissaoId = 'eletricista'
const dataBR = (ms: number) => new Date(ms).toLocaleDateString('pt-BR')
const ABERTA_EM = Date.now()
const semAssinatura = () => () => {}
function lerProfissaoDaUrl(): ProfissaoId | null {
  const pedida = new URLSearchParams(window.location.search).get('profissao')
  return MODELOS.find((m) => m.id === pedida)?.id ?? null
}

/**
 * Gerador de orçamento sem cadastro: /gerador-de-orcamento
 * Tudo fica no estado da página (nada vai para o Firestore). O primeiro desenho é igual no
 * servidor e no navegador (sem data nem parâmetros da URL), para a hidratação reaproveitar o HTML.
 */
export function GeradorOrcamento() {
  useTitulo('Gerador de orçamento grátis e sem cadastro · Q3 Orça')
  // Data de hoje e profissão vinda de um link (?profissao=pintor) só existem no navegador:
  // na hidratação vale o mesmo desenho do servidor, e logo em seguida entram os valores reais.
  const agora = useSyncExternalStore(semAssinatura, () => ABERTA_EM, () => 0)
  const profissaoDaUrl = useSyncExternalStore(semAssinatura, lerProfissaoDaUrl, () => null)
  const [editado, setEditado] = useState<FormGerador | null>(null)
  const form = editado ?? formInicial(profissaoDaUrl ?? PROFISSAO_PADRAO)
  const setForm = (mudanca: (f: FormGerador) => FormGerador) => setEditado((f) => mudanca(f ?? form))
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState('')
  const proximoId = useRef(100)
  useEffect(() => contarEtapa('gerador'), [])

  const modelo = modeloPorId(form.profissao)
  const totais = totaisDoGerador(form)
  const unidades = [...new Set([...modelo.unidades, ...UNIDADES_PADRAO])]
  const sugestoes = modelo.itens.filter((s) => !form.itens.some((i) => i.descricao === s.descricao)).slice(0, 6)
  const comConteudo = temConteudo(form)
  const chamada = linkCadastroGerador(form.profissao, comConteudo)

  const mudar = <K extends keyof FormGerador>(campo: K, valor: FormGerador[K]) => setForm((f) => ({ ...f, [campo]: valor }))
  const mudarItem = (id: string, parcial: Partial<ItemOrcamento>) =>
    setForm((f) => ({ ...f, itens: f.itens.map((i) => (i.id === id ? { ...i, ...parcial } : i)) }))
  const novoId = () => `n${++proximoId.current}`
  const adicionar = (parcial: Partial<ItemOrcamento> = {}) => setForm((f) => ({ ...f, itens: [...f.itens, { ...itemVazio(novoId()), ...parcial }] }))
  const remover = (id: string) => setForm((f) => ({ ...f, itens: f.itens.filter((i) => i.id !== id) }))

  async function baixarPdf() {
    setErro('')
    setGerando(true)
    try {
      const { gerarPdfOrcamento } = await import('../../pdf/compartilhar')
      const arquivo = await gerarPdfOrcamento(orcamentoDoGerador(form, Date.now()), perfilDoGerador(form))
      const url = URL.createObjectURL(arquivo)
      const a = document.createElement('a')
      a.href = url
      a.download = arquivo.name
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
      contarEtapa('pdf')
    } catch {
      setErro('Não deu para gerar o PDF agora. Use "Imprimir" e escolha "Salvar como PDF".')
    } finally {
      setGerando(false)
    }
  }

  return (
    <div className="print:bg-white print:[&>footer]:hidden print:[&>header]:hidden">
      <CabecalhoSite />
      <main>
        <section className="mx-auto max-w-6xl px-5 pt-12 pb-10 print:hidden">
          <Migalhas itens={[['Início', '/'], ['Gerador de orçamento', '']]} />
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-extrabold sm:text-5xl">
            Gerador de orçamento <span className="text-brasa-600">grátis e sem cadastro</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-grafite-600">
            Escolha a sua profissão, preencha o cliente, os serviços e os valores, e baixe o orçamento em PDF. Fácil e rápido, direto no celular.
            Nada fica salvo: o que você digita não sai do seu navegador.
          </p>
        </section>

        <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start print:block print:p-0">
          <form className="grid gap-5 print:hidden" onSubmit={(e) => e.preventDefault()} aria-label="Dados do orçamento">
            <Bloco numero={1} titulo="Sua profissão">
              <label htmlFor="g-profissao" className="sr-only">
                Profissão
              </label>
              <select id="g-profissao" value={form.profissao} onChange={(e) => setForm((f) => trocarProfissao(f, e.target.value as ProfissaoId))}>
                {MODELOS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.icone} {m.nome}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-grafite-500">Os serviços mais pedidos da profissão já entram na lista. É só colocar os seus preços.</p>
            </Bloco>

            <Bloco numero={2} titulo="Seus dados">
              <div className="grid gap-3 sm:grid-cols-2">
                <Texto id="g-nome" rotulo="Seu nome ou da empresa" valor={form.profissional.nome} onChange={(v) => mudar('profissional', { ...form.profissional, nome: v })} className="sm:col-span-2" />
                <Texto id="g-tel" rotulo="Telefone ou WhatsApp" valor={form.profissional.telefone} onChange={(v) => mudar('profissional', { ...form.profissional, telefone: v })} tipo="tel" />
                <Texto id="g-cidade" rotulo="Cidade" valor={form.profissional.cidade} onChange={(v) => mudar('profissional', { ...form.profissional, cidade: v })} />
              </div>
            </Bloco>

            <Bloco numero={3} titulo="Cliente">
              <div className="grid gap-3 sm:grid-cols-2">
                <Texto id="g-cliente" rotulo="Nome do cliente" valor={form.cliente.nome} onChange={(v) => mudar('cliente', { ...form.cliente, nome: v })} />
                <Texto id="g-cliente-tel" rotulo="Telefone" valor={form.cliente.telefone} onChange={(v) => mudar('cliente', { ...form.cliente, telefone: v })} tipo="tel" />
                <Texto id="g-cliente-end" rotulo="Endereço do serviço" valor={form.cliente.endereco} onChange={(v) => mudar('cliente', { ...form.cliente, endereco: v })} className="sm:col-span-2" />
              </div>
            </Bloco>

            <Bloco numero={4} titulo="Serviços e materiais">
              <ul className="grid gap-4">
                {form.itens.map((item, i) => (
                  <li key={item.id} className="grid grid-cols-6 gap-2 rounded-xl border border-areia-200 bg-areia-50 p-3">
                    <div className="col-span-6">
                      <label htmlFor={`g-desc-${item.id}`} className="sr-only">
                        Descrição do item {i + 1}
                      </label>
                      <input id={`g-desc-${item.id}`} placeholder="Descrição do serviço ou material" value={item.descricao} onChange={(e) => mudarItem(item.id, { descricao: e.target.value })} />
                    </div>
                    <div className="col-span-2">
                      <CampoNumero aria-label={`Quantidade do item ${i + 1}`} valor={item.quantidade} onChange={(v) => mudarItem(item.id, { quantidade: v })} />
                    </div>
                    <div className="col-span-2">
                      <select aria-label={`Unidade do item ${i + 1}`} value={item.unidade} onChange={(e) => mudarItem(item.id, { unidade: e.target.value })}>
                        {(unidades.includes(item.unidade) ? unidades : [item.unidade, ...unidades]).map((u) => (
                          <option key={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <select aria-label={`Tipo do item ${i + 1}`} value={item.tipo} onChange={(e) => mudarItem(item.id, { tipo: e.target.value as ItemOrcamento['tipo'] })}>
                        <option value="servico">Serviço</option>
                        <option value="material">Material</option>
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label htmlFor={`g-preco-${item.id}`} className="sr-only">
                        Valor unitário do item {i + 1}
                      </label>
                      <CampoDinheiro id={`g-preco-${item.id}`} valor={item.precoUnitarioCentavos} onChange={(v) => mudarItem(item.id, { precoUnitarioCentavos: v })} />
                    </div>
                    <button
                      type="button"
                      onClick={() => remover(item.id)}
                      className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-grafite-500 hover:bg-white hover:text-alerta-600"
                      aria-label={`Remover o item ${i + 1}`}
                    >
                      <IconeLixeira tamanho={18} /> Remover
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => adicionar()} className="btn-secondary mt-4 w-full">
                <IconeMais tamanho={18} /> Adicionar item
              </button>
              {sugestoes.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-grafite-700">Sugestões para {modelo.nome.toLowerCase()}</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {sugestoes.map((s) => (
                      <li key={s.descricao}>
                        <button type="button" className="chip" onClick={() => adicionar({ descricao: s.descricao, unidade: s.unidade, tipo: s.tipo })}>
                          + {s.descricao}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Bloco>

            <Bloco numero={5} titulo="Desconto e condições">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="g-desc-tipo">Desconto</label>
                  <select
                    id="g-desc-tipo"
                    value={form.desconto.tipo}
                    onChange={(e) => mudar('desconto', { tipo: e.target.value as FormGerador['desconto']['tipo'], valor: 0 })}
                  >
                    <option value="percentual">Em porcentagem (%)</option>
                    <option value="valor">Em reais (R$)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="g-desc-valor">{form.desconto.tipo === 'percentual' ? 'Porcentagem' : 'Valor do desconto'}</label>
                  {form.desconto.tipo === 'percentual' ? (
                    <CampoNumero id="g-desc-valor" maximo={100} valor={form.desconto.valor} onChange={(v) => mudar('desconto', { tipo: 'percentual', valor: v })} />
                  ) : (
                    <CampoDinheiro id="g-desc-valor" valor={form.desconto.valor} onChange={(v) => mudar('desconto', { tipo: 'valor', valor: v })} />
                  )}
                </div>
                <Texto id="g-pagamento" rotulo="Condições de pagamento" valor={form.condicoesPagamento} onChange={(v) => mudar('condicoesPagamento', v)} className="sm:col-span-2" />
                <Texto id="g-prazo" rotulo="Prazo de execução" valor={form.prazoExecucao} onChange={(v) => mudar('prazoExecucao', v)} />
                <div>
                  <label htmlFor="g-validade">Validade do orçamento (dias)</label>
                  <CampoNumero id="g-validade" maximo={365} valor={form.validadeDias} onChange={(v) => mudar('validadeDias', Math.round(v))} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="g-garantia">Garantia</label>
                  <textarea id="g-garantia" rows={2} value={form.garantia} onChange={(e) => mudar('garantia', e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="g-obs">Observações</label>
                  <textarea id="g-obs" rows={2} placeholder="Opcional" value={form.observacoes} onChange={(e) => mudar('observacoes', e.target.value)} />
                </div>
              </div>
            </Bloco>
          </form>

          <div className="grid gap-4 lg:sticky lg:top-20 print:static print:block">
            <p className="rotulo print:hidden">Prévia do orçamento</p>
            <Folha form={form} agora={agora} />
            <div className="grid gap-2 sm:grid-cols-2 print:hidden">
              <button type="button" className="btn-primary" onClick={baixarPdf} disabled={gerando || totais.subtotal === 0}>
                <IconeDocumento tamanho={18} /> {gerando ? 'Gerando o PDF…' : 'Baixar PDF'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => window.print()} disabled={totais.subtotal === 0}>
                Imprimir
              </button>
            </div>
            <p className="min-h-5 text-sm text-grafite-500 print:hidden" aria-live="polite">
              {erro || (totais.subtotal === 0 ? 'Coloque o valor de pelo menos um item para baixar.' : 'Para salvar pelo "Imprimir", escolha "Salvar como PDF".')}
            </p>
            <div className="rounded-cartao bg-grafite-900 p-6 text-white print:hidden">
              <p className="font-display text-xl font-bold">Crie sua conta grátis para enviar por link, acompanhar a aprovação e salvar o histórico</p>
              <ul className="mt-4 grid gap-2 text-sm text-grafite-300">
                {['O cliente aprova pelo link do WhatsApp', 'QR Code Pix, recibo e garantia no mesmo orçamento', 'Clientes e preços salvos para a próxima vez'].map((t) => (
                  <li key={t} className="flex gap-2">
                    <IconeCheck tamanho={18} strokeWidth={3} className="shrink-0 text-aprovado-500" /> {t}
                  </li>
                ))}
              </ul>
              <Link
                to={chamada}
                onClick={() => {
                  contarEtapa('clique-cadastro')
                  if (comConteudo) guardarRascunho(form)
                }}
                className="btn-primary mt-5 w-full"
              >
                {comConteudo ? 'Salvar este orçamento na conta grátis' : 'Criar conta grátis'} <IconeSeta tamanho={18} />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white py-16 print:hidden">
          <div className="mx-auto grid max-w-3xl gap-4 px-5 text-grafite-700">
            <h2 className="text-3xl font-extrabold text-grafite-900">Como fazer um orçamento fácil e rápido</h2>
            <p>
              Um bom orçamento responde três perguntas do cliente: o que vai ser feito, quanto custa e em quanto tempo. Liste cada serviço numa
              linha, com a quantidade e a unidade (metro quadrado, ponto, diária), e separe o material da mão de obra. Assim o cliente entende o
              preço e você evita discussão depois.
            </p>
            <p>
              Deixe claros o prazo, a forma de pagamento, a garantia e até quando o preço vale. Se for dar desconto, mostre o valor cheio e o
              desconto separados: o cliente enxerga a vantagem e o total fica certo.
            </p>
            <p>
              O gerador faz as contas para você e entrega um PDF pronto para mandar no WhatsApp ou imprimir. Quando quiser parar de refazer tudo a
              cada cliente, crie a conta grátis no Q3 Orça: seus preços, clientes e orçamentos ficam salvos.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16 print:hidden">
          <h2 className="text-3xl font-extrabold">Perguntas frequentes</h2>
          <div className="mt-6 space-y-3">
            {PERGUNTAS_GERADOR.map(([p, r]) => (
              <details key={p} className="group card !p-0 [&_summary::-webkit-details-marker]:hidden" open>
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 font-semibold">
                  {p}
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-areia-200 transition group-open:rotate-45">+</span>
                </summary>
                <p className="px-6 pb-5 text-grafite-600">{r}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 pb-20 print:hidden">
          <h2 className="text-xl font-bold">Modelos de orçamento por profissão</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {PROFISSOES_SEO.slice(0, 10).map((p) => (
              <li key={p.slug}>
                <Link to={caminhoProfissao(p)} className="chip">
                  {modeloPorId(p.id).icone} Orçamento para {p.para}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/modelos-de-orcamento" className="chip">
                Ver todos
              </Link>
            </li>
            <li>
              <Link to="/calculadoras" className="chip">
                Calculadoras grátis
              </Link>
            </li>
          </ul>
        </section>
      </main>
      <RodapeSite />
    </div>
  )
}

/** A folha do orçamento: aparece como prévia na tela e é a única parte que sai na impressão. */
function Folha({ form, agora }: { form: FormGerador; agora: number }) {
  const itens = itensPreenchidos(form.itens)
  const totais = totaisDoGerador(form)
  const temMaterial = totais.materiais > 0 && totais.servicos > 0
  const contato = [form.profissional.telefone, form.profissional.cidade].filter(Boolean).join(' · ')
  const secoes: [string, string][] = [
    ['Condições de pagamento', form.condicoesPagamento],
    ['Prazo de execução', form.prazoExecucao],
    ['Garantia', form.garantia],
    ['Observações', form.observacoes],
  ]
  return (
    <article
      className="rounded-cartao border border-areia-200 bg-white p-6 text-sm shadow-flutuante print:rounded-none print:border-0 print:p-0 print:shadow-none"
      aria-label="Prévia do orçamento"
    >
      <header className="flex items-start justify-between gap-4 border-b-[3px] border-brasa-500 pb-3">
        <div className="min-w-0">
          <p className="truncate text-base font-bold">{form.profissional.nome.trim() || <Exemplo>Seu nome aqui</Exemplo>}</p>
          <p className="text-xs text-grafite-500">{contato || <Exemplo>Telefone · Cidade</Exemplo>}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-lg font-extrabold text-brasa-700">ORÇAMENTO</p>
          {/* A data só existe no navegador; o espaço da linha fica reservado para nada pular. */}
          <p className="text-xs text-grafite-500">{agora ? `Emitido em ${dataBR(agora)}` : ' '}</p>
          <p className="text-xs text-grafite-500">{agora && form.validadeDias > 0 ? `Válido até ${dataBR(dataValidade(agora, form.validadeDias).getTime())}` : ' '}</p>
        </div>
      </header>

      <div className="mt-4">
        <p className="rotulo">Cliente</p>
        <p className="font-semibold">{form.cliente.nome.trim() || <Exemplo>Nome do cliente</Exemplo>}</p>
        {(form.cliente.telefone.trim() || form.cliente.endereco.trim()) && (
          <p className="text-xs text-grafite-500">{[form.cliente.telefone.trim(), form.cliente.endereco.trim()].filter(Boolean).join(' · ')}</p>
        )}
      </div>

      <table className="mt-4 w-full">
        <thead>
          <tr className="bg-brasa-50 text-left text-xs">
            <th className="px-2 py-1.5 font-semibold">Descrição</th>
            <th className="px-2 py-1.5 text-right font-semibold">Qtd.</th>
            <th className="px-2 py-1.5 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {itens.length === 0 && (
            <tr>
              <td colSpan={3} className="px-2 py-3 text-center text-grafite-500">
                Coloque o valor dos itens para eles aparecerem aqui.
              </td>
            </tr>
          )}
          {itens.map((item) => (
            <tr key={item.id} className="border-b border-areia-200 align-top">
              <td className="px-2 py-2">
                {item.descricao || '-'}
                {temMaterial && item.tipo === 'material' && <span className="ml-1 text-xs text-grafite-500">(material)</span>}
                <span className="block text-xs text-grafite-500">{formatarBRL(item.precoUnitarioCentavos)} por {item.unidade}</span>
              </td>
              <td className="px-2 py-2 text-right whitespace-nowrap tabular-nums">
                {formatarQuantidade(item.quantidade)} {item.unidade}
              </td>
              <td className="px-2 py-2 text-right whitespace-nowrap tabular-nums">{formatarBRL(subtotalItem(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-3 ml-auto grid max-w-64 gap-1 tabular-nums">
        {temMaterial && (
          <>
            <LinhaTotal rotulo="Mão de obra" valor={formatarBRL(totais.servicos)} />
            <LinhaTotal rotulo="Materiais" valor={formatarBRL(totais.materiais)} />
          </>
        )}
        <LinhaTotal rotulo="Subtotal" valor={formatarBRL(totais.subtotal)} />
        {totais.desconto > 0 && <LinhaTotal rotulo="Desconto" valor={`- ${formatarBRL(totais.desconto)}`} />}
        <div className="mt-1 flex justify-between border-t-2 border-brasa-500 pt-2 text-base font-bold">
          <dt>TOTAL</dt>
          <dd>{formatarBRL(totais.total)}</dd>
        </div>
      </dl>

      {secoes
        .filter(([, texto]) => texto.trim())
        .map(([titulo, texto]) => (
          <div key={titulo} className="mt-4">
            <p className="rotulo">{titulo}</p>
            <p className="whitespace-pre-line text-grafite-700">{texto.trim()}</p>
          </div>
        ))}

      <div className="mt-10 grid grid-cols-2 gap-6 text-center text-xs text-grafite-500">
        <p className="border-t border-grafite-400 pt-1">{form.profissional.nome.trim() || 'Prestador'}</p>
        <p className="border-t border-grafite-400 pt-1">{form.cliente.nome.trim() || 'Cliente'}</p>
      </div>
      <p className="mt-6 hidden text-center text-[10px] text-grafite-400 print:block">Feito com Q3 Orça · www.q3orca.com.br</p>
    </article>
  )
}

/** Texto de exemplo na prévia: some na impressão, sem mudar o tamanho da folha. */
function Exemplo({ children }: { children: ReactNode }) {
  return <span className="text-grafite-400 print:invisible">{children}</span>
}

function LinhaTotal({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-grafite-500">{rotulo}</dt>
      <dd>{valor}</dd>
    </div>
  )
}

function Bloco({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) {
  return (
    <section className="card !p-6" aria-labelledby={`bloco-${numero}`}>
      <h2 id={`bloco-${numero}`} className="mb-4 flex items-center gap-3 text-xl font-bold">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brasa-50 text-sm font-extrabold text-brasa-700" aria-hidden>
          {numero}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function Texto(props: { id: string; rotulo: string; valor: string; onChange: (v: string) => void; tipo?: string; className?: string }) {
  return (
    <div className={props.className}>
      <label htmlFor={props.id}>{props.rotulo}</label>
      <input id={props.id} type={props.tipo ?? 'text'} value={props.valor} onChange={(e) => props.onChange(e.target.value)} autoComplete="off" />
    </div>
  )
}
