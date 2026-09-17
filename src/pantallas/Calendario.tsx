import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import VistaMensual from './VistaMensual'
import type { Turno, DasStatus } from '../tipos'

export default function Calendario() {
  const { usuario } = useUsuario()

  const [turnos, setTurnos] = useState<Turno[]>([])
  const [dasStatus, setDasStatus] = useState<DasStatus | null>(null)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (usuario) {
      cargarTurnos()
      cargarEstadoDas()
    }
  }, [usuario])

  async function cargarTurnos() {
    if (!usuario) return
    const { data, error } = await supabase
      .from('turno')
      .select(`
        id,
        id_usuario,
        id_departamento,
        id_tipo_turno,
        fecha,
        notas,
        tipo_turno (codigo, nombre, color),
        departamento (nombre)
      `)
      .eq('id_usuario', usuario.id)
      .order('fecha', { ascending: true })

    if (!error && data) {
      setTurnos(
        data.map((t: any) => ({
          id: t.id,
          id_usuario: t.id_usuario,
          id_departamento: t.id_departamento,
          id_tipo_turno: t.id_tipo_turno,
          fecha: t.fecha,
          notas: t.notas,
          codigo_turno: t.tipo_turno?.codigo || '?',
          nombre_turno: t.tipo_turno?.nombre || '?',
          color: t.tipo_turno?.color || '#6b7280',
          departamento: t.departamento?.nombre || '?',
        }))
      )
    }
  }

  async function cargarEstadoDas() {
    if (!usuario) return
    const { data, error } = await supabase.rpc('get_das_status', {
      p_usuario: usuario.id,
    })
    if (!error && data && data[0]) {
      setDasStatus(data[0])
    }
  }

  if (!usuario) return null

  // Turnos del día seleccionado
  const turnosDelDia = turnos.filter((t) => t.fecha === fecha)

  // Formatear la fecha seleccionada en texto largo
  function textoFechaLarga(f: string): string {
    const date = new Date(f + 'T00:00:00')
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
    const txt = date.toLocaleDateString('es-ES', opciones)
    return txt.charAt(0).toUpperCase() + txt.slice(1)
  }

  return (
    <>
      {/* Tarjetas superiores */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card">
          <h4 style={{ color: 'var(--texto-suave)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
            Turnos del mes
          </h4>
          <div className="stat-value">{turnos.length}</div>
          <div className="stat-label">Registrados</div>
        </div>

        <div className="card">
          <h4 style={{ color: 'var(--texto-suave)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
            Vacaciones
          </h4>
          <div className="stat-value">0</div>
          <div className="stat-label">Pendiente de calcular</div>
        </div>

        <div className="card">
          <h4 style={{ color: 'var(--texto-suave)', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' }}>
            DAS
          </h4>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--acento)' }}>
                {dasStatus?.das_generados ?? 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--texto-suave)' }}>Gen.</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--acento)' }}>
                {dasStatus?.das_disfrutados ?? 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--texto-suave)' }}>Disf.</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--acento)' }}>
                {dasStatus?.das_disponibles ?? 0}
              </div>
              <div style={{ fontSize: 11, color: 'var(--texto-suave)' }}>Disp.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <VistaMensual
        turnos={turnos}
        fechaSeleccionada={fecha}
        onSeleccionarFecha={setFecha}
      />

      {/* Panel del día seleccionado */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0 }}>{textoFechaLarga(fecha)}</h3>
          <span
            className="chip"
            style={{
              background: 'var(--fondo-tarjeta-2)',
              color: 'var(--texto-suave)',
              fontSize: 11,
            }}
          >
            {turnosDelDia.length}{' '}
            {turnosDelDia.length === 1 ? 'turno' : 'turnos'}
          </span>
        </div>

        {turnosDelDia.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>
            Este día aún no tiene turnos asignados.
            <br />
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              (La opción de añadir turnos desde aquí llegará en la próxima actualización.)
            </span>
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {turnosDelDia.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  background: 'var(--fondo-tarjeta-2)',
                  borderRadius: 8,
                }}
              >
                <span
                  className="chip"
                  style={{ background: t.color }}
                >
                  {(t.nombre_turno ?? '').toUpperCase()}
                </span>
                <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>
                  {t.departamento}
                </span>
                {t.notas && (
                  <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>
                    · {t.notas}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
