/**
 * Chunked Export Service - Phase 16
 * 
 * Handles large media kit exports by processing in chunks
 * Prevents timeouts and provides progress feedback
 * 
 * @version 1.0.0
 */

import eventBus from '@/services/EventBus';
import { ToastService } from '@/services/ToastService';

export class ChunkedExportService {
  constructor(options = {}) {
    this.options = {
      chunkSize: 10,           // Process 10 items per chunk
      chunkDelay: 50,          // 50ms delay between chunks
      timeout: 30000,          // 30 second overall timeout
      format: 'json',          // Default export format
      prettify: true,          // Pretty print JSON
      includeMetadata: true,   // Include export metadata
      compress: false,         // Compress large exports
      ...options
    };
    
    // State
    this.isExporting = false;
    this.progress = 0;
    this.abortController = null;
    
    // Statistics
    this.stats = {
      totalExports: 0,
      totalSize: 0,
      averageTime: 0,
      largestExport: 0
    };
  }

  /**
   * Export media kit with chunked processing
   * @param {Object} store - Media kit store
   * @param {Object} exportOptions - Export configuration
   */
  async exportMediaKit(store, exportOptions = {}) {
    if (this.isExporting) {
      throw new Error('Export already in progress');
    }
    
    const options = { ...this.options, ...exportOptions };
    const startTime = Date.now();
    
    this.isExporting = true;
    this.progress = 0;
    this.abortController = new AbortController();
    
    try {
      // Emit start event
      eventBus.emit('export:started', { timestamp: startTime });
      
      // Gather data to export
      const exportData = await this.gatherExportData(store, options);
      
      // Process components in chunks
      const processedComponents = await this.processComponents(
        Object.values(store.components || {}),
        options
      );
      
      // Process sections in chunks
      const processedSections = await this.processSections(
        store.sections || [],
        options
      );
      
      // Build final export structure
      const finalExport = this.buildExportStructure({
        store,
        components: processedComponents,
        sections: processedSections,
        exportData,
        options
      });
      
      // Convert to requested format
      const result = await this.formatExport(finalExport, options);
      
      // Update statistics
      this.updateStatistics(result, Date.now() - startTime);
      
      // Emit completion event
      eventBus.emit('export:completed', {
        size: this.getSize(result),
        duration: Date.now() - startTime,
        format: options.format
      });
      
      this.progress = 100;
      
      return result;
      
    } catch (error) {
      // Handle export error
      console.error('Export failed:', error);
      
      eventBus.emit('export:failed', { error: error.message });
      
      throw error;
      
    } finally {
      this.isExporting = false;
      this.abortController = null;
    }
  }

  /**
   * Gather data for export
   */
  async gatherExportData(store, options) {
    const data = {
      metadata: {},
      theme: {},
      settings: {},
      profile: {}
    };
    
    // Metadata
    if (options.includeMetadata) {
      data.metadata = {
        version: '2.0.0',
        exportDate: new Date().toISOString(),
        postId: store.postId,
        postTitle: store.postTitle,
        componentCount: Object.keys(store.components || {}).length,
        sectionCount: (store.sections || []).length,
        theme: store.theme
      };
    }
    
    // Theme data
    data.theme = {
      id: store.theme,
      customizations: store.themeCustomizations || {},
      presets: store.themePresets || []
    };
    
    // Global settings
    data.settings = store.globalSettings || {};
    
    // Profile data (if requested)
    if (options.includeProfile) {
      data.profile = store.profileData || {};
    }
    
    return data;
  }

  /**
   * Process components in chunks
   */
  async processComponents(components, options) {
    const chunks = this.createChunks(components, options.chunkSize);
    const processed = [];
    let chunkIndex = 0;
    
    for (const chunk of chunks) {
      // Check for abort
      if (this.abortController?.signal.aborted) {
        throw new Error('Export aborted');
      }
      
      // Process chunk
      const processedChunk = await this.processChunk(chunk, 'component', chunkIndex);
      processed.push(...processedChunk);
      
      // Update progress
      chunkIndex++;
      const componentProgress = (chunkIndex / chunks.length) * 50; // 50% for components
      this.updateProgress(componentProgress);
      
      // Delay between chunks to prevent blocking
      if (chunkIndex < chunks.length) {
        await this.delay(options.chunkDelay);
      }
    }
    
    return processed;
  }

