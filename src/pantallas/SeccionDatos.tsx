import { useState } from 'react'
import { supabase } from '../supabase'
import { useUsuario } from '../contexto/UsuarioContexto'
import {
  generarCSV,
  descargarCSV,
  parsearCSV,
} from '../utilidades/csv'

export default function SeccionDatos() {
  const { usuario } = useUsuario()

  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [trabajando, setTrabajando] = useState(false)

  if (!usuario) return null

  // Fecha en formato YYYY-MM-DD para el nombre del archivo
  function hoy(): string {
    return new Date().toISOString().split('T')[0]
  }

  // ─────────── EXPORTAR TURNOS ───────────

  async function exportarTurnos() {
    setError('')
    setMensaje('')
    setTrabajando(true)

    const { data, error } = await supabase
      .from('turno')
      .select(`
        fecha,
        notas,
        anio_origen,
        tipo_turno (codigo),
        departamento (nombre)
      `)
      .eq('id_usuario', usuario!.id)
      .order('fecha', { ascending: true })

    setTrabajando(false)

    if (error) {
      setError(error.message)
      return
    }

    const cabeceras = ['fecha', 'tipo', 'departamento', 'notas', 'anio_origen']
    const filas = (data ?? []).map((t: any) => [
      t.fecha,
      t.tipo_turno?.codigo ?? '',
      t.departamento?.nombre ?? '',
      t.notas ?? '',
      t.anio_origen ?? '',
    ])

    const csv = generarCSV(cabeceras, filas)
    descargarCSV(`turnos_${hoy()}.csv`, csv)
    setMensaje(`Exportados ${filas.length} turnos`)
  }

  // ─────────── IMPORTAR TURNOS ───────────

  async function importarTurnos(archivo: File) {
    setError('')
    setMensaje('')
    setTrabajando(true)

    const texto = await archivo.text()
    const filas = parsearCSV(texto)

    if (filas.length < 2) {
      setError('El archivo está vacío o no tiene datos')
      setTrabajando(false)
      return
    }

    const cabeceras = filas[0].map((h) => h.trim().toLowerCase())
    const idx = {
      fecha: cabeceras.indexOf('fecha'),
      tipo: cabeceras.indexOf('tipo'),
      departamento: cabeceras.indexOf('departamento'),
      notas: cabeceras.indexOf('notas'),
      anio_origen: cabeceras.indexOf('anio_origen'),
    }

    if (idx.fecha === -1 || idx.tipo === -1 || idx.departamento === -1) {
      setError(
        'Faltan columnas obligatorias: fecha, tipo, departamento'
      )
      setTrabajando(false)
      return
    }

    // Cargamos catálogos para convertir código/nombre a ids
    const [{ data: tipos }, { data: depts }] = await Promise.all([
      supabase.from('tipo_turno').select('id, codigo'),
      supabase.from('departamento').select('id, nombre'),
    ])

    const mapaTipos = new Map(
      (tipos ?? []).map((t: any) => [t.codigo.toUpperCase(), t.id])
    )
    const mapaDepts = new Map(
      (depts ?? []).map((d: any) => [d.nombre.toLowerCase(), d.id])
    )

    let creados = 0
    let ignorados = 0
    let errores = 0

    for (let i = 1; i < filas.length; i++) {
      const fila = filas[i]
      if (!fila || fila.length === 0 || !fila[0]) continue

      const fecha = fila[idx.fecha]?.trim()
      const codigoTipo = fila[idx.tipo]?.trim().toUpperCase()
      const nombreDept = fila[idx.departamento]?.trim().toLowerCase()
      const notas = idx.notas >= 0 ? fila[idx.notas]?.trim() || null : null
      const anioOrigen =
        idx.anio_origen >= 0 && fila[idx.anio_origen]?.trim()
          ? Number(fila[idx.anio_origen].trim())
          : null

      if (!fecha || !codigoTipo || !nombreDept) {
        errores++
        continue
      }

      const idTipo = mapaTipos.get(codigoTipo)
      const idDept = mapaDepts.get(nombreDept)

      if (!idTipo || !idDept) {
        errores++
        continue
      }

      const { error } = await supabase.from('turno').insert({
        id_usuario: usuario!.id,
        id_departamento: idDept,
        id_tipo_turno: idTipo,
        fecha,
        notas,
        anio_origen: codigoTipo === 'VAC' ? anioOrigen : null,
      })

      if (error) {
        if (error.code === '23505') ignorados++
        else errores++
      } else {
        creados++
      }
    }

    setTrabajando(false)
    setMensaje(
      `Importación de turnos: ${creados} añadidos, ${ignorados} ya existían, ${errores} con error`
    )
  }

  // ─────────── EXPORTAR FESTIVOS ───────────

  async function exportarFestivos() {
    setError('')
    setMensaje('')
    setTrabajando(true)

    const { data, error } = await supabase
      .from('festivo_calendario')
      .select('fecha, ambito, descripcion')
      .order('fecha', { ascending: true })

    setTrabajando(false)

    if (error) {
      setError(error.message)
      return
    }

    const cabeceras = ['fecha', 'ambito', 'descripcion']
    const filas = (data ?? []).map((f: any) => [
      f.fecha,
      f.ambito,
      f.descripcion ?? '',
    ])

    const csv = generarCSV(cabeceras, filas)
    descargarCSV(`festivos_${hoy()}.csv`, csv)
    setMensaje(`Exportados ${filas.length} festivos`)
  }

  // ─────────── IMPORTAR FESTIVOS ───────────

  async function importarFestivos(archivo: File) {
    setError('')
    setMensaje('')
    setTrabajando(true)

    const texto = await archivo.text()
    const filas = parsearCSV(texto)

    if (filas.length < 2) {
      setError('El archivo está vacío o no tiene datos')
      setTrabajando(false)
      return
    }

    const cabeceras = filas[0].map((h) => h.trim().toLowerCase())
    const idx = {
      fecha: cabeceras.indexOf('fecha'),
      ambito: cabeceras.indexOf('ambito'),
      descripcion: cabeceras.indexOf('descripcion'),
    }

    if (idx.fecha === -1 || idx.ambito === -1) {
      setError('Faltan columnas obligatorias: fecha, ambito')
      setTrabajando(false)
      return
    }

    let creados = 0
    let ignorados = 0
    let errores = 0

    for (let i = 1; i < filas.length; i++) {
      const fila = filas[i]
      if (!fila || fila.length === 0 || !fila[0]) continue

      const fecha = fila[idx.fecha]?.trim()
      const ambito = fila[idx.ambito]?.trim().toLowerCase()
      const descripcion =
        idx.descripcion >= 0 ? fila[idx.descripcion]?.trim() || null : null

      if (
        !fecha ||
        !ambito ||
        !['nacional', 'autonomico', 'local'].includes(ambito)
      ) {
        errores++
        continue
      }

      const { error } = await supabase.from('festivo_calendario').insert({
        fecha,
        ambito,
        descripcion,
        importado: false,
      })

      if (error) {
        if (error.code === '23505') ignorados++
        else errores++
      } else {
        creados++
      }
    }

    setTrabajando(false)
    setMensaje(
      `Importación de festivos: ${creados} añadidos, ${ignorados} ya existían, ${errores} con error`
    )
  }

  // ─────────── MANEJADORES DE ARCHIVO ───────────

  function manejarArchivoTurnos(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    importarTurnos(f)
    e.target.value = ''
  }

  function manejarArchivoFestivos(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    importarFestivos(f)
    e.target.value = ''
  }

  return (
    <>
      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Datos · Turnos</h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--texto-suave)',
            marginBottom: 14,
          }}
        >
          Exporta tus turnos a un archivo CSV (se abre en Excel) o importa
          desde uno. La importación no borra nada: los duplicados se ignoran.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={exportarTurnos}
            disabled={trabajando}
          >
            ⬇ Exportar turnos a CSV
          </button>

          <label
            className="btn"
            style={{
              background: 'var(--fondo-tarjeta-2)',
              color: 'var(--texto)',
              cursor: trabajando ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: trabajando ? 0.6 : 1,
            }}
          >
            ⬆ Importar turnos desde CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={manejarArchivoTurnos}
              disabled={trabajando}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: 12 }}>Datos · Festivos</h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--texto-suave)',
            marginBottom: 14,
          }}
        >
          Exporta o importa el calendario de festivos. Igual que con los
          turnos, la importación ignora duplicados.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={exportarFestivos}
            disabled={trabajando}
          >
            ⬇ Exportar festivos a CSV
          </button>

          <label
            className="btn"
            style={{
              background: 'var(--fondo-tarjeta-2)',
              color: 'var(--texto)',
              cursor: trabajando ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              opacity: trabajando ? 0.6 : 1,
            }}
          >
            ⬆ Importar festivos desde CSV
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={manejarArchivoFestivos}
              disabled={trabajando}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {(mensaje || error) && (
        <div className="card">
          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}
        </div>
      )}
    </>
  )
}
