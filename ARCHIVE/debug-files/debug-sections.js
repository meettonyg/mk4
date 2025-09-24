// Debug script for Media Kit Builder
console.log('🔍 Media Kit Builder Debug Info');

// Check if Vue app is mounted
if (window.gmkbApp) {
    console.log('✅ Vue app found');
} else {
    console.log('❌ Vue app not found');
}

// Check store
if (window.gmkbStore || window.mediaKitStore) {
    const store = window.gmkbStore || window.mediaKitStore;
    console.log('✅ Store found');
    console.log('Sections:', store.sections);
    console.log('Components:', store.components);
    
    // Check section details
    if (store.sections && store.sections.length > 0) {
        store.sections.forEach((section, index) => {
            console.log(`Section ${index}:`, {
                id: section.section_id,
                type: section.type,
                components: section.components,
                columns: section.columns
            });
        });
    }
} else {
    console.log('❌ Store not found');
}

// Check for drop zones in DOM
const dropZones = document.querySelectorAll('.component-drop-zone');
console.log(`Found ${dropZones.length} drop zones in DOM`);

// Check for columns
const columns = document.querySelectorAll('.gmkb-section__column');
console.log(`Found ${columns.length} columns in DOM`);

// Check section content
const sectionContents = document.querySelectorAll('.gmkb-section__content');
console.log(`Found ${sectionContents.length} section content areas`);
sectionContents.forEach((content, index) => {
    console.log(`Section ${index} content:`, {
        className: content.className,
        childrenCount: content.children.length,
        innerHTML: content.innerHTML.substring(0, 100)
    });
});

// Add visual debugging
document.querySelectorAll('.gmkb-section__content').forEach(content => {
    content.style.border = '2px solid red';
    content.style.minHeight = '200px';
});

document.querySelectorAll('.gmkb-section__column').forEach(column => {
    column.style.border = '2px solid blue';
    column.style.minHeight = '150px';
    column.style.padding = '10px';
});

document.querySelectorAll('.component-drop-zone').forEach(zone => {
    zone.style.border = '2px dashed green';
    zone.style.minHeight = '100px';
    zone.style.padding = '10px';
});

console.log('🎨 Added visual debugging borders:');
console.log('- Red border: Section content areas');
console.log('- Blue border: Columns');
console.log('- Green dashed: Drop zones');
