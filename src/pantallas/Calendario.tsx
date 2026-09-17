import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import type { Turno, DasStatus } from '../tipos'

export default function Calendario() {
  const { usuario } = useUsuario()

  const [turnos, setTurnos] = useState<Turno[]>([])
  const [dasStatus, setDasStatus] = useState<DasStatus | null>(null)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [codigoTurno, setCodigoTurno] = useState('M')
  const [departamento, setDepartamento] = useState('Patrulla')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [tiposTurno, setTiposTurno] = useState<{ codigo: string; nombre: string }[]>([])

  useEffect(() => {
    if (usuario) {
      cargarTurnos()
      cargarEstadoDas()
      cargarTiposTurno()
    }
  }, [usuario])

  async function cargarTiposTurno() {
    const { data } = await supabase
      .from('tipo_turno')
      .select('codigo, nombre')
      .order('codigo')
    if (data) setTiposTurno(data)
  }

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
      .order('fecha', { ascending: false })
      .limit(50)

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

  async function anadirTurno(e: React.FormEvent) {
    e.preventDefault()
    if (!usuario) return
    setError('')
    setMensaje('')

    const { data: dept } = await supabase
      .from('departamento')
      .select('id')
      .eq('nombre', departamento)
      .single()

    if (!dept) {
      setError('Departamento no válido')
      return
    }

    const { data: tipo } = await supabase
      .from('tipo_turno')
      .select('id')
      .eq('codigo', codigoTurno)
      .single()

    if (!tipo) {
      setError('Tipo de turno no válido')
      return
    }

    const { error } = await supabase.from('turno').insert({
      id_usuario: usuario.id,
      id_departamento: dept.id,
      fecha,
      id_tipo_turno: tipo.id,
    })

    if (error) {
      if (error.code === '23505') setError('Ya tienes ese turno en esa fecha')
      else setError(error.message)
    } else {
      setMensaje('Turno añadido correctamente')
      cargarTurnos()
      cargarEstadoDas()
    }
  }

  async function borrarTurno(id: string) {
    if (!confirm('¿Seguro que quieres borrar este turno?')) return
    await supabase.from('turno').delete().eq('id', id)
    cargarTurnos()
    cargarEstadoDas()
  }

  if (!usuario) return null

  return (
    <>
      {/* Panel de contadores DAS */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Mis DAS</h3>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="stat">
            <div className="stat-value">{dasStatus?.das_disponibles ?? 0}</div>
            <div className="stat-label">DAS disponibles</div>
          </div>
          <div className="stat">
            <div className="stat-value">{dasStatus?.das_generados ?? 0}</div>
            <div className="stat-label">DAS generados</div>
          </div>
          <div className="stat">
            <div className="stat-value">{dasStatus?.das_disfrutados ?? 0}</div>
            <div className="stat-label">DAS disfrutados</div>
          </div>
          <div className="stat">
            <div className="stat-value">{dasStatus?.das_remanente_manual ?? 0}</div>
            <div className="stat-label">Remanente anterior</div>
          </div>
        </div>
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--texto-suave)' }}>
          <p>
            Festivos trabajados: <strong>{dasStatus?.festivos_validos ?? 0}</strong>{' '}
            (faltan {3 - (dasStatus?.festivos_restantes ?? 0)} para el próximo DAS)
          </p>
          <p>
            Noches trabajadas: <strong>{dasStatus?.noches_validas ?? 0}</strong>{' '}
            (faltan {6 - (dasStatus?.noches_restantes ?? 0)} para el próximo DAS)
          </p>
        </div>
      </div>

      {/* Formulario de alta de turno */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Añadir turno</h3>
        <form onSubmit={anadirTurno}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr auto',
              gap: 12,
              alignItems: 'end',
            }}
          >
            <div>
              <label className="label">Fecha</label>
              <input
                className="input"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Tipo de turno</label>
              <select
                className="input"
                value={codigoTurno}
                onChange={(e) => setCodigoTurno(e.target.value)}
              >
                {tiposTurno.map((t) => (
                  <option key={t.codigo} value={t.codigo}>
                    {t.codigo} — {t.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Departamento</label>
              <select
                className="input"
                value={departamento}
                onChange={(e) => setDepartamento(e.target.value)}
              >
                <option value="Patrulla">Patrulla</option>
                <option value="Oficina">Oficina</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit">
              Añadir
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}
        </form>
      </div>

      {/* Listado de turnos */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Mis turnos recientes</h3>
        {turnos.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>
            Aún no tienes turnos registrados. Añade el primero arriba.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Turno</th>
                <th>Departamento</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {turnos.map((t) => (
                <tr key={t.id}>
                  <td>{t.fecha}</td>
                  <td>
                    <span
                      className="chip"
                      style={{ background: t.color }}
                    >
                      {t.nombre_turno?.toUpperCase()}
                    </span>
                  </td>
                  <td>{t.departamento}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-danger"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                      onClick={() => borrarTurno(t.id)}
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
