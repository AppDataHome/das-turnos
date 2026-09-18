interface Props {
  nombre: string
  avatarUrl?: string | null
  tamano?: number
  colorFondo?: string
  colorTexto?: string
}

export default function Avatar({
  nombre,
  avatarUrl,
  tamano = 40,
  colorFondo = 'var(--acento)',
  colorTexto = '#0b0e13',
}: Props) {
  const inicial = (nombre?.trim()?.[0] ?? '?').toUpperCase()

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={nombre}
        style={{
          width: tamano,
          height: tamano,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '2px solid var(--borde)',
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: tamano,
        height: tamano,
        borderRadius: '50%',
        background: colorFondo,
        color: colorTexto,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(tamano * 0.42),
        fontWeight: 800,
        flexShrink: 0,
      }}
    >
      {inicial}
    </div>
  )
}
