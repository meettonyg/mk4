/**
 * Credibility Stories Suite Generator JavaScript
 * @version 1.0
 */

(function() {
  'use strict';

  const CredibilityStoriesGenerator = {
    fields: {
      name: '', title: '', tone: 'authentic', vulnerability_level: 'moderate',
      breakthrough_moment: '', challenge_faced: '', key_mentors: '', personal_journey: ''
    },

    stories: {
      aha_moment: '', failure_comeback: '', mentor: '', transformation: ''
    },

    metadata: { postId: 0, nonce: '', hasData: false },
    isGenerating: false,

    init: function() {
      console.log('✨ Credibility Stories: Init');
      this.loadExistingData();
      this.bindEvents();
      this.updateDisplay();
    },

    loadExistingData: function() {
      if (window.MKCG_CredibilityStories_Data) {
        this.metadata = {
          postId: window.MKCG_CredibilityStories_Data.postId || 0,
          nonce: document.querySelector('#credibility-stories-nonce')?.value || '',
          hasData: window.MKCG_CredibilityStories_Data.hasData || false
        };

        if (window.MKCG_CredibilityStories_Data.hasData && !window.MKCG_CredibilityStories_Data.noEntryParam) {
          this.populateFromPHPData(window.MKCG_CredibilityStories_Data);
        }
      }
    },

    populateFromPHPData: function(data) {
      if (data.stories) {
        this.stories = {
          aha_moment: data.stories.aha_moment || '',
          failure_comeback: data.stories.failure_comeback || '',
          mentor: data.stories.mentor || '',
          transformation: data.stories.transformation || ''
        };

        if (this.stories.aha_moment || this.stories.failure_comeback || this.stories.mentor || this.stories.transformation) {
          this.displayStories(this.stories);
        }
      }
    },

    bindEvents: function() {
      const generateBtn = document.querySelector('#generate-credibility-stories-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleGenerate();
        });
      }

      const authorityToggle = document.querySelector('#credibility-stories-authority-hook-toggle');
      if (authorityToggle) {
        authorityToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleAuthorityHookBuilder();
        });
      }

      const impactToggle = document.querySelector('#credibility-stories-impact-intro-toggle');
      if (impactToggle) {
        impactToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleImpactIntroBuilder();
        });
      }

      const collectAuthorityBtn = document.querySelector('#collect-credibility-stories-authority-hook');
      if (collectAuthorityBtn) {
        collectAuthorityBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectAuthorityHookData();
        });
      }

      const collectImpactBtn = document.querySelector('#collect-credibility-stories-impact-intro');
      if (collectImpactBtn) {
        collectImpactBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectImpactIntroData();
        });
      }
    },

    toggleAuthorityHookBuilder: function() {
      const builder = document.querySelector('#credibility-stories-authority-hook-builder');
      const toggle = document.querySelector('#credibility-stories-authority-hook-toggle');

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
      const builder = document.querySelector('#credibility-stories-impact-intro-builder');
      const toggle = document.querySelector('#credibility-stories-impact-intro-toggle');

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

      this.fields.name = document.querySelector('#credibility-stories-name')?.value || '';
      this.fields.title = document.querySelector('#credibility-stories-title')?.value || '';
      this.fields.tone = document.querySelector('#credibility-stories-tone')?.value || 'authentic';
      this.fields.vulnerability_level = document.querySelector('#credibility-stories-vulnerability')?.value || 'moderate';
      this.fields.breakthrough_moment = document.querySelector('#credibility-stories-breakthrough')?.value || '';
      this.fields.challenge_faced = document.querySelector('#credibility-stories-challenge')?.value || '';
      this.fields.key_mentors = document.querySelector('#credibility-stories-mentors')?.value || '';
      this.fields.personal_journey = document.querySelector('#credibility-stories-journey')?.value || '';

      if (!this.fields.name) {
        this.showNotification('Please enter a name', 'error');
        return;
      }

      const requestData = {
        action: 'mkcg_generate_credibility_stories',
        nonce: this.metadata.nonce,
        post_id: this.metadata.postId,
        name: this.fields.name,
        title: this.fields.title,
        tone: this.fields.tone,
        vulnerability_level: this.fields.vulnerability_level,
        authority_hook: this.fields.authority_hook || '',
        impact_intro: this.fields.impact_intro || '',
        breakthrough_moment: this.fields.breakthrough_moment,
        challenge_faced: this.fields.challenge_faced,
        key_mentors: this.fields.key_mentors,
        personal_journey: this.fields.personal_journey
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
          this.showNotification('Credibility stories generated!', 'success');
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
        aha_moment: { title: 'Aha Moment Story', subtitle: 'Your Breakthrough', container: '#aha-moment-story-container' },
        failure_comeback: { title: 'Failure/Comeback Story', subtitle: 'Your Resilience', container: '#failure-comeback-story-container' },
        mentor: { title: 'Mentor Story', subtitle: 'Your Lineage', container: '#mentor-story-container' },
        transformation: { title: 'Personal Transformation Story', subtitle: 'Your Journey', container: '#transformation-story-container' }
      };

      Object.keys(storyTypes).forEach(key => {
        const container = document.querySelector(storyTypes[key].container);
        if (container && stories[key]) {
          container.innerHTML = `
            <div class="credibility-story-card">
              <div class="credibility-story-card__header">
                <div>
                  <h4 class="credibility-story-card__title">${storyTypes[key].title}</h4>
                  <p class="credibility-story-card__subtitle">${storyTypes[key].subtitle}</p>
                </div>
                <button class="credibility-story-card__copy-btn" data-story="${key}">Copy</button>
              </div>
              <div class="credibility-story-card__body">
                <p class="credibility-story-card__text">${this.escapeHtml(stories[key])}</p>
              </div>
            </div>
          `;
        }
      });

      document.querySelectorAll('.credibility-story-card__copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const storyType = e.target.dataset.story;
          this.copyToClipboard(stories[storyType]);
        });
      });

      const resultsSection = document.querySelector('#credibility-stories-results-section');
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
      const btn = document.querySelector('#generate-credibility-stories-btn');
      if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Generating Stories...' : 'Generate Credibility Stories';
      }

      const loader = document.querySelector('#credibility-stories-loader');
      if (loader) loader.style.display = isLoading ? 'block' : 'none';
    },

    showNotification: function(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `credibility-stories-notification credibility-stories-notification--${type}`;
      notification.textContent = message;

      let container = document.querySelector('.credibility-stories-notifications');
      if (!container) {
        container = document.createElement('div');
        container.className = 'credibility-stories-notifications';
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
    CredibilityStoriesGenerator.init();
  });

  window.CredibilityStoriesGenerator = CredibilityStoriesGenerator;

})();
