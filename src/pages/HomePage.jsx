import AppShell from '../components/layout/AppShell'
import WelcomeHero from '../features/dashboard/components/WelcomeHero'

function HomePage() {
  return (
    <AppShell>
      <main className="flex flex-1 items-center justify-center py-8 lg:py-14">
        <WelcomeHero />
      </main>
    </AppShell>
  )
}

export default HomePage
