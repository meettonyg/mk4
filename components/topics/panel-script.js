/**
 * @file panel-script.js - Manages the design panel for the Topics component.
 * @description Handles UI interactions, data fetching, and updating for the topics component's settings in the sidebar.
 * @version 3.0.0 (Event-Driven)
 */

// Use a strict-mode, self-executing function to protect the scope.
(function() {
    'use strict';

    /**
     * The main controller for the Topics component's design panel.
     */
    const TopicsDesignPanelManager = {
        // --- ROOT FIX: Initialize properties in the init method ---
        // This ensures a clean state every time an instance is created.
        
        /**
         * Initializes the manager for a specific component instance.
         * This function is now called by an event listener when the panel is ready.
         * @param {string} componentId - The unique ID of the component instance.
         */
        init(componentId) {
            console.log(`🔄 Initializing Topics Design Panel for component: ${componentId}`);

            // Initialize state for this specific instance
            this.componentId = componentId;
            this.panelElement = document.querySelector(`#element-editor[data-current-component="${componentId}"]`);
            this.state = {
                isLoading: false,
                dataSourceId: null,
            };

            if (!this.panelElement) {
                console.error(`Topics Panel Error: Could not find the panel element for component ${componentId}.`);
                return;
            }

            // Find and set up UI elements within the specific panel
            this.ui = {
                dataSourceInput: this.panelElement.querySelector('.gmkb-data-source-picker'),
                resultsContainer: this.panelElement.querySelector('.data-source-results'),
                loadingIndicator: this.panelElement.querySelector('.gmkb-spinner'),
                clearButton: this.panelElement.querySelector('.clear-data-source'),
            };

            this.bindEventListeners();
            this.loadInitialState();
            
            console.log(`✅ Topics Design Panel for ${componentId} initialized successfully.`);
        },

        /**
         * Binds all necessary event listeners for the panel UI.
         */
        bindEventListeners() {
            if (this.ui.dataSourceInput) {
                // Use a debounce function to prevent excessive requests while typing
                this.ui.dataSourceInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
            }

            if (this.ui.resultsContainer) {
                this.ui.resultsContainer.addEventListener('click', this.handleResultSelection.bind(this));
            }

            if (this.ui.clearButton) {
                this.ui.clearButton.addEventListener('click', this.handleClearDataSource.bind(this));
            }
        },

        /**
         * Loads the initial state of the component (e.g., the currently linked data source).
         */
        loadInitialState() {
            if (this.ui.dataSourceInput && this.ui.dataSourceInput.dataset.selectedName) {
                this.state.dataSourceId = this.ui.dataSourceInput.dataset.selectedId;
                this.ui.dataSourceInput.value = this.ui.dataSourceInput.dataset.selectedName;
                this.ui.dataSourceInput.disabled = true;
                this.ui.clearButton.style.display = 'inline-block';
            }
        },

        /**
         * Handles the search input for finding a data source.
         * @param {Event} e The input event.
         */
        async handleSearch(e) {
            const searchTerm = e.target.value.trim();

            if (searchTerm.length < 3) {
                this.ui.resultsContainer.innerHTML = '';
                return;
            }

            this.setLoading(true);

            try {
                const response = await fetch(window.gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        action: 'gmkb_search_posts',
                        nonce: window.gmkbData.nonce,
                        search_term: searchTerm,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const results = await response.json();
                this.renderResults(results.data);

            } catch (error) {
                console.error('Error searching for data source:', error);
                this.ui.resultsContainer.innerHTML = '<div class="result-item">Error loading results.</div>';
            } finally {
                this.setLoading(false);
            }
        },

        /**
         * Renders the search results from the server.
         * @param {Array} results - An array of post objects.
         */
        renderResults(results) {
            this.ui.resultsContainer.innerHTML = '';
            if (!results || results.length === 0) {
                this.ui.resultsContainer.innerHTML = '<div class="result-item">No results found.</div>';
                return;
            }

            results.forEach(post => {
                const item = document.createElement('div');
                item.className = 'result-item';
                item.dataset.id = post.ID;
                item.dataset.title = post.post_title;
                item.textContent = `${post.post_title} (${post.post_type})`;
                this.ui.resultsContainer.appendChild(item);
            });
        },

        /**
         * Handles the selection of a result from the search list.
         * @param {Event} e The click event.
         */
        async handleResultSelection(e) {
            const selectedItem = e.target.closest('.result-item');
            if (!selectedItem || !selectedItem.dataset.id) return;

            this.state.dataSourceId = selectedItem.dataset.id;
            const dataSourceName = selectedItem.dataset.title;

            // Update UI
            this.ui.dataSourceInput.value = dataSourceName;
            this.ui.dataSourceInput.disabled = true;
            this.ui.resultsContainer.innerHTML = '';
            this.ui.clearButton.style.display = 'inline-block';

            // --- Update the component's state in the main application ---
            await this.updateComponentDataSource();
        },
        
        /**
         * Clears the currently selected data source.
         */
        async handleClearDataSource() {
            this.state.dataSourceId = null;
            this.ui.dataSourceInput.value = '';
            this.ui.dataSourceInput.disabled = false;
            this.ui.clearButton.style.display = 'none';
            this.ui.dataSourceInput.focus();

            // --- Update the component's state in the main application ---
            await this.updateComponentDataSource();
        },

        /**
         * Communicates with the main StateManager to update the component's data.
         */
        async updateComponentDataSource() {
            if (window.GMKB?.systems?.ComponentManager?.updateComponentWithRerender) {
                console.log(`Updating component ${this.componentId} with data source ID: ${this.state.dataSourceId}`);
                await window.GMKB.systems.ComponentManager.updateComponentWithRerender(this.componentId, {
                    data: { dataSourceId: this.state.dataSourceId }
                });
            } else {
                console.error('ComponentManager is not available to update the data source.');
            }
        },

        /**
         * Toggles the loading indicator's visibility.
         * @param {boolean} isLoading - Whether to show the loading spinner.
         */
        setLoading(isLoading) {
            this.state.isLoading = isLoading;
            this.ui.loadingIndicator.style.display = isLoading ? 'block' : 'none';
        },

        /**
         * A utility function to debounce rapid events.
         * @param {Function} func - The function to call after the delay.
         * @param {number} delay - The delay in milliseconds.
         * @returns {Function} A debounced version of the function.
         */
        debounce(func, delay) {
            let timeout;
            return function(...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), delay);
            };
        }
    };

    /**
     * --- ROOT FIX: Event-Driven Initialization ---
     * We listen for the 'gmkb:design-panel-ready' event from the main app.
     * This is the signal that a component's design panel has been loaded into the sidebar
     * and is ready for its specific JavaScript logic to be initialized.
     */
    document.addEventListener('gmkb:design-panel-ready', (event) => {
        const { component, componentId, panelType } = event.detail;

        // We only care about the 'topics' component
        if (component === 'topics') {
            // Create a new, isolated instance of the manager for this specific component.
            // This ensures that if you have multiple "Topics" components, their design panels
            // will not interfere with each other.
            const panelManagerInstance = Object.create(TopicsDesignPanelManager);
            panelManagerInstance.init(componentId);
        }
    });

})();