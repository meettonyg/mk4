/**
 * AI Components Index
 *
 * Exports shared AI UI components used by tool generators.
 * Individual generator components are now located in /tools/{tool-name}/
 *
 * @package GMKB
 * @subpackage Components
 * @version 2.0.0
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

// Panel & Modal Components
export { default as AiAssistantPanel } from './AiAssistantPanel.vue';
export { default as AiModal } from './AiModal.vue';

// Generic Generator Component
export { default as SimpleGenerator } from './SimpleGenerator.vue';
