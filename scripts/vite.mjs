import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const viteCliPath = fileURLToPath(
  new URL('../node_modules/vite/bin/vite.js', import.meta.url),
)

const child = spawn(process.execPath, [viteCliPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    CHOKIDAR_USEPOLLING: process.env.CHOKIDAR_USEPOLLING ?? '1',
  },
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
