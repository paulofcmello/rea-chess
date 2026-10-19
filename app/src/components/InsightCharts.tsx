import { useState } from 'react'
import { RESULT_COLORS } from '../lib/insightsStore'

export interface ChartPoint { label: string; value: number; detail?: string; color?: string }
export interface ChartSeries { label: string; color: string; points: ChartPoint[] }
const number = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 1 })

export function LineChart({ series, unit = '', percent = false, zero = false }: { series: ChartSeries[]; unit?: string; percent?: boolean; zero?: boolean }) {
  const [tip, setTip] = useState('')
  const points = series.flatMap(s => s.points)
  if (!points.length) return <p className="insights-no-data">No data for this chart yet.</p>
  const labels = [...new Set(points.map(p => p.label))].sort()
  const values = points.map(p => p.value)
  const min = percent || zero ? 0 : Math.floor(Math.min(...values) / 10) * 10 - 10
  const max = percent ? 100 : Math.ceil(Math.max(...values) / 10) * 10 + 10
  const dates = labels.map(label => new Date(`${label}T12:00:00`).getTime())
  const first = dates[0]
  const span = dates[dates.length - 1] - first
  const x = (label: string) => span === 0 ? 325 : 52 + (dates[labels.indexOf(label)] - first) / span * 530
  const y = (value: number) => 178 - (value - min) / (max - min) * 152
  return <div className="insights-chart-wrap">
    <div className="insights-legend">{series.map(s => <span key={s.label}><i style={{ background: s.color }} />{s.label}</span>)}</div>
    <svg className="insights-chart" viewBox="0 0 610 225" role="img" aria-label={`${unit || 'Value'} over time`}>
      {[0, 0.5, 1].map(f => { const value = min + (max - min) * f; return <g key={f}><line x1="52" x2="582" y1={y(value)} y2={y(value)} className="insights-gridline" /><text x="44" y={y(value) + 4} textAnchor="end">{number(value)}{percent ? '%' : ''}</text></g> })}
      {series.map(s => <g key={s.label}>
        <polyline fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" points={s.points.map(p => `${x(p.label)},${y(p.value)}`).join(' ')} />
        {s.points.map((p, i) => { const label = `${p.label} · ${s.label}: ${number(p.value)}${unit} ${p.detail ?? ''}`; return <circle key={i} cx={x(p.label)} cy={y(p.value)} r="4" fill={s.color} tabIndex={0} aria-label={label} onMouseEnter={() => setTip(label)} onMouseLeave={() => setTip('')} onFocus={() => setTip(label)} onBlur={() => setTip('')}><title>{label}</title></circle> })}
      </g>)}
      {labels.filter((_, i) => i === 0 || i === labels.length - 1 || (labels.length > 4 && i === Math.floor(labels.length / 2))).map(label => <text key={label} x={x(label)} y="205" textAnchor="middle">{label}</text>)}
    </svg>
    {tip && <div className="insights-tooltip" role="tooltip">{tip}</div>}
  </div>
}

