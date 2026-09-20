import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { UsuarioProveedor, useUsuario } from './contexto/UsuarioContexto'
import { ToastProveedor } from './contexto/ToastContexto'
import {
  ConfirmacionProveedor,
  useConfirmacion,
} from './contexto/ConfirmacionContexto'
import ContenedorToasts from './componentes/ContenedorToasts'
import ContenedorConfirmacion from './componentes/ContenedorConfirmacion'
import Avatar from './componentes/Avatar'
import Escudo from './componentes/Escudo'
import CampoPassword from './componentes/CampoPassword'
import Calendario from './pantallas/Calendario'
import Festivos from './pantallas/Festivos'
import Ajustes from './pantallas/Ajustes'
import Ayuda from './pantallas/Ayuda'
import AccesoInvitacion from './pantallas/AccesoInvitacion'
import RecuperarPassword from './pantallas/RecuperarPassword'
import RestablecerPassword from './pantallas/RestablecerPassword'
import BarraInferior, { type Pestana } from './pantallas/BarraInferior'
import {
  Calendar,
  CalendarDays,
  Settings,
  HelpCircle,
  LogOut,
  Users,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function App() {
  // Detectar si el usuario viene del enlace de recuperación
  const [enRecuperacion, setEnRecuperacion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    const hash = window.location.hash
    // Supabase añade #access_token=...&type=recovery
    return hash.includes('type=recovery') || hash.includes('type=recovery')
  })

  function salirDeRecuperacion() {
    // Limpiar el hash de la URL para que no vuelva a detectarse
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      )
    }
    setEnRecuperacion(false)
  }

  return (
    <ToastProveedor>
      <ConfirmacionProveedor>
        <UsuarioProveedor>
          {enRecuperacion ? (
            <RestablecerPassword onCompletado={salirDeRecuperacion} />
          ) : (
            <Aplicacion />
          )}
          <ContenedorToasts />
          <ContenedorConfirmacion />
        </UsuarioProveedor>
      </ConfirmacionProveedor>
    </ToastProveedor>
  )
}

function Aplicacion() {
  const { usuario, cargando, esInvitado } = useUsuario()
  const { confirmar } = useConfirmacion()
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [comprobandoSesion, setComprobandoSesion] = useState(true)
  const [pestana, setPestana] = useState<Pestana>('calendario')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null)
      setComprobandoSesion(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_evento, session) => {
        setAuthUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (esInvitado && pestana === 'festivos') {
      setPestana('calendario')
    }
  }, [esInvitado, pestana])

  async function cerrarSesion() {
    const ok = await confirmar({
      titulo: '¿Cerrar sesión?',
      mensaje: 'Tendrás que volver a identificarte.',
      textoConfirmar: 'Cerrar sesión',
      peligro: true,
    })
    if (!ok) return
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (comprobandoSesion || cargando) {
    return (
      <div
        className="container"
        style={{ textAlign: 'center', paddingTop: 100 }}
      >
        Cargando…
      </div>
    )
  }

  if (!authUser) {
    return <Login />
  }

  return (
    <>
      <nav>
        <div className="container">
          <a
            className={pestana === 'calendario' ? 'activo' : ''}
            onClick={() => setPestana('calendario')}
          >
            <Calendar size={16} />
            Calendario
          </a>

          {!esInvitado && (
            <a
              className={pestana === 'festivos' ? 'activo' : ''}
              onClick={() => setPestana('festivos')}
            >
              <CalendarDays size={16} />
              Festivos
            </a>
          )}

          <a
            className={pestana === 'ajustes' ? 'activo' : ''}
            onClick={() => setPestana('ajustes')}
          >
            <Settings size={16} />
            Ajustes
          </a>
          <a
            className={pestana === 'ayuda' ? 'activo' : ''}
            onClick={() => setPestana('ayuda')}
          >
            <HelpCircle size={16} />
            Ayuda
          </a>

          <span
            style={{
              marginLeft: 'auto',
              fontSize: 12,
              color: 'var(--texto-suave)',
            }}
          >
            {usuario?.email}
          </span>

          <button
            className="btn-salir"
            onClick={cerrarSesion}
            title="Cerrar sesión"
            style={{ marginLeft: 8 }}
          >
            <LogOut size={14} />
            Salir
          </button>
        </div>
      </nav>

      <div className="container">
        <Cabecera />

        {pestana === 'calendario' && <Calendario />}
        {pestana === 'festivos' && !esInvitado && <Festivos />}
        {pestana === 'ajustes' && <Ajustes />}
        {pestana === 'ayuda' && <Ayuda />}
      </div>

      <BarraInferior
        pestana={pestana}
        onCambiar={setPestana}
        esInvitado={esInvitado}
      />
    </>
  )
}

