import { useState, useMemo } from 'react'
import { X } from 'lucide-react'
import type { Turno } from '../tipos'

interface Props {
  turnos: Turno[]
  onCerrar: () => void
}

type Pestana = 'vacaciones' | 'asuntos'

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const DIAS_SEMANA_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export default function ModalVacacionesAsuntos({
  turnos,
  onCerrar,
}: Props) {
  const [pestana, setPestana] = useState<Pestana>('vacaciones')

  const vacaciones = useMemo(() => {
    return turnos
      .filter((t) => t.codigo_turno === 'VAC')
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [turnos])

  const asuntos = useMemo(() => {
    return turnos
      .filter((t) => t.codigo_turno === 'AP')
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
  }, [turnos])

  const listaActual = pestana === 'vacaciones' ? vacaciones : asuntos

  const porAnio = useMemo(() => {
    const mapa = new Map<number, Turno[]>()
    for (const t of listaActual) {
      const anio = new Date(t.fecha + 'T00:00:00').getFullYear()
      if (!mapa.has(anio)) mapa.set(anio, [])
      mapa.get(anio)!.push(t)
    }
    return Array.from(mapa.entries()).sort((a, b) => b[0] - a[0])
  }, [listaActual])

  function textoFechaCorta(f: string): {
    dia: string
    num: number
    mes: string
  } {
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
        style={{ maxWidth: 520 }}
      >
        <div className="modal-cabecera">
          <div className="modal-titulo">
            {pestana === 'vacaciones' ? 'Vacaciones' : 'Asuntos Propios'}
          </div>
          <button
            className="modal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>

        {/* Pestañas */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginBottom: 12,
            padding: 3,
            background: 'var(--fondo-tarjeta-2)',
            borderRadius: 8,
          }}
        >
          <button
            type="button"
            onClick={() => setPestana('vacaciones')}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '8px 10px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background:
                pestana === 'vacaciones' ? 'var(--acento)' : 'transparent',
              color:
                pestana === 'vacaciones'
                  ? 'var(--acento-texto)'
                  : 'var(--texto-suave)',
            }}
          >
            🏖️ Vacaciones ({vacaciones.length})
          </button>
          <button
            type="button"
            onClick={() => setPestana('asuntos')}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '8px 10px',
              fontSize: 12,
              fontWeight: 600,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              background:
                pestana === 'asuntos' ? 'var(--acento)' : 'transparent',
              color:
                pestana === 'asuntos'
                  ? 'var(--acento-texto)'
                  : 'var(--texto-suave)',
            }}
          >
            📋 Asuntos ({asuntos.length})
          </button>
        </div>

        {/* Listado */}
        {listaActual.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 30,
              color: 'var(--texto-suave)',
              fontSize: 12,
            }}
          >
            <div style={{ fontSize: 40, opacity: 0.4, marginBottom: 8 }}>
              {pestana === 'vacaciones' ? '🏖️' : '📋'}
            </div>
            <p>
              No hay{' '}
              {pestana === 'vacaciones'
                ? 'vacaciones'
                : 'asuntos propios'}{' '}
              registrados.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxHeight: '55vh',
              overflowY: 'auto',
              paddingRight: 4,
            }}
          >
            {porAnio.map(([anio, lista]) => (
              <div key={anio}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'var(--acento)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 6,
                    paddingBottom: 3,
                    borderBottom: '1px solid var(--borde)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{anio}</span>
                  <span style={{ color: 'var(--texto-suave)' }}>
                    {lista.length} {lista.length === 1 ? 'día' : 'días'}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  {lista.map((t) => {
                    const { dia, num, mes } = textoFechaCorta(t.fecha)
                    return (
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
                        <div
                          style={{
                            minWidth: 44,
                            textAlign: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 8,
                              fontWeight: 800,
                              color: colorDiaSemana(t.fecha),
                              textTransform: 'uppercase',
                            }}
                          >
                            {dia}
                          </div>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              lineHeight: 1,
                              color: 'var(--texto)',
                            }}
                          >
                            {num}
                          </div>
                          <div
                            style={{
                              fontSize: 8,
                              color: 'var(--texto-suave)',
                            }}
                          >
                            {mes}
                          </div>
                        </div>

                        <div
                          style={{
                            flex: 1,
                            minWidth: 0,
                            fontSize: 11,
                          }}
                        >
                          {t.anio_origen && (
                            <div
                              style={{
                                fontSize: 10,
                                color: 'var(--texto-suave)',
                              }}
                            >
                              Origen: {t.anio_origen}
                            </div>
                          )}
                          {t.notas ? (
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--texto)',
                                overflowWrap: 'break-word',
                              }}
                            >
                              {t.notas}
                            </div>
                          ) : (
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--texto-suave)',
                                fontStyle: 'italic',
                              }}
                            >
                              Sin notas
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
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
