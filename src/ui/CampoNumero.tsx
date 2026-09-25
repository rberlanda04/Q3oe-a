import { useState } from 'react'
import { formatarQuantidade, parseQuantidade } from '../domain/money'

interface Props {
  id?: string
  valor: number
  onChange: (valor: number) => void
  maximo?: number
  placeholder?: string
  'aria-label'?: string
}

/** Campo numérico que aceita vírgula e atualiza o valor enquanto se digita. */
export function CampoNumero({ id, valor, onChange, maximo, placeholder = '0', ...resto }: Props) {
  const [texto, setTexto] = useState('')
  const [focado, setFocado] = useState(false)
  const formatado = valor ? formatarQuantidade(valor) : ''

  return (
    <input
      id={id}
      aria-label={resto['aria-label']}
      inputMode="decimal"
      placeholder={placeholder}
      value={focado ? texto : formatado}
      onFocus={() => {
        setTexto(formatado)
        setFocado(true)
      }}
      onChange={(e) => {
        setTexto(e.target.value)
        const numero = parseQuantidade(e.target.value)
        onChange(maximo === undefined ? numero : Math.min(numero, maximo))
      }}
      onBlur={() => setFocado(false)}
    />
  )
}
