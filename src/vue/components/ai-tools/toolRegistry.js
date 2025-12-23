/**
 * AI Tools Registry
 *
 * Single source of truth for all AI generator tools.
 * Used by ToolDirectoryPage and DynamicToolPage to dynamically
 * render tools without creating individual pages.
 *
 * @package GMKB
 * @subpackage AI-Tools
 */

/**
 * Tool category definitions
 */
export const TOOL_CATEGORIES = {
  'message-builder': {
    id: 'message-builder',
    name: 'Message Builder',
    description: 'Create compelling messaging for your brand',
    icon: 'message-square',
    order: 1
  },
  'value-builder': {
    id: 'value-builder',
    name: 'Value Builder',
    description: 'Define and communicate your unique value',
    icon: 'target',
    order: 2
  },
  'strategy': {
    id: 'strategy',
    name: 'Strategy',
    description: 'Build strategic content and frameworks',
    icon: 'compass',
    order: 3
  },
  'content': {
    id: 'content',
    name: 'Content Creation',
    description: 'Generate various content types',
    icon: 'file-text',
    order: 4
  },
  'social-email': {
    id: 'social-email',
    name: 'Social & Email',
    description: 'Create social media and email content',
    icon: 'share-2',
    order: 5
  }
};

/**
 * Complete tool registry
 * Each tool includes metadata for directory listing and dynamic rendering
 */
