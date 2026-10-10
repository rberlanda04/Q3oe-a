import { describe, expect, it } from 'vitest'
import { linkIndicacao, linkWhatsAppSemContato, textoIndicacao, UTM_ORCAMENTO_CLIENTE } from './indicacao'
import { origemDaVisita } from './origem'

describe('indicação', () => {
  it('o link de indicação chega ao funil como canal indicacao', () => {
    const link = linkIndicacao('https://www.q3orca.com.br')
    expect(new URL(link).pathname).toBe('/beta')
    const origem = origemDaVisita(link, '', 0, 'www.q3orca.com.br')
    expect(origem).toMatchObject({ fonte: 'indicacao', meio: 'whatsapp', campanha: 'indique' })
  })

  it('o rodapé do orçamento do cliente chega como canal orcamento-cliente', () => {
    const origem = origemDaVisita('https://www.q3orca.com.br/?' + UTM_ORCAMENTO_CLIENTE, '', 0, 'www.q3orca.com.br')
    expect(origem).toMatchObject({ fonte: 'orcamento-cliente', meio: 'link' })
  })

  it('a mensagem leva o link e abre o WhatsApp sem contato escolhido', () => {
    const texto = textoIndicacao('https://www.q3orca.com.br')
    expect(texto).toContain('https://www.q3orca.com.br/beta?utm_source=indicacao')
    expect(linkWhatsAppSemContato(texto)).toMatch(/^https:\/\/wa\.me\/\?text=/)
  })
})
