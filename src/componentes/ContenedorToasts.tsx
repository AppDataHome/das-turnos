import { useState, useEffect } from 'react'
import { Check, X, Info, AlertTriangle } from 'lucide-react'
import { useToast, type Toast } from '../contexto/ToastContexto'

export default function ContenedorToasts() {
  const { toasts, cerrar } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="contenedor-toasts">
      {toasts.map((t) => (
        <ItemToast key={t.id} toast={t} onCerrar={() => cerrar(t.id)} />
      ))}
    </div>
  )
}

// ─────────── Item individual de toast ───────────

function ItemToast({
  toast: t,
  onCerrar,
}: {
  toast: Toast
  onCerrar: () => void
}) {
  const [restante, setRestante] = useState(t.duracion)
  const [porcentaje, setPorcentaje] = useState(100)

  // Actualizar la barra de progreso
  useEffect(() => {
    if (t.duracion <= 0) return

    const intervalo = setInterval(() => {
      const transcurrido = Date.now() - t.creadoEn
      const rest = Math.max(0, t.duracion - transcurrido)
      setRestante(rest)
      setPorcentaje((rest / t.duracion) * 100)
    }, 50)

    return () => clearInterval(intervalo)
  }, [t.duracion, t.creadoEn])

  const segundosRestantes = Math.ceil(restante / 1000)

  return (
    <div className={`toast toast-${t.tipo}`}>
      <div className="toast-contenido">
        <div className="toast-icono">
          {t.tipo === 'exito' && <Check size={16} />}
          {t.tipo === 'error' && <X size={16} />}
          {t.tipo === 'info' && <Info size={16} />}
          {t.tipo === 'aviso' && <AlertTriangle size={16} />}
        </div>

        <div className="toast-texto">{t.texto}</div>

        {t.accion && (
          <button
            className="toast-accion"
            onClick={() => {
              t.accion!.onClick()
              onCerrar()
            }}
            title={`Tienes ${segundosRestantes}s para deshacer`}
          >
            {t.accion.etiqueta}
            {t.duracion > 0 && (
              <span className="toast-accion-tiempo">{segundosRestantes}s</span>
            )}
          </button>
        )}

        <button className="toast-cerrar" onClick={onCerrar} aria-label="Cerrar">
          <X size={14} />
        </button>
      </div>

      {/* Barra de progreso */}
      {t.duracion > 0 && (
        <div className="toast-progreso">
          <div
            className="toast-progreso-barra"
            style={{ width: `${porcentaje}%` }}
          />
        </div>
      )}
    </div>
  )
}
