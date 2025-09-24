#!/bin/bash

# Fix deprecated CSS selectors in Vue files
# Replaces >>> and /deep/ with :deep()

echo "Fixing deprecated CSS selectors in Vue files..."

# Find all .vue files and fix deprecated selectors
find components -name "*.vue" -type f | while read file; do
  # Check if file contains deprecated selectors
  if grep -q ">>>" "$file" || grep -q "/deep/" "$file"; then
    echo "Fixing: $file"
    
    # Replace >>> with :deep()
    # Pattern: .class >>> element becomes .class :deep(element)
    sed -i 's/\s*>>>\s*/ :deep(/g; s/\s*{\s*$/) {/g' "$file"
    
    # Replace /deep/ with :deep()
    sed -i 's|/deep/|:deep(|g' "$file"
  fi
done

echo "Done! All deprecated CSS selectors have been fixed."
echo ""
echo "The following changes were made:"
echo "- '>>>' replaced with ':deep()'"
echo "- '/deep/' replaced with ':deep()'"
echo ""
echo "This ensures Vue 3 compatibility."
