import { Link } from 'react-router-dom'
import { MODELOS } from '../../domain/templates'
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
            <span className="h-2 w-2 rounded-full bg-aprovado-500" /> Cliente aprova pelo link e paga no Pix
          </p>
          <h1 className="mt-6 text-5xl leading-[1.02] font-extrabold sm:text-6xl lg:text-7xl">
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
function Celular() {
  return (
    <div className="relative mx-auto w-full max-w-[340px]">
      <div className="absolute -inset-8 -z-10 rounded-full bg-brasa-200/50 blur-3xl" />
      <div className="rounded-[2.6rem] bg-grafite-900 p-3 shadow-flutuante">
        <div className="overflow-hidden rounded-[2rem] bg-areia-100">
          <div className="bg-grafite-900 px-5 pt-6 pb-10 text-white">
            <p className="font-display text-lg font-bold">Marcos Elétrica</p>
            <p className="text-xs text-grafite-300">(11) 97777-0000 · Campinas - SP</p>
          </div>
          <div className="-mt-6 space-y-3 px-4 pb-5">
            <div className="rounded-2xl bg-white p-4 shadow-cartao">
              <p className="text-xs text-grafite-500">Orçamento nº 2026-0042</p>
              <p className="font-display font-bold">Para Ana Paula</p>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  ['Instalação de tomada', '6 × R$ 45,00', 'R$ 270,00'],
                  ['Troca de disjuntor', '2 × R$ 60,00', 'R$ 120,00'],
                  ['Chuveiro elétrico', '1 × R$ 90,00', 'R$ 90,00'],
                ].map(([d, q, v]) => (
                  <li key={d} className="flex justify-between gap-2">
                    <span>
                      {d}
                      <span className="block text-[11px] text-grafite-400">{q}</span>
                    </span>
                    <span className="font-medium">{v}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-between border-t border-areia-200 pt-2 font-display text-lg font-extrabold">
                <span>Total</span>
                <span>R$ 480,00</span>
              </div>
            </div>
            <div className="rounded-xl bg-aprovado-600 py-3 text-center font-semibold text-white">Aprovar orçamento</div>
            <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-cartao">
              <QrFalso />
              <div className="text-sm">
                <p className="font-semibold">Pagar com Pix</p>
                <p className="text-grafite-500">Aponte a câmera do banco</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-2 -left-4 flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 shadow-flutuante sm:-left-14">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-aprovado-500 text-white">
          <IconeCheck tamanho={16} strokeWidth={3} />
        </span>
        <div className="text-xs">
          <p className="font-bold">Orçamento aprovado!</p>
          <p className="text-grafite-500">Ana Paula · agora</p>
        </div>
      </div>
      <div className="absolute -right-4 -bottom-4 flex items-center gap-2 rounded-2xl bg-grafite-900 px-3 py-2.5 text-white shadow-flutuante sm:-right-10">
        <IconePix tamanho={22} className="text-aprovado-500" />
        <div className="text-xs">
          <p className="font-bold">Pix recebido</p>
          <p className="text-grafite-300">R$ 240,00 de entrada</p>
        </div>
      </div>
    </div>
  )
}

function QrFalso() {
  // Padrão decorativo: não é um código Pix de verdade.
  const celulas = [0b1110101, 0b1010011, 0b1110110, 0b0001011, 0b1101101, 0b1011000, 0b1110111]
  return (
    <svg width="52" height="52" viewBox="0 0 7 7" className="shrink-0 rounded-md bg-white" aria-hidden shapeRendering="crispEdges">
      {celulas.flatMap((linha, y) =>
        Array.from({ length: 7 }, (_, x) =>
          (linha >> (6 - x)) & 1 ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#1b1f2a" /> : null,
        ),
      )}
    </svg>
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
      <div className="mt-12 grid gap-5 md:grid-cols-3">
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
    </section>
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
              'Marca Q3 Orça no rodapé do PDF',
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
            itens={['Tudo do plano Grátis', 'Seu logo e assinatura no PDF', 'Sem a marca Q3 Orça', 'Layouts de PDF extras', 'Relatórios do mês']}
            chamada={
              <span className="btn w-full cursor-default bg-white/10 text-white" aria-disabled>
                Em breve
              </span>
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
  const perguntas = [
    ['Preciso instalar alguma coisa?', 'Não. O Q3 Orça abre no navegador do celular. Se quiser, adicione à tela inicial e ele vira um app.'],
    ['Meu cliente precisa ter o app?', 'Não. Ele recebe um PDF ou um link no WhatsApp e abre em qualquer celular, sem cadastro.'],
    ['O Pix passa por vocês?', 'Não. O QR Code aponta direto para a sua chave Pix. O dinheiro cai na sua conta, sem intermediário e sem taxa.'],
    ['O orçamento tem valor fiscal?', 'Orçamento, recibo e garantia são documentos comerciais. Eles não substituem a nota fiscal quando ela for obrigatória.'],
    ['E se eu trocar de celular?', 'Seus dados ficam guardados na nuvem, ligados à sua conta. É só entrar de novo. Você também pode baixar uma cópia completa.'],
  ]
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
