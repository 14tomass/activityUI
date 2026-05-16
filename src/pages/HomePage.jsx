import AppShell from '../components/layout/AppShell'
import WelcomeHero from '../features/dashboard/components/WelcomeHero'
import { getActivityWatchApiBaseUrl } from '../lib/api/activitywatch'

function HomePage() {
  return (
    <AppShell>
      <header className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Local-first analytics
          </p>
          <p className="mt-2 text-lg font-semibold text-white">activityUI</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          API objetivo: {getActivityWatchApiBaseUrl()}
        </div>
      </header>

      <main className="flex flex-1 items-center py-12">
        <WelcomeHero />
      </main>

      <footer className="border-t border-white/10 py-6 text-sm text-slate-400">
        Proyecto inicial listo. Las consultas reales a ActivityWatch se
        implementaran en la siguiente fase.
      </footer>
    </AppShell>
  )
}

export default HomePage
