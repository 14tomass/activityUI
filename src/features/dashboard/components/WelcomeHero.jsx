import { dashboardOverview } from '../../../mocks/dashboard'

const calendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]">
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
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
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
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
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
      <div className="w-full max-w-[552px] px-4 text-center sm:px-0">
        <div className="mx-auto flex w-full max-w-[296px] items-center rounded-full bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
          {dashboardOverview.timeRanges.map((range) => (
            <button
              key={range.id}
              type="button"
              className={`flex-1 rounded-full px-4 py-2.5 text-[0.88rem] font-semibold transition ${
                range.active
                  ? 'bg-[#1877f2] text-white shadow-[0_8px_16px_rgba(24,119,242,0.35)]'
                  : 'text-slate-700'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3 text-slate-400">
          <span>{calendarIcon}</span>
          <div className="flex min-w-[172px] items-center justify-between rounded-full bg-white px-4 py-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <button type="button" aria-label="Fecha anterior" className="text-slate-400">
              {chevronLeftIcon}
            </button>
            <span className="text-[0.96rem] font-semibold text-slate-800">
              {dashboardOverview.selectedDateLabel}
            </span>
            <button type="button" aria-label="Fecha siguiente" className="text-slate-400">
              {chevronRightIcon}
            </button>
          </div>
        </div>

        <div className="mt-7">
          <h1 className="text-[3.75rem] font-semibold leading-none tracking-[-0.07em] text-slate-900 sm:text-[4.9rem]">
            {dashboardOverview.totalUsage}
          </h1>
          <p className="mt-4 text-[1.32rem] font-normal tracking-[-0.02em] text-slate-500/80">
            Tiempo total de uso hoy
          </p>
        </div>

        <div className="mt-9 rounded-[22px] bg-white px-6 py-6 text-left shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <h2 className="text-[1.72rem] font-semibold tracking-[-0.02em] text-slate-800">
            Uso por horas
          </h2>

          <div className="mt-6 grid grid-cols-[38px_1fr] gap-4">
            <div className="flex flex-col justify-between text-[0.8rem] text-slate-400">
              <span>1m</span>
              <span>1m</span>
              <span>1m</span>
              <span>1m</span>
              <span>1m</span>
            </div>

            <div className="flex flex-col">
              <div className="flex h-[162px] items-end gap-[7px]">
                {dashboardOverview.hourlyUsage.map((item) => (
                  <div
                    key={item.hour}
                    className={`w-3.5 rounded-t-[10px] ${
                      item.highlighted ? 'bg-[#1677f2]' : 'bg-[#e5e7ef]'
                    }`}
                    style={{ height: `${Math.max(item.value, 7)}%` }}
                  />
                ))}
              </div>

              <div className="mt-3 flex justify-between pr-2 text-[0.78rem] text-slate-400">
                {dashboardOverview.hourLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[22px] bg-white px-6 py-6 text-left shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <div className="space-y-4">
            {dashboardOverview.categories.map((category) => (
              <div key={category.id}>
                <div className="mb-1.5 flex items-center justify-between text-[1.24rem] font-semibold tracking-[-0.02em] text-slate-800">
                  <span>{category.label}</span>
                  <span className="text-[1.12rem] font-semibold text-slate-400">
                    {category.duration}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200/70">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${category.progress}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Abrir configuracion"
        className="absolute right-0 top-[7.1rem] flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_14px_30px_rgba(15,23,42,0.1)] transition hover:text-slate-900"
      >
        {menuIcon}
      </button>
    </section>
  )
}

export default WelcomeHero
