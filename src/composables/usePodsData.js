import { computed } from 'vue';
import { useMediaKitStore } from '../stores/mediaKit';

/**
 * Composable for accessing Pods data from the store
 * This ensures NO N+1 queries - data is fetched ONCE on store initialization
 * All components access data through computed refs pointing to the store
 * 
 * ROOT CAUSE FIX: No direct API calls, no polling, just reactive store access
 */
export function usePodsData() {
  const store = useMediaKitStore();

  // NO onMounted, NO fetch - just computed refs to store data
  // Data was already fetched ONCE in store.initialize()

  return {
    // Basic fields
    biography: computed(() => store.podsData?.biography || ''),
    firstName: computed(() => store.podsData?.first_name || ''),
    lastName: computed(() => store.podsData?.last_name || ''),
    email: computed(() => store.podsData?.email || ''),
    phone: computed(() => store.podsData?.phone || ''),
    website: computed(() => store.podsData?.website || ''),
    company: computed(() => store.podsData?.company || ''),
    position: computed(() => store.podsData?.position || ''),
    location: computed(() => store.podsData?.location || ''),
    tagline: computed(() => store.podsData?.tagline || ''),
    
    // Social media
    twitter: computed(() => store.podsData?.twitter || ''),
    linkedin: computed(() => store.podsData?.linkedin || ''),
    facebook: computed(() => store.podsData?.facebook || ''),
    instagram: computed(() => store.podsData?.instagram || ''),
    youtube: computed(() => store.podsData?.youtube || ''),
    
    // Images
    headshotUrl: computed(() => store.podsData?.guest_headshot || ''),
    logoUrl: computed(() => store.podsData?.company_logo || ''),
    
    // Topics - dynamically collect all topic fields
    topics: computed(() => {
      const topics = [];
      for (let i = 1; i <= 10; i++) {
        const topic = store.podsData?.[`topic_${i}`];
        if (topic && topic.trim()) {
          topics.push({
            id: `topic_${i}`,
            text: topic,
            index: i
          });
        }
      }
      return topics;
    }),
    
    // Questions - dynamically collect all question fields
    questions: computed(() => {
      const questions = [];
      for (let i = 1; i <= 10; i++) {
        const question = store.podsData?.[`question_${i}`];
        if (question && question.trim()) {
          questions.push({
            id: `question_${i}`,
            text: question,
            index: i
          });
        }
      }
      return questions;
    }),
    
    // Statistics
    stats: computed(() => ({
      downloads: store.podsData?.podcast_downloads || '',
      episodes: store.podsData?.podcast_episodes || '',
      followers: store.podsData?.social_followers || '',
      subscribers: store.podsData?.email_subscribers || ''
    })),
    
    // Full name helper
    fullName: computed(() => {
      const first = store.podsData?.first_name || '';
      const last = store.podsData?.last_name || '';
      return `${first} ${last}`.trim() || 'Guest Name';
    }),
    
    // Check if Pods data is available
    hasPodsData: computed(() => {
      return store.podsData && Object.keys(store.podsData).length > 0;
    }),
    
    // Get raw pods data (for debugging or custom access)
    rawPodsData: computed(() => store.podsData || {}),
    
    // Helper to get any pods field by key
    getPodsField: (fieldName) => {
      return computed(() => store.podsData?.[fieldName] || '');
    }
  };
}
