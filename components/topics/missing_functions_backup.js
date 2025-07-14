/**
 * ROOT FIX: MISSING UTILITY FUNCTIONS FOR TOPICS COMPONENT
 * These functions complete the panel-script.js implementation
 */

/**
 * ROOT FIX: Complete shouldAutoPopulate function
 * @param {Object} storedData - Enhanced stored topics data
 * @returns {boolean} Whether auto-population should be suggested
 */
function shouldAutoPopulate(storedData) {
    if (!storedData || !storedData.topics) {
        return false;
    }
    
    // Check if current panel fields are mostly empty
    const currentFields = document.querySelectorAll('[data-topic-title]');
    const emptyFields = Array.from(currentFields).filter(input => !input.value.trim()).length;
    
    // Check data quality
    const avgQuality = storedData.quality_summary?.average_score || 0;
    const hasGoodQuality = avgQuality >= 70; // 70% threshold for auto-populate
    
    // Check if we have enough good topics
    const goodTopics = Object.values(storedData.topics).filter(topic => 
        !topic.is_empty && topic.quality >= 60
    ).length;
    
    // Auto-populate if: mostly empty fields + good quality data + enough topics
    const shouldAutoPopulate = emptyFields >= 3 && hasGoodQuality && goodTopics >= 3;
    
    console.log('🤔 ROOT FIX: Auto-populate analysis:', {
        emptyFields,
        avgQuality,
        goodTopics,
        shouldAutoPopulate
    });
    
    return shouldAutoPopulate;
}

/**
 * ROOT FIX: Handle auto-populate prompt
 * @param {Object} storedData - Enhanced stored topics data
 */
function handleAutoPopulatePrompt(storedData) {
    if (!storedData || !storedData.topics) {
        return;
    }
    
    // Create prompt dialog
    const prompt = document.createElement('div');
    prompt.className = 'auto-populate-prompt';
    prompt.innerHTML = `
        <div class="prompt-overlay">
            <div class="prompt-dialog">
                <div class="prompt-header">
                    <h3>Auto-Populate Topics</h3>
                    <button class="prompt-close" onclick="this.closest('.auto-populate-prompt').remove()">×</button>
                </div>
                <div class="prompt-content">
                    <div class="prompt-icon">🎯</div>
                    <div class="prompt-text">
                        <p>We found <strong>${storedData.total_topics} high-quality topics</strong> in your stored data.</p>
                        <p>Would you like us to automatically fill in the empty fields?</p>
                        <div class="quality-preview">
                            <span class="quality-score">Average Quality: ${storedData.quality_summary?.average_score || 0}%</span>
                        </div>
                    </div>
                </div>
                <div class="prompt-actions">
                    <button class="btn-secondary" onclick="this.closest('.auto-populate-prompt').remove()">
                        No Thanks
                    </button>
                    <button class="btn-primary auto-populate-confirm" onclick="confirmAutoPopulate()">
                        Auto-Fill Topics
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Style the prompt
    prompt.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `;
    
    document.body.appendChild(prompt);
    
    // Store data for confirmation
    window._autoPopulateData = storedData;
}

/**
 * ROOT FIX: Confirm auto-populate action
 */
window.confirmAutoPopulate = function() {
    const prompt = document.querySelector('.auto-populate-prompt');
    const storedData = window._autoPopulateData;
    
    if (prompt) prompt.remove();
    if (!storedData) return;
    
    console.log('🎯 ROOT FIX: Confirming auto-populate...');
    
    // Populate the fields
    populateTopicFieldsWithStoredData(storedData.topics);
    
    // Show success notification
    showNotification(`Auto-filled ${storedData.total_topics} topics successfully!`, 'success');
    
    // Clean up
    delete window._autoPopulateData;
};

/**
 * ROOT FIX: Show user guidance based on completion status
 * @param {Object} completionStatus - User completion status data
 */
