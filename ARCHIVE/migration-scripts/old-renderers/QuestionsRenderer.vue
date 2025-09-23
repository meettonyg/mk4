<template>
  <div class="gmkb-questions-component" :data-component-id="componentId">
    <div class="questions-container">
      <h2 v-if="title" class="questions-title">{{ title }}</h2>
      <p v-if="description" class="questions-description">{{ description }}</p>
      
      <div class="questions-list">
        <div
          v-for="(qa, index) in questions"
          :key="index"
          class="question-item"
        >
          <button
            @click="toggleQuestion(index)"
            class="question-header"
          >
            <span class="question-text">{{ qa.question }}</span>
            <span class="question-toggle" :class="{ open: openQuestions.includes(index) }">
              {{ openQuestions.includes(index) ? '−' : '+' }}
            </span>
          </button>
          
          <transition name="answer">
            <div v-if="openQuestions.includes(index)" class="question-answer">
              <p>{{ qa.answer }}</p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionsRenderer',
  props: {
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      openQuestions: []
    }
  },
  computed: {
    title() {
      return this.data.title || 'Frequently Asked Questions'
    },
    description() {
      return this.data.description || ''
    },
    questions() {
      // Handle array format
      if (Array.isArray(this.data.questions)) {
        return this.data.questions
      }
      
      // Build from individual question fields
      const questionsList = []
      for (let i = 1; i <= 10; i++) {
        if (this.data[`question_${i}`] && this.data[`answer_${i}`]) {
          questionsList.push({
            question: this.data[`question_${i}`],
            answer: this.data[`answer_${i}`]
          })
        }
      }
      
      return questionsList.length ? questionsList : this.getDefaultQuestions()
    }
  },
  methods: {
    toggleQuestion(index) {
      const idx = this.openQuestions.indexOf(index)
      if (idx > -1) {
        this.openQuestions.splice(idx, 1)
      } else {
        this.openQuestions.push(index)
      }
    },
    getDefaultQuestions() {
      return [
        {
          question: "What topics do you speak about?",
          answer: "I specialize in leadership, innovation, and digital transformation topics."
        },
        {
          question: "What are your speaking fees?",
          answer: "Fees vary depending on the event type, location, and requirements. Please contact me for a custom quote."
        }
      ]
    }
  }
}
</script>

<style scoped>
.gmkb-questions-component {
  padding: 2rem;
  background: var(--gmkb-color-surface, #fff);
}

.questions-container {
  max-width: 800px;
  margin: 0 auto;
}

.questions-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-xl, 2rem);
  margin-bottom: 1rem;
}

.questions-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  margin-bottom: 2rem;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-item {
  background: var(--gmkb-color-background, #f8f9fa);
  border-radius: var(--gmkb-border-radius, 8px);
  overflow: hidden;
}

.question-header {
  width: 100%;
  padding: 1.25rem;
  background: none;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  text-align: left;
  transition: background 0.3s ease;
}

.question-header:hover {
  background: rgba(0, 0, 0, 0.03);
}

.question-text {
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-lg, 1.125rem);
  font-weight: 600;
  flex: 1;
}

.question-toggle {
  color: var(--gmkb-color-primary, #007cba);
  font-size: 1.5rem;
  font-weight: 300;
  transition: transform 0.3s ease;
}

.question-toggle.open {
  transform: rotate(180deg);
}

.question-answer {
  padding: 0 1.25rem 1.25rem;
}

.question-answer p {
  color: var(--gmkb-color-text-light, #666);
  line-height: var(--gmkb-line-height-base, 1.6);
}

/* Transition */
.answer-enter-active, .answer-leave-active {
  transition: all 0.3s ease;
}

.answer-enter-from, .answer-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
