import { useMemo, useState, useEffect } from 'react'
import type { Turno } from '../tipos'

interface Props {
  turnos: Turno[]
  fechaSeleccionada: string
  onSeleccionarFecha: (fecha: string) => void
}

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// ─────────── Utilidades de fecha ───────────

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

// Lunes = 0, ..., Domingo = 6
function diaSemanaLunes(fecha: Date): number {
  const d = fecha.getDay() // 0 = domingo
  return d === 0 ? 6 : d - 1
}

// ─────────── Componente ───────────

export default function VistaMensual({
  turnos,
  fechaSeleccionada,
  onSeleccionarFecha,
}: Props) {
  const hoy = new Date()
  const [mesActual, setMesActual] = useState<Date>(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  )

  // Cuando cambia la fecha seleccionada desde fuera, movemos el mes
  useEffect(() => {
    const f = new Date(fechaSeleccionada)
    setMesActual(new Date(f.getFullYear(), f.getMonth(), 1))
  }, [fechaSeleccionada])

  // Mapa fecha → turnos de ese día
  const turnosPorFecha = useMemo(() => {
    const mapa = new Map<string, Turno[]>()
    for (const t of turnos) {
      if (!mapa.has(t.fecha)) mapa.set(t.fecha, [])
      mapa.get(t.fecha)!.push(t)
    }
    return mapa
  }, [turnos])

  // Días que se muestran en la rejilla (42 celdas = 6 semanas)
  const dias = useMemo(() => {
    const primerDia = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1)
    const offset = diaSemanaLunes(primerDia) // 0 = lunes
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
              onClick={() => onSeleccionarFecha(fecha)}
            >
              <div className="numero">{d.getDate()}</div>
              <div className="chips">
                {turnosDia.map((t) => {
                  const esFestivo = t.codigo_turno === 'N' && t.fecha
                  const texto = (t.nombre_turno ?? t.codigo_turno ?? '?').toUpperCase()
                  return (
                    <span
                      key={t.id}
                      className="chip-mini"
                      style={{ background: t.color ?? '#6b7280' }}
                      title={texto}
                    >
                      {texto}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
