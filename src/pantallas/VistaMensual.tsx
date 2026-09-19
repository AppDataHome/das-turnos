import { useMemo, useState, useEffect } from 'react'
import type { Turno } from '../tipos'
import { iconoTurno } from '../utilidades/turnos'

interface Props {
  turnos: Turno[]
  festivos: string[]
  fechaSeleccionada: string
  onSeleccionarFecha: (fecha: string) => void
  onCambioMes?: (fecha: Date) => void
}

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function aTexto(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function mismoDia(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function diaSemanaLunes(fecha: Date): number {
  const d = fecha.getDay()
  return d === 0 ? 6 : d - 1
}

export default function VistaMensual({
  turnos,
  festivos,
  fechaSeleccionada,
  onSeleccionarFecha,
  onCambioMes,
}: Props) {
  const hoy = new Date()
  const [mesActual, setMesActual] = useState<Date>(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  )

  useEffect(() => {
    const f = new Date(fechaSeleccionada + 'T00:00:00')
    setMesActual(new Date(f.getFullYear(), f.getMonth(), 1))
  }, [fechaSeleccionada])

  // Avisamos al padre del mes visible
  useEffect(() => {
    onCambioMes?.(mesActual)
  }, [mesActual])

  const festivosSet = useMemo(() => new Set(festivos), [festivos])

  const turnosPorFecha = useMemo(() => {
    const mapa = new Map<string, Turno[]>()
    for (const t of turnos) {
      if (!mapa.has(t.fecha)) mapa.set(t.fecha, [])
      mapa.get(t.fecha)!.push(t)
    }
    for (const lista of mapa.values()) {
      lista.sort((a, b) => (a.orden_turno ?? 100) - (b.orden_turno ?? 100))
    }
    return mapa
  }, [turnos])

  const dias = useMemo(() => {
    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1)
    const offset = diaSemanaLunes(primerDia)
    const inicio = new Date(primerDia)
    inicio.setDate(primerDia.getDate() - offset)

    const lista: Date[] = []
    for (let i = 0; i < 42; i++) {
      const d = new Date(inicio)
      d.setDate(inicio.getDate() + i)
      lista.push(d)
    }
    return lista
  }, [mesActual])

  function mesAnterior() {
    setMesActual(
      new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1)
    )
  }

  function mesSiguiente() {
    setMesActual(
      new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1)
    )
  }

  function irHoy() {
    setMesActual(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
    onSeleccionarFecha(aTexto(hoy))
  }

  const titulo = `${MESES[mesActual.getMonth()]} ${mesActual.getFullYear()}`

  return (
    <div className="card">
      <div className="mes-navegador">
        <button onClick={mesAnterior} aria-label="Mes anterior">
          ‹
        </button>
        <div className="mes-titulo">{titulo}</div>
        <button onClick={irHoy} className="btn-hoy" aria-label="Ir a hoy">
          HOY
        </button>
        <button onClick={mesSiguiente} aria-label="Mes siguiente">
          ›
        </button>
      </div>

      <div className="rejilla-mes">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="cabecera-dia">
            {d}
          </div>
        ))}

        {dias.map((d) => {
          const fecha = aTexto(d)
          const turnosDia = turnosPorFecha.get(fecha) ?? []
          const fueraMes = d.getMonth() !== mesActual.getMonth()
          const esHoy = mismoDia(d, hoy)
          const seleccionado = fecha === fechaSeleccionada
          const esFestivo = festivosSet.has(fecha)
          const diaSemana = d.getDay()
          const esFinSemana = diaSemana === 0 || diaSemana === 6

          let fondo: string | undefined = undefined
          if (esFestivo) {
            fondo = 'rgba(239, 68, 68, 0.20)'
          } else if (esFinSemana) {
            fondo = 'rgba(239, 68, 68, 0.08)'
          }

          const notasDia = turnosDia
            .map((t) => t.notas)
            .filter((n): n is string => !!n && n.trim() !== '')
            .join(' · ')

          return (
            <div
              key={fecha}
              className={[
                'celda-dia',
                fueraMes ? 'fuera-mes' : '',
                esHoy ? 'hoy' : '',
                seleccionado ? 'seleccionado' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ background: fondo }}
              onClick={() => onSeleccionarFecha(fecha)}
            >
              <div
                className="numero"
                style={{
                  color: esFestivo
                    ? '#ef4444'
                    : esHoy
                    ? 'var(--acento)'
                    : 'var(--texto-suave)',
                  fontWeight: esFestivo ? 800 : 700,
                }}
              >
                {d.getDate()}
              </div>

              <div className="chips">
                {turnosDia.map((t) => {
                  const texto = (
                    t.nombre_turno ??
                    t.codigo_turno ??
                    '?'
                  ).toUpperCase()
                  const icono = iconoTurno(t)
                  return (
                    <span
                      key={t.id}
                      className="chip-mini"
                      style={{ background: t.color ?? '#6b7280' }}
                      title={`${icono} ${texto}`.trim()}
                    >
                      {icono && <span style={{ marginRight: 2 }}>{icono}</span>}
                      {texto}
                    </span>
                  )
                })}
              </div>

              {notasDia && (
                <div
                  style={{
                    fontSize: 9,
                    color: 'var(--texto-suave)',
                    marginTop: 3,
                    lineHeight: 1.2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={notasDia}
                >
                  📝 {notasDia}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
