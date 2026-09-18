interface Props {
  tamano?: number
}

export default function Escudo({ tamano = 44 }: Props) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Escudo"
    >
      <defs>
        <linearGradient id="oroEscudo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8c860" />
          <stop offset="100%" stopColor="#a67c1f" />
        </linearGradient>
      </defs>

      {/* Corona */}
      <path
        d="M18 12 L22 5 L26 11 L32 3 L38 11 L42 5 L46 12 Z"
        fill="url(#oroEscudo)"
      />
      <rect x="18" y="12" width="28" height="3" rx="1" fill="url(#oroEscudo)" />

      {/* Escudo */}
      <path
        d="M14 16 L50 16 L50 38 C50 50 42 58 32 62 C22 58 14 50 14 38 Z"
        fill="#0b0e13"
        stroke="url(#oroEscudo)"
        strokeWidth="2.2"
      />

      {/* Cruz central */}
      <path
        d="M29 22 L35 22 L35 32 L46 32 L46 38 L35 38 L35 52 L29 52 L29 38 L18 38 L18 32 L29 32 Z"
        fill="url(#oroEscudo)"
      />

      {/* Punto central decorativo */}
      <circle cx="32" cy="35" r="2.5" fill="#0b0e13" />
    </svg>
  )
}
