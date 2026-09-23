import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { useToast } from '../contexto/ToastContexto'
import { useConfirmacion } from '../contexto/ConfirmacionContexto'
import Avatar from '../componentes/Avatar'
import CampoPassword from '../componentes/CampoPassword'
import Acordeon from '../componentes/Acordeon'
import Configuracion from './Configuracion'
import SeccionDatos from './SeccionDatos'
import SeccionDasRemanente from './SeccionDasRemanente'
import PestanaInvitados from './PestanaInvitados'
import type { Tema } from '../tipos'
import {
  User,
  Settings as SettingsIcon,
  Database,
  Palette,
  Users,
  LogOut,
} from 'lucide-react'

type Pestana =
  | 'perfil'
  | 'configuracion'
  | 'datos'
  | 'invitados'
  | 'preferencias'
  | 'sesion'

export default function Ajustes() {
  const { puedeEditar } = useUsuario()
  const [pestana, setPestana] = useState<Pestana>('perfil')

  return (
    <div className="container">
      <div className="subpestanas">
        <button
          className={pestana === 'perfil' ? 'activa' : ''}
          onClick={() => setPestana('perfil')}
        >
          <User size={14} />
          Perfil
        </button>

        {puedeEditar && (
          <button
            className={pestana === 'configuracion' ? 'activa' : ''}
            onClick={() => setPestana('configuracion')}
          >
            <SettingsIcon size={14} />
            Configuración
          </button>
        )}

        {puedeEditar && (
          <button
            className={pestana === 'datos' ? 'activa' : ''}
            onClick={() => setPestana('datos')}
          >
            <Database size={14} />
            Datos
          </button>
        )}

        <button
          className={pestana === 'invitados' ? 'activa' : ''}
          onClick={() => setPestana('invitados')}
        >
          <Users size={14} />
          Invitados
        </button>

        <button
          className={pestana === 'preferencias' ? 'activa' : ''}
          onClick={() => setPestana('preferencias')}
        >
          <Palette size={14} />
          Preferencias
        </button>

        <button
          className={pestana === 'sesion' ? 'activa' : ''}
          onClick={() => setPestana('sesion')}
        >
          <LogOut size={14} />
          Sesión
        </button>
      </div>

      {pestana === 'perfil' && <PestanaPerfil />}
      {pestana === 'configuracion' && puedeEditar && <PestanaConfiguracion />}
      {pestana === 'datos' && puedeEditar && <PestanaDatos />}
      {pestana === 'invitados' && <PestanaInvitados />}
      {pestana === 'preferencias' && <PestanaPreferencias />}
      {pestana === 'sesion' && <PestanaSesion />}
    </div>
  )
}

// ═══════════════════════════════════════════════════
// PERFIL
// ═══════════════════════════════════════════════════

function PestanaPerfil() {
  const { usuario, actualizarPerfil, recargar } = useUsuario()
  const toast = useToast()
  const { confirmar } = useConfirmacion()

  const [nombre, setNombre] = useState(usuario?.nombre ?? '')
  const [numeroEmpleado, setNumeroEmpleado] = useState(
    usuario?.numero_empleado ?? ''
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
    }
  }, [usuario?.id])

  if (!usuario) return null

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
    const ext = archivo.name.split('.').pop()?.toLowerCase() || 'jpg'
    const ruta = `${usuario!.id}/avatar.${ext}`

    const { error: errSubida } = await supabase.storage
      .from('avatares')
      .upload(ruta, archivo, { upsert: true, cacheControl: '3600' })

    if (errSubida) {
      setSubiendoAvatar(false)
      toast.error('Error al subir la imagen: ' + errSubida.message)
      e.target.value = ''
      return
    }

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

  async function cambiarContrasena(e: React.FormEvent) {
    e.preventDefault()
    setErrorPass('')

    if (!passActual)
      return setErrorPass('Debes introducir tu contraseña actual')
    if (pass1.length < 6)
      return setErrorPass('La nueva contraseña debe tener al menos 6 caracteres')
    if (pass1 !== pass2)
      return setErrorPass('Las dos contraseñas nuevas no coinciden')
    if (passActual === pass1)
      return setErrorPass('La nueva contraseña debe ser distinta a la actual')

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

  return (
    <>
      <Acordeon titulo="Foto de perfil" icono="📷" abiertoPorDefecto>
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
      </Acordeon>

      <Acordeon titulo="Mi perfil" icono="👤">
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
      </Acordeon>

      <Acordeon titulo="Seguridad · Cambiar contraseña" icono="🔒">
        <form onSubmit={cambiarContrasena}>
          <label className="label">Contraseña actual</label>
          <CampoPassword
            valor={passActual}
            onChange={setPassActual}
            required
            autoComplete="current-password"
          />

          <label className="label">Nueva contraseña</label>
          <CampoPassword
            valor={pass1}
            onChange={setPass1}
            minLength={6}
            required
            autoComplete="new-password"
          />

          <label className="label">Repetir nueva contraseña</label>
          <CampoPassword
            valor={pass2}
            onChange={setPass2}
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
      </Acordeon>
    </>
  )
}

