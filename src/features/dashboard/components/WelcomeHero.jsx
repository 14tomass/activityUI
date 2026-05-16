const statusItems = [
  { label: 'Fuente de datos', value: 'API local de ActivityWatch' },
  { label: 'Estado actual', value: 'Frontend base listo' },
  { label: 'Siguiente paso', value: 'Conectar vistas y metricas' },
]

function WelcomeHero() {
  return (
    <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-cyan-200">
          ActivityWatch UI
        </div>

        <div className="space-y-4">
          <h1 className="max-w-3xl font-sans text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Visualiza tu actividad local con una interfaz moderna y clara.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Esta aplicacion sera un frontend independiente para explorar los datos
            recogidos por ActivityWatch sin reemplazar su funcionamiento local.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-slate-200">
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            React
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            Vite
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            Tailwind CSS
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">
            JavaScript
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-cyan-950/30 backdrop-blur">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-200">Estado del proyecto</p>
            <p className="text-sm text-slate-400">Base inicial preparada para escalar</p>
          </div>
          <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(74,222,128,0.9)]" />
        </div>

        <div className="space-y-3">
          {statusItems.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-slate-900/60 px-4 py-3"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-100">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WelcomeHero
