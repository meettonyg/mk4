/**
 * Signature Framework Builder Generator JavaScript
 * @version 1.0
 */

(function() {
  'use strict';

  const FrameworkBuilderGenerator = {
    fields: {
      who: '', what: '', when: '', how: '',
      name: '', title: '', expertise_area: '',
      framework_type: 'process',
      step_count: 5
    },

    framework_names: [],
    framework_steps: [],
    selected_name: null,

    metadata: { postId: 0, nonce: '', hasData: false },
    isGenerating: false,

    init: function() {
      console.log('🎯 Framework Builder: Init');
      this.loadExistingData();
      this.bindEvents();
      this.updateDisplay();
    },

    loadExistingData: function() {
      if (window.MKCG_Framework_Data) {
        this.metadata = {
          postId: window.MKCG_Framework_Data.postId || 0,
          nonce: document.querySelector('#framework-nonce')?.value || '',
          hasData: window.MKCG_Framework_Data.hasData || false
        };

        if (window.MKCG_Framework_Data.hasData && !window.MKCG_Framework_Data.noEntryParam) {
          this.populateFromPHPData(window.MKCG_Framework_Data);
        }
      }
    },

    populateFromPHPData: function(data) {
      if (data.frameworkData) {
        this.framework_names = data.frameworkData.framework_names || [];
        this.framework_steps = data.frameworkData.framework_steps || [];
        this.selected_name = data.frameworkData.selected_name;

        if (this.framework_names.length > 0) {
          this.displayFrameworkNames(this.framework_names);
        }
        if (this.framework_steps.length > 0) {
          this.displayFrameworkSteps(this.framework_steps);
        }
      }
    },

    bindEvents: function() {
      const generateBtn = document.querySelector('#generate-framework-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleGenerate();
        });
      }

      const authorityToggle = document.querySelector('#framework-authority-hook-toggle');
      if (authorityToggle) {
        authorityToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleAuthorityHookBuilder();
        });
      }

      const collectBtn = document.querySelector('#collect-framework-authority-hook');
      if (collectBtn) {
        collectBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectAuthorityHookData();
        });
      }
    },

    toggleAuthorityHookBuilder: function() {
      const builder = document.querySelector('#framework-authority-hook-builder');
      const toggle = document.querySelector('#framework-authority-hook-toggle');

      if (builder && toggle) {
        const isHidden = builder.classList.contains('generator__builder--hidden');
        if (isHidden) {
          builder.classList.remove('generator__builder--hidden');
          toggle.textContent = 'Hide Authority Hook Builder';
        } else {
          builder.classList.add('generator__builder--hidden');
          toggle.textContent = 'Show Authority Hook Builder';
        }
      }
    },

    collectAuthorityHookData: function() {
      this.fields.who = document.querySelector('#mkcg-who')?.value || '';
      this.fields.what = document.querySelector('#mkcg-result')?.value || '';
      this.fields.when = document.querySelector('#mkcg-when')?.value || '';
      this.fields.how = document.querySelector('#mkcg-how')?.value || '';
      this.showNotification('Authority Hook collected!', 'success');
    },

    handleGenerate: function() {
      if (this.isGenerating) return;

      this.fields.name = document.querySelector('#framework-name')?.value || '';
      this.fields.title = document.querySelector('#framework-title')?.value || '';
      this.fields.expertise_area = document.querySelector('#framework-expertise-area')?.value || '';
      this.fields.framework_type = document.querySelector('#framework-type')?.value || 'process';
      this.fields.step_count = parseInt(document.querySelector('#framework-step-count')?.value || 5);

      if (!this.fields.name) {
        this.showNotification('Please enter a name', 'error');
        return;
      }

      const requestData = {
        action: 'mkcg_generate_framework',
        nonce: this.metadata.nonce,
        post_id: this.metadata.postId,
        name: this.fields.name,
        title: this.fields.title,
        framework_type: this.fields.framework_type,
        step_count: this.fields.step_count,
        authority_hook: this.buildAuthorityHookString(),
        expertise_area: this.fields.expertise_area
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
          this.framework_names = data.data.framework_names || [];
          this.framework_steps = data.data.framework_steps || [];
          this.displayFrameworkNames(this.framework_names);
          this.displayFrameworkSteps(this.framework_steps);
          this.showNotification('Framework generated!', 'success');
        } else {
          this.showNotification(data.data?.message || 'Generation failed', 'error');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        this.showNotification('An error occurred', 'error');
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

    displayFrameworkNames: function(names) {
      const container = document.querySelector('#framework-names-container');
      if (!container) return;

      container.innerHTML = '';

      names.forEach((name, index) => {
        const nameCard = document.createElement('div');
        nameCard.className = 'framework-name-card';
        nameCard.innerHTML = `
          <div class="framework-name-card__body">
            <p class="framework-name-card__text">${this.escapeHtml(name)}</p>
          </div>
          <div class="framework-name-card__footer">
            <button class="framework-name-card__select-btn" data-name="${this.escapeHtml(name)}">Select</button>
          </div>
        `;
        container.appendChild(nameCard);
      });

      container.querySelectorAll('.framework-name-card__select-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.selectFrameworkName(e.target.dataset.name);
        });
      });

      const resultsSection = document.querySelector('#framework-results-section');
      if (resultsSection) resultsSection.style.display = 'block';
    },

    displayFrameworkSteps: function(steps) {
      const container = document.querySelector('#framework-steps-container');
      if (!container) return;

      container.innerHTML = '';

      steps.forEach(step => {
        const stepCard = document.createElement('div');
        stepCard.className = 'framework-step-card';
        stepCard.innerHTML = `
          <div class="framework-step-card__header">
            <span class="framework-step-card__number">Step ${step.number}</span>
            <h4 class="framework-step-card__title">${this.escapeHtml(step.name)}</h4>
          </div>
          <div class="framework-step-card__body">
            <p>${this.escapeHtml(step.description)}</p>
          </div>
        `;
        container.appendChild(stepCard);
      });
    },

    selectFrameworkName: function(name) {
      this.selected_name = name;

      const requestData = {
        action: 'mkcg_save_framework_selection',
        nonce: this.metadata.nonce,
        post_id: this.metadata.postId,
        framework_name: name
      };

      fetch(ajaxurl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(requestData)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          this.showNotification('Framework name selected!', 'success');

          document.querySelectorAll('.framework-name-card').forEach(card => {
            card.classList.remove('framework-name-card--selected');
          });

          event.target.closest('.framework-name-card').classList.add('framework-name-card--selected');
        }
      });
    },

    setLoadingState: function(isLoading) {
      this.isGenerating = isLoading;
      const btn = document.querySelector('#generate-framework-btn');
      if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Generating...' : 'Generate Framework';
      }

      const loader = document.querySelector('#framework-loader');
      if (loader) loader.style.display = isLoading ? 'block' : 'none';
    },

    showNotification: function(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `framework-notification framework-notification--${type}`;
      notification.textContent = message;

      let container = document.querySelector('.framework-notifications');
      if (!container) {
        container = document.createElement('div');
        container.className = 'framework-notifications';
        document.querySelector('.generator__container')?.prepend(container);
      }

      container.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);
    },

    updateDisplay: function() {
      // Update summary if needed
    },

    escapeHtml: function(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    FrameworkBuilderGenerator.init();
  });

  window.FrameworkBuilderGenerator = FrameworkBuilderGenerator;

})();
