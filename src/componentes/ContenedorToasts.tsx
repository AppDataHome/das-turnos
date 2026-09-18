import { Check, X, Info, AlertTriangle } from 'lucide-react'
import { useToast } from '../contexto/ToastContexto'

export default function ContenedorToasts() {
  const { toasts, cerrar } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="contenedor-toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tipo}`}>
          <div className="toast-icono">
            {t.tipo === 'exito' && <Check size={16} />}
            {t.tipo === 'error' && <X size={16} />}
            {t.tipo === 'info' && <Info size={16} />}
            {t.tipo === 'aviso' && <AlertTriangle size={16} />}
          </div>
          <div className="toast-texto">{t.texto}</div>
          <button
            className="toast-cerrar"
            onClick={() => cerrar(t.id)}
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
