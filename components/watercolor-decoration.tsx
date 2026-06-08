interface WatercolorDecorationProps {
  direction: 'left' | 'right'
  variant?: 'light' | 'dark'
  position?: 'top' | 'bottom'
  layout?: 'side' | 'full'
}

export function WatercolorDecoration({
  direction,
  variant = 'light',
  position = 'bottom',
  layout = 'side',
}: WatercolorDecorationProps) {
  const src = direction === 'right'
    ? '/acuarela-lado a lado.webp'
    : '/acuarela-lado a lado-invertido.webp'

  const variantClasses = variant === 'dark'
    ? 'opacity-40 sm:opacity-45 mix-blend-soft-light'
    : 'opacity-50 sm:opacity-45'

  if (layout === 'full') {
    return (
      <div
        aria-hidden="true"
        className="relative h-0 overflow-visible pointer-events-none"
      >
        <img
          src={src}
          alt="Decoración acuarela — Villa Camila Salas Apartamentos en Asturias"
          loading="lazy"
          className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-36 sm:h-52 lg:h-100 object-cover object-[center_65%] select-none ${variantClasses}`}
        />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt="Decoración acuarela — Villa Camila Salas Apartamentos en Asturias"
      aria-hidden="true"
      loading="lazy"
      className={`pointer-events-none select-none absolute w-auto h-56 sm:h-72 md:h-80 lg:h-[30rem] ${variantClasses} `}
    />
  )
}
