import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import type { Turno, Departamento, TipoTurno } from '../tipos'

interface Props {
  fecha: string
  turnosDelDia: Turno[]
  onCerrar: () => void
  onCambio: () => void
}

export default function ModalDia({
  fecha,
  turnosDelDia,
  onCerrar,
  onCambio,
}: Props) {
  const { usuario } = useUsuario()

  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [tiposTurno, setTiposTurno] = useState<TipoTurno[]>([])

  const [codigoTurno, setCodigoTurno] = useState('')
  const [idDepartamento, setIdDepartamento] = useState('')
  const [notas, setNotas] = useState('')

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
      if (depRes.data[0]) setIdDepartamento(depRes.data[0].id)
    }

    if (tipRes.data) {
      setTiposTurno(tipRes.data as TipoTurno[])
      if (tipRes.data[0]) setCodigoTurno(tipRes.data[0].codigo)
    }
  }

  async function anadirTurno(e: React.FormEvent) {
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

    const { error } = await supabase.from('turno').insert({
      id_usuario: usuario.id,
      id_departamento: idDepartamento,
      fecha,
      id_tipo_turno: tipo.id,
      notas: notas.trim() || null,
    })

    setGuardando(false)

    if (error) {
      if (error.code === '23505') setError('Ya tienes ese turno en este día')
      else setError(error.message)
      return
    }

    setNotas('')
    onCambio()
  }

  async function borrarTurno(id: string) {
    if (!confirm('¿Seguro que quieres borrar este turno?')) return
    await supabase.from('turno').delete().eq('id', id)
    onCambio()
  }

  // Texto completo de la fecha
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
              <div className="turno-tarjeta" key={t.id}>
                <span
                  className="chip"
                  style={{ background: t.color, minWidth: 80, textAlign: 'center' }}
                >
                  {(t.nombre_turno ?? '').toUpperCase()}
                </span>
                <div className="detalle">
                  <div style={{ fontSize: 13 }}>{t.departamento}</div>
                  {t.notas && <div className="notas">📝 {t.notas}</div>}
                </div>
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

        {/* Formulario para añadir */}
        <div className="modal-seccion">
          <div className="modal-seccion-titulo">Añadir turno</div>

          <form onSubmit={anadirTurno}>
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

            <button
              className="btn btn-primary"
              type="submit"
              disabled={guardando}
              style={{ width: '100%', marginTop: 8 }}
            >
              {guardando ? 'Guardando…' : 'Añadir turno'}
            </button>
          </form>
        </div>

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
