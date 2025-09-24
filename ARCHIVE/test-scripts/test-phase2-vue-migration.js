// PHASE 2 TEST: Complete Vue Component Migration
// Run this after rebuilding the bundle to test all Vue components

console.log('=== PHASE 2: Vue Component Migration Test ===\n');

// Test 1: Check which components have Vue renderers
console.log('TEST 1: Vue Component Discovery');
console.log('Checking for Vue renderers...');

const vueComponents = [
  'hero',
  'biography', 
  'guest-intro',
  'photo-gallery',
  'logo-grid',
  'topics-questions'
];

const testResults = {};

async function testVueComponents() {
  for (const component of vueComponents) {
    try {
      // Check if Vue discovery finds the component
      if (window.GMKBVueDiscovery && window.GMKBVueDiscovery.hasVueRenderer) {
        const hasVue = await window.GMKBVueDiscovery.hasVueRenderer(component);
        testResults[component] = hasVue;
        console.log(`  ${hasVue ? '✅' : '❌'} ${component}: ${hasVue ? 'Vue renderer found' : 'No Vue renderer'}`);
      }
    } catch (error) {
      console.error(`  ❌ ${component}: Error - ${error.message}`);
      testResults[component] = false;
    }
  }
  
  // Test 2: Add test components with data
  console.log('\nTEST 2: Adding test components with data...');
  
  const testData = {
    hero: {
      title: 'Test Hero Title',
      subtitle: 'This is a test subtitle',
      ctaText: 'Click Me',
      ctaUrl: '#test'
    },
    biography: {
      biography: 'This is a test biography with multiple lines.\n\nIt should display properly formatted text with line breaks preserved.',
      title: 'About Me'
    },
    'guest-intro': {
      full_name: 'John Doe',
      guest_title: 'Senior Developer',
      company: 'Tech Corp',
      tagline: 'Building the future',
      introduction: 'Expert in modern web development'
    },
    'photo-gallery': {
      title: 'Test Gallery',
      images: [
        { url: 'https://via.placeholder.com/300', alt: 'Test Image 1' },
        { url: 'https://via.placeholder.com/400', alt: 'Test Image 2' }
      ],
      columns: 3
    },
    'logo-grid': {
      title: 'Featured Logos',
      logos: [
        { url: 'https://via.placeholder.com/150', name: 'Company 1' },
        { url: 'https://via.placeholder.com/150', name: 'Company 2' }
      ],
      columns: 4
    },
    'topics-questions': {
      topic_1: 'Web Development',
      topic_2: 'Vue.js',
      topic_3: 'WordPress',
      question_1: 'What is your development process?',
      question_2: 'How do you handle state management?',
      topicsTitle: 'My Topics',
      questionsTitle: 'FAQ'
    }
  };
  
  console.log('\nAdding components...');
  const addedComponents = [];
  
  for (const [type, data] of Object.entries(testData)) {
    if (testResults[type]) {
      try {
        const componentId = window.GMKB.addComponent(type, data);
        addedComponents.push({ type, id: componentId });
        console.log(`  ✅ Added ${type}: ${componentId}`);
      } catch (error) {
        console.error(`  ❌ Failed to add ${type}: ${error.message}`);
      }
    }
  }
  
  // Test 3: Verify components rendered with data
  console.log('\nTEST 3: Verifying rendered components...');
  
  setTimeout(() => {
    addedComponents.forEach(({ type, id }) => {
      const element = document.querySelector(`[data-component-id="${id}"]`);
      if (element) {
        const hasContent = element.textContent.trim().length > 0;
        const vueWrapper = element.querySelector(`.${type}-vue-wrapper`);
        
        console.log(`  ${hasContent ? '✅' : '❌'} ${type} (${id}): ${hasContent ? 'Has content' : 'Empty'}`);
        
        // Check for specific content
        switch(type) {
          case 'hero':
            const heroTitle = element.querySelector('.hero__title');
            if (heroTitle) {
              console.log(`      Title: "${heroTitle.textContent}"`);
            }
            break;
          case 'biography':
            const bioText = element.querySelector('.biography__text');
            if (bioText) {
              console.log(`      Text preview: "${bioText.textContent.substring(0, 50)}..."`);
            }
            break;
          case 'guest-intro':
            const guestName = element.querySelector('.guest-intro__name');
            if (guestName) {
              console.log(`      Name: "${guestName.textContent}"`);
            }
            break;
        }
      } else {
        console.log(`  ❌ ${type} (${id}): Not found in DOM`);
      }
    });
    
    // Summary
    console.log('\n=== PHASE 2 SUMMARY ===');
    const vueCount = Object.values(testResults).filter(v => v).length;
    console.log(`Vue components discovered: ${vueCount}/${vueComponents.length}`);
    console.log(`Components added: ${addedComponents.length}`);
    
    if (vueCount === vueComponents.length) {
      console.log('✅ All Vue components are working!');
      console.log('Next: Rebuild bundle with `npm run build` if you haven\'t already');
    } else {
      console.log('⚠️ Some Vue components are missing');
      console.log('1. Check that all renderer.vue.js files exist');
      console.log('2. Rebuild the bundle: npm run build');
      console.log('3. Clear browser cache and refresh');
    }
  }, 1000);
}

// Run the tests
testVueComponents();

// Helper function to clear all components
window.clearAllComponents = function() {
  const state = window.GMKB.stateManager.getState();
  Object.keys(state.components).forEach(id => {
    window.GMKB.removeComponent(id);
  });
  console.log('✅ All components cleared');
};

console.log('\n💡 TIP: Run clearAllComponents() to remove all test components');
