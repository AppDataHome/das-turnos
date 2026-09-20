import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { Printer, X } from 'lucide-react'
import type { Turno } from '../tipos'

interface Props {
  fechaInicio: string
  fechaFin: string
  onCerrar: () => void
}

const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

function aTexto(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function diaSemanaLunes(fecha: Date): number {
  const d = fecha.getDay()
  return d === 0 ? 6 : d - 1
}

export default function VistaImpresionCalendario({
  fechaInicio,
  fechaFin,
  onCerrar,
}: Props) {
  const { usuario } = useUsuario()
  const [turnos, setTurnos] = useState<Turno[]>([])
  const [festivos, setFestivos] = useState<string[]>([])
  const [cargando, setCargando] = useState(true)

  const idPropietario = usuario?.invitado_de ?? usuario?.id ?? ''

  // Modo impresión en el body
  useEffect(() => {
    document.body.dataset.modo = 'imprimir-calendario'
    return () => {
      delete document.body.dataset.modo
    }
  }, [])

  useEffect(() => {
    if (idPropietario) cargar()
  }, [idPropietario])

  async function cargar() {
    setCargando(true)

    const [resTurnos, resFestivos] = await Promise.all([
      supabase
        .from('turno')
        .select(`
          id,
          id_usuario,
          id_departamento,
          id_tipo_turno,
          fecha,
          notas,
          tipo_turno (codigo, nombre, color, orden, hora_inicio, hora_fin, categoria),
          departamento (nombre, icono)
        `)
        .eq('id_usuario', idPropietario)
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin)
        .order('fecha', { ascending: true }),
      supabase
        .from('festivo_calendario')
        .select('fecha')
        .gte('fecha', fechaInicio)
        .lte('fecha', fechaFin),
    ])

    if (resTurnos.data) {
      setTurnos(
        resTurnos.data.map((t: any) => ({
          id: t.id,
          id_usuario: t.id_usuario,
          id_departamento: t.id_departamento,
          id_tipo_turno: t.id_tipo_turno,
          fecha: t.fecha,
          notas: t.notas,
          codigo_turno: t.tipo_turno?.codigo || '?',
          nombre_turno: t.tipo_turno?.nombre || '?',
          color: t.tipo_turno?.color || '#6b7280',
          orden_turno: t.tipo_turno?.orden ?? 100,
          hora_inicio: t.tipo_turno?.hora_inicio ?? null,
          hora_fin: t.tipo_turno?.hora_fin ?? null,
          categoria_turno: t.tipo_turno?.categoria ?? 'trabajo',
          departamento: t.departamento?.nombre || '?',
          icono_departamento: t.departamento?.icono || '📁',
        }))
      )
    }

    if (resFestivos.data) {
      setFestivos(resFestivos.data.map((f: any) => f.fecha))
    }

    setCargando(false)
  }

  // Generar lista de meses en el rango
  const mesesEnRango: { anio: number; mes: number }[] = (() => {
    const inicio = new Date(fechaInicio + 'T00:00:00')
    const fin = new Date(fechaFin + 'T00:00:00')
    const lista: { anio: number; mes: number }[] = []
    const actual = new Date(inicio.getFullYear(), inicio.getMonth(), 1)
    const finMes = new Date(fin.getFullYear(), fin.getMonth(), 1)

    while (actual <= finMes) {
      lista.push({ anio: actual.getFullYear(), mes: actual.getMonth() })
      actual.setMonth(actual.getMonth() + 1)
    }
    return lista
  })()

  function turnosDeFecha(fecha: string): Turno[] {
    return turnos
      .filter((t) => t.fecha === fecha)
      .sort((a, b) => (a.orden_turno ?? 100) - (b.orden_turno ?? 100))
  }

  // Resumen por tipo de turno
  const resumen: [string, { nombre: string; color: string; total: number }][] =
    (() => {
      const cuenta = new Map<
        string,
        { nombre: string; color: string; total: number }
      >()
      for (const t of turnos) {
        const codigo = t.codigo_turno || '?'
        if (!cuenta.has(codigo)) {
          cuenta.set(codigo, {
            nombre: t.nombre_turno || '?',
            color: t.color || '#6b7280',
            total: 0,
          })
        }
        cuenta.get(codigo)!.total++
      }
      return Array.from(cuenta.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      )
    })()

  function imprimir() {
    window.print()
  }

  if (!usuario) return null

  return createPortal(
    <div className="vista-impresion-calendario">
      <div className="barra-acciones-impresion no-print">
        <span className="aviso">
          {cargando
            ? 'Cargando…'
            : `${mesesEnRango.length} ${
                mesesEnRango.length === 1 ? 'mes' : 'meses'
              } listos para imprimir`}
        </span>
        <button className="btn btn-secondary" onClick={onCerrar}>
          <X size={14} />
          Cerrar
        </button>
        <button
          className="btn btn-primary"
          onClick={imprimir}
          disabled={cargando}
        >
          <Printer size={14} />
          Imprimir
        </button>
      </div>

      {cargando ? (
        <div
          style={{
            background: 'white',
            padding: 40,
            margin: '0 auto',
            maxWidth: 400,
            borderRadius: 10,
            textAlign: 'center',
            color: '#333',
          }}
        >
          Cargando turnos…
        </div>
      ) : (
        <>
          {mesesEnRango.map(({ anio, mes }) => (
            <PaginaMes
              key={`${anio}-${mes}`}
              anio={anio}
              mes={mes}
              festivos={festivos}
              turnosDeFecha={turnosDeFecha}
              nombreEmpleado={usuario.nombre}
              numeroEmpleado={usuario.numero_empleado}
            />
          ))}

          {mesesEnRango.length > 1 && (
            <PaginaResumen
              fechaInicio={fechaInicio}
              fechaFin={fechaFin}
              nombreEmpleado={usuario.nombre}
              numeroEmpleado={usuario.numero_empleado}
              resumen={resumen}
            />
          )}
        </>
      )}
    </div>,
    document.body
  )
}

