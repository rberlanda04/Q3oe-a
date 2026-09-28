import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  EMAIL_CONTATO,
  EMPRESA_CIDADE,
  EMPRESA_CNPJ,
  EMPRESA_RAZAO_SOCIAL,
  PRECO_ANUAL,
  PRECO_MENSAL,
  SITE_URL,
  VIGENCIA_DOCUMENTOS_LEGAIS,
  WHATSAPP_SUPORTE,
} from '../../config'
import { DIAS_TESTE_PRO } from '../../domain/plano'
import { CabecalhoSite, RodapeSite, useTitulo } from './Moldura'

/** Quem opera o serviço, conforme a configuração. */
function empresa(): string {
  if (!EMPRESA_RAZAO_SOCIAL) return 'os responsáveis pelo Q3 Orça'
  return `${EMPRESA_RAZAO_SOCIAL}${EMPRESA_CNPJ ? `, inscrita no CNPJ ${EMPRESA_CNPJ}` : ''}${EMPRESA_CIDADE ? `, com sede em ${EMPRESA_CIDADE}` : ''}`
}

function Contato() {
  const telefone = WHATSAPP_SUPORTE.replace(/^55/, '')
  return (
    <>
      {EMAIL_CONTATO && (
        <>
          pelo e-mail{' '}
          <a className="font-semibold text-brasa-700" href={`mailto:${EMAIL_CONTATO}`}>
            {EMAIL_CONTATO}
          </a>
        </>
      )}
      {EMAIL_CONTATO && WHATSAPP_SUPORTE && ' ou '}
      {WHATSAPP_SUPORTE && (
        <>
          pelo WhatsApp{' '}
          <a className="font-semibold text-brasa-700" href={`https://wa.me/${WHATSAPP_SUPORTE}`}>
            ({telefone.slice(0, 2)}) {telefone.slice(2)}
          </a>
        </>
      )}
      {!EMAIL_CONTATO && !WHATSAPP_SUPORTE && 'pelos canais de atendimento informados no site'}
    </>
  )
}

function Documento({ titulo, resumo, children }: { titulo: string; resumo: string; children: ReactNode }) {
  return (
    <div>
      <CabecalhoSite links={false} />
      <main className="mx-auto max-w-3xl px-5 py-14">
        <p className="rotulo !text-brasa-700">Vigente desde {VIGENCIA_DOCUMENTOS_LEGAIS}</p>
        <h1 className="mt-2 text-4xl font-extrabold">{titulo}</h1>
        <p className="mt-4 rounded-cartao bg-white p-5 text-grafite-700 shadow-cartao">{resumo}</p>
        <div className="mt-10 space-y-8 text-grafite-700 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-grafite-900 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_p]:leading-relaxed [&_ul]:space-y-2">
          {children}
        </div>
      </main>
      <RodapeSite />
    </div>
  )
}

