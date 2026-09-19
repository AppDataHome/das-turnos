import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import { useToast } from '../contexto/ToastContexto'
import { useConfirmacion } from '../contexto/ConfirmacionContexto'
import VistaMensual from './VistaMensual'
import VistaSemanal from './VistaSemanal'
import VistaAnual from './VistaAnual'
import ModalDia from './ModalDia'
import ModalInformeDas from './ModalInformeDas'
import AvisosBanner from './AvisosBanner'
import {
  SkeletonTarjetas,
  SkeletonCalendario,
  SkeletonPanelDia,
} from '../componentes/Skeleton'
import type { Turno, DasStatus } from '../tipos'
import {
  iconoTurno,
  muestraDepartamento,
  etiquetaSinDepartamento,
} from '../utilidades/turnos'
import { FileText } from 'lucide-react'

interface ResumenVacaciones {
  anio_actual: number
  total_actual: number
  disfrutadas_actual: number
  disponibles_actual: number
  anio_anterior: number
  total_anterior: number
  disfrutadas_anterior: number
  disponibles_anterior: number
}

type VistaCalendario = 'mensual' | 'semanal' | 'anual'

const NOMBRES_MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

export default function Calendario() {
  const { usuario } = useUsuario()
  const toast = useToast()
  const { confirmar } = useConfirmacion()

  const [turnos, setTurnos] = useState<Turno[]>([])
  const [dasStatus, setDasStatus] = useState<DasStatus | null>(null)
  const [vacaciones, setVacaciones] = useState<ResumenVacaciones | null>(null)
  const [festivos, setFestivos] = useState<string[]>([])
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalInformeAbierto, setModalInformeAbierto] = useState(false)
  const [cargando, setCargando] = useState(true)

  const [mesVisible, setMesVisible] = useState<Date>(() => {
    const hoy = new Date()
    return new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  })

  const [vista, setVista] = useState<VistaCalendario>(() => {
    const guardada = localStorage.getItem('vista_calendario')
    if (guardada === 'semanal') return 'semanal'
    if (guardada === 'anual') return 'anual'
    return 'mensual'
  })

  useEffect(() => {
    localStorage.setItem('vista_calendario', vista)
  }, [vista])

  useEffect(() => {
    if (usuario) cargarTodo()
  }, [usuario])

  useEffect(() => {
    cargarFestivos()
  }, [])

  async function cargarTodo() {
    setCargando(true)
    await Promise.all([cargarTurnos(), cargarEstadoDas(), cargarVacaciones()])
    setCargando(false)
  }

  async function cargarTurnos() {
    if (!usuario) return
    const { data, error } = await supabase
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
      .eq('id_usuario', usuario.id)
      .order('fecha', { ascending: true })

    if (!error && data) {
      setTurnos(
        data.map((t: any) => ({
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
  }

  async function cargarEstadoDas() {
    if (!usuario) return
    const { data, error } = await supabase.rpc('get_das_status', {
      p_usuario: usuario.id,
    })
    if (!error && data && data[0]) setDasStatus(data[0])
  }

  async function cargarVacaciones() {
    if (!usuario) return
    const { data, error } = await supabase.rpc('get_resumen_vacaciones', {
      p_usuario: usuario.id,
    })
    if (!error && data && data[0]) setVacaciones(data[0])
  }

  async function cargarFestivos() {
    const anio = new Date().getFullYear()
    const inicio = `${anio - 5}-01-01`
    const fin = `${anio + 5}-12-31`

    const { data, error } = await supabase
      .from('festivo_calendario')
      .select('fecha')
      .gte('fecha', inicio)
      .lte('fecha', fin)

    if (!error && data) setFestivos(data.map((f: any) => f.fecha))
  }

  async function borrarTurnoRapido(id: string) {
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
    cargarTodo()
  }

  if (!usuario) return null

  const turnosDelDia = turnos
    .filter((t) => t.fecha === fecha)
    .sort((a, b) => (a.orden_turno ?? 100) - (b.orden_turno ?? 100))

  const hoy = new Date()
  const hoyTexto = hoy.toISOString().split('T')[0]

  const anioVisible = mesVisible.getFullYear()
  const mesVisibleNum = mesVisible.getMonth()

  function esDelMesVisible(fechaTexto: string): boolean {
    const d = new Date(fechaTexto + 'T00:00:00')
    return d.getFullYear() === anioVisible && d.getMonth() === mesVisibleNum
  }

  const codigosTrabajo = ['M', 'T', 'N']
  const turnosMes = turnos.filter(
    (t) =>
      esDelMesVisible(t.fecha) &&
      codigosTrabajo.includes(t.codigo_turno ?? '')
  )

  const realizados = turnosMes.filter((t) => t.fecha <= hoyTexto).length
  const totalMes = turnosMes.length
  const restantes = totalMes - realizados
  const progreso =
    totalMes === 0 ? 0 : Math.round((realizados / totalMes) * 100)

  const tituloMesVisible = `${NOMBRES_MESES[mesVisibleNum]} ${anioVisible}`
  const esMesActual =
    anioVisible === hoy.getFullYear() && mesVisibleNum === hoy.getMonth()

  function textoFechaLarga(f: string): string {
    const date = new Date(f + 'T00:00:00')
    const opciones: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }
    const txt = date.toLocaleDateString('es-ES', opciones)
    return txt.charAt(0).toUpperCase() + txt.slice(1)
  }

  const festivosTotales = dasStatus?.festivos_validos ?? 0
  const festivosDAS = Math.floor(festivosTotales / 3)
  const festivosResiduo = festivosTotales % 3

  const nochesTotales = dasStatus?.noches_validas ?? 0
  const nochesDAS = Math.floor(nochesTotales / 6)
  const nochesResiduo = nochesTotales % 6

  function seleccionarYAbir(fechaNueva: string) {
    setFecha(fechaNueva)
    setModalAbierto(true)
  }

  function seleccionarDesdeAnual(fechaNueva: string) {
    setFecha(fechaNueva)
    setVista('mensual')
  }

  function alCambiarMesVistaMensual(f: Date) {
    setMesVisible(new Date(f.getFullYear(), f.getMonth(), 1))
  }

  function alCambiarSemanaVistaSemanal(fechaInicio: Date) {
    setMesVisible(new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1))
  }

  if (cargando) {
    return (
      <>
        <SkeletonTarjetas />
        <SkeletonCalendario />
        <SkeletonPanelDia />
      </>
    )
  }

  return (
    <>
      <AvisosBanner turnos={turnos} vacaciones={vacaciones} />

      <div className="grid-tarjetas">
        <div className="card" style={{ textAlign: 'center' }}>
          <h4
            style={{
              color: 'var(--texto-suave)',
              fontSize: 10,
              marginBottom: 4,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              fontWeight: 700,
            }}
          >
            Turnos Mes
          </h4>
          <div
            style={{
              fontSize: 10,
              color: esMesActual ? 'var(--acento)' : 'var(--texto-suave)',
              textTransform: 'capitalize',
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {tituloMesVisible}
            {esMesActual && ' · actual'}
          </div>

          <CuentaKilometros progreso={progreso} realizados={realizados} />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              gap: 6,
              marginTop: 4,
              fontSize: 10,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'var(--exito)',
                }}
              >
                {realizados}
              </div>
              <div style={{ color: 'var(--texto-suave)', fontSize: 9 }}>
                Realizados
              </div>
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: 'var(--texto)',
                }}
              >
                {restantes}
              </div>
              <div style={{ color: 'var(--texto-suave)', fontSize: 9 }}>
                Restantes
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h4
            style={{
              color: 'var(--texto-suave)',
              fontSize: 10,
              marginBottom: 8,
              textTransform: 'uppercase',
              letterSpacing: 0.6,
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            Vacaciones
          </h4>

          <div
            style={{
              fontSize: 9,
              color: 'var(--texto-suave)',
              marginBottom: 4,
              textTransform: 'uppercase',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            Año {vacaciones?.anio_actual ?? new Date().getFullYear()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FilaResumen
              etiqueta="Total"
              valor={vacaciones?.total_actual ?? 0}
            />
            <FilaResumen
              etiqueta="Disfrutadas"
              valor={vacaciones?.disfrutadas_actual ?? 0}
            />
            <FilaResumen
              etiqueta="Disponibles"
              valor={vacaciones?.disponibles_actual ?? 0}
              destacado
            />
          </div>

          {(vacaciones?.total_anterior ?? 0) > 0 && (
            <>
              <hr
                style={{
                  border: 'none',
                  borderTop: '1px solid var(--borde)',
                  margin: '8px 0',
                }}
              />
              <div
                style={{
                  fontSize: 9,
                  color: 'var(--texto-suave)',
                  marginBottom: 4,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                Arrastre {vacaciones?.anio_anterior}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FilaResumen
                  etiqueta="Totales"
                  valor={vacaciones?.total_anterior ?? 0}
                />
                <FilaResumen
                  etiqueta="Disfrutados"
                  valor={vacaciones?.disfrutadas_anterior ?? 0}
                />
                <FilaResumen
                  etiqueta="Disponibles"
                  valor={vacaciones?.disponibles_anterior ?? 0}
                  destacado
                />
              </div>
            </>
          )}
        </div>

        {/* Tarjeta DAS clicable */}
        <div
          className="card"
          onClick={() => setModalInformeAbierto(true)}
          style={{ cursor: 'pointer', position: 'relative' }}
          title="Pulsa para ver el informe DAS"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginBottom: 8,
            }}
          >
            <h4
              style={{
                color: 'var(--texto-suave)',
                fontSize: 10,
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
                fontWeight: 700,
              }}
            >
              DAS
            </h4>
            <FileText size={12} color="var(--acento)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FilaResumen
              etiqueta="Generados"
              valor={dasStatus?.das_generados ?? 0}
            />
            <FilaResumen
              etiqueta="Disfrutados"
              valor={dasStatus?.das_disfrutados ?? 0}
            />
            <FilaResumen
              etiqueta="Disponibles"
              valor={dasStatus?.das_disponibles ?? 0}
              destacado
            />
          </div>

          <hr
            style={{
              border: 'none',
              borderTop: '1px solid var(--borde)',
              margin: '8px 0',
            }}
          />

          <div style={{ fontSize: 10, lineHeight: 1.4 }}>
            <div style={{ color: 'var(--texto-suave)', fontSize: 9 }}>
              Festivos / Fines de semana
            </div>
            <div style={{ color: 'var(--texto-suave)', fontSize: 9 }}>
              trabajados:{' '}
              <strong style={{ color: 'var(--texto)' }}>
                {festivosTotales}
              </strong>{' '}
              — {festivosTotales} / {festivosDAS} DAS / {festivosResiduo}{' '}
              {festivosResiduo === 1 ? 'Residuo' : 'Residuos'}
            </div>
            <div
              style={{
                color: 'var(--texto-suave)',
                fontSize: 9,
                marginTop: 6,
              }}
            >
              Noches entre semana
            </div>
            <div style={{ color: 'var(--texto-suave)', fontSize: 9 }}>
              trabajadas:{' '}
              <strong style={{ color: 'var(--texto)' }}>
                {nochesTotales}
              </strong>{' '}
              — {nochesTotales} / {nochesDAS} DAS / {nochesResiduo}{' '}
              {nochesResiduo === 1 ? 'Residuo' : 'Residuos'}
            </div>
          </div>

          <div
            style={{
              marginTop: 10,
              paddingTop: 8,
              borderTop: '1px dashed var(--borde)',
              fontSize: 10,
              color: 'var(--acento)',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            📄 Ver informe completo
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 8,
          padding: 3,
          background: 'var(--fondo-tarjeta)',
          border: '1px solid var(--borde)',
          borderRadius: 10,
          width: 'fit-content',
        }}
      >
        <button
          onClick={() => setVista('mensual')}
          style={{
            padding: '6px 14px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            background: vista === 'mensual' ? 'var(--acento)' : 'transparent',
            color: vista === 'mensual' ? '#0b0e13' : 'var(--texto-suave)',
          }}
        >
          Mensual
        </button>
        <button
          onClick={() => setVista('semanal')}
          style={{
            padding: '6px 14px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            background: vista === 'semanal' ? 'var(--acento)' : 'transparent',
            color: vista === 'semanal' ? '#0b0e13' : 'var(--texto-suave)',
          }}
        >
          Semanal
        </button>
        <button
          onClick={() => setVista('anual')}
          style={{
            padding: '6px 14px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 7,
            border: 'none',
            cursor: 'pointer',
            background: vista === 'anual' ? 'var(--acento)' : 'transparent',
            color: vista === 'anual' ? '#0b0e13' : 'var(--texto-suave)',
          }}
        >
          Anual
        </button>
      </div>

      {vista === 'mensual' && (
        <VistaMensual
          turnos={turnos}
          festivos={festivos}
          fechaSeleccionada={fecha}
          onSeleccionarFecha={seleccionarYAbir}
          onCambioMes={alCambiarMesVistaMensual}
        />
      )}

      {vista === 'semanal' && (
        <VistaSemanal
          turnos={turnos}
          festivos={festivos}
          fechaSeleccionada={fecha}
          onSeleccionarFecha={seleccionarYAbir}
          onCambioSemana={alCambiarSemanaVistaSemanal}
        />
      )}

      {vista === 'anual' && (
        <VistaAnual
          turnos={turnos}
          onSeleccionarFecha={seleccionarDesdeAnual}
        />
      )}

      {vista !== 'anual' && (
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
              flexWrap: 'wrap',
            }}
          >
            <h3 style={{ margin: 0, flex: 1, minWidth: 0 }}>
              {textoFechaLarga(fecha)}
            </h3>
            <span
              className="chip"
              style={{
                background: 'var(--fondo-tarjeta-2)',
                color: 'var(--texto-suave)',
              }}
            >
              {turnosDelDia.length}{' '}
              {turnosDelDia.length === 1 ? 'turno' : 'turnos'}
            </span>
            <button
              className="btn btn-primary"
              onClick={() => setModalAbierto(true)}
            >
              Editar día
            </button>
          </div>

          {turnosDelDia.length === 0 ? (
            <p style={{ color: 'var(--texto-suave)', fontSize: 11 }}>
              Este día aún no tiene turnos asignados.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {turnosDelDia.map((t) => {
                const fechaD = new Date(t.fecha + 'T00:00:00')
                const diaSemana = fechaD.getDay()
                const esFinSemana = diaSemana === 0 || diaSemana === 6
                const esNocturno = t.codigo_turno === 'N' && !esFinSemana
                const esFestivo = esFinSemana && t.codigo_turno !== 'L'

                return (
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
                    }}
                  >
                    <div
                      style={{
                        fontSize: 20,
                        width: 34,
                        height: 34,
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--fondo-tarjeta)',
                        flexShrink: 0,
                      }}
                    >
                      {iconoTurno(t)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginBottom: 2,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span className="chip" style={{ background: t.color }}>
                          {(t.nombre_turno ?? '').toUpperCase()}
                        </span>
                        {esFestivo && (
                          <span
                            className="punto-das punto-festivo"
                            title="Cuenta como festivo trabajado"
                          />
                        )}
                        {esNocturno && (
                          <span
                            className="punto-das punto-nocturno"
                            title="Cuenta como noche trabajada"
                          />
                        )}
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
                          {t.hora_inicio && t.hora_fin
                            ? `${t.hora_inicio.slice(0, 5)} – ${t.hora_fin.slice(0, 5)}`
                            : 'Todo el día'}
                        </span>
                        <span>
                          {muestraDepartamento(t)
                            ? t.departamento
                            : etiquetaSinDepartamento(t)}
                        </span>
                      </div>

                      {t.notas && (
                        <div
                          style={{
                            fontSize: 10,
                            color: 'var(--texto-suave)',
                            marginTop: 2,
                            overflowWrap: 'break-word',
                          }}
                        >
                          📝 {t.notas}
                        </div>
                      )}
                    </div>

                    <button
                      className="btn-mini btn-mini-peligro"
                      onClick={() => borrarTurnoRapido(t.id)}
                    >
                      Borrar
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {modalAbierto && (
        <ModalDia
          fecha={fecha}
          turnosDelDia={turnosDelDia}
          onCerrar={() => setModalAbierto(false)}
          onCambio={cargarTodo}
        />
      )}

      {modalInformeAbierto && (
        <ModalInformeDas onCerrar={() => setModalInformeAbierto(false)} />
      )}
    </>
  )
}

function FilaResumen({
  etiqueta,
  valor,
  destacado = false,
}: {
  etiqueta: string
  valor: number
  destacado?: boolean
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        fontSize: 11,
      }}
    >
      <span style={{ color: 'var(--texto-suave)' }}>{etiqueta}</span>
      <span
        style={{
          fontWeight: 800,
          fontSize: destacado ? 16 : 13,
          color: destacado ? 'var(--acento)' : 'var(--texto)',
        }}
      >
        {valor}
      </span>
    </div>
  )
}

function CuentaKilometros({
  progreso,
  realizados,
}: {
  progreso: number
  realizados: number
}) {
  const circunferencia = Math.PI * 50
  const offset = circunferencia * (1 - progreso / 100)

  return (
    <div
      style={{
        position: 'relative',
        width: 130,
        height: 78,
        margin: '0 auto',
      }}
    >
      <svg viewBox="0 0 120 70" width="130" height="78">
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="var(--fondo-tarjeta-3)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke="var(--acento)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circunferencia}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          top: 42,
          left: 0,
          right: 0,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: 'var(--acento)',
            lineHeight: 1,
            letterSpacing: '-0.03em',
          }}
        >
          {progreso}%
        </div>
        <div
          style={{
            fontSize: 8,
            color: 'var(--texto-suave)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            fontWeight: 700,
            marginTop: 2,
          }}
        >
          Realizados
        </div>
      </div>
    </div>
  )
}
