<template>
    <div class="dashboard-container" :class="{ 'is-loading': store.isLoading }">
        <!-- Sidebar -->
        <div class="sidebar">
            <!-- Rewards Section -->
            <div class="rewards-header">
                <h2>Guestify Rewards</h2>
                <div class="current-points">
                    <span>Your Points:</span>
                    <span class="points-badge">{{ store.totalPoints }}</span>
                </div>
            </div>

            <div class="rewards-list">
                <div
                    v-for="reward in sortedRewards"
                    :key="reward.id"
                    class="reward-item"
                    :class="{
                        'unlocked': reward.unlocked,
                        'locked': !reward.unlocked,
                        'next': isNextReward(reward)
                    }"
                >
                    <div v-if="reward.unlocked" class="task-checkmark"><i class="fas fa-check"></i></div>
                    <div v-else class="task-checkbox"></div>

                    <a
                        v-if="reward.unlocked && reward.download_url"
                        :href="reward.download_url"
                        class="reward-link"
                        target="_blank"
                    >
                        <div class="reward-info">
                            <div class="reward-points">{{ reward.threshold }} Points</div>
                            <div class="reward-title">{{ reward.title }}</div>
                            <div class="reward-description">{{ reward.description }}</div>
                        </div>
                    </a>
                    <div v-else class="reward-info">
                        <div class="reward-points">
                            {{ reward.threshold }} Points
                            <i v-if="!reward.unlocked" class="lock-icon fas fa-lock"></i>
                        </div>
                        <div class="reward-title">{{ reward.title }}</div>
                        <div class="reward-description">{{ reward.description }}</div>
                    </div>
                </div>
            </div>

            <!-- CTA Section -->
            <div class="sidebar-cta">
                <h2>FREE Quick Start Call</h2>
                <p>Get started fast with a FREE walkthrough by a Guestify specialist.</p>
                <a href="/onboarding/walkthrough/" class="cta-button">Schedule a FREE Call</a>
            </div>

            <div class="sidebar-spacer"></div>

            <!-- Bottom Links -->
            <div class="sidebar-bottom">
                <a href="/account/" class="sidebar-link">
                    <span class="fas fa-users"></span> Invite your team
                </a>
                <a href="/account/" class="sidebar-link">
                    <span class="fas fa-clipboard-list"></span> View your plan
                </a>
            </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
            <!-- Loading State -->
            <div v-if="store.isLoading && !store.progress" class="loading-overlay">
                <div class="loading-spinner"></div>
                <p>Loading your progress...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="store.lastError" class="error-banner">
                <p>{{ store.lastError }}</p>
                <button @click="store.fetchProgress(true)" class="cta-button">Retry</button>
            </div>

            <template v-else>
                <!-- Profile Selector (only show if multiple profiles) -->
                <div v-if="store.hasMultipleProfiles" class="profile-context-section">
                    <div class="profile-context-header">
                        <label class="profile-context-label">View progress for:</label>
                        <div class="profile-context-controls">
                            <select
                                v-model="selectedProfileId"
                                @change="handleProfileChange(selectedProfileId)"
                                class="profile-context-select"
                            >
                                <option :value="null">Best Profile (Auto)</option>
                                <option
                                    v-for="profile in store.availableProfiles"
                                    :key="profile.id"
                                    :value="profile.id"
                                >
                                    {{ profile.title || profile.name || `Profile #${profile.id}` }}
                                </option>
                            </select>
                            <button
                                v-if="store.isViewingSpecificProfile"
                                @click="resetToBestProfile"
                                class="profile-context-reset"
                                title="Reset to best profile view"
                            >
                                <i class="fas fa-undo"></i>
                            </button>
                        </div>
                    </div>
                    <p v-if="store.isViewingSpecificProfile" class="profile-context-hint">
                        Showing progress for <strong>{{ store.currentProfileDisplay }}</strong>.
                        Profile-specific tasks will be evaluated against this profile only.
                    </p>
                    <p v-else class="profile-context-hint">
                        Showing progress for your most complete profile automatically.
                    </p>
                </div>

                <!-- Progress Section -->
                <div class="progress-section">
                    <div class="progress-section-header">
                        <h2 class="progress-title">Your Guest Interview progress</h2>
                        <span v-if="store.isViewingSpecificProfile" class="progress-profile-badge">
                            {{ store.currentProfileDisplay }}
                        </span>
                        <span v-else-if="store.singleProfileName" class="progress-profile-badge progress-profile-badge--single">
                            {{ store.singleProfileName }}
                        </span>
                    </div>

                    <div class="progress-bar-container">
                        <div class="progress-bar" :style="{ width: store.percentage + '%' }"></div>
                    </div>

                    <div class="progress-stats-row">
                        <div class="progress-points">Points: {{ store.totalPoints }}/{{ store.maxPoints }}</div>
                        <div class="progress-percentage">{{ store.percentage }}%</div>
                    </div>

                    <a
                        href="#"
                        class="toggle-details-link"
                        @click.prevent="toggleDetails"
                    >
                        {{ showDetails ? 'Hide Details' : 'Show Details' }}
                    </a>

                    <!-- Progress Breakdown Table -->
                    <div v-show="showDetails" class="progress-container">
                        <div class="progress-header">
                            <h2 class="progress-title">Progress Breakdown</h2>
                        </div>

                        <table class="progress-table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Points</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="task in allTasks" :key="task.id">
                                    <td>{{ task.label }}</td>
                                    <td>{{ task.complete ? task.points : `0/${task.max_points}` }}</td>
                                    <td :class="task.complete ? 'status-complete' : 'status-incomplete'">
                                        <span :class="task.complete ? 'check-icon' : 'x-icon'">
                                            <i :class="task.complete ? 'fas fa-check' : 'fas fa-times'"></i>
                                        </span>
                                        {{ task.complete ? 'Complete' : 'Incomplete' }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table class="progress-table summary-section">
                            <tbody>
                                <tr>
                                    <td>Total Base Points</td>
                                    <td colspan="2">{{ store.totalPoints }}/{{ store.maxPoints }}</td>
                                </tr>
                                <tr>
                                    <td>Percentage</td>
                                    <td colspan="2">{{ store.percentage }}%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Task Cards -->
                <div
                    v-for="(group, groupId) in store.tasksByGroup"
                    :key="groupId"
                    class="task-card"
                >
                    <div class="task-card-header">
                        <div class="task-card-icon">
                            <span class="icon-emoji">{{ group.icon }}</span>
                        </div>
                        <h2 class="task-card-title">{{ group.label }}</h2>
                    </div>

                    <div
                        v-for="task in group.tasks"
                        :key="task.id"
                        class="task-item"
                    >
                        <div v-if="task.complete" class="task-checkmark"><i class="fas fa-check"></i></div>
                        <div v-else class="task-checkbox"></div>

                        <div class="task-content">
                            <div class="task-title">
                                <a
                                    v-if="task.link && task.link_type === 'new_tab'"
                                    :href="task.link"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {{ task.label }}
                                    <i class="fas fa-external-link-alt task-external-icon"></i>
                                </a>
                                <a
                                    v-else-if="task.link && task.link_type === 'modal'"
                                    href="#"
                                    @click.prevent="handleModalLink(task)"
                                >
                                    {{ task.label }}
                                </a>
                                <a v-else-if="task.link" :href="task.link">
                                    {{ task.label }}
                                </a>
                                <span v-else>{{ task.label }}</span>
                            </div>
                            <div v-if="task.description" class="task-description">
                                {{ task.description }}
                            </div>
                            <div class="task-progress-container">
                                <div class="task-progress-bar">
                                    <div
                                        class="task-progress"
                                        :style="{ width: (task.complete ? 100 : 0) + '%' }"
                                    ></div>
                                </div>
                                <div class="task-time-wrapper">
                                    <div class="task-percentage">{{ task.complete ? 100 : 0 }}%</div>
                                    <div class="task-time">
                                        {{ task.complete ? 'Completed' : getTimeEstimate(task) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Quick Profile Setup Modal -->
        <div v-if="showQuickProfileModal" class="onboarding-modal-overlay" @click.self="closeQuickProfileModal">
            <div class="onboarding-modal">
                <div class="onboarding-modal__header">
                    <h2 class="onboarding-modal__title">
                        <span class="onboarding-modal__icon">🎯</span>
                        Quick Profile Setup
                    </h2>
                    <button class="onboarding-modal__close" @click="closeQuickProfileModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="onboarding-modal__body">
                    <p class="onboarding-modal__intro">
                        Let's get your guest profile started! Fill in these quick details to establish your credibility.
                    </p>
                    <form @submit.prevent="submitQuickProfile" class="quick-profile-form">
                        <div class="form-group">
                            <label for="qp-name">Full Name</label>
                            <input
                                type="text"
                                id="qp-name"
                                v-model="quickProfile.name"
                                placeholder="e.g., John Smith"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label for="qp-title">Professional Title</label>
                            <input
                                type="text"
                                id="qp-title"
                                v-model="quickProfile.title"
                                placeholder="e.g., Marketing Consultant, Author, CEO"
                                required
                            />
                        </div>
                        <div class="form-group">
                            <label for="qp-website">Website or LinkedIn</label>
                            <input
                                type="url"
                                id="qp-website"
                                v-model="quickProfile.website"
                                placeholder="https://yourwebsite.com"
                            />
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" @click="closeQuickProfileModal">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary" :disabled="isSubmittingProfile">
                                {{ isSubmittingProfile ? 'Saving...' : 'Create Profile' }}
                            </button>
                        </div>
                    </form>
                    <p class="onboarding-modal__footer-note">
                        You can add more details later in your full profile.
                    </p>
                </div>
            </div>
        </div>

        <!-- Survey Modal -->
        <div v-if="showSurveyModal" class="onboarding-modal-overlay" @click.self="closeSurveyModal">
            <div class="onboarding-modal onboarding-modal--survey">
                <div class="onboarding-modal__header">
                    <h2 class="onboarding-modal__title">
                        <span class="onboarding-modal__icon">📊</span>
                        Personalize Your Experience
                    </h2>
                    <button class="onboarding-modal__close" @click="closeSurveyModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="onboarding-modal__body">
                    <!-- Survey Step Indicator -->
                    <div class="survey-progress">
                        <div class="survey-progress__bar">
                            <div class="survey-progress__fill" :style="{ width: surveyProgressPercent + '%' }"></div>
                        </div>
                        <span class="survey-progress__text">Question {{ currentSurveyStep }} of {{ totalSurveySteps }}</span>
                    </div>

                    <!-- Survey Questions -->
                    <div class="survey-questions">
                        <!-- Step 1: Primary Goal -->
                        <div v-show="currentSurveyStep === 1" class="survey-step">
                            <h3 class="survey-question">What is your primary goal with guest interviews?</h3>
                            <div class="survey-options">
                                <label v-for="option in surveyOptions.goals" :key="option" class="survey-option">
                                    <input type="radio" v-model="surveyAnswers.goal" :value="option" />
                                    <span class="survey-option__label">{{ option }}</span>
                                </label>
                            </div>
                        </div>

                        <!-- Step 2: Experience -->
                        <div v-show="currentSurveyStep === 2" class="survey-step">
                            <h3 class="survey-question">Have you been a guest on a podcast before?</h3>
                            <div class="survey-options">
                                <label v-for="option in surveyOptions.experience" :key="option" class="survey-option">
                                    <input type="radio" v-model="surveyAnswers.experience" :value="option" />
                                    <span class="survey-option__label">{{ option }}</span>
                                </label>
                            </div>
                        </div>

                        <!-- Step 3: Background -->
                        <div v-show="currentSurveyStep === 3" class="survey-step">
                            <h3 class="survey-question">Which best describes your business, brand, or expertise?</h3>
                            <div class="survey-options">
                                <label v-for="option in surveyOptions.background" :key="option" class="survey-option">
                                    <input type="radio" v-model="surveyAnswers.background" :value="option" />
                                    <span class="survey-option__label">{{ option }}</span>
                                </label>
                            </div>
                        </div>

                        <!-- Step 4: Challenges -->
                        <div v-show="currentSurveyStep === 4" class="survey-step">
                            <h3 class="survey-question">What is the biggest challenge you face in getting booked on podcasts?</h3>
                            <div class="survey-options">
                                <label v-for="option in surveyOptions.challenges" :key="option" class="survey-option">
                                    <input type="radio" v-model="surveyAnswers.challenge" :value="option" />
                                    <span class="survey-option__label">{{ option }}</span>
                                </label>
                            </div>
                        </div>

                        <!-- Step 5: Strategy -->
                        <div v-show="currentSurveyStep === 5" class="survey-step">
                            <h3 class="survey-question">How do you plan to use podcast interviews?</h3>
                            <div class="survey-options">
                                <label v-for="option in surveyOptions.strategy" :key="option" class="survey-option">
                                    <input type="radio" v-model="surveyAnswers.strategy" :value="option" />
                                    <span class="survey-option__label">{{ option }}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Survey Navigation -->
                    <div class="survey-nav">
                        <button
                            v-if="currentSurveyStep > 1"
                            type="button"
                            class="btn-secondary"
                            @click="prevSurveyStep"
                        >
                            <i class="fas fa-arrow-left"></i> Back
                        </button>
                        <div class="survey-nav__spacer"></div>
                        <button
                            v-if="currentSurveyStep < totalSurveySteps"
                            type="button"
                            class="btn-primary"
                            @click="nextSurveyStep"
                            :disabled="!canAdvanceSurvey"
                        >
                            Next <i class="fas fa-arrow-right"></i>
                        </button>
                        <button
                            v-else
                            type="button"
                            class="btn-primary"
                            @click="submitSurvey"
                            :disabled="isSubmittingSurvey || !canAdvanceSurvey"
                        >
                            {{ isSubmittingSurvey ? 'Saving...' : 'Complete Survey' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useOnboardingStore } from './stores/onboarding.js';

// Store
const store = useOnboardingStore();

// Local state
const showDetails = ref(false);
const selectedProfileId = ref(null);

// Modal state
const showQuickProfileModal = ref(false);
const showSurveyModal = ref(false);
const isSubmittingProfile = ref(false);
const isSubmittingSurvey = ref(false);

// Quick Profile form data
const quickProfile = reactive({
    name: '',
    title: '',
    website: ''
});

// Survey state
const currentSurveyStep = ref(1);
const totalSurveySteps = 5;
const surveyAnswers = reactive({
    goal: '',
    experience: '',
    background: '',
    challenge: '',
    strategy: ''
});

// Survey options (matching Formidable form)
const surveyOptions = {
    goals: [
        'Build my authority & credibility',
        'Generate leads & clients',
        'Grow my personal brand & visibility',
        'Sell a book, course, or program',
        'Create strategic partnerships & JVs',
        "I'm not sure yet"
    ],
    experience: [
        'Yes, frequently',
        'A few times',
        "No, but I've been featured elsewhere",
        "No, I'm brand new"
    ],
    background: [
        'Coach, Consultant, or Service Provider',
        'Author, Speaker, or Thought Leader',
        'Entrepreneur or Business Owner',
        'Agency or Marketing Professional',
        'Corporate or C-Suite Executive',
        'Other'
    ],
    challenges: [
        'Finding the right podcasts to pitch',
        'Crafting a compelling pitch that gets responses',
        'Knowing what to say during interviews',
        'Promoting & leveraging interviews after they go live',
        'Monetizing my podcast appearances',
        "I'm not sure where to start"
    ],
    strategy: [
        'Generate leads & sales for my business',
        'Drive traffic to my website, book, or offer',
        'Establish myself as an expert in my industry',
        'Grow my personal brand & audience',
        'Create partnerships & collaborations',
        'Monetize through sponsorships, affiliates, or referrals'
    ]
};

// Survey progress percentage
const surveyProgressPercent = computed(() => {
    return ((currentSurveyStep.value - 1) / totalSurveySteps) * 100;
});

// Check if current survey step has an answer
const canAdvanceSurvey = computed(() => {
    switch (currentSurveyStep.value) {
        case 1: return !!surveyAnswers.goal;
        case 2: return !!surveyAnswers.experience;
        case 3: return !!surveyAnswers.background;
        case 4: return !!surveyAnswers.challenge;
        case 5: return !!surveyAnswers.strategy;
        default: return false;
    }
});

// Toggle details visibility
const toggleDetails = () => {
    showDetails.value = !showDetails.value;
};

// Handle modal link clicks
const handleModalLink = (task) => {
    if (task.link === '#quickProfileModal') {
        showQuickProfileModal.value = true;
    } else if (task.link === '#surveyModal') {
        showSurveyModal.value = true;
    }
};

// Quick Profile Modal handlers
const closeQuickProfileModal = () => {
    showQuickProfileModal.value = false;
};

const submitQuickProfile = async () => {
    isSubmittingProfile.value = true;
    try {
        // Call API to create/update profile
        const response = await store.apiRequest('POST', '/profiles/quick-setup', {
            name: quickProfile.name,
            title: quickProfile.title,
            website: quickProfile.website
        });

        if (response.success) {
            closeQuickProfileModal();
            // Refresh progress to reflect completed task
            await store.fetchProgress(true);
            // Redirect to full profile page for additional editing
            window.location.href = '/app/profiles/guest/profile/';
        }
    } catch (error) {
        console.error('Failed to create profile:', error);
        alert('Failed to create profile. Please try again.');
    } finally {
        isSubmittingProfile.value = false;
    }
};

// Survey Modal handlers
const closeSurveyModal = () => {
    showSurveyModal.value = false;
    currentSurveyStep.value = 1;
};

const nextSurveyStep = () => {
    if (currentSurveyStep.value < totalSurveySteps) {
        currentSurveyStep.value++;
    }
};

const prevSurveyStep = () => {
    if (currentSurveyStep.value > 1) {
        currentSurveyStep.value--;
    }
};

const submitSurvey = async () => {
    isSubmittingSurvey.value = true;
    try {
        // Submit survey answers via API
        const response = await store.apiRequest('POST', '/onboarding/complete/survey', {
            answers: {
                primary_goal: surveyAnswers.goal,
                experience: surveyAnswers.experience,
                background: surveyAnswers.background,
                challenge: surveyAnswers.challenge,
                strategy: surveyAnswers.strategy
            }
        });

        if (response.success) {
            closeSurveyModal();
            // Refresh progress to reflect completed task
            await store.fetchProgress(true);
        }
    } catch (error) {
        console.error('Failed to submit survey:', error);
        alert('Failed to submit survey. Please try again.');
    } finally {
        isSubmittingSurvey.value = false;
    }
};

// Handle profile change from selector
const handleProfileChange = async (profileId) => {
    selectedProfileId.value = profileId;
    await store.setCurrentProfile(profileId);
};

// Reset to "Best Profile" view
const resetToBestProfile = async () => {
    selectedProfileId.value = null;
    await store.setCurrentProfile(null);
};

// Sorted rewards by threshold
const sortedRewards = computed(() => {
    return [...store.rewards].sort((a, b) => a.threshold - b.threshold);
});

// Check if reward is the next to unlock
const isNextReward = (reward) => {
    if (reward.unlocked) return false;
    const locked = sortedRewards.value.filter((r) => !r.unlocked);
    return locked.length > 0 && locked[0].id === reward.id;
};

// Get all tasks as flat array
const allTasks = computed(() => {
    const tasks = [];
    Object.values(store.tasksByGroup).forEach(group => {
        tasks.push(...group.tasks);
    });
    return tasks;
});

// Get time estimate for incomplete task
const getTimeEstimate = (task) => {
    // Default estimates based on task type
    const estimates = {
        profile: 'About 5 minutes',
        survey: 'About 2 minutes',
        search: 'About 1 minute',
        import: 'About 1 minute',
        pitch: 'About 3 minutes',
    };
    return estimates[task.id] || 'About 1 minute left';
};

// Initialize on mount
onMounted(async () => {
    // Get config from window if available
    if (window.gmkbOnboardingData) {
        store.setConfig({
            apiUrl: window.gmkbOnboardingData.apiUrl || '/wp-json/',
            nonce: window.gmkbOnboardingData.nonce,
        });
    } else if (window.gmkbData) {
        store.setConfig({
            apiUrl: window.gmkbData.restUrl || '/wp-json/',
            nonce: window.gmkbData.restNonce,
        });
    }

    await store.initialize();
});
</script>

<style scoped>
/* Dashboard Container - Sidebar + Main Content Layout */
.dashboard-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #f9fafb;
    color: #1e293b;
    line-height: 1.5;
}

.dashboard-container.is-loading {
    opacity: 0.7;
}

/* Sidebar Styles */
.sidebar {
    width: 320px;
    background-color: transparent;
    color: #33475b;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    height: 100vh;
    position: sticky;
    top: 0;
    border-right: 1px solid #e5e7eb;
    padding: 0;
}

/* Rewards Header */
.rewards-header {
    padding: 16px 24px;
    margin-bottom: 12px;
    background-color: #f8fafc;
    border-top: 1px solid #eaf0f6;
    border-bottom: 1px solid #eaf0f6;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.rewards-header h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #33475b;
}

.current-points {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #516f90;
    font-size: 14px;
}

.points-badge {
    background-color: #ff7a59;
    color: white;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 10px;
    font-size: 14px;
}

/* Rewards List */
.rewards-list {
    margin: 0;
    padding: 0 24px;
}

.reward-item {
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 6px;
    border: 1px solid #eaf0f6;
    display: flex;
    align-items: flex-start;
    transition: all 0.2s;
    background-color: #fff;
}

.reward-item:hover {
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.06);
    transform: translateY(-3px);
}

.reward-item.locked {
    opacity: 0.7;
}

.reward-item.next {
    border-color: #ff7a59;
    border-width: 2px;
}

.reward-link {
    text-decoration: none;
    color: inherit;
}

.reward-info {
    flex: 1;
}

.reward-points {
    font-weight: bold;
    color: #ff7a59;
    margin-bottom: 4px;
    font-size: 14px;
}

.lock-icon {
    margin-left: 4px;
    font-style: normal;
}

.reward-title {
    font-weight: 600;
    margin-bottom: 2px;
    font-size: 14px;
    color: #33475b;
}

.reward-description {
    font-size: 12px;
    color: #516f90;
    font-style: italic;
}

/* Task Checkbox/Checkmark */
.task-checkbox {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid #cbd5e1;
    margin-right: 12px;
    flex-shrink: 0;
    margin-top: 2px;
}

.task-checkmark {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #10b981 0%, #0ea5e9 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 14px;
    box-shadow: 0 2px 5px rgba(16, 185, 129, 0.3);
}

/* Sidebar CTA */
.sidebar-cta {
    padding: 20px 24px;
    margin: 16px 0 0 0;
    background-color: #f8fafc;
    border-top: 1px solid #eaf0f6;
    border-bottom: 1px solid #eaf0f6;
}

.sidebar-cta h2 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #33475b;
}

.sidebar-cta p {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 16px;
    color: #516f90;
}

.cta-button {
    display: inline-block;
    background-color: #ff7a59;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
    text-align: center;
    width: 100%;
    transition: background-color 0.2s ease;
    border: none;
    cursor: pointer;
}

.cta-button:hover {
    background-color: #ff8f73;
}

.sidebar-spacer {
    flex: 1;
}

.sidebar-bottom {
    padding: 16px 24px;
    margin-top: auto;
    border-top: 1px solid #eaf0f6;
}

.sidebar-link {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #516f90;
    text-decoration: none;
    margin-bottom: 14px;
    transition: color 0.2s ease;
}

.sidebar-link:hover {
    color: #33475b;
}

.sidebar-link span {
    margin-right: 8px;
}

/* Main Content */
.main-content {
    flex: 1;
    padding: 40px;
    max-width: 900px;
    margin: 0 auto;
}

/* Loading */
.loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
}

.loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e2e8f0;
    border-top-color: #14b8a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Error Banner */
.error-banner {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.error-banner p {
    color: #dc2626;
    margin: 0;
}

/* Profile Context Section */
.profile-context-section {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
}

.profile-context-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
}

.profile-context-label {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
}

.profile-context-controls {
    display: flex;
    align-items: center;
    gap: 8px;
}

.profile-context-select {
    padding: 8px 32px 8px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #1e293b;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 8px center;
    background-repeat: no-repeat;
    background-size: 16px;
    min-width: 200px;
}

.profile-context-select:focus {
    outline: none;
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.15);
}

.profile-context-reset {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: white;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s ease;
}

.profile-context-reset:hover {
    background: #f1f5f9;
    color: #1e293b;
    border-color: #94a3b8;
}

.profile-context-hint {
    margin: 12px 0 0 0;
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
}

.profile-context-hint strong {
    color: #14b8a6;
    font-weight: 600;
}

/* Progress Profile Badge */
.progress-profile-badge {
    font-size: 12px;
    font-weight: 600;
    color: #14b8a6;
    background: rgba(20, 184, 166, 0.1);
    padding: 4px 10px;
    border-radius: 12px;
}

.progress-profile-badge--single {
    color: #64748b;
    background: rgba(100, 116, 139, 0.1);
}

