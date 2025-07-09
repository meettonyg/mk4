/**
 * MKCG Auto-Load Diagnostic Tool
 * 
 * This script helps diagnose why MKCG data might not be loading automatically
 * Run this in browser console on the Media Kit Builder page
 */

(function() {
    console.log('🔍 MKCG Auto-Load Diagnostic Tool Starting...');
    
    const diagnostic = {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        
        // Check URL parameters for post ID
        urlParameters: {
            post_id: new URLSearchParams(window.location.search).get('post_id'),
            p: new URLSearchParams(window.location.search).get('p'),
            page_id: new URLSearchParams(window.location.search).get('page_id'),
            mkcg_post: new URLSearchParams(window.location.search).get('mkcg_post'),
            allParams: Object.fromEntries(new URLSearchParams(window.location.search))
        },
        
        // Check if guestifyData exists and has MKCG data
        guestifyData: {
            exists: !!window.guestifyData,
            hasPostId: !!(window.guestifyData?.postId),
            postIdValue: window.guestifyData?.postId || null,
            hasMkcgData: !!(window.guestifyData?.mkcgData),
            mkcgDataType: typeof window.guestifyData?.mkcgData,
            mkcgDataEmpty: window.guestifyData?.mkcgData === null,
            dataSource: window.guestifyData?.dataSource || null,
            mkcgIntegration: window.guestifyData?.mkcgIntegration || null
        },
        
        // Check template and DOM elements
        template: {
            builderExists: !!document.querySelector('.builder'),
            mkcgDashboardExists: !!document.querySelector('.mkcg-enhanced-dashboard'),
            mkcgIndicatorExists: !!document.querySelector('.mkcg-connection-status'),
            emptyStateExists: !!document.querySelector('.empty-state-enhanced'),
            loadButtonExists: !!document.querySelector('[data-action="load-mkcg-data"]') || 
                               !!document.querySelector('.mkcg-load-btn') ||
                               !!document.querySelector('#load-mkcg-data') ||
                               !!document.querySelector('button:contains("Load")')
        },
        
        // Check for error indicators
        errors: {
            jsErrors: window.gmkbPhase1?.errors || [],
            consoleErrors: [],
            networkErrors: []
        },
        
        // Check initialization status
        initialization: {
            templateReady: !!window.gmkbTemplateComplete,
            mediaKitBuilderReady: !!window.mediaKitBuilderReady,
            enhancedComponentManager: !!window.enhancedComponentManager,
            phase1Fixes: window.guestifyData?.phase1Fixes || false
        }
    };
    
    // Try to find the load button more specifically
    const possibleLoadButtons = [
        document.querySelector('button[title*="Load"]'),
        document.querySelector('button[title*="MKCG"]'),
        document.querySelector('.mkcg-load-btn'),
        document.querySelector('.btn:contains("Load")'),
        document.querySelector('[data-action="load-mkcg-data"]'),
        ...Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.toLowerCase().includes('load') && 
            (btn.textContent.toLowerCase().includes('data') || btn.textContent.toLowerCase().includes('mkcg'))
        )
    ].filter(Boolean);
    
    diagnostic.loadButton = {
        found: possibleLoadButtons.length > 0,
        count: possibleLoadButtons.length,
        buttons: possibleLoadButtons.map(btn => ({
            text: btn.textContent.trim(),
            title: btn.title,
            className: btn.className,
            id: btn.id,
            dataAttributes: Object.fromEntries(
                Array.from(btn.attributes)
                    .filter(attr => attr.name.startsWith('data-'))
                    .map(attr => [attr.name, attr.value])
            )
        }))
    };
    
    console.group('📊 MKCG Auto-Load Diagnostic Results');
    console.log('🔗 URL Parameters:', diagnostic.urlParameters);
    console.log('📦 GuestifyData Status:', diagnostic.guestifyData);
    console.log('🏗️ Template Elements:', diagnostic.template);
    console.log('🔘 Load Button Analysis:', diagnostic.loadButton);
    console.log('⚠️ Error Status:', diagnostic.errors);
    console.log('🚀 Initialization Status:', diagnostic.initialization);
    console.groupEnd();
    
    // Provide specific recommendations
    const recommendations = [];
    
    if (!diagnostic.urlParameters.post_id && !diagnostic.urlParameters.p && !diagnostic.urlParameters.page_id) {
        recommendations.push('❌ CRITICAL: No post ID found in URL parameters. Add ?post_id=123 to URL.');
    }
    
    if (!diagnostic.guestifyData.exists) {
        recommendations.push('❌ CRITICAL: guestifyData not found. Script loading issue.');
    }
    
    if (diagnostic.guestifyData.exists && !diagnostic.guestifyData.hasMkcgData) {
        if (diagnostic.guestifyData.hasPostId) {
            recommendations.push('⚠️ WARNING: Post ID detected but no MKCG data loaded. Check post meta data.');
        } else {
            recommendations.push('⚠️ WARNING: No post ID in guestifyData. Check URL parameter detection.');
        }
    }
    
    if (diagnostic.guestifyData.hasMkcgData) {
        recommendations.push('✅ SUCCESS: MKCG data is loaded automatically! The load button may be for refresh/debugging.');
    }
    
    if (diagnostic.loadButton.found) {
        recommendations.push(`🔘 INFO: Found ${diagnostic.loadButton.count} possible load button(s). May be for refresh functionality.`);
    }
    
    console.group('💡 Recommendations');
    recommendations.forEach(rec => console.log(rec));
    console.groupEnd();
    
    // Try to detect if this is a refresh button vs initial load button
    if (diagnostic.guestifyData.hasMkcgData && diagnostic.loadButton.found) {
        console.log('🤔 ANALYSIS: MKCG data is already loaded, so the "Load" button is likely for:');
        console.log('   • Refreshing stale data');
        console.log('   • Manual data reload');
        console.log('   • Debugging purposes');
        console.log('   • Force reload after MKCG updates');
    }
    
    // Return diagnostic object for further inspection
    window.mkcgDiagnostic = diagnostic;
    console.log('📋 Full diagnostic saved to window.mkcgDiagnostic');
    
    return diagnostic;
})();
