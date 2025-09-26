/**
 * Script to Fix Component CSS Variables
 * Updates all component styles to use standardized --gmkb-* CSS variables
 * 
 * @version 1.0.0
 * @date 2025-01-03
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Variable mapping from old to new
const variableMapping = {
    // Colors
    '--primary-color': '--gmkb-color-primary',
    '--primary-hover-color': '--gmkb-color-primary-hover',
    '--secondary-color': '--gmkb-color-secondary',
    '--accent-color': '--gmkb-color-accent',
    '--background-color': '--gmkb-color-surface',
    '--primary-text-color': '--gmkb-color-text',
    '--secondary-text-color': '--gmkb-color-text-light',
    '--muted-text-color': '--gmkb-color-text-light',
    '--input-bg-color': '--gmkb-color-background',
    '--input-border-color': '--gmkb-color-border',
    '--component-bg-color': '--gmkb-color-surface',
    '--light-primary-color': '--gmkb-color-primary',
    
    // Sizes (raw values to variables)
    'padding: 2rem': 'padding: var(--gmkb-space-8, 2rem)',
    'padding: 1rem': 'padding: var(--gmkb-space-4, 1rem)',
    'padding: 1.5rem': 'padding: var(--gmkb-space-6, 1.5rem)',
    'padding: 0.5rem': 'padding: var(--gmkb-space-2, 0.5rem)',
    'padding: 0.75rem': 'padding: var(--gmkb-space-3, 0.75rem)',
    'margin-bottom: 2rem': 'margin-bottom: var(--gmkb-space-8, 2rem)',
    'margin-bottom: 1rem': 'margin-bottom: var(--gmkb-space-4, 1rem)',
    'margin-bottom: 1.5rem': 'margin-bottom: var(--gmkb-space-6, 1.5rem)',
    'margin-bottom: 0.5rem': 'margin-bottom: var(--gmkb-space-2, 0.5rem)',
    
    // Border radius
    'border-radius: 0.5rem': 'border-radius: var(--gmkb-border-radius, 0.5rem)',
    'border-radius: 0.375rem': 'border-radius: var(--gmkb-border-radius-sm, 0.375rem)',
    'border-radius: 0.25rem': 'border-radius: var(--gmkb-border-radius-sm, 0.25rem)',
    'border-radius: 1rem': 'border-radius: var(--gmkb-border-radius-lg, 1rem)',
    
    // Font sizes
    'font-size: 2.5rem': 'font-size: var(--gmkb-font-size-3xl, 2.5rem)',
    'font-size: 2rem': 'font-size: var(--gmkb-font-size-2xl, 2rem)',
    'font-size: 1.75rem': 'font-size: var(--gmkb-font-size-xl, 1.75rem)',
    'font-size: 1.5rem': 'font-size: var(--gmkb-font-size-xl, 1.5rem)',
    'font-size: 1.25rem': 'font-size: var(--gmkb-font-size-lg, 1.25rem)',
    'font-size: 1.125rem': 'font-size: var(--gmkb-font-size-lg, 1.125rem)',
    'font-size: 1rem': 'font-size: var(--gmkb-font-size-base, 1rem)',
    'font-size: 0.875rem': 'font-size: var(--gmkb-font-size-sm, 0.875rem)',
    'font-size: 0.75rem': 'font-size: var(--gmkb-font-size-xs, 0.75rem)',
    
    // Font weights
    'font-weight: 700': 'font-weight: var(--gmkb-font-weight-bold, 700)',
    'font-weight: 600': 'font-weight: var(--gmkb-font-weight-semibold, 600)',
    'font-weight: 500': 'font-weight: var(--gmkb-font-weight-medium, 500)',
    'font-weight: 400': 'font-weight: var(--gmkb-font-weight-normal, 400)',
    
    // Line heights
    'line-height: 1.6': 'line-height: var(--gmkb-line-height-base, 1.6)',
    'line-height: 1.5': 'line-height: var(--gmkb-line-height-base, 1.5)',
    'line-height: 1.4': 'line-height: var(--gmkb-line-height-base, 1.4)',
    'line-height: 1.3': 'line-height: var(--gmkb-line-height-heading, 1.3)',
    'line-height: 1.2': 'line-height: var(--gmkb-line-height-heading, 1.2)',
    
    // Transitions
    'transition: all 0.3s ease': 'transition: all var(--gmkb-transition, 0.3s) var(--gmkb-transition-timing, ease)',
    'transition: all 0.2s ease': 'transition: all var(--gmkb-transition-fast, 0.2s) var(--gmkb-transition-timing, ease)',
    'transition: background-color 0.3s ease': 'transition: background-color var(--gmkb-transition, 0.3s) var(--gmkb-transition-timing, ease)',
    'transition: opacity 0.3s ease': 'transition: opacity var(--gmkb-transition, 0.3s) var(--gmkb-transition-timing, ease)',
    
    // Shadows
    'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1)': 'box-shadow: var(--gmkb-shadow-sm)',
    'box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1)': 'box-shadow: var(--gmkb-shadow)',
    'box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1)': 'box-shadow: var(--gmkb-shadow-lg)',
};

// Components to update
const componentsToUpdate = [
    'booking-calendar',
    'guest-intro',
    'logo-grid',
    'photo-gallery',
    'podcast-player',
    'questions',
    'social',
    'stats',
    'testimonials',
    'video-intro'
];

// Helper function to update CSS content
function updateCSSContent(content) {
    let updatedContent = content;
    
    // Apply all mappings
    Object.entries(variableMapping).forEach(([oldValue, newValue]) => {
        const regex = new RegExp(escapeRegExp(oldValue), 'g');
        updatedContent = updatedContent.replace(regex, newValue);
    });
    
    // Add font-family declarations after font-size updates
    updatedContent = updatedContent.replace(
        /(font-size: var\(--gmkb-font-size-[^)]+\);)/g,
        '$1\n    font-family: var(--gmkb-font-primary, inherit);'
    );
    
    // Add font-family to headings
    updatedContent = updatedContent.replace(
        /(\.([\w-]+)-(title|heading)[^{]*{[^}]*font-size[^}]*)/g,
        (match) => {
            if (!match.includes('font-family')) {
                return match.replace(';', ';\n    font-family: var(--gmkb-font-heading, inherit);');
            }
            return match;
        }
    );
    
    return updatedContent;
}

// Helper to escape regex special characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Process each component
componentsToUpdate.forEach(componentName => {
    const cssPath = path.join(__dirname, '..', 'components', componentName, 'styles.css');
    
    if (fs.existsSync(cssPath)) {
        console.log(`Processing ${componentName}/styles.css...`);
        
        // Read current CSS
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        
        // Create backup
        const backupPath = cssPath + '.backup';
        fs.writeFileSync(backupPath, cssContent);
        console.log(`  ✓ Backup created: ${backupPath}`);
        
        // Update CSS
        const updatedCSS = updateCSSContent(cssContent);
        
        // Write updated CSS
        fs.writeFileSync(cssPath, updatedCSS);
        console.log(`  ✓ Updated with --gmkb-* variables`);
        
        // Count changes
        const changeCount = (updatedCSS.match(/--gmkb-/g) || []).length - 
                          (cssContent.match(/--gmkb-/g) || []).length;
        console.log(`  ✓ ${changeCount} CSS variables updated\n`);
    } else {
        console.log(`⚠️  ${componentName}/styles.css not found\n`);
    }
});

console.log('✅ CSS Variable update complete!');
console.log('\n📋 Next steps:');
console.log('1. Test each component with theme switching');
console.log('2. Remove backup files after verification');
console.log('3. Update topics component manually (complex structure)');