export function Termos() {
  useTitulo('Termos de uso · Q3 Orça')
  return (
    <Documento
      titulo="Termos de uso"
      resumo="Em resumo: o Q3 Orça ajuda você a montar e enviar orçamentos. O plano grátis não tem prazo. O Pro é uma assinatura que você pode cancelar quando quiser. O conteúdo dos orçamentos e o relacionamento com seus clientes são de sua responsabilidade."
    >
      <section>
        <h2>1. Quem somos e o que oferecemos</h2>
        <p>
          O Q3 Orça, disponível em {SITE_URL}, é operado por {empresa()}. Ele permite criar orçamentos, enviar por WhatsApp ou link,
          receber aprovação do cliente, gerar QR Code Pix, recibos, ordens de serviço e termos de garantia.
        </p>
        <p className="mt-3">Ao criar uma conta, você declara ter lido e concordado com estes termos e com a <Link className="font-semibold text-brasa-700" to="/privacidade">Política de privacidade</Link>.</p>
      </section>

      <section>
        <h2>2. Conta</h2>
        <ul>
          <li>Você precisa ter 18 anos ou mais e informar dados verdadeiros.</li>
          <li>Você é responsável por manter sua senha em segredo e por tudo o que for feito na sua conta.</li>
          <li>Você pode excluir sua conta a qualquer momento em "Meus dados". A exclusão apaga seus orçamentos, clientes e itens.</li>
        </ul>
      </section>

      <section>
        <h2>3. Planos e pagamento</h2>
        <ul>
          <li>O plano grátis permite orçamentos ilimitados e não tem prazo de validade. Documentos do plano grátis mostram a marca Q3 Orça.</li>
          <li>
            O plano Pro custa {PRECO_MENSAL} por mês ou {PRECO_ANUAL} por ano. Os valores podem mudar, com aviso prévio de 30 dias para quem já
            assina.
          </li>
          <li>Contas novas ganham {DIAS_TESTE_PRO} dias de Pro grátis, sem cobrança automática ao final.</li>
          <li>
            Você pode desistir da assinatura em até 7 dias após a contratação e receber o valor pago de volta, conforme o artigo 49 do Código
            de Defesa do Consumidor.
          </li>
          <li>Você pode cancelar quando quiser. O Pro continua ativo até o fim do período já pago, sem renovação.</li>
        </ul>
      </section>

      <section>
        <h2>4. Suas responsabilidades</h2>
        <ul>
          <li>Os preços, descrições, prazos e garantias que você coloca nos orçamentos são definidos e assumidos por você.</li>
          <li>
            Orçamento, recibo, ordem de serviço e termo de garantia são documentos comerciais. Eles não substituem a nota fiscal quando ela for
            obrigatória.
          </li>
          <li>
            Você é responsável pelos dados dos seus clientes que cadastra no app, e deve usá-los apenas para atender esses clientes, conforme a
            LGPD.
          </li>
          <li>É proibido usar o serviço para fraude, cobrança indevida, envio de mensagens em massa não solicitadas ou qualquer fim ilegal.</li>
        </ul>
      </section>

      <section>
        <h2>5. Pagamentos entre você e seus clientes</h2>
        <p>
          O QR Code Pix aponta diretamente para a chave Pix que você cadastrou. O Q3 Orça não recebe, não intermedia e não guarda esses
          valores. Confira sempre se a chave está correta.
        </p>
      </section>

      <section>
        <h2>6. Link de aprovação</h2>
        <p>
          O link de aprovação pode ser aberto por qualquer pessoa que o receba. Envie apenas para o seu cliente. Ao excluir o orçamento, o link
          deixa de funcionar.
        </p>
      </section>

      <section>
        <h2>7. Disponibilidade e limites</h2>
        <ul>
          <li>Trabalhamos para manter o serviço no ar, mas podem ocorrer interrupções para manutenção ou por falhas de terceiros.</li>
          <li>Recomendamos baixar periodicamente uma cópia dos seus dados em "Meus dados".</li>
          <li>
            Não respondemos por negócios fechados ou perdidos, nem por valores cobrados de clientes. Isso não limita os direitos garantidos
            pelo Código de Defesa do Consumidor.
          </li>
        </ul>
      </section>

      <section>
        <h2>8. Suspensão</h2>
        <p>Podemos suspender contas que violem estes termos, avisando o motivo sempre que possível.</p>
      </section>

      <section>
        <h2>9. Mudanças e contato</h2>
        <p>
          Se estes termos mudarem, avisaremos no app e atualizaremos a data de vigência. Dúvidas podem ser enviadas <Contato />.
        </p>
        <p className="mt-3">Fica eleito o foro do domicílio do consumidor para resolver qualquer questão sobre estes termos.</p>
      </section>
    </Documento>
  )
}

