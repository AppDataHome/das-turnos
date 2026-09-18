import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'

export type TipoToast = 'exito' | 'error' | 'info' | 'aviso'

export interface Toast {
  id: string
  tipo: TipoToast
  texto: string
  duracion: number
}

interface ToastContextoValor {
  toasts: Toast[]
  exito: (texto: string, duracion?: number) => void
  error: (texto: string, duracion?: number) => void
  info: (texto: string, duracion?: number) => void
  aviso: (texto: string, duracion?: number) => void
  cerrar: (id: string) => void
}

const ToastContexto = createContext<ToastContextoValor | null>(null)

export function ToastProveedor({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const cerrar = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const añadir = useCallback(
    (tipo: TipoToast, texto: string, duracion = 3500) => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, tipo, texto, duracion }])
      if (duracion > 0) {
        setTimeout(() => cerrar(id), duracion)
      }
    },
    [cerrar]
  )

  const exito = useCallback(
    (texto: string, duracion?: number) => añadir('exito', texto, duracion),
    [añadir]
  )
  const error = useCallback(
    (texto: string, duracion?: number) => añadir('error', texto, duracion),
    [añadir]
  )
  const info = useCallback(
    (texto: string, duracion?: number) => añadir('info', texto, duracion),
    [añadir]
  )
  const aviso = useCallback(
    (texto: string, duracion?: number) => añadir('aviso', texto, duracion),
    [añadir]
  )

  return (
    <ToastContexto.Provider
      value={{ toasts, exito, error, info, aviso, cerrar }}
    >
      {children}
    </ToastContexto.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContexto)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProveedor')
  return ctx
}
