// Simple script to generate a secure NextAuth secret
const crypto = require('crypto')

const secret = crypto.randomBytes(32).toString('base64')

console.log('\n🔐 Generated NextAuth Secret:\n')
console.log(secret)
console.log('\nAdd this to your .env.local file:')
console.log('NEXTAUTH_SECRET=' + secret)
console.log('\n')

