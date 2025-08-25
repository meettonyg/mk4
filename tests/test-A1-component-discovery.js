/**
 * Test A1: Component Discovery & Availability
 * Verifies that components are properly discovered and available for use
 */

if (typeof GMKBTest === 'undefined') {
    throw new Error('GMKBTest harness not loaded');
}

GMKBTest.tests.A1 = async function() {
    console.log('🔍 A1: Testing component discovery and availability...');
    
    try {
        // Step 1: Check WordPress localized data
        console.log('📡 Step 1: Checking WordPress data availability...');
        GMKBTest.assert(window.gmkbData, 'gmkbData should be available');
        GMKBTest.assert(window.gmkbData.components, 'Component data should be present');
        GMKBTest.assert(Array.isArray(window.gmkbData.components), 'Components should be an array');
        GMKBTest.assert(window.gmkbData.components.length > 0, 'At least one component should be available');
        
        console.log(`✅ Found ${window.gmkbData.components.length} components in WordPress data`);
        
        // Step 2: Verify component structure
        console.log('🔍 Step 2: Verifying component data structure...');
        const sampleComponent = window.gmkbData.components[0];
        const requiredFields = ['type', 'name', 'description', 'category'];
        
        requiredFields.forEach(field => {
            GMKBTest.assert(sampleComponent.hasOwnProperty(field), `Component should have ${field} field`);
        });
        
        // Step 3: Check component categories
        console.log('📂 Step 3: Checking component categories...');
        GMKBTest.assert(window.gmkbData.categories, 'Categories data should be present');
        GMKBTest.assert(Array.isArray(window.gmkbData.categories), 'Categories should be an array');
        
        console.log(`✅ Found ${window.gmkbData.categories.length} categories`);
        
        // Step 4: Verify essential components are present
        console.log('🎯 Step 4: Verifying essential components...');
        const essentialComponents = ['hero', 'biography', 'topics', 'contact'];
        const availableTypes = window.gmkbData.components.map(c => c.type);
        
        const foundEssential = essentialComponents.filter(type => availableTypes.includes(type));
        console.log(`✅ Found ${foundEssential.length}/${essentialComponents.length} essential components: ${foundEssential.join(', ')}`);
        
        // Step 5: Test component manager availability
        console.log('⚙️ Step 5: Testing component manager integration...');
        GMKBTest.assert(window.enhancedComponentManager, 'Enhanced component manager should be available');
        
        if (window.enhancedComponentManager.getAvailableComponents) {
            const managerComponents = window.enhancedComponentManager.getAvailableComponents();
            console.log(`✅ Component manager reports ${managerComponents.length} available components`);
        }
        
        // Step 6: Check component library modal availability
        console.log('📦 Step 6: Checking component library modal...');
        const libraryModal = document.querySelector(GMKBTest.selectors.modalLibrary);
        if (libraryModal) {
            console.log('✅ Component library modal found in DOM');
        } else {
            console.log('⚠️ Component library modal not found (may be created dynamically)');
        }
        
        return {
            ok: true,
            details: {
                componentsFound: window.gmkbData.components.length,
                categoriesFound: window.gmkbData.categories.length,
                essentialComponents: foundEssential,
                componentManagerAvailable: !!window.enhancedComponentManager,
                libraryModalPresent: !!libraryModal,
                sampleComponent: sampleComponent
            }
        };
        
    } catch (error) {
        return {
            ok: false,
            error: error.message,
            details: {
                gmkbDataPresent: !!window.gmkbData,
                componentsPresent: !!(window.gmkbData && window.gmkbData.components),
                componentManagerPresent: !!window.enhancedComponentManager
            }
        };
    }
};

// Auto-run if called directly
if (typeof module === 'undefined' && typeof window !== 'undefined') {
    console.log('🧪 A1 Test loaded - run with: await GMKBTest.tests.A1()');
}
