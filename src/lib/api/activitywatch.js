const ACTIVITYWATCH_API_BASE_URL = 'http://localhost:5600/api/0'
const BUCKETS_ENDPOINT = `${ACTIVITYWATCH_API_BASE_URL}/buckets/`
const QUERY_ENDPOINT = `${ACTIVITYWATCH_API_BASE_URL}/query/`

export function getActivityWatchApiBaseUrl() {
  return ACTIVITYWATCH_API_BASE_URL
}

function toIsoDayInterval(day) {
  return `${day}T00:00:00+00:00/${day}T23:59:59+00:00`
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

function resolveWindowBucket(buckets) {
  return pickBucketByType(buckets, 'currentwindow') ?? pickBucketByIdPrefix(buckets, 'aw-watcher-window')
}

function resolveAfkBucket(buckets) {
  return pickBucketByType(buckets, 'afkstatus') ?? pickBucketByIdPrefix(buckets, 'aw-watcher-afk')
}

function resolveWebBucket(buckets) {
  return (
    pickBucketByType(buckets, 'web.tab.current') ??
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
    const webBucket = resolveWebBucket(buckets)

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

  const timeperiods = [toIsoDayInterval(day)]
  const query = [
    `afk = flood(query_bucket(find_bucket("${afkBucketId}")));`,
    'afk = filter_keyvals(afk, "status", ["not-afk"]);',
    `window = flood(query_bucket(find_bucket("${windowBucketId}")));`,
    'window = filter_period_intersect(window, afk);',
    'RETURN = sum_durations(window);',
  ]

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
        warnings: discovery.warnings,
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
        warnings: discovery.warnings,
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
      warnings: discovery.warnings,
      error: null,
    }
  } catch (error) {
    return {
      ok: false,
      seconds: null,
      buckets: discovery.buckets,
      warnings: discovery.warnings,
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