export function Privacidade() {
  useTitulo('Política de privacidade · Q3 Orça')
  return (
    <Documento
      titulo="Política de privacidade"
      resumo="Em resumo: guardamos só o necessário para o app funcionar, não vendemos dados e você pode baixar ou apagar tudo a qualquer momento. Os dados dos seus clientes são seus: nós apenas os armazenamos para você."
    >
      <section>
        <h2>1. Quem trata os dados</h2>
        <p>
          O Q3 Orça é operado por {empresa()}, que é a controladora dos dados da sua conta. Para falar com o encarregado de dados pessoais,
          entre em contato <Contato />.
        </p>
        <p className="mt-3">
          Os dados dos seus clientes, que você cadastra nos orçamentos, são controlados por você. Nesse caso, o Q3 Orça atua como operador:
          guarda e processa esses dados apenas para prestar o serviço a você.
        </p>
      </section>

      <section>
        <h2>2. Quais dados guardamos</h2>
        <ul>
          <li><strong>Conta:</strong> e-mail e, se você entrar com Google, nome e foto do perfil do Google.</li>
          <li>
            <strong>Perfil profissional:</strong> nome, razão social, CPF ou CNPJ, telefone, e-mail, endereço, cidade, site, Instagram, chave
            Pix, logo e cor da marca, conforme você preencher.
          </li>
          <li><strong>Seus clientes:</strong> nome, telefone e endereço do serviço.</li>
          <li><strong>Orçamentos e pagamentos:</strong> itens, valores, condições, status e pagamentos registrados.</li>
          <li><strong>Resposta do cliente:</strong> quando ele aprova ou recusa pelo link, guardamos a resposta, o nome informado e o horário.</li>
          <li><strong>Pedido do Pro:</strong> nome, e-mail, telefone e plano escolhido, para entrarmos em contato.</li>
          <li><strong>Uso do site:</strong> páginas visitadas e ações como "orçamento enviado", sem o conteúdo dos orçamentos.</li>
        </ul>
      </section>

      <section>
        <h2>3. Para que usamos</h2>
        <ul>
          <li>Prestar o serviço: montar, enviar e acompanhar orçamentos, com base na execução do contrato.</li>
          <li>Atender pedidos de assinatura e de suporte.</li>
          <li>Entender o uso do produto para melhorá-lo, com base no nosso legítimo interesse.</li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>
        <p className="mt-3">Não vendemos dados e não usamos os dados dos seus clientes para marketing.</p>
      </section>

      <section>
        <h2>4. Com quem compartilhamos</h2>
        <ul>
          <li>
            <strong>Google Firebase:</strong> hospedagem, login e banco de dados. Os dados podem ser armazenados em servidores no Brasil ou no
            exterior, com as garantias contratuais do Google.
          </li>
          <li><strong>Google Analytics:</strong> estatísticas de uso do site, com identificadores de navegador.</li>
          <li><strong>Google Fonts:</strong> as fontes do site, o que envia seu endereço IP ao Google.</li>
          <li>
            <strong>BrasilAPI:</strong> quando você usa "Buscar CNPJ", o número é enviado a esse serviço para consultar o cadastro público da
            Receita Federal.
          </li>
          <li><strong>Quem recebe o link:</strong> o link de um orçamento mostra seus dados profissionais e o conteúdo daquele orçamento.</li>
          <li><strong>Autoridades:</strong> quando houver obrigação legal ou ordem judicial.</li>
        </ul>
      </section>

      <section>
        <h2>5. Por quanto tempo</h2>
        <p>
          Os dados ficam guardados enquanto sua conta existir. Ao excluir a conta, apagamos perfil, orçamentos, clientes, itens e links. Os
          registros de assinatura podem ser mantidos pelo prazo exigido pela legislação fiscal.
        </p>
      </section>

      <section>
        <h2>6. Seus direitos</h2>
        <p>Pela LGPD, você pode, a qualquer momento:</p>
        <ul className="mt-3">
          <li>Confirmar e acessar seus dados. Em "Meus dados", use "Baixar meus dados".</li>
          <li>Corrigir dados, editando seu perfil, clientes e orçamentos.</li>
          <li>Excluir sua conta e seus dados, em "Meus dados", na opção "Excluir minha conta".</li>
          <li>Pedir informações sobre compartilhamento, revogar consentimentos e se opor a tratamentos. Fale conosco <Contato />.</li>
          <li>Reclamar à Autoridade Nacional de Proteção de Dados (ANPD).</li>
        </ul>
      </section>

      <section>
        <h2>7. Segurança</h2>
        <p>
          O acesso é protegido por login, a conexão é criptografada e as regras do banco de dados impedem que uma conta veja os dados de outra.
          Nenhum sistema é totalmente imune a falhas. Se ocorrer um incidente que afete seus dados, avisaremos você e a ANPD, como manda a lei.
        </p>
      </section>

      <section>
        <h2>8. Armazenamento no aparelho</h2>
        <p>
          Para funcionar sem internet, o app guarda uma cópia dos seus dados no navegador do seu aparelho. Ao sair da conta em um aparelho
          compartilhado, limpe os dados do navegador.
        </p>
      </section>

      <section>
        <h2>9. Mudanças</h2>
        <p>Se esta política mudar, avisaremos no app e atualizaremos a data de vigência.</p>
      </section>
    </Documento>
  )
}
