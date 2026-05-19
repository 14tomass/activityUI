const ACTIVITYWATCH_API_BASE_URL = 'http://localhost:5600/api/0'
const BUCKETS_ENDPOINT = `${ACTIVITYWATCH_API_BASE_URL}/buckets/`
const QUERY_ENDPOINT = `${ACTIVITYWATCH_API_BASE_URL}/query/`
const SETTINGS_ENDPOINT = `${ACTIVITYWATCH_API_BASE_URL}/settings`
const INFO_ENDPOINT = `${ACTIVITYWATCH_API_BASE_URL}/info`
const DEFAULT_START_OF_DAY = '00:00'

const BROWSER_APP_NAMES = [
  'Google Chrome',
  'Google-chrome',
  'chrome.exe',
  'google-chrome-stable',
  'Chromium',
  'Chromium-browser',
  'Chromium-browser-chromium',
  'chromium.exe',
  'Google-chrome-beta',
  'Google-chrome-unstable',
  'Brave-browser',
  'Firefox',
  'Firefox.exe',
  'firefox',
  'firefox.exe',
  'Firefox Developer Edition',
  'firefoxdeveloperedition',
  'Firefox-esr',
  'Firefox Beta',
  'Nightly',
  'org.mozilla.firefox',
  'opera.exe',
  'Opera',
  'brave.exe',
  'msedge.exe',
  'Microsoft Edge',
  'Vivaldi-stable',
  'Vivaldi-snapshot',
  'vivaldi.exe',
]

const CATEGORY_KEYS = ['Estudio', 'Entretenimiento', 'Productividad', 'Otros']
const CATEGORY_META_KEY = '__meta'
const CATEGORY_RULES_STORAGE_KEY = 'activityui.categoryRules.v1'
const DEFAULT_CATEGORY_COLORS = {
  Estudio: '#1677f2',
  Entretenimiento: '#ff2f5a',
  Productividad: '#2cb64d',
  Otros: '#8f949f',
}
const CUSTOM_CATEGORY_COLOR_PALETTE = ['#f59e0b', '#8b5cf6', '#06b6d4', '#22c55e', '#ef4444', '#14b8a6']

const DEFAULT_CATEGORY_DOMAIN_RULES = {
  Estudio: ['chatgpt.com', 'stackoverflow.com', 'notion.so'],
  Entretenimiento: ['youtube.com', 'tiktok.com', 'instagram.com', 'x.com'],
  Productividad: [],
}

const DEFAULT_CATEGORY_APP_RULES = {
  Estudio: [],
  Entretenimiento: [],
  Productividad: ['codex.exe', 'windowsterminal.exe', 'code.exe', 'explorer.exe', 'notion.exe'],
}

function normalizeRuleValue(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function looksLikeHttpUrl(value) {
  return /^https?:\/\//i.test(value)
}

function looksLikeExecutable(value) {
  return /\.exe$/i.test(value)
}

function looksLikeDomain(value) {
  if (looksLikeHttpUrl(value)) {
    return true
  }
  if (looksLikeExecutable(value)) {
    return false
  }
  return /^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(value)
}

export function inferCategoryRuleSourceType(rawValue) {
  const normalized = normalizeRuleValue(rawValue)
  if (!normalized) {
    return null
  }
  if (looksLikeExecutable(normalized)) {
    return 'application'
  }
  if (looksLikeDomain(normalized)) {
    return 'website'
  }
  return 'application'
}

function normalizeDomainRule(value) {
  const normalized = normalizeRuleValue(value)
  if (!normalized) {
    return ''
  }

  if (looksLikeHttpUrl(normalized)) {
    try {
      const parsed = new URL(normalized)
      const hostname = normalizeRuleValue(parsed.hostname)
      return hostname.startsWith('www.') ? hostname.slice(4) : hostname
    } catch {
      return ''
    }
  }

  return normalized.startsWith('www.') ? normalized.slice(4) : normalized
}

function normalizeApplicationRule(value) {
  return normalizeRuleValue(value)
}

function normalizeCategoryName(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function toCategoryId(name) {
  return normalizeCategoryName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'category'
}

export function getActivityWatchApiBaseUrl() {
  return ACTIVITYWATCH_API_BASE_URL
}

function buildDefaultCategoryRules() {
  return {
    Estudio: {
      domains: [...(DEFAULT_CATEGORY_DOMAIN_RULES.Estudio ?? [])],
      applications: [...(DEFAULT_CATEGORY_APP_RULES.Estudio ?? [])],
    },
    Entretenimiento: {
      domains: [...(DEFAULT_CATEGORY_DOMAIN_RULES.Entretenimiento ?? [])],
      applications: [...(DEFAULT_CATEGORY_APP_RULES.Entretenimiento ?? [])],
    },
    Productividad: {
      domains: [...(DEFAULT_CATEGORY_DOMAIN_RULES.Productividad ?? [])],
      applications: [...(DEFAULT_CATEGORY_APP_RULES.Productividad ?? [])],
    },
    Otros: {
      domains: [],
      applications: [],
    },
    [CATEGORY_META_KEY]: {
      customOrder: [],
      colors: { ...DEFAULT_CATEGORY_COLORS },
    },
  }
}

function getCategoryNamesFromRules(rules) {
  const base = [...CATEGORY_KEYS]
  if (!isObject(rules)) {
    return base
  }

  const customOrder = Array.isArray(rules?.[CATEGORY_META_KEY]?.customOrder)
    ? rules[CATEGORY_META_KEY].customOrder
        .map((value) => normalizeCategoryName(value))
        .filter((value) => value.length > 0 && !CATEGORY_KEYS.includes(value))
    : []

  const customFromKeys = Object.keys(rules)
    .map((key) => normalizeCategoryName(key))
    .filter((key) => key.length > 0 && key !== CATEGORY_META_KEY && !CATEGORY_KEYS.includes(key))

  const seen = new Set(base)
  const orderedCustom = [...customOrder, ...customFromKeys].filter((name) => {
    if (seen.has(name)) {
      return false
    }
    seen.add(name)
    return true
  })

  return [...base, ...orderedCustom]
}

function resolveCategoryColor(category, colorMap = {}) {
  const raw = colorMap?.[category]
  if (typeof raw === 'string' && raw.trim().length > 0) {
    return raw
  }
  if (DEFAULT_CATEGORY_COLORS[category]) {
    return DEFAULT_CATEGORY_COLORS[category]
  }
  return '#8f949f'
}

function sanitizeRulesPayload(payload) {
  if (!isObject(payload)) {
    return null
  }

  const defaults = buildDefaultCategoryRules()
  const sanitized = {}
  const categories = getCategoryNamesFromRules(payload)
  for (const category of categories) {
    const entry = isObject(payload[category]) ? payload[category] : {}
    const rawDomains = Array.isArray(entry.domains)
      ? entry.domains
      : defaults[category]?.domains ?? []
    const rawApplications = Array.isArray(entry.applications)
      ? entry.applications
      : defaults[category]?.applications ?? []

    const domainSet = new Set()
    const appSet = new Set()

    for (const value of rawDomains) {
      const inferredType = inferCategoryRuleSourceType(value)
      if (inferredType === 'application') {
        const normalizedApp = normalizeApplicationRule(value)
        if (normalizedApp) {
          appSet.add(normalizedApp)
        }
        continue
      }
      const normalizedDomain = normalizeDomainRule(value)
      if (normalizedDomain) {
        domainSet.add(normalizedDomain)
      }
    }

    for (const value of rawApplications) {
      const normalizedApp = normalizeApplicationRule(value)
      if (normalizedApp) {
        appSet.add(normalizedApp)
      }
    }

    const domains = Array.from(domainSet)
    const applications = Array.from(appSet)
    sanitized[category] = { domains, applications }
  }

  const customOrder = categories.filter((category) => !CATEGORY_KEYS.includes(category))
  const payloadColors = isObject(payload[CATEGORY_META_KEY]?.colors) ? payload[CATEGORY_META_KEY].colors : {}
  const colors = {}
  for (const category of categories) {
    colors[category] = resolveCategoryColor(category, payloadColors)
  }

  sanitized[CATEGORY_META_KEY] = {
    customOrder,
    colors,
  }

  return sanitized
}

function getRulesFromStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null
  }

  try {
    const raw = window.localStorage.getItem(CATEGORY_RULES_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw)
    return sanitizeRulesPayload(parsed)
  } catch {
    return null
  }
}

