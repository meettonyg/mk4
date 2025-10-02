<?php
/**
 * Example Usage
 * 
 * This file demonstrates how to use the component discovery system.
 */

// Include required files
require_once __DIR__ . '/system/ComponentDiscovery.php';
require_once __DIR__ . '/system/ComponentLoader.php';
require_once __DIR__ . '/system/DesignPanel.php';

// Set the components directory
$componentsDir = __DIR__ . '/components';

// Create a new design panel
$designPanel = new DesignPanel($componentsDir);

// Get the component loader
$loader = $designPanel->getLoader();

// Example media kit with some components
$mediaKit = [
    'components' => [
        [
            'name' => 'hero',
            'props' => [
                'title' => 'John Doe',
                'subtitle' => 'Professional Speaker & Author',
                'image' => 'https://example.com/images/john-doe.jpg'
            ]
        ],
        [
            'name' => 'biography',
            'props' => [
                'title' => 'About Me',
                'content' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc eu nisl.'
            ]
        ],
        [
            'name' => 'social',
            'props' => [
                'title' => 'Follow Me',
                'socialLinks' => [
                    [
                        'platform' => 'twitter',
                        'url' => 'https://twitter.com/johndoe'
                    ],
                    [
                        'platform' => 'linkedin',
                        'url' => 'https://linkedin.com/in/johndoe'
                    ],
                    [
                        'platform' => 'instagram',
                        'url' => 'https://instagram.com/johndoe'
                    ]
                ]
            ]
        ]
    ]
];

// Function to render the media kit
function renderMediaKit($mediaKit, $loader) {
    $output = '';
    
    foreach ($mediaKit['components'] as $component) {
        $componentName = $component['name'];
        $props = $component['props'];
        
        $renderedComponent = $loader->loadComponent($componentName, $props);
        if ($renderedComponent) {
            $output .= $renderedComponent;
        }
    }
    
    return $output;
}

?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Media Kit Builder</title>
    <style>
        /* Reset and base styles */
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .app {
            display: flex;
            min-height: 100vh;
        }
        
        .sidebar {
            width: 300px;
            background-color: #1a1a1a;
            color: #fff;
            border-right: 1px solid #3a3a3a;
        }
        
        .main-content {
            flex: 1;
            padding: 2rem;
            overflow-y: auto;
        }
        
        .media-kit {
            max-width: 900px;
            margin: 0 auto;
            background-color: #fff;
            border-radius: 0.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        /* Component variables */
        :root {
            --background-color: #f5f5f5;
            --component-bg-color: #fff;
            --primary-color: #4a7aff;
            --primary-hover-color: #3a67e0;
            --primary-text-color: #333;
            --secondary-text-color: #666;
            --muted-text-color: #888;
            --accent-color: #ccc;
            --light-accent-color: #f0f0f0;
            --input-bg-color: #fff;
            --input-border-color: #ddd;
            --border-color: #ddd;
            --success-color: #2ecc71;
            --danger-color: #ff4a4a;
            --danger-hover-color: #e04040;
        }
        
        /* Component styles */
        <?php echo $loader->getStyles(); ?>
    </style>
    <link rel="stylesheet" href="system/design-panel.css">
</head>
<body>
    <div class="app">
        <div class="sidebar">
            <?php echo $designPanel->render(); ?>
        </div>
        <div class="main-content">
            <div class="media-kit">
                <?php echo renderMediaKit($mediaKit, $loader); ?>
            </div>
        </div>
    </div>
    
    <script>
        <?php echo $loader->getScripts(); ?>
    </script>
    <script src="system/design-panel.js"></script>
</body>
</html>
