#!/usr/bin/env node

/**
 * Health check script for Vercel deployments
 * Validates build outputs and package.json syntax
 * Can be run in CI or locally
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

let exitCode = 0
const errors = []
const warnings = []

console.log('🏥 Vercel Deployment Health Check')
console.log('==================================\n')

/**
 * Check if build output exists for a workspace
 */
function checkBuildOutput(workspace, outputDir) {
  const buildPath = join(rootDir, 'packages', workspace, outputDir)
  if (existsSync(buildPath)) {
    console.log(`✅ Build output exists: packages/${workspace}/${outputDir}`)
    return true
  } else {
    errors.push(`Build output missing: packages/${workspace}/${outputDir}`)
    console.log(`❌ Build output missing: packages/${workspace}/${outputDir}`)
    return false
  }
}

/**
 * Validate JSON file syntax
 */
function validateJsonFile(filePath, description) {
  const fullPath = join(rootDir, filePath)
  if (!existsSync(fullPath)) {
    warnings.push(`${description} not found: ${filePath}`)
    console.log(`⚠️  ${description} not found: ${filePath}`)
    return false
  }

  try {
    const content = readFileSync(fullPath, 'utf8')
    JSON.parse(content)
    console.log(`✅ ${description} valid: ${filePath}`)
    return true
  } catch (error) {
    errors.push(`${description} invalid JSON: ${filePath} - ${error.message}`)
    console.log(`❌ ${description} invalid JSON: ${filePath}`)
    console.log(`   Error: ${error.message}`)
    return false
  }
}

// Check target workspace from environment
const targetWorkspace = process.env.VERCEL_TARGET_WORKSPACE || 'demo-dashboard'
console.log(`Target workspace: ${targetWorkspace}\n`)

// Validate package.json files
console.log('📦 Validating package.json files...')
validateJsonFile('package.json', 'Root package.json')
validateJsonFile(`packages/${targetWorkspace}/package.json`, 'Workspace package.json')

// Validate vercel.json files
console.log('\n🔧 Validating vercel.json files...')
validateJsonFile('vercel.json', 'Root vercel.json')

// Check build outputs based on target workspace
console.log('\n🏗️  Checking build outputs...')
if (targetWorkspace === 'demo-dashboard') {
  checkBuildOutput('demo-dashboard', 'dist')
} else if (targetWorkspace === 'bickford-mobile-ui') {
  checkBuildOutput('bickford-mobile-ui', 'dist')
} else if (targetWorkspace === 'web-ui') {
  checkBuildOutput('web-ui', 'dist')
}

// Check node_modules exists
console.log('\n📚 Checking dependencies...')
if (existsSync(join(rootDir, 'node_modules'))) {
  console.log('✅ Dependencies installed')
} else {
  warnings.push('Dependencies not installed')
  console.log('⚠️  Dependencies not installed')
}

// Summary
console.log('\n==================================')
console.log('📊 Health Check Summary\n')

if (errors.length > 0) {
  console.log(`❌ Errors (${errors.length}):`)
  errors.forEach(err => console.log(`   - ${err}`))
  exitCode = 1
}

if (warnings.length > 0) {
  console.log(`⚠️  Warnings (${warnings.length}):`)
  warnings.forEach(warn => console.log(`   - ${warn}`))
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All checks passed!')
  exitCode = 0
} else if (errors.length === 0) {
  console.log('✅ No critical errors (warnings only)')
  exitCode = 0
}

console.log('==================================\n')

process.exit(exitCode)
