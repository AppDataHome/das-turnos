import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { UsuarioProveedor, useUsuario } from './contexto/UsuarioContexto'
import { ToastProveedor } from './contexto/ToastContexto'
import { ConfirmacionProveedor } from './contexto/ConfirmacionContexto'
import ContenedorToasts from './componentes/ContenedorToasts'
import ContenedorConfirmacion from './componentes/ContenedorConfirmacion'
import Avatar from './componentes/Avatar'
import Escudo from './componentes/Escudo'
import CampoPassword from './componentes/CampoPassword'
import Calendario from './pantallas/Calendario'
import Festivos from './pantallas/Festivos'
import Ajustes from './pantallas/Ajustes'
import Ayuda from './pantallas/Ayuda'
import BarraInferior, { type Pestana } from './pantallas/BarraInferior'
import {
  Calendar,
  CalendarDays,
  Settings,
  HelpCircle,
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function App() {
  return (
    <ToastProveedor>
      <ConfirmacionProveedor>
        <UsuarioProveedor>
          <Aplicacion />
        </UsuarioProveedor>
      </ConfirmacionProveedor>
    </ToastProveedor>
  )
}

function Aplicacion() {
  const { usuario, cargando } = useUsuario()
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
    return (
      <>
        <Login />
        <ContenedorToasts />
        <ContenedorConfirmacion />
      </>
    )
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
          <a
            className={pestana === 'festivos' ? 'activo' : ''}
            onClick={() => setPestana('festivos')}
          >
            <CalendarDays size={16} />
            Festivos
          </a>
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
        </div>
      </nav>

      <div className="container">
        <Cabecera />

        {pestana === 'calendario' && <Calendario />}
        {pestana === 'festivos' && <Festivos />}
        {pestana === 'ajustes' && <Ajustes />}
        {pestana === 'ayuda' && <Ayuda />}
      </div>

      <BarraInferior pestana={pestana} onCambiar={setPestana} />
      <ContenedorToasts />
      <ContenedorConfirmacion />
    </>
  )
}

function Cabecera() {
  const { usuario } = useUsuario()
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
      <Avatar
        nombre={usuario.nombre ?? '?'}
        avatarUrl={usuario.avatar_url}
        tamano={40}
      />
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [registro, setRegistro] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

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
            autoComplete={registro ? 'new-password' : 'current-password'}
          />
          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}
          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 6 }}
            type="submit"
          >
            {registro ? 'Registrarse' : 'Iniciar sesión'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 12 }}>
          <a
            href="#"
            style={{ color: 'var(--acento)' }}
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
