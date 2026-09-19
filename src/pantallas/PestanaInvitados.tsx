import { useState, useEffect } from 'react'
import { useUsuario } from '../contexto/UsuarioContexto'
import { useToast } from '../contexto/ToastContexto'
import { useConfirmacion } from '../contexto/ConfirmacionContexto'
import {
  Copy,
  Check,
  RefreshCw,
  Link2,
  Link2Off,
  UserMinus,
  Users,
  KeyRound,
} from 'lucide-react'

export default function PestanaInvitados() {
  const {
    usuario,
    esInvitado,
    generarCodigoInvitacion,
    revocarCodigoInvitacion,
    vincularComoInvitado,
    desvincularInvitado,
    listarMisInvitados,
    expulsarInvitado,
  } = useUsuario()
  const toast = useToast()
  const { confirmar } = useConfirmacion()

  // Estado para propietarios
  const [invitados, setInvitados] = useState<
    { id: string; nombre: string; email: string; avatar_url: string | null }[]
  >([])
  const [cargandoInvitados, setCargandoInvitados] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  // Estado para invitados (canjear código)
  const [codigo, setCodigo] = useState('')
  const [vinculando, setVinculando] = useState(false)

  useEffect(() => {
    if (usuario && !esInvitado) {
      cargarInvitados()
    }
  }, [usuario?.id, esInvitado])

  async function cargarInvitados() {
    setCargandoInvitados(true)
    const lista = await listarMisInvitados()
    setInvitados(lista)
    setCargandoInvitados(false)
  }

  async function generar() {
    setGenerando(true)
    try {
      const c = await generarCodigoInvitacion()
      toast.exito('Código generado: ' + c)
    } catch (err: any) {
      toast.error('Error al generar: ' + (err?.message ?? ''))
    } finally {
      setGenerando(false)
    }
  }

  async function revocar() {
    const ok = await confirmar({
      titulo: '¿Revocar el código de invitación?',
      mensaje:
        'El código actual dejará de funcionar. Los invitados ya vinculados seguirán siéndolo.',
      textoConfirmar: 'Revocar',
      peligro: true,
    })
    if (!ok) return

    try {
      await revocarCodigoInvitacion()
      toast.exito('Código revocado')
    } catch (err: any) {
      toast.error('Error: ' + (err?.message ?? ''))
    }
  }

  async function copiarCodigo() {
    if (!usuario?.codigo_invitacion) return
    try {
      await navigator.clipboard.writeText(usuario.codigo_invitacion)
      setCopiado(true)
      toast.exito('Código copiado al portapapeles')
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast.error('No se pudo copiar. Cópialo a mano.')
    }
  }

  async function expulsar(id: string, nombre: string) {
    const ok = await confirmar({
      titulo: `¿Expulsar a ${nombre}?`,
      mensaje:
        'Dejará de poder ver tus turnos. Podrá volver a vincularse con un nuevo código.',
      textoConfirmar: 'Expulsar',
      peligro: true,
    })
    if (!ok) return

    try {
      await expulsarInvitado(id)
      toast.exito('Invitado expulsado')
      cargarInvitados()
    } catch (err: any) {
      toast.error('Error: ' + (err?.message ?? ''))
    }
  }

  async function canjearCodigo(e: React.FormEvent) {
    e.preventDefault()
    setVinculando(true)

    const res = await vincularComoInvitado(codigo.trim())
    setVinculando(false)

    if (!res.ok) {
      toast.error(res.mensaje)
      return
    }

    toast.exito('Vinculación correcta. Ya puedes ver el calendario.')
    setCodigo('')
  }

  async function desvincular() {
    const ok = await confirmar({
      titulo: '¿Desvincularse?',
      mensaje: 'Dejarás de ver el calendario del propietario.',
      textoConfirmar: 'Desvincular',
      peligro: true,
    })
    if (!ok) return

    try {
      await desvincularInvitado()
      toast.exito('Desvinculado. Vuelves a ser usuario normal.')
    } catch (err: any) {
      toast.error('Error: ' + (err?.message ?? ''))
    }
  }

  if (!usuario) return null

  // ═══════════════════════════════════════════════════
  // VISTA PARA EL INVITADO (el que ve el calendario de otro)
  // ═══════════════════════════════════════════════════

  if (esInvitado) {
    return (
      <>
        <div className="card">
          <h2 style={{ marginBottom: 12 }}>Mi vinculación</h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: 12,
              background: 'var(--fondo-tarjeta-2)',
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            <Users size={22} color="var(--acento)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--texto-suave)',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  letterSpacing: 0.4,
                }}
              >
                Estás viendo el calendario de
              </div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                Tu propietario
              </div>
            </div>
          </div>

          <p
            style={{
              fontSize: 11,
              color: 'var(--texto-suave)',
              marginBottom: 12,
            }}
          >
            Como invitado solo tienes permisos de lectura: puedes consultar el
            calendario en sus distintas vistas, pero no puedes añadir, editar
            ni borrar turnos.
          </p>

          <button className="btn btn-danger" onClick={desvincular}>
            <Link2Off size={14} />
            Desvincularme
          </button>
        </div>
      </>
    )
  }

  // ═══════════════════════════════════════════════════
  // VISTA PARA EL PROPIETARIO (el que invita)
  // ═══════════════════════════════════════════════════

  return (
    <>
      {/* Código de invitación */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <KeyRound size={22} color="var(--acento)" />
          <h2 style={{ margin: 0 }}>Código de invitación</h2>
        </div>

        <p
          style={{
            fontSize: 11,
            color: 'var(--texto-suave)',
            marginBottom: 12,
          }}
        >
          Comparte este código con quien quieras que vea tu calendario en modo
          solo lectura. La persona tendrá que crear una cuenta en la app y, una
          vez dentro, introducir el código en{' '}
          <strong>Ajustes → Invitados</strong>.
        </p>

        {usuario.codigo_invitacion ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              background: 'var(--fondo-tarjeta-2)',
              border: '1px solid var(--borde-fuerte)',
              borderRadius: 10,
              marginBottom: 12,
            }}
          >
            <code
              style={{
                flex: 1,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: 2,
                color: 'var(--acento)',
                fontFamily: 'monospace',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {usuario.codigo_invitacion}
            </code>

            <button
              className="btn-mini"
              style={{
                background: copiado ? 'var(--exito)' : 'var(--acento)',
                color: '#0b0e13',
              }}
              onClick={copiarCodigo}
              title="Copiar al portapapeles"
            >
              {copiado ? <Check size={12} /> : <Copy size={12} />}
              {copiado ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        ) : (
          <p
            style={{
              fontSize: 11,
              color: 'var(--texto-suave)',
              fontStyle: 'italic',
              marginBottom: 12,
            }}
          >
            Aún no has generado ningún código.
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={generar}
            disabled={generando}
          >
            <RefreshCw size={14} />
            {generando
              ? 'Generando…'
              : usuario.codigo_invitacion
              ? 'Regenerar código'
              : 'Generar código'}
          </button>

          {usuario.codigo_invitacion && (
            <button className="btn btn-secondary" onClick={revocar}>
              <Link2Off size={14} />
              Revocar código
            </button>
          )}
        </div>

        <p
          style={{
            fontSize: 10,
            color: 'var(--texto-suave)',
            marginTop: 10,
            lineHeight: 1.4,
          }}
        >
          ⚠️ Si regeneras el código, el anterior dejará de funcionar. Los
          invitados ya vinculados seguirán viendo tu calendario.
        </p>
      </div>

      {/* Lista de invitados */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <Users size={22} color="var(--acento)" />
          <h2 style={{ margin: 0 }}>
            Invitados ({invitados.length})
          </h2>
        </div>

        <p
          style={{
            fontSize: 11,
            color: 'var(--texto-suave)',
            marginBottom: 12,
          }}
        >
          Personas que están viendo tu calendario en modo solo lectura.
        </p>

        {cargandoInvitados ? (
          <p style={{ fontSize: 11, color: 'var(--texto-suave)' }}>
            Cargando…
          </p>
        ) : invitados.length === 0 ? (
          <p
            style={{
              fontSize: 12,
              color: 'var(--texto-suave)',
              textAlign: 'center',
              padding: 12,
              fontStyle: 'italic',
            }}
          >
            Aún no tienes invitados vinculados.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {invitados.map((inv) => (
              <div
                key={inv.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: 10,
                  background: 'var(--fondo-tarjeta-2)',
                  borderRadius: 8,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'var(--acento)',
                    color: '#0b0e13',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {(inv.nombre?.[0] ?? '?').toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inv.nombre}
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--texto-suave)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {inv.email}
                  </div>
                </div>

                <button
                  className="btn-mini btn-mini-peligro"
                  onClick={() => expulsar(inv.id, inv.nombre)}
                  title="Expulsar"
                >
                  <UserMinus size={12} />
                  Expulsar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Canjear código (por si el propio propietario quiere vincularse a otro) */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <Link2 size={22} color="var(--acento)" />
          <h2 style={{ margin: 0 }}>¿Tienes un código de invitación?</h2>
        </div>

        <p
          style={{
            fontSize: 11,
            color: 'var(--texto-suave)',
            marginBottom: 12,
          }}
        >
          Si otra persona te ha dado su código, introdúcelo aquí para ver su
          calendario en modo solo lectura.{' '}
          <strong>
            Ojo: si te vinculas como invitado, dejarás de ser propietario y no
            podrás gestionar tus propios turnos.
          </strong>
        </p>

        <form
          onSubmit={canjearCodigo}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
        >
          <input
            className="input"
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="DAS-XXXX-XXXX"
            style={{
              flex: 1,
              minWidth: 180,
              marginBottom: 0,
              fontFamily: 'monospace',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
            required
          />
          <button
            className="btn btn-primary"
            type="submit"
            disabled={vinculando || !codigo.trim()}
          >
            {vinculando ? 'Vinculando…' : 'Vincularme'}
          </button>
        </form>
      </div>
    </>
  )
}
