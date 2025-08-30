# JavaScript Directory Structure

This directory contains all JavaScript files for the Media Kit Builder plugin.

## Directory Structure

### `/components/`
Component-specific JavaScript files for individual media kit components.

### `/core/`
Core system files that initialize and coordinate the application:
- `gmkb.js` - Main application controller
- `main.js` - Primary initialization
- `enhanced-component-manager.js` - Component management system
- `enhanced-component-renderer-simplified.js` - Simplified component rendering
- `enhanced-state-manager-simple.js` - State management system
- And other core initialization files

### `/modals/`
Modal dialog functionality:
- `modal-base.js` - Base modal functionality
- `component-library-simple.js` - Simplified component library modal
- Other modal-specific scripts

### `/services/`
Service layer providing specific functionality:
- `auto-save-service.js` - Auto-save functionality
- `component-discovery-service.js` - Component discovery
- `data-transformer-service.js` - Data transformation utilities
- Other service utilities

### `/ui/`
User interface components and interactions:
- `toolbar.js` - Main toolbar functionality
- `tabs.js` - Tab navigation
- `form-controls.js` - Form control utilities
- `drag-drop-manager.js` - Drag and drop functionality
- `empty-state-handlers.js` - Empty state management
- Various sidebar and section integration files

### `/utils/`
Utility functions and helpers:
- `enhanced-error-handler.js` - Error handling utilities
- `structured-logger.js` - Logging utilities
- Other helper functions

### `/system/`
System-level components (Phase 2 & 3):
- `ComponentConfigurationManager.js` - Component configuration
- `DataBindingEngine.js` - Data binding system
- `SectionLayoutManager.js` - Section layout management
- `SectionRenderer.js` - Section rendering

## Key Files

### Core Application
- `gmkb.js` - Main GMKB namespace and initialization
- `main.js` - Application bootstrap and core UI setup
- `enhanced-state-manager-simple.js` - Centralized state management

### Component System
- `enhanced-component-manager.js` - Component lifecycle management
- `enhanced-component-renderer-simplified.js` - Component rendering engine

### UI Systems
- `toolbar.js` - Toolbar controls and device preview
- `tabs.js` - Tab navigation system
- `component-library-simple.js` - Component library modal

### Integration
- `sortable-integration.js` - SortableJS drag-drop integration
- `drag-drop-manager.js` - Drag and drop coordination

## Architecture Notes

- All files use vanilla JavaScript (no jQuery)
- Event-driven architecture (no polling)
- WordPress global namespace approach
- Centralized state management
- Modular service-based design

## Loading Order

Files are loaded via `includes/enqueue.php` with proper dependencies:
1. Core systems (state manager, logger)
2. Services and utilities
3. Component systems
4. UI components
5. Integration scripts
