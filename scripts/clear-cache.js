const fs = require('fs')
const path = require('path')

const nextDir = path.join(__dirname, '..', '.next')

if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true })
  console.log('✅ Cache cleared successfully!')
} else {
  console.log('ℹ️  No cache to clear.')
}

