<?php
/**
 * Design Panel
 * 
 * This file handles the display of the component selection panel.
 */

require_once __DIR__ . '/ComponentDiscovery.php';
require_once __DIR__ . '/ComponentLoader.php';

class DesignPanel {
    private $componentsDir;
    private $discovery;
    private $loader;
    
    /**
     * Constructor
     * 
     * @param string $componentsDir Path to the components directory
     */
    public function __construct($componentsDir) {
        $this->componentsDir = $componentsDir;
        $this->discovery = new ComponentDiscovery($componentsDir);
        $this->loader = new ComponentLoader($componentsDir, $this->discovery);
        
        // Scan components
        $this->discovery->scan();
    }
    
    /**
     * Render the design panel
     * 
     * @return string Rendered design panel HTML
     */
    public function render() {
        $categories = $this->discovery->getCategories();
        
        ob_start();
        ?>
        <div class="design-panel">
            <div class="design-panel-header">
                <div class="design-panel-tabs">
                    <button class="design-panel-tab active" data-tab="components">Components</button>
                    <button class="design-panel-tab" data-tab="design">Design</button>
                    <button class="design-panel-tab" data-tab="layout">Layout</button>
                </div>
            </div>
            
            <div class="design-panel-content">
                <div class="design-panel-section" data-tab-content="components">
                    <?php foreach ($categories as $categoryName => $components): ?>
                        <div class="component-category">
                            <h2 class="component-category-title">
                                <?php echo ucfirst($categoryName); ?> Components
                                <?php if ($categoryName === 'premium'): ?>
                                    <span class="premium-badge">PRO</span>
                                <?php endif; ?>
                            </h2>
                            <div class="component-grid">
                                <?php foreach ($components as $component): ?>
                                    <div class="component-item<?php echo $component['isPremium'] ? ' premium' : ''; ?>" data-component="<?php echo $component['directory']; ?>">
                                        <div class="component-icon">
                                            <?php $this->renderIcon($component['icon'] ?? 'box.svg'); ?>
                                        </div>
                                        <div class="component-name">
                                            <?php echo $component['name']; ?>
                                        </div>
                                        <?php if ($component['isPremium']): ?>
                                            <div class="component-premium-lock">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                                </svg>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <div class="design-panel-section hidden" data-tab-content="design">
                    <div class="design-settings">
                        <h2 class="design-settings-title">Theme Settings</h2>
                        <!-- Design settings would go here -->
                    </div>
                </div>
                
                <div class="design-panel-section hidden" data-tab-content="layout">
                    <div class="layout-settings">
                        <h2 class="layout-settings-title">Layout Settings</h2>
                        <!-- Layout settings would go here -->
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render an icon
     * 
     * @param string $iconName Icon file name
     */
    private function renderIcon($iconName) {
        // For simplicity, we'll just use a simple switch statement for common icons
        // In a real implementation, this would load SVG files from an icons directory
        switch ($iconName) {
            case 'user.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                break;
            case 'file-text.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
                break;
            case 'list.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>';
                break;
            case 'linkedin.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>';
                break;
            case 'bar-chart.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>';
                break;
            case 'arrow-right-circle.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
                break;
            case 'grid.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>';
                break;
            case 'message-square.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
                break;
            case 'mail.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>';
                break;
            case 'help-circle.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
                break;
            case 'video.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>';
                break;
            case 'image.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                break;
            case 'calendar.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';
                break;
            case 'headphones.svg':
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"></path><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path></svg>';
                break;
            default:
                echo '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>';
        }
    }
    
    /**
     * Get the component loader
     * 
     * @return ComponentLoader Component loader instance
     */
    public function getLoader() {
        return $this->loader;
    }
    
    /**
     * Get the component discovery
     * 
     * @return ComponentDiscovery Component discovery instance
     */
    public function getDiscovery() {
        return $this->discovery;
    }
}
