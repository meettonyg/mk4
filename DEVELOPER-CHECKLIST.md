# Post-Update Developer Checklist
Before finalizing any commit, review your changes against this checklist to ensure stability, quality, and adherence to our architectural principles.

## Phase 0: WordPress Page Detection (CRITICAL)
**The builder WILL NOT WORK if page detection fails. Scripts won't load without proper detection.**

- [ ] **URL-Based Detection**: Does the early_builder_detection() method properly detect all URL patterns including:
   - `/guestify-media-kit/`
   - `/guestify-media-kit/?post_id=X`
   - Any variation with query parameters

- [ ] **Detection Logging**: Are there clear console logs showing detection status?
   - Look for "✅ BUILDER PAGE DETECTED!" in logs
   - Verify "✅ SCRIPT ENQUEUING TRIGGERED!" appears

- [ ] **Fallback Detection**: Is there a fallback detection in enqueue_scripts() for edge cases?

- [ ] **Template Takeover**: Does isolated_builder_template_takeover() also detect the page correctly?

- [ ] **Script Loading Verification**: Do the JavaScript bundles actually load?
   - Check for `<script>` tags with core-systems-bundle.js and application-bundle.js
   - Verify no "Initializing Clean Enhanced Builder..." hanging message

## Phase 1: Architectural Integrity & Race Condition Prevention
This is the most critical section. The goal is to ensure all asynchronous operations are event-driven and predictable.

- [ ] **No Polling**: Have I introduced any setTimeout or setInterval loops to wait for a system or module to become available?
   - If yes, this is a failure. Revert and use an event-based approach.

- [ ] **Event-Driven Initialization**: Is all asynchronous initialization and coordination handled by the established event system (e.g., listening for coreSystemsReady or other specific system events)?

- [ ] **Dependency-Awareness**: If this code depends on another module or system, does it explicitly listen for that system's "ready" event before executing?

- [ ] **No Global Object Sniffing**: Have I avoided checking for the existence of global objects (window.enhancedComponentManager, window.stateManager) as a way to infer system readiness?
   - Correct Method: Rely on data passed through event listeners or module imports.

- [ ] **Root Cause Fix**: Does this change fix the fundamental cause of an issue, not just a symptom?
   - Example: Instead of increasing a timeout duration (fixing a symptom), the change should replace the timeout with an event listener (fixing the root cause).

## Phase 2: Code Quality & Simplicity (The "Anti-Bloat" Check)
This ensures we don't solve problems by adding unnecessary complexity or over-engineering solutions.

- [ ] **Simplicity First**: Is this the simplest possible solution that correctly and robustly solves the problem?

- [ ] **Code Reduction**: Did this change refactor or remove more code than it added? If not, is the added code fully justified?

- [ ] **No Redundant Logic**: Does this code duplicate any functionality that already exists in a core service (like the EnhancedStateManager, enhanced-system-registrar, or helper utilities)?
   - If functionality is needed in multiple places, promote it to a shared utility/service.

- [ ] **Maintainability**: Is the code's purpose immediately clear to another developer? Is it easy to read and understand?

- [ ] **Documentation**: If I introduced a new event, a complex function, or a non-obvious workflow, is it clearly documented with comments?

## Phase 3: State Management & Data Integrity
This ensures the application's state remains predictable and consistent.

- [ ] **Centralized State**: Are all reads and writes to the application state performed through the EnhancedStateManager?

- [ ] **No Direct Manipulation**: Have I avoided modifying the state object directly from outside the state manager? All changes must be dispatched as actions.

- [ ] **Schema Compliance**: Do any new or modified state properties conform to the established state-schema.js?

## Phase 4: Error Handling & Diagnostics
This ensures that when things do break, they do so gracefully and are easy to debug.

- [ ] **Graceful Failure**: Does the new code properly handle potential failure states (e.g., a failed AJAX request, an unavailable module)?

- [ ] **Actionable Error Messages**: Are any new error messages sent to the EnhancedErrorHandler clear, contextual, and actionable for a developer?

- [ ] **Diagnostic Logging**: Have I added relevant logs using the structured-logger for critical steps in the new code's lifecycle?

## Phase 5: WordPress Integration
This ensures we continue to follow WordPress best practices.

- [ ] **Correct Enqueuing**: If new JavaScript or CSS files were added, were they registered and enqueued correctly in includes/enqueue.php?

- [ ] **Dependency Chain**: Are script dependencies ($deps array in wp_enqueue_script) correctly defined to enforce a reliable load order?

- [ ] **No Inline Clutter**: Have I avoided adding inline `<script>` or `<style>` tags directly into template files?

## Critical Debug Steps When Scripts Don't Load

1. **Check Browser Console** for these specific messages:
   ```
   GMKB ROOT FIX: Checking URL: /your-url-here
   GMKB ROOT FIX: ✅ BUILDER PAGE DETECTED!
   GMKB ROOT FIX: ✅ SCRIPT ENQUEUING TRIGGERED!
   ```

2. **View Page Source** and search for:
   - `core-systems-bundle.js`
   - `application-bundle.js`
   - If missing, page detection failed

3. **Check WordPress Debug Log** at `/wp-content/debug.log`

4. **Run Test File**: Access `/wp-content/plugins/mk4/test-root-fix.php` to verify detection logic

5. **Common Issues**:
   - URL doesn't contain "guestify-media-kit" exactly
   - WordPress page slug doesn't match
   - Scripts cached with old version
   - Theme/plugin conflicts dequeuing scripts
