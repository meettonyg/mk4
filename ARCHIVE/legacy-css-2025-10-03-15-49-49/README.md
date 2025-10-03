# Legacy CSS Files - Archived

These files were replaced by the design system on Fri 10/03/2025 at 15:49:49.50

## Replaced By
- `frontend-mediakit.css` → `design-system/index.css`
- `modules/components.css` → `design-system/components.css`

## Why Archived
1. Duplicate styles caused conflicts
2. Different class names than Vue builder
3. Not using design tokens (CSS variables)
4. Hard to maintain two CSS systems

## Design System Benefits
- Single source of truth
- Consistent class names
- Uses CSS variables for theming
- Shared by Vue builder and PHP frontend

## Can This Be Restored?
Yes, but DON'T. The design system is better in every way.
If you need specific styles from these files, extract them and
add to design-system/components.css using design tokens.

## Archived Files
  - frontend-mediakit.css 
  - components.css 
