/**
 * TOPICS COMPONENT MKCG INTEGRATION TEST
 * 
 * This file provides practical examples and tests for pulling MKCG data
 * into the Topics component.
 * 
 * Usage: Copy and paste these functions into your browser console
 * on the Media Kit Builder page.
 */

// =============================================================================
// TOPICS MKCG INTEGRATION TESTING FUNCTIONS
// =============================================================================

/**
 * Test 1: Quick Topics Data Check
 * Run this first to see if MKCG topics data is available
 */
function testTopicsDataAvailability() {
    console.group('🔍 Topics Data Availability Test');
    
    const mkcgData = window.guestifyData?.mkcgData;
    
    if (!mkcgData) {
        console.error('❌ No MKCG data found');
        console.log('Make sure you loaded the page with ?post_id=32372');
        console.groupEnd();
        return false;
    }
    
    console.log('✅ MKCG data is available');
    console.log('Topics section:', mkcgData.topics);
    
    if (mkcgData.topics?.topics) {
        console.log('✅ Topics data structure found');
        
        // Check individual topics
        for (let i = 1; i <= 5; i++) {
            const topicKey = `topic_${i}`;
            const topicValue = mkcgData.topics.topics[topicKey];
            if (topicValue) {
                console.log(`✅ Topic ${i}: "${topicValue}"`);
            } else {
                console.log(`⚪ Topic ${i}: Not available`);
            }
        }
    } else {
        console.warn('⚠️ Topics data structure not found in expected format');
        console.log('Available topics keys:', Object.keys(mkcgData.topics || {}));
    }
    
    console.groupEnd();
    return !!mkcgData.topics?.topics;
}

/**
 * Test 2: Topics Component Mapping Test
 * Tests the data mapping for Topics component
 */
function testTopicsMapping() {
    console.group('🗺️ Topics Component Mapping Test');
    
    if (!window.mkcgDataMapper) {
        console.error('❌ MKCG Data Mapper not available');
        console.groupEnd();
        return null;
    }
    
    const mappingResult = window.mkcgDataMapper.mapDataToComponent('topics');
    
    console.log('Mapping Result:', mappingResult);
    console.log('Mapped Props:', mappingResult.props);
    console.log('Data Quality:', mappingResult.metadata?.dataQuality);
    
    if (Object.keys(mappingResult.props).length > 0) {
        console.log('✅ Successfully mapped Topics data:');
        Object.entries(mappingResult.props).forEach(([field, value]) => {
            console.log(`  ${field}: "${value}"`);
        });
    } else {
        console.warn('⚠️ No data was mapped to Topics component');
        console.log('Troubleshooting:');
        console.log('1. Check if MKCG data has topics.topics structure');
        console.log('2. Verify Topics component schema has mkcgMapping fields');
    }
    
    console.groupEnd();
    return mappingResult;
}

/**
 * Test 3: Add Topics Component with MKCG Data
 * Actually creates a Topics component with mapped MKCG data
 */
function addTopicsComponentWithMKCGData() {
    console.group('➕ Add Topics Component with MKCG Data');
    
    if (!window.enhancedComponentManager) {
        console.error('❌ Enhanced Component Manager not available');
        console.groupEnd();
        return null;
    }
    
    try {
        // Method 1: Auto-mapping (should pull MKCG data automatically)
        const result = window.enhancedComponentManager.addComponent('topics');
        
        console.log('✅ Topics component added:', result);
        
        // Check the component state
        const state = window.enhancedStateManager?.getState();
        const topicsComponents = Object.values(state.components || {})
            .filter(comp => comp.type === 'topics');
        
        if (topicsComponents.length > 0) {
            const latestTopics = topicsComponents[topicsComponents.length - 1];
            console.log('Latest Topics component props:', latestTopics.props);
            
            // Check if MKCG data was applied
            const hasTopicData = Object.keys(latestTopics.props).some(key => 
                key.startsWith('topic_') && latestTopics.props[key] && 
                latestTopics.props[key] !== `Topic ${key.split('_')[1]}`
            );
            
            if (hasTopicData) {
                console.log('✅ MKCG data was successfully applied to Topics component');
            } else {
                console.warn('⚠️ Topics component created but MKCG data may not have been applied');
                console.log('Manual mapping may be needed');
            }
        }
        
        console.groupEnd();
        return result;
        
    } catch (error) {
        console.error('❌ Error adding Topics component:', error);
        console.groupEnd();
        return null;
    }
}

/**
 * Test 4: Manual Topics Data Application
 * Manually applies MKCG data to existing Topics component
 */
