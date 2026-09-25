import { useState, type ReactNode } from 'react'
import { APOIO, CAMPANHAS, contraste, ESCALAS, nivelWcag, PRINCIPAIS, textoSobre, type Cor } from '../../domain/cores'
import * as Icones from '../../ui/Icones'
import { Logo, Simbolo } from '../../ui/Logo'
import { Regua } from '../../ui/Regua'
import { CabecalhoSite, RodapeSite, useTitulo } from './Moldura'

const SECOES = [
  ['essencia', 'Essência'],
  ['nome', 'Nome'],
  ['logo', 'Logotipo'],
  ['cores', 'Cores'],
  ['campanhas', 'Paletas de campanha'],
  ['tipografia', 'Tipografia'],
  ['elementos', 'Elementos gráficos'],
  ['voz', 'Voz e tom'],
  ['aplicacoes', 'Aplicações'],
] as const

export function Marca() {
  useTitulo('Manual da marca · Q3 Orça')
  return (
    <div>
      <CabecalhoSite links={false} />
      <Capa />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[200px_1fr]">
        <nav className="hidden lg:block" aria-label="Seções do manual">
          <ol className="sticky top-24 space-y-1 text-sm">
            {SECOES.map(([id, nome], i) => (
              <li key={id}>
                <a href={`#${id}`} className="flex gap-3 rounded-lg px-3 py-1.5 font-medium text-grafite-500 hover:bg-white hover:text-brasa-700">
                  <span className="w-5 text-grafite-300 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  {nome}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="min-w-0 space-y-24">
          <Essencia />
          <Nome />
          <Logotipo />
          <Cores />
          <Campanhas />
          <Tipografia />
          <Elementos />
          <Voz />
          <Aplicacoes />
        </div>
      </div>
      <RodapeSite />
    </div>
  )
}

function Capa() {
  return (
    <section className="relative overflow-hidden bg-grafite-900 text-white">
      <div className="mx-auto max-w-6xl px-5 pt-20 pb-28">
        <p className="rotulo !text-brasa-400">Manual da marca · versão 1.0 · setembro de 2026</p>
        <div className="mt-8">
          <Logo tamanho={72} claro />
        </div>
        <p className="mt-8 max-w-2xl font-display text-4xl leading-tight font-extrabold sm:text-5xl">
          Monta. Manda. <span className="text-brasa-400">Recebe.</span>
        </p>
        <p className="mt-4 max-w-xl text-grafite-300">
          Este manual reúne as regras que fazem a Q3 Orça ser reconhecida em qualquer lugar: no celular do profissional, no WhatsApp do
          cliente e na rua.
        </p>
      </div>
      <Regua />
    </section>
  )
}

function Secao({ id, numero, titulo, intro, children }: { id: string; numero: number; titulo: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <p className="rotulo !text-brasa-700">{String(numero).padStart(2, '0')}</p>
      <h2 className="mt-1 text-4xl font-extrabold">{titulo}</h2>
      {intro && <div className="mt-3 max-w-2xl text-lg text-grafite-600">{intro}</div>}
      <div className="mt-8">{children}</div>
    </section>
  )
}

/* ---------- 01 Essência ---------- */

function Essencia() {
  const tracos = [
    { e: 'Direta', nao: 'Seca', texto: 'Fala o necessário, com palavras de todo dia. Nada de "solução integrada".' },
    { e: 'Parceira', nao: 'Paternalista', texto: 'Está do lado do profissional, como um colega de obra que ajuda a fechar o serviço.' },
    { e: 'Caprichosa', nao: 'Enfeitada', texto: 'Acabamento bem feito, contas certas, tudo alinhado. Capricho é respeito.' },
    { e: 'Brasileira', nao: 'Caricata', texto: 'Pix, WhatsApp, "orça" e "serviço". Fala como o Brasil que trabalha.' },
  ]
  return (
    <Secao
      id="essencia"
      numero={1}
      titulo="Essência"
      intro="A Q3 Orça existe para dar ao profissional autônomo a mesma apresentação de uma grande empresa, sem complicação e sem custo para começar."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Bloco titulo="Propósito">Valorizar quem trabalha com as mãos.</Bloco>
        <Bloco titulo="Promessa">Do orçamento ao dinheiro na conta, em três toques.</Bloco>
        <Bloco titulo="Para quem">Eletricistas, pintores, diaristas, confeiteiras e todo prestador de serviço.</Bloco>
      </div>
      <h3 className="mt-12 text-2xl font-bold">Personalidade</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {tracos.map((t) => (
          <div key={t.e} className="card">
            <p className="font-display text-xl font-extrabold">
              {t.e} <span className="text-base font-semibold text-grafite-400">, mas não {t.nao.toLowerCase()}</span>
            </p>
            <p className="mt-2 text-grafite-600">{t.texto}</p>
          </div>
        ))}
      </div>
    </Secao>
  )
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="rounded-cartao bg-grafite-900 p-6 text-white">
      <p className="rotulo !text-brasa-400">{titulo}</p>
      <p className="mt-3 font-display text-xl leading-snug font-bold">{children}</p>
    </div>
  )
}

/* ---------- 02 Nome ---------- */

function Nome() {
  return (
    <Secao id="nome" numero={2} titulo="Nome e significado">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card !p-8">
          <p className="font-display text-7xl font-extrabold text-brasa-500">Q3</p>
          <p className="mt-4 text-grafite-600">
            Os <strong>três toques</strong> do produto: <strong>monta</strong>, <strong>manda</strong>, <strong>recebe</strong>. É curto,
            fácil de lembrar e funciona como assinatura.
          </p>
        </div>
        <div className="card !p-8">
          <p className="font-display text-7xl font-extrabold">Orça</p>
          <p className="mt-4 text-grafite-600">
            Como o profissional fala na obra: "passa lá que eu orço". Verbo de ação, direto e brasileiro.
          </p>
        </div>
      </div>
      <p className="mt-6 text-grafite-600">
        Escreva sempre <strong>Q3 Orça</strong>: Q maiúsculo, 3 colado, espaço, Orça com cedilha. Em endereços e usuários, use{' '}
        <code className="rounded bg-areia-200 px-1.5 py-0.5">q3orca</code>.
      </p>
    </Secao>
  )
}

/* ---------- 03 Logotipo ---------- */

function Logotipo() {
  return (
    <Secao
      id="logo"
      numero={3}
      titulo="Logotipo"
      intro='O símbolo é um "Q" cuja perna se transforma no sinal de aprovado. É a promessa da marca desenhada: todo orçamento feito para ser aprovado.'
    >
      <div className="grid gap-4 md:grid-cols-3">
        <Placa fundo="bg-white" legenda="Principal, sobre fundos claros">
          <Logo tamanho={48} />
        </Placa>
        <Placa fundo="bg-grafite-900" legenda="Negativa, sobre fundos escuros" claro>
          <Logo tamanho={48} claro />
        </Placa>
        <Placa fundo="bg-brasa-500" legenda="Símbolo em grafite sobre Brasa">
          <Simbolo tamanho={72} variante="escuro" />
        </Placa>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="card">
          <p className="font-semibold">Área de proteção</p>
          <p className="mt-1 text-sm text-grafite-600">
            Deixe em volta do símbolo um espaço livre igual à largura do traço do anel multiplicada por dois. Nada invade esse espaço.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="relative p-6 outline-2 outline-offset-0 outline-brasa-300 outline-dashed">
              <Simbolo tamanho={96} />
              <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-bold text-brasa-600">2x</span>
              <span className="absolute top-1/2 left-1 -translate-y-1/2 text-[10px] font-bold text-brasa-600">2x</span>
            </div>
          </div>
        </div>
        <div className="card">
          <p className="font-semibold">Tamanho mínimo</p>
          <p className="mt-1 text-sm text-grafite-600">Abaixo disso, o sinal de aprovado se perde.</p>
          <div className="mt-6 flex items-end justify-around">
            <div className="text-center">
              <Simbolo tamanho={24} />
              <p className="mt-2 text-xs text-grafite-500">Símbolo: 24 px</p>
            </div>
            <div className="text-center">
              <Logo tamanho={24} />
              <p className="mt-2 text-xs text-grafite-500">Logotipo: 96 px de largura</p>
            </div>
            <div className="text-center">
              <Simbolo tamanho={48} />
              <p className="mt-2 text-xs text-grafite-500">Ícone do app: 48 px</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="mt-12 text-2xl font-bold">Não faça</h3>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Errado legenda="Distorcer">
          <div style={{ transform: 'scaleX(1.6)' }}>
            <Simbolo tamanho={56} />
          </div>
        </Errado>
        <Errado legenda="Girar">
          <div className="rotate-[25deg]">
            <Simbolo tamanho={56} />
          </div>
        </Errado>
        <Errado legenda="Trocar a cor">
          <div className="hue-rotate-180">
            <Simbolo tamanho={56} />
          </div>
        </Errado>
        <Errado legenda="Fundo sem contraste" fundo="bg-brasa-400">
          <Simbolo tamanho={56} />
        </Errado>
      </div>
    </Secao>
  )
}

function Placa({ fundo, legenda, claro, children }: { fundo: string; legenda: string; claro?: boolean; children: ReactNode }) {
  return (
    <figure className={`flex flex-col overflow-hidden rounded-cartao border border-areia-200 ${fundo}`}>
      <div className="grid min-h-44 flex-1 place-items-center p-8">{children}</div>
      <figcaption className={`px-5 pb-4 text-sm ${claro ? 'text-white/80' : 'text-grafite-500'}`}>{legenda}</figcaption>
    </figure>
  )
}

function Errado({ legenda, fundo = 'bg-white', children }: { legenda: string; fundo?: string; children: ReactNode }) {
  return (
    <figure className="overflow-hidden rounded-cartao border border-areia-200 bg-white">
      <div className={`relative grid h-32 place-items-center ${fundo}`}>
        {children}
        <span className="absolute top-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-alerta-600 text-xs font-bold text-white">✕</span>
      </div>
      <figcaption className="px-4 py-3 text-sm font-medium">{legenda}</figcaption>
    </figure>
  )
}

/* ---------- 04 Cores ---------- */

function useCopiar() {
  const [copiado, setCopiado] = useState('')
  const copiar = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(texto)
      setTimeout(() => setCopiado(''), 1500)
    } catch {
      /* Sem permissão de área de transferência: o valor continua visível na tela. */
    }
  }
  return { copiado, copiar }
}

