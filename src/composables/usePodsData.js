/**
 * PHASE 3: Optimized Pods data composable
 * No API calls - just computed refs to store data
 */
import { computed } from 'vue';
import { useMediaKitStore } from '../stores/mediaKit';

export function usePodsData() {
  const store = useMediaKitStore();

  // NO onMounted, NO fetch - just computed refs to store data
  // Data was already fetched ONCE in store.initialize()

  return {
    // Basic information
    biography: computed(() => store.podsData?.biography || ''),
    firstName: computed(() => store.podsData?.first_name || ''),
    lastName: computed(() => store.podsData?.last_name || ''),
    email: computed(() => store.podsData?.email || ''),
    phone: computed(() => store.podsData?.phone || ''),
    
    // Full name computed
    fullName: computed(() => {
      const first = store.podsData?.first_name || '';
      const last = store.podsData?.last_name || '';
      return `${first} ${last}`.trim();
    }),
    
    // Topics array
    topics: computed(() => {
      const topics = [];
      for (let i = 1; i <= 10; i++) {
        if (store.podsData?.[`topic_${i}`]) {
          topics.push({
            id: `topic_${i}`,
            text: store.podsData[`topic_${i}`]
          });
        }
      }
      return topics;
    }),
    
    // Questions array
    questions: computed(() => {
      const questions = [];
      for (let i = 1; i <= 10; i++) {
        if (store.podsData?.[`question_${i}`]) {
          questions.push({
            id: `question_${i}`,
            text: store.podsData[`question_${i}`]
          });
        }
      }
      return questions;
    }),
    
    // Social media links
    socialLinks: computed(() => ({
      twitter: store.podsData?.twitter || '',
      facebook: store.podsData?.facebook || '',
      instagram: store.podsData?.instagram || '',
      linkedin: store.podsData?.linkedin || '',
      youtube: store.podsData?.youtube || '',
      website: store.podsData?.website || ''
    })),
    
    // Professional information
    professional: computed(() => ({
      title: store.podsData?.professional_title || '',
      company: store.podsData?.company || '',
      industry: store.podsData?.industry || '',
      expertise: store.podsData?.expertise || ''
    })),
    
    // ROOT FIX: Add individual professional fields for direct access
    position: computed(() => store.podsData?.professional_title || store.podsData?.position || ''),
    company: computed(() => store.podsData?.company || ''),
    
    // ROOT FIX: Add individual contact fields for direct access
    website: computed(() => store.podsData?.website || ''),
    address: computed(() => store.podsData?.address || ''),
    twitter: computed(() => store.podsData?.twitter || ''),
    facebook: computed(() => store.podsData?.facebook || ''),
    instagram: computed(() => store.podsData?.instagram || ''),
    linkedin: computed(() => store.podsData?.linkedin || ''),
    headshot: computed(() => store.podsData?.guest_headshot || ''),
    
    // ROOT FIX: Add stats object for authority components
    stats: computed(() => ({
      downloads: store.podsData?.downloads || store.podsData?.podcast_downloads || null,
      episodes: store.podsData?.episodes || store.podsData?.episode_count || null,
      followers: store.podsData?.followers || store.podsData?.social_followers || null,
      subscribers: store.podsData?.subscribers || store.podsData?.email_subscribers || null,
      years_experience: store.podsData?.years_experience || null
    })),
    
    // Media assets
    media: computed(() => ({
      headshot: store.podsData?.guest_headshot || '',
      logo: store.podsData?.company_logo || '',
      gallery: store.podsData?.photo_gallery || []
    })),
    
    // Helper method to get any pods field
    getField: (fieldName) => computed(() => store.podsData?.[fieldName] || ''),
    
    // Check if pods data is loaded
    isLoaded: computed(() => Object.keys(store.podsData || {}).length > 0),
    
    // Get all pods data (for debugging)
    allData: computed(() => store.podsData)
  };
}
