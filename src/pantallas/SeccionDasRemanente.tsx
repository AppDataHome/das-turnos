import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { useToast } from '../contexto/ToastContexto'
import { useConfirmacion } from '../contexto/ConfirmacionContexto'

interface DasRemanente {
  id: string
  cantidad: number
  descripcion: string | null
  creado_en: string
}

export default function SeccionDasRemanente() {
  const { usuario } = useUsuario()
  const toast = useToast()
  const { confirmar } = useConfirmacion()

  const [remanentes, setRemanentes] = useState<DasRemanente[]>([])
  const [cargando, setCargando] = useState(true)

  const [cantidad, setCantidad] = useState<number>(0)
  const [descripcion, setDescripcion] = useState('')

  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (usuario) cargar()
  }, [usuario])

  async function cargar() {
    if (!usuario) return
    setCargando(true)
    const { data, error } = await supabase
      .from('das_remanente')
      .select('id, cantidad, descripcion, creado_en')
      .eq('id_usuario', usuario.id)
      .order('creado_en', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setRemanentes(data as DasRemanente[])
    }
    setCargando(false)
  }

  async function anadir(e: React.FormEvent) {
    e.preventDefault()
    if (!usuario) return
    setError('')

    if (!cantidad || cantidad <= 0) {
      setError('La cantidad debe ser mayor que 0')
      return
    }

    setGuardando(true)
    const { error } = await supabase.from('das_remanente').insert({
      id_usuario: usuario.id,
      cantidad: Number(cantidad),
      descripcion: descripcion.trim() || null,
    })
    setGuardando(false)

    if (error) {
      setError(error.message)
      toast.error('Error: ' + error.message)
      return
    }

    toast.exito('DAS remanentes añadidos')
    setCantidad(0)
    setDescripcion('')
    cargar()
  }

  async function borrar(id: string) {
    const ok = await confirmar({
      titulo: '¿Borrar este registro?',
      mensaje: 'Esta acción no se puede deshacer.',
      textoConfirmar: 'Borrar',
      peligro: true,
    })
    if (!ok) return

    const { error } = await supabase.from('das_remanente').delete().eq('id', id)

    if (error) {
      setError(error.message)
      toast.error('Error: ' + error.message)
      return
    }
    toast.exito('Registro borrado')
    cargar()
  }

  function textoFecha(iso: string): string {
    const d = new Date(iso)
    const opciones: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }
    return d.toLocaleDateString('es-ES', opciones)
  }

  if (!usuario) return null

  const totalRemanente = remanentes.reduce((acc, r) => acc + r.cantidad, 0)

  return (
    <div className="card">
      <h2 style={{ marginBottom: 8 }}>DAS remanentes (cambio de destino)</h2>

      <p
        style={{
          fontSize: 11,
          color: 'var(--texto-suave)',
          marginBottom: 12,
        }}
      >
        Si vienes de otra unidad con DAS pendientes, añádelos aquí. Estas
        cantidades <strong>no se pierden</strong> aunque cambies de destino.
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: 10,
          borderRadius: 8,
          background: 'var(--fondo-tarjeta-2)',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 22 }}>🎁</span>
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--acento)',
            }}
          >
            {totalRemanente}
          </div>
          <div style={{ fontSize: 10, color: 'var(--texto-suave)' }}>
            DAS totales remanentes
          </div>
        </div>
      </div>

      <form onSubmit={anadir}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '90px 1fr auto',
            gap: 6,
            alignItems: 'end',
          }}
          className="form-remanente"
        >
          <div>
            <label className="label">Cantidad</label>
            <input
              className="input"
              type="number"
              min={1}
              max={999}
              value={cantidad || ''}
              onChange={(e) => setCantidad(Number(e.target.value))}
              required
            />
          </div>
          <div>
            <label className="label">Descripción</label>
            <input
              className="input"
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Unidad de Tráfico"
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={guardando}
            style={{ marginBottom: 6 }}
          >
            {guardando ? 'Añadiendo…' : 'Añadir'}
          </button>
        </div>

        {error && <p className="error">{error}</p>}
      </form>

      {cargando ? (
        <p
          style={{
            color: 'var(--texto-suave)',
            fontSize: 11,
            marginTop: 12,
          }}
        >
          Cargando…
        </p>
      ) : remanentes.length === 0 ? (
        <p
          style={{
            color: 'var(--texto-suave)',
            fontSize: 11,
            marginTop: 12,
          }}
        >
          No tienes DAS remanentes registrados.
        </p>
      ) : (
        <>
          <div className="lista-movil" style={{ marginTop: 12 }}>
            {remanentes.map((r) => (
              <div key={r.id} className="item-lista">
                <div className="cabecera-item">
                  <span
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: 'var(--acento)',
                      minWidth: 30,
                    }}
                  >
                    {r.cantidad}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      flex: 1,
                      minWidth: 0,
                      overflowWrap: 'break-word',
                    }}
                  >
                    {r.descripcion ?? '—'}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: 'var(--texto-suave)',
                  }}
                >
                  {textoFecha(r.creado_en)}
                </div>
                <div className="acciones-item">
                  <button
                    className="btn-mini btn-mini-peligro"
                    onClick={() => borrar(r.id)}
                  >
                    Borrar
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="tabla-desktop" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: 80 }}>Cantidad</th>
                  <th>Descripción</th>
                  <th style={{ width: 100 }}>Añadido</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {remanentes.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.cantidad}</td>
                    <td>{r.descripcion ?? '—'}</td>
                    <td style={{ fontSize: 11, color: 'var(--texto-suave)' }}>
                      {textoFecha(r.creado_en)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn-mini btn-mini-peligro"
                        onClick={() => borrar(r.id)}
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <style>{`
        @media (max-width: 700px) {
          .form-remanente {
            grid-template-columns: 1fr 1fr !important;
          }
          .form-remanente > button {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </div>
  )
}
