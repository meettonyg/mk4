/**
 * AI Tools - Auto-Discovery Registry
 *
 * Self-discovering tool registry that automatically imports and registers
 * all tools from their respective directories.
 *
 * Each tool directory contains an index.js with:
 * - Generator component (default export)
 * - meta object with tool metadata
 *
 * @package GMKB
 * @subpackage Tools
 */

// Import all tools - auto-discovery pattern
import * as biography from './biography';
import * as topics from './topics';
import * as questions from './questions';
import * as tagline from './tagline';
import * as guestIntro from './guest-intro';
import * as authorityHook from './authority-hook';
import * as offers from './offers';
import * as elevatorPitch from './elevator-pitch';
import * as soundBite from './sound-bite';
import * as persona from './persona';
import * as impactIntro from './impact-intro';
import * as brandStory from './brand-story';
import * as signatureStory from './signature-story';
import * as credibilityStory from './credibility-story';
import * as framework from './framework';
import * as interviewPrep from './interview-prep';
import * as blog from './blog';
import * as contentRepurpose from './content-repurpose';
import * as pressRelease from './press-release';
import * as socialPost from './social-post';
import * as email from './email';
import * as newsletter from './newsletter';
import * as youtubeDescription from './youtube-description';
import * as podcastNotes from './podcast-notes';
import * as seoOptimizer from './seo-optimizer';
import * as podcastDetailsExtractor from './podcast-details-extractor';

/**
 * All tool modules - exported for use by entry points
 */
export const toolModules = {
  biography,
  topics,
  questions,
  tagline,
  'guest-intro': guestIntro,
  'authority-hook': authorityHook,
  offers,
  'elevator-pitch': elevatorPitch,
  'sound-bite': soundBite,
  persona,
  'impact-intro': impactIntro,
  'brand-story': brandStory,
  'signature-story': signatureStory,
  'credibility-story': credibilityStory,
  framework,
  'interview-prep': interviewPrep,
  blog,
  'content-repurpose': contentRepurpose,
  'press-release': pressRelease,
  'social-post': socialPost,
  email,
  newsletter,
  'youtube-description': youtubeDescription,
  'podcast-notes': podcastNotes,
  'seo-optimizer': seoOptimizer,
  'podcast-details-extractor': podcastDetailsExtractor
};

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
 * Build the tool registry from discovered modules
 */
function buildRegistry() {
  const registry = {};

  Object.entries(toolModules).forEach(([slug, module]) => {
    if (module.meta) {
      registry[slug] = {
        ...module.meta,
        component: module.default || module.Generator,
        hasStandaloneLayout: true
      };
    }
  });

  return registry;
}

/**
 * Complete tool registry - auto-generated from tool modules
 */
export const TOOL_REGISTRY = buildRegistry();

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
 * Get the component for a tool by slug
 */
export function getToolComponent(slug) {
  const module = toolModules[slug];
  return module ? (module.default || module.Generator) : null;
}

/**
 * Get tools that have standalone layout implemented
 */
export function getToolsWithStandaloneLayout() {
  return Object.values(TOOL_REGISTRY).filter(tool => tool.hasStandaloneLayout);
}

// Re-export shared components
export * from './_shared';

// Export default as the registry
export default TOOL_REGISTRY;
