import { useMemo, useState, useEffect } from 'react'
import type { Turno } from '../tipos'

interface Props {
  turnos: Turno[]
  onSeleccionarFecha: (fecha: string) => void
}

const MESES_CORTOS = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
]

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function aTexto(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function diaSemanaLunes(fecha: Date): number {
  const d = fecha.getDay()
  return d === 0 ? 6 : d - 1
}

export default function VistaAnual({ turnos, onSeleccionarFecha }: Props) {
  const hoy = new Date()
  const [anio, setAnio] = useState<number>(hoy.getFullYear())

  useEffect(() => {
    const f = new Date()
    setAnio(f.getFullYear())
  }, [])

  // Indexamos los turnos por fecha para búsquedas rápidas
  const turnosPorFecha = useMemo(() => {
    const mapa = new Map<string, Turno[]>()
    for (const t of turnos) {
      if (!mapa.has(t.fecha)) mapa.set(t.fecha, [])
      mapa.get(t.fecha)!.push(t)
    }
    return mapa
  }, [turnos])

  // Datos por mes
  const meses = useMemo(() => {
    const lista: {
      mes: number
      dias: Date[]
      totalTurnos: number
      totalTrabajo: number
      totalVacaciones: number
      totalDas: number
    }[] = []

    for (let m = 0; m < 12; m++) {
      const primerDia = new Date(anio, m, 1)
      const offset = diaSemanaLunes(primerDia)
      const inicio = new Date(primerDia)
      inicio.setDate(primerDia.getDate() - offset)

      // 6 semanas = 42 celdas
      const dias: Date[] = []
      for (let i = 0; i < 42; i++) {
        const d = new Date(inicio)
        d.setDate(inicio.getDate() + i)
        dias.push(d)
      }

      // Contar turnos del mes
      let trabajo = 0
      let vac = 0
      let das = 0
      for (const [fecha, ts] of turnosPorFecha.entries()) {
        const f = new Date(fecha + 'T00:00:00')
        if (f.getFullYear() === anio && f.getMonth() === m) {
          for (const t of ts) {
            if (t.codigo_turno === 'VAC') vac++
            else if (t.codigo_turno === 'DAS') das++
            else if (['M', 'T', 'N'].includes(t.codigo_turno ?? '')) trabajo++
          }
        }
      }

      lista.push({
        mes: m,
        dias,
        totalTurnos: trabajo + vac + das,
        totalTrabajo: trabajo,
        totalVacaciones: vac,
        totalDas: das,
      })
    }

    return lista
  }, [anio, turnosPorFecha])

  function anioAnterior() {
    setAnio(anio - 1)
  }
  function anioSiguiente() {
    setAnio(anio + 1)
  }
  function irAnioActual() {
    setAnio(hoy.getFullYear())
  }

  return (
    <div className="card">
      <div className="mes-navegador">
        <button onClick={anioAnterior} aria-label="Año anterior">
          ‹
        </button>
        <div className="mes-titulo">Año {anio}</div>
        <button onClick={irAnioActual} className="btn-hoy">
          HOY
        </button>
        <button onClick={anioSiguiente} aria-label="Año siguiente">
          ›
        </button>
      </div>

      <div className="rejilla-anual">
        {meses.map(({ mes, dias, totalTrabajo, totalVacaciones, totalDas }) => {
          const esMesActual =
            mes === hoy.getMonth() && anio === hoy.getFullYear()

          return (
            <div
              key={mes}
              className={`mini-mes ${esMesActual ? 'actual' : ''}`}
            >
              <div className="mini-mes-titulo">
                {MESES_CORTOS[mes]}
              </div>

              <div className="mini-rejilla">
                {DIAS_SEMANA.map((d, i) => (
                  <div key={i} className="mini-cabecera">
                    {d}
                  </div>
                ))}
                {dias.map((d, i) => {
                  const fecha = aTexto(d)
                  const fueraMes = d.getMonth() !== mes
                  const esHoy =
                    d.getDate() === hoy.getDate() &&
                    d.getMonth() === hoy.getMonth() &&
                    d.getFullYear() === hoy.getFullYear()
                  const turnosDia = turnosPorFecha.get(fecha) ?? []

                  return (
                    <div
                      key={i}
                      className={`mini-dia ${
                        fueraMes ? 'fuera' : ''
                      } ${esHoy ? 'hoy' : ''} ${
                        turnosDia.length > 0 ? 'con-datos' : ''
                      }`}
                      onClick={() => !fueraMes && onSeleccionarFecha(fecha)}
                      title={
                        turnosDia.length > 0
                          ? turnosDia
                              .map((t) => t.nombre_turno ?? t.codigo_turno)
                              .join(', ')
                          : undefined
                      }
                    >
                      <span className="mini-num">{d.getDate()}</span>
                      {turnosDia.length > 0 && (
                        <span className="mini-puntos">
                          {turnosDia.slice(0, 3).map((t, j) => (
                            <span
                              key={j}
                              className="mini-punto"
                              style={{
                                background: t.color ?? '#6b7280',
                              }}
                            />
                          ))}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="mini-totales">
                {totalTrabajo > 0 && (
                  <span className="mini-tot">
                    <strong>{totalTrabajo}</strong> t.
                  </span>
                )}
                {totalVacaciones > 0 && (
                  <span className="mini-tot mini-vac">
                    <strong>{totalVacaciones}</strong> vac
                  </span>
                )}
                {totalDas > 0 && (
                  <span className="mini-tot mini-das">
                    <strong>{totalDas}</strong> DAS
                  </span>
                )}
                {totalTrabajo === 0 &&
                  totalVacaciones === 0 &&
                  totalDas === 0 && (
                    <span className="mini-vacio">—</span>
                  )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
