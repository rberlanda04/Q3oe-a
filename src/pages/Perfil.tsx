import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { exportarDados, salvarPerfil } from '../data/repo'
import { contraste, coresDoDocumento, hexValido } from '../domain/cores'
import { cnpjValido } from '../domain/empresa'
import { detectarTipoChave, gerarPixCopiaECola, TIPOS_CHAVE, type TipoChavePix } from '../domain/pix'
import type { Perfil as PerfilTipo } from '../domain/types'
import { EMAIL_CONTATO, WHATSAPP_SUPORTE } from '../config'
import { useSessao, useUsuario } from '../lib/auth'
import { linkWhatsApp } from '../pdf/compartilhar'
import { buscarEmpresa } from '../lib/cnpj'
import { ErroImagem, prepararLogo } from '../lib/imagem'
import { ExcluirConta } from '../ui/ExcluirConta'
import { IconeBusca, IconeCheck, IconeEscudo, IconeLixeira, IconeWhatsApp } from '../ui/Icones'
import { SeloPlano } from '../ui/SeloPlano'

type Campos = Pick<
  PerfilTipo,
  | 'nome'
  | 'razaoSocial'
  | 'documento'
  | 'telefone'
  | 'email'
  | 'endereco'
  | 'cidade'
  | 'site'
  | 'instagram'
  | 'pix'
  | 'logo'
  | 'corMarca'
  | 'textoPagamento'
  | 'textoGarantia'
>

const CHAVES: (keyof Campos)[] = [
  'nome',
  'razaoSocial',
  'documento',
  'telefone',
  'email',
  'endereco',
  'cidade',
  'site',
  'instagram',
  'pix',
  'logo',
  'corMarca',
  'textoPagamento',
  'textoGarantia',
]

/** Cores sugeridas para a marca do profissional. Todas legíveis sobre branco. */
const CORES_SUGERIDAS = ['#c43e0c', '#1f418f', '#15703d', '#6d28d9', '#b91c1c', '#0f766e', '#a16207', '#1b1f2a']

