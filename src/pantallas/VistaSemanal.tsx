import { useMemo, useState, useEffect } from 'react'
import type { Turno } from '../tipos'
import { iconoTurno, muestraDepartamento } from '../utilidades/turnos'

interface Props {
  turnos: Turno[]
  fechaSeleccionada: string
  onSeleccionarFecha: (fecha: string) => void
}

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const DIAS_COMPLETOS = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

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
  const d = fecha.getDay()
  return d === 0 ? 6 : d - 1
}

// Devuelve el lunes de la semana de la fecha dada
function inicioSemana(fecha: Date): Date {
  const offset = diaSemanaLunes(fecha)
  const lunes = new Date(fecha)
  lunes.setDate(fecha.getDate() - offset)
  lunes.setHours(0, 0, 0, 0)
  return lunes
}

// ─────────── Componente ───────────

export default function VistaSemanal({
  turnos,
  fechaSeleccionada,
  onSeleccionarFecha,
}: Props) {
  const hoy = new Date()

  // Semana actual mostrada (basada en la fecha seleccionada)
  const [semanaInicio, setSemanaInicio] = useState<Date>(() =>
    inicioSemana(new Date(fechaSeleccionada + 'T00:00:00'))
  )

  useEffect(() => {
    setSemanaInicio(inicioSemana(new Date(fechaSeleccionada + 'T00:00:00')))
  }, [fechaSeleccionada])

  // Turnos indexados por fecha
  const turnosPorFecha = useMemo(() => {
    const mapa = new Map<string, Turno[]>()
    for (const t of turnos) {
      if (!mapa.has(t.fecha)) mapa.set(t.fecha, [])
      mapa.get(t.fecha)!.push(t)
    }
    // Ordenar por campo "orden_turno"
    for (const lista of mapa.values()) {
      lista.sort((a, b) => (a.orden_turno ?? 100) - (b.orden_turno ?? 100))
    }
    return mapa
  }, [turnos])

  // Días de la semana mostrada (7 días, de lunes a domingo)
  const dias = useMemo(() => {
    const lista: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(semanaInicio)
      d.setDate(semanaInicio.getDate() + i)
      lista.push(d)
    }
    return lista
  }, [semanaInicio])

  function semanaAnterior() {
    const nueva = new Date(semanaInicio)
    nueva.setDate(semanaInicio.getDate() - 7)
    setSemanaInicio(nueva)
  }

  function semanaSiguiente() {
    const nueva = new Date(semanaInicio)
    nueva.setDate(semanaInicio.getDate() + 7)
    setSemanaInicio(nueva)
  }

  function irHoy() {
    setSemanaInicio(inicioSemana(hoy))
    onSeleccionarFecha(aTexto(hoy))
  }

  // Formatear el rango de la semana ("14 – 20 de octubre 2025")
  const primerDia = dias[0]
  const ultimoDia = dias[6]
  const mismoMes = primerDia.getMonth() === ultimoDia.getMonth()
  const titulo = mismoMes
    ? `${primerDia.getDate()} – ${ultimoDia.getDate()} de ${
        MESES[primerDia.getMonth()]
      } ${primerDia.getFullYear()}`
    : `${primerDia.getDate()} ${MESES[primerDia.getMonth()]} – ${
        ultimoDia.getDate()
      } ${MESES[ultimoDia.getMonth()]} ${ultimoDia.getFullYear()}`

  return (
    <div className="card">
      <div className="mes-navegador">
        <button onClick={semanaAnterior} aria-label="Semana anterior">
          ‹
        </button>
        <div className="mes-titulo">{titulo}</div>
        <button onClick={irHoy} className="btn-hoy" aria-label="Ir a hoy">
          HOY
        </button>
        <button onClick={semanaSiguiente} aria-label="Semana siguiente">
          ›
        </button>
      </div>

      <div className="rejilla-semanal">
        {dias.map((d, i) => {
          const fecha = aTexto(d)
          const turnosDia = turnosPorFecha.get(fecha) ?? []
          const esHoy = mismoDia(d, hoy)
          const seleccionado = fecha === fechaSeleccionada

          return (
            <div
              key={fecha}
              className={[
                'columna-dia',
                esHoy ? 'hoy' : '',
                seleccionado ? 'seleccionado' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSeleccionarFecha(fecha)}
            >
              <div className="columna-cabecera">
                <div className="dia-corto">{DIAS_SEMANA[i]}</div>
                <div className="dia-num">{d.getDate()}</div>
                <div className="dia-completo">{DIAS_COMPLETOS[i]}</div>
              </div>

              <div className="columna-turnos">
                {turnosDia.length === 0 ? (
                  <div className="vacio">—</div>
                ) : (
                  turnosDia.map((t) => (
                    <div
                      key={t.id}
                      className="turno-semana"
                      style={{
                        borderLeft: `4px solid ${t.color ?? '#6b7280'}`,
                      }}
                    >
                                            <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: t.color,
                        }}
                      >
                        <span>{iconoTurno(t)}</span>
                        <span>{t.nombre_turno ?? '?'}</span>
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: 'var(--texto-suave)',
                          marginTop: 2,
                        }}
                      >
                        {t.hora_inicio && t.hora_fin
                          ? `${t.hora_inicio.slice(0, 5)} – ${t.hora_fin.slice(0, 5)}`
                          : 'Todo el día'}
                      </div>
                      {muestraDepartamento(t) && (
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--texto-suave)',
                          }}
                        >
                          {t.departamento}
                        </div>
                      )}
                      {t.notas && (
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--texto-suave)',
                            marginTop: 3,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={t.notas}
                        >
                          📝 {t.notas}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
