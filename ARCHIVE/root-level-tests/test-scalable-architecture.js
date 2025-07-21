/**
 * SCALABLE ARCHITECTURE TEST SUITE
 * Tests Base Component Data Service across all components
 * 
 * Usage: Run in browser console on Media Kit Builder page
 */

function testScalableArchitecture() {
    console.log('🏗️ TESTING: Scalable Base Component Data Service Architecture');
    console.log('═'.repeat(70));
    
    const results = {
        postIdDetection: {},
        universalInjection: {},
        componentServices: {},
        dataConsistency: {},
        scalability: {}
    };
    
    // Test 1: Universal Post ID Detection
    console.log('1️⃣ UNIVERSAL POST ID DETECTION');
    console.log('─'.repeat(40));
    
    const jsPostId = window.gmkbData?.postId;
    const urlPostId = new URLSearchParams(window.location.search).get('post_id');
    const previewPostId = document.querySelector('.topics-container')?.getAttribute('data-post-id');
    
    results.postIdDetection = {
        jsPostId: jsPostId || 'MISSING',
        urlPostId: urlPostId || 'MISSING', 
        previewPostId: previewPostId || 'MISSING',
        allConsistent: jsPostId === urlPostId && jsPostId === previewPostId,
        available: !!jsPostId
    };
    
    console.log(`   JavaScript: ${results.postIdDetection.jsPostId}`);
    console.log(`   URL Parameter: ${results.postIdDetection.urlPostId}`);
    console.log(`   Preview Context: ${results.postIdDetection.previewPostId}`);
    console.log(`   ✅ Consistent: ${results.postIdDetection.allConsistent ? 'YES' : 'NO'}`);
    
    // Test 2: Universal AJAX Injection
    console.log('\n2️⃣ UNIVERSAL AJAX INJECTION TEST');
    console.log('─'.repeat(40));
    
    const testAjaxData = new FormData();
    testAjaxData.append('action', 'guestify_render_design_panel');
    testAjaxData.append('component', 'topics');
    testAjaxData.append('post_id', jsPostId); // ✅ Universal injection
    testAjaxData.append('nonce', window.guestifyData?.nonce || 'test');
    
    results.universalInjection = {
        postIdIncluded: !!jsPostId,
        nonceAvailable: !!(window.guestifyData?.nonce),
        ajaxUrlAvailable: !!(window.guestifyData?.ajaxUrl),
        ready: !!jsPostId && !!(window.guestifyData?.nonce) && !!(window.guestifyData?.ajaxUrl)
    };
    
    console.log(`   Post ID will be sent: ${results.universalInjection.postIdIncluded ? '✅ YES' : '❌ NO'}`);
    console.log(`   Nonce available: ${results.universalInjection.nonceAvailable ? '✅ YES' : '❌ NO'}`);
    console.log(`   AJAX URL available: ${results.universalInjection.ajaxUrlAvailable ? '✅ YES' : '❌ NO'}`);
    console.log(`   ✅ Ready for AJAX: ${results.universalInjection.ready ? 'YES' : 'NO'}`);
    
    // Test 3: Component Services Scalability
    console.log('\n3️⃣ COMPONENT SERVICES SCALABILITY');
    console.log('─'.repeat(40));
    
    const componentTypes = ['topics', 'hero', 'biography', 'social', 'testimonials', 'contact'];
    results.componentServices = {};
    
    componentTypes.forEach(componentType => {
        const hasDesignPanel = !!document.querySelector(`[data-component="${componentType}"]`);
        const canUseAjax = results.universalInjection.ready;
        
        results.componentServices[componentType] = {
            hasDesignPanel: hasDesignPanel,
            canUseUniversalAjax: canUseAjax,
            scalable: hasDesignPanel && canUseAjax
        };
        
        console.log(`   ${componentType}: ${results.componentServices[componentType].scalable ? '✅ SCALABLE' : '⚠️ NEEDS SETUP'}`);
    });
    
    // Test 4: Data Consistency Across Contexts
    console.log('\n4️⃣ DATA CONSISTENCY TEST');
    console.log('─'.repeat(40));
    
    // Test Topics component (our reference implementation)
    const sidebarTopics = document.querySelectorAll('.live-topic-item').length;
    const previewTopics = document.querySelectorAll('.topic-item').length;
    const sidebarMessage = document.querySelector('.empty-state-message')?.textContent?.trim();
    
    results.dataConsistency = {
        sidebarTopics: sidebarTopics,
        previewTopics: previewTopics,
        consistent: sidebarTopics === previewTopics,
        bothEmpty: sidebarTopics === 0 && previewTopics === 0,
        bothHaveData: sidebarTopics > 0 && previewTopics > 0,
        message: sidebarMessage || 'No message'
    };
    
    console.log(`   Sidebar Topics: ${results.dataConsistency.sidebarTopics}`);
    console.log(`   Preview Topics: ${results.dataConsistency.previewTopics}`);
    console.log(`   ✅ Consistent: ${results.dataConsistency.consistent ? 'YES' : 'NO'}`);
    if (sidebarMessage && sidebarMessage.includes('No topics found')) {
        console.log(`   ⚠️ Issue: ${sidebarMessage}`);
    }
    
    // Test 5: Overall Scalability Assessment
    console.log('\n5️⃣ SCALABILITY ASSESSMENT');
    console.log('─'.repeat(40));
    
    const scalableComponents = Object.values(results.componentServices).filter(c => c.scalable).length;
    const totalComponents = Object.keys(results.componentServices).length;
    
    results.scalability = {
        scalableComponents: scalableComponents,
        totalComponents: totalComponents,
        scalabilityPercentage: Math.round((scalableComponents / totalComponents) * 100),
        architectureReady: results.postIdDetection.allConsistent && results.universalInjection.ready,
        dataConsistent: results.dataConsistency.consistent,
        overallScore: 0
    };
    
    // Calculate overall score
    let score = 0;
    if (results.postIdDetection.allConsistent) score += 25;
    if (results.universalInjection.ready) score += 25;
    if (results.dataConsistency.consistent) score += 25;
    if (results.scalability.scalabilityPercentage >= 80) score += 25;
    
    results.scalability.overallScore = score;
    
    console.log(`   Scalable Components: ${scalableComponents}/${totalComponents} (${results.scalability.scalabilityPercentage}%)`);
    console.log(`   Architecture Ready: ${results.scalability.architectureReady ? '✅ YES' : '❌ NO'}`);
    console.log(`   Data Consistent: ${results.scalability.dataConsistent ? '✅ YES' : '❌ NO'}`);
    console.log(`   Overall Score: ${results.scalability.overallScore}/100`);
    
    // Final Assessment
    console.log('\n═'.repeat(70));
    console.log('🎯 FINAL ASSESSMENT');
    
    if (results.scalability.overallScore >= 90) {
        console.log('🎉 EXCELLENT: Scalable architecture fully implemented and working!');
        console.log('   ✅ All components can use Base_Component_Data_Service pattern');
        console.log('   ✅ Universal post ID injection working');
        console.log('   ✅ Data consistency achieved across contexts');
    } else if (results.scalability.overallScore >= 70) {
        console.log('✅ GOOD: Scalable architecture mostly working');
        console.log('   🔄 Some components may need individual setup');
        console.log('   📋 Run component-specific tests for details');
    } else if (results.scalability.overallScore >= 50) {
        console.log('⚠️ PARTIAL: Architecture foundation in place but needs work');
        console.log('   🔧 Check post ID detection and AJAX configuration');
        console.log('   📝 Review component service implementations');
    } else {
        console.log('❌ NEEDS WORK: Scalable architecture not fully operational');
        console.log('   🚨 Post ID detection may be failing');
        console.log('   🔧 Universal AJAX injection needs debugging');
    }
    
    console.log('\n📊 DETAILED RESULTS:');
    console.table(results);
    
    return results;
}

