import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'

interface OpcionesConfirmacion {
  titulo: string
  mensaje?: string
  textoConfirmar?: string
  textoCancelar?: string
  peligro?: boolean
}

interface EstadoConfirmacion extends OpcionesConfirmacion {
  resolver: (valor: boolean) => void
}

interface ConfirmacionContextoValor {
  estado: EstadoConfirmacion | null
  confirmar: (opciones: OpcionesConfirmacion) => Promise<boolean>
  aceptar: () => void
  cancelar: () => void
}

const ConfirmacionContexto = createContext<ConfirmacionContextoValor | null>(
  null
)

export function ConfirmacionProveedor({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<EstadoConfirmacion | null>(null)

  const confirmar = useCallback(
    (opciones: OpcionesConfirmacion): Promise<boolean> => {
      return new Promise((resolve) => {
        setEstado({ ...opciones, resolver: resolve })
      })
    },
    []
  )

  const aceptar = useCallback(() => {
    if (!estado) return
    estado.resolver(true)
    setEstado(null)
  }, [estado])

  const cancelar = useCallback(() => {
    if (!estado) return
    estado.resolver(false)
    setEstado(null)
  }, [estado])

  return (
    <ConfirmacionContexto.Provider
      value={{ estado, confirmar, aceptar, cancelar }}
    >
      {children}
    </ConfirmacionContexto.Provider>
  )
}

export function useConfirmacion() {
  const ctx = useContext(ConfirmacionContexto)
  if (!ctx) {
    throw new Error(
      'useConfirmacion debe usarse dentro de ConfirmacionProveedor'
    )
  }
  return ctx
}
