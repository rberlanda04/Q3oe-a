import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LINK_PAGAMENTO_ANUAL, LINK_PAGAMENTO_MENSAL, PRECO_ANUAL, PRECO_MENSAL, WHATSAPP_VENDAS } from '../config'
import { registrarInteressePro } from '../data/repo'
import { DIAS_TESTE_PRO } from '../domain/plano'
import { useUsuario } from '../lib/auth'
import { registrarEvento } from '../lib/eventos'
import { linkWhatsApp } from '../pdf/compartilhar'
import { IconeCheck, IconeVoltar } from '../ui/Icones'
import { SeloPlano } from '../ui/SeloPlano'

const RECURSOS_PRO = [
  'Seu logo no orçamento, recibo, ordem de serviço e garantia',
  'Sua cor de marca nos documentos e no link do cliente',
  'Nome da empresa, razão social, site e Instagram no cabeçalho',
  'Sem a marca Q3 Orça no rodapé',
  'Página de aprovação com a sua cara',
]

export function Planos() {
  const { user, perfil, plano } = useUsuario()
  const [escolha, setEscolha] = useState<'mensal' | 'anual'>('anual')
  const [estado, setEstado] = useState<'livre' | 'enviando' | 'enviado' | 'erro'>('livre')

  async function quero() {
    setEstado('enviando')
    try {
      await registrarInteressePro(user.uid, {
        nome: perfil.nome,
        email: user.email ?? perfil.email,
        telefone: perfil.telefone,
        plano: escolha,
      })
      setEstado('enviado')
      registrarEvento('pro_pedido', { plano: escolha })
      const pagamento = escolha === 'anual' ? LINK_PAGAMENTO_ANUAL : LINK_PAGAMENTO_MENSAL
      if (pagamento) window.open(pagamento, '_blank', 'noopener')
      else if (WHATSAPP_VENDAS)
        window.open(
          linkWhatsApp(WHATSAPP_VENDAS, `Olá! Quero assinar o Q3 Orça Pro no plano ${escolha}. Meu e-mail de acesso é ${user.email ?? ''}.`),
          '_blank',
          'noopener',
        )
    } catch (erro) {
      console.error(erro)
      setEstado('erro')
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/perfil" className="inline-flex items-center gap-1.5 text-sm font-semibold text-grafite-500 hover:text-brasa-700">
        <IconeVoltar tamanho={16} /> Meus dados
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Sua marca em cada orçamento</h1>
          <p className="mt-1 text-grafite-600">Cliente confia mais em quem se apresenta como empresa.</p>
        </div>
        <SeloPlano plano={plano} />
      </div>

      {plano.motivo === 'teste' && (
        <p className="rounded-cartao bg-regua-100 p-4 text-sm">
          Você está no <strong>teste grátis do Pro</strong>. Faltam {plano.diasRestantes} {plano.diasRestantes === 1 ? 'dia' : 'dias'}. Depois disso,
          seus documentos voltam para o modelo grátis, e seu logo continua salvo para quando você assinar.
        </p>
      )}
      {plano.motivo === 'assinatura' && (
        <p className="rounded-cartao bg-aprovado-50 p-4 text-sm text-aprovado-700">
          Seu Pro está ativo até <strong>{new Date(plano.validoAte).toLocaleDateString('pt-BR')}</strong>. Obrigado por apoiar o Q3 Orça!
        </p>
      )}

      <section className="overflow-hidden rounded-cartao bg-grafite-900 text-white shadow-flutuante">
        <div className="p-6 sm:p-8">
          <p className="rotulo !text-brasa-400">Q3 Orça Pro</p>
          <ul className="mt-4 space-y-3">
            {RECURSOS_PRO.map((r) => (
              <li key={r} className="flex gap-3">
                <IconeCheck tamanho={20} strokeWidth={3} className="mt-0.5 shrink-0 text-brasa-400" /> {r}
              </li>
            ))}
          </ul>

          {plano.motivo !== 'assinatura' && (
            <>
              <div className="mt-8 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Forma de pagamento">
                <Opcao
                  ativa={escolha === 'anual'}
                  onClick={() => setEscolha('anual')}
                  titulo="Anual"
                  preco={PRECO_ANUAL}
                  detalhe="por ano · economize 44%"
                />
                <Opcao ativa={escolha === 'mensal'} onClick={() => setEscolha('mensal')} titulo="Mensal" preco={PRECO_MENSAL} detalhe="por mês" />
              </div>
              <button className="btn-primary mt-5 w-full !py-4 text-lg" disabled={estado === 'enviando'} onClick={quero}>
                {estado === 'enviando' ? 'Enviando...' : 'Quero o Pro'}
              </button>
              {estado === 'enviado' && (
                <p role="status" className="mt-3 rounded-xl bg-white/10 p-3 text-sm">
                  Pedido recebido! Vamos te chamar em {perfil.telefone ? 'seu WhatsApp' : 'seu e-mail'} para concluir a assinatura.
                </p>
              )}
              {estado === 'erro' && <p className="mt-3 text-sm text-brasa-300">Não foi possível enviar. Verifique sua conexão e tente de novo.</p>}
              {plano.motivo === 'gratis' && !plano.testeEncerrado && (
                <p className="mt-3 text-center text-sm text-grafite-300">Contas novas ganham {DIAS_TESTE_PRO} dias de Pro grátis.</p>
              )}
            </>
          )}
        </div>
      </section>

      <p className="text-center text-sm text-grafite-500">
        Continua grátis para sempre: orçamentos ilimitados, link de aprovação, Pix, recibo e garantia.
      </p>
    </div>
  )
}

function Opcao(props: { ativa: boolean; onClick: () => void; titulo: string; preco: string; detalhe: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={props.ativa}
      onClick={props.onClick}
      className={`rounded-2xl border-2 p-4 text-left transition ${props.ativa ? 'border-brasa-500 bg-white/10' : 'border-white/15 hover:border-white/40'}`}
    >
      <p className="text-sm font-semibold text-grafite-300">{props.titulo}</p>
      <p className="font-display text-2xl font-extrabold">{props.preco}</p>
      <p className="text-xs text-grafite-300">{props.detalhe}</p>
    </button>
  )
}