/* Progress Section */
.progress-section {
    margin-bottom: 35px;
}

.progress-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
}

.progress-title {
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
}

.progress-bar-container {
    height: 20px;
    background-color: #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 8px;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #0ea5e9 100%);
    border-radius: 10px;
    transition: width 0.5s ease;
}

.progress-stats-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.progress-points,
.progress-percentage {
    font-weight: 600;
    color: #333;
    font-size: 14px;
}

.toggle-details-link {
    display: inline-block;
    font-size: 14px;
    color: #007bff;
    cursor: pointer;
    text-decoration: none;
    margin-bottom: 8px;
}

.toggle-details-link:hover {
    text-decoration: underline;
}

/* Progress Breakdown Table */
.progress-container {
    font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    max-width: 800px;
    margin: 16px auto 0;
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 20px;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e5e7eb;
}

.progress-table {
    width: 100%;
    border-collapse: collapse;
}

.progress-table th {
    text-align: left;
    padding: 10px 8px;
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
    border-bottom: 2px solid #e5e7eb;
}

.progress-table th:nth-child(2) {
    text-align: center;
}

.progress-table th:last-child {
    text-align: right;
}

.progress-table tr {
    border-bottom: 1px solid #f0f0f0;
}

.progress-table tr:last-child {
    border-bottom: none;
}

