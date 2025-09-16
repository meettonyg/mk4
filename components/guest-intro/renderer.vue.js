// Vue renderer wrapper for guest-intro component
import { createApp } from 'vue';
import GuestIntro from './GuestIntro.vue';

export default {
    render(data = {}, container) {
        console.log('🎭 Rendering Guest Intro component with data:', data);
        console.log('🎭 Guest Intro: Available Pods data:', window.gmkbData?.pods_data || {});
        
        // Ensure container exists
        if (!container) {
            console.error('Guest Intro Vue renderer: No container provided');
            return null;
        }
        
        // ROOT FIX: Pods data is the source of truth for content
        const podsData = window.gmkbData?.pods_data || {};
        
        // Build full name from Pods data
        const fullName = podsData.first_name && podsData.last_name 
            ? `${podsData.first_name} ${podsData.last_name}` 
            : podsData.full_name || '';
        
        // Pods data takes precedence for content, component data for configuration
        const mergedData = {
            // Content from Pods
            full_name: fullName,
            first_name: podsData.first_name || '',
            last_name: podsData.last_name || '',
            guest_title: podsData.guest_title || podsData.title || '',
            company: podsData.company || podsData.organization || '',
            introduction: podsData.introduction || podsData.bio_short || podsData.biography_short || '',
            tagline: podsData.tagline || podsData.motto || '',
            // Configuration from component
            layout: data.layout || data.config?.layout || 'centered',
            componentId: data.id || data.componentId || `guest-intro_${Date.now()}`
        };
        
        console.log('🎭 Guest Intro: Merged data being passed to Vue component:', mergedData);
        console.log('🎭 Guest Intro: Full name:', fullName);
        
        const app = createApp(GuestIntro, mergedData);
        
        // Set up update handler for edit panel
        app.config.globalProperties.$updateData = (newData) => {
            // ROOT FIX: Only save configuration, not Pods content
            const configOnly = {
                layout: newData.layout,
                // Don't save name/title/content fields - those come from Pods
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
                type: 'select',
                name: 'layout',
                label: 'Layout Style',
                options: [
                    { value: 'centered', label: 'Centered' },
                    { value: 'left-aligned', label: 'Left Aligned' },
                    { value: 'card', label: 'Card Style' }
                ]
            },
            {
                type: 'text',
                name: 'full_name',
                label: 'Full Name',
                placeholder: 'Or use First + Last name below'
            },
            {
                type: 'text',
                name: 'first_name',
                label: 'First Name'
            },
            {
                type: 'text',
                name: 'last_name',
                label: 'Last Name'
            },
            {
                type: 'text',
                name: 'guest_title',
                label: 'Professional Title',
                placeholder: 'e.g., CEO, Author, Speaker'
            },
            {
                type: 'text',
                name: 'company',
                label: 'Company/Organization'
            },
            {
                type: 'text',
                name: 'tagline',
                label: 'Tagline',
                placeholder: 'A memorable quote or tagline'
            },
            {
                type: 'textarea',
                name: 'introduction',
                label: 'Introduction',
                placeholder: 'Brief introduction paragraph',
                rows: 4
            }
        ]
    }
};
