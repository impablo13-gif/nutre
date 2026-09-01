// Gráfico de líneas simple, dibujado a mano en SVG, sin librerías externas.

export default function LineChart({ points, width = 300, height = 120, color = 'var(--accent)', unit = '' }) {
  if (!points || points.length === 0) {
    return <div className="empty-state" style={{ padding: '20px 0' }}>Sin datos todavía.</div>
  }
  const pad = 24
  const values = points.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0

  const coords = points.map((p, i) => {
    const x = pad + i * stepX
    const y = pad + (1 - (p.value - min) / range) * (height - pad * 2)
    return { x, y, ...p }
  })

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ')
  const areaPath = `${path} L${coords[coords.length - 1].x.toFixed(1)},${height - pad} L${coords[0].x.toFixed(1)},${height - pad} Z`

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <path d={areaPath} fill={color} opacity="0.1" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {coords.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="3" fill={color} />
      ))}
      {coords.map((c, i) => (
        <text key={'l' + i} x={c.x} y={height - 4} textAnchor="middle" fontSize="9" fill="var(--text-dim)">
          {c.label}
        </text>
      ))}
      <text x={pad} y={pad - 8} fontSize="10" fill="var(--text-dim)">{max}{unit}</text>
      <text x={pad} y={height - pad + 12} fontSize="10" fill="var(--text-dim)">{min}{unit}</text>
    </svg>
  )
}
