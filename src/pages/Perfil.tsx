import { useState, type FormEvent } from 'react'
import { exportarDados, salvarPerfil } from '../data/repo'
import { detectarTipoChave, gerarPixCopiaECola, TIPOS_CHAVE, type TipoChavePix } from '../domain/pix'
import type { Perfil as PerfilTipo } from '../domain/types'
import { useUsuario } from '../lib/auth'

type CamposTexto = Omit<PerfilTipo, 'proximoNumero' | 'precosSalvos' | 'pixTipo'>

const CAMPOS: { chave: keyof CamposTexto; rotulo: string; tipo?: string; dica?: string; longo?: boolean }[] = [
  { chave: 'nome', rotulo: 'Nome ou nome da empresa' },
  { chave: 'documento', rotulo: 'CPF ou CNPJ', dica: 'Opcional, mas passa mais confiança.' },
  { chave: 'telefone', rotulo: 'WhatsApp', tipo: 'tel' },
  { chave: 'email', rotulo: 'E-mail', tipo: 'email' },
  { chave: 'endereco', rotulo: 'Endereço' },
  { chave: 'cidade', rotulo: 'Cidade e estado', dica: 'Ex.: Campinas - SP. A cidade também vai no código Pix.' },
  { chave: 'pix', rotulo: 'Chave Pix', dica: 'Com ela, o orçamento sai com QR Code para o cliente pagar.' },
  { chave: 'textoPagamento', rotulo: 'Condições de pagamento padrão', longo: true },
  { chave: 'textoGarantia', rotulo: 'Garantia padrão', dica: 'Em branco, usamos o texto do modelo de cada profissão.', longo: true },
]

export function Perfil() {
  const { user, perfil } = useUsuario()
  const [dados, setDados] = useState<CamposTexto>(() => {
    const inicial = {} as CamposTexto
    for (const { chave } of CAMPOS) inicial[chave] = perfil[chave] ?? ''
    return inicial
  })
  const [pixTipo, setPixTipo] = useState<TipoChavePix | ''>(perfil.pixTipo ?? '')
  const [salvo, setSalvo] = useState(false)
  const [exportando, setExportando] = useState(false)

  const tipoEfetivo = pixTipo || (dados.pix.trim() ? detectarTipoChave(dados.pix) : '')

  function enviar(evento: FormEvent) {
    evento.preventDefault()
    // Salva só os campos do formulário, sem tocar no contador nem nos preços salvos.
    const limpo: Partial<PerfilTipo> = Object.fromEntries(CAMPOS.map(({ chave }) => [chave, String(dados[chave] ?? '').trim()]))
    if (tipoEfetivo) limpo.pixTipo = tipoEfetivo
    salvarPerfil(user.uid, limpo)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
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

  return (
    <div className="space-y-5">
      <form onSubmit={enviar} className="space-y-5">
        <div>
          <h1 className="text-xl font-bold">Meus dados</h1>
          <p className="mt-1 text-grafite-600">Essas informações aparecem no cabeçalho dos seus orçamentos e recibos.</p>
        </div>
        <div className="card space-y-4">
          {CAMPOS.map((campo) => (
            <div key={campo.chave}>
              <label htmlFor={campo.chave}>{campo.rotulo}</label>
              {campo.longo ? (
                <textarea
                  id={campo.chave}
                  rows={3}
                  value={dados[campo.chave]}
                  onChange={(e) => setDados({ ...dados, [campo.chave]: e.target.value })}
                />
              ) : (
                <input
                  id={campo.chave}
                  type={campo.tipo ?? 'text'}
                  value={dados[campo.chave]}
                  onChange={(e) => setDados({ ...dados, [campo.chave]: e.target.value })}
                />
              )}
              {campo.dica && <p className="mt-1 text-xs text-grafite-500">{campo.dica}</p>}
              {campo.chave === 'pix' && dados.pix.trim() && (
                <div className="mt-2">
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
                      Prévia do código:{' '}
                      {gerarPixCopiaECola({ chave: dados.pix, tipo: tipoEfetivo, nome: dados.nome, cidade: dados.cidade })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <button className="btn-primary w-full">{salvo ? 'Salvo ✓' : 'Salvar'}</button>
      </form>

      <section className="card space-y-2">
        <h2 className="font-semibold">Seus dados são seus</h2>
        <p className="text-sm text-grafite-600">Baixe uma cópia completa de orçamentos, clientes e itens, em formato JSON.</p>
        <button className="btn-secondary w-full" disabled={exportando} onClick={exportar}>
          {exportando ? 'Preparando...' : 'Baixar meus dados'}
        </button>
      </section>
    </div>
  )
}
