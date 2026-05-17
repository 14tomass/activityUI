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

function buildDayTimeperiod(day, startOfDay = DEFAULT_START_OF_DAY) {
  const [year, month, date] = day.split('-').map((part) => Number.parseInt(part, 10))
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(date)
  ) {
    return null
  }

  const { hours, minutes } = parseStartOfDay(startOfDay)
  const start = new Date(year, month - 1, date, hours, minutes, 0, 0)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1000)

  return `${formatDateWithOffset(start)}/${formatDateWithOffset(end)}`
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

  return (
    webTypeBuckets[0] ??
    pickBucketByIdPrefix(buckets, 'aw-watcher-web-') ??
    null
  )
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
        window: windowBucket
          ? { id: windowBucket.id, type: windowBucket.type ?? null }
          : null,
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
    return {
      ok: true,
      settings: payload,
      error: null,
    }
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

export async function getDailyActiveUsage({ day }) {
  const discovery = await discoverActivityWatchBuckets()

  if (!discovery.ok) {
    return {
      ok: false,
      seconds: null,
      buckets: discovery.buckets,
      warnings: discovery.warnings,
      error: discovery.error,
    }
  }

  const windowBucketId = discovery.buckets.window?.id ?? null
  const afkBucketId = discovery.buckets.afk?.id ?? null
  const webBucketId = discovery.buckets.web?.id ?? null

  if (!windowBucketId || !afkBucketId) {
    return {
      ok: false,
      seconds: null,
      buckets: discovery.buckets,
      warnings: discovery.warnings,
      error: {
        code: 'activitywatch_missing_required_buckets',
        message: 'Falta bucket window o AFK para calcular tiempo activo diario.',
        details: { missing: discovery.missing },
      },
    }
  }

  const settingsResult = await getActivityWatchSettings()
  const startOfDay = settingsResult.ok
    ? settingsResult.settings?.startOfDay ?? DEFAULT_START_OF_DAY
    : DEFAULT_START_OF_DAY
  const timeperiod = buildDayTimeperiod(day, startOfDay)

  if (!timeperiod) {
    return {
      ok: false,
      seconds: null,
      buckets: discovery.buckets,
      warnings: discovery.warnings,
      error: {
        code: 'activitywatch_invalid_day',
        message: `Dia invalido para calcular uso diario: ${day}.`,
      },
    }
  }

  const timeperiods = [timeperiod]
  const query = buildCanonicalDailyActiveQuery({
    windowBucketId,
    afkBucketId,
    webBucketId,
  })
  const mergedWarnings = [...discovery.warnings]
  if (!settingsResult.ok) {
    mergedWarnings.push({
      code: 'settings_unavailable_using_default_start_of_day',
      severity: 'warning',
      message: 'No se pudo leer /settings; se usa startOfDay por defecto 00:00.',
    })
  }

  try {
    const response = await fetch(QUERY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeperiods, query }),
    })

    if (!response.ok) {
      return {
        ok: false,
        seconds: null,
        buckets: discovery.buckets,
        warnings: mergedWarnings,
        error: {
          code: 'activitywatch_query_http_error',
          message: `ActivityWatch query respondio con HTTP ${response.status}.`,
          details: { status: response.status },
        },
      }
    }

    const payload = await response.json()
    const seconds = normalizeQueryTotalSeconds(payload)

    if (seconds === null) {
      return {
        ok: false,
        seconds: null,
        buckets: discovery.buckets,
        warnings: mergedWarnings,
        error: {
          code: 'activitywatch_query_unexpected_payload',
          message: 'La Query API devolvio un formato no esperado.',
          details: { payload },
        },
      }
    }

    return {
      ok: true,
      seconds,
      buckets: discovery.buckets,
      warnings: mergedWarnings,
      error: null,
      details: {
        startOfDay,
        timeperiod,
      },
    }
  } catch (error) {
    return {
      ok: false,
      seconds: null,
      buckets: discovery.buckets,
      warnings: mergedWarnings,
      error: {
        code: 'activitywatch_query_failed',
        message: 'No se pudo completar la query de tiempo activo diario.',
        details: { cause: error instanceof Error ? error.message : String(error) },
      },
    }
  }
}

export function formatUsageFromSeconds(totalSeconds) {
  const safeSeconds = Number.isFinite(totalSeconds) ? Math.max(0, Math.floor(totalSeconds)) : 0
  const totalMinutes = Math.floor(safeSeconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h ${minutes}m`
}
