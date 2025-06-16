#!/usr/bin/env node
/**
 * Migration Script: Convert Components to Schema-Driven System
 * 
 * This script helps migrate existing components to use the new schema-driven
 * data binding system by analyzing component files and generating schema definitions.
 */

const fs = require('fs');
const path = require('path');

// Component directory
const COMPONENTS_DIR = path.join(__dirname, 'components');

// Component templates for common patterns
const SCHEMA_TEMPLATES = {
    text: {
        type: 'text',
        label: 'Text Field',
        default: '',
        placeholder: 'Enter text',
        updateMethod: 'textContent'
    },
    textarea: {
        type: 'textarea',
        label: 'Text Area',
        default: '',
        rows: 3,
        placeholder: 'Enter text',
        updateMethod: 'textContent'
    },
    image: {
        type: 'image',
        label: 'Image',
        default: '',
        updateMethod: 'src',
        helpText: 'Recommended: Square image, at least 200x200px'
    },
    color: {
        type: 'color',
        label: 'Color',
        default: '#000000',
        updateMethod: 'style.color'
    },
    select: {
        type: 'select',
        label: 'Select',
        default: '',
        options: [],
        updateMethod: 'class'
    }
};

/**
 * Analyze design panel PHP to extract form fields
 */
function analyzeDesignPanel(componentPath) {
    const designPanelPath = path.join(componentPath, 'design-panel.php');
    if (!fs.existsSync(designPanelPath)) {
        return null;
    }
    
    const content = fs.readFileSync(designPanelPath, 'utf8');
    const settings = {};
    
    // Extract input fields
    const inputRegex = /<input[^>]+data-property="([^"]+)"[^>]*>/g;
    let match;
    
    while ((match = inputRegex.exec(content)) !== null) {
        const propertyName = match[1];
        const inputHtml = match[0];
        
        // Determine input type
        const typeMatch = inputHtml.match(/type="([^"]+)"/);
        const type = typeMatch ? typeMatch[1] : 'text';
        
        // Extract placeholder
        const placeholderMatch = inputHtml.match(/placeholder="([^"]+)"/);
        const placeholder = placeholderMatch ? placeholderMatch[1] : '';
        
        // Create setting based on type
        let setting = { ...SCHEMA_TEMPLATES.text };
        
        if (type === 'color') {
            setting = { ...SCHEMA_TEMPLATES.color };
        } else if (type === 'checkbox') {
            setting = {
                type: 'checkbox',
                label: propertyName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                default: false,
                updateMethod: 'visibility'
            };
        }
        
        setting.placeholder = placeholder;
        settings[propertyName] = setting;
    }
    
    // Extract textareas
    const textareaRegex = /<textarea[^>]+data-property="([^"]+)"[^>]*>/g;
    while ((match = textareaRegex.exec(content)) !== null) {
        const propertyName = match[1];
        const textareaHtml = match[0];
        
        const rowsMatch = textareaHtml.match(/rows="([^"]+)"/);
        const rows = rowsMatch ? parseInt(rowsMatch[1]) : 3;
        
        settings[propertyName] = {
            ...SCHEMA_TEMPLATES.textarea,
            rows
        };
    }
    
    // Extract selects
    const selectRegex = /<select[^>]+data-property="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g;
    while ((match = selectRegex.exec(content)) !== null) {
        const propertyName = match[1];
        const optionsHtml = match[2];
        
        const options = [];
        const optionRegex = /<option[^>]+value="([^"]+)"[^>]*>([^<]+)</g;
        let optionMatch;
        
        while ((optionMatch = optionRegex.exec(optionsHtml)) !== null) {
            options.push({
                value: optionMatch[1],
                label: optionMatch[2].trim()
            });
        }
        
        settings[propertyName] = {
            ...SCHEMA_TEMPLATES.select,
            options,
            default: options.length > 0 ? options[0].value : ''
        };
    }
    
    return settings;
}

/**
 * Analyze template PHP to determine preview selectors
 */
