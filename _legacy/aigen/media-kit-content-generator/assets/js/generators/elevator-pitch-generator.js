/**
 * Elevator Pitch Generator JavaScript
 * Following unified architecture patterns
 *
 * @package Media_Kit_Content_Generator
 * @version 1.0
 */

(function() {
  'use strict';

  const ElevatorPitchGenerator = {

    fields: {
      // Authority Hook & Impact Intro components
      who: '', what: '', when: '', how: '',
      where: '', why: '',

      // Personal info
      name: '', title: '', organization: '',

      // Additional context
      value_proposition: '',
      target_audience: '',
      unique_benefit: '',
      call_to_action: '',

      // Settings
      context: 'networking',
      tone: 'professional'
    },

    pitches: {
      '30s': '',
      '60s': '',
      '2min': '',
      '5min': ''
    },

    metadata: {
      postId: 0,
      nonce: '',
      hasData: false
    },

    isGenerating: false,

    init: function() {
      console.log('🎯 Elevator Pitch Generator: Initialization starting');
      this.loadExistingData();
      this.bindEvents();
      this.updateDisplay();
      console.log('✅ Elevator Pitch Generator: Initialization completed');
    },

    loadExistingData: function() {
      if (window.MKCG_ElevatorPitch_Data) {
        this.metadata = {
          postId: window.MKCG_ElevatorPitch_Data.postId || 0,
          nonce: document.querySelector('#elevator-pitch-nonce')?.value || '',
          hasData: window.MKCG_ElevatorPitch_Data.hasData || false
        };

        if (window.MKCG_ElevatorPitch_Data.hasData && !window.MKCG_ElevatorPitch_Data.noEntryParam) {
          this.populateFromPHPData(window.MKCG_ElevatorPitch_Data);
        } else {
          this.setDefaultData();
        }
      } else {
        this.setDefaultData();
      }

      this.checkAndPopulateIfVisible();
    },

    checkAndPopulateIfVisible: function() {
      setTimeout(() => {
        const authorityBuilder = document.querySelector('#elevator-pitch-authority-hook-builder');
        if (authorityBuilder && !authorityBuilder.classList.contains('generator__builder--hidden')) {
          this.populateAuthorityHookFields();
        }

        const impactBuilder = document.querySelector('#elevator-pitch-impact-intro-builder');
        if (impactBuilder && !impactBuilder.classList.contains('generator__builder--hidden')) {
          this.populateImpactIntroFields();
        }
      }, 500);
    },

    populateFromPHPData: function(phpData) {
      if (phpData.authorityHook) {
        this.fields.who = phpData.authorityHook.who || '';
        this.fields.what = phpData.authorityHook.what || '';
        this.fields.when = phpData.authorityHook.when || '';
        this.fields.how = phpData.authorityHook.how || '';
        this.updateInputFields('authority');
      }

      if (phpData.impactIntro) {
        this.fields.where = phpData.impactIntro.where || '';
        this.fields.why = phpData.impactIntro.why || '';
        this.updateInputFields('impact');
      }

      if (phpData.personalInfo) {
        this.fields.name = phpData.personalInfo.name || '';
        this.fields.title = phpData.personalInfo.title || '';
        this.fields.organization = phpData.personalInfo.organization || '';
        this.updateInputFields('personal');
      }

      if (phpData.pitchData) {
        this.fields.context = phpData.pitchData.context || 'networking';
        this.fields.tone = phpData.pitchData.tone || 'professional';
        this.updateInputFields('settings');

        if (phpData.pitchData.pitches) {
          this.pitches = phpData.pitchData.pitches;
          this.displayPitches(this.pitches);
        }
      }
    },

    setDefaultData: function() {
      Object.keys(this.fields).forEach(key => {
        if (typeof this.fields[key] === 'string') {
          this.fields[key] = '';
        }
      });

      this.fields.context = 'networking';
      this.fields.tone = 'professional';

      this.updateInputFields('all');
      this.updateDisplay();
    },

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

    updateAuthorityHookInputs: function() {
      const mappings = [
        { field: 'who', selector: '#mkcg-who' },
        { field: 'what', selector: '#mkcg-result' },
        { field: 'when', selector: '#mkcg-when' },
        { field: 'how', selector: '#mkcg-how' }
      ];

      mappings.forEach(({ field, selector }) => {
        const input = document.querySelector(selector);
        if (input && this.fields[field]) {
          input.value = this.fields[field];
        }
      });
    },

    updateImpactIntroInputs: function() {
      const mappings = [
        { field: 'where', selector: '#mkcg-where' },
        { field: 'why', selector: '#mkcg-why' }
      ];

      mappings.forEach(({ field, selector }) => {
        const input = document.querySelector(selector);
        if (input && this.fields[field]) {
          input.value = this.fields[field];
        }
      });
    },

    updatePersonalInfoFields: function() {
      const mappings = [
        { field: 'name', selector: '#elevator-pitch-name' },
        { field: 'title', selector: '#elevator-pitch-title' },
        { field: 'organization', selector: '#elevator-pitch-organization' }
      ];

      mappings.forEach(({ field, selector }) => {
        const input = document.querySelector(selector);
        if (input && this.fields[field]) {
          input.value = this.fields[field];
        }
      });
    },

    updateContextFields: function() {
      const mappings = [
        { field: 'value_proposition', selector: '#elevator-pitch-value-proposition' },
        { field: 'target_audience', selector: '#elevator-pitch-target-audience' },
        { field: 'unique_benefit', selector: '#elevator-pitch-unique-benefit' },
        { field: 'call_to_action', selector: '#elevator-pitch-call-to-action' }
      ];

      mappings.forEach(({ field, selector }) => {
        const input = document.querySelector(selector);
        if (input && this.fields[field]) {
          input.value = this.fields[field];
        }
      });
    },

    updateSettingsFields: function() {
      const contextSelect = document.querySelector('#elevator-pitch-context');
      if (contextSelect) contextSelect.value = this.fields.context;

      const toneSelect = document.querySelector('#elevator-pitch-tone');
      if (toneSelect) toneSelect.value = this.fields.tone;
    },

    bindEvents: function() {
      const generateBtn = document.querySelector('#generate-elevator-pitches-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleGenerate();
        });
      }

      const authorityToggle = document.querySelector('#elevator-pitch-authority-hook-toggle');
      if (authorityToggle) {
        authorityToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleAuthorityHookBuilder();
        });
      }

      const impactToggle = document.querySelector('#elevator-pitch-impact-intro-toggle');
      if (impactToggle) {
        impactToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleImpactIntroBuilder();
        });
      }

      const collectAuthorityBtn = document.querySelector('#collect-elevator-pitch-authority-hook');
      if (collectAuthorityBtn) {
        collectAuthorityBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectAuthorityHookData();
        });
      }

      const collectImpactBtn = document.querySelector('#collect-elevator-pitch-impact-intro');
      if (collectImpactBtn) {
        collectImpactBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectImpactIntroData();
        });
      }

      ['#elevator-pitch-context', '#elevator-pitch-tone'].forEach(selector => {
        const input = document.querySelector(selector);
        if (input) {
          input.addEventListener('change', () => this.updateFieldsFromForm());
        }
      });
    },

    toggleAuthorityHookBuilder: function() {
      const builder = document.querySelector('#elevator-pitch-authority-hook-builder');
      const toggle = document.querySelector('#elevator-pitch-authority-hook-toggle');

      if (builder && toggle) {
        const isHidden = builder.classList.contains('generator__builder--hidden');
        if (isHidden) {
          builder.classList.remove('generator__builder--hidden');
          toggle.textContent = 'Hide Authority Hook Builder';
          setTimeout(() => this.populateAuthorityHookFields(), 100);
        } else {
          builder.classList.add('generator__builder--hidden');
          toggle.textContent = 'Show Authority Hook Builder';
        }
      }
    },

    toggleImpactIntroBuilder: function() {
      const builder = document.querySelector('#elevator-pitch-impact-intro-builder');
      const toggle = document.querySelector('#elevator-pitch-impact-intro-toggle');

      if (builder && toggle) {
        const isHidden = builder.classList.contains('generator__builder--hidden');
        if (isHidden) {
          builder.classList.remove('generator__builder--hidden');
          toggle.textContent = 'Hide Impact Intro Builder';
          setTimeout(() => this.populateImpactIntroFields(), 100);
        } else {
          builder.classList.add('generator__builder--hidden');
          toggle.textContent = 'Show Impact Intro Builder';
        }
      }
    },

    populateAuthorityHookFields: function() {
      this.updateAuthorityHookInputs();
    },

    populateImpactIntroFields: function() {
      this.updateImpactIntroInputs();
    },

    collectAuthorityHookData: function() {
      this.fields.who = document.querySelector('#mkcg-who')?.value || '';
      this.fields.what = document.querySelector('#mkcg-result')?.value || '';
      this.fields.when = document.querySelector('#mkcg-when')?.value || '';
      this.fields.how = document.querySelector('#mkcg-how')?.value || '';
      this.showNotification('Authority Hook data collected successfully!', 'success');
    },

    collectImpactIntroData: function() {
      this.fields.where = document.querySelector('#mkcg-where')?.value || '';
      this.fields.why = document.querySelector('#mkcg-why')?.value || '';
      this.showNotification('Impact Intro data collected successfully!', 'success');
    },

    updateFieldsFromForm: function() {
      this.fields.name = document.querySelector('#elevator-pitch-name')?.value || '';
      this.fields.title = document.querySelector('#elevator-pitch-title')?.value || '';
      this.fields.organization = document.querySelector('#elevator-pitch-organization')?.value || '';
      this.fields.value_proposition = document.querySelector('#elevator-pitch-value-proposition')?.value || '';
      this.fields.target_audience = document.querySelector('#elevator-pitch-target-audience')?.value || '';
      this.fields.unique_benefit = document.querySelector('#elevator-pitch-unique-benefit')?.value || '';
      this.fields.call_to_action = document.querySelector('#elevator-pitch-call-to-action')?.value || '';
      this.fields.context = document.querySelector('#elevator-pitch-context')?.value || 'networking';
      this.fields.tone = document.querySelector('#elevator-pitch-tone')?.value || 'professional';
    },

    handleGenerate: function() {
      if (this.isGenerating) return;

      this.updateFieldsFromForm();

      if (!this.fields.name) {
        this.showNotification('Please enter a name before generating elevator pitches.', 'error');
        return;
      }

      const requestData = {
        action: 'mkcg_generate_elevator_pitches',
        nonce: this.metadata.nonce,
        post_id: this.metadata.postId,
        name: this.fields.name,
        title: this.fields.title,
        organization: this.fields.organization,
        context: this.fields.context,
        tone: this.fields.tone,
        authority_hook: this.buildAuthorityHookString(),
        impact_intro: this.buildImpactIntroString(),
        value_proposition: this.fields.value_proposition,
        target_audience: this.fields.target_audience,
        unique_benefit: this.fields.unique_benefit,
        call_to_action: this.fields.call_to_action
      };

      this.setLoadingState(true);

      fetch(ajaxurl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(requestData)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.pitches = data.data.pitches || {};
          this.displayPitches(this.pitches);
          this.showNotification('Elevator pitches generated successfully!', 'success');
        } else {
          this.showNotification(data.data?.message || 'Failed to generate pitches', 'error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        this.showNotification('An error occurred while generating pitches', 'error');
      })
      .finally(() => {
        this.setLoadingState(false);
      });
    },

    buildAuthorityHookString: function() {
      const parts = [];
      if (this.fields.who) parts.push(`WHO: ${this.fields.who}`);
      if (this.fields.what) parts.push(`WHAT: ${this.fields.what}`);
      if (this.fields.when) parts.push(`WHEN: ${this.fields.when}`);
      if (this.fields.how) parts.push(`HOW: ${this.fields.how}`);
      return parts.join('\n');
    },

    buildImpactIntroString: function() {
      const parts = [];
      if (this.fields.where) parts.push(`WHERE: ${this.fields.where}`);
      if (this.fields.why) parts.push(`WHY: ${this.fields.why}`);
      return parts.join('\n');
    },

    displayPitches: function(pitches) {
      const container = document.querySelector('#elevator-pitch-results-container');
      if (!container) return;

      const lengths = {
        '30s': '30-Second Pitch',
        '60s': '60-Second Pitch',
        '2min': '2-Minute Pitch',
        '5min': '5-Minute Pitch'
      };

      container.innerHTML = '';

      Object.keys(lengths).forEach(key => {
        if (pitches[key]) {
          const pitchCard = document.createElement('div');
          pitchCard.className = 'elevator-pitch-card';

          pitchCard.innerHTML = `
            <div class="elevator-pitch-card__header">
              <h4 class="elevator-pitch-card__title">${lengths[key]}</h4>
              <span class="elevator-pitch-card__word-count">${this.countWords(pitches[key])} words</span>
            </div>
            <div class="elevator-pitch-card__body">
              <p class="elevator-pitch-card__text">${this.escapeHtml(pitches[key])}</p>
            </div>
            <div class="elevator-pitch-card__footer">
              <button class="elevator-pitch-card__copy-btn" data-pitch="${key}">Copy to Clipboard</button>
            </div>
          `;

          container.appendChild(pitchCard);
        }
      });

      // Bind copy buttons
      container.querySelectorAll('.elevator-pitch-card__copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const pitchKey = e.target.dataset.pitch;
          this.copyToClipboard(pitches[pitchKey]);
        });
      });

      // Show results section
      const resultsSection = document.querySelector('#elevator-pitch-results-section');
      if (resultsSection) {
        resultsSection.style.display = 'block';
      }
    },

    copyToClipboard: function(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showNotification('Copied to clipboard!', 'success');
      }).catch(() => {
        this.showNotification('Failed to copy to clipboard', 'error');
      });
    },

    countWords: function(text) {
      return text.trim().split(/\s+/).length;
    },

    setLoadingState: function(isLoading) {
      this.isGenerating = isLoading;
      const btn = document.querySelector('#generate-elevator-pitches-btn');
      if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Generating Pitches...' : 'Generate Elevator Pitches';
      }

      const loader = document.querySelector('#elevator-pitch-loader');
      if (loader) {
        loader.style.display = isLoading ? 'block' : 'none';
      }
    },

    showNotification: function(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `elevator-pitch-notification elevator-pitch-notification--${type}`;
      notification.textContent = message;

      let container = document.querySelector('.elevator-pitch-notifications');
      if (!container) {
        container = document.createElement('div');
        container.className = 'elevator-pitch-notifications';
        document.querySelector('.generator__container')?.prepend(container);
      }

      container.appendChild(notification);

      setTimeout(() => {
        notification.remove();
      }, 5000);
    },

    updateDisplay: function() {
      const summary = document.querySelector('#elevator-pitch-summary');
      if (summary) {
        const hasData = this.metadata.hasData || Object.values(this.pitches).some(p => p);
        summary.textContent = hasData ? 'Elevator pitches generated' : 'Ready to generate pitches';
      }
    },

    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    ElevatorPitchGenerator.init();
  });

  window.ElevatorPitchGenerator = ElevatorPitchGenerator;

})();
