'use client'

interface ScoreRingProps {
  score: number
  size?: 'sm' | 'lg'
}

function scoreColor(score: number): string {
  if (score >= 7.5) return '#059669'
  if (score >= 5) return '#d97706'
  return '#dc2626'
}

function scoreLabel(score: number): string {
  if (score >= 8) return 'Excelente'
  if (score >= 6.5) return 'Boa'
  if (score >= 5) return 'Ok'
  return 'Fraca'
}

export default function ScoreRing({ score, size = 'sm' }: ScoreRingProps) {
  const isLarge = size === 'lg'
  const radius = isLarge ? 28 : 22
  const stroke = isLarge ? 5 : 4
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(score / 10, 1)
  const dashOffset = circumference * (1 - progress)
  const color = scoreColor(score)
  const svgSize = (radius + stroke) * 2

  return (
    <div className={`flex flex-col items-center gap-1 shrink-0`}>
      <div className="relative">
        <svg width={svgSize} height={svgSize} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={stroke}
          />
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <span
          className={`absolute inset-0 flex items-center justify-center font-bold ${isLarge ? 'text-xl' : 'text-sm'}`}
          style={{ color }}
        >
          {score.toFixed(1)}
        </span>
      </div>
      <span className={`text-slate-400 ${isLarge ? 'text-xs' : 'text-[10px]'}`}>
        {scoreLabel(score)}
      </span>
    </div>
  )
}
