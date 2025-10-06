/**
 * Keyboard Manager
 * 
 * Provides comprehensive keyboard navigation and shortcuts
 * for improved productivity and accessibility.
 * 
 * @version 2.0.0
 */

import eventBus from './EventBus.js';

export class KeyboardManager {
  constructor() {
    this.shortcuts = new Map();
    this.activeElement = null;
    this.enabled = true;
    this.modalOpen = false;
    this.init();
  }

  init() {
    console.log('⌨️ Initializing KeyboardManager...');
    
    // Register default shortcuts
    this.registerDefaults();
    
    // Listen for keyboard events
    document.addEventListener('keydown', this.handleKeyDown.bind(this), true);
    document.addEventListener('keyup', this.handleKeyUp.bind(this), true);
    
    // Listen for modal state
    eventBus.on('modal:opened', () => { this.modalOpen = true; });
    eventBus.on('modal:closed', () => { this.modalOpen = false; });
    
    console.log('✅ KeyboardManager initialized');
  }

  /**
   * Register default keyboard shortcuts
   */
  registerDefaults() {
    // Save
    this.register('mod+s', () => {
      eventBus.emit('keyboard:save');
    }, 'Save');

    // Copy
    this.register('mod+c', () => {
      if (!this.isInputElement(document.activeElement)) {
        eventBus.emit('keyboard:copy');
      }
    }, 'Copy');

    // Paste
    this.register('mod+v', () => {
      if (!this.isInputElement(document.activeElement)) {
        eventBus.emit('keyboard:paste');
      }
    }, 'Paste');

    // Duplicate
    this.register('mod+d', () => {
      eventBus.emit('keyboard:duplicate');
    }, 'Duplicate');

    // Delete
    this.register('delete', () => {
      eventBus.emit('keyboard:delete');
    }, 'Delete');
    
    this.register('backspace', () => {
      if (!this.isInputElement(document.activeElement)) {
        eventBus.emit('keyboard:delete');
      }
    }, 'Delete (backspace)');

    // Deselect
    this.register('escape', () => {
      eventBus.emit('keyboard:deselect');
    }, 'Deselect');

    // Focus navigation
    this.register('tab', () => {
      eventBus.emit('keyboard:focus-next');
    }, 'Next component');

    this.register('shift+tab', () => {
      eventBus.emit('keyboard:focus-prev');
    }, 'Previous component');

    // Arrow navigation
    this.register('arrowup', () => {
      if (!this.isInputElement(document.activeElement)) {
        eventBus.emit('keyboard:move-up');
      }
    }, 'Move up');

    this.register('arrowdown', () => {
      if (!this.isInputElement(document.activeElement)) {
        eventBus.emit('keyboard:move-down');
      }
    }, 'Move down');

    this.register('arrowleft', () => {
      if (!this.isInputElement(document.activeElement)) {
        eventBus.emit('keyboard:move-left');
      }
    }, 'Move left');

    this.register('arrowright', () => {
      if (!this.isInputElement(document.activeElement)) {
        eventBus.emit('keyboard:move-right');
      }
    }, 'Move right');

    // Select all
    this.register('mod+a', () => {
      if (!this.isInputElement(document.activeElement)) {
        eventBus.emit('keyboard:select-all');
      }
    }, 'Select all');

    // Find
    this.register('mod+f', () => {
      eventBus.emit('keyboard:find');
    }, 'Find');

    // Toggle component library
    this.register('mod+k', () => {
      eventBus.emit('keyboard:toggle-library');
    }, 'Toggle component library');

    // Toggle preview
    this.register('mod+p', () => {
      eventBus.emit('keyboard:toggle-preview');
    }, 'Toggle preview');

    console.log(`✅ Registered ${this.shortcuts.size} default shortcuts`);
  }

  /**
   * Register a keyboard shortcut
   * 
   * @param {string} keys - Key combination (e.g., 'mod+s', 'ctrl+shift+a')
   * @param {Function} handler - Handler function
   * @param {string} description - Human-readable description
   * @param {Object} options - Additional options
   */
  register(keys, handler, description, options = {}) {
    const normalized = this.normalizeKeys(keys);
    
    this.shortcuts.set(normalized, {
      keys,
      handler,
      description,
      allowInInput: options.allowInInput || false,
      allowInModal: options.allowInModal || false,
      priority: options.priority || 0
    });
  }

  /**
   * Unregister a keyboard shortcut
   * 
   * @param {string} keys - Key combination
   */
  unregister(keys) {
    const normalized = this.normalizeKeys(keys);
    this.shortcuts.delete(normalized);
  }

  /**
   * Normalize key combination
   * 
   * @param {string} keys - Key combination
   * @returns {string} Normalized keys
   */
  normalizeKeys(keys) {
    return keys
      .toLowerCase()
      .replace('mod', this.isMac() ? 'meta' : 'ctrl')
      .split('+')
      .sort()
      .join('+');
  }

