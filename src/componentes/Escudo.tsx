interface Props {
  tamano?: number
}

export default function Escudo({ tamano = 44 }: Props) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Escudo DAS"
    >
      <defs>
        <linearGradient id="fondoEscudo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1f2e" />
          <stop offset="100%" stopColor="#0e1116" />
        </linearGradient>
      </defs>

      {/* Fondo redondeado */}
      <rect width="512" height="512" rx="96" fill="url(#fondoEscudo)" />

      {/* Escudo relleno sutil */}
      <path
        d="M256 80 L400 140 L400 260 C400 340 330 410 256 440 C182 410 112 340 112 260 L112 140 Z"
        fill="#d4a43a"
        opacity="0.15"
      />

      {/* Escudo borde */}
      <path
        d="M256 80 L400 140 L400 260 C400 340 330 410 256 440 C182 410 112 340 112 260 L112 140 Z"
        fill="none"
        stroke="#d4a43a"
        strokeWidth="10"
      />

      {/* Texto DAS */}
      <text
        x="256"
        y="280"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="140"
        fontWeight="bold"
        fill="#d4a43a"
        textAnchor="middle"
      >
        DAS
      </text>
    </svg>
  )
}
