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

  /**
   * ARCHITECTURE FIX: Update individual Pods field
   * This is the single source of truth for content updates
   */
  const updatePodsField = async (fieldName, value) => {
    try {
      console.log(`📝 Updating Pods field: ${fieldName} = ${value}`);
      
      // CRITICAL: Update store immediately (optimistic update)
      if (!store.podsData) {
        store.podsData = {};
      }
      store.podsData[fieldName] = value;
      
      // Make API call to save to WordPress
      const formData = new FormData();
      formData.append('action', 'gmkb_update_pods_field');
      formData.append('nonce', window.gmkbData?.nonce || '');
      formData.append('post_id', store.postId || '');
      formData.append('field_name', fieldName);
      formData.append('field_value', value);
      
      const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.data?.message || 'Failed to update Pods field');
      }
      
      console.log(`✅ Pods field updated: ${fieldName}`);
      
      // Dispatch event for other components to react
      document.dispatchEvent(new CustomEvent('gmkb:pods-field-updated', {
        detail: { fieldName, value }
      }));
      
      return result;
      
    } catch (error) {
      console.error(`❌ Failed to update Pods field ${fieldName}:`, error);
      
      // Revert optimistic update on error
      if (store.podsData && store.podsData[fieldName] === value) {
        delete store.podsData[fieldName];
      }
      
      throw error;
    }
  };

  return {
    // Basic information
    biography: computed(() => store.podsData?.biography || ''),
    introduction: computed(() => store.podsData?.introduction || ''),
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
    
    // Social media links - ARCHITECTURE FIX: Map actual Pods field names
    socialLinks: computed(() => ({
      twitter: store.podsData?.['1_twitter'] || '',
      facebook: store.podsData?.['1_facebook'] || '',
      instagram: store.podsData?.['1_instagram'] || '',
      linkedin: store.podsData?.['1_linkedin'] || '',
      youtube: store.podsData?.guest_youtube || '',
      tiktok: store.podsData?.['1_tiktok'] || '',
      pinterest: store.podsData?.['1_pinterest'] || '',
      website: store.podsData?.['1_website'] || store.podsData?.['2_website'] || ''
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
    
    // ROOT FIX: Add individual contact fields for direct access (using actual Pods field names)
    website: computed(() => store.podsData?.['1_website'] || store.podsData?.['2_website'] || ''),
    address: computed(() => store.podsData?.address || ''),
    twitter: computed(() => store.podsData?.['1_twitter'] || ''),
    facebook: computed(() => store.podsData?.['1_facebook'] || ''),
    instagram: computed(() => store.podsData?.['1_instagram'] || ''),
    linkedin: computed(() => store.podsData?.['1_linkedin'] || ''),
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
    
    // ROOT FIX: Add individual logo/media fields for direct access
    personalBrandLogo: computed(() => store.podsData?.personal_brand_logo || ''),
    companyLogo: computed(() => store.podsData?.company_logo || ''),
    featuredLogos: computed(() => store.podsData?.featured_logos || []),
    profilePhoto: computed(() => store.podsData?.profile_photo || ''),
    galleryPhotos: computed(() => store.podsData?.gallery_photos || []),
    videoIntro: computed(() => store.podsData?.video_intro || ''),
    
    // Helper method to get any pods field
    getField: (fieldName) => computed(() => store.podsData?.[fieldName] || ''),
    
    // Check if pods data is loaded
    isLoaded: computed(() => Object.keys(store.podsData || {}).length > 0),
    
    // Get all pods data (for debugging)
    allData: computed(() => store.podsData),
    
    // ARCHITECTURE FIX: Method to update Pods fields
    updatePodsField
  };
}