  /**
   * Handle keydown event
   * 
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyDown(e) {
    if (!this.enabled) {
      return;
    }
    
    const keys = this.getKeysFromEvent(e);
    const shortcut = this.shortcuts.get(keys);
    
    if (!shortcut) {
      return;
    }
    
    // Check if shortcut is allowed in current context
    if (!this.isShortcutAllowed(shortcut, e)) {
      return;
    }
    
    // Prevent default and execute handler
    e.preventDefault();
    e.stopPropagation();
    
    try {
      shortcut.handler(e);
    } catch (error) {
      console.error('Keyboard shortcut error:', error);
    }
  }

  /**
   * Handle keyup event
   * 
   * @param {KeyboardEvent} e - Keyboard event
   */
  handleKeyUp(e) {
    // Placeholder for future keyup handling
  }

  /**
   * Get normalized keys from event
   * 
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {string} Normalized key combination
   */
  getKeysFromEvent(e) {
    const keys = [];
    
    if (e.ctrlKey) keys.push('ctrl');
    if (e.metaKey) keys.push('meta');
    if (e.altKey) keys.push('alt');
    if (e.shiftKey) keys.push('shift');
    
    // Add the actual key
    const key = e.key.toLowerCase();
    if (key && !['control', 'meta', 'alt', 'shift'].includes(key)) {
      keys.push(key);
    }
    
    return keys.sort().join('+');
  }

  /**
   * Check if shortcut is allowed in current context
   * 
   * @param {Object} shortcut - Shortcut definition
   * @param {KeyboardEvent} e - Keyboard event
   * @returns {boolean} Whether shortcut is allowed
   */
  isShortcutAllowed(shortcut, e) {
    // Check if in modal and shortcut doesn't allow modal
    if (this.modalOpen && !shortcut.allowInModal) {
      return false;
    }
    
    // Check if in input field and shortcut doesn't allow input
    if (this.isInputElement(e.target) && !shortcut.allowInInput) {
      // Allow if using modifier keys
      if (e.ctrlKey || e.metaKey) {
        return true;
      }
      return false;
    }
    
    return true;
  }

  /**
   * Check if element is input element
   * 
   * @param {HTMLElement} element - Element to check
   * @returns {boolean} Whether element is input
   */
  isInputElement(element) {
    if (!element) return false;
    
    const tagName = element.tagName.toLowerCase();
    return tagName === 'input' || 
           tagName === 'textarea' || 
           tagName === 'select' ||
           element.contentEditable === 'true';
  }

  /**
   * Check if running on Mac
   * 
   * @returns {boolean} Whether on Mac
   */
  isMac() {
    return navigator.platform.toLowerCase().includes('mac');
  }

  /**
   * Get all registered shortcuts
   * 
   * @returns {Array} List of shortcuts
   */
  getAllShortcuts() {
    return Array.from(this.shortcuts.entries()).map(([keys, shortcut]) => ({
      keys,
      ...shortcut
    }));
  }

  /**
   * Get shortcuts by category
   * 
   * @returns {Object} Shortcuts grouped by category
   */
  getShortcutsByCategory() {
    const categories = {
      editing: [],
      navigation: [],
      view: [],
      other: []
    };
    
    this.shortcuts.forEach((shortcut, keys) => {
      const category = this.categorizeShortcut(shortcut);
      categories[category].push({ keys, ...shortcut });
    });
    
    return categories;
  }

  /**
   * Categorize shortcut
   * 
   * @param {Object} shortcut - Shortcut definition
   * @returns {string} Category
   */
  categorizeShortcut(shortcut) {
    const desc = shortcut.description.toLowerCase();
    
    if (desc.includes('copy') || desc.includes('paste') || 
        desc.includes('delete') || desc.includes('duplicate') ||
        desc.includes('save')) {
      return 'editing';
    }
    
    if (desc.includes('next') || desc.includes('prev') || 
        desc.includes('move') || desc.includes('focus')) {
      return 'navigation';
    }
    
    if (desc.includes('toggle') || desc.includes('preview') || 
        desc.includes('library')) {
      return 'view';
    }
    
    return 'other';
  }

  /**
   * Enable/disable keyboard manager
   * 
   * @param {boolean} enabled - Whether to enable
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(enabled ? '✅ Keyboard manager enabled' : '⏸️ Keyboard manager disabled');
  }

  /**
   * Get formatted shortcut string for display
   * 
   * @param {string} keys - Key combination
   * @returns {string} Formatted string
   */
  formatShortcut(keys) {
    const isMac = this.isMac();
    
    return keys
      .replace('mod', isMac ? '⌘' : 'Ctrl')
      .replace('ctrl', isMac ? '⌃' : 'Ctrl')
      .replace('meta', '⌘')
      .replace('alt', isMac ? '⌥' : 'Alt')
      .replace('shift', isMac ? '⇧' : 'Shift')
      .split('+')
      .map(key => key.charAt(0).toUpperCase() + key.slice(1))
      .join(isMac ? '' : '+');
  }
}

// Export singleton instance
export const keyboardManager = new KeyboardManager();

// Export utility function
export function getShortcutString(keys) {
  return keyboardManager.formatShortcut(keys);
}
