/**
 * Import/Export Service
 * Bridges the legacy export button with the Vue ImportExportModal
 */

class ImportExportService {
  constructor() {
    this.modalOpen = false;
    this.listeners = [];
  }

  /**
   * Initialize the service and attach to export button
   */
  initialize() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.attachToButton());
    } else {
      this.attachToButton();
    }

    // Expose global command
    if (window.GMKB) {
      window.GMKB.openImportExport = () => this.openModal();
      window.GMKB.closeImportExport = () => this.closeModal();
    }

    console.log('✅ ImportExportService initialized');
  }

  /**
   * Attach click handler to the export button
   */
  attachToButton() {
    const exportBtn = document.getElementById('export-btn');
    
    if (exportBtn) {
      // Remove any existing listeners
      exportBtn.replaceWith(exportBtn.cloneNode(true));
      const newBtn = document.getElementById('export-btn');
      
      // Add click handler
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openModal();
      });

      console.log('✅ Export button connected to ImportExportModal');
    } else {
      // Button not found yet, retry after a short delay
      setTimeout(() => this.attachToButton(), 100);
    }
  }

  /**
   * Open the import/export modal
   */
  openModal() {
    this.modalOpen = true;
    this.notifyListeners('open');
    
    // Dispatch event for Vue components to listen
    document.dispatchEvent(new CustomEvent('gmkb:open-import-export'));
    
    console.log('📤 Opening Import/Export modal');
  }

  /**
   * Close the import/export modal
   */
  closeModal() {
    this.modalOpen = false;
    this.notifyListeners('close');
    
    // Dispatch event for Vue components to listen
    document.dispatchEvent(new CustomEvent('gmkb:close-import-export'));
    
    console.log('📤 Closing Import/Export modal');
  }

  /**
   * Subscribe to modal state changes
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners(action) {
    this.listeners.forEach(callback => {
      try {
        callback(action, this.modalOpen);
      } catch (error) {
        console.error('ImportExportService listener error:', error);
      }
    });
  }

  /**
   * Get current modal state
   */
  isModalOpen() {
    return this.modalOpen;
  }
}

// Create singleton instance
const importExportService = new ImportExportService();

// Auto-initialize
importExportService.initialize();

// Export for ES modules
export default importExportService;

// Also expose globally for compatibility
if (typeof window !== 'undefined') {
  window.importExportService = importExportService;
}
