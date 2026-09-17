import type { Turno } from '../tipos'

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

interface Props {
  turnos: Turno[]
  vacaciones: ResumenVacaciones | null
}

interface Aviso {
  tipo: 'info' | 'aviso'
  texto: string
}

export default function AvisosBanner({ turnos, vacaciones }: Props) {
  const avisos = calcularAvisos(turnos, vacaciones)

  if (avisos.length === 0) return null

  return (
    <div style={{ marginBottom: 16 }}>
      {avisos.map((a, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: 12,
            borderRadius: 10,
            marginBottom: 8,
            background:
              a.tipo === 'aviso'
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(250, 204, 21, 0.15)',
            border:
              a.tipo === 'aviso'
                ? '1px solid rgba(239, 68, 68, 0.4)'
                : '1px solid rgba(250, 204, 21, 0.4)',
            fontSize: 13,
            lineHeight: 1.4,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>
            {a.tipo === 'aviso' ? '⚠️' : 'ℹ️'}
          </span>
          <span style={{ flex: 1, color: 'var(--texto)' }}>{a.texto}</span>
        </div>
      ))}
    </div>
  )
}

// ─────────── Cálculo de avisos ───────────

function calcularAvisos(
  turnos: Turno[],
  vacaciones: ResumenVacaciones | null
): Aviso[] {
  const avisos: Aviso[] = []
  const hoy = new Date()
  const anio = hoy.getFullYear()
  const mes = hoy.getMonth()

  // ─── Aviso 1: DAS disfrutados este mes ───
  const dasEsteMes = turnos.filter((t) => {
    if (t.codigo_turno !== 'DAS') return false
    const d = new Date(t.fecha + 'T00:00:00')
    return d.getFullYear() === anio && d.getMonth() === mes
  }).length

  if (dasEsteMes === 2) {
    avisos.push({
      tipo: 'info',
      texto: `Ya has disfrutado 2 DAS este mes. La normativa permite un máximo de 2 al mes.`,
    })
  } else if (dasEsteMes > 2) {
    avisos.push({
      tipo: 'aviso',
      texto: `Llevas ${dasEsteMes} DAS este mes, superando el límite de 2 mensuales. Revisa si es correcto.`,
    })
  }

  // ─── Aviso 2: vacaciones arrastradas pendientes ───
  // Solo avisamos en los últimos meses del año (octubre-diciembre)
  if (mes >= 9 && vacaciones && vacaciones.disponibles_anterior > 0) {
    avisos.push({
      tipo: 'info',
      texto: `Te quedan ${vacaciones.disponibles_anterior} ${
        vacaciones.disponibles_anterior === 1 ? 'día' : 'días'
      } de vacaciones del año ${vacaciones.anio_anterior}. Recuerda disfrutarlos antes de que caduquen.`,
    })
  }

  return avisos
}