.progress-table td {
    padding: 10px 8px;
    font-size: 14px;
    vertical-align: middle;
}

.progress-table td:first-child {
    width: 40%;
    font-weight: 500;
    color: #4b5563;
}

.progress-table td:nth-child(2) {
    text-align: center;
    width: 20%;
}

.progress-table td:last-child {
    text-align: right;
    width: 40%;
}

.check-icon {
    color: #10b981;
    font-weight: bold;
    margin-right: 4px;
}

.x-icon {
    color: #ef4444;
    font-weight: bold;
    margin-right: 4px;
}

.status-complete {
    color: #10b981;
}

.status-incomplete {
    color: #ef4444;
}

.summary-section {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 2px solid #e5e7eb;
    background-color: #f9fafb;
}

.summary-section td {
    font-weight: 600;
}

/* Task Cards */
.task-card {
    background-color: white;
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 25px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    transition: all 0.3s ease;
    border: 1px solid #f1f5f9;
}

.task-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
}

.task-card-header {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
}

.task-card-icon {
    margin-right: 18px;
    flex-shrink: 0;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f1f5f9;
    border-radius: 12px;
}

.icon-emoji {
    font-size: 32px;
}

.task-card-title {
    font-size: 18px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.4;
    margin: 0;
}

/* Task Items */
.task-item {
    display: flex;
    margin-bottom: 24px;
    align-items: flex-start;
    padding-bottom: 24px;
    border-bottom: 1px solid #f1f5f9;
    transition: all 0.2s ease;
}

