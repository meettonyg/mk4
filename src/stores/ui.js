/**
 * UI Store - Separated UI State Management
 * 
 * ROOT FIX: Separates UI state from domain state
 * This store handles all UI-related state that doesn't need to be persisted
 * 
 * @package GMKB
 * @version 2.0.0
 */

import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', {
    state: () => ({
        // Selection state
        selectedComponentId: null,
        selectedComponentIds: [], // For multi-select
        hoveredComponentId: null,
        
        // Editor state
        editingComponentId: null,
        editPanelOpen: false,
        designPanelOpen: false,
        
        // Modal state
        componentLibraryOpen: false,
        themeCustomizerOpen: false,
        importExportModalOpen: false,
        importExportModalTab: 'export',
        
        // Drag state
        isDragging: false,
        draggedComponentId: null,
        draggedComponentType: null,
        dropTargetId: null,
        dropTargetPosition: null,
        
        // View state
        devicePreview: 'desktop', // desktop, tablet, mobile
        zoomLevel: 100,
        showGrid: false,
        showOutlines: false,
        
        // Sidebar state
        sidebarOpen: true,
        sidebarTab: 'components', // components, sections, settings
        
        // Toast notifications
        toasts: [],
        
        // Loading states
        isComponentLibraryLoading: false,
        isDesignPanelLoading: false,
        
        // Search/filter state
        componentSearchQuery: '',
        componentCategoryFilter: 'all',
        
        // Toolbar state
        toolbarCompact: false,
        showDeviceSelector: true,
        
        // Help/onboarding
        showTour: false,
        tourStep: 0,
        showKeyboardShortcuts: false
    }),
    
    getters: {
        // Check if any component is selected
        hasSelection: (state) => state.selectedComponentIds.length > 0,
        
        // Check if multiple components are selected
        hasMultiSelection: (state) => state.selectedComponentIds.length > 1,
        
        // Check if a specific component is selected
        isComponentSelected: (state) => (componentId) => {
            return state.selectedComponentIds.includes(componentId);
        },
        
        // Check if any modal is open
        hasModalOpen: (state) => {
            return state.componentLibraryOpen || 
                   state.themeCustomizerOpen || 
                   state.importExportModalOpen ||
                   state.editPanelOpen ||
                   state.designPanelOpen;
        },
        
        // Get active toast count
        activeToastCount: (state) => state.toasts.length,
        
        // Check if in mobile preview
        isMobilePreview: (state) => state.devicePreview === 'mobile',
        
        // Check if in tablet preview
        isTabletPreview: (state) => state.devicePreview === 'tablet'
    },
    
    actions: {
        // Selection actions
        selectComponent(componentId, multiple = false) {
            if (multiple) {
                if (!this.selectedComponentIds.includes(componentId)) {
                    this.selectedComponentIds.push(componentId);
                }
            } else {
                this.selectedComponentIds = [componentId];
            }
            this.selectedComponentId = componentId;
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('gmkb:component-selected', {
                detail: { componentId, multiple }
            }));
        },
        
        deselectComponent(componentId) {
            this.selectedComponentIds = this.selectedComponentIds.filter(id => id !== componentId);
            if (this.selectedComponentId === componentId) {
                this.selectedComponentId = this.selectedComponentIds[0] || null;
            }
        },
        
        clearSelection() {
            this.selectedComponentIds = [];
            this.selectedComponentId = null;
        },
        
        toggleComponentSelection(componentId) {
            if (this.isComponentSelected(componentId)) {
                this.deselectComponent(componentId);
            } else {
                this.selectComponent(componentId, true);
            }
        },
        
        // Hover actions
        setHoveredComponent(componentId) {
            this.hoveredComponentId = componentId;
        },
        
        clearHoveredComponent() {
            this.hoveredComponentId = null;
        },
        
        // Editor actions
        openComponentEditor(componentId) {
            this.editingComponentId = componentId;
            this.editPanelOpen = true;
            this.designPanelOpen = false; // Close design panel
            
            document.dispatchEvent(new CustomEvent('gmkb:editor-opened', {
                detail: { componentId }
            }));
        },
        
        closeComponentEditor() {
            this.editPanelOpen = false;
            this.editingComponentId = null;
        },
        
        openDesignPanel(componentId) {
            this.editingComponentId = componentId;
            this.designPanelOpen = true;
            this.editPanelOpen = false; // Close edit panel
            
            document.dispatchEvent(new CustomEvent('gmkb:design-panel-opened', {
                detail: { componentId }
            }));
        },
        
        closeDesignPanel() {
            this.designPanelOpen = false;
            if (!this.editPanelOpen) {
                this.editingComponentId = null;
            }
        },
        
        // Modal actions
        openComponentLibrary() {
            this.componentLibraryOpen = true;
            document.dispatchEvent(new CustomEvent('gmkb:component-library-opened'));
        },
        
        closeComponentLibrary() {
            this.componentLibraryOpen = false;
        },
        
        openThemeCustomizer() {
            this.themeCustomizerOpen = true;
        },
        
        closeThemeCustomizer() {
            this.themeCustomizerOpen = false;
        },
        
        openImportExportModal(tab = 'export') {
            this.importExportModalOpen = true;
            this.importExportModalTab = tab;
        },
        
        closeImportExportModal() {
            this.importExportModalOpen = false;
        },
        
        // Drag actions
        startDrag(componentId, componentType = null) {
            this.isDragging = true;
            this.draggedComponentId = componentId;
            this.draggedComponentType = componentType;
        },
        
        updateDropTarget(targetId, position = null) {
            this.dropTargetId = targetId;
            this.dropTargetPosition = position;
        },
        
        endDrag() {
            this.isDragging = false;
            this.draggedComponentId = null;
            this.draggedComponentType = null;
            this.dropTargetId = null;
            this.dropTargetPosition = null;
        },
        
        // View actions
        setDevicePreview(device) {
            if (['desktop', 'tablet', 'mobile'].includes(device)) {
                this.devicePreview = device;
                
                document.dispatchEvent(new CustomEvent('gmkb:device-preview-changed', {
                    detail: { device }
                }));
            }
        },
        
        setZoomLevel(level) {
            this.zoomLevel = Math.max(25, Math.min(200, level));
        },
        
        toggleGrid() {
            this.showGrid = !this.showGrid;
        },
        
        toggleOutlines() {
            this.showOutlines = !this.showOutlines;
        },
        
        // Sidebar actions
        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen;
        },
        
        setSidebarTab(tab) {
            this.sidebarTab = tab;
            this.sidebarOpen = true; // Ensure sidebar is open
        },
        
        // Toast actions
        showToast(message, type = 'info', duration = 3000) {
            const id = Date.now() + Math.random();
            const toast = { id, message, type, duration };
            
            this.toasts.push(toast);
            
            // Auto-remove after duration
            if (duration > 0) {
                setTimeout(() => {
                    this.removeToast(id);
                }, duration);
            }
            
            return id;
        },
        
        removeToast(id) {
            this.toasts = this.toasts.filter(t => t.id !== id);
        },
        
        clearToasts() {
            this.toasts = [];
        },
        
        // Search/filter actions
        setComponentSearchQuery(query) {
            this.componentSearchQuery = query;
        },
        
        setComponentCategoryFilter(category) {
            this.componentCategoryFilter = category;
        },
        
        // Toolbar actions
        toggleToolbarCompact() {
            this.toolbarCompact = !this.toolbarCompact;
        },
        
        // Tour actions
        startTour() {
            this.showTour = true;
            this.tourStep = 0;
        },
        
        nextTourStep() {
            this.tourStep++;
        },
        
        prevTourStep() {
            if (this.tourStep > 0) {
                this.tourStep--;
            }
        },
        
        endTour() {
            this.showTour = false;
            this.tourStep = 0;
        },
        
        // Keyboard shortcuts
        toggleKeyboardShortcuts() {
            this.showKeyboardShortcuts = !this.showKeyboardShortcuts;
        },
        
        // Reset UI state
        resetUIState() {
            // Clear selections
            this.clearSelection();
            this.clearHoveredComponent();
            
            // Close all panels and modals
            this.editPanelOpen = false;
            this.designPanelOpen = false;
            this.componentLibraryOpen = false;
            this.themeCustomizerOpen = false;
            this.importExportModalOpen = false;
            
            // Reset drag state
            this.endDrag();
            
            // Reset view to defaults
            this.devicePreview = 'desktop';
            this.zoomLevel = 100;
            this.showGrid = false;
            this.showOutlines = false;
            
            // Clear toasts
            this.clearToasts();
            
            console.log('✅ UI state reset');
        }
    }
});
