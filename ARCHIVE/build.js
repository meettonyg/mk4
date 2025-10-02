#!/usr/bin/env node
/**
 * Build script for Media Kit Builder lean bundle
 * This rebuilds the bundle with all the latest fixes
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Media Kit Builder Lean Bundle...\n');

try {
  // Check if we're in the right directory
  const packageJson = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packageJson)) {
    throw new Error('package.json not found. Are you in the right directory?');
  }

  // Check if node_modules exists
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
  }

  // Run the build
  console.log('🔨 Building bundle...');
  execSync('npm run build', { stdio: 'inherit' });

  // Check if the bundle was created
  const bundlePath = path.join(__dirname, 'dist', 'gmkb.iife.js');
  if (fs.existsSync(bundlePath)) {
    const stats = fs.statSync(bundlePath);
    const fileSizeInKb = (stats.size / 1024).toFixed(2);
    
    console.log('\n✅ Build successful!');
    console.log(`📁 Bundle created: dist/gmkb.iife.js (${fileSizeInKb} KB)`);
    console.log(`📅 Built at: ${new Date().toLocaleString()}`);
    
    // Re-enable the lean bundle in enqueue.php
    const enqueuePath = path.join(__dirname, 'includes', 'enqueue.php');
    if (fs.existsSync(enqueuePath)) {
      let enqueueContent = fs.readFileSync(enqueuePath, 'utf8');
      if (enqueueContent.includes('define( \'GMKB_USE_LEAN_BUNDLE\', false )')) {
        enqueueContent = enqueueContent.replace(
          'define( \'GMKB_USE_LEAN_BUNDLE\', false )',
          'define( \'GMKB_USE_LEAN_BUNDLE\', true )'
        );
        fs.writeFileSync(enqueuePath, enqueueContent);
        console.log('\n🔧 Re-enabled lean bundle in enqueue.php');
      }
    }
    
    console.log('\n🎉 All done! Refresh your browser to use the updated bundle.');
  } else {
    throw new Error('Bundle file was not created');
  }
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
}
