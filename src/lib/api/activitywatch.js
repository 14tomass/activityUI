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

const CATEGORY_DOMAIN_RULES = {
  Estudio: ['chatgpt.com', 'stackoverflow.com', 'notion.so'],
  Entretenimiento: ['youtube.com', 'tiktok.com', 'instagram.com', 'x.com'],
  Productividad: [],
}

const CATEGORY_APP_RULES = {
  Estudio: [],
  Entretenimiento: [],
  Productividad: ['codex.exe', 'windowsterminal.exe', 'code.exe', 'explorer.exe', 'notion.exe'],
}

export function getActivityWatchApiBaseUrl() {
  return ACTIVITYWATCH_API_BASE_URL
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
  const normalizedDomain = toLowerSafe(domain)
  const normalizedRule = toLowerSafe(rule)
  return normalizedDomain === normalizedRule || normalizedDomain.endsWith(`.${normalizedRule}`)
}

function classifyDomain(domain) {
  for (const category of Object.keys(CATEGORY_DOMAIN_RULES)) {
    const rules = CATEGORY_DOMAIN_RULES[category]
    if (rules.some((rule) => domainMatchesRule(domain, rule))) {
      return category
    }
  }
  return null
}

function classifyApp(app) {
  const normalizedApp = toLowerSafe(app)
  for (const category of Object.keys(CATEGORY_APP_RULES)) {
    const rules = CATEGORY_APP_RULES[category]
    if (rules.some((rule) => normalizedApp === toLowerSafe(rule))) {
      return category
    }
  }
  return null
}

function ensureCategoryTotals() {
  return new Map(CATEGORY_KEYS.map((category) => [category, 0]))
}

function ensureCategoryItemTotals() {
  return new Map(CATEGORY_KEYS.map((category) => [category, new Map()]))
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

function aggregateCategoryUsage({ activeEvents, browserDomainEvents }) {
  const totals = ensureCategoryTotals()
  const detailsByCategory = new Map(CATEGORY_KEYS.map((category) => [category, { domains: new Set(), apps: new Set() }]))
  const itemTotalsByCategory = ensureCategoryItemTotals()

  let browserIndex = 0
  for (const event of activeEvents) {
    const range = extractEventTimeRange(event)
    if (!range) {
      continue
    }

    const app = normalizeKey(event?.data?.app, 'unknown-app')
    const isBrowserApp = BROWSER_APP_NAMES.some((name) => toLowerSafe(name) === toLowerSafe(app))

    if (!isBrowserApp) {
      const category = classifyApp(app) ?? 'Otros'
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
        const category = classifyDomain(browserEvent.domain) ?? 'Otros'
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
      const fallbackCategory = classifyApp(app) ?? 'Otros'
      totals.set(fallbackCategory, totals.get(fallbackCategory) + leftoverMs / 1000)
      detailsByCategory.get(fallbackCategory).apps.add(app)
      addCategoryItemUsage(itemTotalsByCategory, {
        category: fallbackCategory,
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
  })

  const totalSeconds = Array.from(aggregation.totals.values()).reduce((acc, value) => acc + value, 0)
  const categories = CATEGORY_KEYS.map((category) => {
    const seconds = aggregation.totals.get(category) ?? 0
    const percentage = totalSeconds > 0 ? (seconds / totalSeconds) * 100 : 0
    return {
      category,
      seconds,
      formattedDuration: formatUsageFromSeconds(seconds),
      percentage: Number(percentage.toFixed(2)),
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
      categoryRules: {
        domain: CATEGORY_DOMAIN_RULES,
        app: CATEGORY_APP_RULES,
      },
      kpiTotalSeconds: dailyActiveResult.seconds,
    },
  }
}

export async function getDailyCategoryDetailUsage({ day, category }) {
  const targetCategory = CATEGORY_KEYS.includes(category) ? category : null
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
      kpiTotalSeconds: dailyActiveResult.seconds,
    },
  }
}

export function formatUsageFromSeconds(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0
  const totalMinutes = Math.floor(safeSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}
