import AppShell from '../components/layout/AppShell'
import WelcomeHero from '../features/dashboard/components/WelcomeHero'

function HomePage() {
  return (
    <AppShell>
      <main className="flex flex-1 justify-center pt-4 pb-14 lg:pt-8 lg:pb-20">
        <WelcomeHero />
      </main>
    </AppShell>
  )
}

export default HomePage