.task-item:hover {
    background-color: #f8fafc;
    padding-left: 8px;
    padding-right: 8px;
    margin-left: -8px;
    margin-right: -8px;
    border-radius: 8px;
}

.task-item:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
}

.task-content {
    flex: 1;
}

.task-title {
    font-size: 16px;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 10px;
}

.task-title a {
    color: #0066c0;
    text-decoration: none;
    transition: color 0.2s ease;
    font-size: 16px;
    font-weight: 600;
}

.task-title a:hover {
    text-decoration: underline;
    color: #004080;
}

.task-description {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 15px;
    line-height: 1.6;
}

.task-progress-container {
    display: flex;
    align-items: center;
}

.task-progress-bar {
    flex: 1;
    height: 6px;
    background-color: #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
    margin-right: 12px;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.task-progress {
    height: 100%;
    background: linear-gradient(90deg, #10b981 0%, #0ea5e9 100%);
    border-radius: 10px;
    transition: width 0.3s ease;
}

.task-time-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    min-width: 130px;
}

.task-percentage {
    font-size: 12px;
    color: #10b981;
    font-weight: 600;
    margin-bottom: 2px;
}

.task-time {
    font-size: 13px;
    color: #64748b;
    white-space: nowrap;
    text-align: right;
    font-weight: 500;
}

/* Responsive Styles */
@media (max-width: 900px) {
    .dashboard-container {
        flex-direction: column;
    }

    .sidebar {
        width: 100%;
        height: auto;
        position: relative;
    }

    .main-content {
        width: 100%;
        padding: 20px;
    }

    .sidebar-bottom {
        display: flex;
        justify-content: space-around;
    }

    .sidebar-link {
        margin-bottom: 0;
        margin-right: 20px;
    }
}

@media (max-width: 600px) {
    .task-card {
        padding: 20px;
    }

    .task-card-icon {
        width: 45px;
        height: 45px;
    }

    .task-card-title {
        font-size: 16px;
    }

    .task-title,
    .task-title a {
        font-size: 15px;
    }

    .task-description {
        font-size: 13px;
    }

    .task-time,
    .task-percentage {
        font-size: 12px;
        min-width: 100px;
    }
}

/* External Link Icon */
.task-external-icon {
    font-size: 11px;
    margin-left: 4px;
    opacity: 0.6;
}

/* ============================================
   Modal Styles
   ============================================ */

.onboarding-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
}