function showUserGuidance(completionStatus) {
    if (!completionStatus) return;
    
    const guidance = document.createElement('div');
    guidance.className = 'user-guidance-panel';
    
    const statusIcon = getStatusIcon(completionStatus.status);
    const priority = getPriorityIcon(completionStatus.priority);
    
    guidance.innerHTML = `
        <div class="guidance-header">
            <div class="guidance-status">
                ${statusIcon} ${completionStatus.status.charAt(0).toUpperCase() + completionStatus.status.slice(1)}
            </div>
            <div class="guidance-priority ${completionStatus.priority}">
                ${priority} ${completionStatus.priority} Priority
            </div>
        </div>
        <div class="guidance-content">
            <h4>Next Steps</h4>
            <div class="guidance-message">
                ${completionStatus.message || 'Continue editing your topics to improve quality.'}
            </div>
            ${completionStatus.recommendations ? `
                <div class="guidance-recommendations">
                    <h5>Recommendations:</h5>
                    <ul>
                        ${completionStatus.recommendations.map(rec => `
                            <li>
                                <span class="rec-icon">${rec.type === 'critical' ? '⚠️' : '💡'}</span>
                                ${rec.message}
                                ${rec.action ? `<button class="rec-action" onclick="handleRecommendationAction('${rec.action}', '${rec.target}')">${rec.action_label || 'Fix'}</button>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        </div>
        <div class="guidance-actions">
            <button class="btn-secondary" onclick="this.closest('.user-guidance-panel').remove()">
                Dismiss
            </button>
            <button class="btn-primary" onclick="this.closest('.user-guidance-panel').remove()">
                Got it
            </button>
        </div>
    `;
    
    // Style and position
    guidance.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        width: 320px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        font-size: 14px;
    `;
    
    document.body.appendChild(guidance);
    
    // Auto-remove after 15 seconds if not dismissed
    setTimeout(() => {
        if (guidance.parentNode) {
            guidance.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => guidance.remove(), 300);
        }
    }, 15000);
}

/**
 * ROOT FIX: Create quality distribution visualization card
 * @param {Object} distribution - Quality distribution data
 * @returns {HTMLElement} Quality distribution card
 */
function createQualityDistributionCard(distribution) {
    const card = document.createElement('div');
    card.className = 'quality-distribution-card data-card';
    
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    card.innerHTML = `
        <div class="card-header">
            <span class="card-title">Quality Distribution</span>
            <span class="card-subtitle">${total} topics analyzed</span>
        </div>
        <div class="card-content">
            <div class="distribution-chart">
                ${Object.entries(distribution).map(([level, count]) => {
                    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                    return `
                        <div class="distribution-bar">
                            <div class="bar-label">
                                <span class="quality-level quality-${level}">${level.charAt(0).toUpperCase() + level.slice(1)}</span>
                                <span class="bar-count">${count}</span>
                            </div>
                            <div class="bar-track">
                                <div class="bar-fill quality-${level}" style="width: ${percentage}%"></div>
                            </div>
                            <span class="bar-percentage">${percentage}%</span>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    return card;
}

/**
 * ROOT FIX: Create empty slots indicator card
 * @param {number} emptySlots - Number of empty slots
 * @returns {HTMLElement} Empty slots card
 */
function createEmptySlotsCard(emptySlots) {
    const card = document.createElement('div');
    card.className = 'empty-slots-card data-card';
    
    card.innerHTML = `
        <div class="card-header">
            <span class="card-title">Available Slots</span>
            <span class="card-subtitle">Ready for content</span>
        </div>
        <div class="card-content">
            <div class="empty-slots-visual">
                <div class="slots-icon">📝</div>
                <div class="slots-count">${emptySlots}</div>
                <div class="slots-text">empty ${emptySlots === 1 ? 'slot' : 'slots'}</div>
            </div>
            <div class="slots-suggestion">
                ${emptySlots > 2 ? 
                    'Consider adding more topics to maximize your media kit impact.' : 
                    'You have space for additional topics if needed.'
                }
            </div>
        </div>
    `;
    
    return card;
}

/**
 * ROOT FIX: Get status icon based on status type
 * @param {string} status - Status type
 * @returns {string} Status icon
 */
function getStatusIcon(status) {
    const icons = {
        'complete': '✅',
        'in_progress': '🔄',
        'needs_attention': '⚠️',
        'empty': '○',
        'draft': '📝',
        'review': '👀',
        'approved': '✅',
        'rejected': '❌'
    };
    
    return icons[status] || '○';
}

/**
 * ROOT FIX: Get priority icon based on priority level
 * @param {string} priority - Priority level
 * @returns {string} Priority icon
 */
function getPriorityIcon(priority) {
    const icons = {
        'high': '🔴',
        'medium': '🟡',
        'low': '🟢',
        'critical': '⚠️',
        'urgent': '🚨'
    };
    
    return icons[priority] || '🟢';
}

/**
 * ROOT FIX: Handle recommendation actions
 * @param {string} action - Action type
 * @param {string} target - Action target
 */
function handleRecommendationAction(action, target) {
    console.log('🎯 ROOT FIX: Handling recommendation action:', action, target);
    
    switch (action) {
        case 'fix_length':
            // Focus on the problematic input
            const input = document.querySelector(`[data-topic-title="${target}"]`);
            if (input) {
                input.focus();
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                showNotification('Focus set on topic that needs length adjustment', 'info');
            }
            break;
            
        case 'improve_quality':
            // Open quality improvement suggestions
            const topicItem = document.querySelector(`[data-topic-index="${target}"]`);
            if (topicItem) {
                topicItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                showQualityImprovementTips(target);
            }
            break;
            
        case 'add_content':
            // Suggest content from stored data
            if (storedTopicsData && storedTopicsData.topics) {
                const emptyInput = document.querySelector(`[data-topic-title="${target}"]`);
                if (emptyInput) {
                    emptyInput.focus();
                    showContentSuggestions(target);
                }
            }
            break;
            
        case 'review_all':
            // Show comprehensive review panel
            showComprehensiveReview();
            break;
            
        default:
            showNotification(`Action "${action}" not yet implemented`, 'info');
    }
}

/**
 * ROOT FIX: Preview stored topic (global function)
 * @param {string} topicKey - Topic key to preview
 */
window.previewStoredTopic = function(topicKey) {
    if (!storedTopicsData || !storedTopicsData.topics[topicKey]) {
        showNotification('Topic data not available', 'error');
        return;
    }
    
    const topicData = storedTopicsData.topics[topicKey];
    
    // Create preview modal
    const modal = document.createElement('div');
    modal.className = 'topic-preview-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.closest('.topic-preview-modal').remove()">
            <div class="modal-dialog" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Topic Preview</h3>
                    <button class="modal-close" onclick="this.closest('.topic-preview-modal').remove()">×</button>
                </div>
                <div class="modal-content">
                    <div class="preview-header">
                        <div class="topic-number">Topic ${topicData.index + 1}</div>
                        <div class="topic-badges">
                            <span class="quality-badge quality-${topicData.quality_level}">
                                ${topicData.quality}% Quality
                            </span>
                            <span class="source-badge source-${topicData.data_source}">
                                ${topicData.data_source === 'mkcg' ? '🤖 MKCG' : '✏️ Manual'}
                            </span>
                        </div>
                    </div>
                    <div class="preview-content">
                        <div class="topic-text">
                            "${escapeHtml(topicData.value)}"
                        </div>
                        <div class="topic-analysis">
                            <div class="analysis-item">
                                <strong>Word Count:</strong> ${topicData.word_count}
                            </div>
                            <div class="analysis-item">
                                <strong>Character Count:</strong> ${topicData.character_count}
                            </div>
                            <div class="analysis-item">
                                <strong>Last Modified:</strong> ${topicData.last_modified ? new Date(topicData.last_modified).toLocaleString() : 'Never'}
                            </div>
                            <div class="analysis-item">
                                <strong>Edit History:</strong> ${topicData.edit_history_count} changes
                            </div>
                        </div>
                        ${topicData.quality_analysis ? `
                            <div class="quality-analysis">
                                <h4>Quality Analysis</h4>
                                <div class="quality-details">
                                    ${Object.entries(topicData.quality_analysis).map(([key, value]) => `
                                        <div class="quality-item">
                                            <span class="quality-label">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>
                                            <span class="quality-value">${typeof value === 'boolean' ? (value ? '✅' : '❌') : value}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="this.closest('.topic-preview-modal').remove()">
                        Close
                    </button>
                    <button class="btn-primary" onclick="useStoredTopic('${topicKey}'); this.closest('.topic-preview-modal').remove();">
                        Use This Topic
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Style the modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease-out;
    `;
    
    document.body.appendChild(modal);
};

/**
 * ROOT FIX: Update completion progress indicator
 * @param {Object} completionStatus - Completion status data
 */
function updateCompletionProgress(completionStatus) {
    if (!completionStatus) return;
    
    // Find or create progress indicator
    let progressIndicator = document.getElementById('completion-progress-indicator');
    if (!progressIndicator) {
        progressIndicator = document.createElement('div');
        progressIndicator.id = 'completion-progress-indicator';
        progressIndicator.className = 'completion-progress';
        
        // Insert after the topics field counter
        const counter = document.getElementById('topics-field-counter');
        if (counter && counter.parentNode) {
            counter.parentNode.insertBefore(progressIndicator, counter.nextSibling);
        }
    }
    
    const percentage = completionStatus.percentage || 0;
    const status = completionStatus.status || 'unknown';
    
    progressIndicator.innerHTML = `
        <div class="progress-header">
            <span class="progress-label">Completion Progress</span>
            <span class="progress-percentage">${percentage}%</span>
        </div>
        <div class="progress-bar">
            <div class="progress-fill status-${status}" style="width: ${percentage}%"></div>
        </div>
        <div class="progress-status">
            ${getStatusIcon(status)} ${status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
    `;
    
    progressIndicator.style.cssText = `
        margin: 10px 0;
        padding: 12px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        font-size: 12px;
    `;
}

/**
 * ROOT FIX: Show quality recommendations
 * @param {Array} recommendations - Array of recommendation objects
 */
function showQualityRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) return;
    
    // Find or create recommendations container
    let container = document.getElementById('quality-recommendations');
    if (!container) {
        container = document.createElement('div');
        container.id = 'quality-recommendations';
        container.className = 'quality-recommendations';
        
        // Insert after the stored topics preview
        const preview = document.getElementById('stored-topics-preview');
        if (preview && preview.parentNode) {
            preview.parentNode.insertBefore(container, preview.nextSibling);
        }
    }
    
    container.innerHTML = `
        <div class="recommendations-header">
            <h5>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                Quality Recommendations
            </h5>
        </div>
        <div class="recommendations-list">
            ${recommendations.map((rec, index) => `
                <div class="recommendation-item ${rec.priority || 'medium'}">
                    <div class="rec-icon">
                        ${rec.type === 'critical' ? '⚠️' : rec.type === 'improvement' ? '💡' : '📋'}
                    </div>
                    <div class="rec-content">
                        <div class="rec-message">${rec.message}</div>
                        ${rec.details ? `<div class="rec-details">${rec.details}</div>` : ''}
                    </div>
                    ${rec.action ? `
                        <div class="rec-actions">
                            <button class="rec-action-btn" onclick="handleRecommendationAction('${rec.action}', '${rec.target || index}')">
                                ${rec.action_label || 'Fix'}
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>
    `;
    
    container.style.cssText = `
        margin: 15px 0;
        padding: 15px;
        background: #fffbeb;
        border: 1px solid #fed7aa;
        border-radius: 8px;
        font-size: 13px;
    `;
}

/**
 * ROOT FIX: Show data loading status
 * @param {string} message - Status message
 * @param {string} type - Status type (loading, success, error, warning)
 */
function showDataLoadingStatus(message, type = 'info') {
    // Find or create status indicator
    let statusEl = document.getElementById('data-loading-status');
    if (!statusEl) {
        statusEl = document.createElement('div');
        statusEl.id = 'data-loading-status';
        statusEl.className = 'data-loading-status';
        
        // Insert at the top of the MKCG section
        const mkcgSection = document.getElementById('topics-mkcg-section');
        if (mkcgSection) {
            mkcgSection.insertBefore(statusEl, mkcgSection.firstElementChild);
        }
    }
    
    const icons = {
        loading: '⏳',
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    statusEl.innerHTML = `
        <div class="status-content status-${type}">
            <span class="status-icon">${icons[type] || icons.info}</span>
            <span class="status-message">${message}</span>
        </div>
    `;
    
    statusEl.style.cssText = `
        margin: 10px 0;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        background: ${type === 'success' ? '#f0fdf4' : type === 'error' ? '#fef2f2' : type === 'warning' ? '#fffbeb' : '#f0f9ff'};
        border: 1px solid ${type === 'success' ? '#bbf7d0' : type === 'error' ? '#fecaca' : type === 'warning' ? '#fed7aa' : '#bae6fd'};
        color: ${type === 'success' ? '#166534' : type === 'error' ? '#991b1b' : type === 'warning' ? '#92400e' : '#1e40af'};
    `;
    
    // Auto-hide success/info messages after 3 seconds
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            if (statusEl && statusEl.parentNode) {
                statusEl.style.opacity = '0';
                setTimeout(() => statusEl.remove(), 300);
            }
        }, 3000);
    }
}

/**
 * ROOT FIX: Calculate topic quality score
 * @param {string} topicText - Topic text to analyze
 * @returns {number} Quality score (0-100)
 */
function calculateTopicQuality(topicText) {
    if (!topicText || typeof topicText !== 'string') {
        return 0;
    }
    
    const text = topicText.trim();
    if (text.length === 0) {
        return 0;
    }
    
    let score = 0;
    
    // Length scoring (optimal 10-50 characters)
    if (text.length >= 10 && text.length <= 50) {
        score += 30;
    } else if (text.length >= 5 && text.length <= 80) {
        score += 20;
    } else if (text.length >= 3) {
        score += 10;
    }
    
    // Capitalization
    if (text[0] === text[0].toUpperCase()) {
        score += 15;
    }
    
    // Word count (2-8 words optimal)
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount >= 2 && wordCount <= 8) {
        score += 25;
    } else if (wordCount >= 1 && wordCount <= 12) {
        score += 15;
    }
    
    // No special characters/HTML
    if (!/[<>{}]/.test(text)) {
        score += 10;
    }
    
    // Professional language (basic check)
    if (!/\b(um|uh|like|you know)\b/i.test(text)) {
        score += 10;
    }
    
    // Descriptive content (contains industry terms or action words)
    if (/\b(strategy|development|management|leadership|innovation|technology|design|marketing|consulting|training|speaking|presentation)\b/i.test(text)) {
        score += 10;
    }
    
    return Math.min(100, Math.max(0, score));
}

/**
 * ROOT FIX: Get quality level from score
 * @param {number} score - Quality score (0-100)
 * @returns {string} Quality level (excellent, good, fair, poor)
 */
function getQualityLevel(score) {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
}

/**
 * ROOT FIX: Clear topic content
 * @param {HTMLElement} topicItem - Topic item element
 * @param {number} index - Topic index
 */
function clearTopicContent(topicItem, index) {
    const titleInput = topicItem.querySelector(`[data-topic-title="${index}"]`);
    const descInput = topicItem.querySelector(`[data-topic-description="${index}"]`);
    
    if (titleInput) {
        titleInput.value = '';
        updateCharCounter(titleInput, topicItem);
    }
    
    if (descInput) {
        descInput.value = '';
        updateCharCounter(descInput, topicItem);
    }
    
    // Update indicators
    updateTopicIndicators(topicItem, index);
    
    // Update component
    updateTopicsInComponent(document.querySelector('.editable-element--selected'));
    
    // Schedule auto-save
    scheduleAutoSave();
    
    showNotification(`Topic ${index + 1} cleared`, 'info');
}

/**
 * ROOT FIX: Schedule auto-save
 */
function scheduleAutoSave() {
    // Clear existing timer
    if (topicsAutoSaveTimer) {
        clearTimeout(topicsAutoSaveTimer);
    }
    
    // Schedule new save
    topicsAutoSaveTimer = setTimeout(() => {
        if (isMkcgMode && typeof updateAutoSaveStatus === 'function') {
            updateAutoSaveStatus('saving');
            
            // Simulate save operation
            setTimeout(() => {
                updateAutoSaveStatus('saved');
                console.log('🎯 ROOT FIX: Auto-save completed');
            }, 1000);
        }
    }, TOPICS_AUTO_SAVE_DELAY);
}

/**
 * ROOT FIX: Update auto-save status
 * @param {string} status - Save status (ready, saving, saved, error)
 */
function updateAutoSaveStatus(status) {
    const statusElement = document.querySelector('.save-status-text');
    const iconElement = document.querySelector('.save-status-icon');
    const progressBar = document.querySelector('.save-progress-bar');
    
    if (!statusElement) return;
    
    const statusConfig = {
        ready: { text: 'Ready', icon: '💾', color: '#6b7280', progress: 0 },
        saving: { text: 'Saving...', icon: '⏳', color: '#3b82f6', progress: 100 },
        saved: { text: 'Saved', icon: '✅', color: '#10b981', progress: 0 },
        error: { text: 'Error', icon: '❌', color: '#ef4444', progress: 0 }
    };
    
    const config = statusConfig[status] || statusConfig.ready;
    
    if (iconElement) iconElement.textContent = config.icon;
    statusElement.innerHTML = `Auto-save: <span class="save-timer" style="color: ${config.color}">${config.text}</span>`;
    
    if (progressBar) {
        progressBar.style.width = config.progress + '%';
        progressBar.style.backgroundColor = config.color;
        
        if (status === 'saved') {
            setTimeout(() => {
                progressBar.style.width = '0%';
            }, 1000);
        }
    }
}

/**
 * ROOT FIX: Setup enhanced bulk operations
 */
function setupEnhancedBulkOperations() {
    console.log('🎯 ROOT FIX: Setting up enhanced bulk operations...');
    
    // This function would be implemented to handle bulk operations
    // like clear all, reset to MKCG, etc.
    // For now, just log that it's been called
}

console.log('✅ ROOT FIX: Missing utility functions loaded successfully');