export const TOOL_REGISTRY = {
  // ============================================
  // MESSAGE BUILDER TOOLS
  // ============================================
  biography: {
    id: 'biography',
    slug: 'biography',
    name: 'Biography Generator',
    title: 'Professional Biography Generator',
    subtitle: 'Create compelling professional biographies in multiple lengths using AI',
    description: 'Generate professional biographies in three different lengths based on your authority hook and expertise.',
    category: 'message-builder',
    icon: 'user',
    component: 'BiographyGenerator',
    hasStandaloneLayout: true,
    introText: 'Generate professional biographies in three different lengths (short, medium, and long) based on your authority hook, impact intro, and professional details.',
    guidance: {
      title: 'Crafting Your Perfect Biography',
      subtitle: 'Your professional biography is an essential marketing tool that combines your Authority Hook and Impact Intro into a comprehensive narrative.',
      formula: 'I help <span class="generator__highlight">[WHO]</span> achieve <span class="generator__highlight">[RESULT]</span> when <span class="generator__highlight">[WHEN]</span> through <span class="generator__highlight">[HOW]</span>.',
      processSteps: [
        { title: 'Why Professional Biographies Matter', description: 'Your biography is often the first impression potential clients have of you.' },
        { title: 'What Makes a Great Biography', description: 'The best biographies are specific, outcome-focused, and authentic.' },
        { title: 'Using Your Generated Biographies', description: 'You\'ll receive three versions: Short, Medium, and Long for different contexts.' }
      ],
      examples: [
        { title: 'Business Coach', description: 'I help ambitious entrepreneurs build scalable businesses without burning out.' },
        { title: 'Marketing Consultant', description: 'I help B2B companies generate qualified leads through strategic digital marketing.' }
      ]
    }
  },

  topics: {
    id: 'topics',
    slug: 'topics',
    name: 'Topics Generator',
    title: 'Interview Topics Generator',
    subtitle: 'Generate compelling podcast interview topics based on your expertise',
    description: 'Create 5 engaging interview topics that showcase your authority and connect with audiences.',
    category: 'message-builder',
    icon: 'list',
    component: 'TopicsGenerator',
    hasStandaloneLayout: true,
    introText: 'Generate 5 compelling podcast interview topics based on your authority hook that will resonate with podcast hosts and their audiences.',
    guidance: {
      title: 'Creating Compelling Interview Topics',
      subtitle: 'Great interview topics position you as an expert while providing value to the audience.',
      formula: '<span class="generator__highlight">[Problem]</span> + <span class="generator__highlight">[Unique Angle]</span> + <span class="generator__highlight">[Outcome]</span>',
      processSteps: [
        { title: 'Start with Pain Points', description: 'Address real problems your target audience faces.' },
        { title: 'Add Your Unique Perspective', description: 'What contrarian or fresh angle can you bring?' },
        { title: 'Promise Transformation', description: 'What will listeners gain from this topic?' }
      ],
      examples: [
        { title: 'Leadership Topic', description: 'Why Most Leaders Fail at Delegation (And the 3-Step Fix)' },
        { title: 'Marketing Topic', description: 'The Death of Cold Outreach: Building Warm Lead Systems' }
      ]
    }
  },

  questions: {
    id: 'questions',
    slug: 'questions',
    name: 'Questions Generator',
    title: 'Interview Questions Generator',
    subtitle: 'Create engaging interview questions that showcase your expertise',
    description: 'Generate thoughtful interview questions for each of your topics.',
    category: 'message-builder',
    icon: 'help-circle',
    component: 'QuestionsGenerator',
    hasStandaloneLayout: true,
    introText: 'Create engaging interview questions for each topic that will guide compelling conversations.',
    guidance: {
      title: 'Crafting Great Interview Questions',
      subtitle: 'The right questions lead to memorable, shareable moments in interviews.',
      formula: '<span class="generator__highlight">[Setup]</span> + <span class="generator__highlight">[Challenge]</span> + <span class="generator__highlight">[Insight Request]</span>',
      processSteps: [
        { title: 'Open with Context', description: 'Set up the question with relevant background.' },
        { title: 'Create Tension', description: 'Highlight a challenge or counterintuitive idea.' },
        { title: 'Invite the Story', description: 'Let the guest share their expertise naturally.' }
      ],
      examples: []
    }
  },

  tagline: {
    id: 'tagline',
    slug: 'tagline',
    name: 'Tagline Generator',
    title: 'Professional Tagline Generator',
    subtitle: 'Create memorable taglines that distill your expertise into powerful statements',
    description: 'Generate catchy taglines that capture your unique value proposition.',
    category: 'message-builder',
    icon: 'tag',
    component: 'TaglineGenerator',
    hasStandaloneLayout: true,
    introText: 'Create memorable taglines that capture your unique value and stick in people\'s minds.',
    guidance: {
      title: 'The Art of the Perfect Tagline',
      subtitle: 'A great tagline is memorable, meaningful, and motivating.',
      formula: '<span class="generator__highlight">[Action]</span> + <span class="generator__highlight">[Audience]</span> + <span class="generator__highlight">[Outcome]</span>',
      processSteps: [
        { title: 'Keep It Short', description: 'Aim for 3-7 words maximum.' },
        { title: 'Make It Memorable', description: 'Use rhythm, alliteration, or contrast.' },
        { title: 'Focus on Benefit', description: 'What transformation do you provide?' }
      ],
      examples: [
        { title: 'Nike', description: 'Just Do It' },
        { title: 'Apple', description: 'Think Different' }
      ]
    }
  },

  'guest-intro': {
    id: 'guest-intro',
    slug: 'guest-intro',
    name: 'Guest Intro Generator',
    title: 'Guest Introduction Generator',
    subtitle: 'Create professional introductions for podcast and event appearances',
    description: 'Generate polished guest introductions that hosts can use to introduce you.',
    category: 'message-builder',
    icon: 'mic',
    component: 'GuestIntroGenerator',
    hasStandaloneLayout: true,
    introText: 'Create professional introductions that podcast hosts can use to introduce you effectively.',
    guidance: {
      title: 'Creating the Perfect Guest Introduction',
      subtitle: 'A great intro sets the stage for a compelling conversation.',
      processSteps: [],
      examples: []
    }
  },

  offers: {
    id: 'offers',
    slug: 'offers',
    name: 'Offers Generator',
    title: 'Offers Generator',
    subtitle: 'Create compelling offers that convert podcast listeners into clients',
    description: 'Generate irresistible offers tailored for podcast audiences.',
    category: 'message-builder',
    icon: 'gift',
    component: 'OffersGenerator',
    hasStandaloneLayout: true,
    introText: 'Create compelling offers that convert podcast listeners into leads and clients.',
    guidance: {
      title: 'Crafting Irresistible Offers',
      subtitle: 'The right offer bridges the gap between interest and action.',
      processSteps: [],
      examples: []
    }
  },

  // ============================================
  // VALUE BUILDER TOOLS
  // ============================================
  'elevator-pitch': {
    id: 'elevator-pitch',
    slug: 'elevator-pitch',
    name: 'Elevator Pitch Generator',
    title: 'Elevator Pitch Generator',
    subtitle: 'Create a compelling 30-second pitch that captures attention',
    description: 'Generate a concise, memorable elevator pitch for networking and introductions.',
    category: 'value-builder',
    icon: 'trending-up',
    component: 'ElevatorPitchGenerator',
    hasStandaloneLayout: true,
    introText: 'Create a compelling 30-second pitch that captures attention and opens doors.',
    guidance: {
      title: 'The Perfect Elevator Pitch',
      subtitle: 'You have 30 seconds to make an impression. Make them count.',
      processSteps: [],
      examples: []
    }
  },

  'sound-bite': {
    id: 'sound-bite',
    slug: 'sound-bite',
    name: 'Sound Bite Generator',
    title: 'Sound Bite Generator',
    subtitle: 'Create quotable moments that get shared and remembered',
    description: 'Generate memorable sound bites for interviews and presentations.',
    category: 'value-builder',
    icon: 'volume-2',
    component: 'SoundBiteGenerator',
    hasStandaloneLayout: true,
    introText: 'Create quotable moments that audiences remember and share.',
    guidance: {
      title: 'Creating Shareable Sound Bites',
      subtitle: 'The best sound bites are repeated long after the interview ends.',
      processSteps: [],
      examples: []
    }
  },

  persona: {
    id: 'persona',
    slug: 'persona',
    name: 'Persona Generator',
    title: 'Ideal Client Persona Generator',
    subtitle: 'Define your ideal client avatar with precision',
    description: 'Create detailed personas of your ideal clients to improve targeting.',
    category: 'value-builder',
    icon: 'users',
    component: 'PersonaGenerator',
    hasStandaloneLayout: true,
    introText: 'Define your ideal client avatar to create more targeted, effective messaging.',
    guidance: {
      title: 'Building Your Ideal Client Persona',
      subtitle: 'The better you know your audience, the more effectively you can serve them.',
      processSteps: [],
      examples: []
    }
  },

  // ============================================
  // STRATEGY TOOLS
  // ============================================
  'brand-story': {
    id: 'brand-story',
    slug: 'brand-story',
    name: 'Brand Story Generator',
    title: 'Brand Story Generator',
    subtitle: 'Create your compelling origin story that connects with audiences',
    description: 'Generate an authentic brand story that builds trust and connection.',
    category: 'strategy',
    icon: 'book-open',
    component: 'BrandStoryGenerator',
    hasStandaloneLayout: true,
    introText: 'Create your compelling origin story that connects emotionally with your audience.',
    guidance: {
      title: 'Crafting Your Brand Story',
      subtitle: 'Stories create connection. Your brand story is your most powerful asset.',
      processSteps: [],
      examples: []
    }
  },

  'signature-story': {
    id: 'signature-story',
    slug: 'signature-story',
    name: 'Signature Story Generator',
    title: 'Signature Story Generator',
    subtitle: 'Create your go-to story that demonstrates your expertise',
    description: 'Generate a powerful signature story for presentations and interviews.',
    category: 'strategy',
    icon: 'edit-3',
    component: 'SignatureStoryGenerator',
    hasStandaloneLayout: true,
    introText: 'Create your go-to story that demonstrates expertise and builds credibility.',
    guidance: {
      title: 'Your Signature Story',
      subtitle: 'Every great speaker has a signature story they can tell in any situation.',
      processSteps: [],
      examples: []
    }
  },

  'credibility-story': {
    id: 'credibility-story',
    slug: 'credibility-story',
    name: 'Credibility Story Generator',
    title: 'Credibility Story Generator',
    subtitle: 'Create stories that establish your authority and expertise',
    description: 'Generate credibility-building stories from your experience.',
    category: 'strategy',
    icon: 'award',
    component: 'CredibilityStoryGenerator',
    hasStandaloneLayout: true,
    introText: 'Create stories that establish your authority without bragging.',
    guidance: {
      title: 'Building Credibility Through Story',
      subtitle: 'Show, don\'t tell. Let your results speak through narrative.',
      processSteps: [],
      examples: []
    }
  },

  framework: {
    id: 'framework',
    slug: 'framework',
    name: 'Framework Generator',
    title: 'Framework Generator',
    subtitle: 'Create proprietary frameworks that showcase your methodology',
    description: 'Generate unique frameworks that differentiate your approach.',
    category: 'strategy',
    icon: 'grid',
    component: 'FrameworkGenerator',
    hasStandaloneLayout: true,
    introText: 'Create proprietary frameworks that showcase your unique methodology.',
    guidance: {
      title: 'Creating Your Proprietary Framework',
      subtitle: 'Frameworks make complex ideas simple and memorable.',
      processSteps: [],
      examples: []
    }
  },

  'interview-prep': {
    id: 'interview-prep',
    slug: 'interview-prep',
    name: 'Interview Prep Generator',
    title: 'Interview Prep Generator',
    subtitle: 'Prepare comprehensive notes for podcast interviews',
    description: 'Generate interview preparation documents with key talking points.',
    category: 'strategy',
    icon: 'clipboard',
    component: 'InterviewPrepGenerator',
    hasStandaloneLayout: true,
    introText: 'Prepare comprehensive notes to shine in your next podcast interview.',
    guidance: {
      title: 'Interview Preparation',
      subtitle: 'Preparation is the difference between a good interview and a great one.',
      processSteps: [],
      examples: []
    }
  },

  // ============================================
  // CONTENT TOOLS
  // ============================================
  blog: {
    id: 'blog',
    slug: 'blog',
    name: 'Blog Generator',
    title: 'Blog Post Generator',
    subtitle: 'Create SEO-optimized blog posts from your expertise',
    description: 'Generate blog post outlines and drafts based on your topics.',
    category: 'content',
    icon: 'file-text',
    component: 'BlogGenerator',
    hasStandaloneLayout: true,
    introText: 'Create SEO-optimized blog posts that establish thought leadership.',
    guidance: {
      title: 'Writing Effective Blog Posts',
      subtitle: 'Great blog posts educate, engage, and convert.',
      processSteps: [],
      examples: []
    }
  },

  'content-repurpose': {
    id: 'content-repurpose',
    slug: 'content-repurpose',
    name: 'Content Repurposer',
    title: 'Content Repurposer',
    subtitle: 'Transform one piece of content into multiple formats',
    description: 'Repurpose your content across different platforms and formats.',
    category: 'content',
    icon: 'repeat',
    component: 'ContentRepurposerGenerator',
    hasStandaloneLayout: true,
    introText: 'Transform one piece of content into multiple formats for maximum reach.',
    guidance: {
      title: 'Content Repurposing Strategy',
      subtitle: 'Create once, distribute everywhere.',
      processSteps: [],
      examples: []
    }
  },

  'press-release': {
    id: 'press-release',
    slug: 'press-release',
    name: 'Press Release Generator',
    title: 'Press Release Generator',
    subtitle: 'Create professional press releases for media outreach',
    description: 'Generate press releases that get picked up by media outlets.',
    category: 'content',
    icon: 'radio',
    component: 'PressReleaseGenerator',
    hasStandaloneLayout: true,
    introText: 'Create professional press releases that get media attention.',
    guidance: {
      title: 'Writing Effective Press Releases',
      subtitle: 'The right format and angle can get you featured in major publications.',
      processSteps: [],
      examples: []
    }
  },

  // ============================================
  // SOCIAL & EMAIL TOOLS
  // ============================================
  'social-post': {
    id: 'social-post',
    slug: 'social-post',
    name: 'Social Post Generator',
    title: 'Social Media Post Generator',
    subtitle: 'Create engaging social media content for all platforms',
    description: 'Generate platform-optimized social media posts.',
    category: 'social-email',
    icon: 'share-2',
    component: 'SocialPostGenerator',
    hasStandaloneLayout: true,
    introText: 'Create engaging social media posts optimized for each platform.',
    guidance: {
      title: 'Social Media Best Practices',
      subtitle: 'Each platform has its own language. Speak it fluently.',
      processSteps: [],
      examples: []
    }
  },

  email: {
    id: 'email',
    slug: 'email',
    name: 'Email Writer',
    title: 'Email Writer',
    subtitle: 'Create effective email sequences and campaigns',
    description: 'Generate email copy for outreach, nurturing, and sales.',
    category: 'social-email',
    icon: 'mail',
    component: 'EmailWriterGenerator',
    hasStandaloneLayout: true,
    introText: 'Create effective emails that get opened, read, and acted upon.',
    guidance: {
      title: 'Email Writing Best Practices',
      subtitle: 'Great emails feel personal, even at scale.',
      processSteps: [],
      examples: []
    }
  },

  newsletter: {
    id: 'newsletter',
    slug: 'newsletter',
    name: 'Newsletter Generator',
    title: 'Newsletter Generator',
    subtitle: 'Create engaging newsletter content for your subscribers',
    description: 'Generate newsletter editions that keep subscribers engaged.',
    category: 'social-email',
    icon: 'inbox',
    component: 'NewsletterGenerator',
    hasStandaloneLayout: true,
    introText: 'Create newsletter content that keeps subscribers engaged and coming back.',
    guidance: {
      title: 'Newsletter Best Practices',
      subtitle: 'Consistency and value are the keys to newsletter success.',
      processSteps: [],
      examples: []
    }
  },

  'youtube-description': {
    id: 'youtube-description',
    slug: 'youtube-description',
    name: 'YouTube Description Generator',
    title: 'YouTube Description Generator',
    subtitle: 'Create SEO-optimized YouTube video descriptions',
    description: 'Generate video descriptions that improve discoverability.',
    category: 'social-email',
    icon: 'youtube',
    component: 'YoutubeDescriptionGenerator',
    hasStandaloneLayout: true,
    introText: 'Create SEO-optimized video descriptions that help you get discovered.',
    guidance: {
      title: 'YouTube SEO Basics',
      subtitle: 'The right description can dramatically increase your views.',
      processSteps: [],
      examples: []
    }
  },

  'podcast-notes': {
    id: 'podcast-notes',
    slug: 'podcast-notes',
    name: 'Podcast Notes Generator',
    title: 'Podcast Show Notes Generator',
    subtitle: 'Create comprehensive show notes for podcast episodes',
    description: 'Generate show notes that improve SEO and listener engagement.',
    category: 'social-email',
    icon: 'headphones',
    component: 'PodcastNotesGenerator',
    hasStandaloneLayout: true,
    introText: 'Create comprehensive show notes that drive traffic and engagement.',
    guidance: {
      title: 'Show Notes Best Practices',
      subtitle: 'Good show notes extend the life and reach of every episode.',
      processSteps: [],
      examples: []
    }
  },

  'seo-optimizer': {
    id: 'seo-optimizer',
    slug: 'seo-optimizer',
    name: 'SEO Optimizer',
    title: 'SEO Content Optimizer',
    subtitle: 'Optimize your content for search engines',
    description: 'Analyze and optimize content for better search rankings.',
    category: 'social-email',
    icon: 'search',
    component: 'SeoOptimizerGenerator',
    hasStandaloneLayout: true,
    introText: 'Optimize your content for search engines without sacrificing readability.',
    guidance: {
      title: 'SEO Optimization Guide',
      subtitle: 'Balance search optimization with human readability.',
      processSteps: [],
      examples: []
    }
  }
};

