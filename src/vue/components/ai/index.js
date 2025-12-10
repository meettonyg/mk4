/**
 * AI Components Index
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * Exports all AI-related Vue components for easy importing.
 *
 * @package GMKB
 * @subpackage Components
 * @version 1.0.0
 * @since 2.2.0
 */

// Base Components
export { default as AiWidgetFrame } from './AiWidgetFrame.vue';
export { default as AiErrorMessage } from './AiErrorMessage.vue';
export { default as AiUsageMeter } from './AiUsageMeter.vue';
export { default as AiLeadGenCta } from './AiLeadGenCta.vue';

// Shared Sub-Components
export { default as AiToneSelector } from './AiToneSelector.vue';
export { default as AiLengthSelector } from './AiLengthSelector.vue';
export { default as AiPovSelector } from './AiPovSelector.vue';
export { default as AiGenerateButton } from './AiGenerateButton.vue';
export { default as AiResultsDisplay } from './AiResultsDisplay.vue';

// Generator Components
export { default as BiographyGenerator } from './BiographyGenerator.vue';
export { default as TopicsGenerator } from './TopicsGenerator.vue';
export { default as QuestionsGenerator } from './QuestionsGenerator.vue';
export { default as TaglineGenerator } from './TaglineGenerator.vue';
export { default as GuestIntroGenerator } from './GuestIntroGenerator.vue';
export { default as OffersGenerator } from './OffersGenerator.vue';

// Builder Components
export { default as AuthorityHookBuilder } from './AuthorityHookBuilder.vue';
export { default as ImpactIntroBuilder } from './ImpactIntroBuilder.vue';

// Panel & Modal Components
export { default as AiAssistantPanel } from './AiAssistantPanel.vue';
export { default as AiModal } from './AiModal.vue';
