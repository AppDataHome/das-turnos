import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useToast } from '../contexto/ToastContexto'
import { useConfirmacion } from '../contexto/ConfirmacionContexto'
import type { Departamento, TipoTurno } from '../tipos'

type Seccion = 'departamentos' | 'tipos-turno'

export default function Configuracion() {
  const [seccion, setSeccion] = useState<Seccion>('departamentos')

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 10,
          padding: 3,
          background: 'var(--fondo-tarjeta)',
          border: '1px solid var(--borde)',
          borderRadius: 10,
          width: 'fit-content',
        }}
      >
        <button
          onClick={() => setSeccion('departamentos')}
          style={{
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            background:
              seccion === 'departamentos' ? 'var(--acento)' : 'transparent',
            color:
              seccion === 'departamentos' ? '#0b0e13' : 'var(--texto-suave)',
          }}
        >
          Departamentos
        </button>
        <button
          onClick={() => setSeccion('tipos-turno')}
          style={{
            padding: '6px 12px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            background:
              seccion === 'tipos-turno' ? 'var(--acento)' : 'transparent',
            color:
              seccion === 'tipos-turno' ? '#0b0e13' : 'var(--texto-suave)',
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

// ─────────────────────────────────────────
// DEPARTAMENTOS
// ─────────────────────────────────────────

function SeccionDepartamentos() {
  const toast = useToast()
  const { confirmar } = useConfirmacion()

  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [cargando, setCargando] = useState(true)

  const [idEditando, setIdEditando] = useState<string | null>(null)
  const [nombre, setNombre] = useState('')
  const [icono, setIcono] = useState('📁')

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
        if (error.code === '23505') {
          setError('Ya existe un departamento con ese nombre')
          toast.error('Ya existe un departamento con ese nombre')
        } else {
          setError(error.message)
          toast.error('Error: ' + error.message)
        }
        return
      }
      toast.exito('Departamento actualizado')
      cancelar()
      cargar()
    } else {
      const { error } = await supabase
        .from('departamento')
        .insert({ nombre: nombre.trim(), icono, activo: true })

      if (error) {
        if (error.code === '23505') {
          setError('Ya existe un departamento con ese nombre')
          toast.error('Ya existe un departamento con ese nombre')
        } else {
          setError(error.message)
          toast.error('Error: ' + error.message)
        }
        return
      }
      toast.exito('Departamento añadido')
      cancelar()
      cargar()
    }
  }

  function editar(d: Departamento) {
    setIdEditando(d.id)
    setNombre(d.nombre)
    setIcono((d as any).icono ?? '📁')
    setError('')
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

    if (error) {
      toast.error('Error: ' + error.message)
      return
    }
    toast.exito(d.activo ? 'Departamento desactivado' : 'Departamento activado')
    cargar()
  }

  async function borrar(d: Departamento) {
    const ok = await confirmar({
      titulo: `¿Borrar "${d.nombre}"?`,
      mensaje: 'Esta acción no se puede deshacer.',
      textoConfirmar: 'Borrar',
      peligro: true,
    })
    if (!ok) return

    const { error } = await supabase.from('departamento').delete().eq('id', d.id)

    if (error) {
      if (error.code === '23503') {
        const msg =
          'No se puede borrar: hay turnos que usan este departamento. Desactívalo en su lugar.'
        setError(msg)
        toast.error(msg, 5000)
      } else {
        setError(error.message)
        toast.error('Error: ' + error.message)
      }
      return
    }
    toast.exito('Departamento borrado')
    cargar()
  }

  return (
    <>
      <div className="card">
        <h2 style={{ marginBottom: 10 }}>Departamentos</h2>

        <form onSubmit={guardar}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '70px 1fr auto',
              gap: 6,
              alignItems: 'end',
            }}
            className="form-depto"
          >
            <div>
              <label className="label">Icono</label>
              <input
                className="input"
                type="text"
                value={icono}
                onChange={(e) => setIcono(e.target.value)}
                style={{ textAlign: 'center', fontSize: 18 }}
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
                placeholder="Unidad Canina"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 6, paddingBottom: 6 }}>
              <button className="btn btn-primary" type="submit">
                {idEditando ? 'Guardar' : 'Añadir'}
              </button>
              {idEditando && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelar}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {error && <p className="error">{error}</p>}
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>Listado ({departamentos.length})</h3>

        {cargando ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 11 }}>Cargando…</p>
        ) : departamentos.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 11 }}>
            No hay departamentos registrados.
          </p>
        ) : (
          <>
            <div className="lista-movil">
              {departamentos.map((d) => (
                <div
                  key={d.id}
                  className="item-lista"
                  style={{ opacity: d.activo ? 1 : 0.5 }}
                >
                  <div className="cabecera-item">
                    <span style={{ fontSize: 22, flexShrink: 0 }}>
                      {(d as any).icono ?? '📁'}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {d.nombre}
                    </span>
                    <span
                      className="chip"
                      style={{
                        background: d.activo ? '#16a34a' : '#6b7280',
                        color: 'white',
                      }}
                    >
                      {d.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </div>
                  <div className="acciones-item">
                    <button
                      className="btn-mini"
                      style={{ background: 'var(--acento)', color: '#0b0e13' }}
                      onClick={() => editar(d)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-mini"
                      style={{
                        background: d.activo ? '#6b7280' : '#16a34a',
                        color: 'white',
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
                  </div>
                </div>
              ))}
            </div>

            <div className="tabla-desktop">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>Icono</th>
                    <th>Nombre</th>
                    <th style={{ width: 80 }}>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {departamentos.map((d) => (
                    <tr key={d.id} style={{ opacity: d.activo ? 1 : 0.5 }}>
                      <td style={{ fontSize: 18 }}>
                        {(d as any).icono ?? '📁'}
                      </td>
                      <td>{d.nombre}</td>
                      <td>
                        <span
                          className="chip"
                          style={{
                            background: d.activo ? '#16a34a' : '#6b7280',
                            color: 'white',
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
                            color: '#0b0e13',
                            marginRight: 4,
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
                            marginRight: 4,
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
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .form-depto {
            grid-template-columns: 60px 1fr !important;
          }
          .form-depto > div:last-child {
            grid-column: 1 / -1;
            justify-content: flex-end;
          }
        }
      `}</style>
    </>
  )
}

// ─────────────────────────────────────────
// TIPOS DE TURNO
// ─────────────────────────────────────────

const CATEGORIAS = [
  { valor: 'trabajo', etiqueta: 'Trabajo (DAS)' },
  { valor: 'libre', etiqueta: 'Libre / Ausencia' },
  { valor: 'formacion', etiqueta: 'Formación' },
  { valor: 'otros', etiqueta: 'Otros' },
] as const

function SeccionTiposTurno() {
  const toast = useToast()
  const { confirmar } = useConfirmacion()

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
        if (error.code === '23505') {
          setError('Ya existe un tipo de turno con ese código')
          toast.error('Ya existe un tipo de turno con ese código')
        } else {
          setError(error.message)
          toast.error('Error: ' + error.message)
        }
        return
      }
      toast.exito('Tipo de turno actualizado')
      cancelar()
      cargar()
    } else {
      const { error } = await supabase.from('tipo_turno').insert(payload)
      if (error) {
        if (error.code === '23505') {
          setError('Ya existe un tipo de turno con ese código')
          toast.error('Ya existe un tipo de turno con ese código')
        } else {
          setError(error.message)
          toast.error('Error: ' + error.message)
        }
        return
      }
      toast.exito('Tipo de turno añadido')
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

  async function borrar(t: TipoTurno) {
    const ok = await confirmar({
      titulo: `¿Borrar "${t.nombre}"?`,
      mensaje: 'Esta acción no se puede deshacer.',
      textoConfirmar: 'Borrar',
      peligro: true,
    })
    if (!ok) return

    const { error } = await supabase.from('tipo_turno').delete().eq('id', t.id)

    if (error) {
      if (error.code === '23503') {
        const msg =
          'No se puede borrar: hay turnos que usan este tipo. Cámbialos antes.'
        setError(msg)
        toast.error(msg, 5000)
      } else {
        setError(error.message)
        toast.error('Error: ' + error.message)
      }
      return
    }
    toast.exito('Tipo de turno borrado')
    cargar()
  }

  function colorCategoria(c: string): string {
    if (c === 'trabajo') return '#2563eb'
    if (c === 'libre') return '#f59e0b'
    if (c === 'formacion') return '#0ea5e9'
    return '#6b7280'
  }

  return (
    <>
      <div className="card">
        <h2 style={{ marginBottom: 10 }}>Tipos de turno</h2>

        <form onSubmit={guardar}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 80px 80px 1fr',
              gap: 6,
              alignItems: 'end',
              marginBottom: 6,
            }}
            className="form-tipo-1"
          >
            <div>
              <label className="label">Cód.</label>
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
              gridTemplateColumns: '90px 70px 100px 1fr auto',
              gap: 6,
              alignItems: 'end',
            }}
            className="form-tipo-2"
          >
            <div>
              <label className="label">Color</label>
              <input
                className="input"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
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
              <label className="label">Cruza med.</label>
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
            <div style={{ display: 'flex', gap: 6, paddingBottom: 6 }}>
              <button className="btn btn-primary" type="submit">
                {idEditando ? 'Guardar' : 'Añadir'}
              </button>
              {idEditando && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelar}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {error && <p className="error">{error}</p>}
        </form>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 10 }}>Listado ({tipos.length})</h3>

        {cargando ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 11 }}>Cargando…</p>
        ) : tipos.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 11 }}>
            No hay tipos de turno registrados.
          </p>
        ) : (
          <>
            <div className="lista-movil">
              {tipos.map((t) => (
                <div key={t.id} className="item-lista">
                  <div className="cabecera-item">
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 5,
                        background: t.color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        minWidth: 24,
                      }}
                    >
                      {t.codigo}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {t.nombre}
                    </span>
                    <span
                      className="chip"
                      style={{
                        background: colorCategoria(t.categoria),
                        color: 'white',
                      }}
                    >
                      {t.categoria.toUpperCase()}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      color: 'var(--texto-suave)',
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span>
                      🕒 {t.hora_inicio?.slice(0, 5) ?? '—'}–
                      {t.hora_fin?.slice(0, 5) ?? '—'}
                    </span>
                    <span>· Orden: {(t as any).orden ?? 100}</span>
                    {t.cruza_medianoche && <span>· Cruza medianoche</span>}
                  </div>

                  <div className="acciones-item">
                    <button
                      className="btn-mini"
                      style={{ background: 'var(--acento)', color: '#0b0e13' }}
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
                  </div>
                </div>
              ))}
            </div>

            <div className="tabla-desktop">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>Color</th>
                    <th style={{ width: 50 }}>Cód.</th>
                    <th>Nombre</th>
                    <th>Horario</th>
                    <th>Categoría</th>
                    <th style={{ width: 50 }}>Orden</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {tipos.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: 5,
                            background: t.color,
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 700 }}>{t.codigo}</td>
                      <td>{t.nombre}</td>
                      <td style={{ fontSize: 11 }}>
                        {t.hora_inicio && t.hora_fin
                          ? `${t.hora_inicio.slice(0, 5)} – ${t.hora_fin.slice(0, 5)}`
                          : '—'}
                      </td>
                      <td>
                        <span
                          className="chip"
                          style={{
                            background: colorCategoria(t.categoria),
                            color: 'white',
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
                            color: '#0b0e13',
                            marginRight: 4,
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
            </div>
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .form-tipo-1 {
            grid-template-columns: 60px 1fr 70px 70px !important;
          }
          .form-tipo-1 > div:last-child {
            grid-column: 1 / -1;
          }
          .form-tipo-2 {
            grid-template-columns: 1fr 1fr 1fr !important;
          }
          .form-tipo-2 > div:last-child {
            grid-column: 1 / -1;
            justify-content: flex-end;
          }
        }
      `}</style>
    </>
  )
}
