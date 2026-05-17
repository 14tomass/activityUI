import { useEffect, useState } from 'react'
import { dashboardOverview } from '../../../mocks/dashboard'
import { formatUsageFromSeconds, getDailyActiveUsage } from '../../../lib/api/activitywatch'

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

const drawerChevronRightIcon = (
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

const closeIcon = (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path
      d="M8 8L16 16M16 8L8 16"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
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

function WelcomeHero() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null)
  const [kpiUsageLabel, setKpiUsageLabel] = useState(dashboardOverview.totalUsage)

  const closeSettings = () => {
    setActiveModal(null)
    setIsSettingsOpen(false)
  }

  useEffect(() => {
    let cancelled = false

    const loadDailyUsage = async () => {
      const result = await getDailyActiveUsage({ day: '2026-05-16' })

      if (cancelled) {
        return
      }

      if (result.ok && typeof result.seconds === 'number') {
        setKpiUsageLabel(formatUsageFromSeconds(result.seconds))
        return
      }

      console.warn('No se pudo cargar KPI real de ActivityWatch.', result.error, result.warnings)
    }

    loadDailyUsage()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="relative flex w-full max-w-[1180px] justify-center">
      <div
        className={`w-full max-w-[552px] px-4 text-center transition-[filter,opacity] duration-300 sm:px-0 ${
          isSettingsOpen ? 'opacity-60 blur-[2.4px]' : 'opacity-100'
        }`}
      >
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
            {kpiUsageLabel}
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
        onClick={() => setIsSettingsOpen(true)}
        className="absolute right-0 top-[7.1rem] flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_14px_30px_rgba(15,23,42,0.1)] transition hover:text-slate-900"
      >
        {menuIcon}
      </button>

      {isSettingsOpen ? (
        <>
          <button
            type="button"
            aria-label="Cerrar panel de configuracion"
            onClick={closeSettings}
            className="fixed inset-0 z-30 bg-slate-900/36 backdrop-blur-[3px]"
          />

          <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-[505px] bg-[#f6f6f7] shadow-[-12px_0_40px_rgba(15,23,42,0.2)]">
            <div className="flex h-full flex-col">
              <header className="flex items-center justify-between border-b border-slate-200 px-9 py-8">
                <h2 className="text-[2.72rem] font-semibold tracking-[-0.03em] text-slate-800">
                  Configuracion
                </h2>
                <button
                  type="button"
                  aria-label="Cerrar configuracion"
                  onClick={closeSettings}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 transition hover:text-slate-700"
                >
                  {closeIcon}
                </button>
              </header>

              <div className="px-9 py-9">
                <h3 className="text-[2rem] font-semibold tracking-[-0.02em] text-slate-800">
                  Modificar categorias
                </h3>
                <p className="mt-4 text-[1.16rem] leading-[1.45] text-slate-500">
                  Gestiona que aplicaciones y sitios web pertenecen a cada
                  categoria
                </p>

                <div className="mt-8 space-y-3">
                  {dashboardOverview.categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setActiveModal('detail')
                      }}
                      className="flex w-full items-center justify-between rounded-[20px] bg-slate-200/70 px-6 py-4 text-left transition hover:bg-slate-200"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className="h-6 w-6 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <div>
                          <p className="text-[1.12rem] font-semibold text-slate-800">
                            {category.label}
                          </p>
                          <p className="text-[0.98rem] font-medium text-slate-500">
                            {category.appCount} aplicaciones
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-400">
                        {drawerChevronRightIcon}
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-slate-300 bg-transparent px-6 py-5 text-[1.02rem] font-semibold text-[#1677f2] transition hover:border-[#8fbaf7]"
                >
                  <span className="text-[1.7rem] leading-none">+</span>
                  <span>Crear nueva categoria</span>
                </button>
              </div>
            </div>
          </aside>

          {activeModal === 'detail' ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
              <div className="w-full max-w-[540px] rounded-[30px] bg-[#f5f5f6] px-8 py-8 shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <h3 className="text-[2.9rem] font-semibold tracking-[-0.03em] text-slate-800">
                      {dashboardOverview.categoryDetail.title}
                    </h3>
                    <p className="mt-1 text-[1.22rem] text-slate-500">
                      {dashboardOverview.categoryDetail.total}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveModal('edit')
                      }}
                      className="rounded-full bg-[#1677f2]/12 px-4 py-2 text-[0.88rem] font-semibold text-[#1677f2] transition hover:bg-[#1677f2]/18"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      aria-label="Cerrar detalle de categoria"
                      onClick={() => setActiveModal(null)}
                      className="mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 transition hover:text-slate-700"
                    >
                      {closeIcon}
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {dashboardOverview.categoryDetail.items.map((item) => (
                    <div key={item.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[2rem] leading-none">
                            {item.icon}
                          </span>
                          <span className="text-[1.05rem] font-semibold text-slate-800">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[1.06rem] font-medium text-slate-500">
                          {item.duration}
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-200/80">
                        <div
                          className="h-2.5 rounded-full bg-[#1677f2]"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeModal === 'edit' ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
              <div className="w-full max-w-[720px] rounded-[32px] bg-[#f5f5f6] px-8 py-8 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <span
                      className="h-6 w-6 rounded-full"
                      style={{ backgroundColor: dashboardOverview.categoryEdit.color }}
                    />
                    <h3 className="text-[2.7rem] font-semibold tracking-[-0.03em] text-slate-800">
                      {dashboardOverview.categoryEdit.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    aria-label="Cerrar edicion de categoria"
                    onClick={() => setActiveModal(null)}
                    className="mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 transition hover:text-slate-700"
                  >
                    {closeIcon}
                  </button>
                </div>

                <p className="mb-6 text-[1.12rem] text-slate-500">
                  {dashboardOverview.categoryEdit.helperText}
                </p>

                <div className="space-y-3">
                  {dashboardOverview.categoryEdit.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-[16px] bg-slate-200/70 px-5 py-4"
                    >
                      <span className="text-[1.8rem] leading-none">{item.icon}</span>
                      <span className="text-[1.1rem] font-semibold text-slate-800">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <p className="mb-3 text-[1.08rem] font-semibold text-slate-800">
                    Anadir aplicacion o sitio web
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder={dashboardOverview.categoryEdit.inputPlaceholder}
                      className="h-14 flex-1 rounded-[14px] border border-transparent bg-slate-200/70 px-5 text-[1.02rem] text-slate-700 placeholder:text-slate-400 focus:border-[#1677f2]/30 focus:outline-none"
                    />
                    <button
                      type="button"
                      aria-label="Anadir item"
                      className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#1677f2] text-[2rem] leading-none text-white shadow-[0_10px_20px_rgba(22,119,242,0.35)]"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="h-14 rounded-[16px] bg-slate-200/80 text-[1.1rem] font-semibold text-slate-700 transition hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="h-14 rounded-[16px] bg-[#1677f2] text-[1.1rem] font-semibold text-white shadow-[0_10px_22px_rgba(22,119,242,0.32)] transition hover:bg-[#136de0]"
                  >
                    Guardar cambios
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}

export default WelcomeHero
