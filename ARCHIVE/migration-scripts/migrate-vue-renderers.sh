#!/bin/bash
# Script to reorganize Vue renderers to their proper component directories

# Array of all components
components=(
  "contact"
  "social"
  "testimonials"
  "call-to-action"
  "questions"
  "stats"
  "video-intro"
  "photo-gallery"
  "podcast-player"
  "booking-calendar"
  "authority-hook"
  "guest-intro"
  "logo-grid"
)

echo "Moving Vue renderers to component directories..."

# Process each component
for component in "${components[@]}"; do
  # Convert component name to PascalCase for Vue file
  vue_name=$(echo "$component" | sed 's/-\(.\)/\U\1/g' | sed 's/^\(.\)/\U\1/')
  
  echo "Processing $component..."
  
  # Create component directory if it doesn't exist
  mkdir -p "components/$component"
  
  # Move Vue renderer if it exists
  if [ -f "src/vue/components/renderers/${vue_name}Renderer.vue" ]; then
    cp "src/vue/components/renderers/${vue_name}Renderer.vue" "components/$component/${vue_name}Renderer.vue"
    echo "  ✓ Moved ${vue_name}Renderer.vue"
  fi
done

echo "Migration complete!"
