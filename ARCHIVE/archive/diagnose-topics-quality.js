/**
 * TOPICS QUALITY SCORE DIAGNOSTIC TOOL
 * 
 * This tool helps diagnose why your Topics component has a 44% quality score
 * and provides specific recommendations for improvement.
 */

function diagnoseTopicsQualityScore() {
    console.group('🔍 TOPICS QUALITY SCORE DIAGNOSTIC');
    
    // Get the current Topics mapping
    const mapping = window.mkcgDataMapper?.mapDataToComponent('topics');
    
    if (!mapping) {
        console.error('❌ Could not get Topics mapping');
        console.groupEnd();
        return;
    }
    
    console.log('📊 Overall Quality Score:', mapping.metadata.dataQuality.overallScore + '%');
    console.log('🎯 Priority Score:', mapping.metadata.priority);
    console.log('📝 Mapped Fields:', mapping.metadata.mappedFields, '/', mapping.metadata.totalFields);
    
    // Analyze each field's quality
    console.log('\n📋 FIELD-BY-FIELD ANALYSIS:');
    console.log('=================================');
    
    const fieldScores = mapping.metadata.dataQuality.fieldScores;
    const props = mapping.props;
    
    Object.entries(fieldScores).forEach(([fieldName, score]) => {
        const value = props[fieldName];
        const issues = [];
        const improvements = [];
        
        console.log(`\n🏷️ Field: ${fieldName}`);
        console.log(`📊 Score: ${score}/100`);
        console.log(`💬 Value: "${value || 'Not set'}"`);
        
        if (!value) {
            issues.push('❌ No value provided');
            improvements.push('✅ Add content for this field');
        } else {
            // Analyze the value
            const length = String(value).length;
            const wordCount = String(value).split(' ').length;
            
            if (length <= 10) {
                issues.push('⚠️ Content too short');
                improvements.push('✅ Add more descriptive content (aim for 15+ characters)');
            }
            
            if (wordCount <= 2) {
                issues.push('⚠️ Only 1-2 words');
                improvements.push('✅ Use more descriptive phrases (3+ words)');
            }
            
            if (/topic \d+|placeholder|example|sample/i.test(value)) {
                issues.push('❌ Appears to be placeholder text');
                improvements.push('✅ Replace with actual topic content');
            }
            
            if (length > 50) {
                issues.push('⚠️ Content might be too long for a topic');
                improvements.push('✅ Consider shortening to 20-50 characters');
            }
        }
        
        if (issues.length > 0) {
            console.log('🚨 Issues found:');
            issues.forEach(issue => console.log('  ' + issue));
            console.log('💡 Improvements:');
            improvements.forEach(improvement => console.log('  ' + improvement));
        } else {
            console.log('✅ Field looks good!');
        }
    });
    
    // Overall recommendations
    console.log('\n🎯 OVERALL RECOMMENDATIONS:');
    console.log('===============================');
    
    const overallScore = mapping.metadata.dataQuality.overallScore;
    
    if (overallScore < 50) {
        console.log('🔴 CRITICAL: Quality score below 50%');
        console.log('  - Focus on adding substantial, non-placeholder content');
        console.log('  - Ensure all topics are 3+ words and descriptive');
        console.log('  - Remove any "Topic 1", "Topic 2" placeholder text');
    } else if (overallScore < 70) {
        console.log('🟡 MODERATE: Quality score needs improvement');
        console.log('  - Expand short topic titles to be more descriptive');
        console.log('  - Add missing topics to fill all 5 slots');
        console.log('  - Use professional, specific terminology');
    } else {
        console.log('🟢 GOOD: Quality score is acceptable');
        console.log('  - Minor improvements could boost to excellent');
    }
    
    // Generate ideal examples
    console.log('\n💎 EXAMPLES OF HIGH-QUALITY TOPICS:');
    console.log('====================================');
    console.log('❌ Poor: "Topic 1", "Leadership", "Tech"');
    console.log('✅ Good: "Digital Leadership Excellence", "Strategic Innovation Management", "Team Building & Culture"');
    
    console.groupEnd();
    
    return {
        score: overallScore,
        fieldScores,
        props,
        recommendations: mapping.metadata.recommendations
    };
}

function generateImprovedTopicsExample() {
    console.group('💎 IMPROVED TOPICS EXAMPLE');
    
    const currentMapping = window.mkcgDataMapper?.mapDataToComponent('topics');
    const currentProps = currentMapping?.props || {};
    
    console.log('📋 Current Topics:');
    Object.entries(currentProps).forEach(([field, value]) => {
        if (field.startsWith('topic_')) {
            console.log(`  ${field}: "${value}"`);
        }
    });
    
    console.log('\n✨ IMPROVED VERSION:');
    const improvedTopics = {
        topic_1: "Digital Transformation Leadership",
        topic_2: "Building High-Performance Teams", 
        topic_3: "Strategic Innovation Management",
        topic_4: "Change Management Excellence",
        topic_5: "Future Workplace Strategies"
    };
    
    Object.entries(improvedTopics).forEach(([field, value]) => {
        console.log(`  ${field}: "${value}"`);
    });
    
    // Test the improved quality
    const testData = {
        topics: {
            topics: improvedTopics
        }
    };
    
    const improvedMapping = window.mkcgDataMapper?.mapDataToComponent('topics', testData);
    const improvedScore = improvedMapping?.metadata?.dataQuality?.overallScore || 0;
    
    console.log(`\n📊 Estimated Improved Score: ${improvedScore}%`);
    console.log(`📈 Improvement: +${improvedScore - (currentMapping?.metadata?.dataQuality?.overallScore || 0)}%`);
    
    console.groupEnd();
    
    return improvedTopics;
}

function fixTopicsQualityIssues() {
    console.group('🔧 FIX TOPICS QUALITY ISSUES');
    
    // Get current state
    const state = window.enhancedStateManager?.getState();
    const topicsComponents = Object.values(state.components || {})
        .filter(comp => comp.type === 'topics');
    
    if (topicsComponents.length === 0) {
        console.warn('⚠️ No Topics components found to fix');
        console.groupEnd();
        return;
    }
    
    const latestTopics = topicsComponents[topicsComponents.length - 1];
    console.log('🎯 Fixing component:', latestTopics.id);
    
    // Generate improved topics
    const improvedTopics = generateImprovedTopicsExample();
    
    // Apply improvements
    const updatedProps = {
        ...latestTopics.props,
        ...improvedTopics,
        title: "Areas of Expertise" // Better title
    };
    
    try {
        window.enhancedComponentManager?.updateComponent(latestTopics.id, {
            props: updatedProps
        });
        
        console.log('✅ Topics component updated with improved quality');
        
        // Test new quality score
        setTimeout(() => {
            const newMapping = window.mkcgDataMapper?.mapDataToComponent('topics');
            const newScore = newMapping?.metadata?.dataQuality?.overallScore || 0;
            console.log(`🎉 New Quality Score: ${newScore}%`);
        }, 500);
        
    } catch (error) {
        console.error('❌ Error updating component:', error);
    }
    
    console.groupEnd();
}

// Quick diagnostic commands
console.log(`
🔍 TOPICS QUALITY DIAGNOSTIC COMMANDS
====================================

1. DIAGNOSE CURRENT SCORE:
   diagnoseTopicsQualityScore()

2. SEE IMPROVED EXAMPLE:
   generateImprovedTopicsExample()

3. FIX QUALITY ISSUES:
   fixTopicsQualityIssues()

🚀 Start with: diagnoseTopicsQualityScore()
`);
