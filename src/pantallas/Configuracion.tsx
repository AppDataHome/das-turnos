import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import type { Departamento, TipoTurno } from '../tipos'

type Seccion = 'departamentos' | 'tipos-turno'

export default function Configuracion() {
  const [seccion, setSeccion] = useState<Seccion>('departamentos')

  return (
    <div className="container">
      {/* Selector de sección */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          marginBottom: 20,
          padding: 4,
          background: 'var(--fondo-tarjeta)',
          border: '1px solid var(--borde)',
          borderRadius: 10,
          width: 'fit-content',
        }}
      >
        <button
          onClick={() => setSeccion('departamentos')}
          style={{
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            background:
              seccion === 'departamentos' ? 'var(--acento)' : 'transparent',
            color:
              seccion === 'departamentos' ? '#0e1116' : 'var(--texto-suave)',
          }}
        >
          Departamentos
        </button>
        <button
          onClick={() => setSeccion('tipos-turno')}
          style={{
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            background:
              seccion === 'tipos-turno' ? 'var(--acento)' : 'transparent',
            color:
              seccion === 'tipos-turno' ? '#0e1116' : 'var(--texto-suave)',
          }}
        >
          Tipos de turno
        </button>
      </div>

      {seccion === 'departamentos' && <SeccionDepartamentos />}
      {seccion === 'tipos-turno' && <SeccionTiposTurno />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────
// SECCIÓN: DEPARTAMENTOS
// ─────────────────────────────────────────────────────────

function SeccionDepartamentos() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [cargando, setCargando] = useState(true)

  const [idEditando, setIdEditando] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [icono, setIcono] = useState('📁')

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    const { data, error } = await supabase
      .from('departamento')
      .select('*')
      .order('nombre')
    if (error) setError(error.message)
    else setDepartamentos(data as Departamento[])
    setCargando(false)
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!nombre.trim()) {
      setError('El nombre no puede estar vacío')
      return
    }

    if (idEditando) {
      const { error } = await supabase
        .from('departamento')
        .update({ nombre: nombre.trim(), icono })
        .eq('id', idEditando)

      if (error) {
        if (error.code === '23505')
          setError('Ya existe un departamento con ese nombre')
        else setError(error.message)
        return
      }
      setMensaje('Departamento actualizado')
      cancelar()
      cargar()
    } else {
      const { error } = await supabase
        .from('departamento')
        .insert({ nombre: nombre.trim(), icono, activo: true })

      if (error) {
        if (error.code === '23505')
          setError('Ya existe un departamento con ese nombre')
        else setError(error.message)
        return
      }
      setMensaje('Departamento añadido')
      cancelar()
      cargar()
    }
  }

  function editar(d: Departamento) {
    setIdEditando(d.id)
    setNombre(d.nombre)
    setIcono((d as any).icono ?? '📁')
    setError('')
    setMensaje('')
  }

  function cancelar() {
    setIdEditando(null)
    setNombre('')
    setIcono('📁')
  }

  async function cambiarActivo(d: Departamento) {
    const { error } = await supabase
      .from('departamento')
      .update({ activo: !d.activo })
      .eq('id', d.id)
    if (error) setError(error.message)
    else cargar()
  }

  async function borrar(d: Departamento) {
    if (
      !confirm(
        `¿Seguro que quieres borrar "${d.nombre}"? Esta acción no se puede deshacer.`
      )
    )
      return

    const { error } = await supabase.from('departamento').delete().eq('id', d.id)

    if (error) {
      if (error.code === '23503') {
        setError(
          'No se puede borrar: hay turnos que usan este departamento. Desactívalo en su lugar.'
        )
      } else {
        setError(error.message)
      }
      return
    }
    setMensaje('Departamento borrado')
    cargar()
  }

  return (
    <>
      <div className="card">
        <h2 style={{ marginBottom: 16 }}>Departamentos</h2>

        <form onSubmit={guardar}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              gap: 12,
              alignItems: 'end',
            }}
          >
            <div>
              <label className="label">Icono</label>
              <input
                className="input"
                type="text"
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                style={{ width: 80, textAlign: 'center', fontSize: 20 }}
                maxLength={4}
              />
            </div>
            <div>
              <label className="label">Nombre</label>
              <input
                className="input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Por ejemplo: Unidad Canina"
                required
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
                  onClick={cancelar}
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

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>
          Listado ({departamentos.length})
        </h3>

        {cargando ? (
          <p style={{ color: 'var(--texto-suave)' }}>Cargando…</p>
        ) : departamentos.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)' }}>
            No hay departamentos registrados.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>Icono</th>
                <th>Nombre</th>
                <th style={{ width: 100 }}>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {departamentos.map((d) => (
                <tr key={d.id} style={{ opacity: d.activo ? 1 : 0.5 }}>
                  <td style={{ fontSize: 22 }}>
                    {(d as any).icono ?? '📁'}
                  </td>
                  <td>{d.nombre}</td>
                  <td>
                    <span
                      className="chip"
                      style={{
                        background: d.activo ? '#16a34a' : '#6b7280',
                        color: 'white',
                        fontSize: 11,
                      }}
                    >
                      {d.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn-mini"
                      style={{
                        background: 'var(--acento)',
                        color: '#0e1116',
                        marginRight: 6,
                      }}
                      onClick={() => editar(d)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-mini"
                      style={{
                        background: d.activo ? '#6b7280' : '#16a34a',
                        color: 'white',
                        marginRight: 6,
                      }}
                      onClick={() => cambiarActivo(d)}
                    >
                      {d.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      className="btn-mini btn-mini-peligro"
                      onClick={() => borrar(d)}
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

// ─────────────────────────────────────────────────────────
// SECCIÓN: TIPOS DE TURNO
// ─────────────────────────────────────────────────────────

const CATEGORIAS = [
  { valor: 'trabajo', etiqueta: 'Trabajo (cuenta para DAS)' },
  { valor: 'libre', etiqueta: 'Libre / Ausencia' },
  { valor: 'formacion', etiqueta: 'Formación' },
  { valor: 'otros', etiqueta: 'Otros' },
] as const

function SeccionTiposTurno() {
  const [tipos, setTipos] = useState<TipoTurno[]>([])
  const [cargando, setCargando] = useState(true)

  const [idEditando, setIdEditando] = useState<string | null>(null)
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [horaInicio, setHoraInicio] = useState('00:00')
  const [horaFin, setHoraFin] = useState('00:00')
  const [cruzaMedianoche, setCruzaMedianoche] = useState(false)
  const [categoria, setCategoria] = useState<
    'trabajo' | 'libre' | 'formacion' | 'otros'
  >('trabajo')
  const [color, setColor] = useState('#6b7280')
  const [orden, setOrden] = useState(100)

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    cargar()
  }, [])

  async function cargar() {
    setCargando(true)
    const { data, error } = await supabase
      .from('tipo_turno')
      .select('*')
      .order('orden')
    if (error) setError(error.message)
    else setTipos(data as TipoTurno[])
    setCargando(false)
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (!codigo.trim() || !nombre.trim()) {
      setError('El código y el nombre son obligatorios')
      return
    }

    const payload = {
      codigo: codigo.trim().toUpperCase(),
      nombre: nombre.trim(),
      hora_inicio: horaInicio,
      hora_fin: horaFin,
      cruza_medianoche: cruzaMedianoche,
      categoria,
      color,
      orden: Number(orden) || 100,
    }

    if (idEditando) {
      const { error } = await supabase
        .from('tipo_turno')
        .update(payload)
        .eq('id', idEditando)
      if (error) {
        if (error.code === '23505')
          setError('Ya existe un tipo de turno con ese código')
        else setError(error.message)
        return
      }
      setMensaje('Tipo de turno actualizado')
      cancelar()
      cargar()
    } else {
      const { error } = await supabase.from('tipo_turno').insert(payload)
      if (error) {
        if (error.code === '23505')
          setError('Ya existe un tipo de turno con ese código')
        else setError(error.message)
        return
      }
      setMensaje('Tipo de turno añadido')
      cancelar()
      cargar()
    }
  }

  function editar(t: TipoTurno) {
    setIdEditando(t.id)
    setCodigo(t.codigo)
    setNombre(t.nombre)
    setHoraInicio(t.hora_inicio ?? '00:00')
    setHoraFin(t.hora_fin ?? '00:00')
    setCruzaMedianoche(t.cruza_medianoche)
    setCategoria(t.categoria ?? 'trabajo')
    setColor(t.color ?? '#6b7280')
    setOrden((t as any).orden ?? 100)
    setError('')
    setMensaje('')
  }

  function cancelar() {
    setIdEditando(null)
    setCodigo('')
    setNombre('')
    setHoraInicio('00:00')
    setHoraFin('00:00')
    setCruzaMedianoche(false)
    setCategoria('trabajo')
    setColor('#6b7280')
    setOrden(100)
  }

  async function cambiarActivo(t: TipoTurno) {
    // Nota: no tenemos campo "activo" en tipo_turno actualmente.
    // Si quieres, se puede añadir después. Por ahora, no hace nada.
    alert('Por ahora los tipos de turno no se desactivan. En una próxima versión.')
  }

  async function borrar(t: TipoTurno) {
    if (
      !confirm(
        `¿Seguro que quieres borrar "${t.nombre}"? Esta acción no se puede deshacer.`
      )
    )
      return

    const { error } = await supabase.from('tipo_turno').delete().eq('id', t.id)

    if (error) {
      if (error.code === '23503') {
        setError(
          'No se puede borrar: hay turnos que usan este tipo. Cámbialos antes.'
        )
      } else {
        setError(error.message)
      }
      return
    }
    setMensaje('Tipo de turno borrado')
    cargar()
  }

  return (
    <>
      <div className="card">
        <h2 style={{ marginBottom: 16 }}>Tipos de turno</h2>

        <form onSubmit={guardar}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '90px 1fr 100px 100px 1fr',
              gap: 12,
              alignItems: 'end',
              marginBottom: 12,
            }}
          >
            <div>
              <label className="label">Código</label>
              <input
                className="input"
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="M"
                maxLength={5}
                required
              />
            </div>
            <div>
              <label className="label">Nombre</label>
              <input
                className="input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Mañana"
                required
              />
            </div>
            <div>
              <label className="label">Inicio</label>
              <input
                className="input"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Fin</label>
              <input
                className="input"
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
              />
            </div>
            <div>
              <label className="label">Categoría</label>
              <select
                className="input"
                value={categoria}
                onChange={(e) =>
                  setCategoria(
                    e.target.value as
                      | 'trabajo'
                      | 'libre'
                      | 'formacion'
                      | 'otros'
                  )
                }
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 90px 120px 1fr auto',
              gap: 12,
              alignItems: 'end',
            }}
          >
            <div>
              <label className="label">Color</label>
              <input
                className="input"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ height: 40, padding: 4 }}
              />
            </div>
            <div>
              <label className="label">Orden</label>
              <input
                className="input"
                type="number"
                min={1}
                max={999}
                value={orden}
                onChange={(e) => setOrden(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="label">Cruza medianoche</label>
              <select
                className="input"
                value={cruzaMedianoche ? 'si' : 'no'}
                onChange={(e) => setCruzaMedianoche(e.target.value === 'si')}
              >
                <option value="no">No</option>
                <option value="si">Sí</option>
              </select>
            </div>
            <div></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" type="submit">
                {idEditando ? 'Guardar' : 'Añadir'}
              </button>
              {idEditando && (
                <button
                  type="button"
                  className="btn"
                  onClick={cancelar}
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

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Listado ({tipos.length})</h3>

        {cargando ? (
          <p style={{ color: 'var(--texto-suave)' }}>Cargando…</p>
        ) : tipos.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)' }}>
            No hay tipos de turno registrados.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>Color</th>
                <th style={{ width: 70 }}>Código</th>
                <th>Nombre</th>
                <th>Horario</th>
                <th>Categoría</th>
                <th style={{ width: 60 }}>Orden</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        background: t.color,
                      }}
                    />
                  </td>
                  <td style={{ fontWeight: 700 }}>{t.codigo}</td>
                  <td>{t.nombre}</td>
                  <td style={{ fontSize: 12 }}>
                    {t.hora_inicio && t.hora_fin
                      ? `${t.hora_inicio.slice(0, 5)} – ${t.hora_fin.slice(0, 5)}`
                      : '—'}
                  </td>
                  <td>
                    <span
                      className="chip"
                      style={{
                        background:
                          t.categoria === 'trabajo'
                            ? '#2563eb'
                            : t.categoria === 'libre'
                            ? '#f59e0b'
                            : t.categoria === 'formacion'
                            ? '#0ea5e9'
                            : '#6b7280',
                        color: 'white',
                        fontSize: 10,
                      }}
                    >
                      {t.categoria.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {(t as any).orden ?? 100}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      className="btn-mini"
                      style={{
                        background: 'var(--acento)',
                        color: '#0e1116',
                        marginRight: 6,
                      }}
                      onClick={() => editar(t)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-mini btn-mini-peligro"
                      onClick={() => borrar(t)}
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
