import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { supabase } from '../supabase'
import type { Usuario, Tema } from '../tipos'

// ─────────── Forma del contexto ───────────
interface UsuarioContextoValor {
  usuario: Usuario | null
  cargando: boolean
  // Helpers de rol
  esInvitado: boolean
  puedeEditar: boolean // true si NO es invitado
  // Funciones
  recargar: () => Promise<void>
  actualizarPerfil: (cambios: Partial<Usuario>) => Promise<void>
  cambiarTema: (tema: Tema) => Promise<void>
  // Invitaciones
  generarCodigoInvitacion: () => Promise<string>
  revocarCodigoInvitacion: () => Promise<void>
  vincularComoInvitado: (
    codigo: string
  ) => Promise<{ ok: boolean; mensaje: string }>
  desvincularInvitado: () => Promise<void>
  listarMisInvitados: () => Promise<
    { id: string; nombre: string; email: string; avatar_url: string | null }[]
  >
  expulsarInvitado: (id: string) => Promise<void>
}

const UsuarioContexto = createContext<UsuarioContextoValor | null>(null)

// ─────────── Proveedor ───────────
export function UsuarioProveedor({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  async function cargar() {
    setCargando(true)

    const { data: sesion } = await supabase.auth.getSession()
    const authUser = sesion.session?.user

    if (!authUser) {
      setUsuario(null)
      setCargando(false)
      return
    }

    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (error || !data) {
      // Si no existe el perfil, lo creamos
      const nuevo: Partial<Usuario> = {
        id: authUser.id,
        email: authUser.email ?? '',
        nombre: authUser.email?.split('@')[0] ?? 'Usuario',
        rol: 'usuario',
        tema: 'negro',
        activo: true,
        numero_empleado: null,
      }

      const { data: creado, error: errInsert } = await supabase
        .from('usuario')
        .insert(nuevo)
        .select('*')
        .single()

      if (errInsert) {
        console.error('Error creando usuario:', errInsert)
        setUsuario(null)
      } else {
        setUsuario(creado as Usuario)
      }
    } else {
      setUsuario(data as Usuario)
    }

    setCargando(false)
  }

  async function actualizarPerfil(cambios: Partial<Usuario>) {
    if (!usuario) return
    const { data, error } = await supabase
      .from('usuario')
      .update(cambios)
      .eq('id', usuario.id)
      .select('*')
      .single()

    if (error) {
      console.error('Error actualizando perfil:', error)
      throw error
    }
    setUsuario(data as Usuario)
  }

  async function cambiarTema(tema: Tema) {
    await actualizarPerfil({ tema })
  }

  // ─────────── Invitaciones ───────────

  async function generarCodigoInvitacion(): Promise<string> {
    const { data, error } = await supabase.rpc('generar_codigo_invitacion')
    if (error) throw error
    await recargar()
    return data as string
  }

  async function revocarCodigoInvitacion() {
    const { error } = await supabase.rpc('revocar_codigo_invitacion')
    if (error) throw error
    await recargar()
  }

  async function vincularComoInvitado(codigo: string) {
    const { data, error } = await supabase.rpc('vincular_como_invitado', {
      p_codigo: codigo,
    })
    if (error) return { ok: false, mensaje: error.message }

    const fila = (data as any[])?.[0]
    if (!fila) return { ok: false, mensaje: 'Respuesta inesperada del servidor' }

    if (fila.ok) await recargar()
    return { ok: fila.ok, mensaje: fila.mensaje }
  }

  async function desvincularInvitado() {
    const { error } = await supabase.rpc('desvincular_invitado')
    if (error) throw error
    await recargar()
  }

  async function listarMisInvitados() {
    const { data, error } = await supabase.rpc('listar_mis_invitados')
    if (error) return []
    return (data ?? []) as {
      id: string
      nombre: string
      email: string
      avatar_url: string | null
    }[]
  }

  async function expulsarInvitado(id: string) {
    const { error } = await supabase.rpc('expulsar_invitado', {
      p_invitado: id,
    })
    if (error) throw error
  }

  // ─────────── Efectos ───────────

  useEffect(() => {
    cargar()

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      cargar()
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const tema = usuario?.tema ?? 'negro'
    document.documentElement.setAttribute('data-tema', tema)
  }, [usuario?.tema])

  const esInvitado = usuario?.rol === 'invitado' && !!usuario?.invitado_de
  const puedeEditar = !esInvitado

  return (
    <UsuarioContexto.Provider
      value={{
        usuario,
        cargando,
        esInvitado,
        puedeEditar,
        recargar: cargar,
        actualizarPerfil,
        cambiarTema,
        generarCodigoInvitacion,
        revocarCodigoInvitacion,
        vincularComoInvitado,
        desvincularInvitado,
        listarMisInvitados,
        expulsarInvitado,
      }}
    >
      {children}
    </UsuarioContexto.Provider>
  )
}

// ─────────── Hook ───────────
export function useUsuario() {
  const ctx = useContext(UsuarioContexto)
  if (!ctx) throw new Error('useUsuario debe usarse dentro de UsuarioProveedor')
  return ctx
}
