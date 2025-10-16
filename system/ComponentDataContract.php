<?php
/**
 * Component Data Contract
 * 
 * Defines standardized prop names for Vue/PHP consistency
 * This ensures that Vue components and PHP templates use the same naming conventions
 * 
 * @package MediaKitBuilder
 * @subpackage System
 */

namespace MediaKitBuilder\System;

class ComponentDataContract {
    
    /**
     * Component data contracts
     * Maps component types to their standardized field names and types
     * 
     * @var array
     */
    public static $contracts = [
        
        /**
         * Biography Component
         * Displays user biography, name, and professional information
         */
        'biography' => [
            'component_id' => 'string',   // Unique component instance ID
            'name' => 'string',           // Full name (NOT speaker_name, guest_name)
            'title' => 'string',          // Job title (NOT professional_title, job_title)
            'biography' => 'string',      // Biography content (NOT bio_content, bio, content)
            'company' => 'string',        // Company name
        ],
        
        /**
         * Hero Component
         * Large header section with image, name, and CTA
         */
        'hero' => [
            'component_id' => 'string',
            'name' => 'string',
            'title' => 'string',
            'bio' => 'string',            // Short bio for hero (NOT biography)
            'image_url' => 'string',      // Avatar/header image
            'cta_text' => 'string',       // Call-to-action button text
            'cta_url' => 'string',        // Call-to-action button URL
        ],
        
        /**
         * Topics Component
         * List of speaking topics or areas of expertise
         */
        'topics' => [
            'component_id' => 'string',
            'title' => 'string',          // Section title
            'topics' => 'array',          // Array of topic objects
            // Each topic: ['title' => string, 'description' => string]
        ],
        
        /**
         * Social Links Component
         * Social media profile links
         */
        'social' => [
            'component_id' => 'string',
            'title' => 'string',
            'links' => 'array',           // Array of social link objects
            // Each link: ['platform' => string, 'url' => string, 'icon' => string]
        ],
        
        /**
         * Contact Component
         * Contact information display
         */
        'contact' => [
            'component_id' => 'string',
            'title' => 'string',
            'email' => 'string',
            'phone' => 'string',
            'website' => 'string',
        ],
        
        /**
         * Stats Component
         * Statistics and achievements display
         */
        'stats' => [
            'component_id' => 'string',
            'title' => 'string',
            'stats' => 'array',           // Array of stat objects
            // Each stat: ['label' => string, 'value' => string, 'icon' => string]
        ],
        
        /**
         * Photo Gallery Component
         * Image gallery display
         */
        'photo-gallery' => [
            'component_id' => 'string',
            'title' => 'string',
            'images' => 'array',          // Array of image URLs
            'layout' => 'string',         // grid, masonry, slider
        ],
        
        /**
         * Video Intro Component
         * Video embed or player
         */
        'video-intro' => [
            'component_id' => 'string',
            'title' => 'string',
            'video_url' => 'string',      // YouTube, Vimeo, or direct video URL
            'thumbnail_url' => 'string',  // Optional custom thumbnail
            'description' => 'string',
        ],
        
        /**
         * Call to Action Component
         * Button or link with promotional text
         */
        'call-to-action' => [
            'component_id' => 'string',
            'title' => 'string',
            'description' => 'string',
            'button_text' => 'string',
            'button_url' => 'string',
            'style' => 'string',          // primary, secondary, outline
        ],
        
        /**
         * Testimonials Component
         * Client testimonials and reviews
         */
        'testimonials' => [
            'component_id' => 'string',
            'title' => 'string',
            'testimonials' => 'array',    // Array of testimonial objects
            // Each testimonial: ['quote' => string, 'author' => string, 'role' => string, 'image' => string]
        ],
        
        /**
         * Logo Grid Component
         * Display grid of client/partner logos
         */
        'logo-grid' => [
            'component_id' => 'string',
            'title' => 'string',
            'logos' => 'array',           // Array of logo objects
            // Each logo: ['image_url' => string, 'alt_text' => string, 'link' => string]
        ],
    ];
    
    /**
     * Get contract for a specific component type
     * 
     * @param string $type Component type
     * @return array|null Contract definition or null if not found
     */
    public static function get_contract($type) {
        return self::$contracts[$type] ?? null;
    }
    
    /**
     * Validate data against contract
     * 
     * @param string $type Component type
     * @param array $data Data to validate
     * @return array Array of validation errors (empty if valid)
     */
    public static function validate($type, $data) {
        $contract = self::get_contract($type);
        if (!$contract) {
            return ["Unknown component type: {$type}"];
        }
        
        $errors = [];
        
        foreach ($contract as $field => $expected_type) {
            if (!isset($data[$field])) {
                continue; // Optional fields
            }
            
            $actual_type = gettype($data[$field]);
            
            // Type mapping
            $type_map = [
                'string' => 'string',
                'array' => 'array',
                'integer' => 'integer',
                'boolean' => 'boolean',
            ];
            
            if (isset($type_map[$expected_type])) {
                if ($actual_type !== $type_map[$expected_type]) {
                    $errors[] = "Field '{$field}' expected {$expected_type}, got {$actual_type}";
                }
            }
        }
        
        return $errors;
    }
    
    /**
     * Normalize data to contract
     * Maps common variations to standardized field names
     * 
     * @param string $type Component type
     * @param array $data Raw data
     * @return array Normalized data
     */
    public static function normalize($type, $data) {
        // Common field mappings (legacy names to standard names)
        $mappings = [
            // Name variations
            'speaker_name' => 'name',
            'guest_name' => 'name',
            'full_name' => 'name',
            
            // Title variations
            'professional_title' => 'title',
            'job_title' => 'title',
            
            // Biography variations
            'bio' => 'biography',
            'bio_content' => 'biography',
            'content' => 'biography',
            'introduction' => 'biography',
            
            // Image variations
            'photo' => 'image_url',
            'avatar' => 'image_url',
            'picture' => 'image_url',
        ];
        
        $normalized = [];
        
        // Apply mappings
        foreach ($data as $key => $value) {
            $standard_key = $mappings[$key] ?? $key;
            $normalized[$standard_key] = $value;
        }
        
        return $normalized;
    }
    
    /**
     * Get all component types
     * 
     * @return array List of component type names
     */
    public static function get_types() {
        return array_keys(self::$contracts);
    }
}
