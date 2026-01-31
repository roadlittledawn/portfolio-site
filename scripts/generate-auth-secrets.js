#!/usr/bin/env node
/**
 * Generate authentication secrets for the admin panel
 *
 * Usage:
 *   node scripts/generate-auth-secrets.js                    # Generate only AUTH_SECRET
 *   node scripts/generate-auth-secrets.js <password>         # Generate AUTH_SECRET + password hash
 *   node scripts/generate-auth-secrets.js --password-only <password>  # Generate only password hash
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const args = process.argv.slice(2);
const passwordOnlyFlag = args.includes('--password-only');
const password = passwordOnlyFlag ? args[args.indexOf('--password-only') + 1] : args[0];

console.log('\n🔐 Auth Secrets Generator\n');
console.log('='.repeat(50));

// Generate AUTH_SECRET
if (!passwordOnlyFlag) {
  const authSecret = crypto.randomBytes(32).toString('hex');
  console.log('\n📌 AUTH_SECRET (for JWT signing):');
  console.log(`AUTH_SECRET=${authSecret}`);
}

// Generate password hash if provided
if (password) {
  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);
  console.log('\n📌 ADMIN_PASSWORD_HASH (bcrypt):');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
} else if (!passwordOnlyFlag) {
  console.log('\n💡 To also generate a password hash, run:');
  console.log('   node scripts/generate-auth-secrets.js <your-password>');
}

console.log('\n' + '='.repeat(50));
console.log('\n✅ Add these values to your .env file\n');

if (!passwordOnlyFlag) {
  console.log('Example .env configuration:');
  console.log('---');
  console.log('AUTH_SECRET=<generated-secret-above>');
  console.log('ADMIN_USERNAME=<your-username>');
  console.log('ADMIN_PASSWORD_HASH=<generated-hash-above>');
  console.log('---\n');
}
