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
  recargar: () => Promise<void>
  actualizarPerfil: (cambios: Partial<Usuario>) => Promise<void>
  cambiarTema: (tema: Tema) => Promise<void>
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

    // Buscar el perfil en la tabla usuario
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

  useEffect(() => {
    cargar()

    // Escuchar cambios de sesión (login/logout)
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      cargar()
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [])

  // Aplicar el tema al <html> para que afecte a todo el CSS
  useEffect(() => {
    const tema = usuario?.tema ?? 'negro'
    document.documentElement.setAttribute('data-tema', tema)
  }, [usuario?.tema])

  return (
    <UsuarioContexto.Provider
      value={{ usuario, cargando, recargar: cargar, actualizarPerfil, cambiarTema }}
    >
      {children}
    </UsuarioContexto.Provider>
  )
}

// ─────────── Hook para usar el contexto ───────────
export function useUsuario() {
  const ctx = useContext(UsuarioContexto)
  if (!ctx) throw new Error('useUsuario debe usarse dentro de UsuarioProveedor')
  return ctx
}