function analyzeTemplate(componentPath) {
    const templatePath = path.join(componentPath, 'template.php');
    if (!fs.existsSync(templatePath)) {
        return {};
    }
    
    const content = fs.readFileSync(templatePath, 'utf8');
    const selectors = {};
    
    // Common patterns to look for
    const patterns = [
        { regex: /class="([^"]*hero-name[^"]*)"/g, setting: 'hero_name' },
        { regex: /class="([^"]*hero-title[^"]*)"/g, setting: 'hero_title' },
        { regex: /class="([^"]*section-title[^"]*)"/g, setting: 'section_title' },
        { regex: /class="([^"]*stat-item__number[^"]*)"/g, setting: 'stat_value' },
        { regex: /class="([^"]*stat-item__label[^"]*)"/g, setting: 'stat_label' }
    ];
    
    patterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(content)) !== null) {
            const className = match[1].split(' ').find(c => c.includes(pattern.setting.replace('_', '-')));
            if (className) {
                selectors[pattern.setting] = '.' + className;
            }
        }
    });
    
    return selectors;
}

/**
 * Generate sections based on settings
 */
function generateSections(settings) {
    const sections = {
        content: {
            title: 'Content',
            order: 1
        },
        appearance: {
            title: 'Appearance',
            order: 2
        }
    };
    
    // Assign settings to sections
    Object.keys(settings).forEach(key => {
        if (key.includes('color') || key.includes('style') || key.includes('show_')) {
            settings[key].section = 'appearance';
        } else {
            settings[key].section = 'content';
        }
    });
    
    return sections;
}

/**
 * Migrate a single component
 */
function migrateComponent(componentName) {
    const componentPath = path.join(COMPONENTS_DIR, componentName);
    const jsonPath = path.join(componentPath, 'component.json');
    
    if (!fs.existsSync(jsonPath)) {
        console.log(`Skipping ${componentName}: No component.json found`);
        return;
    }
    
    // Read existing component.json
    const componentData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Check if already migrated
    if (componentData.settings) {
        console.log(`Skipping ${componentName}: Already has settings schema`);
        return;
    }
    
    console.log(`Migrating ${componentName}...`);
    
    // Analyze design panel
    const settings = analyzeDesignPanel(componentPath) || {};
    
    // Analyze template for selectors
    const selectors = analyzeTemplate(componentPath);
    
    // Update settings with selectors
    Object.keys(settings).forEach(key => {
        if (selectors[key]) {
            settings[key].previewSelector = selectors[key];
        } else {
            // Try to guess selector based on key
            const className = key.replace(/_/g, '-');
            settings[key].previewSelector = '.' + className;
        }
        
        // Update labels
        settings[key].label = key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    });
    
    // Generate sections
    const sections = generateSections(settings);
    
    // Update component data
    componentData.settings = settings;
    componentData.sections = sections;
    
    // Create backup
    const backupPath = jsonPath + '.backup';
    fs.copyFileSync(jsonPath, backupPath);
    
    // Write updated component.json
    fs.writeFileSync(jsonPath, JSON.stringify(componentData, null, 2));
    
    console.log(`✓ Migrated ${componentName}`);
    console.log(`  - Found ${Object.keys(settings).length} settings`);
    console.log(`  - Backup saved to component.json.backup`);
}

/**
 * Main migration function
 */
function migrateAll() {
    console.log('Starting component migration...\n');
    
    // Get all component directories
    const components = fs.readdirSync(COMPONENTS_DIR)
        .filter(file => fs.statSync(path.join(COMPONENTS_DIR, file)).isDirectory());
    
    // Migrate each component
    components.forEach(component => {
        migrateComponent(component);
        console.log('');
    });
    
    console.log('Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Review the generated schemas in each component.json');
    console.log('2. Adjust preview selectors to match your template structure');
    console.log('3. Test each component in the builder');
    console.log('4. Remove custom JavaScript from design panels if no longer needed');
}

// Run migration
if (require.main === module) {
    migrateAll();
}

module.exports = { migrateComponent, migrateAll };