/**
 * @file design-panel.js
 * @description Manages the design panel for editing component properties.
 *
 * This version includes a fix to properly export the 'designPanel' instance,
 * making it accessible to other modules that need to interact with it.
 */

import {
    state
} from '../state.js';
import {
    debounce
} from '../utils/helpers.js';

class DesignPanel {
    constructor() {
        this.panel = document.getElementById('design-panel');
        this.content = document.getElementById('design-panel-content');
        this.closeButton = document.getElementById('close-design-panel');
        this.currentComponentId = null;

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => this.hide());
        }
    }

    /**
     * Loads the design panel with the controls for a specific component.
     * @param {string} componentId - The ID of the component to load.
     */
    async load(componentId) {
        this.currentComponentId = componentId;
        const component = state.getComponent(componentId);
        if (!component) {
            this.content.innerHTML = '<p>Component not found.</p>';
            this.show();
            return;
        }

        try {
            const response = await fetch(`${window.guestifyData.pluginUrl}components/${component.type}/design-panel.php`);
            if (!response.ok) throw new Error('Failed to load design panel');

            const html = await response.text();
            this.content.innerHTML = html;
            this.bindControls(component.props);
            this.show();
        } catch (error) {
            console.error('Error loading design panel:', error);
            this.content.innerHTML = '<p>Error loading design options.</p>';
            this.show();
        }
    }

    /**
     * Binds the design panel controls to the component's properties.
     * @param {object} props - The component's properties.
     */
    bindControls(props) {
        const inputs = this.content.querySelectorAll('[data-prop]');
        const debouncedUpdate = debounce((id, newProps) => {
            window.componentManager.updateComponent(id, newProps);
        }, 300);

        inputs.forEach(input => {
            const propName = input.dataset.prop;
            if (props.hasOwnProperty(propName)) {
                input.value = props[propName];
            }

            input.addEventListener('input', () => {
                const newProps = { ...state.getComponent(this.currentComponentId).props
                };
                newProps[propName] = input.value;
                debouncedUpdate(this.currentComponentId, newProps);
            });
        });
    }

    /**
     * Shows the design panel.
     */
    show() {
        if (this.panel) {
            this.panel.classList.add('visible');
        }
    }

    /**
     * Hides the design panel.
     */
    hide() {
        if (this.panel) {
            this.panel.classList.remove('visible');
        }
    }
}

// FIX: Export the designPanel instance so it can be imported by other modules.
export const designPanel = new DesignPanel();
