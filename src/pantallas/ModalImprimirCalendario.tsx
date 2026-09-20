import { useState } from 'react'
import { X, Printer, Calendar } from 'lucide-react'
import VistaImpresionCalendario from './VistaImpresionCalendario'

interface Props {
  onCerrar: () => void
}

function aTexto(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function ModalImprimirCalendario({ onCerrar }: Props) {
  const hoy = new Date()
  const anioActual = hoy.getFullYear()
  const mesActual = hoy.getMonth()

  const [fechaInicio, setFechaInicio] = useState(
    aTexto(new Date(anioActual, mesActual, 1))
  )
  const [fechaFin, setFechaFin] = useState(
    aTexto(new Date(anioActual, mesActual + 1, 0))
  )

  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState('')

  function atajosRapidos() {
    return [
      {
        etiqueta: 'Mes actual',
        getRango: () => ({
          inicio: aTexto(new Date(anioActual, mesActual, 1)),
          fin: aTexto(new Date(anioActual, mesActual + 1, 0)),
        }),
      },
      {
        etiqueta: 'Mes anterior',
        getRango: () => ({
          inicio: aTexto(new Date(anioActual, mesActual - 1, 1)),
          fin: aTexto(new Date(anioActual, mesActual, 0)),
        }),
      },
      {
        etiqueta: 'Mes siguiente',
        getRango: () => ({
          inicio: aTexto(new Date(anioActual, mesActual + 1, 1)),
          fin: aTexto(new Date(anioActual, mesActual + 2, 0)),
        }),
      },
      {
        etiqueta: 'Año actual',
        getRango: () => ({
          inicio: `${anioActual}-01-01`,
          fin: `${anioActual}-12-31`,
        }),
      },
      {
        etiqueta: 'Primer trimestre',
        getRango: () => ({
          inicio: `${anioActual}-01-01`,
          fin: `${anioActual}-03-31`,
        }),
      },
      {
        etiqueta: 'Segundo trimestre',
        getRango: () => ({
          inicio: `${anioActual}-04-01`,
          fin: `${anioActual}-06-30`,
        }),
      },
      {
        etiqueta: 'Tercer trimestre',
        getRango: () => ({
          inicio: `${anioActual}-07-01`,
          fin: `${anioActual}-09-30`,
        }),
      },
      {
        etiqueta: 'Cuarto trimestre',
        getRango: () => ({
          inicio: `${anioActual}-10-01`,
          fin: `${anioActual}-12-31`,
        }),
      },
    ]
  }

  function aplicarAtajo(inicio: string, fin: string) {
    setFechaInicio(inicio)
    setFechaFin(fin)
    setError('')
  }

  function continuar() {
    if (!fechaInicio || !fechaFin) {
      setError('Debes indicar ambas fechas')
      return
    }
    if (fechaInicio > fechaFin) {
      setError('La fecha de inicio no puede ser posterior a la de fin')
      return
    }

    // Calcular número de meses para avisar si son muchos
    const inicio = new Date(fechaInicio + 'T00:00:00')
    const fin = new Date(fechaFin + 'T00:00:00')
    const meses =
      (fin.getFullYear() - inicio.getFullYear()) * 12 +
      (fin.getMonth() - inicio.getMonth()) +
      1

    if (meses > 24) {
      setError(
        `Has seleccionado ${meses} meses. Elige un rango más pequeño (máximo 24 meses).`
      )
      return
    }

    setGenerando(true)
  }

  // Si estamos generando, mostramos la vista de impresión encima
  if (generando) {
    return (
      <VistaImpresionCalendario
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        onCerrar={onCerrar}
      />
    )
  }

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div
        className="modal-ventana"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <div className="modal-cabecera">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              minWidth: 0,
            }}
          >
            <Printer size={22} color="var(--acento)" />
            <div className="modal-titulo">Imprimir calendario</div>
          </div>
          <button
            className="modal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>

        <p
          style={{
            fontSize: 12,
            color: 'var(--texto-suave)',
            marginBottom: 14,
            lineHeight: 1.5,
          }}
        >
          Elige un rango de fechas. Se generará una hoja A4 por cada mes
          dentro del rango, con todos tus turnos, festivos y notas.
        </p>

        {/* Atajos rápidos */}
        <div className="modal-seccion">
          <div className="modal-seccion-titulo">Atajos rápidos</div>
          <div
            style={{
              display: 'flex',
              gap: 4,
              flexWrap: 'wrap',
            }}
          >
            {atajosRapidos().map((a) => {
              const r = a.getRango()
              const activo =
                fechaInicio === r.inicio && fechaFin === r.fin
              return (
                <button
                  key={a.etiqueta}
                  type="button"
                  className="btn-mini"
                  style={{
                    background: activo
                      ? 'var(--acento)'
                      : 'var(--fondo-tarjeta-3)',
                    color: activo ? 'var(--acento-texto)' : 'var(--texto)',
                    padding: '5px 10px',
                    fontSize: 10,
                  }}
                  onClick={() => aplicarAtajo(r.inicio, r.fin)}
                >
                  {a.etiqueta}
                </button>
              )
            })}
          </div>
        </div>

        {/* Fechas personalizadas */}
        <div className="modal-seccion">
          <div className="modal-seccion-titulo">O elige el rango</div>

          <div className="fila-form">
            <div>
              <label className="label">Desde</label>
              <input
                className="input"
                type="date"
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value)
                  setError('')
                }}
              />
            </div>
            <div>
              <label className="label">Hasta</label>
              <input
                className="input"
                type="date"
                value={fechaFin}
                onChange={(e) => {
                  setFechaFin(e.target.value)
                  setError('')
                }}
              />
            </div>
          </div>

          {error && <p className="error">{error}</p>}
        </div>

        <button
          className="btn btn-primary"
          onClick={continuar}
          style={{ width: '100%', marginTop: 6 }}
        >
          <Calendar size={14} />
          Generar vista de impresión
        </button>

        <button
          className="btn btn-ghost"
          onClick={onCerrar}
          style={{ width: '100%', marginTop: 6 }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
