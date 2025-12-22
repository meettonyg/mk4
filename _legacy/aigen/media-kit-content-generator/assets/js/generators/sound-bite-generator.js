/**
 * Sound Bite Generator JavaScript
 * @version 1.0
 */

(function() {
  'use strict';

  const SoundBiteGenerator = {
    fields: {
      name: '', title: '', style: 'mixed', tone: 'bold', count: 12,
      expertise_areas: '', key_philosophies: '', unique_perspectives: ''
    },

    soundBites: [],
    metadata: { postId: 0, nonce: '', hasData: false },
    isGenerating: false,

    init: function() {
      console.log('💬 Sound Bites: Init');
      this.loadExistingData();
      this.bindEvents();
      this.updateDisplay();
    },

    loadExistingData: function() {
      if (window.MKCG_SoundBites_Data) {
        this.metadata = {
          postId: window.MKCG_SoundBites_Data.postId || 0,
          nonce: document.querySelector('#sound-bites-nonce')?.value || '',
          hasData: window.MKCG_SoundBites_Data.hasData || false
        };

        if (window.MKCG_SoundBites_Data.hasData && !window.MKCG_SoundBites_Data.noEntryParam) {
          this.populateFromPHPData(window.MKCG_SoundBites_Data);
        }
      }
    },

    populateFromPHPData: function(data) {
      if (data.sound_bites && data.sound_bites.length > 0) {
        this.soundBites = data.sound_bites;
        this.displaySoundBites(this.soundBites);
      }
    },

    bindEvents: function() {
      const generateBtn = document.querySelector('#generate-sound-bites-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleGenerate();
        });
      }

      const authorityToggle = document.querySelector('#sound-bites-authority-hook-toggle');
      if (authorityToggle) {
        authorityToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleAuthorityHookBuilder();
        });
      }

      const impactToggle = document.querySelector('#sound-bites-impact-intro-toggle');
      if (impactToggle) {
        impactToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleImpactIntroBuilder();
        });
      }

      const collectAuthorityBtn = document.querySelector('#collect-sound-bites-authority-hook');
      if (collectAuthorityBtn) {
        collectAuthorityBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectAuthorityHookData();
        });
      }

      const collectImpactBtn = document.querySelector('#collect-sound-bites-impact-intro');
      if (collectImpactBtn) {
        collectImpactBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectImpactIntroData();
        });
      }
    },

    toggleAuthorityHookBuilder: function() {
      const builder = document.querySelector('#sound-bites-authority-hook-builder');
      const toggle = document.querySelector('#sound-bites-authority-hook-toggle');

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
      const builder = document.querySelector('#sound-bites-impact-intro-builder');
      const toggle = document.querySelector('#sound-bites-impact-intro-toggle');

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

      this.fields.name = document.querySelector('#sound-bites-name')?.value || '';
      this.fields.title = document.querySelector('#sound-bites-title')?.value || '';
      this.fields.style = document.querySelector('#sound-bites-style')?.value || 'mixed';
      this.fields.tone = document.querySelector('#sound-bites-tone')?.value || 'bold';
      this.fields.count = parseInt(document.querySelector('#sound-bites-count')?.value) || 12;
      this.fields.expertise_areas = document.querySelector('#sound-bites-expertise')?.value || '';
      this.fields.key_philosophies = document.querySelector('#sound-bites-philosophies')?.value || '';
      this.fields.unique_perspectives = document.querySelector('#sound-bites-perspectives')?.value || '';

      if (!this.fields.name) {
        this.showNotification('Please enter a name', 'error');
        return;
      }

      const requestData = {
        action: 'mkcg_generate_sound_bites',
        nonce: this.metadata.nonce,
        post_id: this.metadata.postId,
        name: this.fields.name,
        title: this.fields.title,
        style: this.fields.style,
        tone: this.fields.tone,
        count: this.fields.count,
        authority_hook: this.fields.authority_hook || '',
        impact_intro: this.fields.impact_intro || '',
        expertise_areas: this.fields.expertise_areas,
        key_philosophies: this.fields.key_philosophies,
        unique_perspectives: this.fields.unique_perspectives
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
          this.soundBites = data.data.sound_bites || [];
          this.displaySoundBites(this.soundBites);
          this.showNotification(`Generated ${this.soundBites.length} sound bites!`, 'success');
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

    displaySoundBites: function(bites) {
      const container = document.querySelector('#sound-bites-container');
      if (!container) return;

      container.innerHTML = '';

      bites.forEach(bite => {
        const biteCard = document.createElement('div');
        biteCard.className = 'sound-bite-card';
        biteCard.innerHTML = `
          <div class="sound-bite-card__content">
            <div class="sound-bite-card__quote-mark">"</div>
            <p class="sound-bite-card__text">${this.escapeHtml(bite.text)}</p>
            <div class="sound-bite-card__footer">
              <span class="sound-bite-card__word-count">${bite.word_count} words</span>
              <button class="sound-bite-card__copy-btn" data-index="${bite.number - 1}">Copy Quote</button>
            </div>
          </div>
        `;
        container.appendChild(biteCard);
      });

      // Bind copy buttons
      document.querySelectorAll('.sound-bite-card__copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          const bite = this.soundBites[index];
          this.copyToClipboard(bite.text);
        });
      });

      const resultsSection = document.querySelector('#sound-bites-results-section');
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
      const btn = document.querySelector('#generate-sound-bites-btn');
      if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Generating Sound Bites...' : 'Generate Sound Bites';
      }

      const loader = document.querySelector('#sound-bites-loader');
      if (loader) loader.style.display = isLoading ? 'block' : 'none';
    },

    showNotification: function(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `sound-bites-notification sound-bites-notification--${type}`;
      notification.textContent = message;

      let container = document.querySelector('.sound-bites-notifications');
      if (!container) {
        container = document.createElement('div');
        container.className = 'sound-bites-notifications';
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
    SoundBiteGenerator.init();
  });

  window.SoundBiteGenerator = SoundBiteGenerator;

})();
