import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { useToast } from '../contexto/ToastContexto'
import { useConfirmacion } from '../contexto/ConfirmacionContexto'
import SeccionDatos from './SeccionDatos'
import SeccionDasRemanente from './SeccionDasRemanente'
import Avatar from '../componentes/Avatar'
import type { Tema } from '../tipos'

export default function Ajustes() {
  const { usuario, actualizarPerfil, cambiarTema, recargar } = useUsuario()
  const toast = useToast()
  const { confirmar } = useConfirmacion()

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
  const [error, setError] = useState('')

  const [subiendoAvatar, setSubiendoAvatar] = useState(false)

  const [passActual, setPassActual] = useState('')
  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [cambiandoPass, setCambiandoPass] = useState(false)
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

  // ─────────── Subir avatar ───────────
  async function manejarArchivoAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    if (archivo.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar 2 MB')
      e.target.value = ''
      return
    }

    if (!archivo.type.startsWith('image/')) {
      toast.error('El archivo debe ser una imagen')
      e.target.value = ''
      return
    }

    setSubiendoAvatar(true)

    // Extensión del archivo
    const ext = archivo.name.split('.').pop()?.toLowerCase() || 'jpg'
    const ruta = `${usuario!.id}/avatar.${ext}`

    // Subimos el archivo (upsert = reemplaza si ya existe)
    const { error: errSubida } = await supabase.storage
      .from('avatares')
      .upload(ruta, archivo, { upsert: true, cacheControl: '3600' })

    if (errSubida) {
      setSubiendoAvatar(false)
      toast.error('Error al subir la imagen: ' + errSubida.message)
      e.target.value = ''
      return
    }

    // Obtener la URL pública con un pequeño cache-buster para forzar recarga
    const { data: urlData } = supabase.storage
      .from('avatares')
      .getPublicUrl(ruta)

    const urlPublica = `${urlData.publicUrl}?t=${Date.now()}`

    try {
      await actualizarPerfil({ avatar_url: urlPublica })
      await recargar()
      toast.exito('Foto de perfil actualizada')
    } catch (err: any) {
      toast.error('Error al guardar la URL: ' + (err?.message ?? ''))
    } finally {
      setSubiendoAvatar(false)
      e.target.value = ''
    }
  }

  async function borrarAvatar() {
    const ok = await confirmar({
      titulo: '¿Borrar tu foto de perfil?',
      mensaje: 'Volverás a mostrar tu inicial como avatar.',
      textoConfirmar: 'Borrar',
      peligro: true,
    })
    if (!ok) return

    setSubiendoAvatar(true)

    // Intentamos borrar todos los archivos de la carpeta del usuario
    const { data: listado } = await supabase.storage
      .from('avatares')
      .list(usuario!.id)

    if (listado && listado.length > 0) {
      const rutas = listado.map((f) => `${usuario!.id}/${f.name}`)
      await supabase.storage.from('avatares').remove(rutas)
    }

    try {
      await actualizarPerfil({ avatar_url: null })
      await recargar()
      toast.exito('Foto de perfil borrada')
    } catch (err: any) {
      toast.error('Error: ' + (err?.message ?? ''))
    } finally {
      setSubiendoAvatar(false)
    }
  }

  // ─────────── Guardar perfil ───────────
  async function guardarPerfil(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      await actualizarPerfil({
        nombre: nombre.trim(),
        numero_empleado: numeroEmpleado.trim() || null,
      })
      toast.exito('Datos guardados correctamente')
    } catch (err: any) {
      const msg = err?.message ?? 'Error al guardar'
      setError(msg)
      toast.error(msg)
    } finally {
      setGuardando(false)
    }
  }

  // ─────────── Guardar vacaciones ───────────
  async function guardarVacaciones(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setGuardando(true)

    try {
      await actualizarPerfil({
        dias_vacaciones_anuales: Number(diasAnuales) || 0,
        dias_vacaciones_arrastradas: Number(diasArrastradas) || 0,
        anio_vacaciones_arrastradas: Number(anioArrastre) || null,
      })
      toast.exito('Configuración de vacaciones guardada')
    } catch (err: any) {
      const msg = err?.message ?? 'Error al guardar'
      setError(msg)
      toast.error(msg)
    } finally {
      setGuardando(false)
    }
  }

  async function reiniciarArrastre() {
    const ok = await confirmar({
      titulo: '¿Poner el arrastre a 0?',
      mensaje:
        'Los días de vacaciones pendientes del año anterior quedarán a 0. Esta acción no se puede deshacer.',
      textoConfirmar: 'Poner a 0',
      peligro: true,
    })
    if (!ok) return

    setError('')
    setGuardando(true)

    try {
      setDiasArrastradas(0)
      await actualizarPerfil({ dias_vacaciones_arrastradas: 0 })
      toast.exito('Arrastre reiniciado a 0')
    } catch (err: any) {
      const msg = err?.message ?? 'Error al reiniciar'
      setError(msg)
      toast.error(msg)
    } finally {
      setGuardando(false)
    }
  }

  async function cambiarContrasena(e: React.FormEvent) {
    e.preventDefault()
    setErrorPass('')

    if (!passActual) {
      setErrorPass('Debes introducir tu contraseña actual')
      return
    }
    if (pass1.length < 6) {
      setErrorPass('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    if (pass1 !== pass2) {
      setErrorPass('Las dos contraseñas nuevas no coinciden')
      return
    }
    if (passActual === pass1) {
      setErrorPass('La nueva contraseña debe ser distinta a la actual')
      return
    }

    setCambiandoPass(true)

    const { error: errVerif } = await supabase.auth.signInWithPassword({
      email: usuario!.email,
      password: passActual,
    })

    if (errVerif) {
      setCambiandoPass(false)
      setErrorPass('La contraseña actual no es correcta')
      toast.error('La contraseña actual no es correcta')
      return
    }

    const { error: errCambio } = await supabase.auth.updateUser({
      password: pass1,
    })

    setCambiandoPass(false)

    if (errCambio) {
      setErrorPass(errCambio.message)
      toast.error('Error: ' + errCambio.message)
      return
    }

    setPassActual('')
    setPass1('')
    setPass2('')
    toast.exito('Contraseña cambiada correctamente')
  }

  async function elegirTema(t: Tema) {
    setError('')
    try {
      await cambiarTema(t)
      toast.exito('Tema actualizado')
    } catch (err: any) {
      const msg = err?.message ?? 'Error al cambiar tema'
      setError(msg)
      toast.error(msg)
    }
  }

  async function cerrarSesion() {
    const ok = await confirmar({
      titulo: '¿Cerrar sesión?',
      mensaje: 'Tendrás que volver a meter tu correo y contraseña.',
      textoConfirmar: 'Cerrar sesión',
      peligro: true,
    })
    if (!ok) return
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="container">
      {/* Foto de perfil */}
      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Foto de perfil</h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Avatar
            nombre={usuario.nombre ?? '?'}
            avatarUrl={usuario.avatar_url}
            tamano={80}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              flex: 1,
              minWidth: 0,
            }}
          >
            <p style={{ fontSize: 11, color: 'var(--texto-suave)', margin: 0 }}>
              Sube una foto tuya (JPG, PNG o WEBP, máximo 2 MB). Si no subes
              ninguna, se mostrará tu inicial.
            </p>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label
                className="btn btn-primary"
                style={{
                  cursor: subiendoAvatar ? 'not-allowed' : 'pointer',
                  opacity: subiendoAvatar ? 0.6 : 1,
                }}
              >
                {subiendoAvatar
                  ? 'Procesando…'
                  : usuario.avatar_url
                  ? 'Cambiar foto'
                  : 'Subir foto'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={manejarArchivoAvatar}
                  disabled={subiendoAvatar}
                  style={{ display: 'none' }}
                />
              </label>

              {usuario.avatar_url && (
                <button
                  className="btn btn-secondary"
                  onClick={borrarAvatar}
                  disabled={subiendoAvatar}
                >
                  Borrar foto
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mi perfil */}
      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Mi perfil</h2>

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
            placeholder="123456789"
          />

          {error && <p className="error">{error}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={guardando}
            style={{ marginTop: 6 }}
          >
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>
      </div>

      {/* Contraseña */}
      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Cambiar contraseña</h2>

        <form onSubmit={cambiarContrasena}>
          <label className="label">Contraseña actual</label>
          <input
            className="input"
            type="password"
            value={passActual}
            onChange={(e) => setPassActual(e.target.value)}
            required
            autoComplete="current-password"
          />

          <label className="label">Nueva contraseña</label>
          <input
            className="input"
            type="password"
            value={pass1}
            onChange={(e) => setPass1(e.target.value)}
            minLength={6}
            required
            autoComplete="new-password"
          />

          <label className="label">Repetir nueva contraseña</label>
          <input
            className="input"
            type="password"
            value={pass2}
            onChange={(e) => setPass2(e.target.value)}
            minLength={6}
            required
            autoComplete="new-password"
          />

          {errorPass && <p className="error">{errorPass}</p>}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={cambiandoPass}
            style={{ marginTop: 6 }}
          >
            {cambiandoPass ? 'Cambiando…' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>

      {/* Vacaciones */}
      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Vacaciones</h2>

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
              fontSize: 10,
              color: 'var(--texto-suave)',
              marginTop: -2,
              marginBottom: 10,
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
              fontSize: 10,
              color: 'var(--texto-suave)',
              marginTop: -2,
              marginBottom: 10,
            }}
          >
            Días que te sobraron del año pasado y aún puedes disfrutar.
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
              fontSize: 10,
              color: 'var(--texto-suave)',
              marginTop: -2,
              marginBottom: 10,
            }}
          >
            Normalmente el año pasado (por ejemplo, 2025 si estás en 2026).
          </p>

          <div
            style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}
          >
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
              className="btn btn-secondary"
              onClick={reiniciarArrastre}
            >
              Poner arrastre a 0
            </button>
          </div>
        </form>
      </div>

      <SeccionDasRemanente />

      <SeccionDatos />

      {/* Tema */}
      <div className="card">
        <h2 style={{ marginBottom: 10 }}>Tema de la aplicación</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
        <h2 style={{ marginBottom: 10 }}>Sesión</h2>
        <p
          style={{
            fontSize: 11,
            color: 'var(--texto-suave)',
            marginBottom: 10,
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
