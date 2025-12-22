/**
 * Interview Prep Generator JavaScript
 * @version 1.0
 */

(function() {
  'use strict';

  const InterviewPrepGenerator = {
    fields: {
      name: '', title: '', interview_type: 'podcast', depth: 'moderate',
      question_count: 8, expertise_areas: '', key_messages: '', audience_context: ''
    },

    qaPairs: [],
    metadata: { postId: 0, nonce: '', hasData: false },
    isGenerating: false,

    init: function() {
      console.log('🎙️ Interview Prep: Init');
      this.loadExistingData();
      this.bindEvents();
      this.updateDisplay();
    },

    loadExistingData: function() {
      if (window.MKCG_InterviewPrep_Data) {
        this.metadata = {
          postId: window.MKCG_InterviewPrep_Data.postId || 0,
          nonce: document.querySelector('#interview-prep-nonce')?.value || '',
          hasData: window.MKCG_InterviewPrep_Data.hasData || false
        };

        if (window.MKCG_InterviewPrep_Data.hasData && !window.MKCG_InterviewPrep_Data.noEntryParam) {
          this.populateFromPHPData(window.MKCG_InterviewPrep_Data);
        }
      }
    },

    populateFromPHPData: function(data) {
      if (data.qa_pairs && data.qa_pairs.length > 0) {
        this.qaPairs = data.qa_pairs;
        this.displayQA(this.qaPairs);
      }
    },

    bindEvents: function() {
      const generateBtn = document.querySelector('#generate-interview-prep-btn');
      if (generateBtn) {
        generateBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.handleGenerate();
        });
      }

      const authorityToggle = document.querySelector('#interview-prep-authority-hook-toggle');
      if (authorityToggle) {
        authorityToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleAuthorityHookBuilder();
        });
      }

      const impactToggle = document.querySelector('#interview-prep-impact-intro-toggle');
      if (impactToggle) {
        impactToggle.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggleImpactIntroBuilder();
        });
      }

      const collectAuthorityBtn = document.querySelector('#collect-interview-prep-authority-hook');
      if (collectAuthorityBtn) {
        collectAuthorityBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectAuthorityHookData();
        });
      }

      const collectImpactBtn = document.querySelector('#collect-interview-prep-impact-intro');
      if (collectImpactBtn) {
        collectImpactBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.collectImpactIntroData();
        });
      }
    },

    toggleAuthorityHookBuilder: function() {
      const builder = document.querySelector('#interview-prep-authority-hook-builder');
      const toggle = document.querySelector('#interview-prep-authority-hook-toggle');

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
      const builder = document.querySelector('#interview-prep-impact-intro-builder');
      const toggle = document.querySelector('#interview-prep-impact-intro-toggle');

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

      this.fields.name = document.querySelector('#interview-prep-name')?.value || '';
      this.fields.title = document.querySelector('#interview-prep-title')?.value || '';
      this.fields.interview_type = document.querySelector('#interview-prep-type')?.value || 'podcast';
      this.fields.depth = document.querySelector('#interview-prep-depth')?.value || 'moderate';
      this.fields.question_count = parseInt(document.querySelector('#interview-prep-count')?.value) || 8;
      this.fields.expertise_areas = document.querySelector('#interview-prep-expertise')?.value || '';
      this.fields.key_messages = document.querySelector('#interview-prep-messages')?.value || '';
      this.fields.audience_context = document.querySelector('#interview-prep-audience')?.value || '';

      if (!this.fields.name) {
        this.showNotification('Please enter a name', 'error');
        return;
      }

      const requestData = {
        action: 'mkcg_generate_interview_prep',
        nonce: this.metadata.nonce,
        post_id: this.metadata.postId,
        name: this.fields.name,
        title: this.fields.title,
        interview_type: this.fields.interview_type,
        depth: this.fields.depth,
        question_count: this.fields.question_count,
        authority_hook: this.fields.authority_hook || '',
        impact_intro: this.fields.impact_intro || '',
        expertise_areas: this.fields.expertise_areas,
        key_messages: this.fields.key_messages,
        audience_context: this.fields.audience_context
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
          this.qaPairs = data.data.qa_pairs || [];
          this.displayQA(this.qaPairs);
          this.showNotification(`Generated ${this.qaPairs.length} interview questions!`, 'success');
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

    displayQA: function(qaPairs) {
      const container = document.querySelector('#interview-qa-container');
      if (!container) return;

      container.innerHTML = '';

      qaPairs.forEach(qa => {
        const qaCard = document.createElement('div');
        qaCard.className = 'interview-qa-card';
        qaCard.innerHTML = `
          <div class="interview-qa-card__header">
            <span class="interview-qa-card__number">Q${qa.number}</span>
            <button class="interview-qa-card__copy-btn" data-index="${qa.number - 1}">Copy Both</button>
          </div>
          <div class="interview-qa-card__question">
            <strong>Q:</strong> ${this.escapeHtml(qa.question)}
          </div>
          <div class="interview-qa-card__answer">
            <strong>A:</strong> ${this.escapeHtml(qa.answer)}
          </div>
        `;
        container.appendChild(qaCard);
      });

      // Bind copy buttons
      document.querySelectorAll('.interview-qa-card__copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const index = parseInt(e.target.dataset.index);
          const qa = this.qaPairs[index];
          const text = `Q: ${qa.question}\n\nA: ${qa.answer}`;
          this.copyToClipboard(text);
        });
      });

      const resultsSection = document.querySelector('#interview-prep-results-section');
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
      const btn = document.querySelector('#generate-interview-prep-btn');
      if (btn) {
        btn.disabled = isLoading;
        btn.textContent = isLoading ? 'Generating Q&A...' : 'Generate Interview Prep';
      }

      const loader = document.querySelector('#interview-prep-loader');
      if (loader) loader.style.display = isLoading ? 'block' : 'none';
    },

    showNotification: function(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `interview-prep-notification interview-prep-notification--${type}`;
      notification.textContent = message;

      let container = document.querySelector('.interview-prep-notifications');
      if (!container) {
        container = document.createElement('div');
        container.className = 'interview-prep-notifications';
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
    InterviewPrepGenerator.init();
  });

  window.InterviewPrepGenerator = InterviewPrepGenerator;

})();
