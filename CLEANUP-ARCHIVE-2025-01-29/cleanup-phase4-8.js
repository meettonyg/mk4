#!/usr/bin/env node
/**
 * Phase 4-8: Legacy Code Removal Script
 * Removes all legacy code and ensures pure Vue implementation
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = process.cwd();

// Files to delete
const filesToDelete = [
  // Legacy integration files
  'src/integrations/componentRegistryBridge.js',
  'src/integrations/vueStoreBridge.js',
  
  // Debug files
  'src/debug/test-component-controls.js',
  
  // Legacy features that should be Vue components
  'src/features/InlineEditor.js',
  'src/features/ComponentTemplates.js',
  
  // Old loaders not needed with Vue
  'src/loaders/VueComponentLoader.js',
  
  // Any .disabled or .backup files
  '**/*.disabled',
  '**/*.backup',
  '**/*.old'
];

// Directories to potentially remove
const dirsToCheck = [
  'ARCHIVE',
  'src/ui', // Should be empty if all UI is Vue
  'src/managers' // Legacy managers
];

console.log('🧹 Media Kit Builder - Phase 4-8 Legacy Code Cleanup');
console.log('====================================================\n');

// Delete specific files
console.log('📦 Removing legacy files...');
let filesDeleted = 0;
let filesNotFound = 0;

filesToDelete.forEach(file => {
  const filePath = path.join(projectRoot, file);
  
  // Handle glob patterns
  if (file.includes('*')) {
    console.log(`  ⚠️  Skipping glob pattern: ${file} (needs manual cleanup)`);
    return;
  }
  
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`  ✅ Deleted: ${file}`);
      filesDeleted++;
    } else {
      console.log(`  ⚠️  Not found: ${file}`);
      filesNotFound++;
    }
  } catch (error) {
    console.log(`  ❌ Error deleting ${file}:`, error.message);
  }
});

console.log(`\n  Summary: ${filesDeleted} files deleted, ${filesNotFound} not found`);

// Check and remove directories
console.log('\n📦 Checking directories...');
let dirsRemoved = 0;

dirsToCheck.forEach(dir => {
  const dirPath = path.join(projectRoot, dir);
  
  try {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      
      if (files.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`  ✅ Removed empty directory: ${dir}`);
        dirsRemoved++;
      } else {
        console.log(`  ⚠️  Directory not empty: ${dir} (${files.length} files)`);
        // Show what's in the directory
        if (files.length <= 5) {
          files.forEach(f => console.log(`      - ${f}`));
        } else {
          console.log(`      - ${files.slice(0, 3).join(', ')}... and ${files.length - 3} more`);
        }
      }
    } else {
      console.log(`  ⚠️  Directory doesn't exist: ${dir}`);
    }
  } catch (error) {
    console.log(`  ❌ Error checking ${dir}:`, error.message);
  }
});

// Update main.js
console.log('\n📦 Checking main.js...');
const mainPath = path.join(projectRoot, 'src/main.js');
const mainCleanPath = path.join(projectRoot, 'src/main-clean.js');

if (fs.existsSync(mainCleanPath)) {
  // Check if main.js needs updating
  const currentMain = fs.readFileSync(mainPath, 'utf8');
  const cleanMain = fs.readFileSync(mainCleanPath, 'utf8');
  
  if (currentMain.includes('Phase 4-8: Pure Vue.js Implementation')) {
    console.log('  ✅ main.js is already updated to clean version');
  } else {
    // Backup old main.js
    const backupPath = path.join(projectRoot, 'src/main.js.backup-phase4');
    fs.copyFileSync(mainPath, backupPath);
    console.log(`  ✅ Backed up main.js to main.js.backup-phase4`);
    
    // Replace with clean version
    fs.copyFileSync(mainCleanPath, mainPath);
    console.log(`  ✅ Replaced main.js with clean version`);
  }
} else {
  console.log('  ⚠️  main-clean.js not found - skipping main.js update');
}

// Look for .disabled files
console.log('\n📦 Looking for disabled files...');
function findDisabledFiles(dir) {
  let disabledFiles = [];
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      disabledFiles = disabledFiles.concat(findDisabledFiles(filePath));
    } else if (stat.isFile() && (file.endsWith('.disabled') || file.endsWith('.backup') || file.endsWith('.old'))) {
      disabledFiles.push(path.relative(projectRoot, filePath));
    }
  });
  
  return disabledFiles;
}

const disabledFiles = findDisabledFiles(projectRoot);
if (disabledFiles.length > 0) {
  console.log(`  Found ${disabledFiles.length} disabled/backup files:`);
  disabledFiles.forEach(file => {
    console.log(`    - ${file}`);
    // Optionally delete them
    const fullPath = path.join(projectRoot, file);
    try {
      fs.unlinkSync(fullPath);
      console.log(`      ✅ Deleted`);
    } catch (error) {
      console.log(`      ❌ Error: ${error.message}`);
    }
  });
} else {
  console.log('  ✅ No disabled/backup files found');
}

console.log('\n====================================================');
console.log('✅ Phase 4-8 Legacy Code Cleanup Complete!\n');
console.log('Summary:');
console.log(`  - Files deleted: ${filesDeleted}`);
console.log(`  - Directories removed: ${dirsRemoved}`);
console.log(`  - Disabled files cleaned: ${disabledFiles.length}`);
console.log('\nNext steps:');
console.log('1. Run: npm run build');
console.log('2. Test the application in browser');
console.log('3. Commit: git add -A && git commit -m "Phase 4-8: Remove legacy code, pure Vue implementation"');
console.log('4. (Optional) Clean install: rm -rf node_modules && npm install');
