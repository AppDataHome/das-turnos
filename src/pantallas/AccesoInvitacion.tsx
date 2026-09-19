import { useState } from 'react'
import { supabase } from '../supabase'
import Escudo from '../componentes/Escudo'
import { ArrowLeft, KeyRound } from 'lucide-react'

interface Props {
  onVolver: () => void
}

export default function AccesoInvitacion({ onVolver }: Props) {
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  async function acceder(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setCargando(true)

    const codigoLimpio = codigo.trim().toUpperCase()
    const nombreLimpio = nombre.trim()

    if (!codigoLimpio) {
      setError('Debes introducir el código de invitación')
      setCargando(false)
      return
    }

    // 1. Validar el código
    const { data: valData, error: valErr } = await supabase.rpc(
      'validar_invitacion',
      { p_codigo: codigoLimpio }
    )

    if (valErr) {
      setCargando(false)
      setError('Error al validar el código: ' + valErr.message)
      return
    }

    const valFila = (valData as any[])?.[0]
    if (!valFila?.ok) {
      setCargando(false)
      setError(valFila?.mensaje ?? 'Código no válido')
      return
    }

    // 2. Iniciar sesión anónima
    const { error: errAnon } = await supabase.auth.signInAnonymously()
    if (errAnon) {
      setCargando(false)
      setError('Error al crear la sesión de invitado: ' + errAnon.message)
      return
    }

    // 3. Canjear la invitación
    const { data: canData, error: canErr } = await supabase.rpc(
      'canjear_invitacion',
      {
        p_codigo: codigoLimpio,
        p_nombre: nombreLimpio || null,
      }
    )

    if (canErr) {
      setCargando(false)
      setError('Error al canjear la invitación: ' + canErr.message)
      await supabase.auth.signOut()
      return
    }

    const canFila = (canData as any[])?.[0]
    if (!canFila?.ok) {
      setCargando(false)
      setError(canFila?.mensaje ?? 'No se pudo canjear la invitación')
      await supabase.auth.signOut()
      return
    }

    // 4. Recargar para que el contexto detecte al invitado
    window.location.reload()
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
          Acceso con invitación
        </p>

        <p
          style={{
            fontSize: 12,
            color: 'var(--texto-suave)',
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          Introduce el código que te ha compartido el propietario. Podrás ver
          su calendario en modo solo lectura sin necesidad de crear una cuenta.
        </p>

        <form onSubmit={acceder} style={{ textAlign: 'left' }}>
          <label className="label">Tu nombre (opcional)</label>
          <input
            className="input"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Cómo quieres aparecer"
            maxLength={40}
            autoComplete="off"
          />

          <label className="label">Código de invitación</label>
          <input
            className="input"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="DAS-XXXX-XXXX"
            required
            style={{
              fontFamily: 'monospace',
              letterSpacing: 2,
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
            maxLength={20}
            autoComplete="off"
          />

          {error && <p className="error">{error}</p>}

          <button
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 6 }}
            type="submit"
            disabled={cargando}
          >
            <KeyRound size={14} />
            {cargando ? 'Accediendo…' : 'Acceder'}
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
