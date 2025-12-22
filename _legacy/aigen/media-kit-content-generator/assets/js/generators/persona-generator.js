/**
 * Persona Generator JavaScript - Unified Architecture Implementation
 * Following Topics, Biography, and Tagline Generator patterns with multi-option generation
 *
 * Architecture: Vanilla JS, unified service integration, BEM methodology
 * Features: Multi-option AI generation, selection interface, service integration
 *
 * @package Media_Kit_Content_Generator
 * @version 1.0
 */

(function() {
  'use strict';

  /**
   * Persona Generator - Following established generator architecture
   * 3-step initialization: load data, bind events, update display
   */
  const PersonaGenerator = {

    // Essential data storage
    fields: {
      // Authority Hook components
      who: '',
      what: '',
      when: '',
      how: '',

      // Impact Intro components
      where: '',
      why: '',

      // Personal information
      name: '',
      title: '',
      organization: '',

      // Additional context fields
      industry: '',
      uniqueFactors: '',
      additionalNotes: '',

      // Persona settings
      style: 'strategic',
      focus: 'expertise',
      depth: 'comprehensive'
    },

    // Generated personas storage
    personas: [],
    selectedPersona: null,

    // Form metadata
    metadata: {
      postId: 0,
      nonce: '',
      hasData: false
    },

    // UI state
    isGenerating: false,

    /**
     * Initialize Persona Generator - Following unified pattern
     */
    init: function() {
      console.log('🎯 Persona Generator: Initialization starting');

      // Step 1: Load existing data
      this.loadExistingData();

      // Step 2: Bind form events
      this.bindEvents();

      // Step 3: Update display
      this.updateDisplay();

      console.log('✅ Persona Generator: Initialization completed');
    },

    /**
     * Load data from PHP or defaults
     */
    loadExistingData: function() {
      // Check if PHP passed data
      if (window.MKCG_Persona_Data) {
        // Load metadata
        this.metadata = {
          postId: window.MKCG_Persona_Data.postId || 0,
          nonce: document.querySelector('#persona-nonce')?.value || '',
          hasData: window.MKCG_Persona_Data.hasData || false
        };

        // Check if we're in non-entry mode
        if (window.MKCG_Persona_Data.noEntryParam) {
          console.log('📝 No entry parameter - using empty data');
          this.setDefaultData();
        } else if (window.MKCG_Persona_Data.hasData) {
          console.log('📝 Loading data from PHP:', window.MKCG_Persona_Data);
          this.populateFromPHPData(window.MKCG_Persona_Data);
        } else {
          console.log('📝 No data found but entry param exists - using empty data');
          this.setDefaultData();
        }
      } else {
        console.log('📝 MKCG_Persona_Data not available - using empty data');
        this.setDefaultData();
      }

      // Try to populate service fields if builders are already visible
      this.checkAndPopulateIfVisible();
    },

    /**
     * Check if service builders are visible and populate if needed
     */
    checkAndPopulateIfVisible: function() {
      setTimeout(() => {
        // Check Authority Hook Builder
        const authorityBuilder = document.querySelector('#persona-generator-authority-hook-builder');
        if (authorityBuilder && !authorityBuilder.classList.contains('generator__builder--hidden')) {
          console.log('🔧 Authority Hook Builder already visible, attempting population...');
          this.populateAuthorityHookFields();
        }

        // Check Impact Intro Builder
        const impactBuilder = document.querySelector('#persona-generator-impact-intro-builder');
        if (impactBuilder && !impactBuilder.classList.contains('generator__builder--hidden')) {
          console.log('🔧 Impact Intro Builder already visible, attempting population...');
          this.populateImpactIntroFields();
        }
      }, 500);
    },

    /**
     * Populate from PHP data
     */
    populateFromPHPData: function(phpData) {
      // Load Authority Hook data
      if (phpData.authorityHook) {
        this.fields.who = phpData.authorityHook.who || '';
        this.fields.what = phpData.authorityHook.what || '';
        this.fields.when = phpData.authorityHook.when || '';
        this.fields.how = phpData.authorityHook.how || '';

        console.log('📝 Stored authority hook data:', this.fields);
        this.updateInputFields('authority');
      }

      // Load Impact Intro data
      if (phpData.impactIntro) {
        this.fields.where = phpData.impactIntro.where || '';
        this.fields.why = phpData.impactIntro.why || '';

        console.log('📝 Stored impact intro data:', this.fields);
        this.updateInputFields('impact');
      }

      // Load personal information
      if (phpData.personalInfo) {
        this.fields.name = phpData.personalInfo.name || '';
        this.fields.title = phpData.personalInfo.title || '';
        this.fields.organization = phpData.personalInfo.organization || '';

        this.updateInputFields('personal');
      }

      // Load additional context
      if (phpData.additionalContext) {
        this.fields.industry = phpData.additionalContext.industry || '';
        this.fields.uniqueFactors = phpData.additionalContext.uniqueFactors || '';
        this.fields.additionalNotes = phpData.additionalContext.additionalNotes || '';

        this.updateInputFields('context');
      }

      // Load persona settings
      if (phpData.personaData) {
        this.fields.style = phpData.personaData.style || 'strategic';
        this.fields.focus = phpData.personaData.focus || 'expertise';
        this.fields.depth = phpData.personaData.depth || 'comprehensive';

        this.updateInputFields('settings');

        // Load existing generated personas if available
        if (phpData.personaData.generatedPersonas && phpData.personaData.generatedPersonas.length > 0) {
          this.personas = phpData.personaData.generatedPersonas;
          this.displayPersonaOptions(this.personas);
        }

        // Load selected persona if available
        if (phpData.personaData.selectedPersona) {
          this.selectedPersona = phpData.personaData.selectedPersona;
          this.displaySelectedPersona(this.selectedPersona);
        }
      }
    },

    /**
     * Set default data - empty values when no entry param
     */
    setDefaultData: function() {
      // All fields default to empty
      Object.keys(this.fields).forEach(key => {
        if (typeof this.fields[key] === 'string') {
          this.fields[key] = '';
        }
      });

      // Set default values for selection fields
      this.fields.style = 'strategic';
      this.fields.focus = 'expertise';
      this.fields.depth = 'comprehensive';

      this.updateInputFields('all');
      this.updateDisplay();
    },

    /**
     * Update input fields for specific service or all
     */
    updateInputFields: function(serviceType = 'all') {
      if (serviceType === 'authority' || serviceType === 'all') {
        this.updateAuthorityHookInputs();
      }

      if (serviceType === 'impact' || serviceType === 'all') {
        this.updateImpactIntroInputs();
      }

      if (serviceType === 'personal' || serviceType === 'all') {
        this.updatePersonalInfoFields();
      }

      if (serviceType === 'context' || serviceType === 'all') {
        this.updateContextFields();
      }

      if (serviceType === 'settings' || serviceType === 'all') {
        this.updateSettingsFields();
      }
    },

    /**
     * Update Authority Hook input fields
     */
    updateAuthorityHookInputs: function() {
      const fieldMappings = [
        { field: 'who', selector: '#mkcg-who' },
        { field: 'what', selector: '#mkcg-result' },
        { field: 'when', selector: '#mkcg-when' },
        { field: 'how', selector: '#mkcg-how' }
      ];

      let fieldsFound = 0;
      let fieldsUpdated = 0;

      fieldMappings.forEach(({ field, selector }) => {
        const input = document.querySelector(selector);
        if (input) {
          fieldsFound++;
          if (this.fields[field]) {
            input.value = this.fields[field];
            fieldsUpdated++;
            console.log(`✅ Updated ${selector} with: "${this.fields[field]}"`);
          }
        }
      });

      console.log(`🔄 Authority Hook fields: Found ${fieldsFound}/4, Updated ${fieldsUpdated}`);
    },

    /**
     * Update Impact Intro input fields
     */
    updateImpactIntroInputs: function() {
      const fieldMappings = [
        { field: 'where', selector: '#mkcg-where' },
        { field: 'why', selector: '#mkcg-why' }
      ];

      let fieldsFound = 0;
      let fieldsUpdated = 0;

      fieldMappings.forEach(({ field, selector }) => {
        const input = document.querySelector(selector);
        if (input) {
          fieldsFound++;
          if (this.fields[field]) {
            input.value = this.fields[field];
            fieldsUpdated++;
            console.log(`✅ Updated ${selector} with: "${this.fields[field]}"`);
          }
        }
      });

      console.log(`🔄 Impact Intro fields: Found ${fieldsFound}/2, Updated ${fieldsUpdated}`);
    },

    /**
     * Update personal information fields
     */
    updatePersonalInfoFields: function() {
      const fieldMappings = [
        { field: 'name', selector: '#persona-name' },
        { field: 'title', selector: '#persona-title' },
        { field: 'organization', selector: '#persona-organization' }
      ];

      fieldMappings.forEach(({ field, selector }) => {
        const input = document.querySelector(selector);
        if (input && this.fields[field] !== '') {
          input.value = this.fields[field];
          console.log(`✅ Updated ${selector} with: "${this.fields[field]}"`);
        }
      });
    },

    /**
     * Update additional context fields
     */
    updateContextFields: function() {
      const fieldMappings = [
        { field: 'industry', selector: '#persona-industry' },
        { field: 'uniqueFactors', selector: '#persona-unique-factors' },
        { field: 'additionalNotes', selector: '#persona-additional-notes' }
      ];

      fieldMappings.forEach(({ field, selector }) => {
        const input = document.querySelector(selector);
        if (input && this.fields[field] !== '') {
          input.value = this.fields[field];
          console.log(`✅ Updated ${selector} with: "${this.fields[field]}"`);
        }
      });
    },

    /**
     * Update persona settings fields
     */
    updateSettingsFields: function() {
      const fieldMappings = [
        { field: 'style', selector: '#persona-style' },
        { field: 'focus', selector: '#persona-focus' },
        { field: 'depth', selector: '#persona-depth' }
      ];

      fieldMappings.forEach(({ field, selector }) => {
        const input = document.querySelector(selector);
        if (input) {
          input.value = this.fields[field];
          console.log(`✅ Updated ${selector} with: "${this.fields[field]}"`);
        }
      });
    },

    /**
     * Bind all event listeners
     */
    bindEvents: function() {
      console.log('🔗 Binding events...');

      // Generate personas button
      const generateBtn = document.querySelector('#generate-personas-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleGenerate();
        });
        console.log('✅ Generate button bound');
      }

      // Authority Hook Builder toggle
      const authorityToggle = document.querySelector('#persona-authority-hook-toggle');
      if (authorityToggle) {
        authorityToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleAuthorityHookBuilder();
        });
      }

      // Impact Intro Builder toggle
      const impactToggle = document.querySelector('#persona-impact-intro-toggle');
      if (impactToggle) {
        impactToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleImpactIntroBuilder();
        });
      }

      // Collect Authority Hook data button
      const collectAuthorityBtn = document.querySelector('#collect-persona-authority-hook');
      if (collectAuthorityBtn) {
        collectAuthorityBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectAuthorityHookData();
        });
      }

      // Collect Impact Intro data button
      const collectImpactBtn = document.querySelector('#collect-persona-impact-intro');
      if (collectImpactBtn) {
        collectImpactBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectImpactIntroData();
        });
      }

      // Settings change listeners
      ['#persona-style', '#persona-focus', '#persona-depth'].forEach(selector => {
        const input = document.querySelector(selector);
        if (input) {
          input.addEventListener('change', () => {
            this.updateFieldsFromForm();
          });
        }
      });

      // Personal info change listeners
      ['#persona-name', '#persona-title', '#persona-organization'].forEach(selector => {
        const input = document.querySelector(selector);
        if (input) {
          input.addEventListener('blur', () => {
            this.updateFieldsFromForm();
          });
        }
      });

      console.log('✅ Events bound successfully');
    },

    /**
     * Toggle Authority Hook Builder
     */
    toggleAuthorityHookBuilder: function() {
      const builder = document.querySelector('#persona-generator-authority-hook-builder');
      const toggle = document.querySelector('#persona-authority-hook-toggle');

      if (builder && toggle) {
        const isHidden = builder.classList.contains('generator__builder--hidden');

        if (isHidden) {
          builder.classList.remove('generator__builder--hidden');
          toggle.textContent = 'Hide Authority Hook Builder';
          console.log('👁️ Authority Hook Builder shown');

          // Populate fields when showing
          setTimeout(() => this.populateAuthorityHookFields(), 100);
        } else {
          builder.classList.add('generator__builder--hidden');
          toggle.textContent = 'Show Authority Hook Builder';
          console.log('🙈 Authority Hook Builder hidden');
        }
      }
    },

    /**
     * Toggle Impact Intro Builder
     */
    toggleImpactIntroBuilder: function() {
      const builder = document.querySelector('#persona-generator-impact-intro-builder');
      const toggle = document.querySelector('#persona-impact-intro-toggle');

      if (builder && toggle) {
        const isHidden = builder.classList.contains('generator__builder--hidden');

        if (isHidden) {
          builder.classList.remove('generator__builder--hidden');
          toggle.textContent = 'Hide Impact Intro Builder';
          console.log('👁️ Impact Intro Builder shown');

          // Populate fields when showing
          setTimeout(() => this.populateImpactIntroFields(), 100);
        } else {
          builder.classList.add('generator__builder--hidden');
          toggle.textContent = 'Show Impact Intro Builder';
          console.log('🙈 Impact Intro Builder hidden');
        }
      }
    },

    /**
     * Populate Authority Hook fields
     */
    populateAuthorityHookFields: function() {
      console.log('🔄 Populating Authority Hook fields...');
      this.updateAuthorityHookInputs();
    },

    /**
     * Populate Impact Intro fields
     */
    populateImpactIntroFields: function() {
      console.log('🔄 Populating Impact Intro fields...');
      this.updateImpactIntroInputs();
    },

    /**
     * Collect Authority Hook data
     */
    collectAuthorityHookData: function() {
      console.log('📥 Collecting Authority Hook data...');

      this.fields.who = document.querySelector('#mkcg-who')?.value || '';
      this.fields.what = document.querySelector('#mkcg-result')?.value || '';
      this.fields.when = document.querySelector('#mkcg-when')?.value || '';
      this.fields.how = document.querySelector('#mkcg-how')?.value || '';

      console.log('✅ Authority Hook data collected:', {
        who: this.fields.who,
        what: this.fields.what,
        when: this.fields.when,
        how: this.fields.how
      });

      this.showNotification('Authority Hook data collected successfully!', 'success');
    },

    /**
     * Collect Impact Intro data
     */
    collectImpactIntroData: function() {
      console.log('📥 Collecting Impact Intro data...');

      this.fields.where = document.querySelector('#mkcg-where')?.value || '';
      this.fields.why = document.querySelector('#mkcg-why')?.value || '';

      console.log('✅ Impact Intro data collected:', {
        where: this.fields.where,
        why: this.fields.why
      });

      this.showNotification('Impact Intro data collected successfully!', 'success');
    },

    /**
     * Update fields from form
     */
    updateFieldsFromForm: function() {
      // Personal info
      this.fields.name = document.querySelector('#persona-name')?.value || '';
      this.fields.title = document.querySelector('#persona-title')?.value || '';
      this.fields.organization = document.querySelector('#persona-organization')?.value || '';

      // Context
      this.fields.industry = document.querySelector('#persona-industry')?.value || '';
      this.fields.uniqueFactors = document.querySelector('#persona-unique-factors')?.value || '';
      this.fields.additionalNotes = document.querySelector('#persona-additional-notes')?.value || '';

      // Settings
      this.fields.style = document.querySelector('#persona-style')?.value || 'strategic';
      this.fields.focus = document.querySelector('#persona-focus')?.value || 'expertise';
      this.fields.depth = document.querySelector('#persona-depth')?.value || 'comprehensive';

      console.log('🔄 Fields updated from form:', this.fields);
    },

    /**
     * Handle generate personas
     */
    handleGenerate: function() {
      if (this.isGenerating) {
        console.log('⏳ Generation already in progress');
        return;
      }

      console.log('🚀 Generate personas triggered');

      // Update fields from form
      this.updateFieldsFromForm();

      // Validate required fields
      if (!this.fields.name) {
        this.showNotification('Please enter a name before generating personas.', 'error');
        return;
      }

      // Prepare data for API
      const requestData = {
        action: 'mkcg_generate_personas',
        nonce: this.metadata.nonce,
        post_id: this.metadata.postId,
        name: this.fields.name,
        title: this.fields.title,
        organization: this.fields.organization,
        style: this.fields.style,
        focus: this.fields.focus,
        depth: this.fields.depth,
        authority_hook: this.buildAuthorityHookString(),
        impact_intro: this.buildImpactIntroString(),
        industry: this.fields.industry,
        unique_factors: this.fields.uniqueFactors,
        additional_notes: this.fields.additionalNotes
      };

      console.log('📤 Sending request:', requestData);

      // Show loading state
      this.setLoadingState(true);

      // Make AJAX request
      fetch(ajaxurl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestData)
      })
      .then(response => response.json())
      .then(data => {
        console.log('📥 Response received:', data);

        if (data.success) {
          this.personas = data.data.personas || [];
          this.displayPersonaOptions(this.personas);
          this.showNotification('Personas generated successfully!', 'success');
        } else {
          this.showNotification(data.data?.message || 'Failed to generate personas', 'error');
        }
      })
      .catch(error => {
        console.error('❌ Error:', error);
        this.showNotification('An error occurred while generating personas', 'error');
      })
      .finally(() => {
        this.setLoadingState(false);
      });
    },

    /**
     * Build Authority Hook string
     */
    buildAuthorityHookString: function() {
      const parts = [];
      if (this.fields.who) parts.push(`WHO: ${this.fields.who}`);
      if (this.fields.what) parts.push(`WHAT: ${this.fields.what}`);
      if (this.fields.when) parts.push(`WHEN: ${this.fields.when}`);
      if (this.fields.how) parts.push(`HOW: ${this.fields.how}`);
      return parts.join('\n');
    },

    /**
     * Build Impact Intro string
     */
    buildImpactIntroString: function() {
      const parts = [];
      if (this.fields.where) parts.push(`WHERE: ${this.fields.where}`);
      if (this.fields.why) parts.push(`WHY: ${this.fields.why}`);
      return parts.join('\n');
    },

    /**
     * Display persona options
     */
    displayPersonaOptions: function(personas) {
      const container = document.querySelector('#persona-options-container');
      if (!container) {
        console.error('❌ Persona options container not found');
        return;
      }

      container.innerHTML = '';

      personas.forEach((persona, index) => {
        const personaCard = document.createElement('div');
        personaCard.className = 'persona-option';
        personaCard.dataset.personaId = persona.id;

        personaCard.innerHTML = `
          <div class="persona-option__header">
            <h4 class="persona-option__title">${this.escapeHtml(persona.title)}</h4>
          </div>
          <div class="persona-option__body">
            <p class="persona-option__description">${this.escapeHtml(persona.description)}</p>
          </div>
          <div class="persona-option__footer">
            <button class="persona-option__select-btn" data-persona-id="${persona.id}">
              Select This Persona
            </button>
          </div>
        `;

        container.appendChild(personaCard);
      });

      // Bind click events to select buttons
      container.querySelectorAll('.persona-option__select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const personaId = e.target.dataset.personaId;
          this.selectPersona(personaId);
        });
      });

      // Show the results section
      const resultsSection = document.querySelector('#persona-results-section');
      if (resultsSection) {
        resultsSection.style.display = 'block';
      }

      console.log(`✅ Displayed ${personas.length} persona options`);
    },

    /**
     * Select persona
     */
    selectPersona: function(personaId) {
      const persona = this.personas.find(p => p.id === personaId);
      if (!persona) {
        console.error('❌ Persona not found:', personaId);
        return;
      }

      this.selectedPersona = persona;

      // Save to backend
      this.saveSelectedPersona(personaId);

      // Update UI
      this.displaySelectedPersona(persona);

      // Visual feedback
      document.querySelectorAll('.persona-option').forEach(card => {
        card.classList.remove('persona-option--selected');
      });
      document.querySelector(`[data-persona-id="${personaId}"]`)?.classList.add('persona-option--selected');

      console.log('✅ Persona selected:', persona);
    },

    /**
     * Display selected persona
     */
    displaySelectedPersona: function(persona) {
      const container = document.querySelector('#selected-persona-display');
      if (!container) return;

      container.innerHTML = `
        <div class="selected-persona">
          <div class="selected-persona__badge">Selected</div>
          <h3 class="selected-persona__title">${this.escapeHtml(persona.title)}</h3>
          <p class="selected-persona__description">${this.escapeHtml(persona.description)}</p>
        </div>
      `;

      container.style.display = 'block';
    },

    /**
     * Save selected persona
     */
    saveSelectedPersona: function(personaId) {
      const requestData = {
        action: 'mkcg_save_persona',
        nonce: this.metadata.nonce,
        post_id: this.metadata.postId,
        persona_id: personaId
      };

      fetch(ajaxurl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestData)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.showNotification('Persona saved successfully!', 'success');
        } else {
          this.showNotification('Failed to save persona', 'error');
        }
      })
      .catch(error => {
        console.error('❌ Error saving persona:', error);
      });
    },

    /**
     * Set loading state
     */
    setLoadingState: function(isLoading) {
      this.isGenerating = isLoading;

      const btn = document.querySelector('#generate-personas-btn');
      if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Generating Personas...' : 'Generate Personas';
      }

      const loader = document.querySelector('#persona-loader');
      if (loader) {
        loader.style.display = isLoading ? 'block' : 'none';
      }
    },

    /**
     * Show notification
     */
    showNotification: function(message, type = 'info') {
      console.log(`📢 ${type.toUpperCase()}: ${message}`);

      // Create notification element
      const notification = document.createElement('div');
      notification.className = `persona-notification persona-notification--${type}`;
      notification.textContent = message;

      // Find container or create one
      let container = document.querySelector('.persona-notifications');
      if (!container) {
        container = document.createElement('div');
        container.className = 'persona-notifications';
        document.querySelector('.generator__container')?.prepend(container);
      }

      container.appendChild(notification);

      // Remove after 5 seconds
      setTimeout(() => {
        notification.remove();
      }, 5000);
    },

    /**
     * Update display
     */
    updateDisplay: function() {
      console.log('🎨 Updating display...');

      // Update any summary displays
      this.updateSummary();
    },

    /**
     * Update summary
     */
    updateSummary: function() {
      const summary = document.querySelector('#persona-summary');
      if (summary) {
        const hasData = this.metadata.hasData || this.personas.length > 0;
        summary.textContent = hasData ? `${this.personas.length} persona(s) generated` : 'No personas generated yet';
      }
    },

    /**
     * Escape HTML for safe display
     */
    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    PersonaGenerator.init();
  });

  // Expose for debugging
  window.PersonaGenerator = PersonaGenerator;

})();
