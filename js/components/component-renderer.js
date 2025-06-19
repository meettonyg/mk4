/**
 * @file component-renderer.js
 * @description Renders individual components for the Media Kit Builder. This is a legacy renderer
 * and is being phased out in favor of the EnhancedComponentRenderer.
 *
 * This version is updated to use the new dynamicComponentLoader, fixing module export errors.
 */
import {
    state
} from '../state.js';
// FIX: Import the dynamicComponentLoader instance instead of the old renderComponent function.
import {
    dynamicComponentLoader
} from './dynamic-component-loader.js';

/**
 * Renders all components currently in the state.
 */
export async function renderAllComponents() {
    const previewContainer = document.getElementById('media-kit-preview');
    if (!previewContainer) return;

    previewContainer.innerHTML = ''; // Clear existing content

    for (const componentId of state.layout) {
        const component = state.getComponent(componentId);
        if (component) {
            // FIX: Use the renderComponent method from the new dynamicComponentLoader instance.
            const componentHtml = await dynamicComponentLoader.renderComponent({
                type: component.type,
                id: component.id,
                props: component.props
            });
            if (componentHtml) {
                previewContainer.appendChild(componentHtml);
            }
        }
    }
}
