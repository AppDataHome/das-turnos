// ─────────── Tipos de datos compartidos ───────────

export type Tema = 'negro' | 'verde'
export type Rol = 'usuario' | 'invitado'

export interface Usuario {
  id: string
  email: string
  nombre: string
  numero_empleado: string | null
  rol: Rol
  tema: Tema
  activo: boolean
}

export interface Departamento {
  id: string
  nombre: string
  activo: boolean
}

export interface TipoTurno {
  id: string
  codigo: string
  nombre: string
  hora_inicio: string
  hora_fin: string
  cruza_medianoche: boolean
  categoria: 'trabajo' | 'formacion' | 'libre' | 'otros'
  color: string
}

export interface Turno {
  id: string
  id_usuario: string
  id_departamento: string
  fecha: string
  id_tipo_turno: string
  notas: string | null
  // Campos calculados para la vista
  codigo_turno?: string
  nombre_turno?: string
  color?: string
  departamento?: string
  icono_departamento?: string
  orden_turno?: number
  hora_inicio?: string | null
  hora_fin?: string | null
  categoria_turno?: string
}

export interface DasStatus {
  festivos_validos: number
  festivos_restantes: number
  noches_validas: number
  noches_restantes: number
  das_generados: number
  das_disfrutados: number
  das_remanente_manual: number
  das_disponibles: number
}

export interface Ausencia {
  id: string
  id_usuario: string
  tipo: 'vacaciones' | 'asunto_propio' | 'das'
  fecha_inicio: string
  fecha_fin: string
  notas: string | null
}
