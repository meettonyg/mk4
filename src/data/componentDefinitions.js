/**
 * Single Source of Truth for Component Definitions
 * This replaces all scattered component lists throughout the codebase
 */

export const componentCategories = {
  essential: 'Essential',
  content: 'Content',
  media: 'Media',
  engagement: 'Engagement',
  premium: 'Premium'
};

export const componentDefinitions = [
  // Essential Components
  {
    type: 'hero',
    name: 'Hero Section',
    description: 'Eye-catching hero section with title, subtitle, and image',
    category: 'essential',
    icon: 'hero',
    isPremium: false,
    defaultData: {
      title: 'Your Name',
      subtitle: 'Your Tagline',
      backgroundImage: ''
    }
  },
  {
    type: 'biography',
    name: 'Biography',
    description: 'Professional biography with rich text formatting',
    category: 'essential',
    icon: 'user',
    isPremium: false,
    defaultData: {
      title: 'About Me',
      content: '',
      image: ''
    }
  },
  {
    type: 'topics',
    name: 'Topics',
    description: 'List of speaking or expertise topics',
    category: 'essential',
    icon: 'list',
    isPremium: false,
    defaultData: {
      title: 'Topics',
      topics: []
    }
  },
  {
    type: 'contact',
    name: 'Contact',
    description: 'Contact information and form',
    category: 'essential',
    icon: 'mail',
    isPremium: false,
    defaultData: {
      title: 'Get in Touch',
      email: '',
      phone: '',
      showForm: true
    }
  },
  
  // Content Components
  {
    type: 'questions',
    name: 'Questions/FAQ',
    description: 'Frequently asked questions section',
    category: 'content',
    icon: 'help-circle',
    isPremium: false,
    defaultData: {
      title: 'Frequently Asked Questions',
      questions: []
    }
  },
  {
    type: 'testimonials',
    name: 'Testimonials',
    description: 'Client testimonials and reviews',
    category: 'content',
    icon: 'message-circle',
    isPremium: false,
    defaultData: {
      title: 'What People Say',
      testimonials: []
    }
  },
  {
    type: 'authority-hook',
    name: 'Authority Hook',
    description: 'Build credibility with achievements and credentials',
    category: 'content',
    icon: 'award',
    isPremium: false,
    defaultData: {
      title: 'Why Choose Me',
      points: []
    }
  },
  {
    type: 'guest-intro',
    name: 'Guest Introduction',
    description: 'Professional introduction for guest appearances',
    category: 'content',
    icon: 'users',
    isPremium: false,
    defaultData: {
      title: 'Guest Introduction',
      content: ''
    }
  },
  
  // Media Components
  {
    type: 'social',
    name: 'Social Media',
    description: 'Social media links and icons',
    category: 'media',
    icon: 'share-2',
    isPremium: false,
    defaultData: {
      title: 'Connect With Me',
      profiles: []
    }
  },
  {
    type: 'logo-grid',
    name: 'Logo Grid',
    description: 'Display client or partner logos',
    category: 'media',
    icon: 'grid',
    isPremium: false,
    defaultData: {
      title: 'Featured In',
      logos: []
    }
  },
  {
    type: 'stats',
    name: 'Statistics',
    description: 'Key numbers and achievements',
    category: 'media',
    icon: 'bar-chart',
    isPremium: false,
    defaultData: {
      title: 'By The Numbers',
      stats: []
    }
  },
  
  // Engagement Components
  {
    type: 'call-to-action',
    name: 'Call to Action',
    description: 'Compelling CTA section with buttons',
    category: 'engagement',
    icon: 'arrow-right',
    isPremium: false,
    defaultData: {
      title: 'Ready to Get Started?',
      description: '',
      primaryButton: { text: 'Get Started', url: '#' },
      secondaryButton: null
    }
  },
  
  // Premium Components
  {
    type: 'video-intro',
    name: 'Video Introduction',
    description: 'Embedded video player for introductions',
    category: 'premium',
    icon: 'video',
    isPremium: true,
    defaultData: {
      title: 'Watch My Introduction',
      videoUrl: '',
      thumbnail: ''
    }
  },
  {
    type: 'photo-gallery',
    name: 'Photo Gallery',
    description: 'Image gallery with lightbox',
    category: 'premium',
    icon: 'image',
    isPremium: true,
    defaultData: {
      title: 'Photo Gallery',
      images: []
    }
  },
  {
    type: 'podcast-player',
    name: 'Podcast Player',
    description: 'Embedded podcast or audio player',
    category: 'premium',
    icon: 'headphones',
    isPremium: true,
    defaultData: {
      title: 'Listen to My Podcast',
      episodes: []
    }
  },
  {
    type: 'booking-calendar',
    name: 'Booking Calendar',
    description: 'Calendar for scheduling and availability',
    category: 'premium',
    icon: 'calendar',
    isPremium: true,
    defaultData: {
      title: 'Book a Meeting',
      calendarUrl: ''
    }
  }
];

// Helper functions
export function getComponentByType(type) {
  return componentDefinitions.find(c => c.type === type);
}

export function getComponentsByCategory(category) {
  if (category === 'all') return componentDefinitions;
  return componentDefinitions.filter(c => c.category === category);
}

export function getPremiumComponents() {
  return componentDefinitions.filter(c => c.isPremium);
}

export function getFreeComponents() {
  return componentDefinitions.filter(c => !c.isPremium);
}

// Icon mapping for consistent icons across the app
export const componentIcons = {
  hero: 'layout',
  user: 'user',
  list: 'list',
  mail: 'mail',
  'help-circle': 'help-circle',
  'message-circle': 'message-circle',
  award: 'award',
  users: 'users',
  'share-2': 'share-2',
  grid: 'grid',
  'bar-chart': 'bar-chart',
  'arrow-right': 'arrow-right',
  video: 'video',
  image: 'image',
  headphones: 'headphones',
  calendar: 'calendar',
  layout: 'layout'
};

// Export as default for easy importing
export default componentDefinitions;
