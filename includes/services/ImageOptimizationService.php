<?php
/**
 * Image Optimization Service
 * 
 * Handles automatic image optimization including:
 * - WebP conversion
 * - Compression
 * - Resizing
 * - Quality optimization
 * 
 * @package GuestifyMediaKitBuilder
 * @since 4.0.0
 */

namespace GuestifyMediaKitBuilder\Services;

class ImageOptimizationService {
    
    /**
     * Compression quality (0-100)
     * @var int
     */
    private $quality = 85;
    
    /**
     * Maximum width for images
     * @var int
     */
    private $max_width = 2000;
    
    /**
     * Maximum height for images
     * @var int
     */
    private $max_height = 2000;
    
    /**
     * Whether WebP conversion is enabled
     * @var bool
     */
    private $webp_enabled = true;
    
    /**
     * Initialize the service
     */
    public function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Optimize images after upload
        add_filter('wp_handle_upload', [$this, 'optimize_on_upload'], 10, 2);
        
        // Generate WebP versions
        add_filter('wp_generate_attachment_metadata', [$this, 'generate_webp_versions'], 10, 2);
        
        // Add WebP to allowed mime types
        add_filter('upload_mimes', [$this, 'add_webp_mime_type']);
    }
    
    /**
     * Optimize image on upload
     * 
     * @param array $upload Upload data
     * @param string $context Upload context
     * @return array Modified upload data
     */
    public function optimize_on_upload($upload, $context) {
        // Only process images
        if (strpos($upload['type'], 'image/') !== 0) {
            return $upload;
        }
        
        // Skip GIFs (to preserve animations)
        if ($upload['type'] === 'image/gif') {
            return $upload;
        }
        
        $file_path = $upload['file'];
        
        // Optimize the image
        $optimized = $this->optimize_image($file_path);
        
        if ($optimized) {
            GMKB_Logger::info('GMKB: Optimized image: ' . basename($file_path));
        }
        
        return $upload;
    }
    
    /**
     * Optimize an image file
     * 
     * @param string $file_path Path to image file
     * @return bool Success status
     */
    public function optimize_image($file_path) {
        if (!file_exists($file_path)) {
            return false;
        }
        
        // Get image info
        $image_info = @getimagesize($file_path);
        if (!$image_info) {
            return false;
        }
        
        list($width, $height, $type) = $image_info;
        
        // Load image based on type
        $image = $this->load_image($file_path, $type);
        if (!$image) {
            return false;
        }
        
        // Resize if too large
        if ($width > $this->max_width || $height > $this->max_height) {
            $image = $this->resize_image($image, $width, $height);
        }
        
        // Save optimized version
        $saved = $this->save_image($image, $file_path, $type);
        
        // Clean up
        imagedestroy($image);
        
        return $saved;
    }
    
    /**
     * Load image from file
     * 
     * @param string $file_path File path
     * @param int $type Image type constant
     * @return resource|false GD image resource
     */
    private function load_image($file_path, $type) {
        switch ($type) {
            case IMAGETYPE_JPEG:
                return @imagecreatefromjpeg($file_path);
            case IMAGETYPE_PNG:
                return @imagecreatefrompng($file_path);
            case IMAGETYPE_WEBP:
                if (function_exists('imagecreatefromwebp')) {
                    return @imagecreatefromwebp($file_path);
                }
                return false;
            default:
                return false;
        }
    }
    
    /**
     * Resize image maintaining aspect ratio
     * 
     * @param resource $image GD image resource
     * @param int $width Current width
     * @param int $height Current height
     * @return resource Resized image
     */
    private function resize_image($image, $width, $height) {
        // Calculate new dimensions
        $ratio = min($this->max_width / $width, $this->max_height / $height);
        $new_width = round($width * $ratio);
        $new_height = round($height * $ratio);
        
        // Create new image
        $new_image = imagecreatetruecolor($new_width, $new_height);
        
        // Preserve transparency for PNG
        imagealphablending($new_image, false);
        imagesavealpha($new_image, true);
        
        // Resize
        imagecopyresampled(
            $new_image, $image,
            0, 0, 0, 0,
            $new_width, $new_height,
            $width, $height
        );
        
        // Clean up original
        imagedestroy($image);
        
        return $new_image;
    }
    
    /**
     * Save optimized image
     * 
     * @param resource $image GD image resource
     * @param string $file_path Output file path
     * @param int $type Image type constant
     * @return bool Success status
     */
    private function save_image($image, $file_path, $type) {
        switch ($type) {
            case IMAGETYPE_JPEG:
                return imagejpeg($image, $file_path, $this->quality);
            
            case IMAGETYPE_PNG:
                // PNG compression level (0-9, 9 = max compression)
                $png_quality = round((100 - $this->quality) / 10);
                return imagepng($image, $file_path, $png_quality);
            
            case IMAGETYPE_WEBP:
                if (function_exists('imagewebp')) {
                    return imagewebp($image, $file_path, $this->quality);
                }
                return false;
            
            default:
                return false;
        }
    }
    
    /**
     * Generate WebP versions of uploaded images
     * 
     * @param array $metadata Attachment metadata
     * @param int $attachment_id Attachment ID
     * @return array Modified metadata
     */
    public function generate_webp_versions($metadata, $attachment_id) {
        if (!$this->webp_enabled) {
            return $metadata;
        }
        
        // Check if GD supports WebP
        if (!function_exists('imagewebp')) {
            return $metadata;
        }
        
        $file = get_attached_file($attachment_id);
        if (!$file || !file_exists($file)) {
            return $metadata;
        }
        
        // Get mime type
        $mime_type = get_post_mime_type($attachment_id);
        
        // Only convert JPEG and PNG to WebP
        if (!in_array($mime_type, ['image/jpeg', 'image/png'])) {
            return $metadata;
        }
        
        // Generate WebP for main image
        $this->create_webp_version($file);
        
        // Generate WebP for all sizes
        if (isset($metadata['sizes']) && is_array($metadata['sizes'])) {
            $base_dir = dirname($file);
            
            foreach ($metadata['sizes'] as $size => $size_data) {
                $size_file = $base_dir . '/' . $size_data['file'];
                if (file_exists($size_file)) {
                    $this->create_webp_version($size_file);
                }
            }
        }
        
        return $metadata;
    }
    
    /**
     * Create WebP version of an image
     * 
     * @param string $file_path Path to source image
     * @return bool Success status
     */
    private function create_webp_version($file_path) {
        // Skip if already WebP
        if (pathinfo($file_path, PATHINFO_EXTENSION) === 'webp') {
            return false;
        }
        
        // Get WebP path
        $webp_path = preg_replace('/\.(jpe?g|png)$/i', '.webp', $file_path);
        
        // Skip if WebP already exists
        if (file_exists($webp_path)) {
            return true;
        }
        
        // Get image info
        $image_info = @getimagesize($file_path);
        if (!$image_info) {
            return false;
        }
        
        list($width, $height, $type) = $image_info;
        
        // Load source image
        $image = $this->load_image($file_path, $type);
        if (!$image) {
            return false;
        }
        
        // Create WebP
        $success = @imagewebp($image, $webp_path, $this->quality);
        
        // Clean up
        imagedestroy($image);
        
        if ($success) {
            GMKB_Logger::info('GMKB: Generated WebP: ' . basename($webp_path));
        }
        
        return $success;
    }
    
    /**
     * Add WebP to allowed mime types
     * 
     * @param array $mimes Existing mime types
     * @return array Modified mime types
     */
    public function add_webp_mime_type($mimes) {
        $mimes['webp'] = 'image/webp';
        return $mimes;
    }
    
    /**
     * Get optimization statistics for an attachment
     * 
     * @param int $attachment_id Attachment ID
     * @return array Statistics
     */
    public function get_optimization_stats($attachment_id) {
        $file = get_attached_file($attachment_id);
        if (!$file || !file_exists($file)) {
            return [];
        }
        
        $original_size = filesize($file);
        $webp_path = preg_replace('/\.(jpe?g|png)$/i', '.webp', $file);
        
        $stats = [
            'original_size' => $original_size,
            'original_size_human' => size_format($original_size),
            'has_webp' => false,
            'webp_size' => 0,
            'webp_size_human' => '',
            'savings' => 0,
            'savings_percent' => 0
        ];
        
        if (file_exists($webp_path)) {
            $webp_size = filesize($webp_path);
            $stats['has_webp'] = true;
            $stats['webp_size'] = $webp_size;
            $stats['webp_size_human'] = size_format($webp_size);
            $stats['savings'] = $original_size - $webp_size;
            $stats['savings_percent'] = round(($stats['savings'] / $original_size) * 100, 1);
        }
        
        return $stats;
    }
}