export function getCategoryRules() {
  return getRulesFromStorage() ?? buildDefaultCategoryRules()
}

export function getCategoryDefinitions() {
  const rules = getCategoryRules()
  const categories = getCategoryNamesFromRules(rules)
  const colors = rules?.[CATEGORY_META_KEY]?.colors ?? {}

  return categories.map((name) => {
    const ruleEntry = rules?.[name] ?? { domains: [], applications: [] }
    const appCount =
      (Array.isArray(ruleEntry.domains) ? ruleEntry.domains.length : 0) +
      (Array.isArray(ruleEntry.applications) ? ruleEntry.applications.length : 0)
    return {
      id: toCategoryId(name),
      label: name,
      color: resolveCategoryColor(name, colors),
      appCount,
    }
  })
}

export function saveCategoryRules(rules) {
  const sanitized = sanitizeRulesPayload(rules)
  if (!sanitized) {
    return false
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    return false
  }

  try {
    window.localStorage.setItem(CATEGORY_RULES_STORAGE_KEY, JSON.stringify(sanitized))
    return true
  } catch {
    return false
  }
}

export function createCategory(rawName) {
  const trimmedName = normalizeCategoryName(rawName)
  const normalizedName = normalizeRuleValue(trimmedName)

  if (!trimmedName) {
    return {
      ok: false,
      code: 'invalid_empty_name',
      message: 'El nombre de la categoria no puede estar vacio.',
      normalizedName,
    }
  }

  const currentRules = getCategoryRules()
  const categoryNames = getCategoryNamesFromRules(currentRules)
  const duplicateDetected = categoryNames.some(
    (name) => normalizeRuleValue(name) === normalizedName
  )
  if (duplicateDetected) {
    return {
      ok: false,
      code: 'duplicate_category_name',
      message: 'Ya existe una categoria con ese nombre.',
      normalizedName,
    }
  }

  const currentColors = currentRules?.[CATEGORY_META_KEY]?.colors ?? {}
  const usedColors = new Set(Object.values(currentColors))
  const pickedColor =
    CUSTOM_CATEGORY_COLOR_PALETTE.find((color) => !usedColors.has(color)) ?? '#8f949f'

  const nextRules = {
    ...currentRules,
    [trimmedName]: {
      domains: [],
      applications: [],
    },
    [CATEGORY_META_KEY]: {
      customOrder: [
        ...(Array.isArray(currentRules?.[CATEGORY_META_KEY]?.customOrder)
          ? currentRules[CATEGORY_META_KEY].customOrder
          : []),
        trimmedName,
      ],
      colors: {
        ...currentColors,
        [trimmedName]: pickedColor,
      },
    },
  }

  const persisted = saveCategoryRules(nextRules)
  if (!persisted) {
    return {
      ok: false,
      code: 'storage_write_failed',
      message: 'No se pudo guardar la nueva categoria.',
      normalizedName,
    }
  }

  return {
    ok: true,
    category: {
      id: toCategoryId(trimmedName),
      label: trimmedName,
      color: pickedColor,
      appCount: 0,
    },
    normalizedName,
    duplicateDetected: false,
  }
}

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

