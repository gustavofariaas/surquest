import RecommendForm from './components/RecommendForm'

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-12">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SurQuest</h1>
          <p className="mt-2 text-slate-500 text-lg">Onde vale a pena surfar agora, perto de você?</p>
        </div>

        <RecommendForm />
      </div>
    </main>
  )
}
