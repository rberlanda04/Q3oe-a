import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { DIAS_PRO_BETA, DIAS_TESTE_ATUAL, MODO_BETA } from '../../config'
import { MODELOS, modeloPorId } from '../../domain/templates'
import { caminhoProfissao, PERGUNTAS_HOME } from '../../seo/paginas'
import { PROFISSOES_SEO } from '../../seo/profissoes'
import {
  IconeCheck,
  IconeDocumento,
  IconeEscudo,
  IconeLink,
  IconeNuvem,
  IconePessoas,
  IconePix,
  IconeRegua,
  IconeSeta,
  IconeWhatsApp,
} from '../../ui/Icones'
import { Simbolo } from '../../ui/Logo'
import { Regua } from '../../ui/Regua'
import { CabecalhoSite, RodapeSite, useTitulo } from './Moldura'

export function Home() {
  useTitulo('Q3 Orça · Orçamento rápido, aprovado pelo celular')
  return (
    <div className="overflow-x-hidden">
      <CabecalhoSite />
      <Hero />
      <Profissoes />
      <ComoFunciona />
      <AntesDepois />
      <Recursos />
      <ModelosPorProfissao />
      <Precos />
      <Duvidas />
      <ChamadaFinal />
      <RodapeSite />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-16 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20 lg:pb-24">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-brasa-200 bg-white px-3 py-1.5 text-sm font-semibold text-brasa-700">
            <span className="h-2 w-2 rounded-full bg-aprovado-500" />{' '}
            {MODO_BETA ? `Fase de testes: Pro grátis por ${DIAS_PRO_BETA} dias` : 'Cliente aprova pelo link e paga no Pix'}
          </p>
          {/* No celular o título ocupa 4 linhas com a fonte da marca: a altura fica reservada para nada pular enquanto ela carrega. */}
          <h1 className="mt-6 min-h-[4.1em] text-5xl leading-[1.02] font-extrabold sm:min-h-0 sm:text-6xl lg:text-7xl">
            Orçamento rápido,{' '}
            <span className="relative whitespace-nowrap text-brasa-600">
              aprovado
              <svg className="absolute -bottom-2 left-0 h-3 w-full" viewBox="0 0 200 12" preserveAspectRatio="none" aria-hidden>
                <path d="M2 9c50-6 140-8 196-3" stroke="#ffc53d" strokeWidth="5" fill="none" strokeLinecap="round" />
              </svg>
            </span>{' '}
            pelo celular.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-grafite-600 sm:text-xl">
            Monte em 2 minutos, envie pelo WhatsApp e receba por Pix. Para eletricistas, pintores, diaristas e todo mundo que
            trabalha com as mãos.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/entrar?modo=criar" className="btn-primary !px-7 !py-4 text-lg">
              Criar meu primeiro orçamento <IconeSeta tamanho={20} />
            </Link>
            <a href="#como-funciona" className="btn-secondary !px-7 !py-4 text-lg">
              Ver como funciona
            </a>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-grafite-500">
            {['Grátis para começar', 'Sem instalar nada', 'Funciona sem internet'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <IconeCheck tamanho={16} strokeWidth={3} className="text-aprovado-600" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <Celular />
      </div>
    </section>
  )
}

/** Demonstração: o que o cliente vê ao abrir o link. */
/**
 * Telas reais do app passando em carrossel, só com CSS (classes .carrossel em index.css).
 * A primeira tela fica fixa por baixo e carrega com prioridade: o topo aparece na hora,
 * e as outras entram por cima em sequência, com transição suave.
 */
const TELAS = [
  ['orcamento', 'Monte em 2 minutos', 'Orçamento de pintura com o total calculado'],
  ['cliente', 'O cliente recebe no WhatsApp', 'Orçamento aberto pelo cliente, com o logo do profissional'],
  ['aprovado', 'Aprova e paga no Pix', 'Orçamento aprovado pelo cliente, com QR Code Pix'],
  ['marca', 'Com o seu logo e a sua cor', 'Tela de dados da empresa'],
  ['modelo', 'Modelos para 26 profissões', 'Página do modelo de orçamento para pintor'],
] as const

function Celular() {
  return (
    <figure className="relative mx-auto w-full max-w-[320px]">
      <div className="absolute -inset-8 -z-10 rounded-full bg-brasa-200/50 blur-3xl" />
      <div className="rounded-[2.6rem] bg-grafite-900 p-2.5 shadow-flutuante">
        <div className="carrossel overflow-hidden rounded-[2.1rem] bg-areia-100">
          {TELAS.map(([nome, , alt], i) => (
            <img
              key={nome}
              src={`/telas/${nome}.webp`}
              alt={alt}
              width={600}
              height={1298}
              loading={i === 0 ? 'eager' : 'lazy'}
              fetchPriority={i === 0 ? 'high' : 'low'}
              decoding="async"
              className={i === 0 ? 'carrossel-base' : 'carrossel-tela'}
              style={i === 0 ? undefined : ({ '--i': i } as React.CSSProperties)}
            />
          ))}
        </div>
      </div>
      <figcaption className="carrossel-legendas mt-4 h-6 text-center text-sm font-semibold text-grafite-700" aria-hidden>
        {TELAS.map(([nome, legenda], i) => (
          <span key={nome} style={{ '--i': i } as React.CSSProperties}>
            {legenda}
          </span>
        ))}
      </figcaption>
    </figure>
  )
}

function Profissoes() {
  const lista = MODELOS.filter((m) => m.id !== 'outro')
  return (
    <section className="border-y border-areia-200 bg-white py-6" aria-label="Profissões atendidas">
      <div className="relative overflow-hidden">
        <div className="flex w-max animate-[deslizar_40s_linear_infinite] gap-3 motion-reduce:animate-none">
          {[...lista, ...lista].map((m, i) => (
            <span key={i} className="chip shrink-0 !py-2 text-base">
              <span aria-hidden>{m.icone}</span> {m.nome}
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes deslizar { to { transform: translateX(-50%); } }`}</style>
    </section>
  )
}

function ComoFunciona() {
  const passos = [
    {
      verbo: 'Monta',
      texto: 'Escolha sua profissão e toque nos itens prontos. Seus preços ficam salvos para a próxima vez.',
      Icone: IconeDocumento,
    },
    {
      verbo: 'Manda',
      texto: 'Envie pelo WhatsApp em PDF com a sua cara, ou mande um link que o cliente abre em qualquer celular.',
      Icone: IconeWhatsApp,
    },
    {
      verbo: 'Recebe',
      texto: 'O cliente aprova com um toque e paga no Pix. O recibo com valor por extenso sai pronto.',
      Icone: IconePix,
    },
  ]
  return (
    <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
      <p className="rotulo !text-brasa-700">Por que Q3?</p>
      <h2 className="mt-2 max-w-2xl text-4xl font-extrabold sm:text-5xl">Três toques. Do orçamento ao dinheiro na conta.</h2>
      <div className="mt-12 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1">
        {passos.map(({ verbo, texto, Icone }, i) => (
          <article key={verbo} className="card relative overflow-hidden !p-7">
            <span className="absolute -top-4 -right-2 font-display text-[7rem] leading-none font-extrabold text-brasa-50" aria-hidden>
              {i + 1}
            </span>
            <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-brasa-500 text-white">
              <Icone tamanho={24} />
            </span>
            <h3 className="relative mt-5 text-2xl font-extrabold">{verbo}</h3>
            <p className="relative mt-2 text-grafite-600">{texto}</p>
          </article>
        ))}
      </div>
      <DemoEmVideo />
      </div>
    </section>
  )
}

/**
 * Demonstração de 30 segundos, com telas reais do app. Vídeo em vez de GIF: 500 KB em vez
 * de 2,4 MB. Só baixa quando a seção aparece na tela e pausa quando sai; quem pediu menos
 * movimento no sistema vê a capa e os controles.
 */
function DemoEmVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = ref.current
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.4 },
    )
    observador.observe(video)
    return () => observador.disconnect()
  }, [])
  return (
    <figure className="mx-auto w-full max-w-[300px]">
      <div className="overflow-hidden rounded-[2.2rem] border-[6px] border-grafite-900 bg-grafite-900 shadow-flutuante">
        <video
          ref={ref}
          className="block aspect-[9/16] w-full"
          src="/demo/q3orca-demo.mp4"
          poster="/demo/q3orca-demo.webp"
          muted
          loop
          playsInline
          preload="none"
          aria-label="Demonstração: um orçamento de pintura montado, enviado pelo WhatsApp e aprovado pelo cliente"
        />
      </div>
      <figcaption className="mt-3 text-center text-sm text-grafite-500">Do orçamento à aprovação em 30 segundos</figcaption>
    </figure>
  )
}

function AntesDepois() {
  return (
    <section className="bg-grafite-900 py-20 text-white">
      <div className="mx-auto max-w-6xl px-5">
        <h2 className="max-w-2xl text-4xl font-extrabold sm:text-5xl">
          O cliente decide pela <span className="text-brasa-400">primeira impressão.</span>
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-cartao border border-grafite-700 p-7">
            <p className="rotulo">Do jeito antigo</p>
            <ul className="mt-5 space-y-4 text-grafite-300">
              {[
                'Valor mandado por áudio ou num papel de pão',
                'Conta feita na calculadora, com medo de errar',
                'Cliente some e você não sabe se cobra de novo',
                'Pix digitado na mão, recibo escrito a caneta',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 text-alerta-600" aria-hidden>
                    ✕
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-cartao bg-white p-7 text-grafite-900">
            <p className="rotulo !text-brasa-700">Com Q3 Orça</p>
            <ul className="mt-5 space-y-4">
              {[
                'PDF profissional com seu nome, contato e garantia',
                'Contas certas, com desconto, deslocamento e entrada',
                'Aviso de quem não respondeu, com lembrete pronto',
                'QR Code Pix no orçamento e recibo em um toque',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <IconeCheck tamanho={20} strokeWidth={3} className="mt-0.5 shrink-0 text-aprovado-600" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Recursos() {
  const itens = [
    { Icone: IconeLink, titulo: 'Link de aprovação', texto: 'O cliente vê tudo no celular e aprova. Você é avisado na hora.' },
    { Icone: IconePix, titulo: 'Pix com QR Code', texto: 'Cobre o total ou só a entrada. Sem taxa, direto na sua chave.' },
    { Icone: IconeDocumento, titulo: 'Recibo e garantia', texto: 'Recibo com valor por extenso, ordem de serviço e termo de garantia.' },
    { Icone: IconeRegua, titulo: 'Calculadora de área', texto: 'Some paredes, desconte portas e janelas e use o m² no orçamento.' },
    { Icone: IconePessoas, titulo: 'Clientes e preços salvos', texto: 'Cada cliente e cada preço ficam guardados para o próximo serviço.' },
    { Icone: IconeNuvem, titulo: 'Funciona sem internet', texto: 'Monte o orçamento no porão ou na obra. Sincroniza quando o sinal voltar.' },
  ]
  return (
    <section id="recursos" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
      <p className="rotulo !text-brasa-700">Recursos</p>
      <h2 className="mt-2 max-w-2xl text-4xl font-extrabold sm:text-5xl">Tudo o que o serviço pede, nada que atrapalhe.</h2>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map(({ Icone, titulo, texto }) => (
          <article key={titulo} className="card !p-6">
            <Icone tamanho={28} className="text-brasa-600" />
            <h3 className="mt-4 text-lg font-bold">{titulo}</h3>
            <p className="mt-1 text-grafite-600">{texto}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function ModelosPorProfissao() {
  return (
    <section id="modelos" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-20">
      <p className="rotulo !text-brasa-700">Modelos prontos</p>
      <h2 className="mt-2 max-w-2xl text-4xl font-extrabold sm:text-5xl">Um modelo de orçamento para cada profissão.</h2>
      <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {PROFISSOES_SEO.map((p) => (
          <li key={p.slug}>
            <Link to={caminhoProfissao(p)} className="card flex items-center gap-3 !p-4 transition hover:border-brasa-300">
              <span className="text-2xl" aria-hidden>
                {modeloPorId(p.id).icone}
              </span>
              <span className="text-sm font-semibold">Orçamento para {p.para}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        to="/gerador-de-orcamento"
        className="card group mt-6 flex flex-col gap-2 !p-6 transition hover:border-brasa-300 sm:flex-row sm:items-center sm:justify-between"
      >
        <span>
          <span className="block text-lg font-bold">Precisa de um orçamento agora?</span>
          <span className="text-grafite-600">Use o gerador de orçamento grátis, sem cadastro, e baixe o PDF na hora.</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-brasa-700">
          Gerar orçamento <IconeSeta tamanho={18} className="transition group-hover:translate-x-0.5" />
        </span>
      </Link>
    </section>
  )
}

function Precos() {
  return (
    <section id="precos" className="scroll-mt-20 bg-areia-200/60 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <p className="rotulo text-center !text-brasa-700">Preços</p>
        <h2 className="mx-auto mt-2 max-w-xl text-center text-4xl font-extrabold sm:text-5xl">Comece grátis. Cresça quando quiser.</h2>
        <div className="mx-auto mt-12 grid max-w-4xl gap-5 md:grid-cols-2">
          <Plano
            nome="Grátis"
            preco="R$ 0"
            periodo="para sempre"
            itens={[
              'Orçamentos ilimitados',
              '12 modelos de profissão',
              'Envio pelo WhatsApp e link de aprovação',
              'QR Code Pix, recibo e garantia',
              "Marca d'água e link do Q3 Orça no PDF",
            ]}
            chamada={
              <Link to="/entrar?modo=criar" className="btn-primary w-full">
                Criar conta grátis
              </Link>
            }
          />
          <Plano
            destaque
            nome="Pro"
            preco="R$ 14,90"
            periodo="por mês, ou R$ 99 por ano"
            itens={[
              'Tudo do plano Grátis',
              'Seu logo e sua cor nos documentos',
              'Nome da empresa e dados do CNPJ no cabeçalho',
              'Página de aprovação com a sua marca',
              'Sem a marca Q3 Orça',
            ]}
            chamada={
              <Link to="/entrar?modo=criar" className="btn w-full bg-white text-grafite-900 hover:bg-areia-100">
                {MODO_BETA ? `Grátis por ${DIAS_PRO_BETA} dias no beta` : `Testar grátis por ${DIAS_TESTE_ATUAL} dias`}
              </Link>
            }
          />
        </div>
      </div>
    </section>
  )
}

function Plano(props: { nome: string; preco: string; periodo: string; itens: string[]; chamada: React.ReactNode; destaque?: boolean }) {
  const { nome, preco, periodo, itens, chamada, destaque } = props
  return (
    <article className={`relative flex flex-col rounded-cartao p-8 ${destaque ? 'bg-grafite-900 text-white shadow-flutuante' : 'card'}`}>
      {destaque && (
        <span className="absolute -top-3 right-6 rounded-full bg-regua-400 px-3 py-1 text-xs font-bold text-grafite-900">Em breve</span>
      )}
      <p className="font-display text-xl font-bold">{nome}</p>
      <p className="mt-4 font-display text-5xl font-extrabold">{preco}</p>
      <p className={destaque ? 'text-grafite-300' : 'text-grafite-500'}>{periodo}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {itens.map((t) => (
          <li key={t} className="flex gap-2.5">
            <IconeCheck tamanho={20} strokeWidth={3} className={`shrink-0 ${destaque ? 'text-brasa-400' : 'text-aprovado-600'}`} />
            {t}
          </li>
        ))}
      </ul>
      <div className="mt-8">{chamada}</div>
    </article>
  )
}

function Duvidas() {
  const perguntas = PERGUNTAS_HOME
  return (
    <section id="duvidas" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20">
      <h2 className="text-center text-4xl font-extrabold">Dúvidas frequentes</h2>
      <div className="mt-10 space-y-3">
        {perguntas.map(([p, r]) => (
          <details key={p} className="group card !p-0 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 font-semibold">
              {p}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-areia-200 transition group-open:rotate-45">+</span>
            </summary>
            <p className="px-6 pb-5 text-grafite-600">{r}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function ChamadaFinal() {
  return (
    <section className="px-5 pb-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-brasa-500 px-8 pt-14 pb-24 text-center text-white">
        <Simbolo tamanho={64} variante="escuro" className="mx-auto" />
        <h2 className="mx-auto mt-6 max-w-2xl text-4xl font-extrabold sm:text-5xl">Seu próximo orçamento pode sair em 2 minutos.</h2>
        <Link to="/entrar?modo=criar" className="btn-escuro mt-8 !px-8 !py-4 text-lg">
          Começar agora, é grátis <IconeSeta tamanho={20} />
        </Link>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm text-brasa-100">
          <IconeEscudo tamanho={16} /> Seus dados são seus. Exporte quando quiser.
        </p>
        <Regua className="[&_line]:stroke-white" />
      </div>
    </section>
  )
}
