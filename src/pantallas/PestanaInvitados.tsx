import { useState, useEffect } from 'react'
import { useUsuario, type Invitacion } from '../contexto/UsuarioContexto'
import { useToast } from '../contexto/ToastContexto'
import { useConfirmacion } from '../contexto/ConfirmacionContexto'
import {
  Copy,
  Check,
  Plus,
  Trash2,
  UserMinus,
  Users,
  KeyRound,
  Link2Off,
  X,
  Clock,
} from 'lucide-react'

export default function PestanaInvitados() {
  const {
    usuario,
    esInvitado,
    crearInvitacion,
    revocarInvitacion,
    eliminarInvitacion,
    listarInvitaciones,
    listarVinculados,
    expulsarInvitado,
    desvincularme,
  } = useUsuario()
  const toast = useToast()
  const { confirmar } = useConfirmacion()

  // ─────────── Estado propietario ───────────
  const [invitaciones, setInvitaciones] = useState<Invitacion[]>([])
  const [vinculados, setVinculados] = useState<
    { id: string; nombre: string; email: string; avatar_url: string | null }[]
  >([])
  const [cargando, setCargando] = useState(false)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [creando, setCreando] = useState(false)
  const [codigoCopiado, setCodigoCopiado] = useState<string | null>(null)

  useEffect(() => {
    if (usuario && !esInvitado) {
      cargarTodo()
    }
  }, [usuario?.id, esInvitado])

  async function cargarTodo() {
    setCargando(true)
    const [inv, vinc] = await Promise.all([
      listarInvitaciones(),
      listarVinculados(),
    ])
    setInvitaciones(inv)
    setVinculados(vinc)
    setCargando(false)
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault()
    setCreando(true)
    const res = await crearInvitacion(nombreNuevo.trim())
    setCreando(false)

    if (!res.ok) {
      toast.error(res.mensaje)
      return
    }

    toast.exito('Invitación creada: ' + (res.codigo ?? ''))
    setNombreNuevo('')
    cargarTodo()
  }

  async function copiarCodigo(codigo: string) {
    try {
      await navigator.clipboard.writeText(codigo)
      setCodigoCopiado(codigo)
      toast.exito('Código copiado al portapapeles')
      setTimeout(() => setCodigoCopiado(null), 2000)
    } catch {
      toast.error('No se pudo copiar. Cópialo a mano.')
    }
  }

  async function revocar(inv: Invitacion) {
    const ok = await confirmar({
      titulo: '¿Revocar esta invitación?',
      mensaje:
        'El código dejará de funcionar. Los invitados que ya lo hayan canjeado seguirán vinculados hasta que los expulses.',
      textoConfirmar: 'Revocar',
      peligro: true,
    })
    if (!ok) return

    try {
      await revocarInvitacion(inv.id)
      toast.exito('Invitación revocada')
      cargarTodo()
    } catch (err: any) {
      toast.error('Error: ' + (err?.message ?? ''))
    }
  }

  async function eliminar(inv: Invitacion) {
    const ok = await confirmar({
      titulo: '¿Eliminar esta invitación?',
      mensaje: 'Se borrará de la lista. Esta acción no se puede deshacer.',
      textoConfirmar: 'Eliminar',
      peligro: true,
    })
    if (!ok) return

    try {
      await eliminarInvitacion(inv.id)
      toast.exito('Invitación eliminada')
      cargarTodo()
    } catch (err: any) {
      toast.error('Error: ' + (err?.message ?? ''))
    }
  }

  async function expulsar(
    id: string,
    nombre: string
  ) {
    const ok = await confirmar({
      titulo: `¿Expulsar a ${nombre}?`,
      mensaje:
        'Dejará de ver tu calendario inmediatamente. Podrá volver si le das un código nuevo.',
      textoConfirmar: 'Expulsar',
      peligro: true,
    })
    if (!ok) return

    try {
      await expulsarInvitado(id)
      toast.exito('Invitado expulsado')
      cargarTodo()
    } catch (err: any) {
      toast.error('Error: ' + (err?.message ?? ''))
    }
  }

  async function salirDeInvitado() {
    const ok = await confirmar({
      titulo: '¿Desvincularme?',
      mensaje:
        'Dejarás de ver el calendario del propietario y volverás a la pantalla de inicio.',
      textoConfirmar: 'Desvincularme',
      peligro: true,
    })
    if (!ok) return

    try {
      await desvincularme()
    } catch (err: any) {
      toast.error('Error: ' + (err?.message ?? ''))
    }
  }

  if (!usuario) return null

  // ═══════════════════════════════════════════════════
  // VISTA PARA EL INVITADO
  // ═══════════════════════════════════════════════════

  if (esInvitado) {
    return (
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
              {usuario.nombre}
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: 11,
            color: 'var(--texto-suave)',
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          Como invitado solo tienes permisos de lectura: puedes consultar el
          calendario en sus distintas vistas, pero no puedes añadir, editar ni
          borrar turnos.
        </p>

        <button className="btn btn-danger" onClick={salirDeInvitado}>
          <Link2Off size={14} />
          Desvincularme
        </button>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════
  // VISTA PARA EL PROPIETARIO
  // ═══════════════════════════════════════════════════

  return (
    <>
      {/* Crear invitación */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <Plus size={20} color="var(--acento)" />
          <h2 style={{ margin: 0 }}>Crear invitación</h2>
        </div>

        <p
          style={{
            fontSize: 11,
            color: 'var(--texto-suave)',
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          Crea un código y compártelo con quien quieras que vea tu calendario
          en solo lectura (familiares, etc.). No necesita registrarse: solo
          introduce el código en la pantalla de inicio.
        </p>

        <form onSubmit={crear}>
          <label className="label">
            Nombre del invitado (para identificarlo)
          </label>
          <input
            className="input"
            type="text"
            value={nombreNuevo}
            onChange={(e) => setNombreNuevo(e.target.value)}
            placeholder="Por ejemplo: María (madre)"
            maxLength={60}
          />

          <button
            className="btn btn-primary"
            type="submit"
            disabled={creando}
            style={{ width: '100%', marginTop: 4 }}
          >
            <Plus size={14} />
            {creando ? 'Creando…' : 'Crear invitación'}
          </button>
        </form>
      </div>

      {/* Lista de invitaciones */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <KeyRound size={20} color="var(--acento)" />
          <h2 style={{ margin: 0 }}>
            Códigos generados ({invitaciones.length})
          </h2>
        </div>

        {cargando ? (
          <p style={{ fontSize: 11, color: 'var(--texto-suave)' }}>
            Cargando…
          </p>
        ) : invitaciones.length === 0 ? (
          <p
            style={{
              fontSize: 12,
              color: 'var(--texto-suave)',
              textAlign: 'center',
              padding: 12,
              fontStyle: 'italic',
            }}
          >
            Aún no has creado ninguna invitación.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {invitaciones.map((inv) => (
              <div
                key={inv.id}
                style={{
                  padding: 10,
                  background: 'var(--fondo-tarjeta-2)',
                  borderRadius: 8,
                  border: inv.revocada
                    ? '1px solid rgba(220, 38, 38, 0.4)'
                    : '1px solid transparent',
                  opacity: inv.revocada ? 0.6 : 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <code
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      letterSpacing: 1.5,
                      color: inv.revocada
                        ? 'var(--texto-suave)'
                        : 'var(--acento)',
                      fontFamily: 'monospace',
                      textDecoration: inv.revocada
                        ? 'line-through'
                        : 'none',
                    }}
                  >
                    {inv.codigo}
                  </code>

                  {inv.revocada && (
                    <span
                      className="chip"
                      style={{
                        background: '#dc2626',
                        color: 'white',
                      }}
                    >
                      REVOCADO
                    </span>
                  )}

                  {inv.ultimo_acceso && !inv.revocada && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        fontSize: 10,
                        color: 'var(--exito)',
                      }}
                    >
                      <Check size={10} />
                      Canjeado
                    </span>
                  )}
                </div>

                {inv.nombre_invitado && (
                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--texto)',
                      marginBottom: 4,
                    }}
                  >
                    👤 {inv.nombre_invitado}
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  {!inv.revocada && (
                    <button
                      className="btn-mini"
                      style={{
                        background:
                          codigoCopiado === inv.codigo
                            ? 'var(--exito)'
                            : 'var(--acento)',
                        color: '#0b0e13',
                      }}
                      onClick={() => copiarCodigo(inv.codigo)}
                    >
                      {codigoCopiado === inv.codigo ? (
                        <>
                          <Check size={11} /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={11} /> Copiar
                        </>
                      )}
                    </button>
                  )}

                  {!inv.revocada && (
                    <button
                      className="btn-mini"
                      style={{
                        background: 'var(--fondo-tarjeta-3)',
                        color: 'var(--texto)',
                      }}
                      onClick={() => revocar(inv)}
                    >
                      <X size={11} /> Revocar
                    </button>
                  )}

                  <button
                    className="btn-mini btn-mini-peligro"
                    onClick={() => eliminar(inv)}
                  >
                    <Trash2 size={11} /> Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invitados vinculados */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <Users size={20} color="var(--acento)" />
          <h2 style={{ margin: 0 }}>
            Invitados vinculados ({vinculados.length})
          </h2>
        </div>

        <p
          style={{
            fontSize: 11,
            color: 'var(--texto-suave)',
            marginBottom: 12,
          }}
        >
          Personas que ya han canjeado un código y están viendo tu calendario
          ahora mismo.
        </p>

        {cargando ? (
          <p style={{ fontSize: 11, color: 'var(--texto-suave)' }}>
            Cargando…
          </p>
        ) : vinculados.length === 0 ? (
          <p
            style={{
              fontSize: 12,
              color: 'var(--texto-suave)',
              textAlign: 'center',
              padding: 12,
              fontStyle: 'italic',
            }}
          >
            Aún no hay nadie viendo tu calendario.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {vinculados.map((v) => (
              <div
                key={v.id}
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
                  {(v.nombre?.[0] ?? '?').toUpperCase()}
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
                    {v.nombre}
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
                    Desde {new Date(
                      v.id ? Date.now() : Date.now()
                    ).toLocaleDateString('es-ES')}
                  </div>
                </div>

                <button
                  className="btn-mini btn-mini-peligro"
                  onClick={() => expulsar(v.id, v.nombre)}
                  title="Expulsar"
                >
                  <UserMinus size={11} />
                  Expulsar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
