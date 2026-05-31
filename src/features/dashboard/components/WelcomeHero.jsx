import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { dashboardOverview } from '../../../mocks/dashboard'
import {
  assignCategoryRuleExclusively,
  createCategory,
  deleteCustomCategory,
  formatUsageFromSeconds,
  getActivityWatchSettings,
  getCategoryDefinitions,
  getCategoryRules,
  getDailyActiveUsage,
  getDailyCategoryDetailUsage,
  getDailyCategoryUsage,
  getHourlyUsageDetail,
  getHourlyActiveUsage,
  isBaseCategoryName,
  getRangeActiveUsage,
  getRangeCategoryDetailUsage,
  getRangeCategoryUsage,
  getRangeDailyUsageSeries,
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

const MAX_DETAIL_ITEMS = 7
const MAX_HOURLY_DETAIL_ITEMS = 7
const DEFAULT_START_OF_DAY = '00:00'
const RANGE_MODE_TODAY = 'today'
const RANGE_MODE_WEEK = 'week'
const RANGE_MODE_MONTH = 'month'
const MAX_DAY_HISTORY = 15
const MAX_WEEK_HISTORY = 5
const MAX_MONTH_HISTORY = 3

function parseStartOfDay(value) {
  if (typeof value !== 'string') {
    return { hours: 0, minutes: 0 }
  }

  const match = value.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) {
    return { hours: 0, minutes: 0 }
  }

  const hours = Number.parseInt(match[1], 10)
  const minutes = Number.parseInt(match[2], 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return { hours: 0, minutes: 0 }
  }

  return {
    hours: Math.min(Math.max(hours, 0), 23),
    minutes: Math.min(Math.max(minutes, 0), 59),
  }
}

function toIsoDayLocal(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftIsoDay(isoDay, deltaDays) {
  const [year, month, day] = isoDay.split('-').map((part) => Number.parseInt(part, 10))
  const shifted = new Date(year, month - 1, day + deltaDays, 12, 0, 0, 0)
  return toIsoDayLocal(shifted)
}

function formatSelectedDayLabel(isoDay) {
  const [year, month, day] = isoDay.split('-').map((part) => Number.parseInt(part, 10))
  const date = new Date(year, month - 1, day, 12, 0, 0, 0)
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '')
}

function getCurrentActivityWatchDay(startOfDay = DEFAULT_START_OF_DAY) {
  const now = new Date()
  const { hours, minutes } = parseStartOfDay(startOfDay)
  const cutoff = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  )
  const effectiveDate = now < cutoff ? new Date(cutoff.getTime() - 24 * 60 * 60 * 1000) : now
  return toIsoDayLocal(effectiveDate)
}

function getWeekStartDay(isoDay) {
  const [year, month, day] = isoDay.split('-').map((part) => Number.parseInt(part, 10))
  const date = new Date(year, month - 1, day, 12, 0, 0, 0)
  const dayOfWeek = date.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  date.setDate(date.getDate() + mondayOffset)
  return toIsoDayLocal(date)
}

function getWeekRangeFromStartDay(startDay) {
  const endDay = shiftIsoDay(startDay, 6)
  return { startDay, endDay }
}

function getMonthStartDay(isoDay) {
  const [year, month] = isoDay.split('-').map((part) => Number.parseInt(part, 10))
  return `${year}-${String(month).padStart(2, '0')}-01`
}

function getMonthRangeFromStartDay(startDay) {
  const [year, month] = startDay.split('-').map((part) => Number.parseInt(part, 10))
  const end = new Date(year, month, 0, 12, 0, 0, 0)
  return {
    startDay,
    endDay: toIsoDayLocal(end),
  }
}

function shiftIsoMonth(monthStartDay, deltaMonths) {
  const [year, month] = monthStartDay.split('-').map((part) => Number.parseInt(part, 10))
  const shifted = new Date(year, month - 1 + deltaMonths, 1, 12, 0, 0, 0)
  return toIsoDayLocal(shifted)
}

function formatMonthLabel(monthStartDay) {
  const [year, month] = monthStartDay.split('-').map((part) => Number.parseInt(part, 10))
  const date = new Date(year, month - 1, 1, 12, 0, 0, 0)
  return date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).replace('.', '')
}

