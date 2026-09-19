import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { supabase } from '../supabase'
import type { Usuario, Tema } from '../tipos'

interface UsuarioContextoValor {
  usuario: Usuario | null
  cargando: boolean
  esInvitado: boolean
  puedeEditar: boolean
  recargar: () => Promise<void>
  actualizarPerfil: (cambios: Partial<Usuario>) => Promise<void>
  cambiarTema: (tema: Tema) => Promise<void>
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

    // Primero intentamos leer la fila de `usuario`.
    // Da igual si es anónimo o no: si tiene fila, se usa.
    const { data } = await supabase
      .from('usuario')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle()

    if (data) {
      setUsuario(data as Usuario)
      setCargando(false)
      return
    }

    // No hay fila. Si es anónimo, no creamos perfil (lo hace el canje).
    if (authUser.is_anonymous) {
      setUsuario(null)
      setCargando(false)
      return
    }

    // Usuario normal sin fila: la creamos
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

  async function generarCodigoInvitacion(): Promise<string> {
    const { data, error } = await supabase.rpc('generar_codigo_invitacion')
    if (error) throw error
    await cargar()
    return data as string
  }

  async function revocarCodigoInvitacion() {
    const { error } = await supabase.rpc('revocar_codigo_invitacion')
    if (error) throw error
    await cargar()
  }

  async function vincularComoInvitado(codigo: string) {
    const { data, error } = await supabase.rpc('vincular_como_invitado', {
      p_codigo: codigo,
    })
    if (error) return { ok: false, mensaje: error.message }

    const fila = (data as any[])?.[0]
    if (!fila)
      return { ok: false, mensaje: 'Respuesta inesperada del servidor' }

    if (fila.ok) await cargar()
    return { ok: fila.ok, mensaje: fila.mensaje }
  }

  async function desvincularInvitado() {
    const { error } = await supabase.rpc('desvincular_invitado')
    if (error) throw error
    await cargar()
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

export function useUsuario() {
  const ctx = useContext(UsuarioContexto)
  if (!ctx) throw new Error('useUsuario debe usarse dentro de UsuarioProveedor')
  return ctx
}
