import { useMemo } from 'react'
import { X, Calendar as CalendarIcon } from 'lucide-react'
import type { Turno } from '../tipos'
import { iconoTurno } from '../utilidades/turnos'

interface Props {
  turnos: Turno[]
  anio: number
  mes: number // 0 = enero
  onCerrar: () => void
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DIAS_SEMANA_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function ModalTurnosMes({
  turnos,
  anio,
  mes,
  onCerrar,
}: Props) {
  // Filtrar turnos del mes visible, ordenados por fecha
  const turnosMes = useMemo(() => {
    return turnos
      .filter((t) => {
        const d = new Date(t.fecha + 'T00:00:00')
        return d.getFullYear() === anio && d.getMonth() === mes
      })
      .sort((a, b) => {
        const cmp = a.fecha.localeCompare(b.fecha)
        if (cmp !== 0) return cmp
        return (a.orden_turno ?? 100) - (b.orden_turno ?? 100)
      })
  }, [turnos, anio, mes])

  // Agrupar por fecha
  const porDia = useMemo(() => {
    const mapa = new Map<string, Turno[]>()
    for (const t of turnosMes) {
      if (!mapa.has(t.fecha)) mapa.set(t.fecha, [])
      mapa.get(t.fecha)!.push(t)
    }
    return Array.from(mapa.entries())
  }, [turnosMes])

  // Resumen por tipo
  const resumenPorTipo = useMemo(() => {
    const cuenta = new Map<
      string,
      { nombre: string; color: string; total: number }
    >()
    for (const t of turnosMes) {
      const codigo = t.codigo_turno || '?'
      if (!cuenta.has(codigo)) {
        cuenta.set(codigo, {
          nombre: t.nombre_turno || '?',
          color: t.color || '#6b7280',
          total: 0,
        })
      }
      cuenta.get(codigo)!.total++
    }
    return Array.from(cuenta.entries()).sort((a, b) =>
      (a[1].nombre ?? '').localeCompare(b[1].nombre ?? '')
    )
  }, [turnosMes])

  function textoFechaCorta(f: string): { dia: string; num: number; mes: string } {
    const d = new Date(f + 'T00:00:00')
    return {
      dia: DIAS_SEMANA_CORTOS[d.getDay()],
      num: d.getDate(),
      mes: NOMBRES_MESES[d.getMonth()].slice(0, 3).toLowerCase(),
    }
  }

  function colorDiaSemana(f: string): string {
    const d = new Date(f + 'T00:00:00')
    const dia = d.getDay()
    if (dia === 0 || dia === 6) return '#ef4444'
    return 'var(--texto-suave)'
  }

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div
        className="modal-ventana"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560 }}
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
            <CalendarIcon size={20} color="var(--acento)" />
            <div className="modal-titulo">
              Turnos de {NOMBRES_MESES[mes]} {anio}
            </div>
          </div>
          <button
            className="modal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>

        {/* Resumen */}
        <div
          className="modal-seccion"
          style={{
            background: 'var(--fondo-tarjeta-2)',
            padding: 12,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <div className="modal-seccion-titulo">
            Resumen · {turnosMes.length}{' '}
            {turnosMes.length === 1 ? 'turno' : 'turnos'}
          </div>

          {resumenPorTipo.length === 0 ? (
            <p
              style={{
                fontSize: 12,
                color: 'var(--texto-suave)',
                margin: 0,
              }}
            >
              No hay turnos en este mes.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {resumenPorTipo.map(([codigo, datos]) => (
                <span
                  key={codigo}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    background: 'var(--fondo-tarjeta)',
                    borderRadius: 20,
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: datos.color,
                    }}
                  />
                  <strong style={{ color: 'var(--texto)' }}>
                    {datos.total}
                  </strong>
                  <span style={{ color: 'var(--texto-suave)' }}>
                    {datos.nombre}
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Listado por día */}
        {porDia.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 30,
              color: 'var(--texto-suave)',
              fontSize: 12,
            }}
          >
            <CalendarIcon
              size={40}
              color="var(--texto-suave)"
              style={{ opacity: 0.4, marginBottom: 8 }}
            />
            <p>No hay turnos registrados en este mes.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: '55vh',
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            {porDia.map(([fecha, lista]) => {
              const { dia, num, mes: mesAbr } = textoFechaCorta(fecha)
              return (
                <div
                  key={fecha}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    paddingBottom: 8,
                    borderBottom: '1px solid var(--borde)',
                  }}
                >
                  {/* Columna de fecha */}
                  <div
                    style={{
                      minWidth: 48,
                      textAlign: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        color: colorDiaSemana(fecha),
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {dia}
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        lineHeight: 1,
                        color: 'var(--texto)',
                      }}
                    >
                      {num}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: 'var(--texto-suave)',
                        textTransform: 'lowercase',
                      }}
                    >
                      {mesAbr}
                    </div>
                  </div>

                  {/* Turnos del día */}
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    {lista.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '6px 8px',
                          background: 'var(--fondo-tarjeta-2)',
                          borderRadius: 6,
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 16,
                            flexShrink: 0,
                          }}
                        >
                          {iconoTurno(t)}
                        </span>
                        <span
                          className="chip"
                          style={{
                            background: t.color,
                            flexShrink: 0,
                            fontSize: 9,
                            padding: '2px 6px',
                          }}
                        >
                          {t.codigo_turno}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: 11,
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 600,
                              color: 'var(--texto)',
                            }}
                          >
                            {t.nombre_turno}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: 'var(--texto-suave)',
                            }}
                          >
                            {t.hora_inicio && t.hora_fin
                              ? `${t.hora_inicio.slice(0, 5)} – ${t.hora_fin.slice(0, 5)}`
                              : 'Todo el día'}
                            {' · '}
                            {t.departamento}
                          </div>
                          {t.notas && (
                            <div
                              style={{
                                fontSize: 10,
                                color: 'var(--texto-suave)',
                                marginTop: 2,
                                overflowWrap: 'break-word',
                              }}
                            >
                              📝 {t.notas}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button
          className="btn btn-secondary"
          onClick={onCerrar}
          style={{ width: '100%', marginTop: 12 }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
