import type { ReactElement } from 'react'
import { calcularTotais } from '../domain/calc'
import { pixDoOrcamento } from '../domain/cobranca'
import { formatarBRL } from '../domain/money'
import type { Orcamento, Pagamento, PerfilPublico } from '../domain/types'
import type { PixPdf, TipoDocumento } from './OrcamentoPdf'

/** No plano grátis, os documentos levam "feito com Q3 Orça" no rodapé. O Pro remove. */
const marcaDagua = (perfil: PerfilPublico) => !perfil.pro

function nomeArquivo(prefixo: string, orcamento: Orcamento, sufixo = ''): string {
  const cliente = orcamento.cliente.nome.trim().replace(/[^\p{L}\d]+/gu, '-').toLowerCase()
  return `${prefixo}-${orcamento.numero}${sufixo}${cliente ? `-${cliente}` : ''}.pdf`
}

async function renderizar(documento: ReactElement, nome: string): Promise<File> {
  const { pdf } = await import('@react-pdf/renderer')
  // O tipo exige um <Document> na raiz; todos os nossos componentes retornam um.
  const blob = await pdf(documento as Parameters<typeof pdf>[0]).toBlob()
  return new File([blob], nome, { type: 'application/pdf' })
}

export async function qrCodeDataUrl(texto: string): Promise<string> {
  const QRCode = await import('qrcode')
  return QRCode.toDataURL(texto, { margin: 1, width: 320, errorCorrectionLevel: 'M' })
}

async function pixParaPdf(orcamento: Orcamento, perfil: PerfilPublico): Promise<PixPdf | null> {
  const cobranca = pixDoOrcamento(orcamento, perfil)
  if (!cobranca) return null
  return { ...cobranca, qrDataUrl: await qrCodeDataUrl(cobranca.codigo) }
}

export async function gerarPdfOrcamento(
  orcamento: Orcamento,
  perfil: PerfilPublico,
  tipo: TipoDocumento = 'orcamento',
): Promise<File> {
  const [{ OrcamentoPdf }, pix] = await Promise.all([
    import('./OrcamentoPdf'),
    tipo === 'orcamento' ? pixParaPdf(orcamento, perfil) : Promise.resolve(null),
  ])
  return renderizar(
    <OrcamentoPdf orcamento={orcamento} perfil={perfil} marcaDagua={marcaDagua(perfil)} tipo={tipo} pix={pix} geradoEm={Date.now()} />,
    nomeArquivo(tipo === 'ordem' ? 'ordem-de-servico' : 'orcamento', orcamento),
  )
}

export async function gerarPdfRecibo(orcamento: Orcamento, perfil: PerfilPublico, pagamento: Pagamento): Promise<File> {
  const { ReciboPdf } = await import('./ReciboPdf')
  return renderizar(
    <ReciboPdf orcamento={orcamento} perfil={perfil} pagamento={pagamento} marcaDagua={marcaDagua(perfil)} />,
    nomeArquivo('recibo', orcamento, pagamento.numeroRecibo.slice(orcamento.numero.length)),
  )
}

export async function gerarPdfGarantia(orcamento: Orcamento, perfil: PerfilPublico): Promise<File> {
  const { GarantiaPdf } = await import('./GarantiaPdf')
  return renderizar(
    <GarantiaPdf orcamento={orcamento} perfil={perfil} dataConclusao={Date.now()} marcaDagua={marcaDagua(perfil)} />,
    nomeArquivo('garantia', orcamento),
  )
}

function primeiroNome(orcamento: Orcamento): string {
  return orcamento.cliente.nome.trim().split(/\s+/)[0] ?? ''
}

function saudacao(orcamento: Orcamento): string {
  const nome = primeiroNome(orcamento)
  return nome ? `Olá, ${nome}!` : 'Olá!'
}

function assinatura(perfil: PerfilPublico): string {
  return perfil.nome ? `\n\n${perfil.nome}` : ''
}

export function mensagemWhatsApp(orcamento: Orcamento, perfil: PerfilPublico): string {
  return `${saudacao(orcamento)} Segue o orçamento nº ${orcamento.numero} no valor de ${formatarBRL(
    calcularTotais(orcamento).total,
  )}. Qualquer dúvida, estou à disposição.${assinatura(perfil)}`
}

export function mensagemLink(orcamento: Orcamento, perfil: PerfilPublico, url: string): string {
  return `${saudacao(orcamento)} Segue o orçamento nº ${orcamento.numero} no valor de ${formatarBRL(
    calcularTotais(orcamento).total,
  )}.\n\nVocê pode ver os detalhes e aprovar por este link:\n${url}${assinatura(perfil)}`
}

export function mensagemDocumento(orcamento: Orcamento, perfil: PerfilPublico, documento: string): string {
  return `${saudacao(orcamento)} Segue ${documento} referente ao orçamento nº ${orcamento.numero}.${assinatura(perfil)}`
}

/** Normaliza o telefone para o formato do link do WhatsApp (55 + DDD + número). */
export function telefoneWhatsApp(telefone: string): string {
  const digitos = telefone.replace(/\D/g, '')
  if (!digitos) return ''
  return digitos.length <= 11 ? `55${digitos}` : digitos
}

export function linkWhatsApp(telefone: string, texto: string): string {
  return `https://wa.me/${telefoneWhatsApp(telefone)}?text=${encodeURIComponent(texto)}`
}

export function baixarArquivo(arquivo: File) {
  const url = URL.createObjectURL(arquivo)
  const link = document.createElement('a')
  link.href = url
  link.download = arquivo.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export type ResultadoEnvio = 'compartilhado' | 'baixado' | 'cancelado' | 'precisa-toque'

/**
 * No celular, abre a folha de compartilhamento nativa com o PDF anexado,
 * onde o profissional escolhe o WhatsApp. Sem esse recurso, baixa o PDF
 * e abre a conversa do WhatsApp com a mensagem pronta.
 *
 * Alguns navegadores só permitem compartilhar logo após um toque. Se gerar
 * o PDF demorou demais, o resultado é 'precisa-toque' e a tela deve pedir
 * um novo toque, chamando esta função de novo com o mesmo arquivo.
 */
export async function enviarArquivo(arquivo: File, texto: string, telefone: string): Promise<ResultadoEnvio> {
  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], text: texto })
      return 'compartilhado'
    } catch (erro) {
      if (erro instanceof DOMException && erro.name === 'AbortError') return 'cancelado'
      if (erro instanceof DOMException && erro.name === 'NotAllowedError') return 'precisa-toque'
    }
  }
  baixarArquivo(arquivo)
  window.open(linkWhatsApp(telefone, texto), '_blank', 'noopener')
  return 'baixado'
}
