import { discoverActivityWatchBuckets, getActivityWatchApiBaseUrl } from '../src/lib/api/activitywatch.js'

function printBucket(label, bucket) {
  if (!bucket) {
    console.log(`- ${label}: NOT FOUND`)
    return
  }

  console.log(`- ${label}: ${bucket.id} (${bucket.type ?? 'unknown-type'})`)
}

async function run() {
  console.log('ActivityWatch buckets check')
  console.log(`API base: ${getActivityWatchApiBaseUrl()}`)
  console.log('')

  const result = await discoverActivityWatchBuckets()

  console.log(`- ActivityWatch responde: ${result.ok ? 'SI' : 'NO'}`)
  printBucket('window', result.buckets.window)
  printBucket('afk', result.buckets.afk)
  printBucket('web', result.buckets.web)
  console.log(`- missing: ${result.missing.length > 0 ? result.missing.join(', ') : 'none'}`)

  if (result.warnings.length > 0) {
    console.log('- warnings:')
    for (const warning of result.warnings) {
      console.log(`  - [${warning.severity}] ${warning.code}: ${warning.message}`)
    }
  } else {
    console.log('- warnings: none')
  }

  if (result.error) {
    console.log(`- error: [${result.error.code}] ${result.error.message}`)
    if (result.error.details) {
      console.log(`  details: ${JSON.stringify(result.error.details)}`)
    }
  } else {
    console.log('- error: none')
  }
}

run().catch((error) => {
  console.error('Fallo al ejecutar la comprobacion de buckets.')
  console.error(error)
  process.exitCode = 1
})
