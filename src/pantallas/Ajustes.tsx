import { useState } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import type { Tema } from '../tipos'

export default function Ajustes() {
  const { usuario, actualizarPerfil, cambiarTema } = useUsuario()

  const [nombre, setNombre] = useState(usuario?.nombre ?? '')
  const [numeroEmpleado, setNumeroEmpleado] = useState(
    usuario?.numero_empleado ?? ''
  )
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  if (!usuario) return null

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setMensaje('')
    setError('')
    setGuardando(true)

    try {
      await actualizarPerfil({
        nombre: nombre.trim(),
        numero_empleado: numeroEmpleado.trim() || null,
      })
      setMensaje('Cambios guardados correctamente')
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function elegirTema(t: Tema) {
    setMensaje('')
    setError('')
    try {
      await cambiarTema(t)
      setMensaje('Tema actualizado')
    } catch (err: any) {
      setError(err?.message ?? 'Error al cambiar tema')
    }
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ marginBottom: 20 }}>Ajustes</h2>

        <form onSubmit={guardar}>
          <label className="label">Correo electrónico</label>
          <input
            className="input"
            type="email"
            value={usuario.email}
            disabled
            style={{ opacity: 0.7 }}
          />

          <label className="label">Nombre</label>
          <input
            className="input"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label className="label">Nº de empleado</label>
          <input
            className="input"
            type="text"
            value={numeroEmpleado}
            onChange={(e) => setNumeroEmpleado(e.target.value)}
            placeholder="Por ejemplo: 123456789"
          />

          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={guardando}
            style={{ marginTop: 12 }}
          >
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Tema de la aplicación</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className={`btn ${usuario.tema === 'negro' ? 'btn-primary' : ''}`}
            onClick={() => elegirTema('negro')}
            style={{
              background: usuario.tema === 'negro' ? '#2563eb' : '#333',
              color: 'white',
            }}
          >
            Negro
          </button>
          <button
            className="btn"
            onClick={() => elegirTema('verde')}
            style={{
              background: '#1f4a2b',
              color: 'white',
              outline: usuario.tema === 'verde' ? '2px solid #2563eb' : 'none',
            }}
          >
            Verde Guardia Civil
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Sesión</h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 12 }}>
          Cerrar sesión hará que vuelvas a la pantalla de acceso.
        </p>
        <button className="btn btn-danger" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
