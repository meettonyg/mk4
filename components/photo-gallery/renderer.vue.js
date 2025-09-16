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
        
        // ROOT FIX: Pods data is the source of truth for content
        const podsData = window.gmkbData?.pods_data || {};
        
        // Collect all image fields from Pods data
        const podsImages = [];
        
        // Add main images from Pods
        if (podsData.guest_headshot) {
            podsImages.push({
                url: podsData.guest_headshot,
                alt: 'Guest Headshot',
                caption: podsData.first_name && podsData.last_name ? `${podsData.first_name} ${podsData.last_name}` : 'Guest Photo'
            });
        }
        if (podsData.vertical_image) {
            podsImages.push({
                url: podsData.vertical_image,
                alt: 'Vertical Image',
                caption: ''
            });
        }
        if (podsData.horizontal_image) {
            podsImages.push({
                url: podsData.horizontal_image,
                alt: 'Horizontal Image',
                caption: ''
            });
        }
        
        // Check for numbered photo fields (photo_1, photo_2, etc.)
        for (let i = 1; i <= 20; i++) {
            if (podsData[`photo_${i}`] || podsData[`image_${i}`]) {
                podsImages.push({
                    url: podsData[`photo_${i}`] || podsData[`image_${i}`],
                    alt: podsData[`photo_${i}_alt`] || podsData[`image_${i}_alt`] || `Photo ${i}`,
                    caption: podsData[`photo_${i}_caption`] || podsData[`image_${i}_caption`] || ''
                });
            }
        }
        
        // Handle carousel images if they exist
        const carouselImages = podsData.guest_carousel_images || podsData.carousel_images || [];
        if (Array.isArray(carouselImages)) {
            carouselImages.forEach((img, idx) => {
                if (typeof img === 'string') {
                    podsImages.push({ url: img, alt: `Carousel Image ${idx + 1}`, caption: '' });
                } else if (img && img.url) {
                    podsImages.push(img);
                }
            });
        }
        
        // Pods data takes precedence for content, component data for configuration
        const mergedData = {
            // Content from Pods
            vertical_image: podsData.vertical_image || '',
            horizontal_image: podsData.horizontal_image || '',
            guest_headshot: podsData.guest_headshot || '',
            guest_carousel_images: carouselImages,
            images: podsImages.length > 0 ? podsImages : (data.images || []),
            // Configuration from component
            title: data.title || data.config?.title || 'Photo Gallery',
            columns: data.columns || data.config?.columns || 3,
            galleryStyle: data.galleryStyle || data.config?.galleryStyle || 'masonry',
            lazyLoad: data.lazyLoad !== undefined ? data.lazyLoad : (data.config?.lazyLoad !== false),
            showCaptions: data.showCaptions !== undefined ? data.showCaptions : (data.config?.showCaptions !== false),
            componentId: data.id || data.componentId || `photo-gallery_${Date.now()}`
        };
        
        console.log('🖼️ Photo Gallery: Found', podsImages.length, 'images from Pods data');
        console.log('🖼️ Photo Gallery: Merged data being passed to Vue component:', mergedData);
        
        const app = createApp(PhotoGallery, mergedData);
        
        // Set up update handler for edit panel
        app.config.globalProperties.$updateData = (newData) => {
            // ROOT FIX: Only save configuration, not Pods content
            const configOnly = {
                title: newData.title,
                columns: newData.columns,
                galleryStyle: newData.galleryStyle,
                lazyLoad: newData.lazyLoad,
                showCaptions: newData.showCaptions,
                // Don't save images - those come from Pods
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
