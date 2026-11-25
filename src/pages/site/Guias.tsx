import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { calcularPrecoM2 } from '../../domain/calculadoras'
import { formatarBRL } from '../../domain/money'
import { modeloPorId } from '../../domain/templates'
import { guiaPorCaminho, linkGeradorDoGuia, type ConteudoGuia } from '../../seo/guias'
import { IconeSeta } from '../../ui/Icones'
import { Migalhas } from './Modelos'
import { CabecalhoSite, RodapeSite, useTitulo } from './Moldura'

const reais = (valor: number) => formatarBRL(Math.round(valor * 100))

/** Guia de preço ou de como fazer: /quanto-cobrar/:slug e /como-fazer/:slug */
export function GuiaPagina() {
  const { pathname } = useLocation()
  const guia = guiaPorCaminho(pathname)
  useTitulo(guia ? `${guia.titulo} · Q3 Orça` : 'Q3 Orça')
  if (!guia) return <Navigate to="/" replace />

  return (
    <div>
      <CabecalhoSite />
      <main>
        <section className="mx-auto max-w-3xl px-5 pt-12 pb-10">
          <Migalhas itens={[['Início', '/'], [guia.h1, '']]} />
          <h1 className="mt-4 text-4xl leading-tight font-extrabold sm:text-5xl">{guia.h1}</h1>
          <p className="mt-5 text-lg text-grafite-700">{guia.resposta}</p>
          <Chamada guia={guia} />
        </section>

        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="text-3xl font-extrabold">{guia.tipo === 'quanto-cobrar' ? 'A conta, passo a passo' : 'Passo a passo'}</h2>
          <ol className="mt-6 space-y-5">
            {guia.passos.map((p) => (
              <li key={p.titulo} className="card !p-6">
                <h3 className="text-lg font-bold">{p.titulo}</h3>
                <p className="mt-2 text-grafite-600">{p.texto}</p>
              </li>
            ))}
          </ol>
          {guia.slug === 'pintura-por-m2' && <ContaPinturaM2 guia={guia} />}
        </section>

        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="text-3xl font-extrabold">O que pôr no orçamento</h2>
          <ul className="mt-5 list-disc space-y-2 pl-6 text-grafite-700">
            {guia.itens.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>
          <Chamada guia={guia} />
        </section>

        <section className="mx-auto max-w-3xl px-5 py-10">
          <h2 className="text-3xl font-extrabold">Perguntas frequentes</h2>
          <div className="mt-6 space-y-3">
            {guia.perguntas.map(([p, r]) => (
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

        <section className="mx-auto max-w-3xl px-5 pb-20">
          <h2 className="text-xl font-bold">Veja também</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {guia.relacionados.map(([texto, caminho]) => (
              <li key={caminho}>
                <Link to={caminho} className="chip">
                  {texto}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <RodapeSite />
    </div>
  )
}

/** Botão para o gerador com a profissão do guia, ou a escolha da profissão quando o guia vale para qualquer serviço. */
function Chamada({ guia }: { guia: ConteudoGuia }) {
  if (guia.profissao) {
    return (
      <Link to={linkGeradorDoGuia(guia, guia.profissao)} className="btn-primary mt-6">
        Montar o orçamento agora <IconeSeta tamanho={18} />
      </Link>
    )
  }
  return (
    <div className="mt-6">
      <p className="font-semibold text-grafite-800">Montar o orçamento agora, grátis e sem cadastro. Qual é o seu serviço?</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {(guia.escolhas ?? []).map((id) => (
          <li key={id}>
            <Link to={linkGeradorDoGuia(guia, id)} className="chip">
              {modeloPorId(id).nome}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Conta do m² com os números do próprio leitor: começa vazia, sem preço sugerido. */
function ContaPinturaM2({ guia }: { guia: ConteudoGuia }) {
  const [e, setE] = useState({ diaria: Number.NaN, m2PorDia: Number.NaN, materialPorM2: Number.NaN, area: Number.NaN })
  const r = calcularPrecoM2(e)
  const pronto = Number.isFinite(e.diaria) && Number.isFinite(e.m2PorDia) && e.m2PorDia > 0
  const muda = (k: keyof typeof e) => (v: string) => setE({ ...e, [k]: v === '' ? Number.NaN : Number(v) })
  const campos: [keyof typeof e, string, string][] = [
    ['diaria', 'Sua diária', 'R$'],
    ['m2PorDia', 'm² que você pinta por dia', 'm²'],
    ['materialPorM2', 'Material por m² (se for seu)', 'R$'],
    ['area', 'Área da obra', 'm²'],
  ]
  return (
    <div className="mt-8 rounded-cartao bg-grafite-900 p-6 text-white">
      <h3 className="text-lg font-bold">Faça a conta com os seus números</h3>
      <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={(ev) => ev.preventDefault()} aria-label="Seus números">
        {campos.map(([k, rotulo, sufixo]) => (
          <label key={k} htmlFor={`m2-${k}`} className="block">
            <span className="text-sm font-semibold text-grafite-300">
              {rotulo} ({sufixo})
            </span>
            <input
              id={`m2-${k}`}
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={Number.isFinite(e[k]) ? e[k] : ''}
              onChange={(ev) => muda(k)(ev.target.value)}
              className="mt-1 text-grafite-900"
            />
          </label>
        ))}
      </form>
      <div className="mt-5 border-t border-white/10 pt-4" aria-live="polite">
        {pronto ? (
          <dl className="grid gap-2">
            <div className="flex justify-between gap-4">
              <dt className="text-grafite-300">Mão de obra por m²</dt>
              <dd className="font-bold tabular-nums">{reais(r.maoDeObraM2)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-grafite-300">Preço por m² com material</dt>
              <dd className="font-bold tabular-nums">{reais(r.precoM2)}</dd>
            </div>
            {r.total > 0 && (
              <div className="flex justify-between gap-4">
                <dt className="text-grafite-300">Total da área ({r.dias.toLocaleString('pt-BR')} dias)</dt>
                <dd className="font-bold tabular-nums">{reais(r.total)}</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-sm text-grafite-300">Preencha a sua diária e quantos m² você pinta por dia para ver o seu preço por m².</p>
        )}
        <Link to={linkGeradorDoGuia(guia, guia.profissao ?? 'pintor')} className="btn-primary mt-5 w-full">
          Montar o orçamento agora <IconeSeta tamanho={18} />
        </Link>
      </div>
    </div>
  )
}
