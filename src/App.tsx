import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

// ─────────── Tipos ───────────
interface Turno {
  id: string
  id_usuario: string
  fecha: string
  codigo_turno: string
  departamento: string
}

interface DasStatus {
  festivos_validos: number
  festivos_restantes: number
  noches_validas: number
  noches_restantes: number
  das_generados: number
  das_disfrutados: number
  das_remanente_manual: number
  das_disponibles: number
}

// ─────────── Aplicación principal ───────────
export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [cargando, setCargando] = useState(true)

  // Estado del formulario de login/registro
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registro, setRegistro] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  // Estado de la aplicación
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [dasStatus, setDasStatus] = useState<DasStatus | null>(null)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [codigoTurno, setCodigoTurno] = useState('M')
  const [departamento, setDepartamento] = useState('Patrulla')

  // ─────────── Verificar sesión al cargar ───────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setCargando(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_evento, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ─────────── Cargar datos cuando hay usuario ───────────
  useEffect(() => {
    if (user) {
      asegurarUsuario()
      cargarTurnos()
      cargarEstadoDas()
    }
  }, [user])

  async function asegurarUsuario() {
    if (!user) return
    const { data: existente } = await supabase
      .from('usuario')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existente) {
      await supabase.from('usuario').insert({
        id: user.id,
        email: user.email!,
        nombre: user.email!.split('@')[0],
        rol: 'usuario',
      })
    }
  }

  async function cargarTurnos() {
    const { data, error } = await supabase
      .from('turno')
      .select(`
        id,
        id_usuario,
        fecha,
        tipo_turno (codigo),
        departamento (nombre)
      `)
      .eq('id_usuario', user!.id)
      .order('fecha', { ascending: false })
      .limit(50)

    if (!error && data) {
      setTurnos(
        data.map((t: any) => ({
          id: t.id,
          id_usuario: t.id_usuario,
          fecha: t.fecha,
          codigo_turno: t.tipo_turno?.codigo || '?',
          departamento: t.departamento?.nombre || '?',
        }))
      )
    }
  }

  async function cargarEstadoDas() {
    const { data, error } = await supabase.rpc('get_das_status', {
      p_usuario: user!.id,
    })
    if (!error && data && data[0]) {
      setDasStatus(data[0])
    }
  }

  // ─────────── Autenticación ───────────
  async function manejarAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (registro) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(traducirError(error.message))
      else
        setMensaje(
          'Registro correcto. Revisa tu correo para confirmar la cuenta.'
        )
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) setError(traducirError(error.message))
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    setUser(null)
    setTurnos([])
    setDasStatus(null)
  }

  function traducirError(msg: string): string {
    if (msg.includes('Invalid login credentials')) return 'Credenciales incorrectas'
    if (msg.includes('Email not confirmed'))
      return 'Debes confirmar tu correo antes de entrar'
    if (msg.includes('User already registered'))
      return 'Ese correo ya está registrado'
    if (msg.includes('Password should be at least'))
      return 'La contraseña debe tener al menos 6 caracteres'
    return msg
  }

  // ─────────── Turnos ───────────
  async function anadirTurno(e: React.FormEvent) {
    e.preventDefault()
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
      setError('Turno no válido')
      return
    }

    const { error } = await supabase.from('turno').insert({
      id_usuario: user!.id,
      id_departamento: dept.id,
      fecha,
      id_tipo_turno: tipo.id,
    })

    if (error) {
      if (error.code === '23505')
        setError('Ya tienes ese turno asignado en esa fecha')
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

  // ─────────── Render ───────────
  if (cargando) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: 100 }}>
        Cargando…
      </div>
    )
  }

  // Pantalla de login / registro
  if (!user) {
    return (
      <div className="container" style={{ maxWidth: 400, marginTop: 100 }}>
        <div className="card">
          <h2 style={{ marginBottom: 20 }}>DAS · Control de Turnos</h2>
          <form onSubmit={manejarAuth}>
            <label className="label">Correo electrónico</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="label">Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && <p className="error">{error}</p>}
            {mensaje && <p className="success">{mensaje}</p>}
            <button
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8 }}
              type="submit"
            >
              {registro ? 'Registrarse' : 'Iniciar sesión'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setRegistro(!registro)
                setError('')
                setMensaje('')
              }}
            >
              {registro
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'}
            </a>
          </p>
        </div>
      </div>
    )
  }

  // Pantalla principal
  return (
    <>
      <nav>
        <div className="container">
          <strong>DAS · Control de Turnos</strong>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#666' }}>
            {user.email}
          </span>
          <button className="btn btn-danger" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </nav>

      <div className="container">
        {/* Panel de contadores DAS */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Mis DAS</h3>
          <div
            className="grid"
            style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
          >
            <div className="stat">
              <div className="stat-value">
                {dasStatus?.das_disponibles ?? 0}
              </div>
              <div className="stat-label">DAS disponibles</div>
            </div>
            <div className="stat">
              <div className="stat-value">{dasStatus?.das_generados ?? 0}</div>
              <div className="stat-label">DAS generados</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {dasStatus?.das_disfrutados ?? 0}
              </div>
              <div className="stat-label">DAS disfrutados</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {dasStatus?.das_remanente_manual ?? 0}
              </div>
              <div className="stat-label">Remanente anterior</div>
            </div>
          </div>
          <div style={{ marginTop: 16, fontSize: 13, color: '#666' }}>
            <p>
              Festivos trabajados:{' '}
              <strong>{dasStatus?.festivos_validos ?? 0}</strong> (faltan{' '}
              {3 - (dasStatus?.festivos_restantes ?? 0)} para el próximo DAS)
            </p>
            <p>
              Noches trabajadas:{' '}
              <strong>{dasStatus?.noches_validas ?? 0}</strong> (faltan{' '}
              {6 - (dasStatus?.noches_restantes ?? 0)} para el próximo DAS)
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
                <label className="label">Turno</label>
                <select
                  className="input"
                  value={codigoTurno}
                  onChange={(e) => setCodigoTurno(e.target.value)}
                >
                  <option value="M">Mañana (06:00–14:00)</option>
                  <option value="T">Tarde (14:00–22:00)</option>
                  <option value="N">Noche (22:00–06:00)</option>
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
            <p style={{ color: '#888', fontSize: 14 }}>
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
                      {t.codigo_turno === 'M' && 'Mañana'}
                      {t.codigo_turno === 'T' && 'Tarde'}
                      {t.codigo_turno === 'N' && 'Noche'}
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
      </div>
    </>
  )
}
