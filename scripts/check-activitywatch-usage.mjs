import {
  getDailyApplicationUsage,
  getDailyWebsiteUsage,
  getActivityWatchApiBaseUrl,
} from '../src/lib/api/activitywatch.js'

const DAY = '2026-05-16'
const TOP_ITEMS = 8

function printWarnings(warnings) {
  if (!warnings || warnings.length === 0) {
    console.log('warnings: none')
    return
  }

  console.log('warnings:')
  for (const warning of warnings) {
    console.log(`- [${warning.severity}] ${warning.code}: ${warning.message}`)
  }
}

function printError(error) {
  if (!error) {
    console.log('error: none')
    return
  }

  console.log(`error: [${error.code}] ${error.message}`)
  if (error.details) {
    console.log(`details: ${JSON.stringify(error.details)}`)
  }
}

async function run() {
  console.log('[DATA-05-VERIFY] Daily application and website usage')
  console.log(`API base: ${getActivityWatchApiBaseUrl()}`)
  console.log(`day: ${DAY}`)
  console.log('')

  const applicationsResult = await getDailyApplicationUsage({ day: DAY })
  const websitesResult = await getDailyWebsiteUsage({ day: DAY })

  console.log('1) applications:')
  if (!applicationsResult.ok || applicationsResult.applications.length === 0) {
    console.log('- sin datos')
  } else {
    for (const item of applicationsResult.applications.slice(0, TOP_ITEMS)) {
      console.log(`- ${item.app} — ${item.formattedDuration} (${item.seconds.toFixed(2)}s)`)
    }
  }
  printWarnings(applicationsResult.warnings)
  printError(applicationsResult.error)
  console.log('')

  console.log('2) websites:')
  if (!websitesResult.ok || websitesResult.websites.length === 0) {
    console.log('- sin datos')
  } else {
    for (const item of websitesResult.websites.slice(0, TOP_ITEMS)) {
      console.log(
        `- ${item.domain} — ${item.formattedDuration} (${item.seconds.toFixed(2)}s) [sample: ${item.sampleUrl}]`
      )
    }
  }
  printWarnings(websitesResult.warnings)
  printError(websitesResult.error)
  console.log('')

  console.log('3) notas de agrupacion o normalizacion:')
  console.log('- websites agrupados por dominio (hostname sin "www.").')
  console.log('- si URL no es parseable, se agrupa en "unknown".')
}

run().catch((error) => {
  console.error('Fallo al ejecutar la comprobacion DATA-05.')
  console.error(error)
  process.exitCode = 1
})
