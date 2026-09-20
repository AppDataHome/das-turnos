import { useState } from 'react'
import { supabase } from '../supabase'
import Escudo from '../componentes/Escudo'
import { ArrowLeft, Mail } from 'lucide-react'

interface Props {
  onVolver: () => void
}

export default function RecuperarPassword({ onVolver }: Props) {
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMensaje('')

    const emailLimpio = email.trim().toLowerCase()
    if (!emailLimpio) {
      setError('Debes introducir tu correo')
      return
    }

    setCargando(true)

    const { error } = await supabase.auth.resetPasswordForEmail(emailLimpio, {
      redirectTo: window.location.origin + '/',
    })

    setCargando(false)

    if (error) {
      setError('Error al enviar el correo: ' + error.message)
      return
    }

    setMensaje(
      'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.'
    )
    setEmail('')
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
          Recuperar contraseña
        </p>

        <p
          style={{
            fontSize: 12,
            color: 'var(--texto-suave)',
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          Introduce el correo con el que te registraste. Te enviaremos un
          enlace para crear una contraseña nueva.
        </p>

        <form onSubmit={enviar} style={{ textAlign: 'left' }}>
          <label className="label">Correo electrónico</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            autoComplete="email"
          />

          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 6 }}
            type="submit"
            disabled={cargando}
          >
            <Mail size={14} />
            {cargando ? 'Enviando…' : 'Enviar enlace de recuperación'}
          </button>
        </form>

        <button
          type="button"
          className="btn btn-ghost"
          onClick={onVolver}
          style={{ width: '100%', marginTop: 12 }}
        >
          <ArrowLeft size={14} />
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  )
}