.onboarding-modal {
    background: white;
    border-radius: 16px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.onboarding-modal--survey {
    max-width: 560px;
}

.onboarding-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
}

.onboarding-modal__title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1e293b;
}

.onboarding-modal__icon {
    font-size: 24px;
}

.onboarding-modal__close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: #f1f5f9;
    border: none;
    border-radius: 8px;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s ease;
}

.onboarding-modal__close:hover {
    background: #e2e8f0;
    color: #1e293b;
}

.onboarding-modal__body {
    padding: 24px;
}

.onboarding-modal__intro {
    margin: 0 0 24px 0;
    font-size: 15px;
    color: #64748b;
    line-height: 1.6;
}

.onboarding-modal__footer-note {
    margin: 20px 0 0 0;
    padding-top: 16px;
    border-top: 1px solid #e5e7eb;
    font-size: 13px;
    color: #94a3b8;
    text-align: center;
}

/* Quick Profile Form */
.quick-profile-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
}

.form-group input {
    padding: 12px 14px;
    font-size: 15px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    transition: all 0.15s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #ff7a59;
    box-shadow: 0 0 0 3px rgba(255, 122, 89, 0.15);
}

.form-group input::placeholder {
    color: #9ca3af;
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 8px;
}

.btn-primary {
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 500;
    color: white;
    background: #ff7a59;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-primary:hover:not(:disabled) {
    background: #ff8f73;
}

