// Vue renderer wrapper for logo-grid component
import { createApp } from 'vue';
import LogoGrid from './LogoGrid.vue';

export default {
    render(data = {}, container) {
        console.log('🏢 Rendering Logo Grid component with data:', data);
        
        // Ensure container exists
        if (!container) {
            console.error('Logo Grid Vue renderer: No container provided');
            return null;
        }
        
        // ROOT FIX: Pods data is the source of truth for content
        const podsData = window.gmkbData?.pods_data || {};
        
        // Collect all logo fields from Pods data
        const podsLogos = [];
        // Check for numbered logo fields (logo_1, logo_2, etc.)
        for (let i = 1; i <= 20; i++) {
            if (podsData[`logo_${i}`]) {
                podsLogos.push({
                    url: podsData[`logo_${i}`],
                    name: podsData[`logo_${i}_name`] || `Logo ${i}`,
                    alt: podsData[`logo_${i}_alt`] || `Logo ${i}`,
                    link: podsData[`logo_${i}_link`] || ''
                });
            }
        }
        
        // Pods data takes precedence for content, component data for configuration
        const mergedData = {
            // Content from Pods
            guest_logo: podsData.guest_logo || podsData.logo || '',
            logo_image: podsData.logo_image || podsData.company_logo || '',
            logos: podsLogos.length > 0 ? podsLogos : (data.logos || []),
            // Configuration from component
            title: data.title || data.config?.title || 'Featured In',
            subtitle: data.subtitle || data.config?.subtitle || '',
            columns: data.columns || data.config?.columns || 4,
            displayStyle: data.displayStyle || data.config?.displayStyle || 'boxed',
            grayscaleEffect: data.grayscaleEffect !== undefined ? data.grayscaleEffect : (data.config?.grayscaleEffect !== false),
            showNames: data.showNames || data.config?.showNames || false,
            openInNewTab: data.openInNewTab !== undefined ? data.openInNewTab : (data.config?.openInNewTab !== false),
            componentId: data.id || data.componentId || `logo-grid_${Date.now()}`
        };
        
        console.log('🏢 Logo Grid: Found', podsLogos.length, 'logos from Pods data');
        console.log('🏢 Logo Grid: Merged data being passed to Vue component:', mergedData);
        
        const app = createApp(LogoGrid, mergedData);
        
        // Set up update handler for edit panel
        app.config.globalProperties.$updateData = (newData) => {
            // ROOT FIX: Only save configuration, not Pods content
            const configOnly = {
                title: newData.title,
                subtitle: newData.subtitle,
                columns: newData.columns,
                displayStyle: newData.displayStyle,
                grayscaleEffect: newData.grayscaleEffect,
                showNames: newData.showNames,
                openInNewTab: newData.openInNewTab,
                // Don't save logos - those come from Pods or manual additions
            };
            
            if (window.GMKB?.stateManager) {
                window.GMKB.stateManager.updateComponent(mergedData.componentId, {
                    config: configOnly,
                    data: { dataSource: 'pods' },
                    props: {}
                });
            }
            
            // Re-render with fresh Pods data
            app.unmount();
            this.render({ ...data, ...configOnly }, container);
        };
        
        const instance = app.mount(container);
        
        // Store app reference for cleanup
        container._vueApp = app;
        
        return instance;
    },
    
    /**
     * Update the component with new data
     */
    update(data, container) {
        this.destroy(container);
        this.render(data, container);
    },
    
    /**
     * Unmount the component
     */
    destroy(container) {
        if (container && container._vueApp) {
            container._vueApp.unmount();
            delete container._vueApp;
        }
    },
    
    // Mark as Vue renderer
    isVueRenderer: true,
    framework: 'vue',
    
    // Configuration for the edit panel
    editConfig: {
        fields: [
            {
                type: 'text',
                name: 'title',
                label: 'Title',
                placeholder: 'Featured In'
            },
            {
                type: 'text',
                name: 'subtitle',
                label: 'Subtitle',
                placeholder: 'As seen on these platforms'
            },
            {
                type: 'select',
                name: 'columns',
                label: 'Number of Columns',
                options: [
                    { value: 2, label: '2 Columns' },
                    { value: 3, label: '3 Columns' },
                    { value: 4, label: '4 Columns' },
                    { value: 5, label: '5 Columns' },
                    { value: 6, label: '6 Columns' },
                    { value: 8, label: '8 Columns' }
                ]
            },
            {
                type: 'select',
                name: 'displayStyle',
                label: 'Display Style',
                options: [
                    { value: 'boxed', label: 'Boxed' },
                    { value: 'minimal', label: 'Minimal' },
                    { value: 'circular', label: 'Circular' }
                ]
            },
            {
                type: 'checkbox',
                name: 'grayscaleEffect',
                label: 'Grayscale Effect (Color on Hover)'
            },
            {
                type: 'checkbox',
                name: 'showNames',
                label: 'Show Logo Names'
            },
            {
                type: 'checkbox',
                name: 'openInNewTab',
                label: 'Open Links in New Tab'
            },
            {
                type: 'separator',
                label: 'Pods Logos (Auto-loaded)'
            },
            {
                type: 'image',
                name: 'guest_logo',
                label: 'Guest Logo',
                placeholder: 'URL or select image'
            },
            {
                type: 'image',
                name: 'logo_image',
                label: 'Company Logo',
                placeholder: 'URL or select image'
            },
            {
                type: 'separator',
                label: 'Additional Logos'
            },
            {
                type: 'repeater',
                name: 'logos',
                label: 'Logo List',
                fields: [
                    {
                        type: 'image',
                        name: 'url',
                        label: 'Logo Image URL'
                    },
                    {
                        type: 'text',
                        name: 'name',
                        label: 'Logo Name'
                    },
                    {
                        type: 'text',
                        name: 'alt',
                        label: 'Alt Text'
                    },
                    {
                        type: 'text',
                        name: 'link',
                        label: 'Link URL',
                        placeholder: 'https://...'
                    }
                ]
            }
        ]
    }
};
