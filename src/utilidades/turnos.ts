import type { Turno } from '../tipos'

// Devuelve el icono que hay que mostrar en el chip del turno.
// Si es de categoría "libre" o "formacion", se usa un icono por código.
// Si es de categoría "trabajo", se usa el icono del departamento.
export function iconoTurno(t: Turno): string {
  const categoria = t.categoria_turno ?? 'trabajo'
  const codigo = (t.codigo_turno ?? '').toUpperCase()

  // Primero, iconos específicos por código (independientemente de la categoría)
  switch (codigo) {
    case 'VAC':
      return '🏖️'
    case 'DAS':
      return '🎉'
    case 'AP':
      return '🏠'
    case 'L':
      return '💤'
    case 'TEO':
      return '📚'
    case 'PRA':
      return '🛠️'
  }

  // Si no hay código especial, según la categoría
  if (categoria === 'trabajo') {
    return t.icono_departamento ?? '📁'
  }
  if (categoria === 'formacion') {
    return '🎓'
  }
  if (categoria === 'libre') {
    return '🌴'
  }
  return '📁'
}

// ¿Hay que mostrar el nombre del departamento en este turno?
// Solo si es de categoría "trabajo".
export function muestraDepartamento(t: Turno): boolean {
  return (t.categoria_turno ?? 'trabajo') === 'trabajo'
}

// Texto corto para mostrar en lugar del departamento en el modal/panel.
export function etiquetaSinDepartamento(t: Turno): string {
  const codigo = (t.codigo_turno ?? '').toUpperCase()
  if (codigo === 'VAC') return 'Vacaciones'
  if (codigo === 'DAS') return 'Día DAS'
  if (codigo === 'AP') return 'Asuntos propios'
  if (codigo === 'L') return 'Día libre'
  if (codigo === 'TEO') return 'Formación teórica'
  if (codigo === 'PRA') return 'Formación práctica'
  return 'Sin departamento'
}
