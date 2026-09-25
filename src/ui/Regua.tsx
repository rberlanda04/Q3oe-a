/** Elemento gráfico da marca: marcas de régua, lembrando a trena do dia a dia. */
export function Regua({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute right-0 bottom-0 left-0 h-16 w-full ${className}`}
      preserveAspectRatio="none"
      viewBox="0 0 400 64"
      aria-hidden
    >
      {Array.from({ length: 81 }, (_, i) => (
        <line
          key={i}
          x1={i * 5}
          x2={i * 5}
          y1={64}
          y2={i % 10 === 0 ? 24 : i % 5 === 0 ? 40 : 52}
          stroke="#ff5a1f"
          strokeOpacity={i % 10 === 0 ? 0.9 : 0.45}
          strokeWidth={1.5}
        />
      ))}
    </svg>
  )
}
