export const APP_NOME = 'Q3 Orça'

interface SimboloProps {
  tamanho?: number
  /** 'cor': fundo brasa. 'escuro': fundo grafite. 'contorno': só o traço, na cor do texto. */
  variante?: 'cor' | 'escuro' | 'contorno'
  className?: string
}

/**
 * Símbolo Q3: um "Q" cuja perna é um sinal de aprovado.
 * O orçamento que o cliente aprova é a promessa da marca.
 */
export function Simbolo({ tamanho = 40, variante = 'cor', className }: SimboloProps) {
  const fundo = variante === 'cor' ? '#ff5a1f' : variante === 'escuro' ? '#1b1f2a' : 'none'
  const traco = variante === 'contorno' ? 'currentColor' : '#ffffff'
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 48 48"
      role="img"
      aria-label={APP_NOME}
      className={className}
    >
      {variante !== 'contorno' && <rect width="48" height="48" rx="13" fill={fundo} />}
      <circle cx="20" cy="22.5" r="10" fill="none" stroke={traco} strokeWidth="5" />
      <path d="M27.1 29.6 L30.8 33.3 L40.5 21.5" fill="none" stroke={traco} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface LogoProps {
  tamanho?: number
  /** Texto claro, para fundos escuros. */
  claro?: boolean
  className?: string
}

export function Logo({ tamanho = 32, claro = false, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ''}`}>
      <Simbolo tamanho={tamanho} />
      <span
        className={`font-sans leading-none font-black tracking-[-0.04em] ${claro ? 'text-white' : 'text-grafite-900'}`}
        style={{ fontSize: tamanho * 0.66 }}
      >
        Q3<span className={claro ? 'text-brasa-400' : 'text-brasa-600'}> Orça</span>
      </span>
    </span>
  )
}
