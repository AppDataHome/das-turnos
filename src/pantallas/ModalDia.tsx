import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import type { Turno, Departamento, TipoTurno } from '../tipos'
import { etiquetaSinDepartamento, muestraDepartamento } from '../utilidades/turnos'

interface Props {
  fecha: string
  turnosDelDia: Turno[]
  onCerrar: () => void
  onCambio: () => void
}

type Modo = 'un-dia' | 'varios-dias'

export default function ModalDia({
  fecha,
  turnosDelDia,
  onCerrar,
  onCambio,
}: Props) {
  const { usuario } = useUsuario()

  const [modo, setModo] = useState<Modo>('un-dia')

  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [tiposTurno, setTiposTurno] = useState<TipoTurno[]>([])

  // ─── Modo "un día" ───
  const [codigoTurno, setCodigoTurno] = useState('')
  const [idDepartamento, setIdDepartamento] = useState('')
  const [notas, setNotas] = useState('')
  const [idEditando, setIdEditando] = useState<string | null>(null)

  // ─── Modo "varios días" ───
  const [fechaInicio, setFechaInicio] = useState(fecha)
  const [fechaFin, setFechaFin] = useState(fecha)
  const [codigoTurnoBloque, setCodigoTurnoBloque] = useState('VAC')
  const [idDepartamentoBloque, setIdDepartamentoBloque] = useState('')
  const [notasBloque, setNotasBloque] = useState('')
  const [anioOrigen, setAnioOrigen] = useState<number>(
    new Date().getFullYear()
  )
  const [resultadoBloque, setResultadoBloque] = useState<string>('')

  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarCatalogos()
  }, [])

  async function cargarCatalogos() {
    const [depRes, tipRes] = await Promise.all([
      supabase.from('departamento').select('*').eq('activo', true).order('nombre'),
      supabase.from('tipo_turno').select('*').order('orden'),
    ])

    if (depRes.data) {
      setDepartamentos(depRes.data as Departamento[])
      if (depRes.data[0]) {
        if (!idDepartamento) setIdDepartamento(depRes.data[0].id)
        if (!idDepartamentoBloque) setIdDepartamentoBloque(depRes.data[0].id)
      }
    }

    if (tipRes.data) {
      setTiposTurno(tipRes.data as TipoTurno[])
      if (tipRes.data[0] && !codigoTurno) {
        setCodigoTurno(tipRes.data[0].codigo)
      }
    }
  }

  // ─── Guardar un turno (modo un día) ───
  async function guardarTurno(e: React.FormEvent) {
    e.preventDefault()
    if (!usuario) return
    setError('')
    setGuardando(true)

    const tipo = tiposTurno.find((t) => t.codigo === codigoTurno)
    if (!tipo) {
      setError('Tipo de turno no válido')
      setGuardando(false)
      return
    }

    if (idEditando) {
      const { error } = await supabase
        .from('turno')
        .update({
          id_departamento: idDepartamento,
          id_tipo_turno: tipo.id,
          notas: notas.trim() || null,
        })
        .eq('id', idEditando)

      setGuardando(false)
      if (error) {
        if (error.code === '23505')
          setError('Ya tienes ese tipo de turno en este día')
        else setError(error.message)
        return
      }
      cancelarEdicion()
      onCambio()
    } else {
      const { error } = await supabase.from('turno').insert({
        id_usuario: usuario.id,
        id_departamento: idDepartamento,
        fecha,
        id_tipo_turno: tipo.id,
        notas: notas.trim() || null,
      })

      setGuardando(false)
      if (error) {
        if (error.code === '23505')
          setError('Ya tienes ese turno en este día')
        else setError(error.message)
        return
      }
      setNotas('')
      onCambio()
    }
  }

  // ─── Crear en bloque (modo varios días) ───
  async function crearBloque(e: React.FormEvent) {
    e.preventDefault()
    if (!usuario) return
    setError('')
    setResultadoBloque('')
    setGuardando(true)

    const { data, error } = await supabase.rpc('crear_turnos_en_bloque', {
      p_usuario: usuario.id,
      p_codigo_turno: codigoTurnoBloque,
      p_fecha_inicio: fechaInicio,
      p_fecha_fin: fechaFin,
      p_id_departamento: idDepartamentoBloque,
      p_notas: notasBloque.trim() || null,
      p_anio_origen: codigoTurnoBloque === 'VAC' ? anioOrigen : null,
    })

    setGuardando(false)

    if (error) {
      setError(error.message)
      return
    }

    if (data && data[0]) {
      const { creados, ignorados, total } = data[0]
      setResultadoBloque(
        `Se han creado ${creados} de ${total} días.` +
          (ignorados > 0 ? ` (${ignorados} ya existían y se han ignorado)` : '')
      )
      onCambio()
    }
  }

  function empezarEdicion(t: Turno) {
    setModo('un-dia')
    setIdEditando(t.id)
    setCodigoTurno(t.codigo_turno ?? '')
    setIdDepartamento(t.id_departamento)
    setNotas(t.notas ?? '')
    setError('')
  }

  function cancelarEdicion() {
    setIdEditando(null)
    setNotas('')
    setError('')
  }

  async function borrarTurno(id: string) {
    if (!confirm('¿Seguro que quieres borrar este turno?')) return
    await supabase.from('turno').delete().eq('id', id)
    if (idEditando === id) cancelarEdicion()
    onCambio()
  }

  function textoFechaLarga(f: string): string {
    const date = new Date(f + 'T00:00:00')
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
    const txt = date.toLocaleDateString('es-ES', opciones)
    return txt.charAt(0).toUpperCase() + txt.slice(1)
  }

  const anioActual = new Date().getFullYear()
  const anioAnterior = anioActual - 1

  // Si el tipo de turno del bloque es VAC, mostramos selector de año
  const mostrarSelectorAnio = codigoTurnoBloque === 'VAC'

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal-ventana" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cabecera">
          <div className="modal-titulo">{textoFechaLarga(fecha)}</div>
          <button
            className="modal-cerrar"
            onClick={onCerrar}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Turnos ya asignados */}
        <div className="modal-seccion">
          <div className="modal-seccion-titulo">
            Turnos asignados ({turnosDelDia.length})
          </div>

          {turnosDelDia.length === 0 ? (
            <p style={{ color: 'var(--texto-suave)', fontSize: 13 }}>
              Este día aún no tiene turnos.
            </p>
          ) : (
            turnosDelDia.map((t) => (
              <div
                className="turno-tarjeta"
                key={t.id}
                style={{
                  border:
                    idEditando === t.id
                      ? '1px solid var(--acento)'
                      : '1px solid transparent',
                }}
              >
                <span
                  className="chip"
                  style={{
                    background: t.color,
                    minWidth: 80,
                    textAlign: 'center',
                  }}
                >
                  {(t.nombre_turno ?? '').toUpperCase()}
                </span>
                                <div className="detalle">
                  <div style={{ fontSize: 13 }}>
                    {muestraDepartamento(t)
                      ? t.departamento
                      : etiquetaSinDepartamento(t)}
                  </div>
                  {t.notas && <div className="notas">📝 {t.notas}</div>}
                </div>
                <button
                  className="btn-mini"
                  style={{ background: 'var(--acento)', color: '#0e1116' }}
                  onClick={() => empezarEdicion(t)}
                >
                  Editar
                </button>
                <button
                  className="btn-mini btn-mini-peligro"
                  onClick={() => borrarTurno(t.id)}
                >
                  Borrar
                </button>
              </div>
            ))
          )}
        </div>

        {/* Selector de modo */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: 14,
            padding: 4,
            background: 'var(--fondo-tarjeta-2)',
            borderRadius: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setModo('un-dia')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              background: modo === 'un-dia' ? 'var(--acento)' : 'transparent',
              color: modo === 'un-dia' ? '#0e1116' : 'var(--texto-suave)',
            }}
          >
            Un día
          </button>
          <button
            type="button"
            onClick={() => setModo('varios-dias')}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              background:
                modo === 'varios-dias' ? 'var(--acento)' : 'transparent',
              color:
                modo === 'varios-dias' ? '#0e1116' : 'var(--texto-suave)',
            }}
          >
            Varios días
          </button>
        </div>

        {/* Modo un día */}
        {modo === 'un-dia' && (
          <div className="modal-seccion">
            <div className="modal-seccion-titulo">
              {idEditando ? 'Editar turno' : 'Añadir turno'}
            </div>

            <form onSubmit={guardarTurno}>
              <div className="fila-form">
                <div>
                  <label className="label">Tipo de turno</label>
                  <select
                    className="input"
                    value={codigoTurno}
                    onChange={(e) => setCodigoTurno(e.target.value)}
                  >
                    {tiposTurno.map((t) => (
                      <option key={t.codigo} value={t.codigo}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Departamento</label>
                  <select
                    className="input"
                    value={idDepartamento}
                    onChange={(e) => setIdDepartamento(e.target.value)}
                  >
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="label">Notas (opcional)</label>
              <input
                className="input"
                type="text"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Por ejemplo: apoyo a unidad canina"
              />

              {error && <p className="error">{error}</p>}

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={guardando}
                  style={{ flex: 1 }}
                >
                  {guardando
                    ? 'Guardando…'
                    : idEditando
                    ? 'Guardar cambios'
                    : 'Añadir turno'}
                </button>
                {idEditando && (
                  <button
                    className="btn"
                    type="button"
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
            </form>
          </div>
        )}

        {/* Modo varios días */}
        {modo === 'varios-dias' && (
          <div className="modal-seccion">
            <div className="modal-seccion-titulo">
              Añadir varios días seguidos
            </div>

            <form onSubmit={crearBloque}>
              <div className="fila-form">
                <div>
                  <label className="label">Desde</label>
                  <input
                    className="input"
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label">Hasta</label>
                  <input
                    className="input"
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="fila-form">
                <div>
                  <label className="label">Tipo de turno</label>
                  <select
                    className="input"
                    value={codigoTurnoBloque}
                    onChange={(e) => setCodigoTurnoBloque(e.target.value)}
                  >
                    {tiposTurno.map((t) => (
                      <option key={t.codigo} value={t.codigo}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Departamento</label>
                  <select
                    className="input"
                    value={idDepartamentoBloque}
                    onChange={(e) => setIdDepartamentoBloque(e.target.value)}
                  >
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {mostrarSelectorAnio && (
                <div>
                  <label className="label">Año de origen de las vacaciones</label>
                  <select
                    className="input"
                    value={anioOrigen}
                    onChange={(e) => setAnioOrigen(Number(e.target.value))}
                  >
                    <option value={anioActual}>
                      {anioActual} (año actual)
                    </option>
                    <option value={anioAnterior}>
                      {anioAnterior} (arrastre del año anterior)
                    </option>
                  </select>
                </div>
              )}

              <label className="label">Notas (opcional)</label>
              <input
                className="input"
                type="text"
                value={notasBloque}
                onChange={(e) => setNotasBloque(e.target.value)}
                placeholder="Por ejemplo: vacaciones de verano"
              />

              {error && <p className="error">{error}</p>}
              {resultadoBloque && (
                <p className="success">{resultadoBloque}</p>
              )}

              <button
                className="btn btn-primary"
                type="submit"
                disabled={guardando}
                style={{ width: '100%', marginTop: 8 }}
              >
                {guardando ? 'Creando…' : 'Crear en bloque'}
              </button>
            </form>
          </div>
        )}

        <button
          className="btn"
          onClick={onCerrar}
          style={{
            width: '100%',
            background: 'var(--fondo-tarjeta-2)',
            color: 'var(--texto)',
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