.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-secondary {
    padding: 12px 24px;
    font-size: 15px;
    font-weight: 500;
    color: #64748b;
    background: #f1f5f9;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.btn-secondary:hover {
    background: #e2e8f0;
    color: #1e293b;
}

/* Survey Styles */
.survey-progress {
    margin-bottom: 24px;
}

.survey-progress__bar {
    height: 6px;
    background: #e5e7eb;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
}

.survey-progress__fill {
    height: 100%;
    background: linear-gradient(90deg, #ff7a59, #ff9a80);
    border-radius: 3px;
    transition: width 0.3s ease;
}

.survey-progress__text {
    font-size: 13px;
    color: #64748b;
}

.survey-step {
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateX(10px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.survey-question {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.4;
}

.survey-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.survey-option {
    display: flex;
    align-items: center;
    padding: 14px 16px;
    background: #f8fafc;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.survey-option:hover {
    border-color: #ff7a59;
    background: #fff5f3;
}

.survey-option input[type="radio"] {
    width: 18px;
    height: 18px;
    margin: 0;
    margin-right: 12px;
    accent-color: #ff7a59;
}

.survey-option input[type="radio"]:checked + .survey-option__label {
    color: #ff7a59;
    font-weight: 500;
}

.survey-option:has(input:checked) {
    border-color: #ff7a59;
    background: #fff5f3;
}

.survey-option__label {
    font-size: 15px;
    color: #374151;
    line-height: 1.4;
}

.survey-nav {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
}

.survey-nav__spacer {
    flex: 1;
}
</style>
