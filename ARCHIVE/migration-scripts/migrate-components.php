<?php
/**
 * Migration script to set up proper self-contained component architecture
 * Run this once to move Vue renderers and create component.json files
 */

// Define all components with their configurations
$components = [
    'hero' => [
        'name' => 'Hero',
        'description' => 'Hero section with headline, description and call-to-action',
        'category' => 'content'
    ],
    'biography' => [
        'name' => 'Biography', 
        'description' => 'Biography section with image and text content',
        'category' => 'content'
    ],
    'topics' => [
        'name' => 'Speaking Topics',
        'description' => 'Display speaking or expertise topics',
        'category' => 'content'
    ],
    'contact' => [
        'name' => 'Contact',
        'description' => 'Contact information and form',
        'category' => 'contact'
    ],
    'social' => [
        'name' => 'Social Media',
        'description' => 'Social media links and icons',
        'category' => 'social'
    ],
    'testimonials' => [
        'name' => 'Testimonials',
        'description' => 'Client testimonials carousel',
        'category' => 'social-proof'
    ],
    'call-to-action' => [
        'name' => 'Call to Action',
        'description' => 'Call to action section with buttons',
        'category' => 'conversion'
    ],
    'questions' => [
        'name' => 'FAQ',
        'description' => 'Frequently asked questions accordion',
        'category' => 'content'
    ],
    'stats' => [
        'name' => 'Statistics',
        'description' => 'Display key statistics and numbers',
        'category' => 'social-proof'
    ],
    'video-intro' => [
        'name' => 'Video Introduction',
        'description' => 'Embedded video player',
        'category' => 'media'
    ],
    'photo-gallery' => [
        'name' => 'Photo Gallery',
        'description' => 'Image gallery with lightbox',
        'category' => 'media'
    ],
    'podcast-player' => [
        'name' => 'Podcast Player',
        'description' => 'Podcast episodes player',
        'category' => 'media'
    ],
    'booking-calendar' => [
        'name' => 'Booking Calendar',
        'description' => 'Appointment booking calendar',
        'category' => 'conversion'
    ],
    'authority-hook' => [
        'name' => 'Authority Hook',
        'description' => 'Establish credibility and authority',
        'category' => 'social-proof'
    ],
    'guest-intro' => [
        'name' => 'Guest Introduction',
        'description' => 'Guest speaker introduction',
        'category' => 'content'
    ],
    'logo-grid' => [
        'name' => 'Logo Grid',
        'description' => 'Display client or partner logos',
        'category' => 'social-proof'
    ]
];

$plugin_dir = dirname(__FILE__) . '/';
$components_dir = $plugin_dir . 'components/';
$vue_renderers_dir = $plugin_dir . 'src/vue/components/renderers/';

foreach ($components as $type => $config) {
    $component_dir = $components_dir . $type . '/';
    
    // Ensure component directory exists
    if (!is_dir($component_dir)) {
        mkdir($component_dir, 0755, true);
    }
    
    // Convert component name for Vue file
    $vue_name = str_replace(' ', '', ucwords(str_replace('-', ' ', $type)));
    $vue_filename = $vue_name . 'Renderer.vue';
    
    // Create component.json
    $manifest = [
        'type' => $type,
        'name' => $config['name'],
        'description' => $config['description'],
        'category' => $config['category'],
        'version' => '1.0.0',
        'renderers' => [
            'php' => 'template.php',
            'javascript' => 'renderer.js',
            'vue' => $vue_filename
        ],
        'styles' => 'styles.css',
        'schema' => 'schema.json',
        'supports' => [
            'serverRender' => file_exists($component_dir . 'template.php'),
            'vueRender' => true,
            'inlineEdit' => true,
            'designPanel' => true
        ]
    ];
    
    $manifest_path = $component_dir . 'component.json';
    if (!file_exists($manifest_path)) {
        file_put_contents($manifest_path, json_encode($manifest, JSON_PRETTY_PRINT));
        echo "Created component.json for $type\n";
    }
    
    // Move Vue renderer if it exists in the old location
    $old_vue_path = $vue_renderers_dir . $vue_filename;
    $new_vue_path = $component_dir . $vue_filename;
    
    if (file_exists($old_vue_path) && !file_exists($new_vue_path)) {
        copy($old_vue_path, $new_vue_path);
        echo "Moved $vue_filename to $type directory\n";
    }
}

echo "\nMigration complete! Vue renderers are now in their proper component directories.\n";
echo "You can now delete the src/vue/components/renderers/ directory.\n";
