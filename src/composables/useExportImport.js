// src/composables/useExportImport.js
import { ref, computed } from 'vue';
import { useMediaKitStore } from '../stores/mediaKit';

export function useExportImport() {
  const store = useMediaKitStore();
  const isExporting = ref(false);
  const isImporting = ref(false);
  const importPreview = ref(null);
  const importConflicts = ref([]);

  /**
   * Export formats configuration
   */
  const exportFormats = {
    // Full export with all data
    full: () => ({
      version: '3.0.0',
      format: 'full',
      created: new Date().toISOString(),
      wordpress_version: window.gmkbData?.wpVersion || 'unknown',
      plugin_version: window.gmkbData?.pluginVersion || '3.0.0',
      components: store.components,
      sections: store.sections,
      theme: store.theme,
      themeCustomizations: store.themeCustomizations,
      globalSettings: store.globalSettings,
      podsData: store.podsData,
      metadata: {
        componentCount: Object.keys(store.components).length,
        sectionCount: store.sections.length,
        exportedBy: window.gmkbData?.currentUser?.display_name || 'Unknown',
        exportedFrom: window.location.hostname,
        postId: store.postId,
        postTitle: store.postTitle
      }
    }),

    // Template export - structure without content
    template: () => ({
      version: '3.0.0',
      format: 'template',
      created: new Date().toISOString(),
      sections: store.sections.map(section => ({
        type: section.type || 'standard',
        layout: section.layout,
        title: section.title
      })),
      componentTypes: [...new Set(Object.values(store.components).map(c => c.type))],
      theme: store.theme,
      themeCustomizations: store.themeCustomizations,
      metadata: {
        sectionCount: store.sections.length,
        componentTypes: [...new Set(Object.values(store.components).map(c => c.type))].length,
        exportedBy: window.gmkbData?.currentUser?.display_name || 'Unknown'
      }
    }),

    // Components only export
    components: () => ({
      version: '3.0.0',
      format: 'components',
      created: new Date().toISOString(),
      components: store.components,
      metadata: {
        componentCount: Object.keys(store.components).length,
        componentTypes: [...new Set(Object.values(store.components).map(c => c.type))],
        exportedBy: window.gmkbData?.currentUser?.display_name || 'Unknown'
      }
    }),

    // Single component export
    componentOnly: (componentId) => {
      const component = store.components[componentId];
      if (!component) {
        throw new Error(`Component ${componentId} not found`);
      }

      return {
        version: '3.0.0',
        format: 'single_component',
        created: new Date().toISOString(),
        component: component,
        metadata: {
          componentId: componentId,
          componentType: component.type,
          exportedBy: window.gmkbData?.currentUser?.display_name || 'Unknown'
        }
      };
    }
  };

  /**
   * Download JSON file with exported data
   */
  const downloadJSON = (data, filename) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Export media kit using WordPress AJAX
   */
  const exportMediaKit = async (format = 'full', componentId = null) => {
    isExporting.value = true;

    try {
      let exportData;
      let filename;

      if (format === 'componentOnly' && componentId) {
        exportData = exportFormats.componentOnly(componentId);
        const component = store.components[componentId];
        filename = `component-${component.type}-${Date.now()}.json`;
      } else if (exportFormats[format]) {
        // Use WordPress AJAX for server-side export (better compatibility)
        const formData = new FormData();
        formData.append('action', 'gmkb_export_media_kit');
        formData.append('nonce', window.gmkbData?.nonce || '');
        formData.append('post_id', store.postId);
        formData.append('export_type', format);

        const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error('Export request failed');
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.data?.message || 'Export failed');
        }

        exportData = result.data.export_data;
        filename = result.data.filename;
      } else {
        throw new Error(`Unknown export format: ${format}`);
      }

      downloadJSON(exportData, filename);

      // Show success message
      if (window.gmkbData?.showNotifications) {
        store.showNotification('Export completed successfully', 'success');
      }

      return exportData;

    } catch (error) {
      console.error('Export error:', error);
      if (window.gmkbData?.showNotifications) {
        store.showNotification('Export failed: ' + error.message, 'error');
      }
      throw error;
    } finally {
      isExporting.value = false;
    }
  };

  /**
   * Validate import data using WordPress AJAX
   */
  const validateImport = async (fileContent) => {
    try {
      const importData = JSON.parse(fileContent);
      
      // Check version compatibility locally
      if (!importData.version) {
        throw new Error('Invalid import file: missing version');
      }

      const majorVersion = parseInt(importData.version.split('.')[0]);
      if (majorVersion < 2) {
        throw new Error('Import file version too old. Please use version 2.0.0 or newer.');
      }

      // Check format
      if (!importData.format) {
        throw new Error('Invalid import file: missing format');
      }

      // Use WordPress AJAX for server-side validation
      const formData = new FormData();
      formData.append('action', 'gmkb_validate_import');
      formData.append('nonce', window.gmkbData?.nonce || '');
      formData.append('import_data', JSON.stringify(importData));

      const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Validation request failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.data?.message || 'Validation failed');
      }

      const validation = result.data;

      // Detect local conflicts
      const conflicts = [];
      
      if (importData.format === 'full' || importData.format === 'components') {
        const importedComponents = importData.components || {};
        const existingIds = Object.keys(store.components);
        const importedIds = Object.keys(importedComponents);
        
        const duplicateIds = importedIds.filter(id => existingIds.includes(id));
        
        if (duplicateIds.length > 0) {
          conflicts.push({
            type: 'duplicate_components',
            count: duplicateIds.length,
            ids: duplicateIds,
            resolution: 'replace' // or 'rename', 'skip'
          });
        }
      }

      // Store preview data
      importPreview.value = {
        version: importData.version,
        format: importData.format,
        created: importData.created,
        metadata: importData.metadata,
        componentCount: validation.summary?.components_count || (importData.components ? Object.keys(importData.components).length : 0),
        sectionCount: validation.summary?.sections_count || (importData.sections ? importData.sections.length : 0),
        hasTheme: !!importData.theme,
        hasPodsData: !!importData.podsData
      };

      importConflicts.value = conflicts;

      return { 
        valid: validation.valid, 
        data: importData, 
        conflicts,
        warnings: validation.warnings || []
      };

    } catch (error) {
      console.error('Import validation error:', error);
      return { valid: false, error: error.message };
    }
  };

  /**
   * Execute import with conflict resolution using WordPress AJAX
   */
  const executeImport = async (importData, resolutions = {}) => {
    isImporting.value = true;

    try {
      // Prepare form data for WordPress AJAX
      const formData = new FormData();
      formData.append('action', 'gmkb_import_media_kit');
      formData.append('nonce', window.gmkbData?.nonce || '');
      formData.append('post_id', store.postId);
      formData.append('import_data', JSON.stringify(importData));
      formData.append('import_mode', resolutions.import_mode || 'replace');
      formData.append('resolutions', JSON.stringify(resolutions));

      const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Import request failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.data?.message || 'Import failed');
      }

      // Reload the media kit state from server
      await store.loadFromAPI();

      // Clear preview after successful import
      importPreview.value = null;
      importConflicts.value = [];

      // Show success message
      if (window.gmkbData?.showNotifications) {
        store.showNotification('Import completed successfully', 'success');
      }

      return true;

    } catch (error) {
      console.error('Import execution error:', error);
      if (window.gmkbData?.showNotifications) {
        store.showNotification('Import failed: ' + error.message, 'error');
      }
      throw error;
    } finally {
      isImporting.value = false;
    }
  };

  /**
   * Load file for import
   */
  const loadImportFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsText(file);
    });
  };

  /**
   * Copy component to clipboard
   */
  const copyComponentToClipboard = async (componentId) => {
    try {
      const exportData = exportFormats.componentOnly(componentId);
      const jsonStr = JSON.stringify(exportData, null, 2);
      
      await navigator.clipboard.writeText(jsonStr);
      
      if (window.gmkbData?.showNotifications) {
        store.showNotification('Component copied to clipboard', 'success');
      }
      
      return true;
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      if (window.gmkbData?.showNotifications) {
        store.showNotification('Failed to copy to clipboard', 'error');
      }
      return false;
    }
  };

  /**
   * Paste component from clipboard
   */
  const pasteComponentFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const validation = await validateImport(clipboardText);
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      
      if (validation.data.format === 'single_component' && validation.data.component) {
        await store.addComponent(validation.data.component);
        
        if (window.gmkbData?.showNotifications) {
          store.showNotification('Component pasted successfully', 'success');
        }
        
        return validation.data.component;
      } else {
        throw new Error('Clipboard does not contain a valid component');
      }
    } catch (error) {
      console.error('Paste from clipboard error:', error);
      if (window.gmkbData?.showNotifications) {
        store.showNotification('Failed to paste from clipboard: ' + error.message, 'error');
      }
      return null;
    }
  };

  return {
    // State
    isExporting,
    isImporting,
    importPreview,
    importConflicts,

    // Methods
    exportMediaKit,
    validateImport,
    executeImport,
    loadImportFile,
    copyComponentToClipboard,
    pasteComponentFromClipboard,

    // Export formats info
    exportFormats: computed(() => Object.keys(exportFormats).filter(f => f !== 'componentOnly'))
  };
}
