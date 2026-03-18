'use client'

interface ScoreRingProps {
  score: number
  size?: 'sm' | 'lg'
}

function scoreColor(score: number): string {
  if (score >= 7.5) return 'text-emerald-600'
  if (score >= 5) return 'text-amber-500'
  return 'text-red-500'
}

function scoreLabel(score: number): string {
  if (score >= 8) return 'Excelente'
  if (score >= 6.5) return 'Boa'
  if (score >= 5) return 'Ok'
  return 'Fraca'
}

export default function ScoreRing({ score, size = 'sm' }: ScoreRingProps) {
  const isLarge = size === 'lg'

  return (
    <div className={`flex flex-col items-center ${isLarge ? 'gap-1' : 'gap-0.5'}`}>
      <span className={`font-bold ${scoreColor(score)} ${isLarge ? 'text-4xl' : 'text-2xl'}`}>
        {score.toFixed(1)}
      </span>
      <span className={`text-slate-500 ${isLarge ? 'text-sm' : 'text-xs'}`}>
        {scoreLabel(score)}
      </span>
    </div>
  )
}
