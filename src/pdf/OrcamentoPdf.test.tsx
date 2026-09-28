import { renderToBuffer } from '@react-pdf/renderer'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import QRCode from 'qrcode'
import { describe, expect, it, vi } from 'vitest'
import { pixDoOrcamento } from '../domain/cobranca'
import type { Orcamento, Pagamento, PerfilPublico } from '../domain/types'
import { GarantiaPdf } from './GarantiaPdf'
import { mensagemLink, mensagemWhatsApp, telefoneWhatsApp } from './compartilhar'
import { OrcamentoPdf } from './OrcamentoPdf'
import { ReciboPdf } from './ReciboPdf'

vi.mock('../lib/firebase', () => ({ db: {} }))

const perfil: PerfilPublico = {
  nome: 'João Pinturas',
  documento: '529.982.247-25',
  telefone: '(11) 97777-6666',
  email: 'joao@email.com',
  endereco: '',
  cidade: 'Campinas - SP',
  pix: 'joao@email.com',
  pixTipo: 'email',
}

const pagamento: Pagamento = {
  id: 'p1',
  numeroRecibo: '2026-0001-R1',
  valorCentavos: 74878,
  forma: 'pix',
  data: new Date(2026, 8, 24, 12).getTime(),
  referente: 'à entrada dos serviços do orçamento nº 2026-0001',
}

const orcamento: Orcamento = {
  id: 'teste',
  numero: '2026-0001',
  profissao: 'pintor',
  cliente: { nome: 'Maria da Conceição', telefone: '(11) 98888-7777', endereco: 'Rua das Flores, 10' },
  itens: [
    { id: '1', descricao: 'Pintura de parede interna (2 demãos)', quantidade: 42.5, unidade: 'm²', precoUnitarioCentavos: 1800, tipo: 'servico' },
    { id: '2', descricao: 'Tinta acrílica 18 L', quantidade: 2, unidade: 'un', precoUnitarioCentavos: 38990, tipo: 'material' },
  ],
  desconto: { tipo: 'percentual', valor: 5 },
  deslocamentoCentavos: 3000,
  condicoesPagamento: '50% de entrada e 50% na conclusão.',
  prazoExecucao: '5 dias úteis',
  validadeDias: 15,
  garantia: 'Garantia de 1 ano contra descascamento.',
  observacoes: '',
  status: 'aprovado',
  pix: { modo: 'percentual', percentual: 50 },
  pagamentos: [pagamento],
  criadoEm: new Date(2026, 8, 24, 12).getTime(),
  atualizadoEm: new Date(2026, 8, 24, 12).getTime(),
}

// Para inspecionar o visual: PDF_SAIDA=pasta npm test
function salvar(nome: string, buffer: Buffer) {
  if (process.env.PDF_SAIDA) writeFileSync(join(process.env.PDF_SAIDA, nome), buffer)
}

function validarPdf(buffer: Buffer) {
  expect(buffer.subarray(0, 5).toString()).toBe('%PDF-')
  expect(buffer.length).toBeGreaterThan(2000)
}

describe('PDFs', () => {
  it('gera o orçamento com QR Code Pix da entrada', async () => {
    const cobranca = pixDoOrcamento(orcamento, perfil)!
    expect(cobranca.valorCentavos).toBe(74878)
    const qrDataUrl = await QRCode.toDataURL(cobranca.codigo, { margin: 1, width: 320 })
    const buffer = await renderToBuffer(
      <OrcamentoPdf orcamento={orcamento} perfil={perfil} marcaDagua pix={{ ...cobranca, qrDataUrl }} />,
    )
    validarPdf(buffer)
    salvar('orcamento.pdf', buffer)
  }, 30_000)

  it('gera o orçamento Pro com logo, cor da marca e sem marca d’água', async () => {
    // Um PNG qualquer serve de logo no teste.
    const logo = await QRCode.toDataURL('logo', { margin: 0, width: 128, color: { dark: '#1f418f' } })
    const pro: PerfilPublico = {
      ...perfil,
      pro: true,
      logo,
      corMarca: '#1f418f',
      razaoSocial: 'João Pinturas e Reformas LTDA',
      site: 'joaopinturas.com.br',
      instagram: 'joaopinturas',
    }
    const buffer = await renderToBuffer(<OrcamentoPdf orcamento={orcamento} perfil={pro} marcaDagua={false} />)
    validarPdf(buffer)
    salvar('orcamento-pro.pdf', buffer)
  }, 30_000)

  it('gera a ordem de serviço', async () => {
    const buffer = await renderToBuffer(<OrcamentoPdf orcamento={orcamento} perfil={perfil} marcaDagua tipo="ordem" />)
    validarPdf(buffer)
    salvar('ordem.pdf', buffer)
  }, 30_000)

  it('gera o recibo', async () => {
    const buffer = await renderToBuffer(<ReciboPdf orcamento={orcamento} perfil={perfil} pagamento={pagamento} marcaDagua />)
    validarPdf(buffer)
    salvar('recibo.pdf', buffer)
  }, 30_000)

  it('gera o termo de garantia', async () => {
    const buffer = await renderToBuffer(
      <GarantiaPdf orcamento={orcamento} perfil={perfil} dataConclusao={orcamento.criadoEm} marcaDagua />,
    )
    validarPdf(buffer)
    salvar('garantia.pdf', buffer)
  }, 30_000)
})

describe('mensagens do WhatsApp', () => {
  it('monta mensagens e telefone', () => {
    expect(mensagemWhatsApp(orcamento, perfil)).toContain('Olá, Maria!')
    expect(mensagemLink(orcamento, perfil, 'https://q3orca.web.app/o/abc')).toContain('https://q3orca.web.app/o/abc')
    expect(telefoneWhatsApp('(11) 98888-7777')).toBe('5511988887777')
    expect(telefoneWhatsApp('+55 11 98888-7777')).toBe('5511988887777')
  })
})