// ═══════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════

function PestanaConfiguracion() {
  const { usuario, actualizarPerfil } = useUsuario()
  const toast = useToast()
  const { confirmar } = useConfirmacion()

  const [diasAnuales, setDiasAnuales] = useState<number>(
    usuario?.dias_vacaciones_anuales ?? 22
  )
  const [diasArrastradas, setDiasArrastradas] = useState<number>(
    usuario?.dias_vacaciones_arrastradas ?? 0
  )
  const [anioArrastre, setAnioArrastre] = useState<number>(
    usuario?.anio_vacaciones_arrastradas ?? new Date().getFullYear() - 1
  )

  const [apAnuales, setApAnuales] = useState<number>(
    usuario?.dias_asuntos_propios_anuales ?? 6
  )
  const [apArrastrados, setApArrastrados] = useState<number>(
    usuario?.dias_asuntos_propios_arrastrados ?? 0
  )
  const [apAnioArrastre, setApAnioArrastre] = useState<number>(
    usuario?.anio_asuntos_propios_arrastrados ??
      new Date().getFullYear() - 1
  )

  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (usuario) {
      setDiasAnuales(usuario.dias_vacaciones_anuales ?? 22)
      setDiasArrastradas(usuario.dias_vacaciones_arrastradas ?? 0)
      setAnioArrastre(
        usuario.anio_vacaciones_arrastradas ?? new Date().getFullYear() - 1
      )
      setApAnuales(usuario.dias_asuntos_propios_anuales ?? 6)
      setApArrastrados(usuario.dias_asuntos_propios_arrastrados ?? 0)
      setApAnioArrastre(
        usuario.anio_asuntos_propios_arrastrados ??
          new Date().getFullYear() - 1
      )
    }
  }, [usuario?.id])

  if (!usuario) return null

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
        'Los días de vacaciones pendientes del año anterior quedarán a 0.',
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

  async function guardarAsuntosPropios(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      await actualizarPerfil({
        dias_asuntos_propios_anuales: Number(apAnuales) || 0,
        dias_asuntos_propios_arrastrados: Number(apArrastrados) || 0,
        anio_asuntos_propios_arrastrados: Number(apAnioArrastre) || null,
      })
      toast.exito('Configuración de asuntos propios guardada')
    } catch (err: any) {
      const msg = err?.message ?? 'Error al guardar'
      setError(msg)
      toast.error(msg)
    } finally {
      setGuardando(false)
    }
  }

  async function reiniciarArrastreAP() {
    const ok = await confirmar({
      titulo: '¿Poner el arrastre de asuntos propios a 0?',
      mensaje: 'Los días pendientes del año anterior quedarán a 0.',
      textoConfirmar: 'Poner a 0',
      peligro: true,
    })
    if (!ok) return

    setError('')
    setGuardando(true)
    try {
      setApArrastrados(0)
      await actualizarPerfil({ dias_asuntos_propios_arrastrados: 0 })
      toast.exito('Arrastre de AP reiniciado a 0')
    } catch (err: any) {
      const msg = err?.message ?? 'Error al reiniciar'
      setError(msg)
      toast.error(msg)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <Acordeon titulo="Vacaciones" icono="🏖️">
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
            Normalmente el año pasado.
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

          {error && <p className="error">{error}</p>}
        </form>
      </Acordeon>

      <Acordeon titulo="Asuntos Propios" icono="📋">
        <form onSubmit={guardarAsuntosPropios}>
          <label className="label">Días de asuntos propios anuales</label>
          <input
            className="input"
            type="number"
            min={0}
            max={60}
            value={apAnuales}
            onChange={(e) => setApAnuales(Number(e.target.value))}
          />
          <p
            style={{
              fontSize: 10,
              color: 'var(--texto-suave)',
              marginTop: -2,
              marginBottom: 10,
            }}
          >
            Días que te corresponden cada año (por defecto 6).
          </p>

          <label className="label">Días arrastrados del año anterior</label>
          <input
            className="input"
            type="number"
            min={0}
            max={60}
            value={apArrastrados}
            onChange={(e) => setApArrastrados(Number(e.target.value))}
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
            value={apAnioArrastre}
            onChange={(e) => setApAnioArrastre(Number(e.target.value))}
          />
          <p
            style={{
              fontSize: 10,
              color: 'var(--texto-suave)',
              marginTop: -2,
              marginBottom: 10,
            }}
          >
            Normalmente el año pasado.
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
              {guardando ? 'Guardando…' : 'Guardar asuntos propios'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={reiniciarArrastreAP}
            >
              Poner arrastre a 0
            </button>
          </div>

          {error && <p className="error">{error}</p>}
        </form>
      </Acordeon>

      <Acordeon titulo="DAS remanentes" icono="🎁">
        <SeccionDasRemanente sinCard />
      </Acordeon>

      <Acordeon titulo="Departamentos y tipos de turno" icono="⚙️">
        <Configuracion />
      </Acordeon>
    </>
  )
}

// ═══════════════════════════════════════════════════
// DATOS
// ═══════════════════════════════════════════════════

function PestanaDatos() {
  return (
    <Acordeon titulo="Exportar e importar (CSV)" icono="💾" abiertoPorDefecto>
      <SeccionDatos sinCard />
    </Acordeon>
  )
}

// ═══════════════════════════════════════════════════
// PREFERENCIAS
// ═══════════════════════════════════════════════════

function PestanaPreferencias() {
  const { usuario, cambiarTema } = useUsuario()
  const toast = useToast()

  if (!usuario) return null

  async function elegirTema(t: Tema) {
    try {
      await cambiarTema(t)
      toast.exito('Tema actualizado')
    } catch (err: any) {
      toast.error('Error al cambiar tema: ' + (err?.message ?? ''))
    }
  }

  const opciones: {
    valor: Tema
    etiqueta: string
    descripcion: string
    emoji: string
  }[] = [
    {
      valor: 'auto',
      etiqueta: 'Automático',
      descripcion: 'Se adapta al modo claro/oscuro de tu dispositivo',
      emoji: '📱',
    },
    {
      valor: 'claro',
      etiqueta: 'Claro',
      descripcion: 'Fondo blanco, ideal para ambientes muy iluminados',
      emoji: '☀️',
    },
    {
      valor: 'negro',
      etiqueta: 'Oscuro',
      descripcion: 'Fondo negro con acentos dorados',
      emoji: '🌙',
    },
    {
      valor: 'verde',
      etiqueta: 'Verde Guardia Civil',
      descripcion: 'Fondo verde oscuro con acentos verde claro',
      emoji: '🍃',
    },
  ]

  return (
    <Acordeon titulo="Tema de la aplicación" icono="🎨" abiertoPorDefecto>
      <p
        style={{
          fontSize: 11,
          color: 'var(--texto-suave)',
          marginBottom: 14,
        }}
      >
        Elige el aspecto visual de la app. El modo <strong>Automático</strong>{' '}
        cambia solo según el modo claro/oscuro de tu dispositivo.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        {opciones.map((op) => {
          const activo = usuario.tema === op.valor

          return (
            <button
              key={op.valor}
              onClick={() => elegirTema(op.valor)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                border: activo
                  ? '2px solid var(--acento)'
                  : '1px solid var(--borde)',
                background: activo
                  ? 'var(--acento-suave)'
                  : 'var(--fondo-tarjeta-2)',
                borderRadius: 10,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                color: 'var(--texto)',
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: activo
                    ? 'var(--acento)'
                    : 'var(--fondo-tarjeta-3)',
                  color: activo
                    ? 'var(--acento-texto)'
                    : 'var(--texto-suave)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: 20,
                }}
              >
                {op.emoji}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 2,
                  }}
                >
                  {op.etiqueta}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--texto-suave)',
                    lineHeight: 1.4,
                  }}
                >
                  {op.descripcion}
                </div>
              </div>

              {activo && (
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'var(--acento)',
                    color: 'var(--acento-texto)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
              )}
            </button>
          )
        })}
      </div>
    </Acordeon>
  )
}

// ═══════════════════════════════════════════════════
// SESIÓN
// ═══════════════════════════════════════════════════

function PestanaSesion() {
  const { confirmar } = useConfirmacion()

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
    <Acordeon titulo="Cerrar sesión" icono="🚪" abiertoPorDefecto>
      <p
        style={{
          fontSize: 11,
          color: 'var(--texto-suave)',
          marginBottom: 12,
        }}
      >
        Al cerrar sesión, volverás a la pantalla de acceso y tendrás que meter
        tu correo y contraseña de nuevo. Tus datos se conservan.
      </p>
      <button className="btn btn-danger" onClick={cerrarSesion}>
        Cerrar sesión
      </button>
    </Acordeon>
  )
}