/**
 * Get all tools as an array, sorted by category order then name
 */
export function getAllTools() {
  return Object.values(TOOL_REGISTRY).sort((a, b) => {
    const catA = TOOL_CATEGORIES[a.category]?.order || 99;
    const catB = TOOL_CATEGORIES[b.category]?.order || 99;
    if (catA !== catB) return catA - catB;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Get tools grouped by category
 */
export function getToolsByCategory() {
  const grouped = {};

  Object.values(TOOL_CATEGORIES)
    .sort((a, b) => a.order - b.order)
    .forEach(category => {
      grouped[category.id] = {
        ...category,
        tools: []
      };
    });

  Object.values(TOOL_REGISTRY).forEach(tool => {
    if (grouped[tool.category]) {
      grouped[tool.category].tools.push(tool);
    }
  });

  // Sort tools within each category
  Object.values(grouped).forEach(category => {
    category.tools.sort((a, b) => a.name.localeCompare(b.name));
  });

  return grouped;
}

/**
 * Get a single tool by slug
 */
export function getToolBySlug(slug) {
  return TOOL_REGISTRY[slug] || null;
}

/**
 * Get tools that have standalone layout implemented
 */
export function getToolsWithStandaloneLayout() {
  return Object.values(TOOL_REGISTRY).filter(tool => tool.hasStandaloneLayout);
}

export default TOOL_REGISTRY;
