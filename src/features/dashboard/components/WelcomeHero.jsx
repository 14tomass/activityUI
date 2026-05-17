import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dashboardOverview } from '../../../mocks/dashboard'
import {
  createCategory,
  formatUsageFromSeconds,
  getCategoryDefinitions,
  getCategoryRules,
  getDailyActiveUsage,
  getDailyCategoryDetailUsage,
  getDailyCategoryUsage,
  getHourlyUsageDetail,
  getHourlyActiveUsage,
  inferCategoryRuleSourceType,
  saveCategoryRules,
} from '../../../lib/api/activitywatch'

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

const HOME_DAY = '2026-05-16'
const MAX_DETAIL_ITEMS = 7
const MAX_HOURLY_DETAIL_ITEMS = 7

function normalizeRuleInput(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function buildNeutralHourlyBars() {
  return Array.from({ length: 24 }, (_, index) => ({
    hour: String(index).padStart(2, '0'),
    value: 18,
    highlighted: false,
    seconds: 0,
  }))
}

function buildLoadingCategories(categoryDefinitions = []) {
  return categoryDefinitions.map((category, index) => ({
    id: `loading-${index}-${category.id}`,
    label: category.label,
    duration: '-',
    progress: 0,
    color: category.color ?? '#8f949f',
  }))
}

function aggregateCategoryDetailItems(detailUsage, categoryLabel) {
  const items = [...detailUsage.items]
  if (items.length <= MAX_DETAIL_ITEMS) {
    return items
  }

  const topItems = items.slice(0, MAX_DETAIL_ITEMS)
  const remainder = items.slice(MAX_DETAIL_ITEMS)
  const remainderSeconds = remainder.reduce((sum, item) => sum + (item.rawSeconds ?? 0), 0)
  const detailTotalSeconds = detailUsage.totalSeconds ?? 0
  const groupedPercentage = detailTotalSeconds > 0 ? (remainderSeconds / detailTotalSeconds) * 100 : 0

  const aggregatedRow = {
    id: 'others-grouped-row',
    label: 'Otras webs y apps',
    sourceType: 'mixed',
    duration: formatUsageFromSeconds(remainderSeconds),
    progress: Math.max(0, Math.min(100, groupedPercentage)),
    rawSeconds: remainderSeconds,
  }

  if (categoryLabel === 'Otros') {
    // No debug logs in normal operation.
  }

  return [...topItems, aggregatedRow]
}

function aggregateHourlyDetailItems(detailUsage) {
  const items = [...detailUsage.items]
  if (items.length <= MAX_HOURLY_DETAIL_ITEMS) {
    return {
      visibleItems: items,
      groupedRemainderSeconds: 0,
      rawItemsCount: items.length,
    }
  }

  const topItems = items.slice(0, MAX_HOURLY_DETAIL_ITEMS)
  const remainder = items.slice(MAX_HOURLY_DETAIL_ITEMS)
  const groupedRemainderSeconds = remainder.reduce((sum, item) => sum + (item.rawSeconds ?? 0), 0)
  const groupedPercentage =
    detailUsage.totalSeconds > 0 ? (groupedRemainderSeconds / detailUsage.totalSeconds) * 100 : 0
  const aggregatedRow = {
    id: 'hourly-others-grouped-row',
    label: 'Otras webs y apps',
    sourceType: 'mixed',
    duration: formatUsageFromSeconds(groupedRemainderSeconds),
    progress: Math.max(0, Math.min(100, groupedPercentage)),
    rawSeconds: groupedRemainderSeconds,
  }

  return {
    visibleItems: [...topItems, aggregatedRow],
    groupedRemainderSeconds,
    rawItemsCount: items.length,
  }
}

function WelcomeHero() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeModal, setActiveModal] = useState(null)

  const [isKpiLoading, setIsKpiLoading] = useState(true)
  const [kpiUsageLabel, setKpiUsageLabel] = useState('-')

  const [isHourlyLoading, setIsHourlyLoading] = useState(true)
  const [hourlyUsage, setHourlyUsage] = useState(buildNeutralHourlyBars())
  const [selectedHourIndex, setSelectedHourIndex] = useState(null)
  const [isHourlyDetailLoading, setIsHourlyDetailLoading] = useState(false)
  const [hourlyDetailError, setHourlyDetailError] = useState(null)
  const [hourlyDetailUsage, setHourlyDetailUsage] = useState({
    intervalLabel: '-',
    total: '-',
    totalSeconds: 0,
    items: [],
  })
  const hourlyDetailRequestTokenRef = useRef(0)

  const [categoryDefinitions, setCategoryDefinitions] = useState(getCategoryDefinitions())
  const [isCategoryCardLoading, setIsCategoryCardLoading] = useState(true)
  const [categoryUsageCard, setCategoryUsageCard] = useState(
    buildLoadingCategories(getCategoryDefinitions())
  )

  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState(dashboardOverview.categoryDetail.title)
  const [isCategoryDetailLoading, setIsCategoryDetailLoading] = useState(false)
  const [categoryDetailError, setCategoryDetailError] = useState(null)
  const [categoryDetailUsage, setCategoryDetailUsage] = useState({
    total: '-',
    totalSeconds: 0,
    items: [],
  })
  const [categoryDetailCache, setCategoryDetailCache] = useState({})
  const detailRequestTokenRef = useRef(0)

  const [editableRules, setEditableRules] = useState(getCategoryRules())
  const [editDraftRules, setEditDraftRules] = useState({ domains: [], applications: [] })
  const [newRuleInput, setNewRuleInput] = useState('')
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('')
  const [newCategoryError, setNewCategoryError] = useState('')

  const closeSettings = () => {
    setActiveModal(null)
    setNewCategoryNameInput('')
    setNewCategoryError('')
    setIsSettingsOpen(false)
  }

  const openHourlyDetail = (hourIndex) => {
    setSelectedHourIndex(hourIndex)
    setHourlyDetailUsage({
      intervalLabel: `${String(hourIndex).padStart(2, '0')}:00 – ${String((hourIndex + 1) % 24).padStart(2, '0')}:00`,
      total: '-',
      totalSeconds: 0,
      items: [],
    })
    setHourlyDetailError(null)
    setIsHourlyDetailLoading(true)
    setActiveModal('hourly-detail')
    hourlyDetailRequestTokenRef.current += 1
  }

  const refreshCategoryCard = useCallback(async () => {
    const definitions = getCategoryDefinitions()
    setCategoryDefinitions(definitions)
    const result = await getDailyCategoryUsage({ day: HOME_DAY })
    if (!result.ok || !Array.isArray(result.categories)) {
      console.warn(
        'No se pudo cargar uso por categorias real de ActivityWatch; se mantiene estado neutro.',
        result.error,
        result.warnings
      )
      return false
    }

    const categoriesByLabel = new Map(result.categories.map((item) => [item.category, item]))
    const visualCategories = definitions.map((definition) => {
      const matched = categoriesByLabel.get(definition.label)
      return {
        id: definition.id,
        label: definition.label,
        duration: matched?.formattedDuration ?? '0h 0m',
        progress: matched ? Math.max(0, Math.min(100, matched.percentage)) : 0,
        color: definition.color ?? matched?.color ?? '#8f949f',
      }
    })

    setCategoryUsageCard(visualCategories)
    return true
  }, [])

  const loadCategoryDetailUsage = useCallback(async ({ category, requestId }) => {
    const cached = categoryDetailCache[category]
    if (cached) {
      setCategoryDetailUsage(cached)
      setIsCategoryDetailLoading(false)
      return
    }

    const detailResult = await getDailyCategoryDetailUsage({ day: HOME_DAY, category })
    if (requestId !== detailRequestTokenRef.current) {
      return
    }

    if (detailResult.ok && detailResult.category === category) {
      const mapped = {
        total: detailResult.formattedTotal,
        totalSeconds: detailResult.totalSeconds,
        items: detailResult.items.map((item, index) => ({
          id: `${item.sourceType}-${item.label}-${index}`,
          label: item.label,
          sourceType: item.sourceType,
          duration: item.formattedDuration,
          progress: Math.max(0, Math.min(100, item.percentage)),
          rawSeconds: item.seconds,
        })),
      }

      setCategoryDetailCache((previous) => ({ ...previous, [category]: mapped }))
      setCategoryDetailUsage(mapped)
      setCategoryDetailError(null)
      setIsCategoryDetailLoading(false)
      return
    }

    setCategoryDetailError('No disponible')
    setIsCategoryDetailLoading(false)
    console.warn(
      'No se pudo cargar detalle real de categoria de ActivityWatch; se mantiene estado neutro.',
      detailResult.error,
      detailResult.warnings
    )
  }, [categoryDetailCache])

  const openCategoryDetail = (label) => {
    setSelectedCategoryLabel(label)
    setCategoryDetailUsage({ total: '-', totalSeconds: 0, items: [] })
    setCategoryDetailError(null)
    setIsCategoryDetailLoading(true)
    setActiveModal('detail')
    detailRequestTokenRef.current += 1
  }

  const openCategoryEdit = (label) => {
    const rules = getCategoryRules()
    const categoryRules = rules[label] ?? { domains: [], applications: [] }
    setEditableRules(rules)
    setSelectedCategoryLabel(label)
    setEditDraftRules({
      domains: [...categoryRules.domains],
      applications: [...categoryRules.applications],
    })
    setNewRuleInput('')
    setActiveModal('edit')

    console.group('[CONFIG-CATEGORIES-VERIFY] Category rules editing')
    console.log('edited category:', label)
    console.log('initial rules loaded:', categoryRules)
    console.groupEnd()
  }

  const openCategoryCreate = () => {
    setNewCategoryNameInput('')
    setNewCategoryError('')
    setActiveModal('create-category')
  }

  const removeDraftRule = (sourceType, index) => {
    setEditDraftRules((previous) => {
      const key = sourceType === 'website' ? 'domains' : 'applications'
      return {
        ...previous,
        [key]: previous[key].filter((_, currentIndex) => currentIndex !== index),
      }
    })
  }

  const saveCategoryRuleChanges = async () => {
    const pendingInput = newRuleInput.trim()
    const normalizedPendingInput = normalizeRuleInput(pendingInput)
    let nextDraft = {
      domains: [...editDraftRules.domains],
      applications: [...editDraftRules.applications],
    }
    const inferredType = pendingInput ? inferCategoryRuleSourceType(pendingInput) : null

    if (pendingInput) {
      if (inferredType === 'website') {
        if (!nextDraft.domains.some((rule) => normalizeRuleInput(rule) === normalizedPendingInput)) {
          nextDraft.domains.push(pendingInput.trim())
        }
      } else if (
        inferredType === 'application' &&
        !nextDraft.applications.some((rule) => normalizeRuleInput(rule) === normalizedPendingInput)
      ) {
        nextDraft.applications.push(pendingInput.trim())
      }
    }

    const nextRules = {
      ...editableRules,
      [selectedCategoryLabel]: nextDraft,
    }
    const persisted = saveCategoryRules(nextRules)

    if (!persisted) {
      return
    }

    setEditableRules(nextRules)
    setEditDraftRules(nextDraft)
    setNewRuleInput('')
    setCategoryDetailCache({})

    const shouldCloseModal = pendingInput.length === 0
    if (shouldCloseModal) {
      setActiveModal(null)
    }

    await refreshCategoryCard()

    if (shouldCloseModal) {
      return
    }
  }

  const saveNewCategory = async () => {
    const rawInput = newCategoryNameInput

    const createResult = createCategory(rawInput)
    if (!createResult.ok) {
      setNewCategoryError(createResult.message)
      return
    }

    setNewCategoryError('')
    setNewCategoryNameInput('')
    setCategoryDetailCache({})
    setEditableRules(getCategoryRules())
    await refreshCategoryCard()
    setActiveModal(null)
    setNewCategoryNameInput('')
    setNewCategoryError('')
  }

  const loadHourlyDetailUsage = useCallback(async ({ hourIndex, requestToken }) => {
    const detailResult = await getHourlyUsageDetail({ day: HOME_DAY, hourIndex })
    if (requestToken !== hourlyDetailRequestTokenRef.current) {
      return
    }

    if (!detailResult.ok) {
      setHourlyDetailError('No disponible')
      setIsHourlyDetailLoading(false)
      console.warn(
        'No se pudo cargar detalle horario de ActivityWatch; se muestra estado neutro.',
        detailResult.error,
        detailResult.warnings
      )
      return
    }

    const mapped = {
      intervalLabel: detailResult.intervalLabel,
      total: detailResult.formattedTotal,
      totalSeconds: detailResult.totalSeconds,
      items: detailResult.items.map((item, index) => ({
        id: `${item.sourceType}-${item.label}-${index}`,
        label: item.label,
        sourceType: item.sourceType,
        duration: item.formattedDuration,
        progress: Math.max(0, Math.min(100, item.percentage)),
        rawSeconds: item.seconds,
      })),
    }

    setHourlyDetailUsage(mapped)
    setHourlyDetailError(null)
    setIsHourlyDetailLoading(false)

    const rawItemsCount = mapped.items.length
    const topItems = mapped.items.slice(0, MAX_HOURLY_DETAIL_ITEMS)
    const groupedRemainderSeconds =
      rawItemsCount > MAX_HOURLY_DETAIL_ITEMS
        ? mapped.items.slice(MAX_HOURLY_DETAIL_ITEMS).reduce((sum, item) => sum + (item.rawSeconds ?? 0), 0)
        : 0
    const barSeconds = hourlyUsage[hourIndex]?.seconds ?? 0
    const difference = Math.abs(barSeconds - mapped.totalSeconds)
    console.group('[DATA-09-VERIFY] Hourly bar detail consistency')
    console.log('clicked hour index:', hourIndex)
    console.log('interval label:', mapped.intervalLabel)
    console.log('hourly bar total seconds:', barSeconds)
    console.log('modal detail total seconds:', mapped.totalSeconds)
    console.log('difference seconds:', difference)
    console.log('items count raw:', rawItemsCount)
    console.log('visible top items count:', topItems.length)
    console.log('grouped remainder seconds:', groupedRemainderSeconds)
    console.log('loading resolved:', true)
    console.log('validation:', difference <= 2 ? 'OK' : 'MISMATCH')
    console.groupEnd()
  }, [hourlyUsage])

  useEffect(() => {
    let cancelled = false

    const bootstrapDashboard = async () => {
      const [dailyResult, hourlyResult, categoryResult] = await Promise.all([
        getDailyActiveUsage({ day: HOME_DAY }),
        getHourlyActiveUsage({ day: HOME_DAY }),
        getDailyCategoryUsage({ day: HOME_DAY }),
      ])

      if (cancelled) {
        return
      }

      if (dailyResult.ok && typeof dailyResult.seconds === 'number') {
        setKpiUsageLabel(formatUsageFromSeconds(dailyResult.seconds))
      } else {
        setKpiUsageLabel('-')
        console.warn(
          'No se pudo cargar KPI real de ActivityWatch; se mantiene estado neutro.',
          dailyResult.error,
          dailyResult.warnings
        )
      }
      setIsKpiLoading(false)

      if (hourlyResult.ok && Array.isArray(hourlyResult.hourlyBars)) {
        setHourlyUsage(hourlyResult.hourlyBars)
      } else {
        setHourlyUsage(buildNeutralHourlyBars())
        console.warn(
          'No se pudo cargar uso por horas real de ActivityWatch; se mantiene estado neutro.',
          hourlyResult.error,
          hourlyResult.warnings
        )
      }
      setIsHourlyLoading(false)

      if (categoryResult.ok && Array.isArray(categoryResult.categories)) {
        const definitions = getCategoryDefinitions()
        setCategoryDefinitions(definitions)
        const categoriesByLabel = new Map(categoryResult.categories.map((item) => [item.category, item]))
        const visualCategories = definitions.map((definition) => {
          const matched = categoriesByLabel.get(definition.label)
          return {
            id: definition.id,
            label: definition.label,
            duration: matched?.formattedDuration ?? '0h 0m',
            progress: matched ? Math.max(0, Math.min(100, matched.percentage)) : 0,
            color: definition.color ?? matched?.color ?? '#8f949f',
          }
        })
        setCategoryUsageCard(visualCategories)
      } else {
        setCategoryDefinitions(getCategoryDefinitions())
        setCategoryUsageCard(buildLoadingCategories(getCategoryDefinitions()))
        console.warn(
          'No se pudo cargar uso por categorias real de ActivityWatch; se mantiene estado neutro.',
          categoryResult.error,
          categoryResult.warnings
        )
      }
      setIsCategoryCardLoading(false)

    }

    bootstrapDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isCategoryDetailLoading) {
      return
    }

    loadCategoryDetailUsage({
      category: selectedCategoryLabel,
      requestId: detailRequestTokenRef.current,
    })
  }, [isCategoryDetailLoading, selectedCategoryLabel, loadCategoryDetailUsage])

  useEffect(() => {
    if (!isHourlyDetailLoading || selectedHourIndex === null) {
      return
    }

    loadHourlyDetailUsage({
      hourIndex: selectedHourIndex,
      requestToken: hourlyDetailRequestTokenRef.current,
    })
  }, [isHourlyDetailLoading, selectedHourIndex, loadHourlyDetailUsage])

  const visibleDetailItems = useMemo(
    () => aggregateCategoryDetailItems(categoryDetailUsage, selectedCategoryLabel),
    [categoryDetailUsage, selectedCategoryLabel]
  )
  const hourlyDetailPresentation = useMemo(
    () => aggregateHourlyDetailItems(hourlyDetailUsage),
    [hourlyDetailUsage]
  )
  const selectedCategoryColor = useMemo(
    () => categoryDefinitions.find((category) => category.label === selectedCategoryLabel)?.color ?? '#8f949f',
    [categoryDefinitions, selectedCategoryLabel]
  )

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
            {isKpiLoading ? '-' : kpiUsageLabel}
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
              <span>{isHourlyLoading ? '-' : '1m'}</span>
              <span>{isHourlyLoading ? '-' : '1m'}</span>
              <span>{isHourlyLoading ? '-' : '1m'}</span>
              <span>{isHourlyLoading ? '-' : '1m'}</span>
              <span>{isHourlyLoading ? '-' : '1m'}</span>
            </div>

            <div className="flex min-w-0 flex-col overflow-hidden">
              <div className="grid h-[162px] grid-cols-24 items-end gap-1 overflow-hidden">
                {hourlyUsage.map((item, index) => (
                  <button
                    key={item.hour}
                    type="button"
                    aria-label={`Ver detalle de ${item.hour}:00`}
                    onClick={() => openHourlyDetail(index)}
                    className={`w-full rounded-t-[10px] ${
                      item.highlighted && !isHourlyLoading ? 'bg-[#1677f2]' : 'bg-[#e5e7ef]'
                    }`}
                    style={{ height: `${Math.max(item.value, 7)}%` }}
                  />
                ))}
              </div>

              <div className="mt-3 flex justify-between text-[0.78rem] text-slate-400">
                {['00', '03', '06', '09', '12', '15', '18', '21', '23'].map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[22px] bg-white px-6 py-6 text-left shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <div className="space-y-4">
            {categoryUsageCard.map((category) => (
              <button
                key={category.id}
                type="button"
                disabled={isCategoryCardLoading}
                onClick={() => openCategoryDetail(category.label)}
                className="w-full text-left disabled:cursor-not-allowed"
              >
                <div className="mb-1.5 flex items-center justify-between text-[1.24rem] font-semibold tracking-[-0.02em] text-slate-800">
                  <span>{category.label}</span>
                  <span className="text-[1.12rem] font-semibold text-slate-400">
                    {isCategoryCardLoading ? '-' : category.duration}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200/70">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${isCategoryCardLoading ? 0 : category.progress}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label="Abrir configuracion"
        onClick={() => setIsSettingsOpen(true)}
        className="fixed right-6 top-6 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_14px_30px_rgba(15,23,42,0.1)] transition hover:text-slate-900 sm:right-8 sm:top-8"
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
            <div className="flex h-screen max-h-screen flex-col overflow-hidden supports-[height:100dvh]:h-[100dvh] supports-[height:100dvh]:max-h-[100dvh]">
              <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-[#f6f6f7] px-9 py-8">
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

              <div className="min-h-0 flex-1 overflow-y-auto px-9 py-9">
                <h3 className="text-[2rem] font-semibold tracking-[-0.02em] text-slate-800">
                  Modificar categorias
                </h3>
                <p className="mt-4 text-[1.16rem] leading-[1.45] text-slate-500">
                  Gestiona que aplicaciones y sitios web pertenecen a cada
                  categoria
                </p>

                <div className="mt-8 space-y-3">
                  {categoryDefinitions.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => openCategoryEdit(category.label)}
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
                            {category.appCount} reglas
                          </p>
                        </div>
                      </div>
                      <span className="text-slate-400">{drawerChevronRightIcon}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={openCategoryCreate}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-[20px] border-2 border-dashed border-slate-300 bg-transparent px-6 py-5 text-[1.02rem] font-semibold text-[#1677f2] transition hover:border-[#8fbaf7]"
                >
                  <span className="text-[1.7rem] leading-none">+</span>
                  <span>Crear nueva categoria</span>
                </button>
              </div>
            </div>
          </aside>
        </>
      ) : null}

      {activeModal ? (
        <button
          type="button"
          aria-label="Cerrar modal"
          onClick={() => setActiveModal(null)}
          className="fixed inset-0 z-50 bg-slate-900/36 backdrop-blur-[2px]"
        />
      ) : null}

      {activeModal === 'detail' ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
          <div className="flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[30px] bg-[#f5f5f6] shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
            <div className="sticky top-0 z-10 flex items-start justify-between bg-[#f5f5f6] px-8 py-8">
              <div>
                <h3 className="text-[2.9rem] font-semibold tracking-[-0.03em] text-slate-800">
                  {selectedCategoryLabel}
                </h3>
                <p className="mt-1 text-[1.22rem] text-slate-500">
                  {isCategoryDetailLoading ? '- total' : `${categoryDetailUsage.total} total`}
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar detalle de categoria"
                onClick={() => setActiveModal(null)}
                className="mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 transition hover:text-slate-700"
              >
                {closeIcon}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <div className="space-y-6">
                {isCategoryDetailLoading ? (
                  <p className="text-[1.02rem] font-medium text-slate-500">Cargando detalle real...</p>
                ) : null}
                {!isCategoryDetailLoading && categoryDetailError ? (
                  <p className="text-[1.02rem] font-medium text-slate-500">
                    No se pudo cargar el detalle en este momento.
                  </p>
                ) : null}
                {!isCategoryDetailLoading && !categoryDetailError && visibleDetailItems.length === 0 ? (
                  <p className="text-[1.02rem] font-medium text-slate-500">
                    No hay datos para esta categoria en el dia seleccionado.
                  </p>
                ) : null}
                {!isCategoryDetailLoading &&
                  visibleDetailItems.map((item) => (
                    <div key={item.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[2rem] leading-none">
                            {item.sourceType === 'website'
                              ? '🌐'
                              : item.sourceType === 'application'
                                ? '🖥️'
                                : '📦'}
                          </span>
                          <span className="text-[1.05rem] font-semibold text-slate-800">
                            {item.label}
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
        </div>
      ) : null}

      {activeModal === 'hourly-detail' ? (
        <div className="fixed inset-0 z-[65] flex items-center justify-center px-6">
          <div className="flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[30px] bg-[#f5f5f6] shadow-[0_24px_60px_rgba(15,23,42,0.25)]">
            <div className="sticky top-0 z-10 flex items-start justify-between bg-[#f5f5f6] px-8 py-8">
              <div>
                <h3 className="text-[2rem] font-semibold tracking-[-0.03em] text-slate-800">
                  {hourlyDetailUsage.intervalLabel}
                </h3>
                <p className="mt-1 text-[1.22rem] text-slate-500">
                  {isHourlyDetailLoading ? '- total' : `${hourlyDetailUsage.total} total`}
                </p>
              </div>
              <button
                type="button"
                aria-label="Cerrar detalle por franja"
                onClick={() => setActiveModal(null)}
                className="mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 transition hover:text-slate-700"
              >
                {closeIcon}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <div className="space-y-6">
                {isHourlyDetailLoading ? (
                  <p className="text-[1.02rem] font-medium text-slate-500">Cargando detalle real...</p>
                ) : null}
                {!isHourlyDetailLoading && hourlyDetailError ? (
                  <p className="text-[1.02rem] font-medium text-slate-500">
                    No se pudo cargar el detalle en este momento.
                  </p>
                ) : null}
                {!isHourlyDetailLoading &&
                !hourlyDetailError &&
                hourlyDetailPresentation.visibleItems.length === 0 ? (
                  <p className="text-[1.02rem] font-medium text-slate-500">
                    No hay actividad registrada en esta franja.
                  </p>
                ) : null}
                {!isHourlyDetailLoading &&
                  hourlyDetailPresentation.visibleItems.map((item) => (
                    <div key={item.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-[2rem] leading-none">
                            {item.sourceType === 'website'
                              ? '🌐'
                              : item.sourceType === 'application'
                                ? '🖥️'
                                : '📦'}
                          </span>
                          <span className="text-[1.05rem] font-semibold text-slate-800">
                            {item.label}
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
        </div>
      ) : null}

      {activeModal === 'create-category' ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
          <div className="w-full max-w-[560px] rounded-[30px] bg-[#f5f5f6] px-8 py-8 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
            <div className="mb-6 flex items-start justify-between">
              <h3 className="text-[2.2rem] font-semibold tracking-[-0.03em] text-slate-800">
                Crear nueva categoria
              </h3>
              <button
                type="button"
                aria-label="Cerrar creacion de categoria"
                onClick={() => {
                  setActiveModal(null)
                  setNewCategoryNameInput('')
                  setNewCategoryError('')
                }}
                className="mt-1 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/70 text-slate-500 transition hover:text-slate-700"
              >
                {closeIcon}
              </button>
            </div>

            <p className="mb-4 text-[1.02rem] text-slate-500">
              Escribe un nombre para la nueva categoria.
            </p>
            <input
              type="text"
              value={newCategoryNameInput}
              onChange={(event) => {
                setNewCategoryNameInput(event.target.value)
                if (newCategoryError) {
                  setNewCategoryError('')
                }
              }}
              placeholder="Ej: IA"
              className="h-14 w-full rounded-[14px] border border-transparent bg-slate-200/70 px-5 text-[1.02rem] text-slate-700 placeholder:text-slate-400 focus:border-[#1677f2]/30 focus:outline-none"
            />
            {newCategoryError ? (
              <p className="mt-3 text-[0.92rem] font-medium text-[#d14343]">{newCategoryError}</p>
            ) : null}

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null)
                  setNewCategoryNameInput('')
                  setNewCategoryError('')
                }}
                className="h-14 rounded-[16px] bg-slate-200/80 text-[1.1rem] font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveNewCategory}
                className="h-14 rounded-[16px] bg-[#1677f2] text-[1.1rem] font-semibold text-white shadow-[0_10px_22px_rgba(22,119,242,0.32)] transition hover:bg-[#136de0]"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {activeModal === 'edit' ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
          <div className="w-full max-w-[720px] rounded-[32px] bg-[#f5f5f6] px-8 py-8 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: selectedCategoryColor }}
                />
                <h3 className="text-[2.7rem] font-semibold tracking-[-0.03em] text-slate-800">
                  {selectedCategoryLabel}
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
              {editDraftRules.domains.map((domain, index) => (
                <div
                  key={`domain-${domain}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-[16px] bg-slate-200/70 px-5 py-4"
                >
                  <span className="text-[1.1rem] font-semibold text-slate-800">{domain}</span>
                  <button
                    type="button"
                    onClick={() => removeDraftRule('website', index)}
                    className="text-[0.85rem] font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              {editDraftRules.applications.map((application, index) => (
                <div
                  key={`app-${application}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-[16px] bg-slate-200/70 px-5 py-4"
                >
                  <span className="text-[1.1rem] font-semibold text-slate-800">{application}</span>
                  <button
                    type="button"
                    onClick={() => removeDraftRule('application', index)}
                    className="text-[0.85rem] font-semibold text-slate-500 hover:text-slate-700"
                  >
                    Eliminar
                  </button>
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
                  value={newRuleInput}
                  onChange={(event) => setNewRuleInput(event.target.value)}
                  placeholder={dashboardOverview.categoryEdit.inputPlaceholder}
                  className="h-14 flex-1 rounded-[14px] border border-transparent bg-slate-200/70 px-5 text-[1.02rem] text-slate-700 placeholder:text-slate-400 focus:border-[#1677f2]/30 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  const rules = getCategoryRules()
                  const categoryRules = rules[selectedCategoryLabel] ?? { domains: [], applications: [] }
                  setEditDraftRules({
                    domains: [...categoryRules.domains],
                    applications: [...categoryRules.applications],
                  })
                  setNewRuleInput('')
                  setActiveModal(null)
                }}
                className="h-14 rounded-[16px] bg-slate-200/80 text-[1.1rem] font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveCategoryRuleChanges}
                className="h-14 rounded-[16px] bg-[#1677f2] text-[1.1rem] font-semibold text-white shadow-[0_10px_22px_rgba(22,119,242,0.32)] transition hover:bg-[#136de0]"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default WelcomeHero
