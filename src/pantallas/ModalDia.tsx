import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { useToast } from '../contexto/ToastContexto'
import { useConfirmacion } from '../contexto/ConfirmacionContexto'
import { X } from 'lucide-react'
import { iconoTurno } from '../utilidades/turnos'
import type { Turno, Departamento, TipoTurno } from '../tipos'

interface Props {
  fecha: string
  turnosDelDia: Turno[]
  onCerrar: () => void
  onCambio: () => void
  soloLectura?: boolean
}

type Modo = 'un-dia' | 'varios-dias'

export default function ModalDia({
  fecha,
  turnosDelDia,
  onCerrar,
  onCambio,
  soloLectura = false,
}: Props) {
  const { usuario } = useUsuario()
  const toast = useToast()
  const { confirmar } = useConfirmacion()

  const [modo, setModo] = useState<Modo>('un-dia')

  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [tiposTurno, setTiposTurno] = useState<TipoTurno[]>([])

  const [codigoTurno, setCodigoTurno] = useState('')
  const [idDepartamento, setIdDepartamento] = useState('')
  const [notas, setNotas] = useState('')
  const [idEditando, setIdEditando] = useState<string | null>(null)

  const [fechaInicio, setFechaInicio] = useState(fecha)
  const [fechaFin, setFechaFin] = useState(fecha)
  const [codigoTurnoBloque, setCodigoTurnoBloque] = useState('VAC')
  const [idDepartamentoBloque, setIdDepartamentoBloque] = useState('')
  const [notasBloque, setNotasBloque] = useState('')
  const [anioOrigen, setAnioOrigen] = useState<number>(
    new Date().getFullYear()
  )

  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!soloLectura) cargarCatalogos()
  }, [soloLectura])

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
      if (tipRes.data[0] && !codigoTurno) setCodigoTurno(tipRes.data[0].codigo)
    }
  }

  async function guardarTurno(e: React.FormEvent) {
    e.preventDefault()
    if (!usuario || soloLectura) return
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
        if (error.code === '23505') {
          setError('Ya tienes ese tipo de turno en este día')
          toast.error('Ya tienes ese tipo de turno en este día')
        } else {
          setError(error.message)
          toast.error('Error al guardar: ' + error.message)
        }
        return
      }
      toast.exito('Turno actualizado correctamente')
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
        if (error.code === '23505') {
          setError('Ya tienes ese turno en este día')
          toast.error('Ya tienes ese turno en este día')
        } else {
          setError(error.message)
          toast.error('Error al guardar: ' + error.message)
        }
        return
      }
      toast.exito('Turno añadido correctamente')
      setNotas('')
      onCambio()
    }
  }

  async function crearBloque(e: React.FormEvent) {
    e.preventDefault()
    if (!usuario || soloLectura) return
    setError('')
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
      toast.error('Error al crear: ' + error.message)
      return
    }

    if (data && data[0]) {
      const { creados, ignorados, total } = data[0]
      toast.exito(
        `Se han creado ${creados} de ${total} días.` +
          (ignorados > 0 ? ` (${ignorados} ya existían)` : '')
      )
      onCambio()
    }
  }

  function empezarEdicion(t: Turno) {
    if (soloLectura) return
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

  // ─────────── BORRAR con deshacer ───────────
  async function borrarTurno(turno: Turno) {
    if (soloLectura) return

    const ok = await confirmar({
      titulo: '¿Borrar este turno?',
      mensaje: 'Podrás deshacerlo unos segundos si te arrepientes.',
      textoConfirmar: 'Borrar',
      peligro: true,
    })
    if (!ok) return

    const copia = {
      id_usuario: turno.id_usuario,
      id_departamento: turno.id_departamento,
      id_tipo_turno: turno.id_tipo_turno,
      fecha: turno.fecha,
      notas: turno.notas,
    }

    const { error } = await supabase.from('turno').delete().eq('id', turno.id)
    if (error) {
      toast.error('Error al borrar: ' + error.message)
      return
    }

    if (idEditando === turno.id) cancelarEdicion()
    onCambio()

    toast.conAccion(
      'info',
      'Turno borrado',
      {
        etiqueta: 'Deshacer',
        onClick: async () => {
          const { error: errRestaurar } = await supabase
            .from('turno')
            .insert(copia)

          if (errRestaurar) {
            toast.error('No se pudo deshacer: ' + errRestaurar.message)
            return
          }
          toast.exito('Turno restaurado')
          onCambio()
        },
      },
      7000
    )
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
            <X size={14} />
          </button>
        </div>

        {soloLectura && (
          <div
            style={{
              padding: 10,
              background: 'rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              borderRadius: 8,
              marginBottom: 14,
              fontSize: 11,
              color: 'var(--texto-suave)',
              lineHeight: 1.4,
            }}
          >
            👁️ Estás viendo este calendario en modo{' '}
            <strong>solo lectura</strong>. No puedes añadir, editar ni borrar
            turnos.
          </div>
        )}

        <div className="modal-seccion">
          <div className="modal-seccion-titulo">
            Turnos asignados ({turnosDelDia.length})
          </div>

          {turnosDelDia.length === 0 ? (
            <p style={{ color: 'var(--texto-suave)', fontSize: 11 }}>
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
                    minWidth: 60,
                    textAlign: 'center',
                  }}
                >
                  {(t.nombre_turno ?? '').toUpperCase()}
                </span>

                <div
                  className="detalle"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minWidth: 0,
                  }}
                >
                  <span style={{ fontSize: 16 }}>{iconoTurno(t)}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11 }}>{t.departamento}</div>
                    {t.notas && <div className="notas">📝 {t.notas}</div>}
                  </div>
                </div>

                {!soloLectura && (
                  <>
                    <button
                      className="btn-mini"
                      style={{
                        background: 'var(--acento)',
                        color: 'var(--acento-texto)',
                      }}
                      onClick={() => empezarEdicion(t)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn-mini btn-mini-peligro"
                      onClick={() => borrarTurno(t)}
                    >
                      Borrar
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {!soloLectura && (
          <>
            <div
              style={{
                display: 'flex',
                gap: 4,
                marginBottom: 10,
                padding: 3,
                background: 'var(--fondo-tarjeta-2)',
                borderRadius: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setModo('un-dia')}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    modo === 'un-dia' ? 'var(--acento)' : 'transparent',
                  color:
                    modo === 'un-dia'
                      ? 'var(--acento-texto)'
                      : 'var(--texto-suave)',
                }}
              >
                Un día
              </button>
              <button
                type="button"
                onClick={() => setModo('varios-dias')}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: 'none',
                  cursor: 'pointer',
                  background:
                    modo === 'varios-dias' ? 'var(--acento)' : 'transparent',
                  color:
                    modo === 'varios-dias'
                      ? 'var(--acento-texto)'
                      : 'var(--texto-suave)',
                }}
              >
                Varios días
              </button>
            </div>

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
                    placeholder="Apoyo a unidad canina"
                  />

                  {error && <p className="error">{error}</p>}

                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
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
                        className="btn btn-secondary"
                        type="button"
                        onClick={cancelarEdicion}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

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
                        onChange={(e) =>
                          setCodigoTurnoBloque(e.target.value)
                        }
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
                        onChange={(e) =>
                          setIdDepartamentoBloque(e.target.value)
                        }
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
                      <label className="label">Año de origen</label>
                      <select
                        className="input"
                        value={anioOrigen}
                        onChange={(e) =>
                          setAnioOrigen(Number(e.target.value))
                        }
                      >
                        <option value={anioActual}>
                          {anioActual} (año actual)
                        </option>
                        <option value={anioAnterior}>
                          {anioAnterior} (arrastre)
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
                    placeholder="Vacaciones de verano"
                  />

                  {error && <p className="error">{error}</p>}

                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={guardando}
                    style={{ width: '100%', marginTop: 6 }}
                  >
                    {guardando ? 'Creando…' : 'Crear en bloque'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        <button
          className="btn btn-secondary"
          onClick={onCerrar}
          style={{ width: '100%' }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