export function BarChart({ points, unit = '', max: suppliedMax }: { points: ChartPoint[]; unit?: string; max?: number }) {
  const [tip, setTip] = useState('')
  if (!points.length) return <p className="insights-no-data">No data for this chart yet.</p>
  const rawMax = Math.max(1, ...points.map(p => p.value))
  const max = suppliedMax ?? (unit ? rawMax : Math.ceil(rawMax / 2) * 2)
  const rowHeight = 46
  const lines = (label: string) => {
    const words = label.split(' ')
    const rows = ['']
    for (const word of words) {
      if ((rows[rows.length - 1] + ' ' + word).trim().length > 17 && rows[rows.length - 1]) rows.push(word)
      else rows[rows.length - 1] = (rows[rows.length - 1] + ' ' + word).trim()
    }
    return rows
  }
  const labelWidth = 164
  return <div className="insights-chart-wrap insights-bars">
    <svg className="insights-chart" viewBox={`0 0 610 ${points.length * rowHeight + 36}`} role="img" aria-label={`Comparison${unit ? ` (${unit.trim()})` : ''}`}>
      {[0, 0.5, 1].map(f => <g key={f}><line x1={labelWidth + f * 375} x2={labelWidth + f * 375} y1="4" y2={points.length * rowHeight} className="insights-gridline" /><text x={labelWidth + f * 375} y={points.length * rowHeight + 22} textAnchor="middle">{number(f * max)}{unit}</text></g>)}
      {points.map((p, i) => { const label = `${p.label}: ${number(p.value)}${unit}${p.detail ? ` · ${p.detail}` : ''}`; return <g key={p.label} tabIndex={0} aria-label={label} onMouseEnter={() => setTip(label)} onMouseLeave={() => setTip('')} onFocus={() => setTip(label)} onBlur={() => setTip('')}>
        <title>{label}</title><text x={labelWidth - 12} y={i * rowHeight + 26 - (lines(p.label).length - 1) * 9} textAnchor="end">{lines(p.label).map((line, n) => <tspan key={n} x={labelWidth - 12} dy={n ? 18 : 0}>{line}</tspan>)}</text>
        <rect x={labelWidth} y={i * rowHeight + 7} width={Math.max(p.value > 0 ? 2 : 0, p.value / max * 375)} height="23" rx="3" fill={p.color ?? '#81b64c'} />
        <text x="602" y={i * rowHeight + 26} textAnchor="end">{number(p.value)}{unit}</text>
      </g> })}
    </svg>
    {tip && <div className="insights-tooltip" role="tooltip">{tip}</div>}
  </div>
}

export function ResultBar({ win, draw, loss }: { win: number; draw: number; loss: number }) {
  const total = win + draw + loss
  return <svg className="insights-result-bar" viewBox="0 0 100 8" preserveAspectRatio="none" role="img" aria-label={`${win} wins, ${draw} draws, ${loss} losses`}>
    <title>{win} wins · {draw} draws · {loss} losses</title>
    {total ? (['win', 'draw', 'loss'] as const).map((key, i) => { const values = [win, draw, loss]; return <rect key={key} x={values.slice(0, i).reduce((a, b) => a + b, 0) / total * 100} y="0" width={values[i] / total * 100} height="8" fill={RESULT_COLORS[key]} /> }) : <rect width="100" height="8" fill="#45433f" />}
  </svg>
}

export function ResultDonut({ win, draw, loss }: { win: number; draw: number; loss: number }) {
  const [tip, setTip] = useState('')
  const total = win + draw + loss
  const circumference = 2 * Math.PI * 72
  const values = [win, draw, loss]
  return <div className="insights-donut-wrap">
    <svg className="insights-donut" viewBox="0 0 210 210" role="img" aria-label={`${total} games: ${win} won, ${draw} drawn, ${loss} lost`}>
      <circle cx="105" cy="105" r="72" fill="none" stroke="#45433f" strokeWidth="27" />
      {total > 0 && (['win', 'draw', 'loss'] as const).map((key, i) => { const label = `${values[i]} ${key === 'win' ? 'won' : key === 'draw' ? 'drawn' : 'lost'} (${number(values[i] / total * 100)}%)`; return values[i] > 0 && <circle key={key} cx="105" cy="105" r="72" fill="none" stroke={RESULT_COLORS[key]} strokeWidth="27" strokeDasharray={`${values[i] / total * circumference} ${circumference}`} strokeDashoffset={-values.slice(0, i).reduce((a, b) => a + b, 0) / total * circumference} transform="rotate(-90 105 105)" tabIndex={0} aria-label={label} onMouseEnter={() => setTip(label)} onMouseLeave={() => setTip('')} onFocus={() => setTip(label)} onBlur={() => setTip('')}><title>{label}</title></circle> })}
      <text x="105" y="105" textAnchor="middle" className="insights-donut-number">{number(total)}</text><text x="105" y="128" textAnchor="middle">Games played</text>
    </svg>
    <div className="insights-donut-legend">{(['win', 'draw', 'loss'] as const).map((key, i) => <div key={key}><i style={{ background: RESULT_COLORS[key] }} /><strong>{total ? number(values[i] / total * 100) : 0}%</strong><span>{number(values[i])} {key === 'win' ? 'Won' : key === 'draw' ? 'Drawn' : 'Lost'}</span></div>)}</div>
    {tip && <div className="insights-tooltip" role="tooltip">{tip}</div>}
  </div>
}
