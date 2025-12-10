<template>
  <AiToolLayout
    title="Professional Biography Generator"
    subtitle="Create compelling professional biographies in multiple lengths using AI"
    column-ratio="equal"
  >
    <!-- Left Panel: The Generator Tool -->
    <template #tool>
      <BiographyGenerator
        @generated="handleGenerated"
        @saved="handleSaved"
      />
    </template>

    <!-- Right Panel: The Guide -->
    <template #guide>
      <BiographyGuide />
    </template>
  </AiToolLayout>
</template>

<script setup>
/**
 * Biography Tool - Entry Point
 *
 * This is the main entry point for the standalone Biography Generator tool.
 * It combines the AiToolLayout wrapper with the BiographyGenerator (left panel)
 * and BiographyGuide (right panel) components.
 *
 * Usage:
 * - Rendered via WordPress shortcode [gmkb_biography]
 * - Mounted to #gmkb-biography-tool container
 *
 * @package GMKB
 * @subpackage AI-Tools
 * @version 1.0.0
 */

import AiToolLayout from '../_shared/AiToolLayout.vue';
import BiographyGenerator from './BiographyGenerator.vue';
import BiographyGuide from './BiographyGuide.vue';

const emit = defineEmits(['generated', 'saved']);

/**
 * Handle biography generation complete
 */
const handleGenerated = (biographies) => {
  console.log('[BiographyTool] Biographies generated:', biographies);
  emit('generated', biographies);

  // Track analytics event if available
  if (window.gtag) {
    window.gtag('event', 'biography_generated', {
      event_category: 'ai_tools',
      event_label: 'biography'
    });
  }
};

/**
 * Handle save all biographies
 */
const handleSaved = (biographies) => {
  console.log('[BiographyTool] Biographies saved:', biographies);
  emit('saved', biographies);

  // TODO: Integrate with WordPress save functionality
};
</script>

<style scoped>
/* Entry point styles - minimal, most styling is in child components */
</style>
