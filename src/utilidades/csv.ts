// ─────────── Utilidades para CSV ───────────

// Escapa un valor para que sea seguro dentro de un CSV
export function escaparCSV(valor: any): string {
  if (valor === null || valor === undefined) return ''
  const s = String(valor)
  if (
    s.includes(',') ||
    s.includes('"') ||
    s.includes('\n') ||
    s.includes('\r')
  ) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

// Genera el texto CSV a partir de cabeceras y filas
export function generarCSV(cabeceras: string[], filas: any[][]): string {
  const lineas = [cabeceras.map(escaparCSV).join(',')]
  for (const fila of filas) {
    lineas.push(fila.map(escaparCSV).join(','))
  }
  return lineas.join('\n')
}

// Descarga un archivo CSV en el navegador
export function descargarCSV(nombre: string, contenido: string) {
  // BOM para que Excel reconozca UTF-8 y muestre bien los acentos
  const blob = new Blob(['\uFEFF' + contenido], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Parsea un CSV y devuelve una matriz de strings (filas x columnas)
export function parsearCSV(texto: string): string[][] {
  // Eliminar BOM si existe
  if (texto.charCodeAt(0) === 0xfeff) texto = texto.slice(1)

  const resultado: string[][] = []
  let linea: string[] = []
  let campo = ''
  let dentroComillas = false
  let i = 0

  while (i < texto.length) {
    const c = texto[i]

    if (dentroComillas) {
      if (c === '"') {
        if (texto[i + 1] === '"') {
          campo += '"'
          i += 2
          continue
        }
        dentroComillas = false
        i++
        continue
      }
      campo += c
      i++
      continue
    }

    if (c === '"') {
      dentroComillas = true
      i++
      continue
    }

    if (c === ',') {
      linea.push(campo)
      campo = ''
      i++
      continue
    }

    if (c === '\n') {
      linea.push(campo)
      resultado.push(linea)
      linea = []
      campo = ''
      i++
      continue
    }

    if (c === '\r') {
      i++
      continue
    }

    campo += c
    i++
  }

  // Última línea
  if (campo !== '' || linea.length > 0) {
    linea.push(campo)
    resultado.push(linea)
  }

  return resultado
}
