import { useState } from 'react'
import { supabase } from '../supabase'
import CampoPassword from '../componentes/CampoPassword'
import Escudo from '../componentes/Escudo'
import { Check } from 'lucide-react'

interface Props {
  onCompletado: () => void
}

export default function RestablecerPassword({ onCompletado }: Props) {
  const [pass1, setPass1] = useState('')
  const [pass2, setPass2] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [completado, setCompletado] = useState(false)

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (pass1.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (pass1 !== pass2) {
      setError('Las dos contraseñas no coinciden')
      return
    }

    setCargando(true)
    const { error: errCambio } = await supabase.auth.updateUser({
      password: pass1,
    })
    setCargando(false)

    if (errCambio) {
      setError('Error al guardar: ' + errCambio.message)
      return
    }

    setCompletado(true)

    // Esperar 1,5 segundos y volver al login
    setTimeout(() => {
      onCompletado()
    }, 1500)
  }

  if (completado) {
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
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(22, 163, 74, 0.15)',
                color: 'var(--exito)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Check size={40} />
            </div>
          </div>

          <h2 style={{ marginBottom: 8 }}>Contraseña actualizada</h2>
          <p style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
            Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
        </div>
      </div>
    )
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
          Nueva contraseña
        </p>

        <p
          style={{
            fontSize: 12,
            color: 'var(--texto-suave)',
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          Elige una contraseña nueva para tu cuenta.
        </p>

        <form onSubmit={guardar} style={{ textAlign: 'left' }}>
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

          {error && <p className="error">{error}</p>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 6 }}
            type="submit"
            disabled={cargando}
          >
            {cargando ? 'Guardando…' : 'Guardar nueva contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
