import type { SVGProps } from 'react'

/** Ícones de traço da marca: linhas de 2px, cantos arredondados, grade de 24px. */
type Props = SVGProps<SVGSVGElement> & { tamanho?: number }

function Base({ tamanho = 22, children, ...resto }: Props & { children: React.ReactNode }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...resto}
    >
      {children}
    </svg>
  )
}

export const IconeDocumento = (p: Props) => (
  <Base {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </Base>
)
export const IconePessoas = (p: Props) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" />
  </Base>
)
export const IconeCaixa = (p: Props) => (
  <Base {...p}>
    <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
    <path d="M3 7.5 12 12l9-4.5M12 12v9" />
  </Base>
)
export const IconeUsuario = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Base>
)
export const IconeMais = (p: Props) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)
export const IconeSeta = (p: Props) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
)
export const IconeVoltar = (p: Props) => (
  <Base {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Base>
)
export const IconeCheck = (p: Props) => (
  <Base {...p}>
    <path d="M5 12.5 10 17.5 19.5 7" />
  </Base>
)
export const IconeLink = (p: Props) => (
  <Base {...p}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  </Base>
)
export const IconeWhatsApp = (p: Props) => (
  <Base {...p}>
    <path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.2z" />
    <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1a4 4 0 0 1-2-2l1-1-1-2z" />
  </Base>
)
export const IconePix = (p: Props) => (
  <Base {...p}>
    <path d="M12 2.8 21.2 12 12 21.2 2.8 12z" />
    <path d="M8 12h8" />
  </Base>
)
export const IconeOlho = (p: Props) => (
  <Base {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
)
export const IconeCopiar = (p: Props) => (
  <Base {...p}>
    <rect x="8" y="8" width="13" height="13" rx="2" />
    <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
  </Base>
)
export const IconeLixeira = (p: Props) => (
  <Base {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </Base>
)
export const IconeRelogio = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
)
export const IconeBusca = (p: Props) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </Base>
)
export const IconeSair = (p: Props) => (
  <Base {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
  </Base>
)
export const IconeEscudo = (p: Props) => (
  <Base {...p}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
    <path d="m9 12 2 2 4-4" />
  </Base>
)
export const IconeRegua = (p: Props) => (
  <Base {...p}>
    <path d="M3 16 16 3l5 5L8 21z" />
    <path d="m7 12 2 2M10 9l2 2M13 6l2 2" />
  </Base>
)
export const IconeRaio = (p: Props) => (
  <Base {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
  </Base>
)
export const IconeAjuda = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" />
  </Base>
)
export const IconeNuvem = (p: Props) => (
  <Base {...p}>
    <path d="M7 18a5 5 0 0 1-.5-10A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z" />
  </Base>
)