function formatDateWithOffset(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  const offsetMinutes = -date.getTimezoneOffset()
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const offsetHours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, '0')
  const offsetRemainder = String(Math.abs(offsetMinutes) % 60).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetRemainder}`
}

function parseIsoDayLocal(isoDay) {
  const [year, month, day] = String(isoDay)
    .split('-')
    .map((part) => Number.parseInt(part, 10))
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null
  }
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

function toIsoDayLocal(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getIsoDaysInRange({ startDay, endDay }) {
  const startDate = parseIsoDayLocal(startDay)
  const endDate = parseIsoDayLocal(endDay)
  if (!startDate || !endDate || startDate > endDate) {
    return []
  }

  const days = []
  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    days.push(toIsoDayLocal(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function buildDayRange(day, startOfDay = DEFAULT_START_OF_DAY) {
  const [year, month, date] = day.split('-').map((part) => Number.parseInt(part, 10))
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(date)) {
    return null
  }

  const { hours, minutes } = parseStartOfDay(startOfDay)
  const start = new Date(year, month - 1, date, hours, minutes, 0, 0)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1000)
  const timeperiod = `${formatDateWithOffset(start)}/${formatDateWithOffset(end)}`
  return { start, end, timeperiod }
}

function normalizeQueryTotalSeconds(payload) {
  if (Array.isArray(payload) && payload.length > 0 && typeof payload[0] === 'number') {
    return payload[0]
  }

  if (Array.isArray(payload) && payload.length > 0 && Array.isArray(payload[0])) {
    const nested = payload[0]
    if (nested.length > 0 && typeof nested[0] === 'number') {
      return nested[0]
    }
  }

  return null
}

function normalizeQueryEvents(payload) {
  if (!Array.isArray(payload) || payload.length === 0 || !Array.isArray(payload[0])) {
    return null
  }
  return payload[0]
}

function buildCanonicalDailyActiveQuery({ windowBucketId, afkBucketId, webBucketId }) {
  const query = [
    `events = flood(query_bucket(find_bucket("${windowBucketId}")));`,
    `not_afk = flood(query_bucket(find_bucket("${afkBucketId}")));`,
    'not_afk = filter_keyvals(not_afk, "status", ["not-afk"]);',
  ]

  if (webBucketId) {
    query.push(`browser_events = flood(query_bucket("${webBucketId}"));`)
    query.push(
      `window_browser = filter_keyvals(events, "app", ${JSON.stringify(BROWSER_APP_NAMES)});`
    )
    query.push('browser_events = filter_period_intersect(browser_events, window_browser);')
    query.push('browser_events = split_url_events(browser_events);')
    query.push('audible_events = filter_keyvals(browser_events, "audible", [true]);')
    query.push('not_afk = period_union(not_afk, audible_events);')
  }

  query.push('events = filter_period_intersect(events, not_afk);')
  query.push('RETURN = sum_durations(events);')
  return query
}

function buildCanonicalDailyEventsQuery({ windowBucketId, afkBucketId, webBucketId }) {
  const query = [
    `events = flood(query_bucket(find_bucket("${windowBucketId}")));`,
    `not_afk = flood(query_bucket(find_bucket("${afkBucketId}")));`,
    'not_afk = filter_keyvals(not_afk, "status", ["not-afk"]);',
  ]

  if (webBucketId) {
    query.push(`browser_events = flood(query_bucket("${webBucketId}"));`)
    query.push(
      `window_browser = filter_keyvals(events, "app", ${JSON.stringify(BROWSER_APP_NAMES)});`
    )
    query.push('browser_events = filter_period_intersect(browser_events, window_browser);')
    query.push('browser_events = split_url_events(browser_events);')
    query.push('audible_events = filter_keyvals(browser_events, "audible", [true]);')
    query.push('not_afk = period_union(not_afk, audible_events);')
  }

  query.push('events = filter_period_intersect(events, not_afk);')
  query.push('RETURN = events;')
  return query
}

function buildWebsiteBrowserStyleEventsQuery({ windowBucketId, webBucketId }) {
  return [
    `window_events = flood(query_bucket(find_bucket("${windowBucketId}")));`,
    `window_browser = filter_keyvals(window_events, "app", ${JSON.stringify(BROWSER_APP_NAMES)});`,
    `browser_events = flood(query_bucket("${webBucketId}"));`,
    'browser_events = filter_period_intersect(browser_events, window_browser);',
    'browser_events = split_url_events(browser_events);',
    'RETURN = browser_events;',
  ]
}

function isObject(value) {
  return value !== null && typeof value === 'object'
}

function normalizeBucketsResponse(payload) {
  if (!isObject(payload)) {
    return []
  }

  return Object.values(payload).filter(isObject)
}

function pickBucketByType(buckets, bucketType) {
  return buckets.find((bucket) => bucket.type === bucketType) ?? null
}

function pickBucketByIdPrefix(buckets, prefix) {
  return buckets.find((bucket) => typeof bucket.id === 'string' && bucket.id.startsWith(prefix)) ?? null
}

function pickBucketByIdSuffix(buckets, suffix) {
  return buckets.find((bucket) => typeof bucket.id === 'string' && bucket.id.endsWith(suffix)) ?? null
}

function resolveWindowBucket(buckets) {
  return pickBucketByType(buckets, 'currentwindow') ?? pickBucketByIdPrefix(buckets, 'aw-watcher-window')
}

function resolveAfkBucket(buckets) {
  return pickBucketByType(buckets, 'afkstatus') ?? pickBucketByIdPrefix(buckets, 'aw-watcher-afk')
}

function resolveWebBucket(buckets, hostname = null) {
  const webTypeBuckets = buckets.filter((bucket) => bucket.type === 'web.tab.current')
  if (webTypeBuckets.length > 0 && hostname) {
    const hostSuffix = `_${hostname}`
    const hostMatched = pickBucketByIdSuffix(webTypeBuckets, hostSuffix)
    if (hostMatched) {
      return hostMatched
    }
  }

  return webTypeBuckets[0] ?? pickBucketByIdPrefix(buckets, 'aw-watcher-web-') ?? null
}

function buildWarningMessage(bucketKey, severity = 'warning') {
  const messages = {
    window: 'Bucket de ventanas/apps no detectado; no se podra calcular tiempo de uso principal.',
    afk: 'Bucket AFK no detectado; se podra estimar uso, pero sin filtro canonico not-afk.',
    web: 'Bucket web no detectado; no habra desglose de sitios por ahora.',
  }

  return {
    code: `missing_${bucketKey}_bucket`,
    severity,
    message: messages[bucketKey],
  }
}

function normalizeKey(value, fallback = 'unknown') {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

function extractDomain(urlValue) {
  const normalized = normalizeKey(urlValue, 'unknown')
  if (normalized === 'unknown') {
    return 'unknown'
  }

  try {
    const parsed = new URL(normalized)
    const hostname = normalizeKey(parsed.hostname, 'unknown')
    return hostname.startsWith('www.') ? hostname.slice(4) : hostname
  } catch {
    return 'unknown'
  }
}

function toSortedUsageList(usageMap) {
  return Array.from(usageMap.values()).sort((a, b) => b.seconds - a.seconds)
}

function toLowerSafe(value) {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

function domainMatchesRule(domain, rule) {
  const normalizedDomain = normalizeDomainRule(domain)
  const normalizedRule = normalizeDomainRule(rule)
  if (!normalizedDomain || !normalizedRule) {
    return false
  }
  return normalizedDomain === normalizedRule || normalizedDomain.endsWith(`.${normalizedRule}`)
}

function classifyDomain(domain, rules, categoryNames) {
  for (const category of categoryNames) {
    const categoryRules = rules?.[category]
    const domains = Array.isArray(categoryRules?.domains) ? categoryRules.domains : []
    if (domains.some((rule) => domainMatchesRule(domain, rule))) {
      return category
    }
  }
  return null
}

function classifyApp(app, rules, categoryNames) {
  const normalizedApp = normalizeApplicationRule(app)
  for (const category of categoryNames) {
    const categoryRules = rules?.[category]
    const applications = Array.isArray(categoryRules?.applications) ? categoryRules.applications : []
    if (applications.some((rule) => normalizedApp === normalizeApplicationRule(rule))) {
      return category
    }
  }
  return null
}

function ensureCategoryTotals(categoryNames) {
  return new Map(categoryNames.map((category) => [category, 0]))
}

function ensureCategoryItemTotals(categoryNames) {
  return new Map(categoryNames.map((category) => [category, new Map()]))
}

function addCategoryItemUsage(itemTotalsByCategory, { category, sourceType, label, seconds }) {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return
  }

  const categoryMap = itemTotalsByCategory.get(category)
  if (!categoryMap) {
    return
  }

  const safeLabel = normalizeKey(label, sourceType === 'website' ? 'unknown' : 'unknown-app')
  const key = `${sourceType}:${safeLabel}`
  const current = categoryMap.get(key) ?? { sourceType, label: safeLabel, seconds: 0 }
  current.seconds += seconds
  categoryMap.set(key, current)
}

function extractEventTimeRange(event) {
  const startMs = new Date(event?.timestamp).getTime()
  const durationSeconds = Number(event?.duration)
  if (!Number.isFinite(startMs) || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return null
  }

  return {
    startMs,
    endMs: startMs + durationSeconds * 1000,
    seconds: durationSeconds,
  }
}

export async function discoverActivityWatchBuckets() {
  try {
    let hostname = null
    try {
      const infoResponse = await fetch(INFO_ENDPOINT)
      if (infoResponse.ok) {
        const infoPayload = await infoResponse.json()
        hostname = typeof infoPayload?.hostname === 'string' ? infoPayload.hostname : null
      }
    } catch {
      hostname = null
    }

    const response = await fetch(BUCKETS_ENDPOINT)

    if (!response.ok) {
      return {
        ok: false,
        buckets: { window: null, afk: null, web: null },
        missing: ['window', 'afk', 'web'],
        warnings: [],
        error: {
          code: 'activitywatch_http_error',
          message: `ActivityWatch respondio con HTTP ${response.status}.`,
          details: { status: response.status },
        },
      }
    }

    const payload = await response.json()
    const buckets = normalizeBucketsResponse(payload)

    const windowBucket = resolveWindowBucket(buckets)
    const afkBucket = resolveAfkBucket(buckets)
    const webBucket = resolveWebBucket(buckets, hostname)

    const missing = []
    const warnings = []

    if (!windowBucket) {
      missing.push('window')
      warnings.push(buildWarningMessage('window', 'error'))
    }
    if (!afkBucket) {
      missing.push('afk')
      warnings.push(buildWarningMessage('afk'))
    }
    if (!webBucket) {
      missing.push('web')
      warnings.push(buildWarningMessage('web'))
    }

    return {
      ok: true,
      buckets: {
        window: windowBucket ? { id: windowBucket.id, type: windowBucket.type ?? null } : null,
        afk: afkBucket ? { id: afkBucket.id, type: afkBucket.type ?? null } : null,
        web: webBucket ? { id: webBucket.id, type: webBucket.type ?? null } : null,
      },
      missing,
      warnings,
      error: null,
    }
  } catch (error) {
    return {
      ok: false,
      buckets: { window: null, afk: null, web: null },
      missing: ['window', 'afk', 'web'],
      warnings: [],
      error: {
        code: 'activitywatch_unreachable',
        message: 'No se pudo conectar con ActivityWatch en localhost:5600.',
        details: { cause: error instanceof Error ? error.message : String(error) },
      },
    }
  }
}

export async function getActivityWatchSettings() {
  try {
    const response = await fetch(SETTINGS_ENDPOINT)
    if (!response.ok) {
      return {
        ok: false,
        settings: null,
        error: {
          code: 'activitywatch_settings_http_error',
          message: `ActivityWatch settings respondio con HTTP ${response.status}.`,
          details: { status: response.status },
        },
      }
    }

    const payload = await response.json()
    return { ok: true, settings: payload, error: null }
  } catch (error) {
    return {
      ok: false,
      settings: null,
      error: {
        code: 'activitywatch_settings_failed',
        message: 'No se pudo cargar /settings de ActivityWatch.',
        details: { cause: error instanceof Error ? error.message : String(error) },
      },
    }
  }
}

async function resolveDailyUsageContext({ day, requiredBuckets, missingBucketsMessage }) {
  const discovery = await discoverActivityWatchBuckets()
  if (!discovery.ok) {
    return {
      ok: false,
      buckets: discovery.buckets,
      warnings: discovery.warnings,
      error: discovery.error,
      details: null,
      bucketIds: { window: null, afk: null, web: null },
    }
  }

  const bucketIds = {
    window: discovery.buckets.window?.id ?? null,
    afk: discovery.buckets.afk?.id ?? null,
    web: discovery.buckets.web?.id ?? null,
  }

  for (const bucketKey of requiredBuckets) {
    if (!bucketIds[bucketKey]) {
      return {
        ok: false,
        buckets: discovery.buckets,
        warnings: discovery.warnings,
        error: {
          code: 'activitywatch_missing_required_buckets',
          message: missingBucketsMessage,
          details: { missing: discovery.missing },
        },
        details: null,
        bucketIds,
      }
    }
  }

  const settingsResult = await getActivityWatchSettings()
  const startOfDay = settingsResult.ok
    ? settingsResult.settings?.startOfDay ?? DEFAULT_START_OF_DAY
    : DEFAULT_START_OF_DAY
  const dayRange = buildDayRange(day, startOfDay)

  if (!dayRange) {
    return {
      ok: false,
      buckets: discovery.buckets,
      warnings: discovery.warnings,
      error: {
        code: 'activitywatch_invalid_day',
        message: `Dia invalido para calcular uso diario: ${day}.`,
      },
      details: null,
      bucketIds,
    }
  }

  const warnings = [...discovery.warnings]
  if (!settingsResult.ok) {
    warnings.push({
      code: 'settings_unavailable_using_default_start_of_day',
      severity: 'warning',
      message: 'No se pudo leer /settings; se usa startOfDay por defecto 00:00.',
    })
  }

  return {
    ok: true,
    buckets: discovery.buckets,
    warnings,
    error: null,
    bucketIds,
    details: {
      startOfDay,
      timeperiod: dayRange.timeperiod,
      dayRange,
    },
  }
}

async function runQuery({ timeperiod, query }) {
  const response = await fetch(QUERY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeperiods: [timeperiod], query }),
  })

  if (!response.ok) {
    return {
      ok: false,
      payload: null,
      error: {
        code: 'activitywatch_query_http_error',
        message: `ActivityWatch query respondio con HTTP ${response.status}.`,
        details: { status: response.status },
      },
    }
  }

  const payload = await response.json()
  return { ok: true, payload, error: null }
}

export async function getDailyActiveUsage({ day }) {
  const context = await resolveDailyUsageContext({
    day,
    requiredBuckets: ['window', 'afk'],
    missingBucketsMessage: 'Falta bucket window o AFK para calcular tiempo activo diario.',
  })

  if (!context.ok) {
    return {
      ok: false,
      seconds: null,
      buckets: context.buckets,
      warnings: context.warnings,
      error: context.error,
    }
  }

  const query = buildCanonicalDailyActiveQuery({
    windowBucketId: context.bucketIds.window,
    afkBucketId: context.bucketIds.afk,
    webBucketId: context.bucketIds.web,
  })

  try {
    const queryResult = await runQuery({ timeperiod: context.details.timeperiod, query })
    if (!queryResult.ok) {
      return {
        ok: false,
        seconds: null,
        buckets: context.buckets,
        warnings: context.warnings,
        error: queryResult.error,
      }
    }

    const seconds = normalizeQueryTotalSeconds(queryResult.payload)
    if (seconds === null) {
      return {
        ok: false,
        seconds: null,
        buckets: context.buckets,
        warnings: context.warnings,
        error: {
          code: 'activitywatch_query_unexpected_payload',
          message: 'La Query API devolvio un formato no esperado.',
          details: { payload: queryResult.payload },
        },
      }
    }

    return {
      ok: true,
      seconds,
      buckets: context.buckets,
      warnings: context.warnings,
      error: null,
      details: {
        startOfDay: context.details.startOfDay,
        timeperiod: context.details.timeperiod,
      },
    }
  } catch (error) {
    return {
      ok: false,
      seconds: null,
      buckets: context.buckets,
      warnings: context.warnings,
      error: {
        code: 'activitywatch_query_failed',
        message: 'No se pudo completar la query de tiempo activo diario.',
        details: { cause: error instanceof Error ? error.message : String(error) },
      },
    }
  }
}

function aggregateActiveEventsByHour(events, dayRange) {
  const secondsByHour = Array.from({ length: 24 }, () => 0)
  const hourMs = 60 * 60 * 1000
  const dayStartMs = dayRange.start.getTime()
  const dayEndMs = dayRange.end.getTime() + 1

  for (const event of events) {
    const timestamp = new Date(event.timestamp).getTime()
    const durationSeconds = Number(event.duration)
    if (!Number.isFinite(timestamp) || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      continue
    }

    const eventStart = Math.max(timestamp, dayStartMs)
    const eventEnd = Math.min(timestamp + durationSeconds * 1000, dayEndMs)
    if (eventEnd <= eventStart) {
      continue
    }

    let cursor = eventStart
    while (cursor < eventEnd) {
      const index = Math.floor((cursor - dayStartMs) / hourMs)
      if (index < 0 || index >= 24) {
        break
      }

      const currentHourEnd = Math.min(dayStartMs + (index + 1) * hourMs, eventEnd)
      const overlapSeconds = (currentHourEnd - cursor) / 1000
      secondsByHour[index] += overlapSeconds
      cursor = currentHourEnd
    }
  }

  const totalSeconds = secondsByHour.reduce((sum, value) => sum + value, 0)
  return { secondsByHour, totalSeconds }
}

function buildHourlyBars(secondsByHour) {
  const maxSeconds = Math.max(...secondsByHour, 0)
  const highlightedIndex = secondsByHour.findIndex((value) => value === maxSeconds && maxSeconds > 0)

  return secondsByHour.map((seconds, index) => {
    const normalizedValue = maxSeconds > 0 ? (seconds / maxSeconds) * 100 : 0
    return {
      hour: String(index).padStart(2, '0'),
      value: Number(normalizedValue.toFixed(2)),
      highlighted: index === highlightedIndex,
      seconds,
    }
  })
}

function padHour(value) {
  return String(value).padStart(2, '0')
}

function buildHourIntervalLabel(dayRange, hourIndex) {
  const hourMs = 60 * 60 * 1000
  const start = new Date(dayRange.start.getTime() + hourIndex * hourMs)
  const end = new Date(start.getTime() + hourMs)
  return `${padHour(start.getHours())}:00 – ${padHour(end.getHours())}:00`
}

function formatUsageCompactFromSeconds(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0
  const totalMinutes = Math.floor(safeSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) {
    return `${minutes}m`
  }
  return `${hours}h ${minutes}m`
}

export async function getHourlyActiveUsage({ day }) {
  const context = await resolveDailyUsageContext({
    day,
    requiredBuckets: ['window', 'afk'],
    missingBucketsMessage: 'Falta bucket window o AFK para calcular uso por horas.',
  })

  if (!context.ok) {
    return {
      ok: false,
      hourlyBars: null,
      totalSeconds: null,
      warnings: context.warnings,
      error: context.error,
    }
  }

  const query = buildCanonicalDailyEventsQuery({
    windowBucketId: context.bucketIds.window,
    afkBucketId: context.bucketIds.afk,
    webBucketId: context.bucketIds.web,
  })

  try {
    const queryResult = await runQuery({ timeperiod: context.details.timeperiod, query })
    if (!queryResult.ok) {
      return {
        ok: false,
        hourlyBars: null,
        totalSeconds: null,
        warnings: context.warnings,
        error: queryResult.error,
      }
    }

    const events = normalizeQueryEvents(queryResult.payload)
    if (!events) {
      return {
        ok: false,
        hourlyBars: null,
        totalSeconds: null,
        warnings: context.warnings,
        error: {
          code: 'activitywatch_query_unexpected_payload',
          message: 'La Query API devolvio un formato no esperado para eventos horarios.',
          details: { payload: queryResult.payload },
        },
      }
    }

    const aggregation = aggregateActiveEventsByHour(events, context.details.dayRange)
    const hourlyBars = buildHourlyBars(aggregation.secondsByHour)
    return {
      ok: true,
      hourlyBars,
      totalSeconds: aggregation.totalSeconds,
      warnings: context.warnings,
      error: null,
      details: {
        startOfDay: context.details.startOfDay,
        timeperiod: context.details.timeperiod,
      },
    }
  } catch (error) {
    return {
      ok: false,
      hourlyBars: null,
      totalSeconds: null,
      warnings: context.warnings,
      error: {
        code: 'activitywatch_query_failed',
        message: 'No se pudo completar la query de uso por horas.',
        details: { cause: error instanceof Error ? error.message : String(error) },
      },
    }
  }
}

export async function getHourlyUsageDetail({ day, hourIndex }) {
  if (!Number.isInteger(hourIndex) || hourIndex < 0 || hourIndex > 23) {
    return {
      ok: false,
      hourIndex,
      intervalLabel: null,
      totalSeconds: null,
      formattedTotal: null,
      items: [],
      warnings: [],
      error: {
        code: 'activitywatch_invalid_hour_index',
        message: `Franja horaria invalida: ${hourIndex}.`,
      },
    }
  }

  const context = await resolveDailyUsageContext({
    day,
    requiredBuckets: ['window', 'afk'],
    missingBucketsMessage: 'Falta bucket window o AFK para calcular detalle por franja horaria.',
  })

  if (!context.ok) {
    return {
      ok: false,
      hourIndex,
      intervalLabel: null,
      totalSeconds: null,
      formattedTotal: null,
      items: [],
      warnings: context.warnings,
      error: context.error,
    }
  }

  const query = buildCanonicalDailyEventsQuery({
    windowBucketId: context.bucketIds.window,
    afkBucketId: context.bucketIds.afk,
    webBucketId: context.bucketIds.web,
  })

  try {
    const activeQueryResult = await runQuery({ timeperiod: context.details.timeperiod, query })
    if (!activeQueryResult.ok) {
      return {
        ok: false,
        hourIndex,
        intervalLabel: buildHourIntervalLabel(context.details.dayRange, hourIndex),
        totalSeconds: null,
        formattedTotal: null,
        items: [],
        warnings: context.warnings,
        error: activeQueryResult.error,
      }
    }

    const activeEvents = normalizeQueryEvents(activeQueryResult.payload)
    if (!activeEvents) {
      return {
        ok: false,
        hourIndex,
        intervalLabel: buildHourIntervalLabel(context.details.dayRange, hourIndex),
        totalSeconds: null,
        formattedTotal: null,
        items: [],
        warnings: context.warnings,
        error: {
          code: 'activitywatch_query_unexpected_payload',
          message: 'La Query API devolvio un formato no esperado para detalle horario.',
          details: { payload: activeQueryResult.payload },
        },
      }
    }

    let browserDomainEvents = []
    const warnings = [...context.warnings]
    if (context.bucketIds.web) {
      const browserQuery = buildWebsiteBrowserStyleEventsQuery({
        windowBucketId: context.bucketIds.window,
        webBucketId: context.bucketIds.web,
      })
      const browserQueryResult = await runQuery({
        timeperiod: context.details.timeperiod,
        query: browserQuery,
      })
      if (browserQueryResult.ok) {
        const rawBrowserEvents = normalizeQueryEvents(browserQueryResult.payload)
        if (rawBrowserEvents) {
          browserDomainEvents = rawBrowserEvents
            .map((event) => {
              const range = extractEventTimeRange(event)
              if (!range) {
                return null
              }
              return {
                startMs: range.startMs,
                endMs: range.endMs,
                domain: extractDomain(event?.data?.url),
              }
            })
            .filter(Boolean)
            .sort((a, b) => a.startMs - b.startMs)
        } else {
          warnings.push({
            code: 'browser_events_unexpected_payload',
            severity: 'warning',
            message: 'No se pudo interpretar el payload de eventos web; se usa fallback por app.',
          })
        }
      } else {
        warnings.push({
          code: 'browser_events_query_failed',
          severity: 'warning',
          message: 'No se pudo cargar detalle web por franja; se usa fallback por app.',
        })
      }
    }

    const hourMs = 60 * 60 * 1000
    const hourStartMs = context.details.dayRange.start.getTime() + hourIndex * hourMs
    const hourEndMs = hourStartMs + hourMs
    const itemsMap = new Map()
    const addItemSeconds = ({ label, sourceType, seconds }) => {
      if (!Number.isFinite(seconds) || seconds <= 0) {
        return
      }
      const safeLabel = normalizeKey(label, sourceType === 'website' ? 'unknown' : 'unknown-app')
      const key = `${sourceType}:${safeLabel}`
      const current = itemsMap.get(key) ?? { label: safeLabel, sourceType, seconds: 0 }
      current.seconds += seconds
      itemsMap.set(key, current)
    }

    let totalSeconds = 0
    let browserIndex = 0
    for (const event of activeEvents) {
      const range = extractEventTimeRange(event)
      if (!range) {
        continue
      }

      const clippedStart = Math.max(range.startMs, hourStartMs)
      const clippedEnd = Math.min(range.endMs, hourEndMs)
      if (clippedEnd <= clippedStart) {
        continue
      }

      const clippedSeconds = (clippedEnd - clippedStart) / 1000
      totalSeconds += clippedSeconds

      const app = normalizeKey(event?.data?.app, 'unknown-app')
      const isBrowserApp = BROWSER_APP_NAMES.some((name) => toLowerSafe(name) === toLowerSafe(app))

      if (!isBrowserApp || browserDomainEvents.length === 0) {
        addItemSeconds({ label: app, sourceType: 'application', seconds: clippedSeconds })
        continue
      }

      while (browserIndex < browserDomainEvents.length && browserDomainEvents[browserIndex].endMs <= clippedStart) {
        browserIndex += 1
      }

      let coveredMs = 0
      let scanIndex = browserIndex
      while (scanIndex < browserDomainEvents.length && browserDomainEvents[scanIndex].startMs < clippedEnd) {
        const browserEvent = browserDomainEvents[scanIndex]
        const overlapStart = Math.max(clippedStart, browserEvent.startMs)
        const overlapEnd = Math.min(clippedEnd, browserEvent.endMs)
        if (overlapEnd > overlapStart) {
          const overlapSeconds = (overlapEnd - overlapStart) / 1000
          addItemSeconds({
            label: browserEvent.domain,
            sourceType: 'website',
            seconds: overlapSeconds,
          })
          coveredMs += overlapEnd - overlapStart
        }
        scanIndex += 1
      }

      const leftoverMs = Math.max(0, clippedEnd - clippedStart - coveredMs)
      if (leftoverMs > 0) {
        addItemSeconds({
          label: app,
          sourceType: 'application',
          seconds: leftoverMs / 1000,
        })
      }
    }

    const itemsRaw = Array.from(itemsMap.values()).sort((a, b) => b.seconds - a.seconds)
    const items = itemsRaw.map((item) => ({
      label: item.label,
      sourceType: item.sourceType,
      seconds: item.seconds,
      formattedDuration: formatUsageCompactFromSeconds(item.seconds),
      percentage: totalSeconds > 0 ? Number(((item.seconds / totalSeconds) * 100).toFixed(2)) : 0,
    }))

    return {
      ok: true,
      hourIndex,
      intervalLabel: buildHourIntervalLabel(context.details.dayRange, hourIndex),
      totalSeconds,
      formattedTotal: formatUsageCompactFromSeconds(totalSeconds),
      items,
      warnings,
      error: null,
      details: {
        startOfDay: context.details.startOfDay,
        timeperiod: context.details.timeperiod,
      },
    }
  } catch (error) {
    return {
      ok: false,
      hourIndex,
      intervalLabel: buildHourIntervalLabel(context.details.dayRange, hourIndex),
      totalSeconds: null,
      formattedTotal: null,
      items: [],
      warnings: context.warnings,
      error: {
        code: 'activitywatch_query_failed',
        message: 'No se pudo calcular el detalle horario.',
        details: { cause: error instanceof Error ? error.message : String(error) },
      },
    }
  }
}

export async function getDailyApplicationUsage({ day }) {
  const context = await resolveDailyUsageContext({
    day,
    requiredBuckets: ['window', 'afk'],
    missingBucketsMessage: 'Falta bucket window o AFK para calcular uso por aplicacion.',
  })

  if (!context.ok) {
    return {
      ok: false,
      applications: [],
      warnings: context.warnings,
      error: context.error,
      details: context.details,
    }
  }

  const query = buildCanonicalDailyEventsQuery({
    windowBucketId: context.bucketIds.window,
    afkBucketId: context.bucketIds.afk,
    webBucketId: context.bucketIds.web,
  })

  try {
    const queryResult = await runQuery({ timeperiod: context.details.timeperiod, query })
    if (!queryResult.ok) {
      return {
        ok: false,
        applications: [],
        warnings: context.warnings,
        error: queryResult.error,
        details: context.details,
      }
    }

    const events = normalizeQueryEvents(queryResult.payload)
    if (!events) {
      return {
        ok: false,
        applications: [],
        warnings: context.warnings,
        error: {
          code: 'activitywatch_query_unexpected_payload',
          message: 'La Query API devolvio un formato no esperado para aplicaciones.',
          details: { payload: queryResult.payload },
        },
        details: context.details,
      }
    }

    const usageByApp = new Map()
    for (const event of events) {
      const app = normalizeKey(event?.data?.app, 'unknown-app')
      const durationSeconds = Number(event?.duration)
      if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        continue
      }

      const current = usageByApp.get(app) ?? { app, seconds: 0 }
      current.seconds += durationSeconds
      usageByApp.set(app, current)
    }

    const applications = toSortedUsageList(usageByApp).map((entry) => ({
      app: entry.app,
      seconds: entry.seconds,
      formattedDuration: formatUsageFromSeconds(entry.seconds),
      classificationHints: {
        type: 'application',
        app: entry.app,
      },
    }))

    return {
      ok: true,
      applications,
      warnings: context.warnings,
      error: null,
      details: {
        startOfDay: context.details.startOfDay,
        timeperiod: context.details.timeperiod,
        grouping: 'application',
      },
    }
  } catch (error) {
    return {
      ok: false,
      applications: [],
      warnings: context.warnings,
      error: {
        code: 'activitywatch_query_failed',
        message: 'No se pudo completar la query de uso por aplicaciones.',
        details: { cause: error instanceof Error ? error.message : String(error) },
      },
      details: context.details,
    }
  }
}

async function getDailyBrowserDomainEvents({ day }) {
  const context = await resolveDailyUsageContext({
    day,
    requiredBuckets: ['window', 'web'],
    missingBucketsMessage: 'Falta bucket window o web para calcular eventos web por dominio.',
  })

  if (!context.ok) {
    return {
      ok: false,
      events: [],
      warnings: context.warnings,
      error: context.error,
      details: context.details,
    }
  }

  const query = buildWebsiteBrowserStyleEventsQuery({
    windowBucketId: context.bucketIds.window,
    webBucketId: context.bucketIds.web,
  })

  try {
    const queryResult = await runQuery({ timeperiod: context.details.timeperiod, query })
    if (!queryResult.ok) {
      return {
        ok: false,
        events: [],
        warnings: context.warnings,
        error: queryResult.error,
        details: context.details,
      }
    }

    const rawEvents = normalizeQueryEvents(queryResult.payload)
    if (!rawEvents) {
      return {
        ok: false,
        events: [],
        warnings: context.warnings,
        error: {
          code: 'activitywatch_query_unexpected_payload',
          message: 'La Query API devolvio un formato no esperado para eventos web por dominio.',
          details: { payload: queryResult.payload },
        },
        details: context.details,
      }
    }

    const events = rawEvents
      .map((event) => {
        const range = extractEventTimeRange(event)
        if (!range) {
          return null
        }
        return {
          startMs: range.startMs,
          endMs: range.endMs,
          domain: extractDomain(event?.data?.url),
          url: normalizeKey(event?.data?.url, 'unknown'),
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.startMs - b.startMs)

    return {
      ok: true,
      events,
      warnings: context.warnings,
      error: null,
      details: context.details,
    }
  } catch (error) {
    return {
      ok: false,
      events: [],
      warnings: context.warnings,
      error: {
        code: 'activitywatch_query_failed',
        message: 'No se pudo completar la query de eventos web por dominio.',
        details: { cause: error instanceof Error ? error.message : String(error) },
      },
      details: context.details,
    }
  }
}

function aggregateCategoryUsage({ activeEvents, browserDomainEvents, categoryRules, categoryNames }) {
  const totals = ensureCategoryTotals(categoryNames)
  const detailsByCategory = new Map(
    categoryNames.map((category) => [category, { domains: new Set(), apps: new Set() }])
  )
  const itemTotalsByCategory = ensureCategoryItemTotals(categoryNames)
  const fallbackCategory = categoryNames.includes('Otros') ? 'Otros' : categoryNames[0]

  let browserIndex = 0
  for (const event of activeEvents) {
    const range = extractEventTimeRange(event)
    if (!range) {
      continue
    }

    const app = normalizeKey(event?.data?.app, 'unknown-app')
    const isBrowserApp = BROWSER_APP_NAMES.some((name) => toLowerSafe(name) === toLowerSafe(app))

    if (!isBrowserApp) {
      const category = classifyApp(app, categoryRules, categoryNames) ?? fallbackCategory
      totals.set(category, totals.get(category) + range.seconds)
      detailsByCategory.get(category).apps.add(app)
      addCategoryItemUsage(itemTotalsByCategory, {
        category,
        sourceType: 'application',
        label: app,
        seconds: range.seconds,
      })
      continue
    }

    while (browserIndex < browserDomainEvents.length && browserDomainEvents[browserIndex].endMs <= range.startMs) {
      browserIndex += 1
    }

    let coveredMs = 0
    let scanIndex = browserIndex
    while (scanIndex < browserDomainEvents.length && browserDomainEvents[scanIndex].startMs < range.endMs) {
      const browserEvent = browserDomainEvents[scanIndex]
      const overlapStart = Math.max(range.startMs, browserEvent.startMs)
      const overlapEnd = Math.min(range.endMs, browserEvent.endMs)
      if (overlapEnd > overlapStart) {
        const overlapSeconds = (overlapEnd - overlapStart) / 1000
        const category =
          classifyDomain(browserEvent.domain, categoryRules, categoryNames) ?? fallbackCategory
        totals.set(category, totals.get(category) + overlapSeconds)
        detailsByCategory.get(category).domains.add(browserEvent.domain)
        addCategoryItemUsage(itemTotalsByCategory, {
          category,
          sourceType: 'website',
          label: browserEvent.domain,
          seconds: overlapSeconds,
        })
        coveredMs += overlapEnd - overlapStart
      }
      scanIndex += 1
    }

    const leftoverMs = Math.max(0, range.endMs - range.startMs - coveredMs)
    if (leftoverMs > 0) {
      const leftoverCategory =
        classifyApp(app, categoryRules, categoryNames) ?? fallbackCategory
      totals.set(leftoverCategory, totals.get(leftoverCategory) + leftoverMs / 1000)
      detailsByCategory.get(leftoverCategory).apps.add(app)
      addCategoryItemUsage(itemTotalsByCategory, {
        category: leftoverCategory,
        sourceType: 'application',
        label: app,
        seconds: leftoverMs / 1000,
      })
    }
  }

  return {
    totals,
    detailsByCategory,
    itemTotalsByCategory,
  }
}

export async function getDailyWebsiteUsage({ day }) {
  const domainEventsResult = await getDailyBrowserDomainEvents({ day })
  if (!domainEventsResult.ok) {
    return {
      ok: false,
      websites: [],
      warnings: domainEventsResult.warnings,
      error: domainEventsResult.error,
      details: domainEventsResult.details,
    }
  }

  const usageByDomain = new Map()
  for (const event of domainEventsResult.events) {
    const durationSeconds = (event.endMs - event.startMs) / 1000
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
      continue
    }

    const current = usageByDomain.get(event.domain) ?? {
      domain: event.domain,
      seconds: 0,
      sampleUrl: event.url,
    }
    current.seconds += durationSeconds
    usageByDomain.set(event.domain, current)
  }

  const websites = toSortedUsageList(usageByDomain).map((entry) => ({
    domain: entry.domain,
    seconds: entry.seconds,
    formattedDuration: formatUsageFromSeconds(entry.seconds),
    sampleUrl: entry.sampleUrl,
    classificationHints: {
      type: 'website',
      domain: entry.domain,
    },
  }))

  return {
    ok: true,
    websites,
    warnings: domainEventsResult.warnings,
    error: null,
    details: {
      startOfDay: domainEventsResult.details.startOfDay,
      timeperiod: domainEventsResult.details.timeperiod,
      grouping: 'domain_browser_style',
    },
  }
}

export async function getDailyCategoryUsage({ day }) {
  const categoryRules = getCategoryRules()
  const categoryNames = getCategoryNamesFromRules(categoryRules)
  const categoryColors = categoryRules?.[CATEGORY_META_KEY]?.colors ?? {}
  const [dailyActiveResult, activeEventsResult, browserEventsResult] = await Promise.all([
    getDailyActiveUsage({ day }),
    (async () => {
      const context = await resolveDailyUsageContext({
        day,
        requiredBuckets: ['window', 'afk'],
        missingBucketsMessage: 'Falta bucket window o AFK para calcular categorias.',
      })

      if (!context.ok) {
        return {
          ok: false,
          events: [],
          warnings: context.warnings,
          error: context.error,
          details: context.details,
        }
      }

      const query = buildCanonicalDailyEventsQuery({
        windowBucketId: context.bucketIds.window,
        afkBucketId: context.bucketIds.afk,
        webBucketId: context.bucketIds.web,
      })

      try {
        const queryResult = await runQuery({ timeperiod: context.details.timeperiod, query })
        if (!queryResult.ok) {
          return {
            ok: false,
            events: [],
            warnings: context.warnings,
            error: queryResult.error,
            details: context.details,
          }
        }

        const events = normalizeQueryEvents(queryResult.payload)
        if (!events) {
          return {
            ok: false,
            events: [],
            warnings: context.warnings,
            error: {
              code: 'activitywatch_query_unexpected_payload',
              message: 'La Query API devolvio un formato no esperado para eventos activos.',
              details: { payload: queryResult.payload },
            },
            details: context.details,
          }
        }

        return {
          ok: true,
          events,
          warnings: context.warnings,
          error: null,
          details: context.details,
        }
      } catch (error) {
        return {
          ok: false,
          events: [],
          warnings: context.warnings,
          error: {
            code: 'activitywatch_query_failed',
            message: 'No se pudo obtener la base de eventos activos para categorias.',
            details: { cause: error instanceof Error ? error.message : String(error) },
          },
          details: context.details,
        }
      }
    })(),
    getDailyBrowserDomainEvents({ day }),
  ])

  const combinedWarnings = [
    ...(dailyActiveResult.warnings ?? []),
    ...(activeEventsResult.warnings ?? []),
    ...(browserEventsResult.warnings ?? []),
  ]

  if (!dailyActiveResult.ok) {
    return {
      ok: false,
      categories: [],
      totalSeconds: null,
      warnings: combinedWarnings,
      error: dailyActiveResult.error,
      details: null,
    }
  }

  if (!activeEventsResult.ok) {
    return {
      ok: false,
      categories: [],
      totalSeconds: dailyActiveResult.seconds,
      warnings: combinedWarnings,
      error: activeEventsResult.error,
      details: null,
    }
  }

  if (!browserEventsResult.ok) {
    return {
      ok: false,
      categories: [],
      totalSeconds: dailyActiveResult.seconds,
      warnings: combinedWarnings,
      error: browserEventsResult.error,
      details: null,
    }
  }

  const aggregation = aggregateCategoryUsage({
    activeEvents: activeEventsResult.events,
    browserDomainEvents: browserEventsResult.events,
    categoryRules,
    categoryNames,
  })

  const totalSeconds = Array.from(aggregation.totals.values()).reduce((acc, value) => acc + value, 0)
  const categories = categoryNames.map((category) => {
    const seconds = aggregation.totals.get(category) ?? 0
    const percentage = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0
    return {
      category,
      seconds,
      formattedDuration: formatUsageFromSeconds(seconds),
      percentage: Number(percentage.toFixed(2)),
      color: resolveCategoryColor(category, categoryColors),
    }
  })

  return {
    ok: true,
    categories,
    totalSeconds,
    warnings: combinedWarnings,
    error: null,
    details: {
      day,
      classificationPriority: 'domain_then_app_then_otros',
      categoryRules,
      kpiTotalSeconds: dailyActiveResult.seconds,
    },
  }
}

export async function getDailyCategoryDetailUsage({ day, category }) {
  const categoryRules = getCategoryRules()
  const categoryNames = getCategoryNamesFromRules(categoryRules)
  const targetCategory = categoryNames.includes(category) ? category : null
  if (!targetCategory) {
    return {
      ok: false,
      category: category ?? null,
      totalSeconds: null,
      formattedTotal: null,
      items: [],
      warnings: [],
      error: {
        code: 'activitywatch_invalid_category',
        message: `Categoria invalida para detalle diario: ${category}.`,
      },
      details: null,
    }
  }

  const [dailyActiveResult, activeEventsResult, browserEventsResult] = await Promise.all([
    getDailyActiveUsage({ day }),
    (async () => {
      const context = await resolveDailyUsageContext({
        day,
        requiredBuckets: ['window', 'afk'],
        missingBucketsMessage: 'Falta bucket window o AFK para calcular detalle de categoria.',
      })

      if (!context.ok) {
        return {
          ok: false,
          events: [],
          warnings: context.warnings,
          error: context.error,
          details: context.details,
        }
      }

      const query = buildCanonicalDailyEventsQuery({
        windowBucketId: context.bucketIds.window,
        afkBucketId: context.bucketIds.afk,
        webBucketId: context.bucketIds.web,
      })

      try {
        const queryResult = await runQuery({ timeperiod: context.details.timeperiod, query })
        if (!queryResult.ok) {
          return {
            ok: false,
            events: [],
            warnings: context.warnings,
            error: queryResult.error,
            details: context.details,
          }
        }

        const events = normalizeQueryEvents(queryResult.payload)
        if (!events) {
          return {
            ok: false,
            events: [],
            warnings: context.warnings,
            error: {
              code: 'activitywatch_query_unexpected_payload',
              message: 'La Query API devolvio un formato no esperado para eventos de detalle de categoria.',
              details: { payload: queryResult.payload },
            },
            details: context.details,
          }
        }

        return {
          ok: true,
          events,
          warnings: context.warnings,
          error: null,
          details: context.details,
        }
      } catch (error) {
        return {
          ok: false,
          events: [],
          warnings: context.warnings,
          error: {
            code: 'activitywatch_query_failed',
            message: 'No se pudo obtener la base de eventos para detalle de categoria.',
            details: { cause: error instanceof Error ? error.message : String(error) },
          },
          details: context.details,
        }
      }
    })(),
    getDailyBrowserDomainEvents({ day }),
  ])

  const combinedWarnings = [
    ...(dailyActiveResult.warnings ?? []),
    ...(activeEventsResult.warnings ?? []),
    ...(browserEventsResult.warnings ?? []),
  ]

  if (!dailyActiveResult.ok) {
    return {
      ok: false,
      category: targetCategory,
      totalSeconds: null,
      formattedTotal: null,
      items: [],
      warnings: combinedWarnings,
      error: dailyActiveResult.error,
      details: null,
    }
  }

  if (!activeEventsResult.ok) {
    return {
      ok: false,
      category: targetCategory,
      totalSeconds: null,
      formattedTotal: null,
      items: [],
      warnings: combinedWarnings,
      error: activeEventsResult.error,
      details: null,
    }
  }

  if (!browserEventsResult.ok) {
    return {
      ok: false,
      category: targetCategory,
      totalSeconds: null,
      formattedTotal: null,
      items: [],
      warnings: combinedWarnings,
      error: browserEventsResult.error,
      details: null,
    }
  }

  const aggregation = aggregateCategoryUsage({
    activeEvents: activeEventsResult.events,
    browserDomainEvents: browserEventsResult.events,
    categoryRules,
    categoryNames,
  })
  const totalSeconds = aggregation.totals.get(targetCategory) ?? 0
  const itemsRaw = Array.from(aggregation.itemTotalsByCategory.get(targetCategory)?.values() ?? [])
    .sort((a, b) => b.seconds - a.seconds)

  const items = itemsRaw.map((item) => ({
    label: item.label,
    sourceType: item.sourceType,
    seconds: item.seconds,
    formattedDuration: formatUsageFromSeconds(item.seconds),
    percentage: totalSeconds > 0 ? Number(((item.seconds / totalSeconds) * 100).toFixed(2)) : 0,
  }))

  return {
    ok: true,
    category: targetCategory,
    totalSeconds,
    formattedTotal: formatUsageFromSeconds(totalSeconds),
    items,
    warnings: combinedWarnings,
    error: null,
    details: {
      day,
      classificationPriority: 'domain_then_app_then_otros',
      categoryRules,
      kpiTotalSeconds: dailyActiveResult.seconds,
    },
  }
}

export async function getRangeActiveUsage({ startDay, endDay }) {
  const days = getIsoDaysInRange({ startDay, endDay })
  if (days.length === 0) {
    return {
      ok: false,
      totalSeconds: null,
      warnings: [],
      error: {
        code: 'activitywatch_invalid_day_range',
        message: 'El rango de dias solicitado no es valido.',
        details: { startDay, endDay },
      },
      details: null,
    }
  }

  const results = await Promise.all(days.map((day) => getDailyActiveUsage({ day })))
  const firstError = results.find((result) => !result.ok)
  if (firstError) {
    return {
      ok: false,
      totalSeconds: null,
      warnings: results.flatMap((result) => result.warnings ?? []),
      error: firstError.error,
      details: { startDay, endDay, days },
    }
  }

  const totalSeconds = results.reduce((sum, result) => sum + (result.seconds ?? 0), 0)
  return {
    ok: true,
    totalSeconds,
    formattedTotal: formatUsageFromSeconds(totalSeconds),
    warnings: results.flatMap((result) => result.warnings ?? []),
    error: null,
    details: { startDay, endDay, days },
  }
}

export async function getRangeDailyUsageSeries({ startDay, endDay }) {
  const days = getIsoDaysInRange({ startDay, endDay })
  if (days.length === 0) {
    return {
      ok: false,
      dailySeries: [],
      warnings: [],
      error: {
        code: 'activitywatch_invalid_day_range',
        message: 'El rango de dias solicitado no es valido.',
        details: { startDay, endDay },
      },
      details: null,
    }
  }

  const results = await Promise.all(
    days.map(async (day) => ({
      day,
      usage: await getDailyActiveUsage({ day }),
    }))
  )
  const firstError = results.find((entry) => !entry.usage.ok)
  if (firstError) {
    return {
      ok: false,
      dailySeries: [],
      warnings: results.flatMap((entry) => entry.usage.warnings ?? []),
      error: firstError.usage.error,
      details: { startDay, endDay, days },
    }
  }

  const dailySeries = results.map((entry) => {
    const seconds = entry.usage.seconds ?? 0
    return {
      day: entry.day,
      seconds,
      formattedDuration: formatUsageFromSeconds(seconds),
    }
  })

  return {
    ok: true,
    dailySeries,
    warnings: results.flatMap((entry) => entry.usage.warnings ?? []),
    error: null,
    details: { startDay, endDay, days },
  }
}

export async function getRangeCategoryUsage({ startDay, endDay }) {
  const days = getIsoDaysInRange({ startDay, endDay })
  if (days.length === 0) {
    return {
      ok: false,
      categories: [],
      totalSeconds: null,
      warnings: [],
      error: {
        code: 'activitywatch_invalid_day_range',
        message: 'El rango de dias solicitado no es valido.',
        details: { startDay, endDay },
      },
      details: null,
    }
  }

  const results = await Promise.all(days.map((day) => getDailyCategoryUsage({ day })))
  const firstError = results.find((result) => !result.ok)
  if (firstError) {
    return {
      ok: false,
      categories: [],
      totalSeconds: null,
      warnings: results.flatMap((result) => result.warnings ?? []),
      error: firstError.error,
      details: { startDay, endDay, days },
    }
  }

  const categoryTotals = new Map()
  for (const result of results) {
    for (const category of result.categories ?? []) {
      const current = categoryTotals.get(category.category) ?? {
        category: category.category,
        seconds: 0,
        color: category.color,
      }
      current.seconds += category.seconds ?? 0
      categoryTotals.set(category.category, current)
    }
  }

  const totalSeconds = Array.from(categoryTotals.values()).reduce(
    (sum, category) => sum + category.seconds,
    0
  )

  const categories = Array.from(categoryTotals.values()).map((category) => ({
    category: category.category,
    seconds: category.seconds,
    formattedDuration: formatUsageFromSeconds(category.seconds),
    percentage: totalSeconds > 0 ? Number(((category.seconds / totalSeconds) * 100).toFixed(2)) : 0,
    color: category.color,
  }))

  return {
    ok: true,
    categories,
    totalSeconds,
    warnings: results.flatMap((result) => result.warnings ?? []),
    error: null,
    details: { startDay, endDay, days },
  }
}

export async function getRangeCategoryDetailUsage({ startDay, endDay, category }) {
  const days = getIsoDaysInRange({ startDay, endDay })
  if (days.length === 0) {
    return {
      ok: false,
      category,
      totalSeconds: null,
      formattedTotal: null,
      items: [],
      warnings: [],
      error: {
        code: 'activitywatch_invalid_day_range',
        message: 'El rango de dias solicitado no es valido.',
        details: { startDay, endDay },
      },
      details: null,
    }
  }

  const results = await Promise.all(
    days.map((day) => getDailyCategoryDetailUsage({ day, category }))
  )
  const firstError = results.find((result) => !result.ok)
  if (firstError) {
    return {
      ok: false,
      category,
      totalSeconds: null,
      formattedTotal: null,
      items: [],
      warnings: results.flatMap((result) => result.warnings ?? []),
      error: firstError.error,
      details: { startDay, endDay, days },
    }
  }

  const itemTotals = new Map()
  let totalSeconds = 0
  for (const result of results) {
    totalSeconds += result.totalSeconds ?? 0
    for (const item of result.items ?? []) {
      const key = `${item.sourceType}:${item.label}`
      const current = itemTotals.get(key) ?? {
        label: item.label,
        sourceType: item.sourceType,
        seconds: 0,
      }
      current.seconds += item.seconds ?? 0
      itemTotals.set(key, current)
    }
  }

  const items = Array.from(itemTotals.values())
    .sort((a, b) => b.seconds - a.seconds)
    .map((item) => ({
      label: item.label,
      sourceType: item.sourceType,
      seconds: item.seconds,
      formattedDuration: formatUsageFromSeconds(item.seconds),
      percentage: totalSeconds > 0 ? Number(((item.seconds / totalSeconds) * 100).toFixed(2)) : 0,
    }))

  return {
    ok: true,
    category,
    totalSeconds,
    formattedTotal: formatUsageFromSeconds(totalSeconds),
    items,
    warnings: results.flatMap((result) => result.warnings ?? []),
    error: null,
    details: { startDay, endDay, days },
  }
}

export function formatUsageFromSeconds(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0
  const totalMinutes = Math.floor(safeSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}
