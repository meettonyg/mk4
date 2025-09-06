console.log("🔍 Section System Quick Diagnostic");
console.log("===============================");

// Check if all systems are available
const systems = {
    'SectionLayoutManager': window.sectionLayoutManager,
    'SectionRenderer': window.sectionRenderer, 
    'SidebarSectionIntegration': window.sidebarSectionIntegration,
    'SectionTemplateManager': window.sectionTemplateManager
};

for (const [name, system] of Object.entries(systems)) {
    if (system) {
        console.log(`✅ ${name} is available`);
    } else {
        console.error(`❌ ${name} is NOT available`);
    }
}

// Try to get section renderer via factory
if (window.getSectionRenderer) {
    const renderer = window.getSectionRenderer();
    console.log(`✅ getSectionRenderer factory works: ${renderer === window.sectionRenderer}`);
} else {
    console.error(`❌ getSectionRenderer factory not available`);
}

console.log("\n📊 Current State:");
console.log("Sections count:", window.sectionLayoutManager?.getSectionsInOrder().length || 0);
console.log("Section container exists:", !!document.getElementById('gmkb-sections-container'));

console.log("\n💡 To test the fix:");
console.log("1. Click 'Add Section' button in Layout tab");
console.log("2. Click 'Use Template' button in Layout tab");
console.log("3. Click 'Duplicate' button in Layout tab");
console.log("\nOr run: testAddSection()");
