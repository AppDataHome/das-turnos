import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

interface Festivo {
  id: string
  fecha: string
  ambito: 'nacional' | 'autonomico' | 'local'
  descripcion: string | null
  importado: boolean
}

const AMBITOS = [
  { valor: 'nacional', etiqueta: 'Nacional' },
  { valor: 'autonomico', etiqueta: 'Autonómico' },
  { valor: 'local', etiqueta: 'Local' },
] as const

export default function Festivos() {
  const anioActual = new Date().getFullYear()

  const [anio, setAnio] = useState<number>(anioActual)
  const [festivos, setFestivos] = useState<Festivo[]>([])
  const [cargando, setCargando] = useState(false)

  // Formulario
  const [idEditando, setIdEditando] = useState<string | null>(null)
  const [fecha, setFecha] = useState('')
  const [ambito, setAmbito] = useState<'nacional' | 'autonomico' | 'local'>(
    'nacional'
  )
  const [descripcion, setDescripcion] = useState('')

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    cargarFestivos()
  }, [anio])

  async function cargarFestivos() {
    setCargando(true)
    setMensaje('')
    setError('')

    const inicio = `${anio}-01-01`
    const fin = `${anio}-12-31`

    const { data, error } = await supabase
      .from('festivo_calendario')
      .select('*')
      .gte('fecha', inicio)
      .lte('fecha', fin)
      .order('fecha', { ascending: true })

    if (error) {
      setError(error.message)
      setFestivos([])
    } else {
      setFestivos(data as Festivo[])
    }
    setCargando(false)
  }

  async function guardarFestivo(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!fecha) {
      setError('Debes indicar una fecha')
      return
    }

    if (idEditando) {
      const { error } = await supabase
        .from('festivo_calendario')
        .update({
          fecha,
          ambito,
          descripcion: descripcion.trim() || null,
        })
        .eq('id', idEditando)

      if (error) {
        setError(error.message)
        return
      }
      setMensaje('Festivo actualizado')
      cancelarEdicion()
      cargarFestivos()
    } else {
      const { error } = await supabase.from('festivo_calendario').insert({
        fecha,
        ambito,
        descripcion: descripcion.trim() || null,
        importado: false,
      })

      if (error) {
        if (error.code === '23505')
          setError('Ese festivo ya existe para esa fecha y ámbito')
        else setError(error.message)
        return
      }
      setMensaje('Festivo añadido')
      setFecha('')
      setDescripcion('')
      cargarFestivos()
    }
  }

  function empezarEdicion(f: Festivo) {
    setIdEditando(f.id)
    setFecha(f.fecha)
    setAmbito(f.ambito)
    setDescripcion(f.descripcion ?? '')
    setError('')
    setMensaje('')
  }

  function cancelarEdicion() {
    setIdEditando(null)
    setFecha('')
    setAmbito('nacional')
    setDescripcion('')
  }

  async function borrarFestivo(id: string) {
    if (!confirm('¿Seguro que quieres borrar este festivo?')) return
    await supabase.from('festivo_calendario').delete().eq('id', id)
    cargarFestivos()
  }

  // Texto bonito de la fecha
  function textoFecha(f: string): string {
    const date = new Date(f + 'T00:00:00')
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
    const txt = date.toLocaleDateString('es-ES', opciones)
    return txt.charAt(0).toUpperCase() + txt.slice(1)
  }

  // Color por ámbito
  function colorAmbito(a: string): string {
    if (a === 'nacional') return '#dc2626'
    if (a === 'autonomico') return '#ea580c'
    return '#7c3aed'
  }

  // Años disponibles en el selector: 10 atrás, 10 adelante
  const añosDisponibles: number[] = []
  for (let i = anioActual - 5; i <= anioActual + 5; i++) {
    añosDisponibles.push(i)
  }

  return (
    <>
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ margin: 0 }}>Festivos del calendario</h2>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <label className="label" style={{ marginBottom: 0, alignSelf: 'center' }}>
              Año:
            </label>
            <select
              className="input"
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              style={{ width: 'auto', marginBottom: 0 }}
            >
              {añosDisponibles.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 12 }}>
          Los festivos nacionales se pueden importar automáticamente (próximamente).
          Los autonómicos y locales se introducen a mano desde aquí.
        </p>
      </div>

      {/* Formulario */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>
          {idEditando ? 'Editar festivo' : 'Añadir festivo'}
        </h3>
        <form onSubmit={guardarFestivo}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 2fr auto',
              gap: 12,
              alignItems: 'end',
            }}
          >
            <div>
              <label className="label">Fecha</label>
              <input
                className="input"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Ámbito</label>
              <select
                className="input"
                value={ambito}
                onChange={(e) =>
                  setAmbito(
                    e.target.value as 'nacional' | 'autonomico' | 'local'
                  )
                }
              >
                {AMBITOS.map((a) => (
                  <option key={a.valor} value={a.valor}>
                    {a.etiqueta}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Descripción</label>
              <input
                className="input"
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Por ejemplo: Año Nuevo"
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit">
                {idEditando ? 'Guardar' : 'Añadir'}
              </button>
              {idEditando && (
                <button
                  type="button"
                  className="btn"
                  onClick={cancelarEdicion}
                  style={{
                    background: 'var(--fondo-tarjeta-2)',
                    color: 'var(--texto)',
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}
        </form>
      </div>

      {/* Lista */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>
          Festivos de {anio} ({festivos.length})
        </h3>

        {cargando ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>Cargando…</p>
        ) : festivos.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>
            No hay festivos registrados para {anio}.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Ámbito</th>
                <th>Descripción</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {festivos.map((f) => (
                <tr key={f.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{textoFecha(f.fecha)}</td>
                  <td>
                    <span
                      className="chip"
                      style={{
                        background: colorAmbito(f.ambito),
                        color: 'white',
                        fontSize: 11,
                      }}
                    >
                      {f.ambito.toUpperCase()}
                    </span>
                  </td>
                  <td>{f.descripcion ?? '—'}</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn-mini"
                      style={{
                        background: 'var(--acento)',
                        color: '#0e1116',
                        marginRight: 6,
                      }}
                      onClick={() => empezarEdicion(f)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-mini btn-mini-peligro"
                      onClick={() => borrarFestivo(f.id)}
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
    </>
  )
}
