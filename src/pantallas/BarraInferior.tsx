import {
  Calendar,
  CalendarDays,
  Settings,
  HelpCircle,
} from 'lucide-react'

export type Pestana = 'calendario' | 'festivos' | 'ajustes' | 'ayuda'

interface Props {
  pestana: Pestana
  onCambiar: (p: Pestana) => void
  esInvitado: boolean
}

export default function BarraInferior({
  pestana,
  onCambiar,
  esInvitado,
}: Props) {
  const opciones: { id: Pestana; etiqueta: string; Icono: any }[] = [
    { id: 'calendario', etiqueta: 'Calendario', Icono: Calendar },
  ]

  if (!esInvitado) {
    opciones.push({
      id: 'festivos',
      etiqueta: 'Festivos',
      Icono: CalendarDays,
    })
  }

  opciones.push(
    { id: 'ajustes', etiqueta: 'Ajustes', Icono: Settings },
    { id: 'ayuda', etiqueta: 'Ayuda', Icono: HelpCircle }
  )

  return (
    <div className="barra-inferior">
      {opciones.map(({ id, etiqueta, Icono }) => (
        <a
          key={id}
          className={pestana === id ? 'activo' : ''}
          onClick={() => onCambiar(id)}
        >
          <Icono />
          <span>{etiqueta}</span>
        </a>
      ))}
    </div>
  )
}
