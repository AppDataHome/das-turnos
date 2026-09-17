import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import VistaMensual from './VistaMensual'
import ModalDia from './ModalDia'
import type { Turno, DasStatus } from '../tipos'

interface ResumenVacaciones {
  total: number
  disfrutadas: number
  disponibles: number
}

export default function Calendario() {
  const { usuario } = useUsuario()

  const [turnos, setTurnos] = useState<Turno[]>([])
  const [dasStatus, setDasStatus] = useState<DasStatus | null>(null)
  const [vacaciones, setVacaciones] = useState<ResumenVacaciones | null>(null)
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [modalAbierto, setModalAbierto] = useState(false)

  useEffect(() => {
    if (usuario) {
      cargarTodo()
    }
  }, [usuario])

  async function cargarTodo() {
    await Promise.all([cargarTurnos(), cargarEstadoDas(), cargarVacaciones()])
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
        tipo_turno (codigo, nombre, color),
        departamento (nombre)
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
          departamento: t.departamento?.nombre || '?',
        }))
      )
    }
  }

  async function cargarEstadoDas() {
    if (!usuario) return
    const { data, error } = await supabase.rpc('get_das_status', {
      p_usuario: usuario.id,
    })
    if (!error && data && data[0]) {
      setDasStatus(data[0])
    }
  }

  async function cargarVacaciones() {
    if (!usuario) return
    const { data, error } = await supabase.rpc('get_resumen_vacaciones', {
      p_usuario: usuario.id,
    })
    if (!error && data && data[0]) {
      setVacaciones(data[0])
    }
  }

  if (!usuario) return null

  const turnosDelDia = turnos.filter((t) => t.fecha === fecha)

  const hoy = new Date()
  const anioActual = hoy.getFullYear()
  const mesActual = hoy.getMonth()
  const hoyTexto = hoy.toISOString().split('T')[0]

  function esDelMesActual(fechaTexto: string): boolean {
    const d = new Date(fechaTexto + 'T00:00:00')
    return d.getFullYear() === anioActual && d.getMonth() === mesActual
  }

  const codigosTrabajo = ['M', 'T', 'N']
  const turnosMes = turnos.filter(
    (t) =>
      esDelMesActual(t.fecha) && codigosTrabajo.includes(t.codigo_turno ?? '')
  )
  const realizados = turnosMes.filter((t) => t.fecha <= hoyTexto).length
  const totalMes = turnosMes.length
  const restantes = totalMes - realizados
  const progreso = totalMes === 0 ? 0 : Math.round((realizados / totalMes) * 100)

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

  // Al pulsar un día, seleccionarlo y abrir el modal
  function seleccionarYAbir(fechaNueva: string) {
    setFecha(fechaNueva)
    setModalAbierto(true)
  }

  return (
    <>
      {/* Tarjetas superiores */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {/* Tarjeta Turnos Mes */}
        <div className="card">
          <h4
            style={{
              color: 'var(--texto-suave)',
              fontSize: 12,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Turnos Mes
          </h4>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--acento)',
              }}
            >
              {realizados} Realizados
            </div>
          </div>
          <div
            style={{
              height: 8,
              background: 'var(--fondo-tarjeta-2)',
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progreso}%`,
                background: 'var(--acento)',
                transition: 'width 0.3s',
              }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--texto)',
              }}
            >
              {restantes} Restantes
            </div>
          </div>
        </div>

        {/* Tarjeta Vacaciones */}
        <div className="card">
          <h4
            style={{
              color: 'var(--texto-suave)',
              fontSize: 12,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Vacaciones
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <FilaResumen etiqueta="Total:" valor={vacaciones?.total ?? 0} />
            <FilaResumen
              etiqueta="Disfrutadas:"
              valor={vacaciones?.disfrutadas ?? 0}
            />
            <FilaResumen
              etiqueta="Disponibles:"
              valor={vacaciones?.disponibles ?? 0}
            />
          </div>
        </div>

        {/* Tarjeta DAS */}
        <div className="card">
          <h4
            style={{
              color: 'var(--texto-suave)',
              fontSize: 12,
              marginBottom: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            DAS
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FilaResumenMini
              etiqueta="Generados:"
              valor={dasStatus?.das_generados ?? 0}
            />
            <FilaResumenMini
              etiqueta="Disfrutados:"
              valor={dasStatus?.das_disfrutados ?? 0}
            />
            <FilaResumenMini
              etiqueta="Disponibles:"
              valor={dasStatus?.das_disponibles ?? 0}
            />
          </div>

          <hr
            style={{
              border: 'none',
              borderTop: '1px solid var(--borde)',
              margin: '12px 0',
            }}
          />

          <div style={{ fontSize: 12, lineHeight: 1.6 }}>
            <div style={{ color: 'var(--texto-suave)' }}>
              Festivos / Fines de semana trabajados:{' '}
              <strong style={{ color: 'var(--texto)' }}>{festivosTotales}</strong>
            </div>
            <div style={{ color: 'var(--texto-suave)', paddingLeft: 12 }}>
              {festivosTotales} / {festivosDAS} DAS / {festivosResiduo}{' '}
              {festivosResiduo === 1 ? 'Residuo' : 'Residuos'}
            </div>
          </div>

          <div style={{ fontSize: 12, lineHeight: 1.6, marginTop: 10 }}>
            <div style={{ color: 'var(--texto-suave)' }}>
              Noches entre semana trabajadas:{' '}
              <strong style={{ color: 'var(--texto)' }}>{nochesTotales}</strong>
            </div>
            <div style={{ color: 'var(--texto-suave)', paddingLeft: 12 }}>
              {nochesTotales} / {nochesDAS} DAS / {nochesResiduo}{' '}
              {nochesResiduo === 1 ? 'Residuo' : 'Residuos'}
            </div>
          </div>
        </div>
      </div>

      {/* Calendario */}
      <VistaMensual
        turnos={turnos}
        fechaSeleccionada={fecha}
        onSeleccionarFecha={seleccionarYAbir}
      />

      {/* Panel del día seleccionado (resumen) */}
      <div className="card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <h3 style={{ margin: 0 }}>{textoFechaLarga(fecha)}</h3>
          <span
            className="chip"
            style={{
              background: 'var(--fondo-tarjeta-2)',
              color: 'var(--texto-suave)',
              fontSize: 11,
            }}
          >
            {turnosDelDia.length}{' '}
            {turnosDelDia.length === 1 ? 'turno' : 'turnos'}
          </span>
          <button
            className="btn btn-primary"
            style={{ marginLeft: 'auto', padding: '8px 14px', fontSize: 13 }}
            onClick={() => setModalAbierto(true)}
          >
            Editar día
          </button>
        </div>

        {turnosDelDia.length === 0 ? (
          <p style={{ color: 'var(--texto-suave)', fontSize: 14 }}>
            Este día aún no tiene turnos asignados. Pulsa "Editar día" para
            añadir alguno.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {turnosDelDia.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  background: 'var(--fondo-tarjeta-2)',
                  borderRadius: 8,
                }}
              >
                <span className="chip" style={{ background: t.color }}>
                  {(t.nombre_turno ?? '').toUpperCase()}
                </span>
                <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>
                  {t.departamento}
                </span>
                {t.notas && (
                  <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>
                    · {t.notas}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal del día */}
      {modalAbierto && (
        <ModalDia
          fecha={fecha}
          turnosDelDia={turnosDelDia}
          onCerrar={() => setModalAbierto(false)}
          onCambio={cargarTodo}
        />
      )}
    </>
  )
}

// ─────────── Componentes auxiliares ───────────

function FilaResumen({ etiqueta, valor }: { etiqueta: string; valor: number }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        fontSize: 15,
      }}
    >
      <span style={{ color: 'var(--texto-suave)' }}>{etiqueta}</span>
      <span
        style={{
          fontWeight: 700,
          fontSize: 20,
          color: 'var(--acento)',
        }}
      >
        {valor}
      </span>
    </div>
  )
}

function FilaResumenMini({
  etiqueta,
  valor,
}: {
  etiqueta: string
  valor: number
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        fontSize: 13,
      }}
    >
      <span style={{ color: 'var(--texto-suave)' }}>{etiqueta}</span>
      <span style={{ fontWeight: 700, color: 'var(--acento)', fontSize: 16 }}>
        {valor}
      </span>
    </div>
  )
}
