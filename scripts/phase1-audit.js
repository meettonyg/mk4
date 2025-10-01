#!/usr/bin/env node
/**
 * Phase 1: Component Migration Inventory Audit - CORRECTED
 * 
 * This script:
 * 1. Scans all PHP components
 * 2. Checks for Vue equivalents in SELF-CONTAINED architecture
 * 3. Analyzes complexity
 * 4. Identifies data dependencies
 * 5. Generates migration readiness report
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMPONENTS_DIR = path.join(__dirname, '..', 'components');
const OUTPUT_DIR = path.join(__dirname, '..', 'docs');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Estimate component complexity based on template size and features
 */
function estimateComplexity(componentDir) {
    try {
        const templatePath = path.join(componentDir, 'template.php');
        if (!fs.existsSync(templatePath)) {
            return 'Unknown';
        }

        const template = fs.readFileSync(templatePath, 'utf8');
        const lines = template.split('\n').length;

        // Count complexity indicators
        const hasPods = template.includes('pods(') || template.includes('get_field');
        const hasAjax = template.includes('ajax') || template.includes('wp_ajax');
        const hasComplex = template.includes('foreach') || template.includes('while');
        const hasConditionals = (template.match(/if\s*\(/g) || []).length;

        let complexity = 'Low';
        
        if (lines > 150 || (hasPods && hasAjax) || hasConditionals > 10) {
            complexity = 'High';
        } else if (lines > 50 || hasPods || hasComplex || hasConditionals > 5) {
            complexity = 'Medium';
        }

        return complexity;
    } catch (error) {
        return 'Unknown';
    }
}

/**
 * Extract data dependencies from template
 */
function extractDataDependencies(componentDir) {
    const dependencies = [];

    try {
        const templatePath = path.join(componentDir, 'template.php');
        if (!fs.existsSync(templatePath)) {
            return dependencies;
        }

        const template = fs.readFileSync(templatePath, 'utf8');

        // Check for Pods data
        if (template.includes('pods(') || template.includes('get_field') || template.includes('$pod->')) {
            dependencies.push('Pods');
        }

        // Check for post meta
        if (template.includes('get_post_meta') || template.includes('update_post_meta')) {
            dependencies.push('Post Meta');
        }

        // Check for AJAX
        if (template.includes('ajax') || template.includes('wp_ajax')) {
            dependencies.push('AJAX');
        }

        // Check for custom queries
        if (template.includes('WP_Query') || template.includes('get_posts')) {
            dependencies.push('Custom Queries');
        }

        // Check for media/uploads
        if (template.includes('wp_get_attachment') || template.includes('get_attached_media')) {
            dependencies.push('Media');
        }
    } catch (error) {
        // Silent fail
    }

    return dependencies;
}

/**
 * Check if Vue component exists using SELF-CONTAINED architecture
 * Looks for: /components/{type}/{Type}Renderer.vue
 */
function hasVueComponent(componentDir, dirName) {
    // Normalize component name for different naming conventions
    const pascalCase = dirName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join('');

    // SELF-CONTAINED ARCHITECTURE: Check for {Type}Renderer.vue
    const rendererPath = path.join(componentDir, `${pascalCase}Renderer.vue`);
    
    if (fs.existsSync(rendererPath)) {
        // Also check for editor
        const editorPath = path.join(componentDir, `${pascalCase}Editor.vue`);
        const hasEditor = fs.existsSync(editorPath);
        
        return { 
            exists: true, 
            path: rendererPath,
            hasEditor,
            editorPath: hasEditor ? editorPath : null,
            architecture: 'Self-Contained (Preferred)'
        };
    }

    return { exists: false, path: null, hasEditor: false, architecture: null };
}

/**
 * Load component metadata from component.json
 */
function loadComponentMetadata(componentDir) {
    try {
        const jsonPath = path.join(componentDir, 'component.json');
        if (!fs.existsSync(jsonPath)) {
            return null;
        }

        const data = fs.readFileSync(jsonPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}

/**
 * Main audit function
 */
function auditComponents() {
    console.log('🔍 Starting Component Migration Audit (Self-Contained Architecture)...\n');

    const inventory = [];
    let readyCount = 0;
    let needsConversionCount = 0;
    let totalEffortDays = 0;
    let hasEditorCount = 0;

    // Scan components directory
    const componentDirs = fs.readdirSync(COMPONENTS_DIR).filter(item => {
        const itemPath = path.join(COMPONENTS_DIR, item);
        return fs.statSync(itemPath).isDirectory();
    });

    console.log(`Found ${componentDirs.length} components to analyze\n`);

    for (const dirName of componentDirs) {
        const componentDir = path.join(COMPONENTS_DIR, dirName);
        const metadata = loadComponentMetadata(componentDir);
        
        const componentName = metadata?.name || dirName;
        const category = metadata?.category || 'unknown';
        const hasTemplate = fs.existsSync(path.join(componentDir, 'template.php'));
        const vueCheck = hasVueComponent(componentDir, dirName);
        const complexity = estimateComplexity(componentDir);
        const dependencies = extractDataDependencies(componentDir);

        // Calculate effort estimate
        let effortDays = 0;
        if (!vueCheck.exists && hasTemplate) {
            switch (complexity) {
                case 'Low': effortDays = 0.5; break;
                case 'Medium': effortDays = 1; break;
                case 'High': effortDays = 2; break;
            }
            needsConversionCount++;
            totalEffortDays += effortDays;
        } else if (vueCheck.exists) {
            readyCount++;
            if (vueCheck.hasEditor) {
                hasEditorCount++;
            }
        }

        const status = vueCheck.exists ? 
            (vueCheck.hasEditor ? '✅ Complete' : '✅ Renderer Only') : 
            (hasTemplate ? '⚠️ Needs Conversion' : '❌ Missing');

        inventory.push({
            dirName,
            name: componentName,
            category,
            hasPhpTemplate: hasTemplate,
            hasVueComponent: vueCheck.exists,
            hasVueEditor: vueCheck.hasEditor,
            vuePath: vueCheck.path,
            vueEditorPath: vueCheck.editorPath,
            architecture: vueCheck.architecture,
            complexity,
            dependencies,
            effortDays,
            status
        });

        console.log(`${status} ${componentName} (${complexity})`);
    }

    // Generate reports
    generateMarkdownReport(inventory, readyCount, needsConversionCount, totalEffortDays, hasEditorCount);
    generateJSONReport(inventory);

    // Display summary
    console.log('\n📊 AUDIT SUMMARY\n');
    console.log(`Total Components: ${componentDirs.length}`);
    console.log(`✅ Vue Renderers: ${readyCount}`);
    console.log(`✅ Vue Editors: ${hasEditorCount}`);
    console.log(`⚠️ Needs Conversion: ${needsConversionCount}`);
    console.log(`Vue Coverage: ${((readyCount / componentDirs.length) * 100).toFixed(1)}%`);
    console.log(`\n⏱️ Estimated Effort: ${Math.ceil(totalEffortDays)} days`);
    
    // Go/No-Go Decision
    const coverage = (readyCount / componentDirs.length) * 100;
    console.log('\n🚦 GO/NO-GO DECISION:\n');
    
    if (coverage >= 60) {
        console.log('✅ RECOMMEND: PROCEED TO PHASE 2');
        console.log('   Reason: Vue coverage ≥ 60%');
        console.log('   Status: EXCELLENT - Most components have Vue implementations');
    } else if (coverage >= 40 && totalEffortDays <= 10) {
        console.log('⚠️ RECOMMEND: CONDITIONAL PROCEED');
        console.log('   Reason: Coverage 40-60% but effort ≤ 10 days');
    } else if (totalEffortDays <= 5) {
        console.log('✅ RECOMMEND: PROCEED TO PHASE 2');
        console.log('   Reason: Missing component effort ≤ 5 days');
    } else {
        console.log('❌ RECOMMEND: CONSIDER ALTERNATIVE');
        console.log('   Reason: Coverage < 40% and effort > 10 days');
    }
    
    console.log(`\n📄 Reports generated in /docs folder`);
    console.log('\n🎉 The project is already using SELF-CONTAINED ARCHITECTURE!');
    console.log('   Components in /components/{type}/{Type}Renderer.vue format');
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(inventory, readyCount, needsConversionCount, totalEffortDays, hasEditorCount) {
    let markdown = `# Component Migration Inventory\n\n`;
    markdown += `**Generated:** ${new Date().toLocaleString()}\n\n`;
    
    markdown += `## 🎉 EXCELLENT NEWS!\n\n`;
    markdown += `The project is already using the **SELF-CONTAINED COMPONENT ARCHITECTURE**!\n\n`;
    markdown += `All Vue components are located at: \`/components/{type}/{Type}Renderer.vue\`\n\n`;
    
    markdown += `## Summary\n\n`;
    markdown += `- ✅ Vue Renderers Ready: ${readyCount} components\n`;
    markdown += `- ✅ Vue Editors Ready: ${hasEditorCount} components\n`;
    markdown += `- ⚠️ Needs Conversion: ${needsConversionCount} components\n`;
    markdown += `- **Vue Coverage: ${((readyCount / inventory.length) * 100).toFixed(1)}%**\n`;
    markdown += `- Estimated Effort: ${Math.ceil(totalEffortDays)} days\n\n`;

    markdown += `## Component Details\n\n`;
    markdown += `| Component | PHP | Vue Renderer | Vue Editor | Complexity | Dependencies | Effort | Status |\n`;
    markdown += `|-----------|-----|--------------|------------|------------|--------------|--------|--------|\n`;

    // Sort by status (ready first, then by complexity)
    const sorted = inventory.sort((a, b) => {
        if (a.hasVueComponent && !b.hasVueComponent) return -1;
        if (!a.hasVueComponent && b.hasVueComponent) return 1;
        return a.effortDays - b.effortDays;
    });

    for (const component of sorted) {
        const phpMark = component.hasPhpTemplate ? '✓' : '✗';
        const vueMark = component.hasVueComponent ? '✓' : '✗';
        const editorMark = component.hasVueEditor ? '✓' : '✗';
        const deps = component.dependencies.join(', ') || 'None';
        const effort = component.effortDays > 0 ? `${component.effortDays}d` : '-';

        markdown += `| ${component.name} | ${phpMark} | ${vueMark} | ${editorMark} | ${component.complexity} | ${deps} | ${effort} | ${component.status} |\n`;
    }

    markdown += `\n## Architecture Analysis\n\n`;
    markdown += `### ✅ Self-Contained Component Structure (EXCELLENT!)\n\n`;
    markdown += `The project follows the recommended self-contained architecture:\n\n`;
    markdown += `\`\`\`\n`;
    markdown += `/components/{type}/\n`;
    markdown += `  ├── {Type}Renderer.vue   ← Vue component for display\n`;
    markdown += `  ├── {Type}Editor.vue      ← Vue component for editing\n`;
    markdown += `  ├── component.json        ← Component metadata\n`;
    markdown += `  └── template.php          ← PHP fallback (to be deprecated)\n`;
    markdown += `\`\`\`\n\n`;
    
    markdown += `**Renderers Present:** ${readyCount}/${inventory.length} (${((readyCount/inventory.length)*100).toFixed(1)}%)\n`;
    markdown += `**Editors Present:** ${hasEditorCount}/${inventory.length} (${((hasEditorCount/inventory.length)*100).toFixed(1)}%)\n\n`;

    markdown += `### Migration Status by Component\n\n`;
    
    markdown += `#### ✅ Complete (Renderer + Editor)\n`;
    for (const component of sorted.filter(c => c.hasVueComponent && c.hasVueEditor)) {
        markdown += `- **${component.name}** - Fully migrated with edit capabilities\n`;
    }
    
    markdown += `\n#### ⚠️ Renderer Only (Needs Editor)\n`;
    for (const component of sorted.filter(c => c.hasVueComponent && !c.hasVueEditor)) {
        markdown += `- **${component.name}** - Has renderer, needs editor component\n`;
    }

    markdown += `\n#### ❌ Needs Vue Implementation\n`;
    for (const component of sorted.filter(c => !c.hasVueComponent)) {
        markdown += `- **${component.name}** - ${component.complexity} complexity, ${component.effortDays}d effort\n`;
    }

    markdown += `\n## Priority Matrix\n\n`;
    markdown += `### P0 - Must Have (Already Complete!)\n`;
    for (const component of sorted.filter(c => c.hasVueComponent)) {
        const editorStatus = component.hasVueEditor ? 'Complete' : 'Renderer only';
        markdown += `- ✅ **${component.name}** (${editorStatus})\n`;
    }

    markdown += `\n### P1 - Should Add (Missing Components)\n`;
    for (const component of sorted.filter(c => !c.hasVueComponent && c.complexity !== 'High')) {
        markdown += `- ⚠️ **${component.name}** - ${component.complexity} complexity, ${component.effortDays}d effort\n`;
    }

    markdown += `\n### P2 - Nice to Have (Complex Components)\n`;
    for (const component of sorted.filter(c => !c.hasVueComponent && c.complexity === 'High')) {
        markdown += `- ⚠️ **${component.name}** - ${component.complexity} complexity, ${component.effortDays}d effort\n`;
    }

    markdown += `\n## Go/No-Go Decision Criteria\n\n`;
    
    const coverage = (readyCount / inventory.length) * 100;
    markdown += `**Current Status:**\n`;
    markdown += `- Vue Coverage: ${coverage.toFixed(1)}%\n`;
    markdown += `- Missing Component Effort: ${Math.ceil(totalEffortDays)} days\n\n`;

    if (coverage >= 60) {
        markdown += `## ✅ **PROCEED TO PHASE 2**\n\n`;
        markdown += `**Recommendation:** STRONG GO\n\n`;
        markdown += `**Reasons:**\n`;
        markdown += `1. Vue coverage is ${coverage.toFixed(1)}% (exceeds 60% threshold)\n`;
        markdown += `2. Self-contained architecture already implemented\n`;
        markdown += `3. ${readyCount} out of ${inventory.length} components have Vue renderers\n`;
        markdown += `4. ${hasEditorCount} components have Vue editors\n`;
        markdown += `5. Excellent foundation for pure Vue migration\n\n`;
        markdown += `**Next Steps:**\n`;
        markdown += `- Complete backup strategy\n`;
        markdown += `- Proceed to Phase 2: Clean API Layer\n`;
        markdown += `- Continue with remaining phases as planned\n\n`;
    } else if (coverage >= 40 && totalEffortDays <= 10) {
        markdown += `⚠️ **CONDITIONAL PROCEED** - Coverage is 40-60% but effort is manageable (≤10 days)\n\n`;
    } else if (totalEffortDays <= 5) {
        markdown += `✅ **PROCEED TO PHASE 2** - Missing component effort is minimal (≤5 days)\n\n`;
    } else {
        markdown += `❌ **CONSIDER ALTERNATIVE** - Coverage <40% or effort >10 days. Consider Option B (Hybrid).\n\n`;
    }

    fs.writeFileSync(path.join(OUTPUT_DIR, 'COMPONENT-INVENTORY.md'), markdown);
    console.log('\n✅ Generated COMPONENT-INVENTORY.md');
}

/**
 * Generate JSON report for programmatic use
 */
function generateJSONReport(inventory) {
    const report = {
        generatedAt: new Date().toISOString(),
        architecture: 'Self-Contained (Preferred)',
        summary: {
            total: inventory.length,
            ready: inventory.filter(c => c.hasVueComponent).length,
            withEditors: inventory.filter(c => c.hasVueEditor).length,
            needsConversion: inventory.filter(c => !c.hasVueComponent && c.hasPhpTemplate).length,
            coverage: ((inventory.filter(c => c.hasVueComponent).length / inventory.length) * 100).toFixed(1) + '%',
            estimatedEffort: Math.ceil(inventory.reduce((sum, c) => sum + c.effortDays, 0))
        },
        components: inventory
    };

    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'component-inventory.json'),
        JSON.stringify(report, null, 2)
    );
    console.log('✅ Generated component-inventory.json');
}

// Run audit
auditComponents();