function applyMKCGDataToExistingTopics(componentId = null) {
    console.group('🔧 Manual MKCG Data Application to Topics');
    
    // Get the mapping
    const mappingResult = window.mkcgDataMapper?.mapDataToComponent('topics');
    
    if (!mappingResult || Object.keys(mappingResult.props).length === 0) {
        console.error('❌ No MKCG data available for mapping');
        console.groupEnd();
        return false;
    }
    
    console.log('Available MKCG data:', mappingResult.props);
    
    // Find Topics component to update
    const state = window.enhancedStateManager?.getState();
    const topicsComponents = Object.values(state.components || {})
        .filter(comp => comp.type === 'topics');
    
    if (topicsComponents.length === 0) {
        console.warn('⚠️ No Topics components found. Creating one first...');
        addTopicsComponentWithMKCGData();
        console.groupEnd();
        return false;
    }
    
    // Use specified component or latest one
    let targetComponent;
    if (componentId) {
        targetComponent = Object.values(state.components).find(comp => comp.id === componentId);
    } else {
        targetComponent = topicsComponents[topicsComponents.length - 1];
    }
    
    if (!targetComponent) {
        console.error('❌ Target Topics component not found');
        console.groupEnd();
        return false;
    }
    
    console.log('Updating component:', targetComponent.id);
    
    // Apply the mapped data
    try {
        const updatedProps = {
            ...targetComponent.props,
            ...mappingResult.props
        };
        
        window.enhancedComponentManager.updateComponent(targetComponent.id, {
            props: updatedProps
        });
        
        console.log('✅ Successfully applied MKCG data to Topics component');
        console.log('Updated props:', updatedProps);
        
        console.groupEnd();
        return true;
        
    } catch (error) {
        console.error('❌ Error updating Topics component:', error);
        console.groupEnd();
        return false;
    }
}

/**
 * Test 5: Create Topics Component with Custom MKCG Data
 * For testing with specific data structure
 */
function createTopicsWithCustomData(customTopics = null) {
    console.group('🎨 Create Topics with Custom MKCG Data');
    
    // Default test data if none provided
    const testData = customTopics || {
        "topic_1": "Digital Leadership",
        "topic_2": "Innovation Management", 
        "topic_3": "Team Transformation",
        "topic_4": "Future Technologies",
        "topic_5": "Strategic Planning"
    };
    
    console.log('Using custom topics data:', testData);
    
    // Create component with custom props
    if (window.enhancedComponentManager) {
        try {
            const componentId = 'topics_custom_' + Date.now();
            const result = window.enhancedComponentManager.addComponentWithProps(
                'topics', 
                {
                    title: "My Expertise Areas",
                    ...testData,
                    layout_style: "grid",
                    columns: "2",
                    show_numbering: false
                },
                null,
                componentId
            );
            
            console.log('✅ Custom Topics component created:', result);
            console.log('Component ID:', componentId);
            
            console.groupEnd();
            return componentId;
            
        } catch (error) {
            console.error('❌ Error creating custom Topics component:', error);
            console.groupEnd();
            return null;
        }
    } else {
        console.error('❌ Enhanced Component Manager not available');
        console.groupEnd();
        return null;
    }
}

/**
 * Comprehensive Topics Integration Test
 * Runs all tests in sequence
 */
function runComprehensiveTopicsTest() {
    console.log('🚀 Starting Comprehensive Topics MKCG Integration Test');
    console.log('==================================================');
    
    // Test 1: Data availability
    const hasData = testTopicsDataAvailability();
    
    // Test 2: Mapping
    const mapping = testTopicsMapping();
    
    // Test 3: Component creation (if data is available)
    if (hasData && mapping) {
        addTopicsComponentWithMKCGData();
        
        // Test 4: Manual application (wait a bit for state to update)
        setTimeout(() => {
            applyMKCGDataToExistingTopics();
        }, 1000);
    }
    
    // Test 5: Custom data test
    createTopicsWithCustomData();
    
    console.log('🎉 Comprehensive test completed!');
    console.log('Check the Media Kit preview to see your Topics components.');
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all Topics components in current state
 */
function getAllTopicsComponents() {
    const state = window.enhancedStateManager?.getState();
    return Object.values(state.components || {})
        .filter(comp => comp.type === 'topics');
}

/**
 * Clear all Topics components
 */
function clearAllTopicsComponents() {
    const topicsComponents = getAllTopicsComponents();
    
    topicsComponents.forEach(comp => {
        window.enhancedComponentManager?.removeComponent(comp.id);
    });
    
    console.log(`✅ Removed ${topicsComponents.length} Topics components`);
}

/**
 * Debug MKCG Data Structure
 */
function debugMKCGDataStructure() {
    console.group('🔍 MKCG Data Structure Debug');
    
    const mkcgData = window.guestifyData?.mkcgData;
    
    if (!mkcgData) {
        console.error('❌ No MKCG data available');
        console.groupEnd();
        return;
    }
    
    console.log('Full MKCG Data Structure:');
    console.log(JSON.stringify(mkcgData, null, 2));
    
    console.log('\nTopics-specific paths:');
    console.log('meta_info.section_title:', mkcgData.meta_info?.section_title);
    console.log('topics.topics:', mkcgData.topics?.topics);
    
    console.groupEnd();
}

// =============================================================================
// QUICK START INSTRUCTIONS
// =============================================================================

console.log(`
🎯 TOPICS MKCG INTEGRATION QUICK START
=====================================

1. BASIC TEST:
   testTopicsDataAvailability()

2. CHECK MAPPING:
   testTopicsMapping()

3. ADD COMPONENT:
   addTopicsComponentWithMKCGData()

4. RUN ALL TESTS:
   runComprehensiveTopicsTest()

5. CUSTOM DATA TEST:
   createTopicsWithCustomData({
     topic_1: "Your Custom Topic 1",
     topic_2: "Your Custom Topic 2"
   })

6. DEBUG DATA:
   debugMKCGDataStructure()

7. UTILITIES:
   getAllTopicsComponents() - See current Topics
   clearAllTopicsComponents() - Remove all Topics
   applyMKCGDataToExistingTopics() - Force update

🚀 Start with: runComprehensiveTopicsTest()
`);
