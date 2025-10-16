/**
 * Component Architecture Audit Script
 * 
 * Checks all components for compliance with the new architecture:
 * 1. No scoped styles in Vue components
 * 2. Uses gmkb-component classes
 * 3. PHP templates mirror Vue structure
 * 4. Standardized prop names
 * 
 * Usage: node scripts/audit-component-architecture.js
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '..', 'components');
const AUDIT_REPORT_PATH = path.join(__dirname, '..', 'COMPONENT-AUDIT-REPORT.md');

// Architecture rules
const RULES = {
  NO_SCOPED_STYLES: 'Vue component must not have scoped styles',
  HAS_GMKB_CLASSES: 'Root element must use gmkb-component gmkb-component--{type}',
  PHP_MIRRORS_VUE: 'PHP template must mirror Vue structure',
  STANDARDIZED_PROPS: 'Must use standardized prop names (name, title, biography)',
};

class ComponentAuditor {
  constructor() {
    this.results = [];
    this.summary = {
      total: 0,
      compliant: 0,
      needsFix: 0,
      errors: 0
    };
  }

  /**
   * Main audit function
   */
  async audit() {
    console.log('🔍 Starting Component Architecture Audit...\n');
    
    const componentDirs = this.getComponentDirectories();
    
    for (const componentDir of componentDirs) {
      await this.auditComponent(componentDir);
    }
    
    this.generateReport();
    console.log(`\n✅ Audit complete! Report saved to: ${AUDIT_REPORT_PATH}`);
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
   * Audit a single component
   */
  async auditComponent(componentName) {
    console.log(`Auditing: ${componentName}...`);
    
    const componentPath = path.join(COMPONENTS_DIR, componentName);
    const result = {
      name: componentName,
      path: componentPath,
      issues: [],
      compliance: {},
      status: 'unknown'
    };

    this.summary.total++;

    try {
      // Check for Vue Renderer file
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
        result.issues.push('❌ No Vue Renderer component found');
        result.status = 'error';
        this.summary.errors++;
        this.results.push(result);
        return;
      }

      // Check for PHP template
      const phpTemplatePath = path.join(componentPath, 'template.php');
      const phpContent = fs.existsSync(phpTemplatePath) 
        ? fs.readFileSync(phpTemplatePath, 'utf-8')
        : null;

      if (!phpContent) {
        result.issues.push('❌ No PHP template found');
      }

      // Rule 1: No scoped styles
      result.compliance.noScopedStyles = this.checkNoScopedStyles(vueContent);
      if (!result.compliance.noScopedStyles) {
        result.issues.push('❌ Has scoped styles in Vue component');
      }

      // Rule 2: Has gmkb-component classes
      result.compliance.hasGmkbClasses = this.checkGmkbClasses(vueContent, componentName);
      if (!result.compliance.hasGmkbClasses) {
        result.issues.push('❌ Missing gmkb-component classes');
      }

      // Rule 3: PHP mirrors Vue (if PHP exists)
      if (phpContent) {
        result.compliance.phpMirrorsVue = this.checkPhpMirrorsVue(vueContent, phpContent, componentName);
        if (!result.compliance.phpMirrorsVue) {
          result.issues.push('⚠️ PHP template may not mirror Vue structure');
        }
      } else {
        result.compliance.phpMirrorsVue = null;
      }

      // Rule 4: Standardized props
      result.compliance.standardizedProps = this.checkStandardizedProps(vueContent);
      if (!result.compliance.standardizedProps) {
        result.issues.push('⚠️ May have non-standard prop names');
      }

      // Determine overall status
      const criticalIssues = !result.compliance.noScopedStyles || !result.compliance.hasGmkbClasses;
      const allPassing = Object.values(result.compliance).every(v => v === true || v === null);

      if (allPassing) {
        result.status = 'compliant';
        result.issues = ['✅ All checks passed'];
        this.summary.compliant++;
      } else if (criticalIssues) {
        result.status = 'needs-fix';
        this.summary.needsFix++;
      } else {
        result.status = 'warning';
        this.summary.needsFix++;
      }

    } catch (error) {
      result.status = 'error';
      result.issues.push(`❌ Error: ${error.message}`);
      this.summary.errors++;
    }

    this.results.push(result);
  }

  /**
   * Check for scoped styles
   */
  checkNoScopedStyles(vueContent) {
    return !/<style\s+scoped>/i.test(vueContent);
  }

  /**
   * Check for gmkb-component classes
   */
  checkGmkbClasses(vueContent, componentName) {
    // Check for gmkb-component class
    const hasGmkbComponent = /class="[^"]*gmkb-component[^"]*"/i.test(vueContent);
    
    // Check for gmkb-component--{type} class
    const componentType = componentName.toLowerCase().replace(/[-_]/g, '');
    const hasGmkbType = new RegExp(`gmkb-component--${componentType}`, 'i').test(vueContent);
    
    return hasGmkbComponent && hasGmkbType;
  }

  /**
   * Check if PHP mirrors Vue structure
   */
  checkPhpMirrorsVue(vueContent, phpContent, componentName) {
    // Extract class names from Vue
    const vueClasses = this.extractClassNames(vueContent);
    
    // Check if PHP has the same classes
    const hasMatchingClasses = vueClasses.every(className => {
      return phpContent.includes(className);
    });

    // Check for gmkb-component pattern
    const phpHasGmkbPattern = /class="[^"]*gmkb-component[^"]*"/i.test(phpContent);
    
    return hasMatchingClasses && phpHasGmkbPattern;
  }

  /**
   * Extract class names from template
   */
  extractClassNames(content) {
    const classPattern = /class="([^"]+)"/g;
    const classes = new Set();
    let match;
    
    while ((match = classPattern.exec(content)) !== null) {
      const classList = match[1].split(/\s+/);
      classList.forEach(cls => {
        if (cls && !cls.includes('{') && !cls.includes(':')) {
          classes.add(cls);
        }
      });
    }
    
    return Array.from(classes);
  }

  /**
   * Check for standardized prop names
   */
  checkStandardizedProps(vueContent) {
    // Extract props section
    const propsMatch = /props:\s*{([^}]+)}/s.exec(vueContent);
    if (!propsMatch) return true; // No props, pass
    
    const propsSection = propsMatch[1];
    
    // Check for non-standard prop names
    const badPatterns = [
      /speaker_name/i,
      /bio_content/i,
      /professional_title/i,
      /job_title/i,
      /guest_name/i
    ];
    
    return !badPatterns.some(pattern => pattern.test(propsSection));
  }

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Generate markdown report
   */
  generateReport() {
    let report = '# Component Architecture Audit Report\n\n';
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    // Summary
    report += '## 📊 Summary\n\n';
    report += `- **Total Components:** ${this.summary.total}\n`;
    report += `- **✅ Compliant:** ${this.summary.compliant}\n`;
    report += `- **⚠️ Needs Fix:** ${this.summary.needsFix}\n`;
    report += `- **❌ Errors:** ${this.summary.errors}\n\n`;
    
    // Compliance percentage
    const complianceRate = ((this.summary.compliant / this.summary.total) * 100).toFixed(1);
    report += `**Compliance Rate:** ${complianceRate}%\n\n`;
    
    // Priority components to fix
    report += '## 🎯 Priority Components to Fix\n\n';
    const needsFix = this.results.filter(r => r.status === 'needs-fix' || r.status === 'warning');
    
    if (needsFix.length === 0) {
      report += '✅ All components are compliant!\n\n';
    } else {
      needsFix.forEach(result => {
        report += `### ${result.name}\n\n`;
        report += `**Status:** \`${result.status}\`\n\n`;
        report += '**Issues:**\n';
        result.issues.forEach(issue => {
          report += `- ${issue}\n`;
        });
        report += '\n**Compliance Checks:**\n';
        report += `- No Scoped Styles: ${this.formatCheckResult(result.compliance.noScopedStyles)}\n`;
        report += `- Has GMKB Classes: ${this.formatCheckResult(result.compliance.hasGmkbClasses)}\n`;
        report += `- PHP Mirrors Vue: ${this.formatCheckResult(result.compliance.phpMirrorsVue)}\n`;
        report += `- Standardized Props: ${this.formatCheckResult(result.compliance.standardizedProps)}\n`;
        report += '\n---\n\n';
      });
    }
    
    // Compliant components
    report += '## ✅ Compliant Components\n\n';
    const compliant = this.results.filter(r => r.status === 'compliant');
    
    if (compliant.length === 0) {
      report += 'None yet. Start with Phase 1!\n\n';
    } else {
      compliant.forEach(result => {
        report += `- **${result.name}** - All checks passed ✅\n`;
      });
      report += '\n';
    }
    
    // Errors
    const errors = this.results.filter(r => r.status === 'error');
    if (errors.length > 0) {
      report += '## ❌ Errors\n\n';
      errors.forEach(result => {
        report += `### ${result.name}\n\n`;
        result.issues.forEach(issue => {
          report += `- ${issue}\n`;
        });
        report += '\n';
      });
    }
    
    // Next steps
    report += '## 🚀 Next Steps\n\n';
    report += '1. Fix priority components in order:\n';
    needsFix.slice(0, 5).forEach((result, index) => {
      report += `   ${index + 1}. ${result.name}\n`;
    });
    report += '\n2. For each component:\n';
    report += '   - Remove scoped styles from Vue\n';
    report += '   - Add `gmkb-component gmkb-component--{type}` classes\n';
    report += '   - Update PHP to mirror Vue structure\n';
    report += '   - Standardize prop names\n';
    report += '   - Add styles to design-system/components.css\n';
    report += '   - Test builder preview = frontend display\n\n';
    
    // Architecture reference
    report += '## 📚 Reference\n\n';
    report += '- See `docs/COMPONENT-ARCHITECTURE-STANDARD.md` for detailed guidelines\n';
    report += '- See `components/biography/` for a compliant example\n';
    report += '- See `system/ComponentDataContract.php` for prop standards\n\n';
    
    // Write report
    fs.writeFileSync(AUDIT_REPORT_PATH, report);
    
    // Console output
    console.log('\n' + '='.repeat(60));
    console.log('AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Components: ${this.summary.total}`);
    console.log(`✅ Compliant: ${this.summary.compliant}`);
    console.log(`⚠️  Needs Fix: ${this.summary.needsFix}`);
    console.log(`❌ Errors: ${this.summary.errors}`);
    console.log(`Compliance Rate: ${complianceRate}%`);
    console.log('='.repeat(60));
  }

  /**
   * Format check result for report
   */
  formatCheckResult(result) {
    if (result === true) return '✅ Pass';
    if (result === false) return '❌ Fail';
    if (result === null) return '⚠️ N/A';
    return '❓ Unknown';
  }
}

// Run the audit
const auditor = new ComponentAuditor();
auditor.audit().catch(error => {
  console.error('Audit failed:', error);
  process.exit(1);
});
