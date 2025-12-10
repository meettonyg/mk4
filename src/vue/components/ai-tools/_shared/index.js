/**
 * AI Tools - Shared Components Index
 *
 * Exports all shared components used across AI tool pages.
 * These components provide the foundation for the 2-column tool layout.
 *
 * @package GMKB
 * @subpackage AI-Tools
 * @version 1.0.0
 */

// Layout Components
export { default as AiToolLayout } from './AiToolLayout.vue';

// Re-export existing shared components from the ai/ folder
// These are used by both embedded widgets and standalone tools
export {
  AiToneSelector,
  AiLengthSelector,
  AiPovSelector,
  AiGenerateButton,
  AiResultsDisplay,
  AiErrorMessage,
  AiUsageMeter,
  AuthorityHookBuilder,
  ImpactIntroBuilder
} from '../ai/index.js';
