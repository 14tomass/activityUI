import { dashboardOverview } from '../../../mocks/dashboard'

const calendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
    <path
      d="M12 7.5V12L15.5 14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const chevronLeftIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path
      d="M14.5 6.5L9 12l5.5 5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const chevronRightIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path
      d="M9.5 6.5L15 12l-5.5 5.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const menuIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path
      d="M7 8.5H17M7 12H17M7 15.5H17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
)

function WelcomeHero() {
  return (
    <section className="relative flex w-full max-w-[1180px] justify-center">
      <div className="w-full max-w-[540px] px-4 text-center sm:px-0">
        <div className="mx-auto flex w-full max-w-[318px] items-center rounded-full bg-white p-1.5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          {dashboardOverview.timeRanges.map((range) => (
            <button
              key={range.id}
              type="button"
              className={`flex-1 rounded-full px-5 py-3 text-sm font-semibold transition ${
                range.active
                  ? 'bg-[#1877f2] text-white shadow-[0_8px_16px_rgba(24,119,242,0.35)]'
                  : 'text-slate-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-center justify-center gap-4 text-slate-400">
          <span>{calendarIcon}</span>
          <div className="flex min-w-[184px] items-center justify-between rounded-full bg-white px-5 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <button type="button" aria-label="Fecha anterior" className="text-slate-400">
              {chevronLeftIcon}
            </button>
            <span className="text-base font-semibold text-slate-800">
              {dashboardOverview.selectedDateLabel}
            </span>
            <button type="button" aria-label="Fecha siguiente" className="text-slate-400">
              {chevronRightIcon}
            </button>
          </div>
        </div>

        <div className="mt-10">
          <h1 className="text-[4.25rem] font-semibold leading-none tracking-[-0.08em] text-slate-900 sm:text-[5.4rem]">
            {dashboardOverview.totalUsage}
          </h1>
          <p className="mt-5 text-[1.7rem] font-medium tracking-[-0.03em] text-slate-400">
            Tiempo total de uso hoy
          </p>
        </div>
      </div>

      <button
        type="button"
        aria-label="Abrir configuracion"
        className="absolute right-0 top-[7.25rem] flex h-13 w-13 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_14px_30px_rgba(15,23,42,0.1)] transition hover:text-slate-900"
      >
        {menuIcon}
      </button>
    </section>
  )
}

export default WelcomeHero
