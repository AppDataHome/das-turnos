import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useToast } from '../contexto/ToastContexto'
import { useConfirmacion } from '../contexto/ConfirmacionContexto'
import { useUsuario } from '../contexto/UsuarioContexto'

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
  const { puedeEditar } = useUsuario()
  const toast = useToast()
  const { confirmar } = useConfirmacion()

  const anioActual = new Date().getFullYear()

  const [anio, setAnio] = useState<number>(anioActual)
  const [festivos, setFestivos] = useState<Festivo[]>([])
  const [cargando, setCargando] = useState(false)
  const [importando, setImportando] = useState(false)

  const [idEditando, setIdEditando] = useState<string | null>(null)
  const [fecha, setFecha] = useState('')
  const [ambito, setAmbito] = useState<'nacional' | 'autonomico' | 'local'>(
    'nacional'
  )
  const [descripcion, setDescripcion] = useState('')

  const [error, setError] = useState('')

  useEffect(() => {
    cargarFestivos()
  }, [anio])

  async function cargarFestivos() {
    setCargando(true)
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

  async function importarNacionales() {
    const ok = await confirmar({
      titulo: `Importar festivos nacionales de ${anio}`,
      mensaje:
        'Se añadirán los 10 festivos nacionales (incluido el Viernes Santo). Los que ya existan no se duplicarán.',
      textoConfirmar: 'Importar',
    })
    if (!ok) return

    setImportando(true)
    setError('')

    const { data, error } = await supabase.rpc(
      'importar_festivos_nacionales',
      { p_anio: anio }
    )

    setImportando(false)

    if (error) {
      setError(error.message)
      toast.error('Error al importar: ' + error.message)
      return
    }

    if (data && data[0]) {
      const { creados, ignorados } = data[0]
      toast.exito(
        `Se han añadido ${creados} festivos nacionales.` +
          (ignorados > 0 ? ` ${ignorados} ya existían.` : '')
      )
      cargarFestivos()
    }
  }

  async function guardarFestivo(e: React.FormEvent) {
    e.preventDefault()
    setError('')

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
        toast.error('Error: ' + error.message)
        return
      }
      toast.exito('Festivo actualizado')
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
        if (error.code === '23505') {
          setError('Ese festivo ya existe para esa fecha y ámbito')
          toast.error('Ese festivo ya existe')
        } else {
          setError(error.message)
          toast.error('Error: ' + error.message)
        }
        return
      }
      toast.exito('Festivo añadido')
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
  }

  function cancelarEdicion() {
    setIdEditando(null)
    setFecha('')
    setAmbito('nacional')
    setDescripcion('')
  }

  async function borrarFestivo(id: string) {
    const ok = await confirmar({
      titulo: '¿Borrar este festivo?',
      mensaje: 'Esta acción no se puede deshacer.',
      textoConfirmar: 'Borrar',
      peligro: true,
    })
    if (!ok) return

    const { error } = await supabase
      .from('festivo_calendario')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Error al borrar: ' + error.message)
      return
    }
    toast.exito('Festivo borrado')
    cargarFestivos()
  }

  function textoFecha(f: string): string {
    const date = new Date(f + 'T00:00:00')
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }
    const txt = date.toLocaleDateString('es-ES', opciones)
    return txt.charAt(0).toUpperCase() + txt.slice(1)
  }

  function colorAmbito(a: string): string {
    if (a === 'nacional') return '#dc2626'
    if (a === 'autonomico') return '#ea580c'
    return '#7c3aed'
  }

  const añosDisponibles: number[] = []
  for (let i = anioActual - 5; i <= anioActual + 5; i++) {
    añosDisponibles.push(i)
  }

  return (
    <>
      {/* Cabecera: año + importar nacionales (solo propietarios) */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: puedeEditar ? 10 : 0,
            flexWrap: 'wrap',
          }}
        >
          <h2 style={{ margin: 0, flex: 1 }}>Festivos del calendario</h2>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <label className="label" style={{ marginBottom: 0 }}>
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

        {puedeEditar && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              className="btn btn-primary"
              onClick={importarNacionales}
              disabled={importando}
            >
              {importando
                ? 'Importando…'
                : `Importar nacionales de ${anio}`}
            </button>
            <p
              style={{
                fontSize: 10,
                color: 'var(--texto-suave)',
                margin: 0,
                flex: 1,
                minWidth: 0,
              }}
            >
              Añade los 10 festivos nacionales (incluido el Viernes Santo).
            </p>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </div>

      {/* Formulario: solo propietarios */}
      {puedeEditar && (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>
            {idEditando ? 'Editar festivo' : 'Añadir festivo'}
          </h3>
          <form onSubmit={guardarFestivo}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 2fr auto',
                gap: 6,
                alignItems: 'end',
              }}
              className="form-festivo"
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
                  placeholder="Año Nuevo"
                />
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="btn btn-primary" type="submit">
                  {idEditando ? 'Guardar' : 'Añadir'}
                </button>
                {idEditando && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelarEdicion}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Listado */}
      <div className="card">
        <h3 style={{ marginBottom: 10 }}>
          Festivos de {anio} ({festivos.length})
        </h3>

        {cargando ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 11 }}>
            Cargando…
          </p>
        ) : festivos.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 11 }}>
            No hay festivos registrados para {anio}.
          </p>
        ) : (
          <>
            <div className="lista-movil">
              {festivos.map((f) => (
                <div key={f.id} className="item-lista">
                  <div className="cabecera-item">
                    <span
                      className="chip"
                      style={{
                        background: colorAmbito(f.ambito),
                        color: 'white',
                      }}
                    >
                      {f.ambito.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {textoFecha(f.fecha)}
                    </span>
                  </div>
                  {f.descripcion && (
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--texto-suave)',
                        overflowWrap: 'break-word',
                      }}
                    >
                      {f.descripcion}
                    </div>
                  )}
                  {puedeEditar && (
                    <div className="acciones-item">
                      <button
                        className="btn-mini"
                        style={{
                          background: 'var(--acento)',
                          color: '#0b0e13',
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
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="tabla-desktop">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Ámbito</th>
                    <th>Descripción</th>
                    {puedeEditar && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {festivos.map((f) => (
                    <tr key={f.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {textoFecha(f.fecha)}
                      </td>
                      <td>
                        <span
                          className="chip"
                          style={{
                            background: colorAmbito(f.ambito),
                            color: 'white',
                          }}
                        >
                          {f.ambito.toUpperCase()}
                        </span>
                      </td>
                      <td>{f.descripcion ?? '—'}</td>
                      {puedeEditar && (
                        <td
                          style={{
                            textAlign: 'right',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <button
                            className="btn-mini"
                            style={{
                              background: 'var(--acento)',
                              color: '#0b0e13',
                              marginRight: 4,
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
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .form-festivo {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
