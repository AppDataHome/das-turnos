import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface Props {
  valor: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  minLength?: number
  autoComplete?: string
  id?: string
}

export default function CampoPassword({
  valor,
  onChange,
  placeholder,
  required,
  minLength,
  autoComplete,
  id,
}: Props) {
  const [visible, setVisible] = useState(false)

  return (
    <div style={{ position: 'relative', marginBottom: 8 }}>
      <input
        id={id}
        className="input"
        type={visible ? 'text' : 'password'}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        style={{ marginBottom: 0, paddingRight: 42 }}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={{
          position: 'absolute',
          right: 4,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          color: 'var(--texto-suave)',
          cursor: 'pointer',
          padding: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
        }}
        onMouseDown={(e) => e.preventDefault()}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
}
