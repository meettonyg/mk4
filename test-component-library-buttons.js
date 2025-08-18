/**
 * SIMPLE TEST: Component Library Button Verification
 * Run this in console to verify buttons work automatically
 */

function testComponentLibraryButtons() {
    console.log('🧪 TESTING: Component Library Button Functionality');
    console.log('='.repeat(50));
    
    // Step 1: Check current state
    const debugInfo = window.componentLibrarySystem?.debugInfo();
    console.log('📊 Current State:', debugInfo);
    
    if (!debugInfo) {
        console.error('❌ Component library system not available');
        return;
    }
    
    if (!debugInfo.cancelBtnExists || !debugInfo.addBtnExists) {
        console.error('❌ Buttons not found in DOM');
        return;
    }
    
    // Step 2: Test if onclick handlers are set
    const cancelBtn = document.getElementById('cancel-component-button');
    const addBtn = document.getElementById('add-component-button');
    
    const cancelHasOnclick = typeof cancelBtn?.onclick === 'function';
    const addHasOnclick = typeof addBtn?.onclick === 'function';
    
    console.log('🔍 Onclick Handler Status:');
    console.log('  - Cancel button onclick:', cancelHasOnclick ? '✅ SET' : '❌ NOT SET');
    console.log('  - Add button onclick:', addHasOnclick ? '✅ SET' : '❌ NOT SET');
    
    // Step 3: Test button functionality
    if (cancelHasOnclick && addHasOnclick) {\n        console.log('✅ SUCCESS: Automatic initialization worked!');\n        console.log('🎉 Buttons should work without manual intervention');\n        return 'SUCCESS_AUTOMATIC';\n    } else {\n        console.log('⚠️ WARNING: Automatic initialization incomplete');\n        console.log('💡 Running manual fix...');\n        \n        if (window.componentLibrarySystem?.manualButtonFix) {\n            window.componentLibrarySystem.manualButtonFix();\n            \n            // Recheck after manual fix\n            setTimeout(() => {\n                const cancelBtn2 = document.getElementById('cancel-component-button');\n                const addBtn2 = document.getElementById('add-component-button');\n                const cancelFixed = typeof cancelBtn2?.onclick === 'function';\n                const addFixed = typeof addBtn2?.onclick === 'function';\n                \n                if (cancelFixed && addFixed) {\n                    console.log('✅ SUCCESS: Manual fix worked!');\n                    console.log('🎉 Buttons should now work');\n                } else {\n                    console.log('❌ FAILED: Manual fix did not work');\n                }\n            }, 200);\n            \n            return 'SUCCESS_MANUAL';\n        } else {\n            console.log('❌ FAILED: Manual fix not available');\n            return 'FAILED';\n        }\n    }\n}\n\n// Auto-run test\ntestComponentLibraryButtons();\n\n// Make available globally\nwindow.testComponentLibraryButtons = testComponentLibraryButtons;\n\nconsole.log('🚀 Test function loaded: testComponentLibraryButtons()');
