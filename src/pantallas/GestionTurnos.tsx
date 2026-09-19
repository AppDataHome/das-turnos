import { useState, useMemo, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { useToast } from '../contexto/ToastContexto'
import { useConfirmacion } from '../contexto/ConfirmacionContexto'
import {
  iconoTurno,
  muestraDepartamento,
  etiquetaSinDepartamento,
} from '../utilidades/turnos'
import type { Turno, Departamento, TipoTurno } from '../tipos'
import { Pencil, Trash2, Plus, Filter, X } from 'lucide-react'

interface Props {
  turnos: Turno[]
  onEditarFecha: (fecha: string) => void
  onCambio: () => void
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function aTexto(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export default function GestionTurnos({
  turnos,
  onEditarFecha,
  onCambio,
}: Props) {
  const { usuario } = useUsuario()
  const toast = useToast()
  const { confirmar } = useConfirmacion()

  const hoy = new Date()
  const anioActual = hoy.getFullYear()

  // Filtros de fecha
  const [fechaInicio, setFechaInicio] = useState(`${anioActual}-01-01`)
  const [fechaFin, setFechaFin] = useState(`${anioActual}-12-31`)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  // Catálogos
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [tiposTurno, setTiposTurno] = useState<TipoTurno[]>([])

  // Formulario añadir
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [fechaNueva, setFechaNueva] = useState(aTexto(hoy))
  const [codigoTurno, setCodigoTurno] = useState('M')
  const [idDepartamento, setIdDepartamento] = useState('')
  const [notas, setNotas] = useState('')
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
      if (depRes.data[0]) setIdDepartamento(depRes.data[0].id)
    }
    if (tipRes.data) {
      setTiposTurno(tipRes.data as TipoTurno[])
      if (tipRes.data[0]) setCodigoTurno(tipRes.data[0].codigo)
    }
  }

  // Turnos filtrados
  const turnosFiltrados = useMemo(() => {
    return turnos
      .filter((t) => t.fecha >= fechaInicio && t.fecha <= fechaFin)
      .sort((a, b) => b.fecha.localeCompare(a.fecha)) // más recientes primero
  }, [turnos, fechaInicio, fechaFin])

  // Agrupados por mes
  const porMes = useMemo(() => {
    const grupos = new Map<string, Turno[]>()
    for (const t of turnosFiltrados) {
      const d = new Date(t.fecha + 'T00:00:00')
      const clave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0'
      )}`
      if (!grupos.has(clave)) grupos.set(clave, [])
      grupos.get(clave)!.push(t)
    }
    return Array.from(grupos.entries()).sort((a, b) =>
      b[0].localeCompare(a[0])
    )
  }, [turnosFiltrados])

  const totalTurnos = turnosFiltrados.length

  function textoFechaCorta(f: string): string {
    const date = new Date(f + 'T00:00:00')
    const dias = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
    return `${dias[date.getDay()]} ${date.getDate()}`
  }

  function aplicarFiltroRapido(tipo: 'anio' | 'mes' | 'mesAnterior' | 'todo') {
    const h = new Date()
    if (tipo === 'anio') {
      setFechaInicio(`${h.getFullYear()}-01-01`)
      setFechaFin(`${h.getFullYear()}-12-31`)
    } else if (tipo === 'mes') {
      const inicio = new Date(h.getFullYear(), h.getMonth(), 1)
      const fin = new Date(h.getFullYear(), h.getMonth() + 1, 0)
      setFechaInicio(aTexto(inicio))
      setFechaFin(aTexto(fin))
    } else if (tipo === 'mesAnterior') {
      const inicio = new Date(h.getFullYear(), h.getMonth() - 1, 1)
      const fin = new Date(h.getFullYear(), h.getMonth(), 0)
      setFechaInicio(aTexto(inicio))
      setFechaFin(aTexto(fin))
    } else {
      setFechaInicio('2000-01-01')
      setFechaFin('2100-12-31')
    }
  }

  async function anadirTurno(e: React.FormEvent) {
    e.preventDefault()
    if (!usuario) return

    const tipo = tiposTurno.find((t) => t.codigo === codigoTurno)
    if (!tipo) {
      toast.error('Tipo de turno no válido')
      return
    }
    if (!idDepartamento) {
      toast.error('Debes elegir un departamento')
      return
    }

    setGuardando(true)
    const { error } = await supabase.from('turno').insert({
      id_usuario: usuario.id,
      id_departamento: idDepartamento,
      fecha: fechaNueva,
      id_tipo_turno: tipo.id,
      notas: notas.trim() || null,
    })
    setGuardando(false)

    if (error) {
      if (error.code === '23505') {
        toast.error('Ya tienes ese turno en esa fecha')
      } else {
        toast.error('Error al guardar: ' + error.message)
      }
      return
    }

    toast.exito('Turno añadido')
    setNotas('')
    setMostrarFormulario(false)
    onCambio()
  }

  async function borrarTurno(id: string) {
    const ok = await confirmar({
      titulo: '¿Borrar este turno?',
      mensaje: 'Esta acción no se puede deshacer.',
      textoConfirmar: 'Borrar',
      peligro: true,
    })
    if (!ok) return

    const { error } = await supabase.from('turno').delete().eq('id', id)
    if (error) {
      toast.error('Error al borrar: ' + error.message)
      return
    }
    toast.exito('Turno borrado')
    onCambio()
  }

  return (
    <>
      {/* Barra de acciones */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: filtrosAbiertos ? 12 : 0,
            flexWrap: 'wrap',
          }}
        >
          <h3 style={{ margin: 0, flex: 1, minWidth: 0 }}>
            Gestión de turnos
          </h3>

          <button
            className="btn btn-secondary"
            onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
          >
            <Filter size={14} />
            {filtrosAbiertos ? 'Ocultar filtros' : 'Filtros'}
          </button>

          <button
            className="btn btn-primary"
            onClick={() => {
              setMostrarFormulario(!mostrarFormulario)
              setFechaNueva(aTexto(hoy))
            }}
          >
            {mostrarFormulario ? (
              <>
                <X size={14} />
                Cancelar
              </>
            ) : (
              <>
                <Plus size={14} />
                Añadir turno
              </>
            )}
          </button>
        </div>

        {/* Filtros */}
        {filtrosAbiertos && (
          <>
            <div className="fila-form" style={{ marginTop: 8 }}>
              <div>
                <label className="label">Desde</label>
                <input
                  className="input"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                />
              </div>
              <div>
                <label className="label">Hasta</label>
                <input
                  className="input"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 6,
                flexWrap: 'wrap',
                marginTop: 4,
              }}
            >
              <button
                type="button"
                className="btn-mini"
                style={{ background: 'var(--fondo-tarjeta-3)' }}
                onClick={() => aplicarFiltroRapido('mes')}
              >
                Este mes
              </button>
              <button
                type="button"
                className="btn-mini"
                style={{ background: 'var(--fondo-tarjeta-3)' }}
                onClick={() => aplicarFiltroRapido('mesAnterior')}
              >
                Mes anterior
              </button>
              <button
                type="button"
                className="btn-mini"
                style={{ background: 'var(--fondo-tarjeta-3)' }}
                onClick={() => aplicarFiltroRapido('anio')}
              >
                Este año
              </button>
              <button
                type="button"
                className="btn-mini"
                style={{ background: 'var(--fondo-tarjeta-3)' }}
                onClick={() => aplicarFiltroRapido('todo')}
              >
                Todo
              </button>
            </div>
          </>
        )}

        {/* Formulario añadir */}
        {mostrarFormulario && (
          <form
            onSubmit={anadirTurno}
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid var(--borde)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 6,
              }}
              className="form-add-turno"
            >
              <div>
                <label className="label">Fecha</label>
                <input
                  className="input"
                  type="date"
                  value={fechaNueva}
                  onChange={(e) => setFechaNueva(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Tipo</label>
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

            <button
              className="btn btn-primary"
              type="submit"
              disabled={guardando}
              style={{ width: '100%', marginTop: 4 }}
            >
              {guardando ? 'Guardando…' : 'Guardar turno'}
            </button>
          </form>
        )}
      </div>

      {/* Listado */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0, flex: 1 }}>
            {totalTurnos} {totalTurnos === 1 ? 'turno' : 'turnos'}
          </h3>
          <span style={{ fontSize: 10, color: 'var(--texto-suave)' }}>
            {fechaInicio} → {fechaFin}
          </span>
        </div>

        {porMes.length === 0 ? (
          <p
            style={{
              color: 'var(--texto-suave)',
              fontSize: 12,
              textAlign: 'center',
              padding: 20,
            }}
          >
            No hay turnos en este rango de fechas.
          </p>
        ) : (
          porMes.map(([clave, lista]) => {
            const [anio, mes] = clave.split('-')
            const nombreMes = NOMBRES_MESES[parseInt(mes, 10) - 1]

            return (
              <div key={clave} style={{ marginBottom: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'var(--acento)',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    marginBottom: 6,
                    paddingBottom: 4,
                    borderBottom: '1px solid var(--borde)',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>
                    {nombreMes} {anio}
                  </span>
                  <span style={{ color: 'var(--texto-suave)' }}>
                    {lista.length} {lista.length === 1 ? 'turno' : 'turnos'}
                  </span>
                </div>

                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  {lista.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: 8,
                        background: 'var(--fondo-tarjeta-2)',
                        borderRadius: 8,
                        minWidth: 0,
                        fontSize: 11,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          minWidth: 58,
                          whiteSpace: 'nowrap',
                          color: 'var(--texto-suave)',
                          textTransform: 'lowercase',
                          fontSize: 10,
                        }}
                      >
                        {textoFechaCorta(t.fecha)}
                      </span>

                      <span
                        className="chip"
                        style={{
                          background: t.color,
                          fontSize: 9,
                          padding: '2px 6px',
                          flexShrink: 0,
                        }}
                        title={t.nombre_turno}
                      >
                        {t.codigo_turno}
                      </span>

                      <span
                        style={{
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--texto-suave)',
                        }}
                      >
                        {t.icono_departamento}{' '}
                        {muestraDepartamento(t)
                          ? t.departamento
                          : etiquetaSinDepartamento(t)}
                        {t.notas && (
                          <span style={{ opacity: 0.7 }}> · {t.notas}</span>
                        )}
                      </span>

                      <button
                        className="btn-mini"
                        style={{
                          background: 'var(--acento)',
                          color: '#0b0e13',
                        }}
                        onClick={() => onEditarFecha(t.fecha)}
                        title="Editar"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        className="btn-mini btn-mini-peligro"
                        onClick={() => borrarTurno(t.id)}
                        title="Borrar"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      <style>{`
        @media (max-width: 700px) {
          .form-add-turno {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  )
}
