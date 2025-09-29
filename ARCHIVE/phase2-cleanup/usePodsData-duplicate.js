import { computed } from 'vue';
import { useMediaKitStore } from '../../stores/mediaKit';

/**
 * Composable for accessing Pods data from the store
 * NO API CALLS - data is already loaded in store.initialize()
 */
export function usePodsData() {
  const store = useMediaKitStore();

  // NO onMounted, NO fetch - just computed refs to store data
  // Data was already fetched ONCE in store.initialize()

  return {
    biography: computed(() => store.podsData?.biography || ''),
    firstName: computed(() => store.podsData?.first_name || ''),
    lastName: computed(() => store.podsData?.last_name || ''),
    email: computed(() => store.podsData?.email || ''),
    phone: computed(() => store.podsData?.phone || ''),
    tagline: computed(() => store.podsData?.tagline || ''),
    guestHeadshot: computed(() => store.podsData?.guest_headshot || ''),
    companyName: computed(() => store.podsData?.company_name || ''),
    jobTitle: computed(() => store.podsData?.job_title || ''),
    website: computed(() => store.podsData?.website || ''),
    
    topics: computed(() => {
      const topics = [];
      for (let i = 1; i <= 5; i++) {
        if (store.podsData?.[`topic_${i}`]) {
          topics.push(store.podsData[`topic_${i}`]);
        }
      }
      return topics;
    }),
    
    questions: computed(() => {
      const questions = [];
      for (let i = 1; i <= 10; i++) {
        if (store.podsData?.[`question_${i}`]) {
          questions.push(store.podsData[`question_${i}`]);
        }
      }
      return questions;
    }),
    
    socialLinks: computed(() => ({
      twitter: store.podsData?.twitter || '',
      facebook: store.podsData?.facebook || '',
      linkedin: store.podsData?.linkedin || '',
      instagram: store.podsData?.instagram || '',
      youtube: store.podsData?.youtube || ''
    })),
    
    // Helper function to get full name
    fullName: computed(() => {
      const first = store.podsData?.first_name || '';
      const last = store.podsData?.last_name || '';
      return `${first} ${last}`.trim();
    }),
    
    // Check if we have Pods data
    hasPodsData: computed(() => {
      return store.podsData && Object.keys(store.podsData).length > 0;
    })
  };
}
