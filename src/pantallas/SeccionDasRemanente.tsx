import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'

interface DasRemanente {
  id: string
  cantidad: number
  descripcion: string | null
  creado_en: string
}

export default function SeccionDasRemanente() {
  const { usuario } = useUsuario()

  const [remanentes, setRemanentes] = useState<DasRemanente[]>([])
  const [cargando, setCargando] = useState(true)

  const [cantidad, setCantidad] = useState<number>(0)
  const [descripcion, setDescripcion] = useState('')

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (usuario) {
      cargar()
    }
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
    setMensaje('')

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
      return
    }

    setCantidad(0)
    setDescripcion('')
    setMensaje('DAS remanentes añadidos')
    cargar()
  }

  async function borrar(id: string) {
    if (!confirm('¿Seguro que quieres borrar este registro?')) return
    const { error } = await supabase.from('das_remanente').delete().eq('id', id)
    if (error) {
      setError(error.message)
      return
    }
    setMensaje('Registro borrado')
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
      <h2 style={{ marginBottom: 12 }}>DAS remanentes (cambio de destino)</h2>

      <p
        style={{
          fontSize: 13,
          color: 'var(--texto-suave)',
          marginBottom: 16,
        }}
      >
        Si vienes de otra unidad con DAS pendientes de disfrutar, añádelos aquí
        para que se sumen a tu saldo. Estas cantidades <strong>no se pierden</strong>{' '}
        aunque cambies de destino.
      </p>

      {/* Total destacado */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: 14,
          borderRadius: 10,
          background: 'var(--fondo-tarjeta-2)',
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 26 }}>🎁</span>
        <div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--acento)',
            }}
          >
            {totalRemanente}
          </div>
          <div style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
            DAS totales remanentes de destinos anteriores
          </div>
        </div>
      </div>

      {/* Formulario para añadir */}
      <form onSubmit={anadir}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '100px 1fr auto',
            gap: 12,
            alignItems: 'end',
          }}
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
            <label className="label">Descripción (opcional)</label>
            <input
              className="input"
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Por ejemplo: procedente de la Unidad de Tráfico"
            />
          </div>
          <button
            className="btn btn-primary"
            type="submit"
            disabled={guardando}
          >
            {guardando ? 'Añadiendo…' : 'Añadir'}
          </button>
        </div>

        {error && <p className="error">{error}</p>}
        {mensaje && <p className="success">{mensaje}</p>}
      </form>

      {/* Lista */}
      {cargando ? (
        <p
          style={{
            color: 'var(--texto-suave)',
            fontSize: 13,
            marginTop: 16,
          }}
        >
          Cargando…
        </p>
      ) : remanentes.length === 0 ? (
        <p
          style={{
            color: 'var(--texto-suave)',
            fontSize: 13,
            marginTop: 16,
          }}
        >
          No tienes DAS remanentes registrados.
        </p>
      ) : (
        <table style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th style={{ width: 100 }}>Cantidad</th>
              <th>Descripción</th>
              <th style={{ width: 110 }}>Añadido</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {remanentes.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 700 }}>{r.cantidad}</td>
                <td>{r.descripcion ?? '—'}</td>
                <td style={{ fontSize: 12, color: 'var(--texto-suave)' }}>
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
      )}
    </div>
  )
}
