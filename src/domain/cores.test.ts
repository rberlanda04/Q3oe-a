import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { APOIO, contraste, coresDoDocumento, ESCALAS, misturar, nivelWcag, PRINCIPAIS, textoSobre } from './cores'

describe('paleta da marca', () => {
  it('calcula contraste pela fórmula da WCAG', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contraste('#ffffff', '#ffffff')).toBeCloseTo(1, 5)
  })

  it('garante contraste AA nas combinações de uso obrigatório', () => {
    // Botão primário: texto branco sobre Brasa 700.
    expect(contraste('#c43e0c', '#ffffff')).toBeGreaterThanOrEqual(4.5)
    // Botão de WhatsApp: branco sobre Aprovado 600.
    expect(contraste('#167c42', '#ffffff')).toBeGreaterThanOrEqual(4.5)
    // Texto principal sobre o fundo Areia.
    expect(contraste('#1b1f2a', '#faf6f0')).toBeGreaterThanOrEqual(7)
    // Texto secundário (Grafite 500) sobre branco.
    expect(contraste('#5b6372', '#ffffff')).toBeGreaterThanOrEqual(4.5)
    // Erro sobre branco.
    expect(contraste('#c8342b', '#ffffff')).toBeGreaterThanOrEqual(4.5)
  })

  it('documenta que Brasa 500 não serve para texto pequeno sobre branco', () => {
    expect(nivelWcag(contraste('#ff5a1f', '#ffffff'))).toBe('AA grande')
  })

  it('escolhe a cor de texto legível', () => {
    expect(textoSobre('#1b1f2a')).toBe('#ffffff')
    expect(textoSobre('#ffc53d')).toBe('#1b1f2a')
  })

  it('usa a cor da marca do assinante sem perder legibilidade', () => {
    expect(misturar('#000000', '#ffffff', 0.5)).toBe('#808080')
    expect(coresDoDocumento('#1f418f', true)).toEqual({ destaque: '#1f418f', texto: '#1f418f', suave: misturar('#1f418f', '#ffffff', 0.9) })
    // Amarelo claro não serve para texto: o título cai para grafite.
    expect(coresDoDocumento('#ffd966', true).texto).toBe('#1b1f2a')
    // Sem Pro, a cor da marca é ignorada.
    expect(coresDoDocumento('#1f418f', false).destaque).toBe('#ff5a1f')
    expect(coresDoDocumento('azul', true).destaque).toBe('#ff5a1f')
  })

  it('mantém o CSS igual ao manual', () => {
    const css = readFileSync('src/index.css', 'utf8').toLowerCase()
    const cores = [...PRINCIPAIS, ...APOIO].map((c) => c.hex)
    for (const escala of ESCALAS) for (const t of escala.tons) cores.push(t.hex)
    for (const hex of cores) expect(css, `${hex} ausente do index.css`).toContain(hex)
  })
})