  /**
   * Process sections in chunks
   */
  async processSections(sections, options) {
    const chunks = this.createChunks(sections, options.chunkSize);
    const processed = [];
    let chunkIndex = 0;
    
    for (const chunk of chunks) {
      // Check for abort
      if (this.abortController?.signal.aborted) {
        throw new Error('Export aborted');
      }
      
      // Process chunk
      const processedChunk = await this.processChunk(chunk, 'section', chunkIndex);
      processed.push(...processedChunk);
      
      // Update progress
      chunkIndex++;
      const sectionProgress = 50 + (chunkIndex / chunks.length) * 40; // 40% for sections
      this.updateProgress(sectionProgress);
      
      // Delay between chunks
      if (chunkIndex < chunks.length) {
        await this.delay(options.chunkDelay);
      }
    }
    
    return processed;
  }

  /**
   * Process a single chunk
   */
  async processChunk(items, type, index) {
    return new Promise((resolve) => {
      // Use setTimeout to yield to main thread
      setTimeout(() => {
        const processed = items.map(item => {
          // Clean and validate item
          const cleanItem = this.cleanExportItem(item, type);
          
          // Add export metadata
          cleanItem._export = {
            type,
            chunkIndex: index,
            timestamp: Date.now()
          };
          
          return cleanItem;
        });
        
        resolve(processed);
      }, 0);
    });
  }

  /**
   * Clean export item (remove internal properties)
   */
  cleanExportItem(item, type) {
    // Create deep copy
    const clean = JSON.parse(JSON.stringify(item));
    
    // Remove internal properties
    const internalProps = ['_uid', '_dirty', '_temp', '__vueComponent'];
    internalProps.forEach(prop => delete clean[prop]);
    
    // Type-specific cleaning
    if (type === 'component') {
      // Ensure required fields
      if (!clean.type) clean.type = 'unknown';
      if (!clean.id) clean.id = `comp_${Date.now()}`;
      if (!clean.data) clean.data = {};
      if (!clean.props) clean.props = {};
    }
    
    if (type === 'section') {
      // Ensure required fields
      if (!clean.section_id) clean.section_id = `section_${Date.now()}`;
      if (!clean.type && !clean.layout) clean.layout = 'full_width';
    }
    
    return clean;
  }

  /**
   * Build final export structure
   */
  buildExportStructure({ store, components, sections, exportData, options }) {
    const structure = {
      version: '2.0.0',
      timestamp: Date.now(),
      ...exportData.metadata
    };
    
    // Add components
    if (options.format === 'json') {
      // For JSON, use object format for components
      structure.components = {};
      components.forEach(comp => {
        structure.components[comp.id] = comp;
      });
    } else {
      // For other formats, use array
      structure.components = components;
    }
    
    // Add sections
    structure.sections = sections;
    
    // Add theme and settings
    structure.theme = exportData.theme.id;
    structure.themeCustomizations = exportData.theme.customizations;
    structure.globalSettings = exportData.settings;
    
    // Add Profile data if included
    if (exportData.profile && Object.keys(exportData.profile).length > 0) {
      structure.profileData = exportData.profile;
    }
    
    return structure;
  }

  /**
   * Format export based on requested format
   */
  async formatExport(data, options) {
    const format = options.format.toLowerCase();
    
    switch (format) {
      case 'json':
        return this.formatJSON(data, options);
        
      case 'blob':
        return this.formatBlob(data, options);
        
      case 'base64':
        return this.formatBase64(data, options);
        
      case 'csv':
        return this.formatCSV(data, options);
        
      default:
        return data;
    }
  }

  /**
   * Format as JSON string
   */
  formatJSON(data, options) {
    const json = options.prettify 
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);
    