function formatWeekRangeLabel(startDay, endDay) {
  const [startYear, startMonth, startDate] = startDay.split('-').map((part) => Number.parseInt(part, 10))
  const [endYear, endMonth, endDate] = endDay.split('-').map((part) => Number.parseInt(part, 10))
  const start = new Date(startYear, startMonth - 1, startDate, 12, 0, 0, 0)
  const end = new Date(endYear, endMonth - 1, endDate, 12, 0, 0, 0)
  const startMonthLabel = start.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
  const endMonthLabel = end.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.getDate()} ${endMonthLabel}`
  }
  return `${start.getDate()} ${startMonthLabel} – ${end.getDate()} ${endMonthLabel}`
}

function getWeekdayLabel(isoDay) {
  const [year, month, day] = isoDay.split('-').map((part) => Number.parseInt(part, 10))
  const date = new Date(year, month - 1, day, 12, 0, 0, 0)
  const weekday = date.getDay()
  const labels = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
  return labels[weekday] ?? '-'
}

function isIsoDayFuture(day, currentDay) {
  return day > currentDay
}

function getIsoDayDifference(startDay, endDay) {
  const start = new Date(`${startDay}T12:00:00`)
  const end = new Date(`${endDay}T12:00:00`)
  const diffMs = end.getTime() - start.getTime()
  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
}

function buildWeeklyAxisLabels(weeklyBars, isLoading) {
  if (isLoading) {
    return ['-', '-', '-', '-', '-']
  }

  const maxSeconds = Math.max(0, ...weeklyBars.map((bar) => bar.seconds ?? 0))
  const maxHours = Math.max(1, Math.ceil(maxSeconds / 3600))
  const step = Math.max(1, Math.ceil(maxHours / 4))
  const top = step * 4
  return [top, top - step, top - step * 2, top - step * 3, 0].map((value) =>
    value <= 0 ? '0h' : `${value}h`
  )
}

function buildDailyAxisLabels(hourlyBars, isLoading) {
  if (isLoading) {
    return ['-', '-', '-', '-', '-']
  }

  const maxSeconds = Math.max(0, ...hourlyBars.map((bar) => bar.seconds ?? 0))
  const maxMinutes = Math.max(1, Math.ceil(maxSeconds / 60))
  const step = Math.max(1, Math.ceil(maxMinutes / 4))
  const top = step * 4
  return [top, top - step, top - step * 2, top - step * 3, 0].map((value) =>
    value <= 0 ? '0m' : `${value}m`
  )
}

function buildNeutralHourlyBars() {
  return Array.from({ length: 24 }, (_, index) => ({
    hour: String(index).padStart(2, '0'),
    value: 18,
    highlighted: false,
    seconds: 0,
  }))
}

function buildNeutralWeeklyBars() {
  return Array.from({ length: 7 }, (_, index) => ({
    hour: String(index),
    day: null,
    label: '-',
    value: 18,
    highlighted: false,
    seconds: 0,
  }))
}

function buildNeutralMonthlyBars() {
  return Array.from({ length: 5 }, (_, index) => ({
    hour: `S${index + 1}`,
    label: `S${index + 1}`,
    value: 18,
    highlighted: false,
    seconds: 0,
  }))
}

function getMonthCacheKey(monthStartDay) {
  return String(monthStartDay).slice(0, 7)
}

function buildDayCacheEntry({ kpiUsageLabel, hourlyUsage, categoryUsageCard }) {
  return {
    kpiUsageLabel,
    hourlyUsage,
    categoryUsageCard,
  }
}

function buildRangeCacheEntry({ kpiUsageLabel, totalSeconds, bars, categoryUsageCard }) {
  return {
    kpiUsageLabel,
    totalSeconds,
    bars,
    categoryUsageCard,
  }
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
  const [activityWatchStartOfDay, setActivityWatchStartOfDay] = useState(DEFAULT_START_OF_DAY)
  const currentActivityWatchDay = getCurrentActivityWatchDay(activityWatchStartOfDay)
  const [selectedDay, setSelectedDay] = useState(() => getCurrentActivityWatchDay(DEFAULT_START_OF_DAY))
  const [selectedRangeMode, setSelectedRangeMode] = useState(RANGE_MODE_WEEK)
  const [selectedWeekStartDay, setSelectedWeekStartDay] = useState(() =>
    getWeekStartDay(getCurrentActivityWatchDay(DEFAULT_START_OF_DAY))
  )
  const [selectedMonthStartDay, setSelectedMonthStartDay] = useState(() =>
    getMonthStartDay(getCurrentActivityWatchDay(DEFAULT_START_OF_DAY))
  )
  const [selectedWeekDay, setSelectedWeekDay] = useState(null)
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
  const [weeklyTotalSeconds, setWeeklyTotalSeconds] = useState(0)

  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState(dashboardOverview.categoryDetail.title)
  const [isCategoryDetailLoading, setIsCategoryDetailLoading] = useState(false)
  const [categoryDetailError, setCategoryDetailError] = useState(null)
  const [categoryDetailUsage, setCategoryDetailUsage] = useState({
    total: '-',
    totalSeconds: 0,
    items: [],
  })
  const detailRequestTokenRef = useRef(0)

  const [editableRules, setEditableRules] = useState(getCategoryRules())
  const [editDraftRules, setEditDraftRules] = useState({ domains: [], applications: [] })
  const [newRuleInput, setNewRuleInput] = useState('')
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('')
  const [newCategoryError, setNewCategoryError] = useState('')
  const categoryCardRequestTokenRef = useRef(0)
  const dayDataCacheRef = useRef({})
  const weekDataCacheRef = useRef({})
  const monthDataCacheRef = useRef({})
  const weekCategoryContextCacheRef = useRef({})

  const clearDashboardSessionCache = useCallback(() => {
    dayDataCacheRef.current = {}
    weekDataCacheRef.current = {}
    monthDataCacheRef.current = {}
    weekCategoryContextCacheRef.current = {}
  }, [])

  const logSessionCacheVerify = useCallback(
    ({ mode, cacheKey, cacheHit, renderedFromExistingLoadedData }) => {
      console.group('[QA-FIX-SESSION-CACHE-VERIFY] Session cache without prefetch')
      console.log('mode:', mode)
      console.log('cache key:', cacheKey)
      console.log('cache hit:', cacheHit)
      console.log('rendered from existing loaded data:', renderedFromExistingLoadedData)
      console.log('background prefetch active:', false)
      console.log('validation:', !renderedFromExistingLoadedData || cacheHit ? 'OK' : 'MISMATCH')
      console.groupEnd()
    },
    []
  )

  const closeSettings = () => {
    setActiveModal(null)
    setNewCategoryNameInput('')
    setNewCategoryError('')
    setIsSettingsOpen(false)
  }

  const closeAllModals = useCallback(() => {
    setActiveModal(null)
    setSelectedHourIndex(null)
    setIsHourlyDetailLoading(false)
    setHourlyDetailError(null)
    setHourlyDetailUsage({
      intervalLabel: '-',
      total: '-',
      totalSeconds: 0,
      items: [],
    })
    setIsCategoryDetailLoading(false)
    setCategoryDetailError(null)
    setCategoryDetailUsage({
      total: '-',
      totalSeconds: 0,
      items: [],
    })
  }, [])

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
    const result = (() => {
      if (selectedRangeMode === RANGE_MODE_WEEK && selectedWeekDay) {
        return getDailyCategoryUsage({ day: selectedWeekDay })
      }
      if (selectedRangeMode === RANGE_MODE_WEEK) {
        const weekRange = getWeekRangeFromStartDay(selectedWeekStartDay)
        return getRangeCategoryUsage({
          startDay: weekRange.startDay,
          endDay: weekRange.endDay,
        })
      }
      if (selectedRangeMode === RANGE_MODE_MONTH) {
        const monthRange = getMonthRangeFromStartDay(selectedMonthStartDay)
        return getRangeCategoryUsage({
          startDay: monthRange.startDay,
          endDay: monthRange.endDay,
        })
      }
      return getDailyCategoryUsage({ day: selectedDay })
    })()
    const resolvedResult = await result
    if (!resolvedResult.ok || !Array.isArray(resolvedResult.categories)) {
      console.warn(
        'No se pudo cargar uso por categorias real de ActivityWatch; se mantiene estado neutro.',
        resolvedResult.error,
        resolvedResult.warnings
      )
      return false
    }

    const categoriesByLabel = new Map(resolvedResult.categories.map((item) => [item.category, item]))
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
  }, [selectedDay, selectedMonthStartDay, selectedRangeMode, selectedWeekDay, selectedWeekStartDay])

  const mapCategoryResultToCard = useCallback((result) => {
    const definitions = getCategoryDefinitions()
    setCategoryDefinitions(definitions)
    const categoriesByLabel = new Map((result.categories ?? []).map((item) => [item.category, item]))
    return definitions.map((definition) => {
      const matched = categoriesByLabel.get(definition.label)
      return {
        id: definition.id,
        label: definition.label,
        duration: matched?.formattedDuration ?? '0h 0m',
        progress: matched ? Math.max(0, Math.min(100, matched.percentage)) : 0,
        color: definition.color ?? matched?.color ?? '#8f949f',
      }
    })
  }, [])

  const loadCategoryDetailUsage = useCallback(async ({ category, requestId }) => {
    const detailResult =
      selectedRangeMode === RANGE_MODE_WEEK
        ? await getRangeCategoryDetailUsage({
            startDay: getWeekRangeFromStartDay(selectedWeekStartDay).startDay,
            endDay: getWeekRangeFromStartDay(selectedWeekStartDay).endDay,
            category,
          })
        : await getDailyCategoryDetailUsage({ day: selectedDay, category })
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
  }, [selectedDay, selectedRangeMode, selectedWeekStartDay])

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
    let nextDraft = {
      domains: [...editDraftRules.domains],
      applications: [...editDraftRules.applications],
    }
    let uniqueRuleLog = null

    if (pendingInput) {
      const assignmentResult = assignCategoryRuleExclusively({
        rules: {
          ...editableRules,
          [selectedCategoryLabel]: nextDraft,
        },
        category: selectedCategoryLabel,
        rawRule: pendingInput,
      })

      if (!assignmentResult.ok || !assignmentResult.nextRules) {
        return
      }

      const refreshedCategoryRules = assignmentResult.nextRules[selectedCategoryLabel] ?? {
        domains: [],
        applications: [],
      }
      nextDraft = {
        domains: [...refreshedCategoryRules.domains],
        applications: [...refreshedCategoryRules.applications],
      }
      uniqueRuleLog = assignmentResult
    }

    const nextRules =
      uniqueRuleLog?.nextRules ??
      {
        ...editableRules,
        [selectedCategoryLabel]: nextDraft,
      }
    const persisted = saveCategoryRules(nextRules)

    if (!persisted) {
      return
    }

    if (uniqueRuleLog) {
      console.group('[QA-FIX-UNIQUE-RULES-VERIFY] Unique category rules')
      console.log('rule:', uniqueRuleLog.normalizedRule)
      console.log(
        'inferred type:',
        uniqueRuleLog.inferredType === 'website' ? 'domain' : uniqueRuleLog.inferredType
      )
      console.log('previous category if existed:', uniqueRuleLog.previousCategory ?? null)
      console.log('new category:', selectedCategoryLabel)
      console.log('removed from previous category:', uniqueRuleLog.removedFromPreviousCategory)
      console.log('appears only once globally:', uniqueRuleLog.appearsOnlyOnceGlobally)
      console.log(
        'validation:',
        uniqueRuleLog.appearsOnlyOnceGlobally ? 'OK' : 'MISMATCH'
      )
      console.groupEnd()
    }

    setEditableRules(nextRules)
    setEditDraftRules(nextDraft)
    setNewRuleInput('')
    clearDashboardSessionCache()

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
    setEditableRules(getCategoryRules())
    clearDashboardSessionCache()
    await refreshCategoryCard()
    setActiveModal(null)
    setNewCategoryNameInput('')
    setNewCategoryError('')
  }

  const deleteSelectedCategory = async () => {
    const categoryToDelete = selectedCategoryLabel
    const isBaseCategory = isBaseCategoryName(categoryToDelete)
    const deletionAllowed = !isBaseCategory

    if (!deletionAllowed) {
      return
    }

    const confirmed = window.confirm(
      `Se eliminara la categoria "${categoryToDelete}" y todas sus reglas. Esta accion no se puede deshacer.`
    )
    if (!confirmed) {
      return
    }

    const deleteResult = deleteCustomCategory(categoryToDelete)

    console.group('[QA-FIX-DELETE-CATEGORY-VERIFY] Delete custom category')
    console.log('category:', categoryToDelete)
    console.log('is base category:', isBaseCategory)
    console.log('deletion allowed:', deletionAllowed)
    console.log('category removed from localStorage:', deleteResult.categoryRemovedFromLocalStorage ?? false)
    console.log('rules removed:', deleteResult.rulesRemoved ?? false)
    console.log('dashboard recalculated or cache invalidated:', deleteResult.ok === true)
    console.log(
      'validation:',
      deleteResult.ok &&
        deleteResult.categoryRemovedFromLocalStorage &&
        deleteResult.rulesRemoved
        ? 'OK'
        : 'MISMATCH'
    )
    console.groupEnd()

    if (!deleteResult.ok) {
      return
    }

    setEditableRules(deleteResult.nextRules ?? getCategoryRules())
    setEditDraftRules({ domains: [], applications: [] })
    setNewRuleInput('')
    clearDashboardSessionCache()
    await refreshCategoryCard()
    setActiveModal(null)
  }

  const loadHourlyDetailUsage = useCallback(async ({ hourIndex, requestToken }) => {
    const detailResult = await getHourlyUsageDetail({ day: selectedDay, hourIndex })
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

  }, [selectedDay])

  useEffect(() => {
    let cancelled = false

    const bootstrapDaySettings = async () => {
      const settingsResult = await getActivityWatchSettings()
      const detectedStartOfDay =
        settingsResult.ok && typeof settingsResult.settings?.startOfDay === 'string'
          ? settingsResult.settings.startOfDay
          : DEFAULT_START_OF_DAY

      if (cancelled) {
        return
      }

      const currentDay = getCurrentActivityWatchDay(detectedStartOfDay)
      setActivityWatchStartOfDay(detectedStartOfDay)
      setSelectedDay(currentDay)
      setSelectedWeekStartDay(getWeekStartDay(currentDay))
      setSelectedMonthStartDay(getMonthStartDay(currentDay))
    }

    bootstrapDaySettings()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadDashboard = async () => {
      const modeLabel =
        selectedRangeMode === RANGE_MODE_WEEK
          ? 'Semana'
          : selectedRangeMode === RANGE_MODE_MONTH
            ? 'Mes'
            : 'Dia'
      const dayCacheKey = selectedDay
      const weekCacheKey = selectedWeekStartDay
      const monthCacheKey = getMonthCacheKey(selectedMonthStartDay)

      if (selectedRangeMode === RANGE_MODE_TODAY) {
        const cachedDay = dayDataCacheRef.current[dayCacheKey]
        if (cachedDay) {
          setKpiUsageLabel(cachedDay.kpiUsageLabel)
          setIsKpiLoading(false)
          setHourlyUsage(cachedDay.hourlyUsage)
          setIsHourlyLoading(false)
          setCategoryUsageCard(cachedDay.categoryUsageCard)
          setIsCategoryCardLoading(false)
          logSessionCacheVerify({
            mode: modeLabel,
            cacheKey: dayCacheKey,
            cacheHit: true,
            renderedFromExistingLoadedData: true,
          })
          console.group('[QA-FIX-DAY-KPI-VERIFY] Daily KPI priority')
          console.log('selected day:', selectedDay)
          console.log('day cache hit:', true)
          console.log('daily KPI load started:', true)
          console.log('daily KPI rendered before categories complete:', true)
          console.log('daily KPI rendered before hourly chart complete:', true)
          console.log('validation:', 'OK')
          console.groupEnd()
          return
        }
      }

      if (selectedRangeMode === RANGE_MODE_WEEK) {
        const cachedWeek = weekDataCacheRef.current[weekCacheKey]
        if (cachedWeek) {
          setWeeklyTotalSeconds(cachedWeek.totalSeconds)
          setKpiUsageLabel(cachedWeek.kpiUsageLabel)
          setIsKpiLoading(false)
          setHourlyUsage(cachedWeek.bars)
          setIsHourlyLoading(false)

          const selectedContextKey = selectedWeekDay
            ? `${weekCacheKey}:${selectedWeekDay}`
            : `${weekCacheKey}:week`
          const cachedWeekContext = weekCategoryContextCacheRef.current[selectedContextKey]

          setCategoryUsageCard(cachedWeekContext ?? cachedWeek.categoryUsageCard)
          setIsCategoryCardLoading(Boolean(selectedWeekDay && !cachedWeekContext))
          logSessionCacheVerify({
            mode: modeLabel,
            cacheKey: weekCacheKey,
            cacheHit: true,
            renderedFromExistingLoadedData: true,
          })
          return
        }
      }

      if (selectedRangeMode === RANGE_MODE_MONTH) {
        const cachedMonth = monthDataCacheRef.current[monthCacheKey]
        if (cachedMonth) {
          setWeeklyTotalSeconds(cachedMonth.totalSeconds)
          setKpiUsageLabel(cachedMonth.kpiUsageLabel)
          setIsKpiLoading(false)
          setHourlyUsage(cachedMonth.bars)
          setIsHourlyLoading(false)
          setCategoryUsageCard(cachedMonth.categoryUsageCard)
          setIsCategoryCardLoading(false)
          logSessionCacheVerify({
            mode: modeLabel,
            cacheKey: monthCacheKey,
            cacheHit: true,
            renderedFromExistingLoadedData: true,
          })
          return
        }
      }

      logSessionCacheVerify({
        mode: modeLabel,
        cacheKey:
          selectedRangeMode === RANGE_MODE_WEEK
            ? weekCacheKey
            : selectedRangeMode === RANGE_MODE_MONTH
              ? monthCacheKey
              : dayCacheKey,
        cacheHit: false,
        renderedFromExistingLoadedData: false,
      })

      setIsKpiLoading(true)
      setKpiUsageLabel('-')
      setIsHourlyLoading(true)
      setHourlyUsage(
        selectedRangeMode === RANGE_MODE_WEEK
          ? buildNeutralWeeklyBars()
          : selectedRangeMode === RANGE_MODE_MONTH
            ? buildNeutralMonthlyBars()
            : buildNeutralHourlyBars()
      )
      setIsCategoryCardLoading(true)
      setCategoryUsageCard(buildLoadingCategories(getCategoryDefinitions()))

      if (selectedRangeMode === RANGE_MODE_WEEK) {
        const { startDay, endDay } = getWeekRangeFromStartDay(selectedWeekStartDay)
        const [weeklyTotalResult, weeklySeriesResult, weeklyCategoryResult] = await Promise.all([
          getRangeActiveUsage({ startDay, endDay }),
          getRangeDailyUsageSeries({ startDay, endDay }),
          getRangeCategoryUsage({ startDay, endDay }),
        ])

        if (cancelled) {
          return
        }

        if (weeklyTotalResult.ok && typeof weeklyTotalResult.totalSeconds === 'number') {
          setWeeklyTotalSeconds(weeklyTotalResult.totalSeconds)
          setKpiUsageLabel(formatUsageFromSeconds(weeklyTotalResult.totalSeconds))
        } else {
          setWeeklyTotalSeconds(0)
          setKpiUsageLabel('-')
          console.warn(
            'No se pudo cargar KPI semanal real de ActivityWatch; se mantiene estado neutro.',
            weeklyTotalResult.error,
            weeklyTotalResult.warnings
          )
        }
        setIsKpiLoading(false)

        const weeklyBars =
          weeklySeriesResult.ok && Array.isArray(weeklySeriesResult.dailySeries)
            ? (() => {
          const dailySeriesNormalized = weeklySeriesResult.dailySeries.map((item) => ({
            ...item,
            seconds: isIsoDayFuture(item.day, currentActivityWatchDay) ? 0 : item.seconds ?? 0,
            isFutureDay: isIsoDayFuture(item.day, currentActivityWatchDay),
          }))
          const maxSeconds = Math.max(0, ...dailySeriesNormalized.map((item) => item.seconds ?? 0))
          const mostUsedDay = dailySeriesNormalized.reduce(
            (best, item) => ((item.seconds ?? 0) > (best.seconds ?? -1) ? item : best),
            { day: null, seconds: -1 }
          ).day
          const isCurrentWeek = startDay === getWeekStartDay(currentActivityWatchDay)
          const highlightedDay = isCurrentWeek ? currentActivityWatchDay : mostUsedDay
              return dailySeriesNormalized.map((item) => {
            const normalized = maxSeconds > 0 ? (item.seconds / maxSeconds) * 100 : 0
            return {
              hour: item.day,
              day: item.day,
              label: getWeekdayLabel(item.day),
              value: Math.max(0, Math.min(100, normalized)),
              highlighted: item.day === highlightedDay && maxSeconds > 0,
              seconds: item.seconds,
              isFutureDay: item.isFutureDay,
            }
          })
            })()
            : buildNeutralWeeklyBars()
        setHourlyUsage(weeklyBars)
        if (!weeklySeriesResult.ok || !Array.isArray(weeklySeriesResult.dailySeries)) {
          console.warn(
            'No se pudo cargar uso semanal por dias de ActivityWatch; se mantiene estado neutro.',
            weeklySeriesResult.error,
            weeklySeriesResult.warnings
          )
        }
        setIsHourlyLoading(false)

        if (weeklyCategoryResult.ok && Array.isArray(weeklyCategoryResult.categories)) {
          const visualCategories = mapCategoryResultToCard(weeklyCategoryResult)
          setCategoryUsageCard(visualCategories)
          weekCategoryContextCacheRef.current[`${weekCacheKey}:week`] = visualCategories

          if (
            weeklyTotalResult.ok &&
            typeof weeklyTotalResult.totalSeconds === 'number' &&
            weeklySeriesResult.ok &&
            Array.isArray(weeklySeriesResult.dailySeries)
          ) {
            weekDataCacheRef.current[weekCacheKey] = buildRangeCacheEntry({
              kpiUsageLabel: formatUsageFromSeconds(weeklyTotalResult.totalSeconds),
              totalSeconds: weeklyTotalResult.totalSeconds,
              bars: weeklyBars,
              categoryUsageCard: visualCategories,
            })
          }
        } else {
          setCategoryDefinitions(getCategoryDefinitions())
          setCategoryUsageCard(buildLoadingCategories(getCategoryDefinitions()))
          console.warn(
            'No se pudo cargar categorias semanales reales de ActivityWatch; se mantiene estado neutro.',
            weeklyCategoryResult.error,
            weeklyCategoryResult.warnings
          )
        }
        setIsCategoryCardLoading(false)

        return
      }

      if (selectedRangeMode === RANGE_MODE_MONTH) {
        const { startDay, endDay } = getMonthRangeFromStartDay(selectedMonthStartDay)
        const [monthlyTotalResult, monthlySeriesResult, monthlyCategoryResult] = await Promise.all([
          getRangeActiveUsage({ startDay, endDay }),
          getRangeDailyUsageSeries({ startDay, endDay }),
          getRangeCategoryUsage({ startDay, endDay }),
        ])

        if (cancelled) {
          return
        }

        if (monthlyTotalResult.ok && typeof monthlyTotalResult.totalSeconds === 'number') {
          setWeeklyTotalSeconds(monthlyTotalResult.totalSeconds)
          setKpiUsageLabel(formatUsageFromSeconds(monthlyTotalResult.totalSeconds))
        } else {
          setWeeklyTotalSeconds(0)
          setKpiUsageLabel('-')
          console.warn(
            'No se pudo cargar KPI mensual real de ActivityWatch; se mantiene estado neutro.',
            monthlyTotalResult.error,
            monthlyTotalResult.warnings
          )
        }
        setIsKpiLoading(false)

        const monthlyBars =
          monthlySeriesResult.ok && Array.isArray(monthlySeriesResult.dailySeries)
            ? (() => {
          const [year, month] = selectedMonthStartDay.split('-').map((part) => Number.parseInt(part, 10))
          const daysInMonth = new Date(year, month, 0).getDate()
          const weekCount = Math.ceil(daysInMonth / 7)
          const rawWeeks = Array.from({ length: weekCount }, (_, index) => ({
            index,
            label: `S${index + 1}`,
            seconds: 0,
          }))

          monthlySeriesResult.dailySeries.forEach((dayItem) => {
            const [itemYear, itemMonth, itemDay] = dayItem.day
              .split('-')
              .map((part) => Number.parseInt(part, 10))
            if (itemYear !== year || itemMonth !== month) {
              return
            }
            const weekIndex = Math.floor((itemDay - 1) / 7)
            const isFutureDay = isIsoDayFuture(dayItem.day, currentActivityWatchDay)
            const daySeconds = isFutureDay ? 0 : dayItem.seconds ?? 0
            if (rawWeeks[weekIndex]) {
              rawWeeks[weekIndex].seconds += daySeconds
            }
          })

          const maxWeekSeconds = Math.max(0, ...rawWeeks.map((week) => week.seconds))
          const highlightedWeekIndex = rawWeeks.reduce(
            (best, item) => (item.seconds > best.seconds ? item : best),
            { index: -1, seconds: -1 }
          ).index

              return rawWeeks.map((week) => ({
                hour: week.label,
                label: week.label,
                seconds: week.seconds,
                highlighted: week.index === highlightedWeekIndex && maxWeekSeconds > 0,
                value:
                  maxWeekSeconds > 0 ? Math.max(0, Math.min(100, (week.seconds / maxWeekSeconds) * 100)) : 0,
              }))
            })()
            : buildNeutralMonthlyBars()
        setHourlyUsage(monthlyBars)
        if (!monthlySeriesResult.ok || !Array.isArray(monthlySeriesResult.dailySeries)) {
          console.warn(
            'No se pudo cargar uso mensual por semanas de ActivityWatch; se mantiene estado neutro.',
            monthlySeriesResult.error,
            monthlySeriesResult.warnings
          )
        }
        setIsHourlyLoading(false)

        if (monthlyCategoryResult.ok && Array.isArray(monthlyCategoryResult.categories)) {
          const visualCategories = mapCategoryResultToCard(monthlyCategoryResult)
          setCategoryUsageCard(visualCategories)

          if (
            monthlyTotalResult.ok &&
            typeof monthlyTotalResult.totalSeconds === 'number' &&
            monthlySeriesResult.ok &&
            Array.isArray(monthlySeriesResult.dailySeries)
          ) {
            monthDataCacheRef.current[monthCacheKey] = buildRangeCacheEntry({
              kpiUsageLabel: formatUsageFromSeconds(monthlyTotalResult.totalSeconds),
              totalSeconds: monthlyTotalResult.totalSeconds,
              bars: monthlyBars,
              categoryUsageCard: visualCategories,
            })
          }
        } else {
          setCategoryDefinitions(getCategoryDefinitions())
          setCategoryUsageCard(buildLoadingCategories(getCategoryDefinitions()))
          console.warn(
            'No se pudo cargar categorias mensuales reales de ActivityWatch; se mantiene estado neutro.',
            monthlyCategoryResult.error,
            monthlyCategoryResult.warnings
          )
        }
        setIsCategoryCardLoading(false)

        return
      }

      let hourlyCompleted = false
      let categoriesCompleted = false
      const dailyResultPromise = getDailyActiveUsage({ day: selectedDay })
      const hourlyResultPromise = (async () => {
        const result = await getHourlyActiveUsage({ day: selectedDay })
        hourlyCompleted = true
        return result
      })()
      const categoryResultPromise = (async () => {
        const result = await getDailyCategoryUsage({ day: selectedDay })
        categoriesCompleted = true
        return result
      })()

      const dailyResult = await dailyResultPromise

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

      console.group('[QA-FIX-DAY-KPI-VERIFY] Daily KPI priority')
      console.log('selected day:', selectedDay)
      console.log('day cache hit:', false)
      console.log('daily KPI load started:', true)
      console.log('daily KPI rendered before categories complete:', !categoriesCompleted)
      console.log('daily KPI rendered before hourly chart complete:', !hourlyCompleted)
      console.log(
        'validation:',
        !categoriesCompleted || !hourlyCompleted ? 'OK' : 'MISMATCH'
      )
      console.groupEnd()

      const [hourlyResult, categoryResult] = await Promise.all([
        hourlyResultPromise,
        categoryResultPromise,
      ])

      if (cancelled) {
        return
      }

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
        const visualCategories = mapCategoryResultToCard(categoryResult)
        setCategoryUsageCard(visualCategories)
        if (
          dailyResult.ok &&
          typeof dailyResult.seconds === 'number' &&
          hourlyResult.ok &&
          Array.isArray(hourlyResult.hourlyBars)
        ) {
          dayDataCacheRef.current[dayCacheKey] = buildDayCacheEntry({
            kpiUsageLabel: formatUsageFromSeconds(dailyResult.seconds),
            hourlyUsage: hourlyResult.hourlyBars,
            categoryUsageCard: visualCategories,
          })
        }
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

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [
    currentActivityWatchDay,
    logSessionCacheVerify,
    mapCategoryResultToCard,
    selectedDay,
    selectedMonthStartDay,
    selectedRangeMode,
    selectedWeekDay,
    selectedWeekStartDay,
  ])

  useEffect(() => {
    if (selectedRangeMode !== RANGE_MODE_WEEK) {
      return
    }

    let cancelled = false
    categoryCardRequestTokenRef.current += 1
    const requestToken = categoryCardRequestTokenRef.current
    const { startDay, endDay } = getWeekRangeFromStartDay(selectedWeekStartDay)
    const contextCacheKey = selectedWeekDay
      ? `${selectedWeekStartDay}:${selectedWeekDay}`
      : `${selectedWeekStartDay}:week`

    const cachedContext = weekCategoryContextCacheRef.current[contextCacheKey]
    if (cachedContext) {
      setCategoryUsageCard(cachedContext)
      setIsCategoryCardLoading(false)
      return
    }

    const loadWeeklyCategoryContext = async () => {
      setIsCategoryCardLoading(true)
      setCategoryUsageCard(buildLoadingCategories(getCategoryDefinitions()))

      const result = selectedWeekDay
        ? await getDailyCategoryUsage({ day: selectedWeekDay })
        : await getRangeCategoryUsage({ startDay, endDay })

      if (cancelled || requestToken !== categoryCardRequestTokenRef.current) {
        return
      }

      if (result.ok && Array.isArray(result.categories)) {
        const visualCategories = mapCategoryResultToCard(result)
        weekCategoryContextCacheRef.current[contextCacheKey] = visualCategories
        setCategoryUsageCard(visualCategories)
      } else {
        setCategoryDefinitions(getCategoryDefinitions())
        setCategoryUsageCard(buildLoadingCategories(getCategoryDefinitions()))
        console.warn(
          'No se pudo cargar categorias del contexto semanal seleccionado; se mantiene estado neutro.',
          result.error,
          result.warnings
        )
      }
      setIsCategoryCardLoading(false)
    }

    loadWeeklyCategoryContext()

    return () => {
      cancelled = true
    }
  }, [mapCategoryResultToCard, selectedRangeMode, selectedWeekDay, selectedWeekStartDay])

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
    if (selectedRangeMode !== RANGE_MODE_TODAY || !isHourlyDetailLoading || selectedHourIndex === null) {
      return
    }

    loadHourlyDetailUsage({
      hourIndex: selectedHourIndex,
      requestToken: hourlyDetailRequestTokenRef.current,
    })
  }, [isHourlyDetailLoading, selectedHourIndex, loadHourlyDetailUsage, selectedRangeMode])

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
  const isSelectedCategoryBase = useMemo(
    () => isBaseCategoryName(selectedCategoryLabel),
    [selectedCategoryLabel]
  )
  const selectedWeekRange = useMemo(
    () => getWeekRangeFromStartDay(selectedWeekStartDay),
    [selectedWeekStartDay]
  )
  const selectedDateLabel = useMemo(() => {
    if (selectedRangeMode === RANGE_MODE_WEEK) {
      return formatWeekRangeLabel(selectedWeekRange.startDay, selectedWeekRange.endDay)
    }
    if (selectedRangeMode === RANGE_MODE_MONTH) {
      return formatMonthLabel(selectedMonthStartDay)
    }
    return formatSelectedDayLabel(selectedDay)
  }, [selectedDay, selectedMonthStartDay, selectedRangeMode, selectedWeekRange.endDay, selectedWeekRange.startDay])
  const isPreviousDayDisabled = useMemo(() => {
    const minDay = shiftIsoDay(currentActivityWatchDay, -MAX_DAY_HISTORY)
    return selectedDay <= minDay
  }, [currentActivityWatchDay, selectedDay])
  const isPreviousWeekDisabled = useMemo(() => {
    const currentWeekStart = getWeekStartDay(currentActivityWatchDay)
    const minWeekStart = shiftIsoDay(currentWeekStart, -MAX_WEEK_HISTORY * 7)
    return selectedWeekRange.startDay <= minWeekStart
  }, [currentActivityWatchDay, selectedWeekRange.startDay])
  const isPreviousMonthDisabled = useMemo(() => {
    const currentMonthStart = getMonthStartDay(currentActivityWatchDay)
    const minMonthStart = shiftIsoMonth(currentMonthStart, -MAX_MONTH_HISTORY)
    return selectedMonthStartDay <= minMonthStart
  }, [currentActivityWatchDay, selectedMonthStartDay])
  const isPreviousRangeDisabled = useMemo(() => {
    if (selectedRangeMode === RANGE_MODE_WEEK) {
      return isPreviousWeekDisabled
    }
    if (selectedRangeMode === RANGE_MODE_MONTH) {
      return isPreviousMonthDisabled
    }
    return isPreviousDayDisabled
  }, [isPreviousDayDisabled, isPreviousMonthDisabled, isPreviousWeekDisabled, selectedRangeMode])
  const isNextDayDisabled = useMemo(() => {
    if (selectedRangeMode === RANGE_MODE_WEEK) {
      return selectedWeekRange.startDay >= getWeekStartDay(currentActivityWatchDay)
    }
    if (selectedRangeMode === RANGE_MODE_MONTH) {
      return selectedMonthStartDay >= getMonthStartDay(currentActivityWatchDay)
    }
    return selectedDay >= currentActivityWatchDay
  }, [currentActivityWatchDay, selectedDay, selectedMonthStartDay, selectedRangeMode, selectedWeekRange.startDay])
  const weeklySelectedDayLabel = useMemo(() => {
    if (!selectedWeekDay) {
      return null
    }
    return new Date(`${selectedWeekDay}T12:00:00`).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    })
  }, [selectedWeekDay])
  const selectedWeekDayTotal = useMemo(() => {
    if (!selectedWeekDay) {
      return '-'
    }
    const selectedBar = hourlyUsage.find((bar) => bar.day === selectedWeekDay)
    return formatUsageFromSeconds(selectedBar?.seconds ?? 0)
  }, [hourlyUsage, selectedWeekDay])
  const isWeeklyYAxisVisible = selectedRangeMode !== RANGE_MODE_WEEK
  const chartAxisLabels = useMemo(() => {
    if (selectedRangeMode === RANGE_MODE_WEEK) {
      return []
    }
    if (selectedRangeMode === RANGE_MODE_MONTH) {
      return buildWeeklyAxisLabels(hourlyUsage, isHourlyLoading)
    }
    return buildDailyAxisLabels(hourlyUsage, isHourlyLoading)
  }, [hourlyUsage, isHourlyLoading, selectedRangeMode])
  const weeklyChartDebug = useMemo(() => {
    if (selectedRangeMode !== RANGE_MODE_WEEK) {
      return null
    }

    const weeklyBars = hourlyUsage.filter((item) => item.day)
    const maxDaySeconds = Math.max(0, ...weeklyBars.map((item) => item.seconds ?? 0))
    const selectedBar = selectedWeekDay
      ? weeklyBars.find((item) => item.day === selectedWeekDay) ?? null
      : null
    const barsProportional = weeklyBars.every((item) => {
      const expectedValue = maxDaySeconds > 0 ? Math.max(0, Math.min(100, ((item.seconds ?? 0) / maxDaySeconds) * 100)) : 0
      return Math.abs((item.value ?? 0) - expectedValue) < 0.01
    })

    return {
      weekRange: `${selectedWeekRange.startDay} -> ${selectedWeekRange.endDay}`,
      maxDaySeconds,
      maxDayFormatted: formatUsageFromSeconds(maxDaySeconds),
      selectedDaySeconds: selectedBar?.seconds ?? null,
      chartScaleMaxSeconds: maxDaySeconds,
      yAxisVisible: isWeeklyYAxisVisible,
      barsProportional,
    }
  }, [
    hourlyUsage,
    isWeeklyYAxisVisible,
    selectedRangeMode,
    selectedWeekDay,
    selectedWeekRange.endDay,
    selectedWeekRange.startDay,
  ])
  const weeklyAverage = useMemo(() => {
    if (selectedRangeMode !== RANGE_MODE_WEEK) {
      return { daysConsidered: 0, averageSeconds: 0, formatted: '-' }
    }

    const currentWeekStartDay = getWeekStartDay(currentActivityWatchDay)
    const isCurrentWeek = selectedWeekRange.startDay === currentWeekStartDay
    const daysConsidered = isCurrentWeek
      ? Math.min(Math.max(getIsoDayDifference(selectedWeekRange.startDay, currentActivityWatchDay) + 1, 1), 7)
      : 7
    const averageSeconds = daysConsidered > 0 ? weeklyTotalSeconds / daysConsidered : 0
    return {
      daysConsidered,
      averageSeconds,
      formatted: formatUsageFromSeconds(averageSeconds),
      isCurrentWeek,
    }
  }, [currentActivityWatchDay, selectedRangeMode, selectedWeekRange.startDay, weeklyTotalSeconds])
  const monthlyAverage = useMemo(() => {
    if (selectedRangeMode !== RANGE_MODE_MONTH) {
      return { daysConsidered: 0, averageSeconds: 0, formatted: '-' }
    }
    const [year, month] = selectedMonthStartDay.split('-').map((part) => Number.parseInt(part, 10))
    const currentMonthStart = getMonthStartDay(currentActivityWatchDay)
    const isCurrentMonth = selectedMonthStartDay === currentMonthStart
    const daysInMonth = new Date(year, month, 0).getDate()
    const currentDayOfMonth = Number.parseInt(currentActivityWatchDay.split('-')[2], 10)
    const daysConsidered = isCurrentMonth ? Math.min(Math.max(currentDayOfMonth, 1), daysInMonth) : daysInMonth
    const averageSeconds = daysConsidered > 0 ? weeklyTotalSeconds / daysConsidered : 0
    return {
      daysConsidered,
      averageSeconds,
      formatted: formatUsageFromSeconds(averageSeconds),
      isCurrentMonth,
    }
  }, [currentActivityWatchDay, selectedMonthStartDay, selectedRangeMode, weeklyTotalSeconds])

  useEffect(() => {
    if (selectedRangeMode !== RANGE_MODE_WEEK || isHourlyLoading || !weeklyChartDebug) {
      return
    }

    console.group('[QA-FIX-WEEK-CHART-VERIFY] Weekly chart scale')
    console.log('week range:', weeklyChartDebug.weekRange)
    console.log('max day seconds:', weeklyChartDebug.maxDaySeconds)
    console.log('max day formatted:', weeklyChartDebug.maxDayFormatted)
    console.log('selected day seconds if selected:', weeklyChartDebug.selectedDaySeconds)
    console.log('chart scale max seconds:', weeklyChartDebug.chartScaleMaxSeconds)
    console.log('y axis visible:', weeklyChartDebug.yAxisVisible)
    console.log('bars proportional to real seconds:', weeklyChartDebug.barsProportional)
    console.log(
      'validation:',
      weeklyChartDebug.barsProportional && weeklyChartDebug.yAxisVisible === false ? 'OK' : 'MISMATCH'
    )
    console.groupEnd()
  }, [isHourlyLoading, selectedRangeMode, weeklyChartDebug])

  const navigateDay = useCallback(
    (deltaDays) => {
      if (selectedRangeMode === RANGE_MODE_WEEK) {
        setSelectedWeekStartDay((previousStartDay) => {
          const nextStartDay = shiftIsoDay(previousStartDay, deltaDays * 7)
          if (!nextStartDay) {
            return previousStartDay
          }
          const currentWeekStartDay = getWeekStartDay(currentActivityWatchDay)
          const minWeekStartDay = shiftIsoDay(currentWeekStartDay, -MAX_WEEK_HISTORY * 7)
          if (deltaDays < 0 && nextStartDay < minWeekStartDay) {
            return previousStartDay
          }
          if (deltaDays > 0 && nextStartDay > currentWeekStartDay) {
            return previousStartDay
          }
          return nextStartDay
        })
        setSelectedWeekDay(null)
      } else if (selectedRangeMode === RANGE_MODE_MONTH) {
        setSelectedMonthStartDay((previousMonthStartDay) => {
          const nextMonthStartDay = shiftIsoMonth(previousMonthStartDay, deltaDays)
          if (!nextMonthStartDay) {
            return previousMonthStartDay
          }
          const currentMonthStartDay = getMonthStartDay(currentActivityWatchDay)
          const minMonthStartDay = shiftIsoMonth(currentMonthStartDay, -MAX_MONTH_HISTORY)
          if (deltaDays < 0 && nextMonthStartDay < minMonthStartDay) {
            return previousMonthStartDay
          }
          if (deltaDays > 0 && nextMonthStartDay > currentMonthStartDay) {
            return previousMonthStartDay
          }
          return nextMonthStartDay
        })
      } else {
        setSelectedDay((previousDay) => {
          const nextDay = shiftIsoDay(previousDay, deltaDays)
          if (!nextDay) {
            return previousDay
          }
          const minDay = shiftIsoDay(currentActivityWatchDay, -MAX_DAY_HISTORY)
          if (deltaDays < 0 && nextDay < minDay) {
            return previousDay
          }
          if (deltaDays > 0 && nextDay > currentActivityWatchDay) {
            return previousDay
          }
          return nextDay
        })
      }

      closeAllModals()
      if (isSettingsOpen) {
        closeSettings()
      }
    },
    [closeAllModals, currentActivityWatchDay, isSettingsOpen, selectedRangeMode]
  )

  const handleSelectRangeMode = useCallback(
    (modeId) => {
      if (modeId === selectedRangeMode) {
        return
      }
      const nextMode =
        modeId === 'week'
          ? RANGE_MODE_WEEK
          : modeId === 'month'
            ? RANGE_MODE_MONTH
            : RANGE_MODE_TODAY
      setSelectedRangeMode(nextMode)
      closeAllModals()
      if (isSettingsOpen) {
        closeSettings()
      }
      if (nextMode !== RANGE_MODE_WEEK) {
        setSelectedWeekDay(null)
      }
    },
    [closeAllModals, isSettingsOpen, selectedRangeMode]
  )

  const handleWeeklyDayClick = useCallback(
    (barDay) => {
      const wasFutureDay = isIsoDayFuture(barDay, currentActivityWatchDay)
      if (wasFutureDay) {
        return
      }

      const nextSelected = selectedWeekDay === barDay ? null : barDay
      setSelectedWeekDay(nextSelected)
      closeAllModals()
      if (isSettingsOpen) {
        closeSettings()
      }
    },
    [closeAllModals, currentActivityWatchDay, isSettingsOpen, selectedWeekDay]
  )

  const handleWeeklySwitchToWeek = useCallback(() => {
    if (!selectedWeekDay) {
      return
    }
    setSelectedWeekDay(null)
  }, [selectedWeekDay])

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
              onClick={() => handleSelectRangeMode(range.id)}
              className={`flex-1 rounded-full px-4 py-2.5 text-[0.88rem] font-semibold transition ${
                (range.id === 'today' && selectedRangeMode === RANGE_MODE_TODAY) ||
                (range.id === 'week' && selectedRangeMode === RANGE_MODE_WEEK) ||
                (range.id === 'month' && selectedRangeMode === RANGE_MODE_MONTH)
                  ? 'bg-[#1877f2] text-white shadow-[0_8px_16px_rgba(24,119,242,0.35)]'
                  : 'text-slate-700'
              }`}
            >
              {range.id === 'today' ? 'Dia' : range.id === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-center gap-3 text-slate-400">
          <span>{calendarIcon}</span>
          <div className="flex min-w-[172px] items-center justify-between rounded-full bg-white px-4 py-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
            <button
              type="button"
              aria-label="Fecha anterior"
              onClick={() => navigateDay(-1)}
              disabled={isPreviousRangeDisabled}
              className="text-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {chevronLeftIcon}
            </button>
            <span className="text-[0.96rem] font-semibold text-slate-800">
              {selectedDateLabel}
            </span>
            <button
              type="button"
              aria-label="Fecha siguiente"
              onClick={() => navigateDay(1)}
              disabled={isNextDayDisabled}
              className="text-slate-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {chevronRightIcon}
            </button>
          </div>
        </div>

        <div className="mt-7">
          <h1 className="text-[3.75rem] font-semibold leading-none tracking-[-0.07em] text-slate-900 sm:text-[4.9rem]">
            {isKpiLoading ? '-' : kpiUsageLabel}
          </h1>
          {selectedRangeMode === RANGE_MODE_WEEK ? (
            <p className="mt-2 text-[0.98rem] font-medium text-slate-500">
              {isKpiLoading ? '-' : `Media diaria: ${weeklyAverage.formatted}`}
            </p>
          ) : selectedRangeMode === RANGE_MODE_MONTH ? (
            <p className="mt-2 text-[0.98rem] font-medium text-slate-500">
              {isKpiLoading ? '-' : `Media diaria: ${monthlyAverage.formatted}`}
            </p>
          ) : null}
          <p className="mt-4 text-[1.32rem] font-normal tracking-[-0.02em] text-slate-500/80">
            {selectedRangeMode === RANGE_MODE_WEEK
              ? 'Tiempo total de uso en la ultima semana'
              : selectedRangeMode === RANGE_MODE_MONTH
                ? 'Tiempo total de uso en el mes'
                : 'Tiempo total de uso hoy'}
          </p>
        </div>

        <div className="mt-9 rounded-[22px] bg-white px-6 py-6 text-left shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-[1.72rem] font-semibold tracking-[-0.02em] text-slate-800">
              {selectedRangeMode === RANGE_MODE_TODAY ? 'Uso por horas' : 'Uso por dias'}
            </h2>
            {selectedRangeMode === RANGE_MODE_WEEK ? (
              <div className="inline-flex items-center rounded-full bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={handleWeeklySwitchToWeek}
                  className={`rounded-full px-3 py-1.5 text-[0.78rem] font-semibold transition ${
                    !selectedWeekDay ? 'bg-[#1677f2] text-white shadow-[0_4px_10px_rgba(22,119,242,0.28)]' : 'text-slate-600'
                  }`}
                >
                  Semana
                </button>
                <button
                  type="button"
                  disabled={!selectedWeekDay}
                  className={`rounded-full px-3 py-1.5 text-[0.78rem] font-semibold transition ${
                    selectedWeekDay
                      ? 'bg-[#1677f2] text-white shadow-[0_4px_10px_rgba(22,119,242,0.28)]'
                      : 'cursor-not-allowed text-slate-400'
                  }`}
                >
                  Dia
                </button>
              </div>
            ) : null}
          </div>

          <div className={`mt-6 grid gap-4 ${isWeeklyYAxisVisible ? 'grid-cols-[38px_1fr]' : 'grid-cols-1'}`}>
            {isWeeklyYAxisVisible ? (
              <div className="flex flex-col justify-between text-[0.8rem] text-slate-400">
                {chartAxisLabels.map((label, index) => (
                  <span key={`${label}-${index}`}>{label}</span>
                ))}
              </div>
            ) : null}

            <div className="flex min-w-0 flex-col overflow-hidden">
              <div
                className={`grid h-[162px] items-end gap-1 overflow-hidden ${
                  selectedRangeMode === RANGE_MODE_TODAY ? 'grid-cols-24' : 'grid-cols-7'
                }`}
              >
                {hourlyUsage.map((item, index) => (
                  <div key={item.hour} className="relative flex h-full items-end">
                    {selectedRangeMode === RANGE_MODE_WEEK &&
                    selectedWeekDay &&
                    item.day === selectedWeekDay ? (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.75rem] font-semibold text-slate-700">
                        {formatUsageFromSeconds(item.seconds ?? 0)}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      aria-label={
                        selectedRangeMode === RANGE_MODE_WEEK
                          ? `Barra de ${item.label ?? 'dia'}`
                          : `Ver detalle de ${item.hour}:00`
                      }
                      onClick={() => {
                        if (selectedRangeMode === RANGE_MODE_TODAY) {
                          openHourlyDetail(index)
                          return
                        }
                        if (selectedRangeMode === RANGE_MODE_WEEK && item.day) {
                          handleWeeklyDayClick(item.day, item.label ?? '-')
                        }
                      }}
                      disabled={selectedRangeMode === RANGE_MODE_WEEK && Boolean(item.isFutureDay)}
                      className={`w-full rounded-t-[10px] ${
                        (selectedRangeMode === RANGE_MODE_WEEK
                          ? selectedWeekDay
                            ? selectedWeekDay === item.day
                            : item.highlighted && !isHourlyLoading
                          : item.highlighted && !isHourlyLoading)
                          ? 'bg-[#1677f2]'
                          : 'bg-[#e5e7ef]'
                      } ${
                        selectedRangeMode === RANGE_MODE_WEEK
                          ? item.isFutureDay
                            ? 'cursor-not-allowed opacity-60'
                            : 'cursor-pointer'
                          : ''
                      }`}
                      style={{ height: `${Math.max(item.value, 7)}%` }}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 flex justify-between text-[0.78rem] text-slate-400">
                {(selectedRangeMode === RANGE_MODE_WEEK
                  ? hourlyUsage.map((item) => item.label ?? '-')
                  : selectedRangeMode === RANGE_MODE_MONTH
                    ? hourlyUsage.map((item) => item.label ?? '-')
                  : ['00', '03', '06', '09', '12', '15', '18', '21', '23']
                ).map((label, index) => (
                  <span key={`${label}-${index}`}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedRangeMode === RANGE_MODE_WEEK && selectedWeekDay && weeklySelectedDayLabel ? (
          <div className="mt-5 rounded-[16px] bg-white px-5 py-4 text-left shadow-[0_10px_24px_rgba(15,23,42,0.07)]">
            <p className="text-[0.95rem] font-medium text-slate-500">{weeklySelectedDayLabel}</p>
            <p className="mt-1 text-[1.28rem] font-semibold tracking-[-0.02em] text-slate-800">
              {selectedWeekDayTotal} de uso
            </p>
          </div>
        ) : null}

        <div className="mt-6 rounded-[22px] bg-white px-6 py-6 text-left shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <p className="mb-3 text-[0.9rem] font-medium text-slate-500">
            {selectedRangeMode === RANGE_MODE_WEEK
              ? selectedWeekDay && weeklySelectedDayLabel
                ? `Categorias del ${weeklySelectedDayLabel}`
                : 'Categorias de la semana'
              : selectedRangeMode === RANGE_MODE_MONTH
                ? 'Categorias del mes'
                : 'Categorias del dia'}
          </p>
          <div className="space-y-4">
            {categoryUsageCard.map((category) => (
              <button
                key={category.id}
                type="button"
                disabled={isCategoryCardLoading || selectedRangeMode === RANGE_MODE_MONTH}
                onClick={() => {
                  if (selectedRangeMode === RANGE_MODE_MONTH) {
                    return
                  }
                  openCategoryDetail(category.label)
                }}
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
            <p className="mb-6 text-[0.9rem] leading-[1.45] text-slate-400">
              Consejo: las aplicaciones suelen terminar en `.exe` y deben escribirse con el nombre exacto que aparece en ActivityWatch. Los sitios web deben escribirse como dominio, por ejemplo `youtube.com`.
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

            {!isSelectedCategoryBase ? (
              <div className="mt-5 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={deleteSelectedCategory}
                  className="h-12 rounded-[14px] border border-[#d14343]/25 px-4 text-[0.98rem] font-semibold text-[#d14343] transition hover:bg-[#d14343]/5"
                >
                  Eliminar categoria
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default WelcomeHero
