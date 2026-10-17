import { useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { calcularPintura, calcularPiso, calcularValorHora } from '../../domain/calculadoras'
import { formatarBRL } from '../../domain/money'
import { caminhoCalculadora, calculadoraPorSlug, CALCULADORAS, type ConteudoCalculadora } from '../../seo/calculadoras'
import { IconeSeta } from '../../ui/Icones'
import { Migalhas } from './Modelos'
import { CabecalhoSite, RodapeSite, useTitulo } from './Moldura'

const reais = (valor: number) => formatarBRL(Math.round(valor * 100))
const numero = (valor: number, casas = 1) => valor.toLocaleString('pt-BR', { maximumFractionDigits: casas })

/** Índice: /calculadoras */
export function CalculadorasIndice() {
  useTitulo('Calculadoras grátis para prestadores de serviço · Q3 Orça')
  return (
    <div>
      <CabecalhoSite />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <Migalhas itens={[['Início', '/'], ['Calculadoras', '']]} />
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold sm:text-5xl">Calculadoras grátis para quem presta serviço</h1>
        <p className="mt-4 max-w-2xl text-lg text-grafite-600">
          Faça a conta do material e do seu preço antes de mandar o orçamento. Sem cadastro, direto no celular.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CALCULADORAS.map((c) => (
            <li key={c.slug}>
              <Link to={caminhoCalculadora(c)} className="card group flex h-full flex-col gap-3 !p-6 transition hover:-translate-y-0.5 hover:border-brasa-300">
                <h2 className="text-xl font-bold">{c.h1}</h2>
                <p className="flex-1 text-sm text-grafite-600">{c.descricao}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brasa-700">
                  Calcular <IconeSeta tamanho={16} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <section className="mt-14 grid max-w-3xl gap-4 text-grafite-700">
          <h2 className="text-2xl font-extrabold text-grafite-900">Por que fazer a conta antes de passar o preço</h2>
          <p>
            Quem presta serviço costuma perder dinheiro em dois lugares: no material que faltou e no tempo que não entrou no preço. Faltou uma
            lata de tinta ou uma caixa de piso, a volta à loja sai do seu bolso. Esqueceu o deslocamento e a visita para orçar, você trabalhou de
            graça nessas horas.
          </p>
          <p>
            As calculadoras resolvem as duas coisas. As de pintura e de piso dizem quanto material comprar, já com perda e demãos. A do valor da
            hora mostra o mínimo que você precisa cobrar para tirar a renda que quer, depois de pagar transporte, ferramentas, MEI e INSS.
          </p>
          <p>
            Com o número na mão, monte o orçamento no Q3 Orça: o material entra separado da mão de obra, o cliente aprova pelo link do WhatsApp e
            paga no Pix do próprio documento.
          </p>
        </section>
      </main>
      <RodapeSite />
    </div>
  )
}

/** Página de uma calculadora: /calculadora/:slug */
export function CalculadoraPagina() {
  const { slug } = useParams()
  const conteudo = calculadoraPorSlug(slug)
  useTitulo(conteudo ? `${conteudo.titulo} · Q3 Orça` : 'Q3 Orça')
  if (!conteudo) return <Navigate to="/calculadoras" replace />
  const chamada = `/entrar?modo=criar&modelo=${conteudo.modelo}`
  const outras = CALCULADORAS.filter((c) => c.slug !== conteudo.slug)

  return (
    <div>
      <CabecalhoSite />
      <main>
        <section className="mx-auto max-w-6xl px-5 pt-12 pb-16">
          <Migalhas itens={[['Início', '/'], ['Calculadoras', '/calculadoras'], [conteudo.h1.split(':')[0], '']]} />
          <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-extrabold sm:text-5xl">{conteudo.h1}</h1>
          <p className="mt-5 max-w-2xl text-lg text-grafite-600">{conteudo.intro}</p>
          <div className="mt-10">
            {conteudo.slug === 'pintura' && <Pintura chamada={chamada} />}
            {conteudo.slug === 'piso' && <Piso chamada={chamada} />}
            {conteudo.slug === 'valor-da-hora' && <ValorHora chamada={chamada} />}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16">
          <h2 className="text-3xl font-extrabold">Perguntas frequentes</h2>
          <div className="mt-6 space-y-3">
            {conteudo.perguntas.map(([p, r]) => (
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

        <section className="mx-auto max-w-6xl px-5 pb-20">
          <h2 className="text-xl font-bold">Outras calculadoras</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {outras.map((c: ConteudoCalculadora) => (
              <li key={c.slug}>
                <Link to={caminhoCalculadora(c)} className="chip">
                  {c.h1.split(':')[0]}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/modelos-de-orcamento" className="chip">
                Modelos de orçamento
              </Link>
            </li>
            <li>
              <Link to="/gerador-de-orcamento" className="chip">
                Gerador de orçamento
              </Link>
            </li>
          </ul>
        </section>
      </main>
      <RodapeSite />
    </div>
  )
}

/* ---------- Peças do formulário ---------- */

function Campo(props: { id: string; rotulo: string; dica?: string; valor: number; onChange: (v: number) => void; passo?: number; sufixo?: string }) {
  return (
    <label htmlFor={props.id} className="block">
      <span className="text-sm font-semibold text-grafite-700">{props.rotulo}</span>
      <span className="relative mt-1 block">
        <input
          id={props.id}
          type="number"
          inputMode="decimal"
          min={0}
          step={props.passo ?? 1}
          value={Number.isFinite(props.valor) ? props.valor : ''}
          onChange={(e) => props.onChange(e.target.value === '' ? Number.NaN : Number(e.target.value))}
          className={props.sufixo ? '!pr-14' : ''}
        />
        {props.sufixo && <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-grafite-500">{props.sufixo}</span>}
      </span>
      {props.dica && <span className="mt-1 block text-xs text-grafite-500">{props.dica}</span>}
    </label>
  )
}

function Layout({ campos, resultados, chamada, frase }: { campos: ReactNode; resultados: [string, string][]; chamada: string; frase: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <form className="card grid gap-4 !p-6 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()} aria-label="Dados para o cálculo">
        {campos}
      </form>
      <div className="rounded-cartao bg-grafite-900 p-6 text-white" aria-live="polite">
        <p className="text-sm font-semibold text-grafite-300">Resultado</p>
        <dl className="mt-3 divide-y divide-white/10">
          {resultados.map(([rotulo, valor]) => (
            <div key={rotulo} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-grafite-300">{rotulo}</dt>
              <dd className="font-display text-2xl font-bold tabular-nums">{valor}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-grafite-300">{frase}</p>
        <Link to={chamada} className="btn-primary mt-5 w-full">
          Montar o orçamento grátis <IconeSeta tamanho={18} />
        </Link>
      </div>
    </div>
  )
}

function Pintura({ chamada }: { chamada: string }) {
  const [e, setE] = useState({ area: 60, descontos: 6, demaos: 2, rendimento: 10, precoM2: 25 })
  const r = calcularPintura(e)
  const muda = (k: keyof typeof e) => (v: number) => setE({ ...e, [k]: v })
  return (
    <Layout
      chamada={chamada}
      frase="Com o Q3 Orça, a tinta vai como material e a pintura como mão de obra, e o cliente aprova pelo link."
      campos={
        <>
          <Campo id="area" rotulo="Área das paredes" sufixo="m²" valor={e.area} onChange={muda('area')} passo={0.5} dica="Perímetro do cômodo × pé-direito, ou largura × altura." />
          <Campo id="descontos" rotulo="Portas e janelas" sufixo="m²" valor={e.descontos} onChange={muda('descontos')} passo={0.1} dica="Porta comum: cerca de 1,6 m²." />
          <Campo id="demaos" rotulo="Demãos" valor={e.demaos} onChange={muda('demaos')} />
          <Campo id="rendimento" rotulo="Rendimento da tinta" sufixo="m²/L" valor={e.rendimento} onChange={muda('rendimento')} passo={0.5} dica="Por demão, informado na lata." />
          <Campo id="precoM2" rotulo="Seu preço por m²" sufixo="R$" valor={e.precoM2} onChange={muda('precoM2')} passo={0.5} />
        </>
      }
      resultados={[
        ['Área a pintar', `${numero(r.areaPintada)} m²`],
        ['Tinta', `${numero(r.litros)} L`],
        ['Latas de 18 L', String(r.latas18)],
        ['ou galões de 3,6 L', String(r.galoes36)],
        ['Mão de obra', reais(r.maoDeObra)],
      ]}
    />
  )
}

function Piso({ chamada }: { chamada: string }) {
  const [e, setE] = useState({ area: 20, perda: 10, m2PorCaixa: 2.16, largura: 60, comprimento: 60, espessuraMm: 8, juntaMm: 2, argamassaKgM2: 8, precoM2: 50 })
  const r = calcularPiso({ ...e, pecaCm: [e.largura, e.comprimento] })
  const muda = (k: keyof typeof e) => (v: number) => setE({ ...e, [k]: v })
  return (
    <Layout
      chamada={chamada}
      frase="No orçamento, coloque o assentamento por m² e o rodapé por metro: o modelo de pisos já vem assim."
      campos={
        <>
          <Campo id="area" rotulo="Área do piso" sufixo="m²" valor={e.area} onChange={muda('area')} passo={0.5} />
          <Campo id="perda" rotulo="Perda" sufixo="%" valor={e.perda} onChange={muda('perda')} dica="10% reto, 15% diagonal." />
          <Campo id="m2PorCaixa" rotulo="m² por caixa" sufixo="m²" valor={e.m2PorCaixa} onChange={muda('m2PorCaixa')} passo={0.01} dica="Vem na embalagem." />
          <Campo id="argamassa" rotulo="Argamassa por m²" sufixo="kg" valor={e.argamassaKgM2} onChange={muda('argamassaKgM2')} passo={0.5} dica="5 kg simples, 8 kg dupla colagem." />
          <Campo id="largura" rotulo="Largura da peça" sufixo="cm" valor={e.largura} onChange={muda('largura')} />
          <Campo id="comprimento" rotulo="Comprimento da peça" sufixo="cm" valor={e.comprimento} onChange={muda('comprimento')} />
          <Campo id="espessura" rotulo="Espessura da peça" sufixo="mm" valor={e.espessuraMm} onChange={muda('espessuraMm')} passo={0.5} />
          <Campo id="junta" rotulo="Largura da junta" sufixo="mm" valor={e.juntaMm} onChange={muda('juntaMm')} passo={0.5} />
          <Campo id="precoM2" rotulo="Seu preço por m²" sufixo="R$" valor={e.precoM2} onChange={muda('precoM2')} passo={0.5} />
        </>
      }
      resultados={[
        ['Área com perda', `${numero(r.areaComPerda)} m²`],
        ['Caixas de piso', String(r.caixas)],
        ['Sacos de argamassa (20 kg)', String(r.sacosArgamassa20kg)],
        ['Rejunte', `${numero(r.rejunteKg)} kg`],
        ['Mão de obra', reais(r.maoDeObra)],
      ]}
    />
  )
}

function ValorHora({ chamada }: { chamada: string }) {
  const [e, setE] = useState({ rendaDesejada: 4000, custosMensais: 900, diasPorSemana: 5, horasPorDia: 8, tempoNaoPago: 25 })
  const r = calcularValorHora(e)
  const muda = (k: keyof typeof e) => (v: number) => setE({ ...e, [k]: v })
  return (
    <Layout
      chamada={chamada}
      frase="Use esse valor como piso: estime as horas de cada serviço e monte o orçamento com o seu preço salvo."
      campos={
        <>
          <Campo id="renda" rotulo="Quanto quer tirar por mês" sufixo="R$" valor={e.rendaDesejada} onChange={muda('rendaDesejada')} passo={100} dica="Livre, depois de pagar os gastos." />
          <Campo id="custos" rotulo="Gastos do trabalho no mês" sufixo="R$" valor={e.custosMensais} onChange={muda('custosMensais')} passo={50} dica="Transporte, ferramentas, celular, MEI, INSS." />
          <Campo id="dias" rotulo="Dias de trabalho por semana" valor={e.diasPorSemana} onChange={muda('diasPorSemana')} />
          <Campo id="horas" rotulo="Horas por dia" valor={e.horasPorDia} onChange={muda('horasPorDia')} />
          <Campo id="naoPago" rotulo="Tempo que não é pago" sufixo="%" valor={e.tempoNaoPago} onChange={muda('tempoNaoPago')} dica="Orçamento, deslocamento, compras. 20% a 30% é comum." />
        </>
      }
      resultados={[
        ['Horas pagas no mês', `${r.horasPagasNoMes} h`],
        ['Valor mínimo da hora', reais(r.valorHora)],
        ['Valor da diária', reais(r.valorDiaria)],
      ]}
    />
  )
}
