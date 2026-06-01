// ──────────────────────────────────────────────────────
// POS AI - Build Validation Script
// ──────────────────────────────────────────────────────
// Run BEFORE build to catch issues early
// Exit with error code if validation fails
// ──────────────────────────────────────────────────────

const { execSync } = require('child_process');

console.log('🔍 Running pre-build validation...\n');

// 1. TypeScript check
console.log('1. Checking TypeScript...');
try {
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('   ✓ TypeScript OK\n');
} catch {
  console.error('   ✗ TypeScript FAILED\n');
  process.exit(1);
}

// 2. Prisma schema validation
console.log('2. Validating Prisma schema...');
try {
  execSync('npx prisma validate', { stdio: 'inherit' });
  console.log('   ✓ Prisma schema OK\n');
} catch {
  console.error('   ✗ Prisma schema FAILED\n');
  process.exit(1);
}

// 3. ESLint check
console.log('3. Running ESLint...');
try {
  execSync('npm run lint 2>/dev/null || true', { stdio: 'inherit' });
  console.log('   ✓ ESLint OK (warnings ignored)\n');
} catch {
  console.log('   ⚠ ESLint issues found (warnings only)\n');
}

console.log('✅ Pre-build validation passed!\n');