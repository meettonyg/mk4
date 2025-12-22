/**
 * Essential Business Stories Suite Generator JavaScript
 * @version 1.0
 */

(function() {
  'use strict';

  const BusinessStoriesGenerator = {
    fields: {
      name: '', title: '', industry: '', target_customer: '',
      tone: 'professional', origin_story: '', competitor_context: '',
      customer_results: '', unique_approach: ''
    },

    stories: {
      purpose: '', positioning: '', transformation: '', contrarian: ''
    },

    metadata: { postId: 0, nonce: '', hasData: false },
    isGenerating: false,

    init: function() {
      console.log('💼 Business Stories: Init');
      this.loadExistingData();
      this.bindEvents();
      this.updateDisplay();
    },

    loadExistingData: function() {
      if (window.MKCG_BusinessStories_Data) {
        this.metadata = {
          postId: window.MKCG_BusinessStories_Data.postId || 0,
          nonce: document.querySelector('#business-stories-nonce')?.value || '',
          hasData: window.MKCG_BusinessStories_Data.hasData || false
        };

        if (window.MKCG_BusinessStories_Data.hasData && !window.MKCG_BusinessStories_Data.noEntryParam) {
          this.populateFromPHPData(window.MKCG_BusinessStories_Data);
        }
      }
    },

    populateFromPHPData: function(data) {
      if (data.stories) {
        this.stories = {
          purpose: data.stories.purpose || '',
          positioning: data.stories.positioning || '',
          transformation: data.stories.transformation || '',
          contrarian: data.stories.contrarian || ''
        };

        if (this.stories.purpose || this.stories.positioning || this.stories.transformation || this.stories.contrarian) {
          this.displayStories(this.stories);
        }
      }
    },

    bindEvents: function() {
      const generateBtn = document.querySelector('#generate-business-stories-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleGenerate();
        });
      }

      const authorityToggle = document.querySelector('#business-stories-authority-hook-toggle');
      if (authorityToggle) {
        authorityToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleAuthorityHookBuilder();
        });
      }

      const impactToggle = document.querySelector('#business-stories-impact-intro-toggle');
      if (impactToggle) {
        impactToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleImpactIntroBuilder();
        });
      }

      const collectAuthorityBtn = document.querySelector('#collect-business-stories-authority-hook');
      if (collectAuthorityBtn) {
        collectAuthorityBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectAuthorityHookData();
        });
      }

      const collectImpactBtn = document.querySelector('#collect-business-stories-impact-intro');
      if (collectImpactBtn) {
        collectImpactBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectImpactIntroData();
        });
      }
    },

    toggleAuthorityHookBuilder: function() {
      const builder = document.querySelector('#business-stories-authority-hook-builder');
      const toggle = document.querySelector('#business-stories-authority-hook-toggle');

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
      const builder = document.querySelector('#business-stories-impact-intro-builder');
      const toggle = document.querySelector('#business-stories-impact-intro-toggle');

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
      const who = document.querySelector('#mkcg-who')?.value || '';
      const what = document.querySelector('#mkcg-result')?.value || '';
      const when = document.querySelector('#mkcg-when')?.value || '';
      const how = document.querySelector('#mkcg-how')?.value || '';

      const parts = [];
      if (who) parts.push(`WHO: ${who}`);
      if (what) parts.push(`WHAT: ${what}`);
      if (when) parts.push(`WHEN: ${when}`);
      if (how) parts.push(`HOW: ${how}`);

      this.fields.authority_hook = parts.join('\n');
      this.showNotification('Authority Hook collected!', 'success');
    },

    collectImpactIntroData: function() {
      const impactData = document.querySelector('#mkcg-impact-intro-result')?.value || '';
      if (impactData) {
        this.fields.impact_intro = impactData;
        this.showNotification('Impact Intro collected!', 'success');
      }
    },

    handleGenerate: function() {
      if (this.isGenerating) return;

      this.fields.name = document.querySelector('#business-stories-name')?.value || '';
      this.fields.title = document.querySelector('#business-stories-title')?.value || '';
      this.fields.industry = document.querySelector('#business-stories-industry')?.value || '';
      this.fields.target_customer = document.querySelector('#business-stories-target-customer')?.value || '';
      this.fields.tone = document.querySelector('#business-stories-tone')?.value || 'professional';
      this.fields.origin_story = document.querySelector('#business-stories-origin')?.value || '';
      this.fields.competitor_context = document.querySelector('#business-stories-competitors')?.value || '';
      this.fields.customer_results = document.querySelector('#business-stories-results')?.value || '';
      this.fields.unique_approach = document.querySelector('#business-stories-approach')?.value || '';

      if (!this.fields.name) {
        this.showNotification('Please enter a name', 'error');
        return;
      }

      const requestData = {
        action: 'mkcg_generate_business_stories',
        nonce: this.metadata.nonce,
        post_id: this.metadata.postId,
        name: this.fields.name,
        title: this.fields.title,
        industry: this.fields.industry,
        target_customer: this.fields.target_customer,
        tone: this.fields.tone,
        authority_hook: this.fields.authority_hook || '',
        impact_intro: this.fields.impact_intro || '',
        origin_story: this.fields.origin_story,
        competitor_context: this.fields.competitor_context,
        customer_results: this.fields.customer_results,
        unique_approach: this.fields.unique_approach
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
          this.showNotification('Business stories generated!', 'success');
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

    displayStories: function(stories) {
      const storyTypes = {
        purpose: { title: 'Purpose Story', subtitle: 'Why You Exist', container: '#purpose-story-container' },
        positioning: { title: 'Positioning Story', subtitle: 'Your Competitive Edge', container: '#positioning-story-container' },
        transformation: { title: 'Transformation Story', subtitle: 'Customer Success', container: '#transformation-story-container' },
        contrarian: { title: 'Contrarian Story', subtitle: 'Your Unique Perspective', container: '#contrarian-story-container' }
      };

      Object.keys(storyTypes).forEach(key => {
        const container = document.querySelector(storyTypes[key].container);
        if (container && stories[key]) {
          container.innerHTML = `
            <div class="business-story-card">
              <div class="business-story-card__header">
                <div>
                  <h4 class="business-story-card__title">${storyTypes[key].title}</h4>
                  <p class="business-story-card__subtitle">${storyTypes[key].subtitle}</p>
                </div>
                <button class="business-story-card__copy-btn" data-story="${key}">Copy</button>
              </div>
              <div class="business-story-card__body">
                <p class="business-story-card__text">${this.escapeHtml(stories[key])}</p>
              </div>
            </div>
          `;
        }
      });

      document.querySelectorAll('.business-story-card__copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const storyType = e.target.dataset.story;
          this.copyToClipboard(stories[storyType]);
        });
      });

      const resultsSection = document.querySelector('#business-stories-results-section');
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
      const btn = document.querySelector('#generate-business-stories-btn');
      if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Generating Stories...' : 'Generate Business Stories';
      }

      const loader = document.querySelector('#business-stories-loader');
      if (loader) loader.style.display = isLoading ? 'block' : 'none';
    },

    showNotification: function(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `business-stories-notification business-stories-notification--${type}`;
      notification.textContent = message;

      let container = document.querySelector('.business-stories-notifications');
      if (!container) {
        container = document.createElement('div');
        container.className = 'business-stories-notifications';
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
    BusinessStoriesGenerator.init();
  });

  window.BusinessStoriesGenerator = BusinessStoriesGenerator;

})();
