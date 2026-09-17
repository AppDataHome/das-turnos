import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import SeccionDatos from './SeccionDatos'
import type { Tema } from '../tipos'

export default function Ajustes() {
  const { usuario, actualizarPerfil, cambiarTema } = useUsuario()

  const [nombre, setNombre] = useState(usuario?.nombre ?? '')
  const [numeroEmpleado, setNumeroEmpleado] = useState(
    usuario?.numero_empleado ?? ''
  )

  const [diasAnuales, setDiasAnuales] = useState<number>(
    usuario?.dias_vacaciones_anuales ?? 22
  )
  const [diasArrastradas, setDiasArrastradas] = useState<number>(
    usuario?.dias_vacaciones_arrastradas ?? 0
  )
  const [anioArrastre, setAnioArrastre] = useState<number>(
    usuario?.anio_vacaciones_arrastradas ?? new Date().getFullYear() - 1
  )

  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  // Contraseña
  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [cambiandoPass, setCambiandoPass] = useState(false)
  const [mensajePass, setMensajePass] = useState('')
  const [errorPass, setErrorPass] = useState('')

  useEffect(() => {
    if (usuario) {
      setNombre(usuario.nombre ?? '')
      setNumeroEmpleado(usuario.numero_empleado ?? '')
      setDiasAnuales(usuario.dias_vacaciones_anuales ?? 22)
      setDiasArrastradas(usuario.dias_vacaciones_arrastradas ?? 0)
      setAnioArrastre(
        usuario.anio_vacaciones_arrastradas ??
          new Date().getFullYear() - 1
      )
    }
  }, [usuario?.id])

  if (!usuario) return null

  async function guardarPerfil(e: React.FormEvent) {
    e.preventDefault()
    setMensaje('')
    setError('')
    setGuardando(true)

    try {
      await actualizarPerfil({
        nombre: nombre.trim(),
        numero_empleado: numeroEmpleado.trim() || null,
      })
      setMensaje('Datos guardados correctamente')
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function guardarVacaciones(e: React.FormEvent) {
    e.preventDefault()
    setMensaje('')
    setError('')
    setGuardando(true)

    try {
      await actualizarPerfil({
        dias_vacaciones_anuales: Number(diasAnuales) || 0,
        dias_vacaciones_arrastradas: Number(diasArrastradas) || 0,
        anio_vacaciones_arrastradas: Number(anioArrastre) || null,
      })
      setMensaje('Configuración de vacaciones guardada')
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  async function reiniciarArrastre() {
    if (
      !confirm(
        '¿Seguro que quieres poner a 0 los días de arrastre del año anterior?'
      )
    )
      return
    setMensaje('')
    setError('')
    setGuardando(true)

    try {
      setDiasArrastradas(0)
      await actualizarPerfil({
        dias_vacaciones_arrastradas: 0,
      })
      setMensaje('Arrastre reiniciado a 0')
    } catch (err: any) {
      setError(err?.message ?? 'Error al reiniciar')
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarContrasena(e: React.FormEvent) {
    e.preventDefault()
    setErrorPass('')
    setMensajePass('')

    if (pass1.length < 6) {
      setErrorPass('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (pass1 !== pass2) {
      setErrorPass('Las dos contraseñas no coinciden')
      return
    }

    setCambiandoPass(true)
    const { error } = await supabase.auth.updateUser({ password: pass1 })
    setCambiandoPass(false)

    if (error) {
      setErrorPass(error.message)
      return
    }

    setPass1('')
    setPass2('')
    setMensajePass('Contraseña cambiada correctamente')
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
      {/* Perfil */}
      <div className="card">
        <h2 style={{ marginBottom: 20 }}>Mi perfil</h2>

        <form onSubmit={guardarPerfil}>
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

      {/* Contraseña */}
      <div className="card">
        <h2 style={{ marginBottom: 20 }}>Cambiar contraseña</h2>

        <form onSubmit={cambiarContrasena}>
          <label className="label">Nueva contraseña</label>
          <input
            className="input"
            type="password"
            value={pass1}
            onChange={(e) => setPass1(e.target.value)}
            minLength={6}
            required
          />

          <label className="label">Repetir nueva contraseña</label>
          <input
            className="input"
            type="password"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            minLength={6}
            required
          />

          {errorPass && <p className="error">{errorPass}</p>}
          {mensajePass && <p className="success">{mensajePass}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={cambiandoPass}
            style={{ marginTop: 12 }}
          >
            {cambiandoPass ? 'Cambiando…' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>

      {/* Vacaciones */}
      <div className="card">
        <h2 style={{ marginBottom: 20 }}>Vacaciones</h2>

        <form onSubmit={guardarVacaciones}>
          <label className="label">Días de vacaciones anuales</label>
          <input
            className="input"
            type="number"
            min={0}
            max={60}
            value={diasAnuales}
            onChange={(e) => setDiasAnuales(Number(e.target.value))}
          />
          <p
            style={{
              fontSize: 12,
              color: 'var(--texto-suave)',
              marginTop: -4,
              marginBottom: 14,
            }}
          >
            Días que te corresponden cada año (por defecto 22).
          </p>

          <label className="label">Días arrastrados del año anterior</label>
          <input
            className="input"
            type="number"
            min={0}
            max={60}
            value={diasArrastradas}
            onChange={(e) => setDiasArrastradas(Number(e.target.value))}
          />
          <p
            style={{
              fontSize: 12,
              color: 'var(--texto-suave)',
              marginTop: -4,
              marginBottom: 14,
            }}
          >
            Días que te sobraron del año pasado y aún puedes disfrutar este
            año.
          </p>

          <label className="label">Año de los días arrastrados</label>
          <input
            className="input"
            type="number"
            min={2000}
            max={2100}
            value={anioArrastre}
            onChange={(e) => setAnioArrastre(Number(e.target.value))}
          />
          <p
            style={{
              fontSize: 12,
              color: 'var(--texto-suave)',
              marginTop: -4,
              marginBottom: 14,
            }}
          >
            Normalmente el año pasado (por ejemplo, 2025 si estás en 2026).
          </p>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={guardando}
              style={{ flex: 1 }}
            >
              {guardando ? 'Guardando…' : 'Guardar vacaciones'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={reiniciarArrastre}
              style={{
                background: 'var(--fondo-tarjeta-2)',
                color: 'var(--texto)',
              }}
            >
              Poner arrastre a 0
            </button>
          </div>
        </form>
      </div>

      {/* Datos: exportar / importar */}
      <SeccionDatos />

      {/* Tema */}
      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Tema de la aplicación</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            className="btn"
            onClick={() => elegirTema('negro')}
            style={{
              background: '#0e1116',
              color: 'white',
              outline:
                usuario.tema === 'negro' ? '2px solid var(--acento)' : 'none',
            }}
          >
            Negro
          </button>
          <button
            className="btn"
            onClick={() => elegirTema('verde')}
            style={{
              background: '#0a1a10',
              color: 'white',
              outline:
                usuario.tema === 'verde' ? '2px solid var(--acento)' : 'none',
            }}
          >
            Verde Guardia Civil
          </button>
        </div>
      </div>

      {/* Sesión */}
      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Sesión</h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--texto-suave)',
            marginBottom: 12,
          }}
        >
          Cerrar sesión hará que vuelvas a la pantalla de acceso.
        </p>
        <button className="btn btn-danger" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
