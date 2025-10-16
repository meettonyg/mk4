/**
 * Component Architecture Validation Script
 * 
 * Tests all Vue components and PHP templates for architecture compliance
 * 
 * Usage: node scripts/validate-architecture.js
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '..', 'components');

class ArchitectureValidator {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0,
      components: []
    };
  }

  /**
   * Main validation function
   */
  async validate() {
    console.log('🧪 COMPONENT ARCHITECTURE VALIDATION');
    console.log('='.repeat(80));
    console.log('');

    const componentDirs = this.getComponentDirectories();
    
    for (const componentDir of componentDirs) {
      await this.validateComponent(componentDir);
    }
    
    this.printSummary();
    
    // Exit with error code if tests failed
    process.exit(this.results.failed > 0 ? 1 : 0);
  }

  /**
   * Get all component directories
   */
  getComponentDirectories() {
    return fs.readdirSync(COMPONENTS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => !name.startsWith('.') && !name.startsWith('_'));
  }

  /**
   * Validate a single component
   */
  async validateComponent(componentName) {
    console.log(`\n📦 Testing: ${componentName}`);
    console.log('-'.repeat(80));
    
    const componentPath = path.join(COMPONENTS_DIR, componentName);
    const result = {
      name: componentName,
      tests: [],
      passed: 0,
      failed: 0,
      warnings: 0
    };

    // Find Vue Renderer file
    const vueFiles = ['Renderer.vue', `${this.capitalize(componentName)}Renderer.vue`];
    let vueContent = null;
    let vueFilePath = null;

    for (const vueFile of vueFiles) {
      const testPath = path.join(componentPath, vueFile);
      if (fs.existsSync(testPath)) {
        vueContent = fs.readFileSync(testPath, 'utf-8');
        vueFilePath = vueFile;
        break;
      }
    }

    if (!vueContent) {
      result.tests.push({ name: 'Vue file exists', status: 'failed', message: 'No Renderer.vue found' });
      result.failed++;
      this.results.total++;
      this.results.failed++;
      this.results.components.push(result);
      console.log('  ❌ No Vue Renderer component found');
      return;
    }

    console.log(`  Found: ${vueFilePath}`);

    // Test 1: No scoped styles
    this.results.total++;
    if (this.testNoScopedStyles(vueContent)) {
      result.tests.push({ name: 'No scoped styles', status: 'passed' });
      result.passed++;
      this.results.passed++;
      console.log('  ✅ No scoped styles');
    } else {
      result.tests.push({ name: 'No scoped styles', status: 'failed', message: 'Found <style scoped>' });
      result.failed++;
      this.results.failed++;
      console.log('  ❌ Has scoped styles');
    }

    // Test 2: Has gmkb-component classes
    this.results.total++;
    if (this.testHasGmkbClasses(vueContent, componentName)) {
      result.tests.push({ name: 'Has gmkb-component classes', status: 'passed' });
      result.passed++;
      this.results.passed++;
      console.log('  ✅ Has gmkb-component classes');
    } else {
      result.tests.push({ name: 'Has gmkb-component classes', status: 'failed', message: 'Missing gmkb-component pattern' });
      result.failed++;
      this.results.failed++;
      console.log('  ❌ Missing gmkb-component classes');
    }

    // Test 3: Direct props (no nested data)
    this.results.total++;
    if (this.testDirectProps(vueContent)) {
      result.tests.push({ name: 'Uses direct props', status: 'passed' });
      result.passed++;
      this.results.passed++;
      console.log('  ✅ Uses direct props');
    } else {
      result.tests.push({ name: 'Uses direct props', status: 'warning', message: 'May have nested data prop' });
      result.warnings++;
      this.results.warnings++;
      console.log('  ⚠️  May have nested data prop');
    }

    // Test 4: PHP template exists
    const phpTemplatePath = path.join(componentPath, 'template.php');
    this.results.total++;
    if (fs.existsSync(phpTemplatePath)) {
      result.tests.push({ name: 'PHP template exists', status: 'passed' });
      result.passed++;
      this.results.passed++;
      console.log('  ✅ PHP template exists');

      const phpContent = fs.readFileSync(phpTemplatePath, 'utf-8');

      // Test 5: PHP has gmkb-component classes
      this.results.total++;
      if (this.testPHPHasGmkbClasses(phpContent, componentName)) {
        result.tests.push({ name: 'PHP has gmkb-component classes', status: 'passed' });
        result.passed++;
        this.results.passed++;
        console.log('  ✅ PHP has gmkb-component classes');
      } else {
        result.tests.push({ name: 'PHP has gmkb-component classes', status: 'failed', message: 'Missing gmkb-component in PHP' });
        result.failed++;
        this.results.failed++;
        console.log('  ❌ PHP missing gmkb-component classes');
      }

      // Test 6: PHP has no inline styles
      this.results.total++;
      if (this.testNoInlineStyles(phpContent)) {
        result.tests.push({ name: 'No inline styles in PHP', status: 'passed' });
        result.passed++;
        this.results.passed++;
        console.log('  ✅ No inline styles in PHP');
      } else {
        result.tests.push({ name: 'No inline styles in PHP', status: 'warning', message: 'Found style attributes' });
        result.warnings++;
        this.results.warnings++;
        console.log('  ⚠️  Has inline styles in PHP');
      }
    } else {
      result.tests.push({ name: 'PHP template exists', status: 'failed', message: 'template.php not found' });
      result.failed++;
      this.results.failed++;
      console.log('  ❌ PHP template not found');
    }

    this.results.components.push(result);
  }

  /**
   * Test: No scoped styles
   */
  testNoScopedStyles(vueContent) {
    return !/<style\s+scoped>/i.test(vueContent);
  }

  /**
   * Test: Has gmkb-component classes
   */
  testHasGmkbClasses(vueContent, componentName) {
    const hasGmkbComponent = /class="[^"]*gmkb-component[^"]*"/i.test(vueContent);
    const componentType = componentName.toLowerCase().replace(/[-_]/g, '');
    const hasGmkbType = new RegExp(`gmkb-component--${componentType}`, 'i').test(vueContent);
    return hasGmkbComponent && hasGmkbType;
  }

  /**
   * Test: Uses direct props
   */
  testDirectProps(vueContent) {
    const propsMatch = /props:\s*{([^}]+)}/s.exec(vueContent);
    if (!propsMatch) return true; // No props, pass
    
    const propsSection = propsMatch[1];
    // Check if there's a 'data' prop with Object type
    return !/data:\s*{[^}]*type:\s*Object/i.test(propsSection);
  }

  /**
   * Test: PHP has gmkb-component classes
   */
  testPHPHasGmkbClasses(phpContent, componentName) {
    const hasGmkbComponent = /class="[^"]*gmkb-component[^"]*"/i.test(phpContent);
    const componentType = componentName.toLowerCase().replace(/[-_]/g, '');
    const hasGmkbType = new RegExp(`gmkb-component--${componentType}`, 'i').test(phpContent);
    return hasGmkbComponent && hasGmkbType;
  }

  /**
   * Test: No inline styles
   */
  testNoInlineStyles(phpContent) {
    // Allow visibility: hidden for testing, but flag other inline styles
    const styleMatches = phpContent.match(/style="[^"]*"/gi) || [];
    return styleMatches.every(style => /visibility:\s*hidden/i.test(style));
  }

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Print summary
   */
  printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(80));
    
    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    
    console.log(`
Total Tests:    ${this.results.total}
✅ Passed:      ${this.results.passed}
❌ Failed:      ${this.results.failed}
⚠️  Warnings:   ${this.results.warnings}
Pass Rate:      ${passRate}%
    `);

    // Show components with failures
    const failedComponents = this.results.components.filter(c => c.failed > 0);
    if (failedComponents.length > 0) {
      console.log('\n❌ Components with failures:');
      failedComponents.forEach(component => {
        console.log(`  - ${component.name} (${component.failed} failed tests)`);
        component.tests.filter(t => t.status === 'failed').forEach(test => {
          console.log(`    ❌ ${test.name}: ${test.message || 'Failed'}`);
        });
      });
    }

    if (this.results.failed === 0) {
      console.log('\n🎉 ALL VALIDATION TESTS PASSED!');
      console.log('Component architecture is correctly implemented.');
    } else {
      console.log('\n⚠️  VALIDATION FAILED');
      console.log('Please fix the issues above before deploying.');
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// Run validation
const validator = new ArchitectureValidator();
validator.validate().catch(error => {
  console.error('Validation error:', error);
  process.exit(1);
});
