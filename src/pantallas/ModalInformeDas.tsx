import { useState } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { X, FileText, Gift, CheckCircle2, Clock } from 'lucide-react'
import { iconoTurno } from '../utilidades/turnos'

interface Props {
  onCerrar: () => void
}

interface Evento {
  categoria: 'festivo' | 'nocturno' | 'das'
  fecha: string
  codigo_turno: string
  nombre_turno: string
  color: string
  hora_inicio: string | null
  hora_fin: string | null
  nombre_departamento: string
  icono_departamento: string
  notas: string | null
  es_pasado: boolean
}

export default function ModalInformeDas({ onCerrar }: Props) {
  const { usuario } = useUsuario()

  const anioActual = new Date().getFullYear()
  const [fechaInicio, setFechaInicio] = useState(`${anioActual}-01-01`)
  const [fechaFin, setFechaFin] = useState(`${anioActual}-12-31`)

  const [eventos, setEventos] = useState<Evento[]>([])
  const [cargando, setCargando] = useState(false)
  const [generado, setGenerado] = useState(false)
  const [error, setError] = useState('')

  if (!usuario) return null

  async function generar() {
    if (!usuario) return
    setError('')
    setCargando(true)
    setGenerado(false)

    const { data, error } = await supabase.rpc('get_informe_das', {
      p_usuario: usuario.id,
      p_fecha_inicio: fechaInicio,
      p_fecha_fin: fechaFin,
    })

    setCargando(false)

    if (error) {
      setError(error.message)
      return
    }

    setEventos((data ?? []) as Evento[])
    setGenerado(true)
  }

  // Separamos por categoría
  const festivos = eventos.filter((e) => e.categoria === 'festivo')
  const noches = eventos.filter((e) => e.categoria === 'nocturno')
  const dasDisfrutados = eventos.filter((e) => e.categoria === 'das')

  // Cálculo de DAS generados
  const dasPorFestivos = Math.floor(festivos.length / 3)
  const dasPorNoches = Math.floor(noches.length / 6)
  const dasGenerados = dasPorFestivos + dasPorNoches
  const residuoFestivos = festivos.length % 3
  const residuoNoches = noches.length % 6
  const dasDisfrutadosTotal = dasDisfrutados.length
  const saldoNeto = dasGenerados - dasDisfrutadosTotal

  function textoFecha(f: string): string {
    const date = new Date(f + 'T00:00:00')
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    }
    const txt = date.toLocaleDateString('es-ES', opciones)
    return txt.charAt(0).toUpperCase() + txt.slice(1)
  }

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div
        className="modal-ventana"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 720 }}
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
            <FileText size={22} color="var(--acento)" />
            <div className="modal-titulo">Informe de DAS</div>
          </div>
          <button
            className="modal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>

        {/* Filtros */}
        <div className="modal-seccion">
          <div className="fila-form">
            <div>
              <label className="label">Desde</label>
              <input
                className="input"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Hasta</label>
              <input
                className="input"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={generar}
            disabled={cargando}
            style={{ width: '100%', marginTop: 4 }}
          >
            {cargando ? 'Generando…' : 'Generar informe'}
          </button>

          {error && <p className="error">{error}</p>}
        </div>

        {/* Resultado */}
        {generado && (
          <>
            {/* Resumen */}
            <div
              className="modal-seccion"
              style={{
                background: 'var(--fondo-tarjeta-2)',
                padding: 12,
                borderRadius: 10,
              }}
            >
              <div className="modal-seccion-titulo">Resumen del rango</div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <MiniResumen
                  icono="🎉"
                  etiqueta="Festivos trabajados"
                  valor={festivos.length}
                  sub={`${dasPorFestivos} DAS${
                    residuoFestivos > 0
                      ? ` · ${residuoFestivos} ${
                          residuoFestivos === 1 ? 'residuo' : 'residuos'
                        }`
                      : ''
                  }`}
                />
                <MiniResumen
                  icono="🌙"
                  etiqueta="Noches trabajadas"
                  valor={noches.length}
                  sub={`${dasPorNoches} DAS${
                    residuoNoches > 0
                      ? ` · ${residuoNoches} ${
                          residuoNoches === 1 ? 'residuo' : 'residuos'
                        }`
                      : ''
                  }`}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                  paddingTop: 10,
                  borderTop: '1px solid var(--borde)',
                }}
              >
                <MiniResumen
                  icono="🎁"
                  etiqueta="DAS generados"
                  valor={dasGenerados}
                  color="var(--exito)"
                />
                <MiniResumen
                  icono="✅"
                  etiqueta="DAS disfrutados"
                  valor={dasDisfrutadosTotal}
                  color="var(--acento)"
                />
                <MiniResumen
                  icono="⚖️"
                  etiqueta="Saldo neto"
                  valor={saldoNeto}
                  color={saldoNeto >= 0 ? 'var(--exito)' : 'var(--peligro)'}
                />
              </div>

              <p
                style={{
                  fontSize: 10,
                  color: 'var(--texto-suave)',
                  marginTop: 10,
                  lineHeight: 1.4,
                }}
              >
                El informe cuenta los eventos dentro del rango seleccionado.
                Puede que el DAS real coincida o no con el conteo si tienes
                eventos anteriores fuera del rango.
              </p>
            </div>

            {/* Festivos */}
            {festivos.length > 0 && (
              <div className="modal-seccion">
                <div className="modal-seccion-titulo">
                  🎉 Festivos y fines de semana ({festivos.length})
                </div>
                <TablaEventos
                  eventos={festivos}
                  tamanoCiclo={3}
                  textoFecha={textoFecha}
                />
              </div>
            )}

            {/* Noches */}
            {noches.length > 0 && (
              <div className="modal-seccion">
                <div className="modal-seccion-titulo">
                  🌙 Noches entre semana ({noches.length})
                </div>
                <TablaEventos
                  eventos={noches}
                  tamanoCiclo={6}
                  textoFecha={textoFecha}
                />
              </div>
            )}

            {/* DAS disfrutados */}
            {dasDisfrutados.length > 0 && (
              <div className="modal-seccion">
                <div className="modal-seccion-titulo">
                  ✅ DAS disfrutados ({dasDisfrutados.length})
                </div>
                {dasDisfrutados.map((e, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: 8,
                      background: 'var(--fondo-tarjeta-2)',
                      borderRadius: 8,
                      marginBottom: 6,
                      fontSize: 11,
                    }}
                  >
                    <Gift size={16} color="var(--acento)" />
                    <span
                      style={{
                        fontWeight: 600,
                        minWidth: 70,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {textoFecha(e.fecha)}
                    </span>
                    <span
                      style={{
                        color: 'var(--texto-suave)',
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {e.notas ?? 'Día DAS disfrutado'}
                    </span>
                    {!e.es_pasado && (
                      <Clock size={14} color="var(--texto-suave)" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Sin eventos */}
            {eventos.length === 0 && (
              <div className="modal-seccion">
                <p
                  style={{
                    textAlign: 'center',
                    color: 'var(--texto-suave)',
                    fontSize: 12,
                    padding: 20,
                  }}
                >
                  No hay eventos en este rango de fechas.
                </p>
              </div>
            )}
          </>
        )}

        <button
          className="btn btn-secondary"
          onClick={onCerrar}
          style={{ width: '100%' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}

// ─────────── Auxiliares ───────────

function MiniResumen({
  icono,
  etiqueta,
  valor,
  sub,
  color,
}: {
  icono: string
  etiqueta: string
  valor: number
  sub?: string
  color?: string
}) {
  return (
    <div
      style={{
        background: 'var(--fondo-tarjeta)',
        padding: 10,
        borderRadius: 8,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 18, marginBottom: 2 }}>{icono}</div>
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: color ?? 'var(--texto)',
          lineHeight: 1.1,
        }}
      >
        {valor}
      </div>
      <div
        style={{
          fontSize: 9,
          color: 'var(--texto-suave)',
          textTransform: 'uppercase',
          marginTop: 2,
          letterSpacing: 0.3,
          fontWeight: 600,
        }}
      >
        {etiqueta}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 10,
            color: 'var(--texto-suave)',
            marginTop: 3,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  )
}

function TablaEventos({
  eventos,
  tamanoCiclo,
  textoFecha,
}: {
  eventos: Evento[]
  tamanoCiclo: number
  textoFecha: (f: string) => string
}) {
  return (
    <div>
      {eventos.map((e, i) => {
        const posicion = (i % tamanoCiclo) + 1
        const generaDas = posicion === tamanoCiclo

        return (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 8,
              background: generaDas
                ? 'rgba(22, 163, 74, 0.12)'
                : 'var(--fondo-tarjeta-2)',
              border: generaDas
                ? '1px solid rgba(22, 163, 74, 0.35)'
                : '1px solid transparent',
              borderRadius: 8,
              marginBottom: 6,
              fontSize: 11,
              minWidth: 0,
            }}
          >
            {/* Indicador pasado / futuro */}
            <div style={{ flexShrink: 0 }}>
              {e.es_pasado ? (
                <CheckCircle2 size={16} color="var(--exito)" />
              ) : (
                <Clock size={16} color="var(--texto-suave)" />
              )}
            </div>

            {/* Fecha */}
            <span
              style={{
                fontWeight: 600,
                minWidth: 68,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {textoFecha(e.fecha)}
            </span>

            {/* Chip del turno */}
            <span
              className="chip"
              style={{
                background: e.color,
                fontSize: 9,
                padding: '2px 6px',
                flexShrink: 0,
              }}
            >
              {e.codigo_turno}
            </span>

            {/* Departamento */}
            <span
              style={{
                color: 'var(--texto-suave)',
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {e.icono_departamento} {e.nombre_departamento}
            </span>

            {/* Posición en ciclo */}
            <span
              style={{
                fontSize: 10,
                color: 'var(--texto-suave)',
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {posicion}/{tamanoCiclo}
            </span>

            {/* Regalo si genera DAS */}
            {generaDas && (
              <span
                style={{ display: 'flex', flexShrink: 0 }}
                title="Genera 1 DAS"
              >
                <Gift size={15} color="var(--exito)" />
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
