const GAUGE_DATA = [
  { key: 'pendencia',    label: 'Pendência',  cor: '#EF9F27' },
  { key: 'saida',        label: 'Em saída',   cor: '#9080dd' },
  { key: 'entrega',      label: 'Entregues',  cor: '#639922' },
  { key: 'cancelamento', label: 'Cancelados', cor: '#E24B4A' },
]

function polarToCart(cx, cy, r, angle) {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)]
}

function makeArc(cx, cy, outerR, innerR, startA, endA) {
  const [ox1, oy1] = polarToCart(cx, cy, outerR, startA)
  const [ox2, oy2] = polarToCart(cx, cy, outerR, endA)
  const [ix1, iy1] = polarToCart(cx, cy, innerR, endA)
  const [ix2, iy2] = polarToCart(cx, cy, innerR, startA)
  const large = endA - startA > Math.PI ? 1 : 0
  return `M ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${large} 1 ${ox2} ${oy2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`
}

export default function GaugeDashboard({ stats, hovered, setHovered }) {
  const cx = 130, cy = 145, outerR = 125, innerR = 78
  const total = (stats.pendencia + stats.saida + stats.entrega + stats.cancelamento) || 1
  let currentAngle = Math.PI

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6">
      <svg width="320" height="190" viewBox="0 0 260 155" overflow="visible">
        {GAUGE_DATA.map(d => {
          const sweep = (stats[d.key] / total) * Math.PI
          const endA = currentAngle + sweep
          const path = makeArc(cx, cy, outerR, innerR, currentAngle + 0.015, endA - 0.015)
          currentAngle = endA
          const isHov = hovered === d.key
          const isDim = hovered && hovered !== d.key
          return (
            <path
              key={d.key}
              d={path}
              fill={d.cor}
              opacity={isDim ? 0.2 : 1}
              transform={isHov ? 'translate(0,-6)' : ''}
              style={{ transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', cursor: 'default' }}
              onMouseEnter={() => setHovered(d.key)}
              onMouseLeave={() => setHovered(null)}
            />
          )
        })}
        <text x={cx} y={cy - 10} textAnchor="middle" fontSize="28" fontWeight="500" fill="white">
          {stats.total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="12" fill="#9CA3AF">
          produtos
        </text>
      </svg>

      <div className="flex flex-col gap-3">
        {GAUGE_DATA.map(d => {
          const isHov = hovered === d.key
          const isDim = hovered && hovered !== d.key
          return (
            <div
              key={d.key}
              onMouseEnter={() => setHovered(d.key)}
              onMouseLeave={() => setHovered(null)}
              style={{ opacity: isDim ? 0.3 : 1, transition: 'opacity 0.2s' }}
              className="flex items-center gap-2 text-sm cursor-default"
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.cor, flexShrink: 0 }} />
              <span className="text-gray-400">{d.label}:</span>
              <span className="text-white font-medium">{stats[d.key]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}