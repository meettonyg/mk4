<template>
  <div class="gmkb-preview">
    <div
      v-for="section in normalizedSections"
      :key="section.section_id"
      class="gmkb-section"
      :class="`gmkb-section--${section.layout}`"
      :data-section-id="section.section_id"
    >
      <div class="gmkb-section__content">
        <template v-if="section.layout === 'full_width'">
          <component
            v-for="component in getSectionComponents(section)"
            :key="component.component_id"
            :is="resolveComponent(component)"
            :component-id="component.component_id"
            :data="component.data || {}"
            :props="component.props || {}"
            :settings="component.settings || {}"
            :is-builder-mode="false"
            class="component-root"
          />
        </template>

        <div v-else-if="section.layout === 'two_column'" class="gmkb-section__columns gmkb-section__columns--2">
          <div class="gmkb-section__column" data-column="1">
            <component
              v-for="component in getColumnComponents(section, 1)"
              :key="component.component_id"
              :is="resolveComponent(component)"
              :component-id="component.component_id"
              :data="component.data || {}"
              :props="component.props || {}"
              :settings="component.settings || {}"
              :is-builder-mode="false"
              class="component-root"
            />
          </div>
          <div class="gmkb-section__column" data-column="2">
            <component
              v-for="component in getColumnComponents(section, 2)"
              :key="component.component_id"
              :is="resolveComponent(component)"
              :component-id="component.component_id"
              :data="component.data || {}"
              :props="component.props || {}"
              :settings="component.settings || {}"
              :is-builder-mode="false"
              class="component-root"
            />
          </div>
        </div>

        <div v-else-if="section.layout === 'three_column'" class="gmkb-section__columns gmkb-section__columns--3">
          <div
            v-for="col in 3"
            :key="col"
            class="gmkb-section__column"
            :data-column="col"
          >
            <component
              v-for="component in getColumnComponents(section, col)"
              :key="component.component_id"
              :is="resolveComponent(component)"
              :component-id="component.component_id"
              :data="component.data || {}"
              :props="component.props || {}"
              :settings="component.settings || {}"
              :is-builder-mode="false"
              class="component-root"
            />
          </div>
        </div>

        <template v-else>
          <component
            v-for="component in getSectionComponents(section)"
            :key="component.component_id"
            :is="resolveComponent(component)"
            :component-id="component.component_id"
            :data="component.data || {}"
            :props="component.props || {}"
            :settings="component.settings || {}"
            :is-builder-mode="false"
            class="component-root"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import UnifiedComponentRegistry from '@/services/UnifiedComponentRegistry';

const props = defineProps({
  sections: {
    type: Array,
    default: () => []
  },
  components: {
    type: Object,
    default: () => ({})
  },
  theme: {
    type: [String, Object],
    default: null
  },
  themeCustomizations: {
    type: Object,
    default: () => ({})
  },
  readOnly: {
    type: Boolean,
    default: true
  }
});

const normalizedSections = computed(() => {
  return props.sections.map((section) => ({
    ...section,
    layout: section.layout || section.type || 'full_width'
  }));
});

const getSectionComponents = (section) => {
  const componentIds = Array.isArray(section.components) ? section.components : [];
  return componentIds
    .map((id) => props.components[id])
    .filter(Boolean);
};

const getColumnComponents = (section, column) => {
  const columnKey = String(column);
  const columns = section.columns || {};

  if (Array.isArray(columns[columnKey])) {
    return columns[columnKey]
      .map((id) => props.components[id])
      .filter(Boolean);
  }

  const sectionComponents = getSectionComponents(section);
  return sectionComponents.filter((_, index) => {
    if (section.layout === 'three_column') {
      return (index % 3) === (column - 1);
    }
    return column === 1 ? index % 2 === 0 : index % 2 === 1;
  });
};

const resolveComponent = (component) => {
  if (!component?.type) {
    return null;
  }

  try {
    return UnifiedComponentRegistry.getVueComponent(component.type) || null;
  } catch (error) {
    console.error('[MediaKitPreview] Failed to resolve component:', component.type, error);
    return null;
  }
};
</script>