export function Perfil() {
  const { user, perfil, plano } = useUsuario()
  const { admin } = useSessao()
  const [dados, setDados] = useState<Campos>(() => {
    const inicial = {} as Campos
    for (const chave of CHAVES) inicial[chave] = perfil[chave] ?? ''
    return inicial
  })
  const [pixTipo, setPixTipo] = useState<TipoChavePix | ''>(perfil.pixTipo ?? '')
  const [salvo, setSalvo] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [avisoCnpj, setAvisoCnpj] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [erroLogo, setErroLogo] = useState('')
  const entradaLogo = useRef<HTMLInputElement>(null)

  const tipoEfetivo = pixTipo || (dados.pix.trim() ? detectarTipoChave(dados.pix) : '')
  const alterar = (parcial: Partial<Campos>) => {
    setSalvo(false)
    setDados((atual) => ({ ...atual, ...parcial }))
  }
  const podeBuscarCnpj = cnpjValido(dados.documento)

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    // Salva só os campos do formulário, sem tocar no contador nem nos preços salvos.
    const limpo: Partial<PerfilTipo> = Object.fromEntries(CHAVES.map((chave) => [chave, String(dados[chave] ?? '').trim()]))
    limpo.instagram = (limpo.instagram ?? '').replace(/^@/, '')
    if (tipoEfetivo) limpo.pixTipo = tipoEfetivo
    salvarPerfil(user.uid, limpo)
    setSalvo(true)
  }

  async function preencherPeloCnpj() {
    setBuscando(true)
    setAvisoCnpj(null)
    try {
      const empresa = await buscarEmpresa(dados.documento)
      // Só preenche o que veio do cadastro, sem apagar o que a pessoa já digitou.
      alterar({
        nome: empresa.nome || dados.nome,
        razaoSocial: empresa.razaoSocial || dados.razaoSocial,
        documento: empresa.documento,
        endereco: empresa.endereco || dados.endereco,
        cidade: empresa.cidade || dados.cidade,
        telefone: dados.telefone || empresa.telefone,
        email: dados.email || empresa.email,
      })
      setAvisoCnpj({
        tipo: 'ok',
        texto: `Dados públicos preenchidos${empresa.situacao ? `. Situação na Receita: ${empresa.situacao}` : ''}. Confira e salve.`,
      })
    } catch (erro) {
      setAvisoCnpj({ tipo: 'erro', texto: erro instanceof Error ? erro.message : 'Não foi possível consultar o CNPJ.' })
    } finally {
      setBuscando(false)
    }
  }

  async function escolherLogo(arquivo: File | undefined) {
    if (!arquivo) return
    setErroLogo('')
    try {
      alterar({ logo: await prepararLogo(arquivo) })
    } catch (erro) {
      setErroLogo(erro instanceof ErroImagem ? erro.message : 'Não foi possível usar esta imagem.')
    } finally {
      if (entradaLogo.current) entradaLogo.current.value = ''
    }
  }

  async function exportar() {
    setExportando(true)
    try {
      const conteudo = await exportarDados(user.uid, perfil)
      const blob = new Blob([JSON.stringify(conteudo, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `meus-dados-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } catch (erro) {
      console.error(erro)
      alert('Não foi possível exportar agora. Verifique sua conexão.')
    } finally {
      setExportando(false)
    }
  }

  const cor = coresDoDocumento(dados.corMarca, true)
  const corPoucoLegivel = hexValido(dados.corMarca) && contraste(dados.corMarca, '#ffffff') < 4.5

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Meus dados</h1>
          <p className="mt-1 text-grafite-600">É assim que seu cliente vai ver você nos orçamentos, recibos e no link.</p>
        </div>
        <SeloPlano plano={plano} />
      </div>

      <form onSubmit={enviar} className="space-y-6">
        <Secao titulo="Sua empresa" descricao="Tem CNPJ? Digite e puxe os dados públicos do cadastro da Receita Federal.">
          <div>
            <label htmlFor="documento">CPF ou CNPJ</label>
            <div className="flex gap-2">
              <input
                id="documento"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                value={dados.documento}
                onChange={(e) => alterar({ documento: e.target.value })}
              />
              <button
                type="button"
                className="btn-escuro shrink-0 !px-4 text-sm"
                disabled={!podeBuscarCnpj || buscando}
                onClick={preencherPeloCnpj}
                title={podeBuscarCnpj ? 'Buscar dados públicos do CNPJ' : 'Digite um CNPJ válido'}
              >
                <IconeBusca tamanho={16} /> {buscando ? 'Buscando...' : 'Buscar CNPJ'}
              </button>
            </div>
            {avisoCnpj && (
              <p
                role="status"
                className={`mt-2 rounded-xl px-3 py-2 text-sm ${avisoCnpj.tipo === 'ok' ? 'bg-aprovado-50 text-aprovado-700' : 'bg-alerta-50 text-alerta-600'}`}
              >
                {avisoCnpj.texto}
              </p>
            )}
          </div>
          <Campo id="nome" rotulo="Nome da empresa ou seu nome" dica="O nome que aparece em destaque. Pode ser o nome fantasia.">
            <input id="nome" value={dados.nome} onChange={(e) => alterar({ nome: e.target.value })} />
          </Campo>
          <Campo id="razaoSocial" rotulo="Razão social" dica="Opcional. Aparece em letras menores, abaixo do nome.">
            <input id="razaoSocial" value={dados.razaoSocial} onChange={(e) => alterar({ razaoSocial: e.target.value })} />
          </Campo>
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="endereco" rotulo="Endereço">
              <input id="endereco" value={dados.endereco} onChange={(e) => alterar({ endereco: e.target.value })} />
            </Campo>
            <Campo id="cidade" rotulo="Cidade e estado" dica="Ex.: Campinas - SP. Também vai no código Pix.">
              <input id="cidade" value={dados.cidade} onChange={(e) => alterar({ cidade: e.target.value })} />
            </Campo>
          </div>
        </Secao>

        <Secao
          titulo="Sua marca"
          pro
          descricao={
            plano.pro
              ? 'Seu logo e sua cor nos orçamentos, recibos e no link do cliente, sem a marca Q3 Orça.'
              : 'Com o Pro, seu logo e sua cor aparecem nos documentos e a marca Q3 Orça sai do rodapé.'
          }
        >
          <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
            <div>
              <p className="mb-1.5 text-sm font-semibold text-grafite-700">Logo</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => entradaLogo.current?.click()}
                  className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-areia-400 bg-[conic-gradient(#f3ece1_25%,#fff_0_50%,#f3ece1_0_75%,#fff_0)] bg-[length:16px_16px] text-center text-xs font-semibold text-grafite-500 hover:border-brasa-400"
                  aria-label={dados.logo ? 'Trocar logo' : 'Enviar logo'}
                >
                  {dados.logo ? <img src={dados.logo} alt="Seu logo" className="max-h-full max-w-full object-contain p-2" /> : 'Toque para enviar'}
                </button>
                <div className="space-y-2 text-sm">
                  <button type="button" className="btn-secondary !px-3 !py-2 text-sm" onClick={() => entradaLogo.current?.click()}>
                    {dados.logo ? 'Trocar logo' : 'Enviar logo'}
                  </button>
                  {dados.logo && (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-alerta-600"
                      onClick={() => alterar({ logo: '' })}
                    >
                      <IconeLixeira tamanho={16} /> Remover
                    </button>
                  )}
                  <p className="max-w-40 text-xs text-grafite-500">PNG com fundo transparente fica melhor. Ajustamos o tamanho.</p>
                </div>
              </div>
              <input
                ref={entradaLogo}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => escolherLogo(e.target.files?.[0])}
              />
              {erroLogo && <p className="mt-2 text-sm text-alerta-600">{erroLogo}</p>}
            </div>

            <div>
              <p className="mb-1.5 text-sm font-semibold text-grafite-700">Cor da marca</p>
              <div className="flex flex-wrap items-center gap-2">
                {CORES_SUGERIDAS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`Usar a cor ${c}`}
                    aria-pressed={dados.corMarca === c}
                    onClick={() => alterar({ corMarca: c })}
                    className={`h-9 w-9 rounded-full ring-offset-2 transition ${dados.corMarca === c ? 'ring-2 ring-grafite-900' : ''}`}
                    style={{ background: c }}
                  />
                ))}
                <label className="!mb-0 flex h-9 cursor-pointer items-center gap-2 rounded-full border border-areia-300 bg-white pr-3 pl-1 text-sm font-medium">
                  <input
                    type="color"
                    className="!h-7 !w-7 cursor-pointer !rounded-full !border-0 !p-0"
                    value={hexValido(dados.corMarca) ? dados.corMarca : '#c43e0c'}
                    onChange={(e) => alterar({ corMarca: e.target.value })}
                  />
                  Outra
                </label>
                {dados.corMarca && (
                  <button type="button" className="text-sm text-grafite-500 underline" onClick={() => alterar({ corMarca: '' })}>
                    Usar padrão
                  </button>
                )}
              </div>
              {corPoucoLegivel && (
                <p className="mt-2 text-xs text-grafite-600">
                  Essa cor é clara para texto. Ela vai nas linhas e destaques, e os títulos saem em grafite para continuar legíveis.
                </p>
              )}

              <p className="mt-5 mb-1.5 text-sm font-semibold text-grafite-700">Prévia do cabeçalho</p>
              <div className="rounded-xl border border-areia-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3 border-b-[3px] pb-3" style={{ borderColor: cor.destaque }}>
                  <div className="flex min-w-0 items-center gap-3">
                    {dados.logo && <img src={dados.logo} alt="" className="h-12 w-12 shrink-0 object-contain" />}
                    <div className="min-w-0">
                      <p className="truncate font-bold">{dados.nome || 'Nome da sua empresa'}</p>
                      <p className="truncate text-xs text-grafite-500">{dados.razaoSocial || dados.documento || 'CNPJ ou CPF'}</p>
                    </div>
                  </div>
                  <p className="shrink-0 text-lg font-extrabold" style={{ color: cor.texto }}>
                    ORÇAMENTO
                  </p>
                </div>
              </div>
            </div>
          </div>
          {!plano.pro && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-grafite-900 p-4 text-white">
              <p className="text-sm">Você pode configurar agora. A marca entra nos documentos assim que o Pro estiver ativo.</p>
              <Link to="/planos" className="btn-primary !py-2 text-sm">
                Conhecer o Pro
              </Link>
            </div>
          )}
        </Secao>

        <Secao titulo="Contato e redes" descricao="Seu cliente usa isso para falar com você e conhecer seu trabalho.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="telefone" rotulo="WhatsApp">
              <input id="telefone" type="tel" value={dados.telefone} onChange={(e) => alterar({ telefone: e.target.value })} />
            </Campo>
            <Campo id="email" rotulo="E-mail">
              <input id="email" type="email" value={dados.email} onChange={(e) => alterar({ email: e.target.value })} />
            </Campo>
            <Campo id="site" rotulo="Site">
              <input id="site" placeholder="suaempresa.com.br" value={dados.site} onChange={(e) => alterar({ site: e.target.value })} />
            </Campo>
            <Campo id="instagram" rotulo="Instagram">
              <input id="instagram" placeholder="@suaempresa" value={dados.instagram} onChange={(e) => alterar({ instagram: e.target.value })} />
            </Campo>
          </div>
        </Secao>

        <Secao titulo="Pix" descricao="Com a chave, o orçamento sai com QR Code para o cliente pagar direto na sua conta.">
          <Campo id="pix" rotulo="Chave Pix">
            <input id="pix" value={dados.pix} onChange={(e) => alterar({ pix: e.target.value })} />
          </Campo>
          {dados.pix.trim() && (
            <div>
              <label htmlFor="pix-tipo">Tipo da chave</label>
              <select id="pix-tipo" value={tipoEfetivo} onChange={(e) => setPixTipo(e.target.value as TipoChavePix)}>
                {TIPOS_CHAVE.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.rotulo}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-grafite-500">
                Confira o tipo. Um celular salvo como CPF, por exemplo, gera um QR Code que o banco recusa.
              </p>
              {tipoEfetivo && (
                <p className="mt-1 text-xs break-all text-grafite-400">
                  Prévia do código: {gerarPixCopiaECola({ chave: dados.pix, tipo: tipoEfetivo, nome: dados.nome, cidade: dados.cidade })}
                </p>
              )}
            </div>
          )}
        </Secao>

        <Secao titulo="Textos padrão" descricao="Entram sozinhos em todo orçamento novo. Você pode mudar em cada um.">
          <Campo id="textoPagamento" rotulo="Condições de pagamento">
            <textarea id="textoPagamento" rows={3} value={dados.textoPagamento} onChange={(e) => alterar({ textoPagamento: e.target.value })} />
          </Campo>
          <Campo id="textoGarantia" rotulo="Garantia" dica="Em branco, usamos o texto do modelo de cada profissão.">
            <textarea id="textoGarantia" rows={3} value={dados.textoGarantia} onChange={(e) => alterar({ textoGarantia: e.target.value })} />
          </Campo>
        </Secao>

        <div className="sticky bottom-24 z-10 md:bottom-4">
          <button className="btn-primary w-full shadow-flutuante">
            {salvo ? (
              <>
                <IconeCheck tamanho={18} strokeWidth={3} /> Salvo
              </>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </form>

      {(WHATSAPP_SUPORTE || EMAIL_CONTATO) && (
        <section className="card space-y-3">
          <h2 className="text-lg font-bold">Precisa de ajuda?</h2>
          <p className="text-sm text-grafite-600">Fale com a gente. Respondemos em horário comercial.</p>
          <div className="flex flex-wrap gap-2">
            {WHATSAPP_SUPORTE && (
              <a
                className="btn-whatsapp !py-2.5 text-sm"
                href={linkWhatsApp(WHATSAPP_SUPORTE, 'Olá! Preciso de ajuda com o Q3 Orça.')}
                target="_blank"
                rel="noreferrer"
              >
                <IconeWhatsApp tamanho={16} /> WhatsApp
              </a>
            )}
            {EMAIL_CONTATO && (
              <a className="btn-secondary !py-2.5 text-sm" href={`mailto:${EMAIL_CONTATO}?subject=Ajuda com o Q3 Orça`}>
                {EMAIL_CONTATO}
              </a>
            )}
          </div>
        </section>
      )}

      <section className="card space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <IconeEscudo tamanho={20} /> Seus dados são seus
        </h2>
        <p className="text-sm text-grafite-600">
          Baixe uma cópia completa de orçamentos, clientes e itens, em formato JSON. Veja como cuidamos deles na{' '}
          <Link to="/privacidade" className="font-semibold text-brasa-700">
            política de privacidade
          </Link>
          .
        </p>
        <button className="btn-secondary w-full" disabled={exportando} onClick={exportar}>
          {exportando ? 'Preparando...' : 'Baixar meus dados'}
        </button>
        <div className="border-t border-areia-200 pt-4">
          <ExcluirConta />
        </div>
      </section>

      {admin && (
        <Link to="/admin" className="btn-escuro w-full">
          Abrir painel de administração
        </Link>
      )}
    </div>
  )
}

function Secao({ titulo, descricao, pro, children }: { titulo: string; descricao?: string; pro?: boolean; children: ReactNode }) {
  return (
    <section className="card space-y-4">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          {titulo}
          {pro && <span className="rounded-full bg-grafite-900 px-2 py-0.5 text-[11px] font-bold tracking-wide text-brasa-300">PRO</span>}
        </h2>
        {descricao && <p className="text-sm text-grafite-600">{descricao}</p>}
      </div>
      {children}
    </section>
  )
}

function Campo({ id, rotulo, dica, children }: { id: string; rotulo: string; dica?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id}>{rotulo}</label>
      {children}
      {dica && <p className="mt-1 text-xs text-grafite-500">{dica}</p>}
    </div>
  )
}