    if (options.compress) {
      return this.compressString(json);
    }
    
    return json;
  }

  /**
   * Format as Blob
   */
  formatBlob(data, options) {
    const json = this.formatJSON(data, options);
    
    return new Blob([json], {
      type: 'application/json;charset=utf-8'
    });
  }

  /**
   * Format as Base64
   */
  formatBase64(data, options) {
    const json = this.formatJSON(data, options);
    
    if (typeof btoa !== 'undefined') {
      return btoa(unescape(encodeURIComponent(json)));
    }
    
    // Node.js fallback
    return Buffer.from(json).toString('base64');
  }

  /**
   * Format as CSV (simplified)
   */
  formatCSV(data, options) {
    const rows = [];
    
    // Header
    rows.push(['Type', 'ID', 'Name', 'Data']);
    
    // Components
    Object.values(data.components || {}).forEach(comp => {
      rows.push([
        'component',
        comp.id,
        comp.type,
        JSON.stringify(comp.data || {})
      ]);
    });
    
    // Sections
    (data.sections || []).forEach(section => {
      rows.push([
        'section',
        section.section_id,
        section.layout || section.type,
        JSON.stringify(section.settings || {})
      ]);
    });
    
    // Convert to CSV string
    return rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  }

  /**
   * Compress string using simple compression
   */
  compressString(str) {
    // Simple RLE compression for repeated patterns
    return str.replace(/(.)\1{2,}/g, (match, char) => {
      return `${char}${match.length}`;
    });
  }

  /**
   * Download export as file
   */
  async downloadExport(store, filename = null, options = {}) {
    try {
      // Generate filename if not provided
      if (!filename) {
        const date = new Date().toISOString().split('T')[0];
        const postTitle = store.postTitle?.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'media-kit';
        filename = `${postTitle}-export-${date}.json`;
      }
      
      // Show progress toast
      const toastId = ToastService.info('Preparing export...', 0);
      
      // Export as blob
      const blob = await this.exportMediaKit(store, { 
        ...options, 
        format: 'blob' 
      });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      // Update toast
      ToastService.remove(toastId);
      ToastService.success('Export downloaded successfully');
      
      return { success: true, filename };
      
    } catch (error) {
      console.error('Download failed:', error);
      ToastService.error(`Export failed: ${error.message}`);
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Create chunks from array
   */
  createChunks(array, size) {
    const chunks = [];
    
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    
    return chunks;
  }

  /**
   * Update progress
   */
  updateProgress(progress) {
    this.progress = Math.min(100, Math.max(0, progress));
    
    eventBus.emit('export:progress', {
      progress: this.progress
    });
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get size of export data
   */
  getSize(data) {
    if (data instanceof Blob) {
      return data.size;
    }
    
    if (typeof data === 'string') {
      return new Blob([data]).size;
    }
    
    return JSON.stringify(data).length;
  }

  /**
   * Update export statistics
   */
  updateStatistics(result, duration) {
    const size = this.getSize(result);
    
    this.stats.totalExports++;
    this.stats.totalSize += size;
    this.stats.averageTime = 
      (this.stats.averageTime * (this.stats.totalExports - 1) + duration) / 
      this.stats.totalExports;
    this.stats.largestExport = Math.max(this.stats.largestExport, size);
  }

  /**
   * Abort current export
   */
  abort() {
    if (this.abortController) {
      this.abortController.abort();
      this.isExporting = false;
      this.progress = 0;
      
      eventBus.emit('export:aborted');
      
      return true;
    }
    return false;
  }

  /**
   * Get export status
   */
  getStatus() {
    return {
      isExporting: this.isExporting,
      progress: this.progress,
      stats: { ...this.stats }
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalExports: 0,
      totalSize: 0,
      averageTime: 0,
      largestExport: 0
    };
  }
}

// Create singleton instance
const chunkedExportService = new ChunkedExportService();

// Expose for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.__exportService = chunkedExportService;
  console.log('[ChunkedExportService] Available at window.__exportService');
}

export default chunkedExportService;
export { ChunkedExportService };
