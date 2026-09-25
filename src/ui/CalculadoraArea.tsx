import { useState } from 'react'
import { formatarQuantidade, parseQuantidade } from '../domain/money'

interface Medida {
  largura: string
  altura: string
  descontar: boolean
}

interface Props {
  onAplicar: (area: number) => void
  onFechar: () => void
}

const vazia = (descontar = false): Medida => ({ largura: '', altura: '', descontar })

/** Soma áreas (paredes, pisos) e desconta portas e janelas. */
export function CalculadoraArea({ onAplicar, onFechar }: Props) {
  const [medidas, setMedidas] = useState<Medida[]>([vazia()])

  const area = medidas.reduce((total, m) => {
    const parcial = parseQuantidade(m.largura) * parseQuantidade(m.altura)
    return total + (m.descontar ? -parcial : parcial)
  }, 0)
  const areaFinal = Math.max(Math.round(area * 100) / 100, 0)

  const atualizar = (indice: number, dados: Partial<Medida>) =>
    setMedidas(medidas.map((m, i) => (i === indice ? { ...m, ...dados } : m)))

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-brasa-200 bg-brasa-50 p-3 text-sm">
      <p className="font-semibold text-brasa-900">Calcular área (m²)</p>
      {medidas.map((m, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className={`w-16 shrink-0 text-xs ${m.descontar ? 'text-alerta-600' : 'text-grafite-600'}`}>
            {m.descontar ? '− Vão' : '+ Área'}
          </span>
          <input inputMode="decimal" placeholder="Largura (m)" value={m.largura} onChange={(e) => atualizar(i, { largura: e.target.value })} />
          <span>×</span>
          <input inputMode="decimal" placeholder="Altura (m)" value={m.altura} onChange={(e) => atualizar(i, { altura: e.target.value })} />
          <button
            type="button"
            aria-label="Remover medida"
            className="px-2 text-grafite-400 hover:text-alerta-600"
            onClick={() => setMedidas(medidas.length > 1 ? medidas.filter((_, j) => j !== i) : [vazia()])}
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" className="text-brasa-700" onClick={() => setMedidas([...medidas, vazia()])}>
          + Parede ou piso
        </button>
        <button type="button" className="text-alerta-600" onClick={() => setMedidas([...medidas, vazia(true)])}>
          − Porta ou janela
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 pt-1">
        <strong>Total: {formatarQuantidade(areaFinal)} m²</strong>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary !py-1.5 text-sm" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className="btn-primary !py-1.5 text-sm" onClick={() => onAplicar(areaFinal)}>
            Usar
          </button>
        </div>
      </div>
    </div>
  )
}