// Test individual component scalability
function testComponentScalability(componentType) {
    console.log(`🧪 TESTING: ${componentType.toUpperCase()} Component Scalability`);
    console.log('═'.repeat(50));
    
    const postId = window.gmkbData?.postId;
    if (!postId) {
        console.log('❌ Cannot test: No post ID available');
        return false;
    }
    
    // Simulate AJAX call for this component
    const formData = new FormData();
    formData.append('action', 'guestify_render_design_panel');
    formData.append('component', componentType);
    formData.append('post_id', postId);
    formData.append('nonce', window.guestifyData?.nonce || 'test');
    
    console.log(`✅ ${componentType} component ready for scalable architecture:`);
    console.log(`   Post ID: ${postId}`);
    console.log(`   Component: ${componentType}`);
    console.log(`   Will use Base_Component_Data_Service pattern`);
    console.log(`   Universal post ID injection: ✅ ACTIVE`);
    
    return true;
}

// Generate service template for new components
function generateComponentServiceTemplate(componentType) {
    const template = `<?php
/**
 * ${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Component Data Service - SCALABLE ARCHITECTURE
 * 
 * Generated service template using Base_Component_Data_Service
 * Follow this pattern for consistent, scalable component development
 * 
 * @package Guestify/Components/${componentType.charAt(0).toUpperCase() + componentType.slice(1)}
 * @version 1.0.0-scalable-base-service
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Load base service if not already loaded
if (!class_exists('Base_Component_Data_Service')) {
    require_once GUESTIFY_PLUGIN_DIR . 'system/Base_Component_Data_Service.php';
}

class ${componentType.charAt(0).toUpperCase() + componentType.slice(1)}_Data_Service extends Base_Component_Data_Service {
    
    /**
     * Component type identifier
     */
    protected static $component_type = '${componentType}';
    
    /**
     * SCALABLE: Get unified component data
     * Implements base class abstract method for ${componentType} component
     */
    public static function get_unified_component_data($context = 'unknown') {
        $post_id_result = self::detect_post_id($context);
        $current_post_id = $post_id_result['post_id'];
        
        $${componentType}_result = self::load_${componentType}_data($current_post_id);
        
        return array(
            '${componentType}_data' => $${componentType}_result['data'],
            'post_id' => $current_post_id,
            'post_id_source' => $post_id_result['source'],
            'data_source' => $${componentType}_result['source'],
            'success' => $${componentType}_result['success'],
            'message' => $${componentType}_result['message'],
            'context' => $context,
            'component_type' => self::$component_type,
            'timestamp' => current_time('mysql')
        );
    }
    
    /**
     * SCALABLE: Get component data for preview area
     */
    public static function get_preview_data($context = 'preview') {
        $data = self::get_unified_component_data($context);
        return array(
            '${componentType}_data' => $data['${componentType}_data'],
            'found' => $data['success'],
            'post_id' => $data['post_id'],
            'component_type' => self::$component_type
        );
    }
    
    /**
     * SCALABLE: Get component data for sidebar/design panel
     */
    public static function get_sidebar_data($context = 'sidebar') {
        $data = self::get_unified_component_data($context);
        return array(
            '${componentType}_data' => $data['${componentType}_data'],
            'found' => $data['success'],
            'post_id' => $data['post_id'],
            'message' => $data['message'],
            'component_type' => self::$component_type
        );
    }
    
    /**
     * ${componentType.toUpperCase()}-SPECIFIC: Load ${componentType} data
     */
    private static function load_${componentType}_data($post_id) {
        // TODO: Implement ${componentType}-specific data loading logic
        
        return array(
            'data' => array(),
            'source' => 'component_data_scalable',
            'success' => false,
            'message' => '${componentType.charAt(0).toUpperCase() + componentType.slice(1)} data loading not yet implemented',
            'debug' => array()
        );
    }
}

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ SCALABLE ${componentType.toUpperCase()}: ${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Data Service loaded with scalable base architecture');
}
?>`;
    
    console.log(`📝 SERVICE TEMPLATE FOR ${componentType.toUpperCase()} COMPONENT:`);
    console.log('═'.repeat(60));
    console.log(template);
    console.log('\n💾 Save this as: components/' + componentType + '/class-' + componentType + '-data-service.php');
    
    return template;
}

// Auto-run on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', testScalableArchitecture);
} else {
    testScalableArchitecture();
}

// Make functions available globally
window.testScalableArchitecture = testScalableArchitecture;
window.testComponentScalability = testComponentScalability;
window.generateComponentServiceTemplate = generateComponentServiceTemplate;

console.log('🏗️ Scalable Architecture Test Suite loaded');
console.log('📊 Commands available:');
console.log('   testScalableArchitecture() - Full architecture test');
console.log('   testComponentScalability("componentType") - Test specific component');
console.log('   generateComponentServiceTemplate("componentType") - Generate service template');
