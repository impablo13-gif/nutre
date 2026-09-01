// Donut de macros: 3 arcos (proteína / carbohidrato / grasa) con el total de
// kcal en el centro. SVG puro, sin librerías.

const COLORS = {
  proteina: 'var(--accent-2)',
  carbo: 'var(--carbo)',
  grasa: 'var(--accent)',
}

export default function MacroDonut({ proteina = 0, carbo = 0, grasa = 0, kcal, size = 120, strokeWidth = 14, label }) {
  const total = proteina + carbo + grasa
  const r = (size - strokeWidth) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  const segments = [
    { key: 'proteina', value: proteina, color: COLORS.proteina },
    { key: 'carbo', value: carbo, color: COLORS.carbo },
    { key: 'grasa', value: grasa, color: COLORS.grasa },
  ]

  let offsetAcc = 0
  const kcalTotal = kcal != null ? kcal : Math.round(proteina * 4 + carbo * 4 + grasa * 9)

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface-soft)" strokeWidth={strokeWidth} />
        {total > 0 &&
          segments.map((seg) => {
            if (seg.value <= 0) return null
            const frac = seg.value / total
            const dash = frac * circumference
            const gap = circumference - dash
            const dashoffset = -offsetAcc
            offsetAcc += dash
            return (
              <circle
                key={seg.key}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={dashoffset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            )
          })}
        <text x={cx} y={cy - 3} textAnchor="middle" fontSize={size * 0.18} fontWeight="800" fill="var(--text)">
          {kcalTotal}
        </text>
        <text x={cx} y={cy + size * 0.14} textAnchor="middle" fontSize={size * 0.09} fontWeight="600" fill="var(--text-dim)">
          kcal
        </text>
      </svg>
      {label && <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-dim)' }}>{label}</div>}
    </div>
  )
}

export function MacroLegend({ proteina = 0, carbo = 0, grasa = 0 }) {
  return (
    <div className="row wrap gap" style={{ fontSize: 11.5, fontWeight: 600 }}>
      <span className="row gap-sm"><span style={{ width: 9, height: 9, borderRadius: 3, background: COLORS.proteina, display: 'inline-block' }} /> Proteína {proteina}g</span>
      <span className="row gap-sm"><span style={{ width: 9, height: 9, borderRadius: 3, background: COLORS.carbo, display: 'inline-block' }} /> Carbo {carbo}g</span>
      <span className="row gap-sm"><span style={{ width: 9, height: 9, borderRadius: 3, background: COLORS.grasa, display: 'inline-block' }} /> Grasa {grasa}g</span>
    </div>
  )
}
