<template>
  <div class="generic-edit-form">
    <div v-for="(value, key) in modelValue" :key="key" class="form-field">
      <label :for="`field-${key}`" class="form-label">
        {{ formatFieldLabel(key) }}
      </label>
      
      <!-- Text input for strings -->
      <input
        v-if="typeof value === 'string' && !isLongText(value) && !isColor(key) && !isImage(key)"
        :id="`field-${key}`"
        type="text"
        v-model="localData[key]"
        @input="updateValue"
        class="form-input"
      />
      
      <!-- Textarea for long text -->
      <textarea
        v-else-if="typeof value === 'string' && isLongText(value)"
        :id="`field-${key}`"
        v-model="localData[key]"
        @input="updateValue"
        class="form-textarea"
        rows="4"
      />
      
      <!-- Number input -->
      <input
        v-else-if="typeof value === 'number'"
        :id="`field-${key}`"
        type="number"
        v-model.number="localData[key]"
        @input="updateValue"
        class="form-input"
      />
      
      <!-- Checkbox for booleans -->
      <input
        v-else-if="typeof value === 'boolean'"
        :id="`field-${key}`"
        type="checkbox"
        v-model="localData[key]"
        @change="updateValue"
        class="form-checkbox"
      />
      
      <!-- Color picker -->
      <input
        v-else-if="isColor(key)"
        :id="`field-${key}`"
        type="color"
        v-model="localData[key]"
        @input="updateValue"
        class="form-color"
      />
      
      <!-- Image/URL field -->
      <div v-else-if="isImage(key)" class="image-field">
        <input
          :id="`field-${key}`"
          type="url"
          v-model="localData[key]"
          @input="updateValue"
          class="form-input"
          placeholder="Enter image URL"
        />
        <button @click="openMediaLibrary(key)" class="media-btn">
          Select from Media Library
        </button>
      </div>
      
      <!-- Array field (repeater) -->
      <div v-else-if="Array.isArray(value)" class="array-field">
        <div v-for="(item, index) in localData[key]" :key="`${key}-${index}`" class="array-item">
          <input
            v-if="typeof item === 'string'"
            v-model="localData[key][index]"
            @input="updateValue"
            class="form-input"
          />
          <button @click="removeArrayItem(key, index)" class="remove-btn">×</button>
        </div>
        <button @click="addArrayItem(key)" class="add-btn">+ Add Item</button>
      </div>
      
      <!-- Object field (nested) -->
      <div v-else-if="typeof value === 'object' && value !== null && !Array.isArray(value)" class="object-field">
        <div v-for="(subValue, subKey) in value" :key="`${key}-${subKey}`" class="sub-field">
          <label class="sub-label">{{ formatFieldLabel(subKey) }}</label>
          <input
            v-if="typeof subValue === 'string'"
            v-model="localData[key][subKey]"
            @input="updateValue"
            class="form-input"
          />
        </div>
      </div>
    </div>
    
    <!-- Additional fields for common properties -->
    <div v-if="!modelValue.title" class="form-field">
      <label for="field-title" class="form-label">Title</label>
      <input
        id="field-title"
        type="text"
        v-model="localData.title"
        @input="updateValue"
        class="form-input"
        placeholder="Enter title"
      />
    </div>
    
    <div v-if="!modelValue.description" class="form-field">
      <label for="field-description" class="form-label">Description</label>
      <textarea
        id="field-description"
        v-model="localData.description"
        @input="updateValue"
        class="form-textarea"
        rows="3"
        placeholder="Enter description"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  component: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

// Local copy of data
const localData = reactive({});

// Initialize local data from modelValue
watch(() => props.modelValue, (newValue) => {
  Object.assign(localData, newValue);
}, { immediate: true, deep: true });

// Update parent when local data changes
const updateValue = () => {
  emit('update:modelValue', { ...localData });
};

// Format field labels from camelCase/snake_case
const formatFieldLabel = (key) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\s/, '')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Check if field should be a long text field
const isLongText = (value) => {
  return value.length > 100 || value.includes('\n');
};

// Check if field is a color field
const isColor = (key) => {
  const colorKeys = ['color', 'background', 'bg', 'foreground', 'fg', 'border'];
  return colorKeys.some(ck => key.toLowerCase().includes(ck));
};

// Check if field is an image/media field
const isImage = (key) => {
  const imageKeys = ['image', 'img', 'photo', 'picture', 'media', 'url', 'src', 'avatar', 'logo', 'icon'];
  return imageKeys.some(ik => key.toLowerCase().includes(ik));
};

// Add item to array field
const addArrayItem = (key) => {
  if (!localData[key]) localData[key] = [];
  
  // Determine type of item to add based on existing items
  const firstItem = localData[key][0];
  const newItem = typeof firstItem === 'string' ? '' : 
                   typeof firstItem === 'number' ? 0 : 
                   typeof firstItem === 'boolean' ? false : 
                   Array.isArray(firstItem) ? [] : {};
  
  localData[key].push(newItem);
  updateValue();
};

// Remove item from array field
const removeArrayItem = (key, index) => {
  localData[key].splice(index, 1);
  updateValue();
};

// Open WordPress media library
const openMediaLibrary = (key) => {
  // Check if WordPress media library is available
  if (window.wp && window.wp.media) {
    const frame = wp.media({
      title: 'Select Image',
      button: { text: 'Use Image' },
      multiple: false,
      library: { type: 'image' }
    });
    
    frame.on('select', function() {
      const attachment = frame.state().get('selection').first().toJSON();
      localData[key] = attachment.url;
      updateValue();
    });
    
    frame.open();
  } else {
    // Fallback: prompt for URL
    const url = prompt('Enter image URL:');
    if (url) {
      localData[key] = url;
      updateValue();
    }
  }
};
</script>

<style scoped>
.generic-edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.sub-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.form-color {
  width: 60px;
  height: 40px;
  padding: 4px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
}

.image-field {
  display: flex;
  gap: 10px;
}

.image-field .form-input {
  flex: 1;
}

.media-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.media-btn:hover {
  background: #e5e7eb;
}

.array-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.array-item {
  display: flex;
  gap: 8px;
}

.array-item .form-input {
  flex: 1;
}

.remove-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #fecaca;
}

.add-btn {
  padding: 8px 16px;
  background: #ecfdf5;
  color: #10b981;
  border: 1px solid #10b981;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #10b981;
  color: white;
}

.object-field {
  padding-left: 16px;
  border-left: 2px solid #e5e7eb;
}

.sub-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}
</style>
</parameter>
</invoke>