function Cores() {
  const { copiado, copiar } = useCopiar()
  const combinacoes: [string, string, string][] = [
    ['Texto sobre Areia', '#1b1f2a', '#faf6f0'],
    ['Botão primário', '#ffffff', '#c43e0c'],
    ['Botão WhatsApp', '#ffffff', '#167c42'],
    ['Texto secundário', '#5b6372', '#ffffff'],
    ['Destaque sobre Grafite', '#ff7a45', '#1b1f2a'],
    ['Brasa 500 sobre branco', '#ff5a1f', '#ffffff'],
  ]
  return (
    <Secao
      id="cores"
      numero={4}
      titulo="Cores"
      intro="A paleta Brasa nasce do canteiro de obras: o laranja do trabalho, o grafite do profissional e a areia que acolhe. Toque em uma cor para copiar o código."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {PRINCIPAIS.map((c) => (
          <button
            key={c.hex}
            onClick={() => copiar(c.hex)}
            className="group flex flex-col overflow-hidden rounded-cartao border border-areia-200 text-left shadow-cartao"
          >
            <div className="flex h-40 w-full items-end p-5" style={{ background: c.hex, color: textoSobre(c.hex) }}>
              <span className="font-display text-2xl font-extrabold">{c.nome}</span>
            </div>
            <div className="w-full flex-1 bg-white p-5">
              <p className="font-mono text-sm font-semibold uppercase">{copiado === c.hex ? 'Copiado!' : c.hex}</p>
              <p className="mt-1 text-sm text-grafite-500">{c.uso}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
        {APOIO.map((c) => (
          <Amostra key={c.hex} cor={c} copiado={copiado === c.hex} onCopiar={copiar} />
        ))}
      </div>

      <h3 className="mt-12 text-2xl font-bold">Proporção</h3>
      <p className="mt-1 text-grafite-600">A Brasa chama atenção porque aparece pouco. Areia e grafite fazem o trabalho pesado.</p>
      <div className="mt-4 flex h-16 overflow-hidden rounded-cartao text-sm font-bold">
        <div className="grid place-items-center bg-areia-200 text-grafite-700" style={{ width: '60%' }}>
          Areia e branco 60%
        </div>
        <div className="grid place-items-center bg-grafite-900 text-white" style={{ width: '25%' }}>
          Grafite 25%
        </div>
        <div className="grid place-items-center bg-brasa-500 text-grafite-900" style={{ width: '10%' }}>
          10%
        </div>
        <div className="grid place-items-center bg-aprovado-600 text-white" style={{ width: '5%' }} title="Apoio 5%" />
      </div>

      <h3 className="mt-12 text-2xl font-bold">Escalas</h3>
      <div className="mt-4 space-y-6">
        {ESCALAS.map((e) => (
          <div key={e.nome}>
            <p className="font-semibold">
              {e.nome} <span className="font-normal text-grafite-500">· {e.descricao}</span>
            </p>
            <div className="mt-2 grid grid-cols-5 overflow-hidden rounded-xl sm:grid-cols-10">
              {e.tons.map((t) => (
                <button
                  key={t.hex}
                  onClick={() => copiar(t.hex)}
                  className="flex h-20 flex-col justify-end p-2 text-left text-[11px] font-semibold"
                  style={{ background: t.hex, color: textoSobre(t.hex) }}
                  title={`${e.nome} ${t.tom} ${t.hex}`}
                >
                  <span>{t.tom}</span>
                  <span className="font-mono uppercase opacity-80">{copiado === t.hex ? 'ok!' : t.hex.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-12 text-2xl font-bold">Acessibilidade</h3>
      <p className="mt-1 text-grafite-600">Contraste calculado pela fórmula da WCAG. Texto comum precisa de pelo menos 4,5.</p>
      <div className="mt-4 overflow-hidden rounded-cartao border border-areia-200 bg-white">
        {combinacoes.map(([nome, texto, fundo]) => {
          const razao = contraste(texto, fundo)
          const nivel = nivelWcag(razao)
          return (
            <div key={nome} className="flex items-center gap-4 border-b border-areia-200 px-5 py-3 last:border-0">
              <span className="grid h-10 w-16 shrink-0 place-items-center rounded-lg font-bold" style={{ background: fundo, color: texto }}>
                Aa
              </span>
              <span className="flex-1 font-medium">{nome}</span>
              <span className="font-mono text-sm tabular-nums">{razao.toFixed(1).replace('.', ',')}:1</span>
              <span
                className={`w-32 shrink-0 rounded-full px-2.5 py-1 text-center text-xs font-bold ${
                  nivel === 'Não usar em texto' ? 'bg-alerta-50 text-alerta-600' : nivel === 'AA grande' ? 'bg-regua-100 text-grafite-900' : 'bg-aprovado-100 text-aprovado-700'
                }`}
              >
                {nivel === 'AA grande' ? 'Só texto grande' : nivel}
              </span>
            </div>
          )
        })}
      </div>
    </Secao>
  )
}

function Amostra({ cor, copiado, onCopiar }: { cor: Cor; copiado: boolean; onCopiar: (hex: string) => void }) {
  return (
    <button onClick={() => onCopiar(cor.hex)} className="overflow-hidden rounded-cartao border border-areia-200 bg-white text-left">
      <div className="h-20" style={{ background: cor.hex }} />
      <div className="p-3">
        <p className="text-sm font-bold">{cor.nome}</p>
        <p className="font-mono text-xs text-grafite-500 uppercase">{copiado ? 'Copiado!' : cor.hex}</p>
        {cor.uso && <p className="mt-1 text-xs text-grafite-500">{cor.uso}</p>}
      </div>
    </button>
  )
}

/* ---------- 05 Paletas de campanha ---------- */

function Campanhas() {
  const { copiado, copiar } = useCopiar()
  return (
    <Secao
      id="campanhas"
      numero={5}
      titulo="Paletas de campanha"
      intro="Combinações prontas para redes sociais, anúncios e impressos. Todas partem da paleta Brasa, então a marca continua reconhecível."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {CAMPANHAS.map((p) => {
          const [fundo, destaque, , apoio] = p.cores
          return (
            <article key={p.nome} className="overflow-hidden rounded-cartao border border-areia-200 bg-white shadow-cartao">
              <div className="relative aspect-[16/9] overflow-hidden p-6" style={{ background: fundo.hex, color: textoSobre(fundo.hex) }}>
                <p className="text-xs font-bold tracking-wider uppercase opacity-80">{p.nome}</p>
                <p className="mt-3 max-w-[80%] font-display text-2xl leading-tight font-extrabold">
                  Orçamento aprovado{' '}
                  <span className="rounded-md px-1.5" style={{ background: destaque.hex, color: textoSobre(destaque.hex) }}>
                    pelo celular
                  </span>
                </p>
                <div className="absolute right-5 bottom-5 rounded-2xl p-1.5" style={{ background: apoio.hex }}>
                  <Simbolo tamanho={40} />
                </div>
              </div>
              <div className="flex">
                {p.cores.map((c) => (
                  <button
                    key={c.nome}
                    onClick={() => copiar(c.hex)}
                    className="flex h-14 flex-1 items-end p-2 text-[10px] font-semibold"
                    style={{ background: c.hex, color: textoSobre(c.hex) }}
                    title={`${c.nome} ${c.hex}`}
                  >
                    {copiado === c.hex ? 'ok!' : c.hex.toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="p-4 text-sm text-grafite-600">{p.ideia}</p>
            </article>
          )
        })}
      </div>
    </Secao>
  )
}

/* ---------- 06 Tipografia ---------- */

function Tipografia() {
  return (
    <Secao
      id="tipografia"
      numero={6}
      titulo="Tipografia"
      intro="Duas famílias gratuitas do Google Fonts. Uma com personalidade para chamar atenção, outra neutra para ler sem esforço."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card !p-8">
          <p className="rotulo">Títulos</p>
          <p className="mt-3 font-display text-7xl leading-none font-extrabold">Aa</p>
          <p className="mt-4 font-display text-2xl font-bold">Bricolage Grotesque</p>
          <p className="mt-1 text-sm text-grafite-500">Pesos 600, 700 e 800. Espaçamento levemente fechado.</p>
          <p className="mt-4 text-sm text-grafite-600">Tem traços irregulares, como feitos à mão. Combina com quem trabalha com as mãos.</p>
        </div>
        <div className="card !p-8">
          <p className="rotulo">Textos e interface</p>
          <p className="mt-3 text-7xl leading-none font-semibold">Aa</p>
          <p className="mt-4 text-2xl font-bold">Figtree</p>
          <p className="mt-1 text-sm text-grafite-500">Pesos 400 a 700 no texto, 900 no logotipo.</p>
          <p className="mt-4 text-sm text-grafite-600">Clara em telas pequenas e ao sol. Números bem desenhados para valores.</p>
          <p className="mt-2 text-sm text-grafite-600">
            O logotipo escrito usa Figtree Black com espaçamento fechado. O "Q" dela não se confunde com "O".
          </p>
        </div>
      </div>
      <div className="card mt-4 space-y-5 !p-8">
        {[
          ['Display', 'font-display text-5xl font-extrabold', '48 px · Bricolage 800'],
          ['Título', 'font-display text-3xl font-extrabold', '30 px · Bricolage 800'],
          ['Subtítulo', 'font-display text-xl font-bold', '20 px · Bricolage 700'],
          ['Texto', 'text-base', '16 px · Figtree 400'],
          ['Legenda', 'text-sm text-grafite-500', '14 px · Figtree 400'],
          ['Rótulo', 'rotulo', '12 px · Figtree 700 · maiúsculas'],
        ].map(([nome, classe, spec]) => (
          <div key={nome} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-areia-200 pb-4 last:border-0 last:pb-0">
            <span className={classe}>{nome === 'Texto' ? 'Orçamento aprovado pelo celular' : nome}</span>
            <span className="font-mono text-xs text-grafite-400">{spec}</span>
          </div>
        ))}
      </div>
    </Secao>
  )
}

/* ---------- 07 Elementos gráficos ---------- */

function Elementos() {
  const lista = Object.entries(Icones).filter(([nome]) => nome.startsWith('Icone')) as [string, (p: { tamanho?: number }) => ReactNode][]
  return (
    <Secao id="elementos" numero={7} titulo="Elementos gráficos">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card relative overflow-hidden !pb-20">
          <p className="font-semibold">A régua</p>
          <p className="mt-1 text-sm text-grafite-600">
            Marcas de trena na base de capas, banners e chamadas. Lembra medida, precisão e o dia a dia da obra. Use sempre em uma borda,
            nunca no meio do conteúdo.
          </p>
          <Regua />
        </div>
        <div className="card">
          <p className="font-semibold">Cantos e sombras</p>
          <p className="mt-1 text-sm text-grafite-600">Cantos de 20 px em cartões e 12 px em botões e campos. Sombras suaves e quentes.</p>
          <div className="mt-5 flex gap-4">
            <div className="h-20 flex-1 rounded-cartao bg-white shadow-cartao" />
            <div className="h-20 flex-1 rounded-xl bg-brasa-700" />
            <div className="h-20 flex-1 rounded-cartao bg-white shadow-flutuante" />
          </div>
        </div>
      </div>
      <div className="card mt-4">
        <p className="font-semibold">Ícones</p>
        <p className="mt-1 text-sm text-grafite-600">Traço de 2 px, pontas arredondadas, grade de 24 px. Sempre na cor do texto ou em Brasa.</p>
        <div className="mt-5 grid grid-cols-5 gap-3 sm:grid-cols-10">
          {lista.map(([nome, Icone]) => (
            <div key={nome} className="grid aspect-square place-items-center rounded-xl bg-areia-100 text-grafite-800" title={nome.replace('Icone', '')}>
              <Icone tamanho={24} />
            </div>
          ))}
        </div>
      </div>
    </Secao>
  )
}

/* ---------- 08 Voz ---------- */

function Voz() {
  const exemplos = [
    ['Seu orçamento está pronto. Mande pelo WhatsApp.', 'Documento gerado com sucesso. Selecione o canal de distribuição.'],
    ['O cliente aprovou! Combine o início do serviço.', 'Status do orçamento atualizado para APROVADO.'],
    ['Sem internet agora. Seu orçamento fica salvo e sobe quando o sinal voltar.', 'Erro de conexão. Tente novamente mais tarde.'],
    ['Faltou a chave Pix. Com ela, o cliente paga pelo QR Code.', 'Campo obrigatório não preenchido.'],
  ]
  return (
    <Secao
      id="voz"
      numero={8}
      titulo="Voz e tom"
      intro="Falamos como um colega experiente: com respeito, sem enrolação e sempre dizendo qual é o próximo passo."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {[
          ['Use você', 'Fale com a pessoa, nunca "o usuário".'],
          ['Uma ideia por frase', 'Frases curtas, com verbo. Quem lê está na obra.'],
          ['Diga o próximo passo', 'Toda mensagem termina em uma ação clara.'],
          ['Palavras do dia a dia', 'Serviço, orçamento, cliente. Nada de jargão.'],
        ].map(([t, d]) => (
          <li key={t} className="card !p-5">
            <p className="font-bold">{t}</p>
            <p className="text-sm text-grafite-600">{d}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 overflow-hidden rounded-cartao border border-areia-200">
        <div className="grid grid-cols-2 bg-grafite-900 text-sm font-bold text-white">
          <p className="px-5 py-3">Diga assim</p>
          <p className="px-5 py-3">Evite</p>
        </div>
        {exemplos.map(([sim, nao]) => (
          <div key={sim} className="grid grid-cols-2 border-t border-areia-200 bg-white text-sm">
            <p className="flex gap-2 px-5 py-4">
              <Icones.IconeCheck tamanho={18} strokeWidth={3} className="shrink-0 text-aprovado-600" /> {sim}
            </p>
            <p className="flex gap-2 bg-areia-50 px-5 py-4 text-grafite-500">
              <span className="text-alerta-600">✕</span> {nao}
            </p>
          </div>
        ))}
      </div>
    </Secao>
  )
}

/* ---------- 09 Aplicações ---------- */

function Aplicacoes() {
  return (
    <Secao id="aplicacoes" numero={9} titulo="Aplicações">
      <div className="card">
        <p className="font-semibold">Botões</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="btn-primary">Criar orçamento</span>
          <span className="btn-whatsapp">
            <Icones.IconeWhatsApp tamanho={18} /> Enviar no WhatsApp
          </span>
          <span className="btn-secondary">Ver PDF</span>
          <span className="btn-escuro">Começar agora</span>
        </div>
        <p className="mt-4 text-sm text-grafite-600">
          Uma ação primária por tela. Verde fica reservado para WhatsApp, aprovação e dinheiro recebido.
        </p>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <figure>
          <div className="relative aspect-square overflow-hidden rounded-cartao bg-brasa-500 p-8 text-grafite-900">
            <Simbolo tamanho={48} variante="escuro" />
            <p className="mt-8 font-display text-4xl leading-[1.05] font-extrabold">
              Chega de orçamento no papel de pão.
            </p>
            <p className="mt-4 font-semibold">q3orca.web.app</p>
            <Regua className="[&_line]:stroke-grafite-900" />
          </div>
          <figcaption className="mt-2 text-sm text-grafite-500">Post para Instagram, paleta Canteiro.</figcaption>
        </figure>
        <div className="space-y-4">
          <figure>
            <div className="flex aspect-[1.75] flex-col justify-between rounded-cartao bg-grafite-900 p-6 text-white shadow-flutuante">
              <Logo tamanho={32} claro />
              <div>
                <p className="font-display text-lg font-bold">Marcos Oliveira</p>
                <p className="text-sm text-grafite-300">Eletricista · (11) 97777-0000</p>
              </div>
            </div>
            <figcaption className="mt-2 text-sm text-grafite-500">Cartão de visita, frente.</figcaption>
          </figure>
          <figure>
            <div className="flex aspect-[1.75] items-center justify-between gap-4 rounded-cartao bg-white p-6 shadow-cartao">
              <div>
                <p className="rotulo">Peça seu orçamento</p>
                <p className="mt-2 font-display text-xl leading-tight font-extrabold">
                  Aprovou no celular,
                  <br />
                  <span className="text-brasa-600">o serviço começa.</span>
                </p>
              </div>
              <Simbolo tamanho={64} />
            </div>
            <figcaption className="mt-2 text-sm text-grafite-500">Cartão de visita, verso.</figcaption>
          </figure>
        </div>
      </div>

      <div className="card mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Arquivos da marca</p>
          <p className="text-sm text-grafite-600">Símbolo em vetor e ícones do app em alta resolução.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a className="btn-secondary !py-2.5 text-sm" href="/favicon.svg" download="q3-orca-simbolo.svg">
            Símbolo SVG
          </a>
          <a className="btn-secondary !py-2.5 text-sm" href="/icone-512.png" download="q3-orca-icone-512.png">
            Ícone PNG 512
          </a>
        </div>
      </div>
    </Secao>
  )
}
