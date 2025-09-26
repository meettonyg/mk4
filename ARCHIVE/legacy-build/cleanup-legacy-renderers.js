// Note: This script should be run with Node.js
// Usage: node cleanup-legacy-renderers.js

/**
 * Final Cleanup Script - Remove Legacy Renderer Files
 * This script removes all legacy renderer.js files since Vue migration is complete
 */

import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const legacyFiles = [
    'components/authority-hook/renderer.js',
    'components/booking-calendar/renderer.js',
    'components/call-to-action/renderer.js',
    'components/contact/renderer.js',
    'components/podcast-player/renderer.js',
    'components/questions/renderer.js',
    'components/social/renderer.js',
    'components/stats/renderer.js',
    'components/testimonials/renderer.js',
    'components/topics/renderer.js',
    'components/video-intro/renderer.js'
];

async function cleanupLegacyFiles() {
    console.log('🧹 Starting final cleanup of legacy renderer files...\n');
    
    let removed = 0;
    let notFound = 0;
    
    for (const file of legacyFiles) {
        const fullPath = resolve(__dirname, file);
        
        if (existsSync(fullPath)) {
            try {
                await unlink(fullPath);
                console.log(`✅ Removed: ${file}`);
                removed++;
            } catch (error) {
                console.error(`❌ Error removing ${file}:`, error.message);
            }
        } else {
            console.log(`⏭️  Already removed: ${file}`);
            notFound++;
        }
    }
    
    console.log('\n📊 Cleanup Summary:');
    console.log(`  - Files removed: ${removed}`);
    console.log(`  - Already cleaned: ${notFound}`);
    console.log(`  - Total processed: ${legacyFiles.length}`);
    
    if (removed > 0) {
        console.log('\n✨ Legacy cleanup complete! The Vue migration is now fully clean.');
    } else {
        console.log('\n✨ No legacy files found - system is already clean!');
    }
}

// Run cleanup
cleanupLegacyFiles().catch(console.error);
