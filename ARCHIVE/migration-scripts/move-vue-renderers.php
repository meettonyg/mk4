<?php
/**
 * Script to move all remaining Vue renderers to component directories
 * Run once: php move-vue-renderers.php
 */

$base_dir = __DIR__ . '/';
$source_dir = $base_dir . 'src/vue/components/renderers/';
$components_dir = $base_dir . 'components/';

// Map of components to their Vue renderer files
$renderers_to_move = [
    'questions' => 'QuestionsRenderer.vue',
    'stats' => 'StatsRenderer.vue',
    'video-intro' => 'VideoIntroRenderer.vue',
    'photo-gallery' => 'PhotoGalleryRenderer.vue',
    'podcast-player' => 'PodcastPlayerRenderer.vue',
    'booking-calendar' => 'BookingCalendarRenderer.vue',
    'authority-hook' => 'AuthorityHookRenderer.vue',
    'guest-intro' => 'GuestIntroRenderer.vue',
    'logo-grid' => 'LogoGridRenderer.vue'
];

echo "🚀 Moving Vue Renderers to Component Directories\n";
echo str_repeat("=", 50) . "\n\n";

$moved = 0;
$errors = 0;

foreach ($renderers_to_move as $component => $renderer_file) {
    $source_path = $source_dir . $renderer_file;
    $dest_dir = $components_dir . $component . '/';
    $dest_path = $dest_dir . $renderer_file;
    
    echo "Moving $component/$renderer_file... ";
    
    // Check if source exists
    if (!file_exists($source_path)) {
        echo "❌ Source not found\n";
        $errors++;
        continue;
    }
    
    // Create destination directory if needed
    if (!is_dir($dest_dir)) {
        mkdir($dest_dir, 0755, true);
    }
    
    // Copy the file
    if (copy($source_path, $dest_path)) {
        echo "✅ Moved successfully\n";
        $moved++;
    } else {
        echo "❌ Failed to copy\n";
        $errors++;
    }
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "📊 Summary:\n";
echo "  ✅ Moved: $moved files\n";
echo "  ❌ Errors: $errors files\n";

if ($errors === 0) {
    echo "\n✨ All renderers moved successfully!\n";
    echo "You can now safely delete: src/vue/components/renderers/\n";
}

echo "\nNext steps:\n";
echo "1. Update ComponentRenderer.vue imports\n";
echo "2. Run: npm run build\n";
echo "3. Delete src/vue/components/renderers/ directory\n";
