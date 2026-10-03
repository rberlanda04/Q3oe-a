import { Link } from 'react-router-dom'
import { DIAS_PRO_BETA } from '../../config'
import { IconeCheck, IconeSeta } from '../../ui/Icones'
import { CabecalhoSite, RodapeSite, useTitulo } from './Moldura'

const TESTAR = [
  'Monte um orçamento de verdade, para um cliente real, com os itens da sua profissão.',
  'Envie pelo WhatsApp em PDF e também pelo link de aprovação.',
  'Peça para o cliente aprovar pelo link e veja o status mudar sozinho.',
  'Cadastre sua chave Pix e confira se o QR Code abre no app do banco.',
  'Registre um pagamento e mande o recibo.',
  'Coloque seu logo e sua cor em "Meus dados".',
]

/** Convite para a fase de testes: /beta */
export function Beta() {
  useTitulo('Fase de testes do Q3 Orça')
  const chamada = '/entrar?modo=criar&utm_source=beta&utm_medium=convite'
  return (
    <div>
      <CabecalhoSite links={false} />
      <main>
        <section className="mx-auto max-w-3xl px-5 pt-14 pb-10 text-center">
          <p className="inline-flex rounded-full bg-regua-300 px-3 py-1 text-sm font-bold text-grafite-900">Fase de testes</p>
          <h1 className="mt-5 text-4xl leading-tight font-extrabold sm:text-5xl">Ajude a construir o app de orçamento que você queria ter.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-grafite-600">
            O Q3 Orça está aberto para os primeiros profissionais. Você usa de graça, com todos os recursos, e conta o que achou. Cada sugestão vira
            melhoria.
          </p>
          <Link to={chamada} className="btn-primary mt-8 !px-8 !py-4 text-lg">
            Quero testar <IconeSeta tamanho={20} />
          </Link>
          <p className="mt-3 text-sm text-grafite-500">Sem cartão e sem cobrança. Leva 1 minuto para criar a conta.</p>
        </section>

        <section className="mx-auto grid max-w-5xl gap-4 px-5 pb-14 md:grid-cols-2">
          <article className="card !p-7">
            <h2 className="text-2xl font-extrabold">O que você ganha</h2>
            <ul className="mt-4 space-y-3">
              {[
                `Plano Pro grátis por ${DIAS_PRO_BETA} dias, com seu logo e sua cor nos documentos`,
                'Orçamentos ilimitados, link de aprovação, Pix, recibo e garantia',
                'Contato direto com quem faz o app: sua sugestão é lida',
                'Seus orçamentos e clientes continuam salvos depois dos testes',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <IconeCheck tamanho={20} strokeWidth={3} className="mt-0.5 shrink-0 text-aprovado-600" /> {t}
                </li>
              ))}
            </ul>
          </article>
          <article className="card !p-7">
            <h2 className="text-2xl font-extrabold">O que pedimos</h2>
            <ul className="mt-4 space-y-3">
              {[
                'Use em orçamentos reais, do seu dia a dia',
                'Conte o que achou pelo botão "Dar opinião", dentro do app',
                'Avise quando algo não funcionar, com o máximo de detalhe',
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brasa-500 text-xs font-bold text-white">•</span> {t}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto max-w-3xl px-5">
            <h2 className="text-3xl font-extrabold">O que testar primeiro</h2>
            <ol className="mt-6 space-y-3">
              {TESTAR.map((t, i) => (
                <li key={t} className="flex gap-4 rounded-xl bg-areia-100 p-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-grafite-900 font-display font-bold text-white">{i + 1}</span>
                  <span className="pt-1">{t}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-14">
          <h2 className="text-3xl font-extrabold">Bom saber</h2>
          <div className="mt-6 space-y-3">
            {(
              [
                ['É grátis mesmo?', `Sim. Durante os testes, nada é cobrado. O Pro fica liberado por ${DIAS_PRO_BETA} dias a partir do cadastro.`],
                ['E depois dos testes?', 'O plano grátis continua grátis para sempre. O Pro passa a ser opcional, e você decide se quer assinar.'],
                ['Pode ter falhas?', 'Pode. É uma versão de testes. Se algo der errado, avise pelo "Dar opinião" e corrigimos o quanto antes.'],
                ['Meus dados ficam seguros?', 'Sim. Só você vê seus orçamentos e clientes, e pode baixar ou apagar tudo quando quiser em "Meus dados".'],
              ] as [string, string][]
            ).map(([p, r]) => (
              <details key={p} className="group card !p-0 [&_summary::-webkit-details-marker]:hidden" open>
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 font-semibold">{p}</summary>
                <p className="px-6 pb-5 text-grafite-600">{r}</p>
              </details>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to={chamada} className="btn-primary !px-8 !py-4 text-lg">
              Criar minha conta de teste <IconeSeta tamanho={20} />
            </Link>
          </div>
        </section>
      </main>
      <RodapeSite />
    </div>
  )
}
