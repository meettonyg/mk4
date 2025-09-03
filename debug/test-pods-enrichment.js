/**
 * Debug script to test Pods data enrichment
 */
(function() {
    'use strict';
    
    console.log('🔍 PODS DATA DEBUG SCRIPT LOADED');
    
    // Check if gmkbData has pods_data
    if (window.gmkbData) {
        console.log('📊 gmkbData.pods_data:', window.gmkbData.pods_data);
        console.log('📊 gmkbData.postId:', window.gmkbData.postId);
        
        // Check saved components for enriched data
        if (window.gmkbData.saved_components) {
            console.log('📊 Saved components count:', window.gmkbData.saved_components.length);
            
            // Look for topics component
            const topicsComponent = window.gmkbData.saved_components.find(c => c.type === 'topics');
            if (topicsComponent) {
                console.log('✅ Topics component found in saved_components');
                console.log('📊 Topics props:', topicsComponent.props);
                console.log('📊 Topics data:', topicsComponent.data);
                
                // Check for Pods fields
                for (let i = 1; i <= 5; i++) {
                    const fieldKey = `topic_${i}`;
                    if (topicsComponent.props && topicsComponent.props[fieldKey]) {
                        console.log(`✅ ${fieldKey}: "${topicsComponent.props[fieldKey]}"`);
                    }
                }
                
                // Check for topics array
                if (topicsComponent.props && topicsComponent.props.topics) {
                    console.log('✅ Topics array:', topicsComponent.props.topics);
                }
            } else {
                console.log('❌ No topics component in saved_components');
            }
        }
        
        // Check saved state
        if (window.gmkbData.saved_state) {
            console.log('📊 Saved state components:', Object.keys(window.gmkbData.saved_state.components || {}));
            
            // Check each component for topics
            for (const [id, component] of Object.entries(window.gmkbData.saved_state.components || {})) {
                if (component.type === 'topics') {
                    console.log(`✅ Topics component ${id}:`, component);
                }
            }
        }
    }
    
    // Function to check component data in state manager
    window.checkTopicsData = function() {
        if (window.enhancedStateManager) {
            const state = window.enhancedStateManager.getState();
            console.log('📊 State manager components:', state.components);
            
            for (const [id, component] of Object.entries(state.components || {})) {
                if (component.type === 'topics') {
                    console.log(`📊 Topics component ${id} in state:`, component);
                    
                    // Check props
                    if (component.props) {
                        console.log('  Props:', component.props);
                        for (let i = 1; i <= 5; i++) {
                            const fieldKey = `topic_${i}`;
                            if (component.props[fieldKey]) {
                                console.log(`  ✅ ${fieldKey}: "${component.props[fieldKey]}"`);
                            }
                        }
                    }
                    
                    // Check data
                    if (component.data) {
                        console.log('  Data:', component.data);
                    }
                }
            }
        } else {
            console.log('❌ State manager not available');
        }
    };
    
    // Auto-run after a delay
    setTimeout(() => {
        console.log('\n🔍 AUTO-CHECKING TOPICS DATA...\n');
        window.checkTopicsData();
    }, 2000);
    
    console.log('💡 Run window.checkTopicsData() to check topics data in state manager');
})();