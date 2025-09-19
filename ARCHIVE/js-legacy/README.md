# JavaScript Architecture

## Directory Structure

The JavaScript codebase is organized into logical modules following a clear separation of concerns.

### Core Directories

#### `/core/`
Core system files that bootstrap and coordinate the application:
- `enhanced-component-manager.js` - Manages component lifecycle
- `enhanced-component-renderer-simplified.js` - Handles component rendering
- `enhanced-state-manager-simple.js` - Centralized state management
- `component-controls-manager.js` - Component control UI management
- `gmkb.js` - Main GMKB system initialization
- `structured-logger.js` - Structured logging system

#### `/ui/`
User interface components and interactions:
- `tabs.js` - Tab navigation system
- `toolbar.js` - Toolbar functionality
- `dnd.js` - Drag and drop implementation
- `sortable-integration.js` - SortableJS integration
- `sidebar-section-integration.js` - Sidebar section management
- `empty-state-handlers.js` - Empty state UI handling

#### `/modals/`
Modal dialog implementations:
- `component-library-simple.js` - Component library modal
- `modal-base.js` - Base modal functionality
- `export-share-modal.js` - Export/share functionality
- `global-settings-modal.js` - Global settings interface

#### `/services/`
Service layer for business logic:
- `ComponentContainerManager.js` - Container management service
- `ComponentDataBindingService.js` - Data binding service
- `ComponentEventService.js` - Event handling service
- `ComponentRenderingService.js` - Rendering pipeline service
- `ComponentStateIntegrationService.js` - State integration service
- `ComponentValidationService.js` - Validation service

#### `/system/`
System-level modules (Phase 2 & 3 architecture):
- `ComponentConfigurationManager.js` - Component configuration (Phase 2)
- `DataBindingEngine.js` - Data binding engine (Phase 2)
- `SectionLayoutManager.js` - Section layout management (Phase 3)
- `SectionRenderer.js` - Section rendering (Phase 3)
- `debug-section-helpers.js` - Section debugging utilities

#### `/utils/`
Utility functions and helpers:
- `ajax-handler.js` - AJAX communication utilities
- `auto-save.js` - Auto-save functionality
- `state-loader.js` - State loading utilities
- `template-loader.js` - Template loading system
- `dom-utils.js` - DOM manipulation helpers

#### `/managers/`
Manager classes for specific domains:
- `core-systems-coordinator.js` - Coordinates core system initialization
- `drag-drop-manager.js` - Manages drag and drop operations

#### `/components/`
Component-specific JavaScript (if needed for complex components)

#### `/integrations/`
Third-party integrations and adapters

#### `/templates/`
JavaScript template files and template utilities

#### `/vendor/`
Third-party libraries (if not loaded via CDN)

#### `/archived/`
Deprecated code kept for reference

## Main Entry Point

### `main.js`
The main entry point that:
1. Initializes the GMKB system
2. Coordinates module loading
3. Sets up event listeners
4. Manages initialization sequence

## Architecture Principles

### Event-Driven Architecture
- All modules communicate via events
- No polling or setTimeout for waiting
- Use `window.GMKB.on()` and `window.GMKB.dispatch()`

### State Management
- Single source of truth in `enhanced-state-manager-simple.js`
- All state changes go through the state manager
- Components subscribe to state changes

### WordPress Integration
- Scripts properly enqueued in `includes/enqueue.php`
- Use `wp_localize_script` for passing PHP data
- AJAX calls use WordPress nonce for security

## Module Loading Order

1. **Core Systems** (gmkb.js, structured-logger.js)
2. **State Manager** (enhanced-state-manager-simple.js)
3. **Coordinators** (core-systems-coordinator.js)
4. **Managers** (component-manager, controls-manager)
5. **Services** (rendering, validation, etc.)
6. **UI Components** (tabs, toolbar, modals)
7. **Main Application** (main.js)

## Coding Standards

### File Structure
```javascript
/**
 * Module Name
 * Description of what this module does
 * 
 * @version 1.0.0
 */
(function() {
    'use strict';
    
    // Module implementation
    
    // Export to global namespace if needed
    window.ModuleName = ModuleName;
})();
```

### Event Naming
- Use namespace prefix: `gmkb:`
- Use descriptive names: `gmkb:component-added`
- Document events in code

### Error Handling
- Always use try-catch for critical operations
- Log errors with structured logger
- Provide fallback behavior

## Development Guidelines

### Adding New Modules

1. **Determine Category**: Place in appropriate directory
2. **Follow Architecture**: Ensure event-driven, no polling
3. **Update Dependencies**: Add to enqueue.php with proper deps
4. **Document Events**: List all events module listens to/dispatches
5. **Add Tests**: Create corresponding test in `/tests/`

### Debugging

Enable debug mode:
```javascript
window.gmkbData.debugMode = true;
```

Use structured logger:
```javascript
window.structuredLogger?.log('component', 'Component loaded', { id: 123 });
```

### Performance

- Minimize DOM queries - cache elements
- Use event delegation for dynamic elements
- Batch DOM updates
- Lazy load non-critical modules

## Module Communication

### Example Event Flow
```javascript
// Module A dispatches event
window.GMKB.dispatch('gmkb:data-loaded', { data: {...} });

// Module B listens for event
window.GMKB.on('gmkb:data-loaded', (eventData) => {
    // Handle data
});
```

### State Updates
```javascript
// Update state
window.enhancedStateManager.dispatch({
    type: 'ADD_COMPONENT',
    payload: { component: {...} }
});

// Subscribe to state changes
window.enhancedStateManager.subscribe((state) => {
    // React to state change
});
```

## Troubleshooting

### Common Issues

1. **Module not loading**: Check enqueue.php dependencies
2. **Events not firing**: Verify event names and timing
3. **State not updating**: Ensure using dispatch method
4. **AJAX failing**: Check nonce and ajaxurl

### Debug Commands

```javascript
// Check system status
window.GMKB?.status();

// List registered events
window.GMKB?.listEvents();

// Get current state
window.enhancedStateManager?.getState();

// Force re-initialization
window.GMKB?.reinitialize();
```

## Future Improvements

- [ ] Implement ES6 modules with build process
- [ ] Add TypeScript for type safety
- [ ] Create comprehensive test suite
- [ ] Add performance monitoring
- [ ] Implement code splitting

## Contact

For questions about the JavaScript architecture, consult the main project documentation or contact the development team.
