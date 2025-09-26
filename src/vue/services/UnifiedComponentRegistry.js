/**
 * Unified Component Registry
 * Provides component metadata and configuration for the component library
 */

class UnifiedComponentRegistry {
  constructor() {
    this.components = this.initializeComponents();
    this.categories = this.initializeCategories();
  }

  initializeCategories() {
    return [
      { slug: 'content', name: 'Content' },
      { slug: 'social', name: 'Contact & Social' },
      { slug: 'proof', name: 'Social Proof' },
      { slug: 'conversion', name: 'Conversion' },
      { slug: 'media', name: 'Media' }
    ];
  }

  initializeComponents() {
    return [
      // Content components
      {
        type: 'hero',
        name: 'Hero Section',
        description: 'Eye-catching introduction with name, title, and call-to-action',
        category: 'content',
        icon: 'layout',
        isPremium: false,
        defaultData: {
          heading: 'Welcome to My Media Kit',
          subheading: 'Professional Speaker & Author',
          buttonText: 'Get in Touch',
          buttonUrl: '#contact'
        }
      },
      {
        type: 'biography',
        name: 'Biography',
        description: 'Detailed bio with image and formatted text',
        category: 'content',
        icon: 'user',
        isPremium: false,
        defaultData: {
          title: 'About Me',
          content: 'Your professional biography goes here...',
          imageUrl: ''
        }
      },
      {
        type: 'topics',
        name: 'Speaking Topics',
        description: 'List of expertise areas and speaking topics',
        category: 'content',
        icon: 'list',
        isPremium: false,
        defaultData: {
          title: 'Topics I Cover',
          topics: [
            { id: 1, text: 'Leadership Development' },
            { id: 2, text: 'Innovation & Technology' },
            { id: 3, text: 'Team Building' }
          ]
        }
      },
      {
        type: 'questions',
        name: 'Interview Questions',
        description: 'Suggested questions for interviews',
        category: 'content',
        icon: 'help-circle',
        isPremium: false,
        defaultData: {
          title: 'Interview Questions',
          questions: [
            'What inspired you to start your journey?',
            'What are the key challenges in your industry?',
            'What advice would you give to beginners?'
          ]
        }
      },
      {
        type: 'guest-intro',
        name: 'Guest Introduction',
        description: 'Professional introduction for event hosts',
        category: 'content',
        icon: 'user',
        isPremium: false,
        defaultData: {
          title: 'Guest Introduction',
          intro: 'Please welcome our distinguished guest...'
        }
      },

      // Contact & Social
      {
        type: 'contact',
        name: 'Contact Information',
        description: 'Contact details and booking information',
        category: 'social',
        icon: 'mail',
        isPremium: false,
        defaultData: {
          title: 'Get in Touch',
          email: 'hello@example.com',
          phone: '+1 (555) 123-4567',
          website: 'www.example.com'
        }
      },
      {
        type: 'social',
        name: 'Social Media Links',
        description: 'Links to all social media profiles',
        category: 'social',
        icon: 'share-2',
        isPremium: false,
        defaultData: {
          title: 'Connect With Me',
          profiles: {
            twitter: '',
            linkedin: '',
            instagram: '',
            facebook: ''
          }
        }
      },

      // Social Proof
      {
        type: 'testimonials',
        name: 'Testimonials',
        description: 'Client testimonials and reviews',
        category: 'proof',
        icon: 'message-circle',
        isPremium: false,
        defaultData: {
          title: 'What People Say',
          testimonials: [
            {
              text: 'An incredible speaker who captivated our audience!',
              author: 'Jane Doe',
              role: 'Event Organizer'
            }
          ]
        }
      },
      {
        type: 'stats',
        name: 'Statistics',
        description: 'Key numbers and achievements',
        category: 'proof',
        icon: 'trending-up',
        isPremium: false,
        defaultData: {
          title: 'By The Numbers',
          stats: [
            { number: '100+', label: 'Speaking Engagements' },
            { number: '50K', label: 'Audience Reached' },
            { number: '5', label: 'Books Published' }
          ]
        }
      },
      {
        type: 'authority-hook',
        name: 'Authority Builder',
        description: 'Establish credibility with achievements',
        category: 'proof',
        icon: 'award',
        isPremium: true,
        defaultData: {
          title: 'Credentials & Achievements',
          items: [
            'PhD in Computer Science',
            'TEDx Speaker',
            'Best-selling Author'
          ]
        }
      },
      {
        type: 'logo-grid',
        name: 'Client Logos',
        description: 'Showcase logos of past clients',
        category: 'proof',
        icon: 'grid',
        isPremium: false,
        defaultData: {
          title: 'Trusted By',
          logos: []
        }
      },

      // Conversion
      {
        type: 'call-to-action',
        name: 'Call to Action',
        description: 'Prominent button or action prompt',
        category: 'conversion',
        icon: 'zap',
        isPremium: false,
        defaultData: {
          heading: 'Ready to Book?',
          description: 'Let\'s discuss your next event',
          buttonText: 'Book Now',
          buttonUrl: '#booking'
        }
      },
      {
        type: 'booking-calendar',
        name: 'Booking Calendar',
        description: 'Interactive calendar for scheduling',
        category: 'conversion',
        icon: 'calendar',
        isPremium: true,
        defaultData: {
          title: 'Book a Speaking Engagement',
          calendarUrl: ''
        }
      },

      // Media
      {
        type: 'video-intro',
        name: 'Video Introduction',
        description: 'Embedded video player for intro video',
        category: 'media',
        icon: 'video',
        isPremium: false,
        defaultData: {
          title: 'Watch My Introduction',
          videoUrl: '',
          thumbnail: ''
        }
      },
      {
        type: 'photo-gallery',
        name: 'Photo Gallery',
        description: 'Gallery of professional photos',
        category: 'media',
        icon: 'image',
        isPremium: false,
        defaultData: {
          title: 'Photo Gallery',
          images: []
        }
      },
      {
        type: 'podcast-player',
        name: 'Podcast Episodes',
        description: 'Embed podcast episodes',
        category: 'media',
        icon: 'mic',
        isPremium: true,
        defaultData: {
          title: 'Listen to My Podcast',
          episodes: []
        }
      }
    ];
  }

  getAll() {
    return this.components;
  }

  get(type) {
    return this.components.find(c => c.type === type);
  }

  getByCategory(category) {
    return this.components.filter(c => c.category === category);
  }

  getCategories() {
    return this.categories;
  }

  getDefaultProps(type) {
    const component = this.get(type);
    return component ? component.defaultData : {};
  }

  getAvailableTypes() {
    return this.components.map(c => c.type);
  }
}

// Export singleton instance
export default new UnifiedComponentRegistry();
