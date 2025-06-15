/**
 * Script Loader - Handles loading and dependency management for JavaScript files
 */

class ScriptLoader {
    constructor() {
        this.scripts = [];
        this.loaded = {};
    }

    /**
     * Add a script to the queue
     * @param {string} src - Script source path
     * @param {Array} dependencies - Array of dependency script sources
     * @param {boolean} isModule - Whether the script is an ES module
     * @param {boolean} defer - Whether to defer script loading
     */
    enqueue(src, dependencies = [], isModule = false, defer = true) {
        this.scripts.push({
            src,
            dependencies,
            isModule,
            defer,
            loaded: false
        });
    }

    /**
     * Load all scripts in the correct order
     */
    loadScripts() {
        // Start loading
        this._loadNextScript();
    }

    /**
     * Check if all dependencies are loaded
     * @param {Object} script - Script object
     * @returns {boolean} Whether all dependencies are loaded
     */
    _areDependenciesLoaded(script) {
        return script.dependencies.every(dep => this.loaded[dep]);
    }

    /**
     * Load the next script in the queue
     */
    _loadNextScript() {
        // Find the next script with all dependencies loaded
        const nextScript = this.scripts.find(script => 
            !script.loaded && this._areDependenciesLoaded(script)
        );

        if (!nextScript) {
            // Check if all scripts are loaded
            if (this.scripts.every(script => script.loaded)) {
                console.log('All scripts loaded successfully');
                return;
            }
            
            // Wait and try again (in case of circular dependencies or other issues)
            setTimeout(() => this._loadNextScript(), 50);
            return;
        }

        // Create script element
        const scriptElement = document.createElement('script');
        scriptElement.src = nextScript.src;
        
        if (nextScript.isModule) {
            scriptElement.type = 'module';
        }
        
        if (nextScript.defer) {
            scriptElement.defer = true;
        }
        
        // Set onload handler
        scriptElement.onload = () => {
            nextScript.loaded = true;
            this.loaded[nextScript.src] = true;
            console.log(`Loaded: ${nextScript.src}`);
            this._loadNextScript(); // Load next script
        };
        
        // Handle errors
        scriptElement.onerror = () => {
            console.error(`Failed to load script: ${nextScript.src}`);
            this._loadNextScript(); // Try to continue with next script
        };
        
        // Add to document
        document.body.appendChild(scriptElement);
    }
}

// Make ScriptLoader available globally
window.ScriptLoader = ScriptLoader;