function Cabecera() {
  const { usuario } = useUsuario()
  const { confirmar } = useConfirmacion()

  async function cerrarSesion() {
    const ok = await confirmar({
      titulo: '¿Cerrar sesión?',
      mensaje: 'Tendrás que volver a identificarte.',
      textoConfirmar: 'Cerrar sesión',
      peligro: true,
    })
    if (!ok) return
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (!usuario) return null

  return (
    <div className="cabecera">
      <div className="logo">
        <Escudo tamano={38} />
      </div>
      <div className="datos">
        <div className="nombre">{usuario.nombre}</div>
        <div className="sub">Nº: {usuario.numero_empleado || '—'}</div>
      </div>
      <button
        className="btn-salir-movil"
        onClick={cerrarSesion}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        <LogOut size={18} />
      </button>
      <Avatar
        nombre={usuario.nombre ?? '?'}
        avatarUrl={usuario.avatar_url}
        tamano={40}
      />
    </div>
  )
}

type VistaLogin = 'iniciar' | 'registrar' | 'invitacion' | 'recuperar'

function Login() {
  const [vista, setVista] = useState<VistaLogin>('iniciar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  if (vista === 'invitacion') {
    return <AccesoInvitacion onVolver={() => setVista('iniciar')} />
  }

  if (vista === 'recuperar') {
    return <RecuperarPassword onVolver={() => setVista('iniciar')} />
  }

  const esRegistro = vista === 'registrar'

  async function manejarAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (esRegistro) {
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

  function traducirError(msg: string): string {
    if (msg.includes('Invalid login credentials'))
      return 'Credenciales incorrectas'
    if (msg.includes('Email not confirmed'))
      return 'Debes confirmar tu correo antes de entrar'
    if (msg.includes('User already registered'))
      return 'Ese correo ya está registrado'
    if (msg.includes('Password should be at least'))
      return 'La contraseña debe tener al menos 6 caracteres'
    return msg
  }

  return (
    <div className="container" style={{ maxWidth: 400, marginTop: 40 }}>
      <div className="card" style={{ textAlign: 'center' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 16,
          }}
        >
          <Escudo tamano={80} />
        </div>

        <h2 style={{ marginBottom: 4, fontSize: 22, letterSpacing: -0.5 }}>
          DAS
        </h2>
        <p
          style={{
            fontSize: 11,
            color: 'var(--texto-suave)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Distribución y Asignación de Servicios
        </p>

        <form onSubmit={manejarAuth} style={{ textAlign: 'left' }}>
          <label className="label">Correo electrónico</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label className="label">Contraseña</label>
          <CampoPassword
            valor={password}
            onChange={setPassword}
            required
            minLength={6}
            autoComplete={esRegistro ? 'new-password' : 'current-password'}
          />

          {!esRegistro && (
            <div style={{ textAlign: 'right', marginTop: -2 }}>
              <button
                type="button"
                onClick={() => {
                  setVista('recuperar')
                  setError('')
                  setMensaje('')
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--acento)',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 0',
                  fontFamily: 'inherit',
                }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}

          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 6 }}
            type="submit"
          >
            {esRegistro ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginTop: 14,
          }}
        >
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setVista(esRegistro ? 'iniciar' : 'registrar')
              setError('')
              setMensaje('')
            }}
            style={{ fontSize: 12 }}
          >
            {esRegistro
              ? '¿Ya tienes cuenta? Inicia sesión'
              : '¿No tienes cuenta? Regístrate'}
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              margin: '4px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--borde)' }} />
            <span
              style={{
                fontSize: 10,
                color: 'var(--texto-suave)',
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              o
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--borde)' }} />
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setVista('invitacion')
              setError('')
              setMensaje('')
            }}
            style={{ fontSize: 12 }}
          >
            <Users size={14} />
            Acceder con invitación
          </button>
        </div>
      </div>
    </div>
  )
}
