import { Link, Navigate, useParams } from 'react-router-dom'
import { modeloPorId } from '../../domain/templates'
import { caminhoProfissao } from '../../seo/paginas'
import { profissaoPorSlug, PROFISSOES_SEO } from '../../seo/profissoes'
import { IconeCheck, IconeSeta } from '../../ui/Icones'
import { CabecalhoSite, RodapeSite, useTitulo } from './Moldura'

/** Índice: /modelos-de-orcamento */
export function ModelosIndice() {
  useTitulo('Modelos de orçamento grátis por profissão · Q3 Orça')
  return (
    <div>
      <CabecalhoSite />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <Migalhas itens={[['Início', '/'], ['Modelos de orçamento', '']]} />
        <h1 className="mt-4 max-w-3xl text-4xl font-extrabold sm:text-5xl">Modelos de orçamento grátis para cada profissão</h1>
        <p className="mt-4 max-w-2xl text-lg text-grafite-600">
          Escolha sua profissão. O modelo já vem com os serviços mais pedidos, você coloca seus preços e envia pelo WhatsApp, com link de
          aprovação e QR Code Pix.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROFISSOES_SEO.map((p) => {
            const modelo = modeloPorId(p.id)
            return (
              <li key={p.slug}>
                <Link to={caminhoProfissao(p)} className="card group flex h-full flex-col gap-3 !p-6 transition hover:-translate-y-0.5 hover:border-brasa-300">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brasa-50 text-2xl" aria-hidden>
                    {modelo.icone}
                  </span>
                  <h2 className="text-xl font-bold">Orçamento para {p.para}</h2>
                  <p className="flex-1 text-sm text-grafite-600">{modelo.itens.slice(0, 4).map((i) => i.descricao).join(', ')} e mais.</p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brasa-700">
                    Ver modelo <IconeSeta tamanho={16} className="transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </main>
      <RodapeSite />
    </div>
  )
}

/** Página de uma profissão: /modelo-de-orcamento/:slug */
export function ModeloProfissao() {
  const { slug } = useParams()
  const conteudo = profissaoPorSlug(slug)
  useTitulo(conteudo ? `Modelo de orçamento para ${conteudo.para} grátis · Q3 Orça` : 'Q3 Orça')
  if (!conteudo) return <Navigate to="/modelos-de-orcamento" replace />
  const modelo = modeloPorId(conteudo.id)
  const chamada = `/entrar?modo=criar&modelo=${conteudo.id}`
  const outras = PROFISSOES_SEO.filter((p) => p.slug !== conteudo.slug).slice(0, 6)

  return (
    <div>
      <CabecalhoSite />
      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-5 pt-12 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Migalhas itens={[['Início', '/'], ['Modelos de orçamento', '/modelos-de-orcamento'], [`Para ${conteudo.para}`, '']]} />
            <h1 className="mt-4 text-4xl leading-tight font-extrabold sm:text-5xl">
              Modelo de orçamento para <span className="text-brasa-600">{conteudo.para}</span>
            </h1>
            <p className="mt-5 text-lg text-grafite-600">{conteudo.intro}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={chamada} className="btn-primary !px-7 !py-4 text-lg">
                Usar este modelo grátis <IconeSeta tamanho={20} />
              </Link>
            </div>
            <p className="mt-3 text-sm text-grafite-500">Sem cartão de crédito. Seu primeiro orçamento sai em 2 minutos.</p>
          </div>

          <figure className="rounded-cartao border border-areia-200 bg-white p-6 shadow-flutuante" aria-label="Exemplo de orçamento">
            <div className="flex items-start justify-between border-b-[3px] border-brasa-500 pb-3">
              <div>
                <p className="font-bold">Sua empresa aqui</p>
                <p className="text-xs text-grafite-500">(11) 90000-0000 · Sua cidade</p>
              </div>
              <p className="font-display text-lg font-extrabold text-brasa-700">ORÇAMENTO</p>
            </div>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="bg-brasa-50 text-left text-xs">
                  <th className="px-2 py-1.5 font-semibold">Serviço</th>
                  <th className="px-2 py-1.5 text-right font-semibold">Unidade</th>
                </tr>
              </thead>
              <tbody>
                {modelo.itens.slice(0, 7).map((item) => (
                  <tr key={item.descricao} className="border-b border-areia-200">
                    <td className="px-2 py-2">
                      {item.descricao}
                      {item.tipo === 'material' && <span className="ml-1 text-xs text-grafite-500">(material)</span>}
                    </td>
                    <td className="px-2 py-2 text-right text-grafite-500">{item.unidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <figcaption className="mt-3 text-xs text-grafite-500">
              Estes itens já vêm no modelo. Você define seus preços, e eles ficam salvos para os próximos orçamentos.
            </figcaption>
          </figure>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-extrabold">O que não pode faltar no orçamento</h2>
              <ul className="mt-6 space-y-4">
                {conteudo.dicas.map((d) => (
                  <li key={d} className="flex gap-3">
                    <IconeCheck tamanho={22} strokeWidth={3} className="mt-0.5 shrink-0 text-aprovado-600" />
                    <span className="text-grafite-700">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold">Tudo o que vem junto, de graça</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  'Envio pelo WhatsApp em PDF',
                  'Link para o cliente aprovar',
                  'QR Code Pix no orçamento',
                  'Recibo com valor por extenso',
                  'Termo de garantia pronto',
                  'Funciona sem internet',
                ].map((t) => (
                  <li key={t} className="rounded-xl bg-areia-100 px-4 py-3 text-sm font-semibold">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
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
          <div className="rounded-[2rem] bg-grafite-900 px-8 py-12 text-center text-white">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold sm:text-4xl">Faça seu orçamento de {conteudo.para} agora</h2>
            <Link to={chamada} className="btn-primary mt-6 !px-8 !py-4 text-lg">
              Começar grátis <IconeSeta tamanho={20} />
            </Link>
          </div>
          <h2 className="mt-14 text-xl font-bold">Modelos para outras profissões</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {outras.map((p) => (
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
          </ul>
        </section>
      </main>
      <RodapeSite />
    </div>
  )
}

function Migalhas({ itens }: { itens: [string, string][] }) {
  return (
    <nav aria-label="Você está em" className="text-sm text-grafite-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        {itens.map(([nome, caminho], i) => (
          <li key={nome} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>›</span>}
            {caminho ? (
              <Link to={caminho} className="hover:text-brasa-700">
                {nome}
              </Link>
            ) : (
              <span className="font-semibold text-grafite-700" aria-current="page">
                {nome}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
