/**
 * Phase 1 Diagnostic and Fix Script
 * Checks for configuration availability and provides fixes
 */

(function() {
    console.log('🔍 PHASE 1 DIAGNOSTIC STARTING...');
    console.log('==================================');
    
    // Check what's available
    const configs = {
        gmkbConfig: typeof window.gmkbConfig !== 'undefined' ? window.gmkbConfig : null,
        gmkbData: typeof window.gmkbData !== 'undefined' ? window.gmkbData : null,
        mkcg_vars: typeof window.mkcg_vars !== 'undefined' ? window.mkcg_vars : null
    };
    
    console.log('Available configs:');
    Object.entries(configs).forEach(([name, value]) => {
        console.log(`  ${name}: ${value ? '✅ Found' : '❌ Not found'}`);
    });
    
    // Find the actual config - Vue bundle expects gmkbData
    let actualConfig = configs.gmkbData || configs.gmkbConfig || configs.mkcg_vars;
    
    if (!actualConfig) {
        console.error('❌ No configuration object found!');
        console.log('Checking for WordPress script localization...');
        
        // Check if scripts are enqueued
        const scripts = document.querySelectorAll('script[src*="gmkb"]');
        console.log(`Found ${scripts.length} GMKB scripts`);
        scripts.forEach(script => {
            console.log('  Script:', script.src);
        });
        
        // Check for inline scripts with config
        const inlineScripts = Array.from(document.querySelectorAll('script:not([src])')).filter(
            script => script.textContent.includes('gmkb')
        );
        console.log(`Found ${inlineScripts.length} inline scripts with gmkb references`);
        
        return;
    }
    
    // Ensure gmkbData exists for Vue bundle
    if (actualConfig && !window.gmkbData) {
        console.log('⚠️ Config found but not as gmkbData. Creating for Vue bundle...');
        window.gmkbData = actualConfig;
        console.log('✅ Created window.gmkbData for Vue');
    }
    
    // Verify Phase 1 configuration
    console.log('\n📋 PHASE 1 CONFIGURATION CHECK:');
    console.log('================================');
    
    const config = window.gmkbData || actualConfig;
    
    // Check for Phase 1 API configuration
    const phase1Checks = {
        'API URL': config?.api || config?.restUrl,
        'REST Nonce': config?.nonce || config?.restNonce,
        'Post ID': config?.postId || config?.post_id,
        'Ajax URL': config?.ajaxUrl,
        'Ajax Nonce': config?.ajaxNonce,
        'Pure Vue Mode': config?.features?.pureVueMode,
        'API Version': config?.features?.apiVersion
    };
    
    console.log('Phase 1 Configuration:');
    Object.entries(phase1Checks).forEach(([key, value]) => {
        const status = value ? '✅' : '❌';
        console.log(`  ${status} ${key}: ${value || 'NOT SET'}`);
    });
    
    // Check for Pods data
    if (config?.podsData || config?.pods_data) {
        const podsData = config.podsData || config.pods_data;
        const fieldCount = Object.keys(podsData).filter(key => podsData[key]).length;
        console.log(`  ✅ Pods Data: ${fieldCount} fields loaded`);
    } else {
        console.log('  ❌ Pods Data: Not loaded');
    }
    
    // Check Vue bundle
    const vueBundle = document.querySelector('script[src*="gmkb.iife.js"]');
    console.log(`  ${vueBundle ? '✅' : '❌'} Vue Bundle: ${vueBundle ? 'Loaded' : 'Not loaded'}`);
    
    // Check for legacy scripts
    const legacyScripts = Array.from(document.querySelectorAll('script[src*="/js/"]')).filter(
        s => !s.src.includes('debug') && !s.src.includes('phase1')
    );
    console.log(`  ${legacyScripts.length === 0 ? '✅' : '⚠️'} Legacy Scripts: ${legacyScripts.length} found`);
    
    // Test API endpoint
    console.log('\n🔌 TESTING API ENDPOINT:');
    console.log('========================');
    
    if (config?.api && config?.postId && config?.nonce) {
        const apiUrl = `${config.api}mediakit/${config.postId}`;
        console.log(`Testing: GET ${apiUrl}`);
        
        fetch(apiUrl, {
            headers: { 'X-WP-Nonce': config.nonce }
        })
        .then(response => {
            console.log(`  Response Status: ${response.status} ${response.statusText}`);
            return response.json();
        })
        .then(data => {
            console.log('  ✅ API Response received');
            console.log('  Data structure:', {
                version: data.version,
                postId: data.postId,
                hasComponents: !!data.components,
                hasSections: !!data.sections,
                hasPodsData: !!data.podsData,
                podsFields: data.podsData ? Object.keys(data.podsData).length : 0
            });
        })
        .catch(error => {
            console.error('  ❌ API Error:', error);
        });
    } else {
        console.log('  ❌ Cannot test API - missing configuration');
        console.log('    Missing:', {
            api: !config?.api,
            postId: !config?.postId,
            nonce: !config?.nonce
        });
    }
    
    // Provide helper functions
    window.testPhase1API = function() {
        const cfg = window.gmkbData || actualConfig;
        if (!cfg) {
            console.error('No configuration available');
            return;
        }
        
        const apiUrl = cfg.api || cfg.restUrl || '/wp-json/gmkb/v1/';
        const postId = cfg.postId || cfg.post_id || 1;
        const nonce = cfg.nonce || cfg.restNonce || '';
        
        console.log('Testing API with:', { apiUrl, postId, nonce });
        
        return fetch(`${apiUrl}mediakit/${postId}`, {
            headers: { 'X-WP-Nonce': nonce }
        }).then(r => r.json());
    };
    
    window.getPhase1Config = function() {
        return window.gmkbData || actualConfig || null;
    };
    
    console.log('\n🔧 HELPER FUNCTIONS AVAILABLE:');
    console.log('==============================');
    console.log('  testPhase1API() - Test the Phase 1 REST API');
    console.log('  getPhase1Config() - Get the current configuration');
    
    // Final status
    const hasConfig = !!(window.gmkbData || actualConfig);
    const hasAPI = hasConfig && (config?.api || config?.restUrl);
    const hasVueBundle = !!vueBundle;
    const noLegacyScripts = legacyScripts.length === 0;
    
    const phase1Ready = hasConfig && hasAPI && hasVueBundle;
    
    console.log('\n📊 PHASE 1 STATUS:');
    console.log('==================');
    console.log(phase1Ready ? '✅ PHASE 1 READY' : '❌ PHASE 1 NOT READY');
    
    if (!phase1Ready) {
        console.log('\nIssues to fix:');
        if (!hasConfig) console.log('  - Configuration not loaded');
        if (!hasAPI) console.log('  - API endpoint not configured');
        if (!hasVueBundle) console.log('  - Vue bundle not loaded');
        if (!noLegacyScripts) console.log('  - Legacy scripts still loading (not critical)');
    }
    
})();
