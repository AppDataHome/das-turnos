import { AlertTriangle, X } from 'lucide-react'
import { useConfirmacion } from '../contexto/ConfirmacionContexto'

export default function ContenedorConfirmacion() {
  const { estado, aceptar, cancelar } = useConfirmacion()

  if (!estado) return null

  const {
    titulo,
    mensaje,
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Cancelar',
    peligro = false,
  } = estado

  return (
    <div className="modal-fondo" onClick={cancelar}>
      <div
        className="modal-ventana"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 400 }}
      >
        <div className="confirmacion-icono">
          <AlertTriangle size={26} />
        </div>

        <h3 className="confirmacion-titulo">{titulo}</h3>

        {mensaje && <p className="confirmacion-mensaje">{mensaje}</p>}

        <div className="confirmacion-acciones">
          <button className="btn btn-secondary" onClick={cancelar}>
            {textoCancelar}
          </button>
          <button
            className={`btn ${peligro ? 'btn-danger' : 'btn-primary'}`}
            onClick={aceptar}
            autoFocus
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
