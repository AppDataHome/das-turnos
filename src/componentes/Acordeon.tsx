import { useState, ReactNode } from 'react'

interface Props {
  titulo: string
  icono?: string
  abiertoPorDefecto?: boolean
  children: ReactNode
}

export default function Acordeon({
  titulo,
  icono,
  abiertoPorDefecto = false,
  children,
}: Props) {
  const [abierto, setAbierto] = useState(abiertoPorDefecto)

  return (
    <div className="card acordeon">
      <button
        type="button"
        className="acordeon-cabecera"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
      >
        {icono && <span className="acordeon-icono">{icono}</span>}
        <span className="acordeon-titulo">{titulo}</span>
        <span
          className={`acordeon-flecha ${abierto ? 'abierto' : ''}`}
          aria-hidden="true"
        >
          ›
        </span>
      </button>

      {abierto && <div className="acordeon-contenido">{children}</div>}
    </div>
  )
}
