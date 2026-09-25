import { useState } from 'react'
import { centavosParaInput, parseBRL } from '../domain/money'

interface Props {
  id?: string
  valor: number
  onChange: (centavos: number) => void
  placeholder?: string
  className?: string
}

/** Campo de valor em reais que guarda centavos inteiros. */
export function CampoDinheiro({ id, valor, onChange, placeholder = '0,00', className }: Props) {
  const [texto, setTexto] = useState(centavosParaInput(valor))
  const [focado, setFocado] = useState(false)
  const exibido = focado ? texto : centavosParaInput(valor)

  return (
    <div className={`relative ${className ?? ''}`}>
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-grafite-400">R$</span>
      <input
        id={id}
        inputMode="decimal"
        className="!pl-9 text-right"
        placeholder={placeholder}
        value={exibido}
        onFocus={() => {
          setTexto(centavosParaInput(valor))
          setFocado(true)
        }}
        onChange={(e) => {
          setTexto(e.target.value)
          onChange(parseBRL(e.target.value))
        }}
        onBlur={() => setFocado(false)}
      />
    </div>
  )
}
