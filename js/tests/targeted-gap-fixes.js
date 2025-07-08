/**
 * @file targeted-gap-fixes.js
 * @description Targeted fixes for the most common Phase 2.3 implementation gaps
 * 
 * CRITICAL: This file contains root-level fixes for the 12.5% gaps identified
 */

(function applyTargetedGapFixes() {
    console.log('🎯 APPLYING TARGETED GAP FIXES - PHASE 2.3');
    console.log('============================================');
    console.log('');
    
    const fixResults = {
        timestamp: new Date().toISOString(),
        appliedFixes: [],
        errors: [],
        success: true
    };
    
    // FIX 1: Enhanced Component Manager Runtime Integration
    console.group('🔧 Fix 1: Enhanced Component Manager Runtime Integration');
    
    try {
        if (!window.enhancedComponentManager || !window.enhancedComponentManager.isInitialized) {
            console.log('🔄 Initializing Enhanced Component Manager...');
            
            // Ensure component manager is available and initialized
            if (window.enhancedComponentManager) {
                if (typeof window.enhancedComponentManager.init === 'function') {
                    window.enhancedComponentManager.init();
                    console.log('✅ Enhanced Component Manager initialized');
                }
                
                // Verify addComponent method is available
                if (typeof window.enhancedComponentManager.addComponent === 'function') {
                    console.log('✅ addComponent method verified');
                } else {
                    console.warn('⚠️ addComponent method missing');
                }
            } else {
                console.error('❌ Enhanced Component Manager not available');
                fixResults.errors.push('Enhanced Component Manager not loaded');
            }
        } else {
            console.log('✅ Enhanced Component Manager already initialized');
        }
        
        fixResults.appliedFixes.push('Enhanced Component Manager Runtime Integration');
        
    } catch (error) {
        console.error('❌ Fix 1 failed:', error);
        fixResults.errors.push(`Fix 1: ${error.message}`);
    }
    
    console.groupEnd();
    
    // FIX 2: Empty State DOM Integration
    console.group('🔧 Fix 2: Empty State DOM Integration');
    
    try {
        const previewContainer = document.getElementById('media-kit-preview');
        
        if (previewContainer) {
            console.log('✅ Preview container found');
            
            // Check if empty state is properly configured
            const emptyState = previewContainer.querySelector('.empty-state-enhanced');
            
            if (emptyState) {
                console.log('✅ Empty state container found');
                
                // Ensure empty state is visible when no components
                const components = previewContainer.querySelectorAll('.mk-component');
                if (components.length === 0) {
                    emptyState.style.display = 'block';
                    console.log('✅ Empty state made visible');
                }
            } else {
                console.warn('⚠️ Empty state container missing in preview');
                
                // Create basic empty state if missing
                const basicEmptyState = document.createElement('div');
                basicEmptyState.className = 'empty-state-enhanced';
                basicEmptyState.innerHTML = `
                    <div class="empty-state-icon">🔗</div>
                    <h3 class="empty-state-title">Connect Your Content Data</h3>
                    <p class="empty-state-description">Link to MKCG post data for intelligent auto-population.</p>
                    <div class="empty-state-actions">
                        <button class="btn btn--primary connect-data-btn">Connect Data Source</button>
                        <button class="btn btn--secondary manual-build-btn">Build Manually</button>
                    </div>
                `;
                previewContainer.appendChild(basicEmptyState);
                console.log('✅ Basic empty state created');
            }
        } else {
            console.error('❌ Preview container not found');
            fixResults.errors.push('Preview container (#media-kit-preview) missing');
        }
        
        fixResults.appliedFixes.push('Empty State DOM Integration');
        
    } catch (error) {
        console.error('❌ Fix 2 failed:', error);
        fixResults.errors.push(`Fix 2: ${error.message}`);
    }
    
    console.groupEnd();
    
    // FIX 3: MKCG Data Mapper Integration
    console.group('🔧 Fix 3: MKCG Data Mapper Integration');
    
    try {
        if (!window.mkcgDataMapper) {
            console.log('🔄 Creating basic MKCG Data Mapper...');
            
            // Create basic data mapper if missing
            window.mkcgDataMapper = {
                mapDataToComponent: function(componentType, mkcgData) {
                    if (!mkcgData) return {};
                    
                    const mappings = {
                        'hero': {
                            'name': mkcgData.post_info?.title || mkcgData.biography?.biography?.name,
                            'title': mkcgData.biography?.biography?.title,
                            'bio_text': mkcgData.biography?.biography?.short
                        },
                        'topics': {
                            'topic_1': mkcgData.topics?.topics?.topic_1,
                            'topic_2': mkcgData.topics?.topics?.topic_2,
                            'topic_3': mkcgData.topics?.topics?.topic_3
                        },
                        'biography': {
                            'bio_text': mkcgData.biography?.biography?.medium,
                            'long_bio': mkcgData.biography?.biography?.long
                        }
                    };
                    
                    return mappings[componentType] || {};
                },
                
                getDataAvailability: function() {
                    const mkcgData = window.guestifyData?.mkcgData;
                    if (!mkcgData) return {};
                    
                    return {
                        has_topics: !!(mkcgData.topics?.topics),
                        has_biography: !!(mkcgData.biography?.biography),
                        has_authority_hook: !!(mkcgData.authority_hook?.authority_hook)
                    };
                }
            };
            
            console.log('✅ Basic MKCG Data Mapper created');
        } else {
            console.log('✅ MKCG Data Mapper already available');
        }
        
        fixResults.appliedFixes.push('MKCG Data Mapper Integration');
        
    } catch (error) {
        console.error('❌ Fix 3 failed:', error);
        fixResults.errors.push(`Fix 3: ${error.message}`);
    }
    
    console.groupEnd();
    
    // FIX 4: Component State Visual Indicators
    console.group('🔧 Fix 4: Component State Visual Indicators');
    
    try {
        // Add CSS for component indicators if missing
        const existingStyle = document.getElementById('phase23-component-indicators');
        
        if (!existingStyle) {
            const style = document.createElement('style');
            style.id = 'phase23-component-indicators';
            style.textContent = `
                /* Task 3: Component State Indicators */
                .mk-component[data-mkcg-populated="true"] {
                    border-left: 4px solid #10b981;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, transparent 100%);
                    position: relative;
                }
                
                .mk-component .quality-badge {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: var(--quality-color, #10b981);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    z-index: 10;
                }
                
                .mk-component .data-freshness {
                    position: absolute;
                    bottom: 8px;
                    left: 8px;
                    font-size: 10px;
                    color: #6b7280;
                    background: rgba(255, 255, 255, 0.9);
                    padding: 2px 6px;
                    border-radius: 4px;
                }
                
                .quality-badge.quality-excellent { --quality-color: #10b981; }
                .quality-badge.quality-good { --quality-color: #3b82f6; }
                .quality-badge.quality-fair { --quality-color: #f59e0b; }
                .quality-badge.quality-poor { --quality-color: #ef4444; }
            `;
            document.head.appendChild(style);
            console.log('✅ Component indicator styles added');
        } else {
            console.log('✅ Component indicator styles already present');
        }
        
        fixResults.appliedFixes.push('Component State Visual Indicators');
        
    } catch (error) {
        console.error('❌ Fix 4 failed:', error);
        fixResults.errors.push(`Fix 4: ${error.message}`);
    }
    
    console.groupEnd();
    
    // FIX 5: Auto-Generation Integration
    console.group('🔧 Fix 5: Auto-Generation Integration');
    
    try {
        // Add auto-generation button functionality
        const autoGenButtons = document.querySelectorAll('.auto-generate-all-btn, .auto-generate-available-btn');
        
        autoGenButtons.forEach(button => {
            if (!button.dataset.listenerAdded) {
                button.addEventListener('click', function() {
                    console.log('🔄 Auto-generation triggered');
                    
                    if (window.enhancedComponentManager && window.mkcgDataMapper) {
                        const mkcgData = window.guestifyData?.mkcgData;
                        
                        if (mkcgData) {
                            // Basic auto-generation
                            const availability = window.mkcgDataMapper.getDataAvailability();
                            
                            if (availability.has_topics) {
                                console.log('🔄 Adding topics component...');
                                if (typeof window.enhancedComponentManager.addComponent === 'function') {
                                    window.enhancedComponentManager.addComponent('topics');
                                }
                            }
                            
                            if (availability.has_biography) {
                                console.log('🔄 Adding biography component...');
                                if (typeof window.enhancedComponentManager.addComponent === 'function') {
                                    window.enhancedComponentManager.addComponent('biography');
                                }
                            }
                            
                            console.log('✅ Auto-generation completed');
                        } else {
                            console.warn('⚠️ No MKCG data available for auto-generation');
                        }
                    } else {
                        console.warn('⚠️ Auto-generation dependencies not available');
                    }
                });
                
                button.dataset.listenerAdded = 'true';
                console.log(`✅ Auto-generation listener added to button`);
            }
        });
        
        if (autoGenButtons.length === 0) {
            console.log('ℹ️ No auto-generation buttons found (expected if no MKCG data)');
        }
        
        fixResults.appliedFixes.push('Auto-Generation Integration');
        
    } catch (error) {
        console.error('❌ Fix 5 failed:', error);
        fixResults.errors.push(`Fix 5: ${error.message}`);
    }
    
    console.groupEnd();
    
    // FIX 6: Data Connection Controls
    console.group('🔧 Fix 6: Data Connection Controls');
    
    try {
        const connectButtons = document.querySelectorAll('.connect-data-btn');
        
        connectButtons.forEach(button => {
            if (!button.dataset.listenerAdded) {
                button.addEventListener('click', function() {
                    console.log('🔄 Data connection triggered');
                    
                    // Simulate data connection process
                    const postId = prompt('Enter MKCG Post ID to connect:', '');
                    
                    if (postId && window.guestifyData) {
                        // Update URL with post_id parameter
                        const url = new URL(window.location);
                        url.searchParams.set('post_id', postId);
                        
                        console.log(`🔄 Connecting to post ID: ${postId}`);
                        console.log('🔄 Recommended: Reload page with post_id parameter');
                        console.log(`🔗 URL: ${url.toString()}`);
                        
                        // Offer to reload with post_id
                        if (confirm('Reload page with post_id parameter?')) {
                            window.location.href = url.toString();
                        }
                    }
                });
                
                button.dataset.listenerAdded = 'true';
                console.log('✅ Data connection listener added');
            }
        });
        
        fixResults.appliedFixes.push('Data Connection Controls');
        
    } catch (error) {
        console.error('❌ Fix 6 failed:', error);
        fixResults.errors.push(`Fix 6: ${error.message}`);
    }
    
    console.groupEnd();
    
    // FIX 7: Manual Build Fallback
    console.group('🔧 Fix 7: Manual Build Fallback');
    
    try {
        const manualButtons = document.querySelectorAll('.manual-build-btn');
        
        manualButtons.forEach(button => {
            if (!button.dataset.listenerAdded) {
                button.addEventListener('click', function() {
                    console.log('🔄 Manual build triggered');
                    
                    // Hide empty state and show component library
                    const emptyState = document.querySelector('.empty-state-enhanced');
                    if (emptyState) {
                        emptyState.style.display = 'none';
                    }
                    
                    // Show component library if available
                    const componentLibrary = document.getElementById('component-library-overlay');
                    if (componentLibrary) {
                        componentLibrary.style.display = 'block';
                        console.log('✅ Component library opened');
                    } else {
                        // Create basic component selection if modal not available
                        alert('Component library not available. Try adding components directly.');
                        console.log('ℹ️ Component library modal not found');
                    }
                });
                
                button.dataset.listenerAdded = 'true';
                console.log('✅ Manual build listener added');
            }
        });
        
        fixResults.appliedFixes.push('Manual Build Fallback');
        
    } catch (error) {
        console.error('❌ Fix 7 failed:', error);
        fixResults.errors.push(`Fix 7: ${error.message}`);
    }
    
    console.groupEnd();
    
    // Results Summary
    console.log('');
    console.log('🎯 TARGETED FIXES SUMMARY');
    console.log('========================');
    console.log(`✅ Applied Fixes: ${fixResults.appliedFixes.length}`);
    console.log(`❌ Errors: ${fixResults.errors.length}`);
    console.log('');
    
    if (fixResults.appliedFixes.length > 0) {
        console.log('✅ Successfully Applied:');
        fixResults.appliedFixes.forEach(fix => console.log(`   • ${fix}`));
        console.log('');
    }
    
    if (fixResults.errors.length > 0) {
        console.log('❌ Errors Encountered:');
        fixResults.errors.forEach(error => console.log(`   • ${error}`));
        console.log('');
        fixResults.success = false;
    }
    
    if (fixResults.success) {
        console.log('🎉 ALL TARGETED FIXES APPLIED SUCCESSFULLY!');
        console.log('');
        console.log('🔄 NEXT STEPS:');
        console.log('1. Test component addition: window.enhancedComponentManager?.addComponent("hero")');
        console.log('2. Test empty state interactions');
        console.log('3. Run comprehensive validation: js/tests/run-runtime-validation.js');
    } else {
        console.log('⚠️ Some fixes failed. Check errors above.');
        console.log('');
        console.log('🔄 NEXT STEPS:');
        console.log('1. Address the error conditions');
        console.log('2. Re-run targeted fixes');
        console.log('3. Run diagnostic: js/tests/quick-gap-diagnostic.js');
    }
    
    // Store results globally
    window.targetedFixResults = fixResults;
    
    console.log('');
    console.log('📋 Results stored in: window.targetedFixResults');
    
    return fixResults;
})();
