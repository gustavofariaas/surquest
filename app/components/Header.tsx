import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🌊</span>
          <span className="font-bold text-slate-900 text-lg tracking-tight">SurQuest</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/spots"
            className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            Spots
          </Link>
          <Link
            href="/"
            className="text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Surfar agora
          </Link>
        </nav>
      </div>
    </header>
  )
}
