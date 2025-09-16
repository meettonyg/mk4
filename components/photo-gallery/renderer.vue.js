// Vue renderer wrapper for photo-gallery component
import { createApp } from 'vue';
import PhotoGallery from './PhotoGallery.vue';

export default {
    render(data = {}, container) {
        console.log('🖼️ Rendering Photo Gallery component with data:', data);
        
        // Ensure container exists
        if (!container) {
            console.error('Photo Gallery Vue renderer: No container provided');
            return null;
        }
        
        // Extract Pods data if available
        const podsData = window.gmkbData?.pods_data || {};
        
        // Merge component data with Pods data
        const mergedData = {
            vertical_image: data.vertical_image || podsData.vertical_image || '',
            horizontal_image: data.horizontal_image || podsData.horizontal_image || '',
            guest_headshot: data.guest_headshot || podsData.guest_headshot || '',
            guest_carousel_images: data.guest_carousel_images || podsData.guest_carousel_images || [],
            images: data.images || [],
            title: data.title || 'Photo Gallery',
            columns: data.columns || 3,
            galleryStyle: data.galleryStyle || 'masonry',
            lazyLoad: data.lazyLoad !== false,
            showCaptions: data.showCaptions !== false,
            componentId: data.id || data.componentId || `photo-gallery_${Date.now()}`
        };
        
        const app = createApp(PhotoGallery, mergedData);
        
        // Set up update handler for edit panel
        app.config.globalProperties.$updateData = (newData) => {
            Object.assign(mergedData, newData);
            app.unmount();
            this.render(mergedData, container);
        };
        
        app.mount(container);
        return app;
    },
    
    // Mark as Vue renderer
    isVueRenderer: true,
    
    // Configuration for the edit panel
    editConfig: {
        fields: [
            {
                type: 'text',
                name: 'title',
                label: 'Gallery Title',
                placeholder: 'Photo Gallery'
            },
            {
                type: 'select',
                name: 'columns',
                label: 'Number of Columns',
                options: [
                    { value: 1, label: '1 Column' },
                    { value: 2, label: '2 Columns' },
                    { value: 3, label: '3 Columns' },
                    { value: 4, label: '4 Columns' },
                    { value: 5, label: '5 Columns' },
                    { value: 6, label: '6 Columns' }
                ]
            },
            {
                type: 'select',
                name: 'galleryStyle',
                label: 'Gallery Style',
                options: [
                    { value: 'masonry', label: 'Masonry (Mixed sizes)' },
                    { value: 'uniform', label: 'Uniform (Square)' },
                    { value: 'mixed', label: 'Mixed Layout' }
                ]
            },
            {
                type: 'checkbox',
                name: 'lazyLoad',
                label: 'Enable Lazy Loading'
            },
            {
                type: 'checkbox',
                name: 'showCaptions',
                label: 'Show Image Captions'
            },
            {
                type: 'separator',
                label: 'Pod Images (Auto-loaded if available)'
            },
            {
                type: 'image',
                name: 'vertical_image',
                label: 'Vertical Image',
                placeholder: 'URL or select image'
            },
            {
                type: 'image',
                name: 'horizontal_image',
                label: 'Horizontal Image',
                placeholder: 'URL or select image'
            },
            {
                type: 'image',
                name: 'guest_headshot',
                label: 'Guest Headshot',
                placeholder: 'URL or select image'
            },
            {
                type: 'repeater',
                name: 'images',
                label: 'Additional Images',
                fields: [
                    {
                        type: 'image',
                        name: 'url',
                        label: 'Image URL'
                    },
                    {
                        type: 'text',
                        name: 'alt',
                        label: 'Alt Text'
                    },
                    {
                        type: 'text',
                        name: 'caption',
                        label: 'Caption'
                    }
                ]
            }
        ]
    }
};
