/**
 * Personal Brand Story Suite Generator JavaScript
 * @version 1.0
 */

(function() {
  'use strict';

  const BrandStoryGenerator = {
    fields: {
      who: '', what: '', when: '', how: '',
      name: '', title: '', tone: 'authentic',
      background: '', values: ''
    },

    stories: {
      origin: '', manifesto: '', mission: '', signature: ''
    },

    metadata: { postId: 0, nonce: '', hasData: false },
    isGenerating: false,

    init: function() {
      console.log('📖 Brand Story: Init');
      this.loadExistingData();
      this.bindEvents();
      this.updateDisplay();
    },

    loadExistingData: function() {
      if (window.MKCG_BrandStory_Data) {
        this.metadata = {
          postId: window.MKCG_BrandStory_Data.postId || 0,
          nonce: document.querySelector('#brand-story-nonce')?.value || '',
          hasData: window.MKCG_BrandStory_Data.hasData || false
        };

        if (window.MKCG_BrandStory_Data.hasData && !window.MKCG_BrandStory_Data.noEntryParam) {
          this.populateFromPHPData(window.MKCG_BrandStory_Data);
        }
      }
    },

    populateFromPHPData: function(data) {
      if (data.stories) {
        this.stories = {
          origin: data.stories.origin || '',
          manifesto: data.stories.manifesto || '',
          mission: data.stories.mission || '',
          signature: data.stories.signature || ''
        };

        if (this.stories.origin || this.stories.manifesto || this.stories.mission || this.stories.signature) {
          this.displayStories(this.stories);
        }
      }
    },

    bindEvents: function() {
      const generateBtn = document.querySelector('#generate-brand-stories-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleGenerate();
        });
      }

      const authorityToggle = document.querySelector('#brand-story-authority-hook-toggle');
      if (authorityToggle) {
        authorityToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleAuthorityHookBuilder();
        });
      }

      const impactToggle = document.querySelector('#brand-story-impact-intro-toggle');
      if (impactToggle) {
        impactToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleImpactIntroBuilder();
        });
      }

      const collectAuthorityBtn = document.querySelector('#collect-brand-story-authority-hook');
      if (collectAuthorityBtn) {
        collectAuthorityBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectAuthorityHookData();
        });
      }

      const collectImpactBtn = document.querySelector('#collect-brand-story-impact-intro');
      if (collectImpactBtn) {
        collectImpactBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectImpactIntroData();
        });
      }
    },

    toggleAuthorityHookBuilder: function() {
      const builder = document.querySelector('#brand-story-authority-hook-builder');
      const toggle = document.querySelector('#brand-story-authority-hook-toggle');

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

    toggleImpactIntroBuilder: function() {
      const builder = document.querySelector('#brand-story-impact-intro-builder');
      const toggle = document.querySelector('#brand-story-impact-intro-toggle');

      if (builder && toggle) {
        const isHidden = builder.classList.contains('generator__builder--hidden');
        if (isHidden) {
          builder.classList.remove('generator__builder--hidden');
          toggle.textContent = 'Hide Impact Intro Builder';
        } else {
          builder.classList.add('generator__builder--hidden');
          toggle.textContent = 'Show Impact Intro Builder';
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

    collectImpactIntroData: function() {
      const impactData = document.querySelector('#mkcg-impact-intro-result')?.value || '';
      if (impactData) {
        this.fields.background = impactData;
        this.showNotification('Impact Intro collected!', 'success');
      }
    },

    handleGenerate: function() {
      if (this.isGenerating) return;

      this.fields.name = document.querySelector('#brand-story-name')?.value || '';
      this.fields.title = document.querySelector('#brand-story-title')?.value || '';
      this.fields.tone = document.querySelector('#brand-story-tone')?.value || 'authentic';
      this.fields.background = document.querySelector('#brand-story-background')?.value || '';
      this.fields.values = document.querySelector('#brand-story-values')?.value || '';

      if (!this.fields.name) {
        this.showNotification('Please enter a name', 'error');
        return;
      }

      const requestData = {
        action: 'mkcg_generate_brand_stories',
        nonce: this.metadata.nonce,
        post_id: this.metadata.postId,
        name: this.fields.name,
        title: this.fields.title,
        tone: this.fields.tone,
        authority_hook: this.buildAuthorityHookString(),
        impact_intro: this.fields.background,
        background: this.fields.background,
        values: this.fields.values
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
          this.stories = data.data.stories || {};
          this.displayStories(this.stories);
          this.showNotification('Brand stories generated!', 'success');
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

    displayStories: function(stories) {
      const storyTypes = {
        origin: { title: 'Origin Story', container: '#origin-story-container' },
        manifesto: { title: 'Brand Manifesto', container: '#manifesto-container' },
        mission: { title: 'Mission Statement', container: '#mission-container' },
        signature: { title: 'Signature Story', container: '#signature-story-container' }
      };

      Object.keys(storyTypes).forEach(key => {
        const container = document.querySelector(storyTypes[key].container);
        if (container && stories[key]) {
          container.innerHTML = `
            <div class="brand-story-card">
              <div class="brand-story-card__header">
                <h4 class="brand-story-card__title">${storyTypes[key].title}</h4>
                <button class="brand-story-card__copy-btn" data-story="${key}">Copy</button>
              </div>
              <div class="brand-story-card__body">
                <p class="brand-story-card__text">${this.escapeHtml(stories[key])}</p>
              </div>
            </div>
          `;
        }
      });

      document.querySelectorAll('.brand-story-card__copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const storyType = e.target.dataset.story;
          this.copyToClipboard(stories[storyType]);
        });
      });

      const resultsSection = document.querySelector('#brand-stories-results-section');
      if (resultsSection) resultsSection.style.display = 'block';
    },

    copyToClipboard: function(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showNotification('Copied to clipboard!', 'success');
      }).catch(() => {
        this.showNotification('Failed to copy', 'error');
      });
    },

    setLoadingState: function(isLoading) {
      this.isGenerating = isLoading;
      const btn = document.querySelector('#generate-brand-stories-btn');
      if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Generating Stories...' : 'Generate Brand Stories';
      }

      const loader = document.querySelector('#brand-story-loader');
      if (loader) loader.style.display = isLoading ? 'block' : 'none';
    },

    showNotification: function(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `brand-story-notification brand-story-notification--${type}`;
      notification.textContent = message;

      let container = document.querySelector('.brand-story-notifications');
      if (!container) {
        container = document.createElement('div');
        container.className = 'brand-story-notifications';
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
    BrandStoryGenerator.init();
  });

  window.BrandStoryGenerator = BrandStoryGenerator;

})();
