import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { supabase } from '../supabase'
import type { Usuario, Tema } from '../tipos'

export interface Invitacion {
  id: string
  codigo: string
  nombre_invitado: string | null
  email_invitado: string | null
  creada_en: string
  revocada: boolean
  ultimo_acceso: string | null
}

export interface InvitadoVinculado {
  id: string
  nombre: string
  avatar_url: string | null
  creado_en: string
}

interface UsuarioContextoValor {
  usuario: Usuario | null
  cargando: boolean
  esInvitado: boolean
  puedeEditar: boolean
  recargar: () => Promise<void>
  actualizarPerfil: (cambios: Partial<Usuario>) => Promise<void>
  cambiarTema: (tema: Tema) => Promise<void>
  crearInvitacion: (
    nombreInvitado: string
  ) => Promise<{ ok: boolean; mensaje: string; codigo?: string }>
  revocarInvitacion: (id: string) => Promise<void>
  eliminarInvitacion: (id: string) => Promise<void>
  listarInvitaciones: () => Promise<Invitacion[]>
  listarVinculados: () => Promise<InvitadoVinculado[]>
  expulsarInvitado: (id: string) => Promise<void>
  desvincularme: () => Promise<void>
}

const UsuarioContexto = createContext<UsuarioContextoValor | null>(null)

export function UsuarioProveedor({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)
  const [prefiereClaro, setPrefiereClaro] = useState<boolean>(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: light)').matches
      : false
  )

  // Escuchamos cambios en vivo del sistema
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = (e: MediaQueryListEvent) => setPrefiereClaro(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  async function cargar() {
    setCargando(true)

    const { data: sesion } = await supabase.auth.getSession()
    const authUser = sesion.session?.user

    if (!authUser) {
      setUsuario(null)
      setCargando(false)
      return
    }

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

    if (authUser.is_anonymous) {
      setUsuario(null)
      setCargando(false)
      return
    }

    const nuevo: Partial<Usuario> = {
      id: authUser.id,
      email: authUser.email ?? '',
      nombre: authUser.email?.split('@')[0] ?? 'Usuario',
      rol: 'usuario',
      tema: 'auto',
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

  function generarCodigo(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let c1 = ''
    let c2 = ''
    for (let i = 0; i < 4; i++) {
      c1 += chars[Math.floor(Math.random() * chars.length)]
      c2 += chars[Math.floor(Math.random() * chars.length)]
    }
    return `DAS-${c1}-${c2}`
  }

  async function crearInvitacion(nombreInvitado: string) {
    if (!usuario) return { ok: false, mensaje: 'No autenticado' }
    const codigo = generarCodigo()

    const { error } = await supabase.from('invitacion').insert({
      id_propietario: usuario.id,
      codigo,
      nombre_invitado: nombreInvitado.trim() || null,
    })

    if (error) return { ok: false, mensaje: error.message }
    return { ok: true, mensaje: 'Invitación creada', codigo }
  }

  async function revocarInvitacion(id: string) {
    const { error } = await supabase
      .from('invitacion')
      .update({ revocada: true })
      .eq('id', id)
    if (error) throw error
  }

  async function eliminarInvitacion(id: string) {
    const { error } = await supabase.from('invitacion').delete().eq('id', id)
    if (error) throw error
  }

  async function listarInvitaciones(): Promise<Invitacion[]> {
    if (!usuario) return []
    const { data, error } = await supabase
      .from('invitacion')
      .select('*')
      .eq('id_propietario', usuario.id)
      .order('creada_en', { ascending: false })

    if (error) return []
    return (data ?? []) as Invitacion[]
  }

  async function listarVinculados(): Promise<InvitadoVinculado[]> {
    if (!usuario) return []
    const { data, error } = await supabase
      .from('usuario')
      .select('id, nombre, avatar_url, creado_en')
      .eq('invitado_de', usuario.id)
      .order('creado_en', { ascending: false })

    if (error) return []
    return (data ?? []) as InvitadoVinculado[]
  }

  async function expulsarInvitado(id: string) {
    const { error } = await supabase.from('usuario').delete().eq('id', id)
    if (error) throw error
  }

  async function desvincularme() {
    if (!usuario) return
    await supabase.from('usuario').delete().eq('id', usuario.id)
    await supabase.auth.signOut()
    window.location.reload()
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

  // Aplicar el tema al documento
  useEffect(() => {
    const temaUsuario = usuario?.tema ?? 'auto'
    let temaAplicar: string

    if (temaUsuario === 'auto') {
      temaAplicar = prefiereClaro ? 'claro' : 'negro'
    } else {
      temaAplicar = temaUsuario
    }

    document.documentElement.setAttribute('data-tema', temaAplicar)
  }, [usuario?.tema, prefiereClaro])

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
        crearInvitacion,
        revocarInvitacion,
        eliminarInvitacion,
        listarInvitaciones,
        listarVinculados,
        expulsarInvitado,
        desvincularme,
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