// ═══════════════════════════════════════════════════
// Página de un mes
// ═══════════════════════════════════════════════════

function PaginaMes({
  anio,
  mes,
  festivos,
  turnosDeFecha,
  nombreEmpleado,
  numeroEmpleado,
}: {
  anio: number
  mes: number
  festivos: string[]
  turnosDeFecha: (fecha: string) => Turno[]
  nombreEmpleado: string
  numeroEmpleado: string | null
}) {
  const primerDia = new Date(anio, mes, 1)
  const offset = diaSemanaLunes(primerDia)
  const inicio = new Date(primerDia)
  inicio.setDate(primerDia.getDate() - offset)

  const dias: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(inicio)
    d.setDate(inicio.getDate() + i)
    dias.push(d)
  }

  const festivosSet = new Set(festivos)

  return (
    <div className="pagina-mes-calendario">
      <div className="pagina-cabecera">
        <div className="pagina-titulo">
          DAS · Distribución y Asignación de Servicios
        </div>
        <div className="pagina-subtitulo">
          {MESES[mes]} {anio}
        </div>
        <div className="pagina-empleado">
          {nombreEmpleado}
          {numeroEmpleado ? ` · Nº ${numeroEmpleado}` : ''}
        </div>
      </div>

      <div className="rejilla-mes-impresion">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="cabecera-dia-imp">
            {d}
          </div>
        ))}

        {dias.map((d, i) => {
          const fecha = aTexto(d)
          const fueraMes = d.getMonth() !== mes
          const esFestivo = festivosSet.has(fecha)
          const diaSemana = d.getDay()
          const esFinde = diaSemana === 0 || diaSemana === 6
          const turnosDia = turnosDeFecha(fecha)
          const notasDia = turnosDia
            .map((t) => t.notas)
            .filter(Boolean)
            .join(' · ')

          const clases = ['celda-dia-imp']
          if (fueraMes) clases.push('fuera')
          if (esFestivo) clases.push('festivo')
          else if (esFinde) clases.push('finde')

          return (
            <div key={i} className={clases.join(' ')}>
              <div className="numero-imp">{d.getDate()}</div>

              {turnosDia.map((t) => (
                <span
                  key={t.id}
                  className="chip-imp"
                  style={{ background: t.color }}
                >
                  {(t.nombre_turno ?? '').toUpperCase()}
                </span>
              ))}

              {notasDia && <div className="notas-imp">📝 {notasDia}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════
// Página de resumen
// ═══════════════════════════════════════════════════

function PaginaResumen({
  fechaInicio,
  fechaFin,
  nombreEmpleado,
  numeroEmpleado,
  resumen,
}: {
  fechaInicio: string
  fechaFin: string
  nombreEmpleado: string
  numeroEmpleado: string | null
  resumen: [string, { nombre: string; color: string; total: number }][]
}) {
  function textoFecha(f: string): string {
    const d = new Date(f + 'T00:00:00')
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="pagina-resumen">
      <h2>Resumen del periodo</h2>

      <div className="resumen-datos">
        <div>
          <strong>Empleado:</strong> {nombreEmpleado}
          {numeroEmpleado ? ` · Nº ${numeroEmpleado}` : ''}
        </div>
        <div>
          <strong>Desde:</strong> {textoFecha(fechaInicio)}
        </div>
        <div>
          <strong>Hasta:</strong> {textoFecha(fechaFin)}
        </div>
        <div>
          <strong>Emitido el:</strong>{' '}
          {new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </div>
      </div>

      <h3>Turnos por tipo</h3>
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Código</th>
            <th style={{ textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {resumen.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                style={{ textAlign: 'center', color: '#888' }}
              >
                No hay turnos en este periodo
              </td>
            </tr>
          ) : (
            resumen.map(([codigo, datos]) => (
              <tr key={codigo}>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: datos.color,
                      marginRight: 8,
                      verticalAlign: 'middle',
                    }}
                  />
                  {datos.nombre}
                </td>
                <td>
                  <code>{codigo}</code>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>
                  {datos.total}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
