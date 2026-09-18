interface Props {
  width?: number | string
  height?: number | string
  radius?: number | string
  style?: React.CSSProperties
}

export default function Skeleton({
  width = '100%',
  height = 14,
  radius = 6,
  style,
}: Props) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius: radius,
        ...style,
      }}
    />
  )
}

// ─────────── Skeletons específicos ───────────

export function SkeletonTarjetas() {
  return (
    <div className="grid-tarjetas">
      {[1, 2, 3].map((i) => (
        <div key={i} className="card">
          <Skeleton width="50%" height={10} style={{ marginBottom: 12 }} />
          <Skeleton
            width="100%"
            height={70}
            radius={10}
            style={{ marginBottom: 10 }}
          />
          <Skeleton width="80%" height={12} style={{ margin: '0 auto 6px' }} />
          <Skeleton width="60%" height={12} style={{ margin: '0 auto' }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonCalendario() {
  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 14,
        }}
      >
        <Skeleton width={30} height={30} radius={8} />
        <Skeleton width={180} height={30} radius={8} />
        <Skeleton width={50} height={30} radius={8} />
        <Skeleton width={30} height={30} radius={8} />
      </div>

      <div className="rejilla-mes" style={{ marginBottom: 6 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} height={12} width="70%" style={{ margin: '0 auto' }} />
        ))}
      </div>

      <div className="rejilla-mes">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} height={44} radius={5} />
        ))}
      </div>
    </div>
  )
}

export function SkeletonLista({ filas = 4 }: { filas?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: filas }).map((_, i) => (
        <div
          key={i}
          className="item-lista"
          style={{ minHeight: 60 }}
        >
          <Skeleton width="40%" height={12} />
          <Skeleton width="80%" height={10} />
          <Skeleton width="30%" height={20} radius={6} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonPanelDia() {
  return (
    <div className="card">
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Skeleton width="40%" height={16} />
        <Skeleton width={60} height={16} radius={10} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton height={50} radius={8} />
        <Skeleton height={50} radius={8} />
      </div>
    </div>
  )
}
