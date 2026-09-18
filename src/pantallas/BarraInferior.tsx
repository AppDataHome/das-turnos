import {
  Calendar,
  CalendarDays,
  Settings,
  Cog,
  HelpCircle,
} from 'lucide-react'

export type Pestana =
  | 'calendario'
  | 'festivos'
  | 'configuracion'
  | 'ajustes'
  | 'ayuda'

interface Props {
  pestana: Pestana
  onCambiar: (p: Pestana) => void
}

const OPCIONES: { id: Pestana; etiqueta: string; Icono: any }[] = [
  { id: 'calendario', etiqueta: 'Calendario', Icono: Calendar },
  { id: 'festivos', etiqueta: 'Festivos', Icono: CalendarDays },
  { id: 'configuracion', etiqueta: 'Config.', Icono: Cog },
  { id: 'ajustes', etiqueta: 'Ajustes', Icono: Settings },
  { id: 'ayuda', etiqueta: 'Ayuda', Icono: HelpCircle },
]

export default function BarraInferior({ pestana, onCambiar }: Props) {
  return (
    <div className="barra-inferior">
      {OPCIONES.map(({ id, etiqueta, Icono }) => (
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
