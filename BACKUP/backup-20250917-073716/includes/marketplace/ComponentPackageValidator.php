<?php
/**
 * Component Package Validator
 * Phase 5: Component Marketplace Ready
 * 
 * Validates component packages for security, quality, and compatibility
 * 
 * @version 5.1.0
 * @package GMKB/Marketplace
 */

namespace GMKB\Marketplace;

class ComponentPackageValidator {
    
    /**
     * Validation rules
     */
    private $rules = [];
    
    /**
     * Validation errors
     */
    private $errors = [];
    
    /**
     * Validation warnings
     */
    private $warnings = [];
    
    /**
     * Constructor
     */
    public function __construct() {
        $this->init_rules();
    }
    
    /**
     * Initialize validation rules
     */
    private function init_rules() {
        $this->rules = [
            'structure' => [
                'required_files' => [
                    'component.json',
                    'schema.json',
                    'template.php',
                    'script.js'
                ],
                'optional_files' => [
                    'panel-script.js',
                    'design-panel.php',
                    'styles.css',
                    'README.md',
                    'install.php',
                    'uninstall.php'
                ],
                'forbidden_files' => [
                    '.git',
                    '.svn',
                    '.DS_Store',
                    'Thumbs.db',
                    '*.exe',
                    '*.dll',
                    '*.so'
                ]
            ],
            'security' => [
                'forbidden_functions' => [
                    'eval',
                    'exec',
                    'system',
                    'shell_exec',
                    'passthru',
                    'proc_open',
                    'popen',
                    'curl_exec',
                    'curl_multi_exec',
                    'parse_ini_file',
                    'show_source',
                    'file_get_contents',
                    'file_put_contents',
                    'fopen',
                    'fwrite'
                ],
                'required_escaping' => [
                    'esc_html',
                    'esc_attr',
                    'esc_url',
                    'wp_kses',
                    'sanitize_text_field'
                ],
                'nonce_verification' => true,
                'capability_checks' => true
            ],
            'quality' => [
                'max_file_size' => 5242880, // 5MB
                'max_files' => 50,
                'required_documentation' => true,
                'coding_standards' => 'WordPress',
                'namespace_required' => false,
                'prefix_required' => true
            ],
            'compatibility' => [
                'php_version' => '7.4',
                'wp_version' => '5.8',
                'gmkb_version' => '1.0.0'
            ]
        ];
    }
    
    /**
     * Validate component package
     * 
     * @param string $package_path Path to package file or directory
     * @return array Validation result
     */
    public function validate($package_path) {
        $this->errors = [];
        $this->warnings = [];
        
        // Extract if ZIP
        $extract_path = $this->prepare_package($package_path);
        if (!$extract_path) {
            return $this->get_result();
        }
        
        // Run validations
        $this->validate_structure($extract_path);
        $this->validate_manifest($extract_path);
        $this->validate_security($extract_path);
        $this->validate_quality($extract_path);
        $this->validate_compatibility($extract_path);
        $this->validate_schema($extract_path);
        $this->validate_templates($extract_path);
        $this->validate_scripts($extract_path);
        
        // Cleanup if was extracted
        if ($extract_path !== $package_path) {
            $this->cleanup_temp($extract_path);
        }
        
        return $this->get_result();
    }
    
    /**
     * Prepare package for validation
     * 
     * @param string $package_path Package path
     * @return string|false Extracted path or false
     */
    private function prepare_package($package_path) {
        if (is_dir($package_path)) {
            return $package_path;
        }
        
        if (!file_exists($package_path)) {
            $this->add_error('Package file not found');
            return false;
        }
        
        // Extract ZIP
        $temp_dir = sys_get_temp_dir() . '/gmkb_validate_' . uniqid();
        $zip = new \ZipArchive();
        
        if ($zip->open($package_path) !== TRUE) {
            $this->add_error('Failed to open package file');
            return false;
        }
        
        $zip->extractTo($temp_dir);
        $zip->close();
        
        return $temp_dir;
    }
    
    /**
     * Validate package structure
     * 
     * @param string $path Package path
     */
    private function validate_structure($path) {
        // Find component directory
        $component_dir = $this->find_component_dir($path);
        if (!$component_dir) {
            $this->add_error('Component directory not found');
            return;
        }
        
        // Check required files
        foreach ($this->rules['structure']['required_files'] as $file) {
            if (!file_exists($component_dir . '/' . $file)) {
                $this->add_error("Required file missing: {$file}");
            }
        }
        
        // Check for forbidden files
        $all_files = $this->get_all_files($component_dir);
        foreach ($all_files as $file) {
            foreach ($this->rules['structure']['forbidden_files'] as $pattern) {
                if ($this->matches_pattern($file, $pattern)) {
                    $this->add_error("Forbidden file found: {$file}");
                }
            }
        }
        
        // Check file count
        if (count($all_files) > $this->rules['quality']['max_files']) {
            $this->add_warning("Package contains too many files: " . count($all_files));
        }
        
        // Check total size
        $total_size = $this->get_directory_size($component_dir);
        if ($total_size > $this->rules['quality']['max_file_size']) {
            $this->add_warning("Package size exceeds limit: " . $this->format_bytes($total_size));
        }
    }
    
    /**
     * Validate manifest file
     * 
     * @param string $path Package path
     */
    private function validate_manifest($path) {
        $component_dir = $this->find_component_dir($path);
        $manifest_file = $component_dir . '/manifest.json';
        
        if (!file_exists($manifest_file)) {
            // Check if using component.json instead
            $manifest_file = $component_dir . '/component.json';
        }
        
        if (!file_exists($manifest_file)) {
            $this->add_error('Manifest file not found');
            return;
        }
        
        $manifest = json_decode(file_get_contents($manifest_file), true);
        if (!$manifest) {
            $this->add_error('Invalid manifest JSON');
            return;
        }
        
        // Check required fields
        $required_fields = ['id', 'name', 'version', 'author', 'component_type'];
        foreach ($required_fields as $field) {
            if (!isset($manifest[$field]) || empty($manifest[$field])) {
                $this->add_error("Manifest missing required field: {$field}");
            }
        }
        
        // Validate ID format
        if (isset($manifest['id']) && !preg_match('/^[a-z0-9\-]+$/', $manifest['id'])) {
            $this->add_error('Component ID must contain only lowercase letters, numbers, and hyphens');
        }
        
        // Validate version format
        if (isset($manifest['version']) && !preg_match('/^\d+\.\d+\.\d+/', $manifest['version'])) {
            $this->add_error('Version must follow semantic versioning (e.g., 1.0.0)');
        }
        
        // Check for recommended fields
        $recommended_fields = ['description', 'license', 'homepage', 'support'];
        foreach ($recommended_fields as $field) {
            if (!isset($manifest[$field])) {
                $this->add_warning("Manifest missing recommended field: {$field}");
            }
        }
    }
    
    /**
     * Validate security
     * 
     * @param string $path Package path
     */
    private function validate_security($path) {
        $component_dir = $this->find_component_dir($path);
        $php_files = $this->get_files_by_extension($component_dir, 'php');
        
        foreach ($php_files as $file) {
            $content = file_get_contents($file);
            
            // Check for forbidden functions
            foreach ($this->rules['security']['forbidden_functions'] as $function) {
                if (preg_match('/\b' . preg_quote($function) . '\s*\(/i', $content)) {
                    $this->add_error("Security issue: forbidden function '{$function}' found in " . basename($file));
                }
            }
            
            // Check for direct file access protection
            if (!preg_match('/defined\s*\(\s*[\'"]ABSPATH[\'"]\s*\)/', $content)) {
                $this->add_warning("Security: " . basename($file) . " should check for ABSPATH");
            }
            
            // Check for nonce verification in forms
            if (preg_match('/<form/', $content) && !preg_match('/wp_nonce_field|check_admin_referer|wp_verify_nonce/', $content)) {
                $this->add_warning("Security: " . basename($file) . " has form without nonce verification");
            }
            
            // Check for capability checks
            if (preg_match('/add_menu_page|add_submenu_page/', $content) && 
                !preg_match('/current_user_can|user_can/', $content)) {
                $this->add_warning("Security: " . basename($file) . " adds admin page without capability check");
            }
            
            // Check for proper escaping
            if (preg_match('/echo\s+\$/', $content)) {
                $has_escaping = false;
                foreach ($this->rules['security']['required_escaping'] as $escape_function) {
                    if (preg_match('/' . preg_quote($escape_function) . '/', $content)) {
                        $has_escaping = true;
                        break;
                    }
                }
                if (!$has_escaping) {
                    $this->add_warning("Security: " . basename($file) . " may have unescaped output");
                }
            }
        }
        
        // Check JavaScript files
        $js_files = $this->get_files_by_extension($component_dir, 'js');
        foreach ($js_files as $file) {
            $content = file_get_contents($file);
            
            // Check for eval usage
            if (preg_match('/\beval\s*\(/i', $content)) {
                $this->add_error("Security issue: eval() found in " . basename($file));
            }
            
            // Check for innerHTML without sanitization
            if (preg_match('/\.innerHTML\s*=(?![^;]*sanitize)/', $content)) {
                $this->add_warning("Security: " . basename($file) . " uses innerHTML without apparent sanitization");
            }
        }
    }
    
    /**
     * Validate quality
     * 
     * @param string $path Package path
     */
    private function validate_quality($path) {
        $component_dir = $this->find_component_dir($path);
        
        // Check for documentation
        if ($this->rules['quality']['required_documentation']) {
            if (!file_exists($component_dir . '/README.md') && 
                !file_exists($component_dir . '/readme.txt')) {
                $this->add_warning('Documentation file (README.md or readme.txt) not found');
            }
        }
        
        // Check PHP files for coding standards
        $php_files = $this->get_files_by_extension($component_dir, 'php');
        foreach ($php_files as $file) {
            $content = file_get_contents($file);
            
            // Check for proper prefixing
            if ($this->rules['quality']['prefix_required']) {
                if (preg_match('/function\s+([a-z_]+)\s*\(/i', $content, $matches)) {
                    if (!preg_match('/^gmkb_|^_/', $matches[1])) {
                        $this->add_warning("Function '{$matches[1]}' should be prefixed in " . basename($file));
                    }
                }
            }
            
            // Check for comments
            if (!preg_match('/\/\*\*.*?\*\//s', $content)) {
                $this->add_warning("No docblock comments found in " . basename($file));
            }
        }
        
        // Check JavaScript files
        $js_files = $this->get_files_by_extension($component_dir, 'js');
        foreach ($js_files as $file) {
            $content = file_get_contents($file);
            
            // Check for console.log
            if (preg_match('/console\.(log|debug|info)/', $content)) {
                $this->add_warning("Debug console output found in " . basename($file));
            }
            
            // Check for proper error handling
            if (preg_match('/\bajax\b|\bfetch\b/', $content) && 
                !preg_match('/\.catch\b|try\s*{/', $content)) {
                $this->add_warning("AJAX/fetch without error handling in " . basename($file));
            }
        }
    }
    
    /**
     * Validate compatibility
     * 
     * @param string $path Package path
     */
    private function validate_compatibility($path) {
        $component_dir = $this->find_component_dir($path);
        
        // Check PHP compatibility
        $php_files = $this->get_files_by_extension($component_dir, 'php');
        foreach ($php_files as $file) {
            $content = file_get_contents($file);
            
            // Check for PHP 8+ features if min version is 7.4
            if (version_compare($this->rules['compatibility']['php_version'], '8.0', '<')) {
                if (preg_match('/\bmatch\s*\(/', $content)) {
                    $this->add_error("PHP 8+ match expression found but minimum PHP is " . 
                                    $this->rules['compatibility']['php_version']);
                }
                if (preg_match('/\?->/', $content)) {
                    $this->add_error("PHP 8+ nullsafe operator found but minimum PHP is " . 
                                    $this->rules['compatibility']['php_version']);
                }
            }
        }
        
        // Check for WordPress compatibility
        $manifest = $this->get_manifest($component_dir);
        if ($manifest) {
            if (isset($manifest['min_wp_version'])) {
                if (version_compare($manifest['min_wp_version'], $this->rules['compatibility']['wp_version'], '<')) {
                    $this->add_warning("Component requires older WordPress version than recommended");
                }
            }
        }
    }
    
    /**
     * Validate schema.json
     * 
     * @param string $path Package path
     */
    private function validate_schema($path) {
        $component_dir = $this->find_component_dir($path);
        $schema_file = $component_dir . '/schema.json';
        
        if (!file_exists($schema_file)) {
            $this->add_error('schema.json not found');
            return;
        }
        
        $schema = json_decode(file_get_contents($schema_file), true);
        if (!$schema) {
            $this->add_error('Invalid schema.json format');
            return;
        }
        
        // Check required schema fields
        $required_fields = ['component_type', 'name', 'defaultOptions'];
        foreach ($required_fields as $field) {
            if (!isset($schema[$field])) {
                $this->add_error("Schema missing required field: {$field}");
            }
        }
        
        // Validate componentOptions structure
        if (isset($schema['componentOptions'])) {
            foreach ($schema['componentOptions'] as $option_key => $option) {
                if (!isset($option['type'])) {
                    $this->add_warning("Schema option '{$option_key}' missing type");
                }
                if (!isset($option['label'])) {
                    $this->add_warning("Schema option '{$option_key}' missing label");
                }
            }
        }
    }
    
    /**
     * Validate templates
     * 
     * @param string $path Package path
     */
    private function validate_templates($path) {
        $component_dir = $this->find_component_dir($path);
        $template_file = $component_dir . '/template.php';
        
        if (!file_exists($template_file)) {
            $this->add_error('template.php not found');
            return;
        }
        
        $content = file_get_contents($template_file);
        
        // Check for proper PHP opening tag
        if (!preg_match('/^<\?php/', $content)) {
            $this->add_error('Template should start with <?php tag');
        }
        
        // Check for BEM class naming
        if (!preg_match('/class="[^"]*gmkb-/', $content)) {
            $this->add_warning('Template should use BEM class naming (gmkb- prefix)');
        }
        
        // Check for accessibility
        if (preg_match('/<img/', $content) && !preg_match('/\balt=/', $content)) {
            $this->add_warning('Images should have alt attributes for accessibility');
        }
        
        if (preg_match('/<button|<a/', $content) && !preg_match('/\baria-label=/', $content)) {
            $this->add_warning('Interactive elements should have aria-labels for accessibility');
        }
    }
    
    /**
     * Validate scripts
     * 
     * @param string $path Package path
     */
    private function validate_scripts($path) {
        $component_dir = $this->find_component_dir($path);
        $script_file = $component_dir . '/script.js';
        
        if (!file_exists($script_file)) {
            $this->add_error('script.js not found');
            return;
        }
        
        $content = file_get_contents($script_file);
        
        // Check for proper initialization
        if (!preg_match('/DOMContentLoaded|document\.ready|window\.addEventListener/', $content)) {
            $this->add_warning('Script should wait for DOM ready');
        }
        
        // Check for global namespace pollution
        if (preg_match('/^(var|let|const)\s+[a-z]/m', $content)) {
            $this->add_warning('Script may pollute global namespace - consider using IIFE or module pattern');
        }
        
        // Check for event listener cleanup
        if (preg_match('/addEventListener/', $content) && !preg_match('/removeEventListener/', $content)) {
            $this->add_warning('Script adds event listeners but may not clean them up');
        }
    }
    
    /**
     * Helper: Find component directory
     * 
     * @param string $path Base path
     * @return string|false Component directory path
     */
    private function find_component_dir($path) {
        // Check if path itself is component dir
        if (file_exists($path . '/component.json') || file_exists($path . '/manifest.json')) {
            return $path;
        }
        
        // Check subdirectories
        $dirs = glob($path . '/*', GLOB_ONLYDIR);
        foreach ($dirs as $dir) {
            if (file_exists($dir . '/component.json') || file_exists($dir . '/manifest.json')) {
                return $dir;
            }
        }
        
        return false;
    }
    
    /**
     * Helper: Get all files in directory
     * 
     * @param string $dir Directory path
     * @return array File paths
     */
    private function get_all_files($dir) {
        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dir, \RecursiveDirectoryIterator::SKIP_DOTS)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $files[] = $file->getPathname();
            }
        }
        
        return $files;
    }
    
    /**
     * Helper: Get files by extension
     * 
     * @param string $dir Directory path
     * @param string $extension File extension
     * @return array File paths
     */
    private function get_files_by_extension($dir, $extension) {
        $files = [];
        $all_files = $this->get_all_files($dir);
        
        foreach ($all_files as $file) {
            if (pathinfo($file, PATHINFO_EXTENSION) === $extension) {
                $files[] = $file;
            }
        }
        
        return $files;
    }
    
    /**
     * Helper: Get directory size
     * 
     * @param string $dir Directory path
     * @return int Size in bytes
     */
    private function get_directory_size($dir) {
        $size = 0;
        $files = $this->get_all_files($dir);
        
        foreach ($files as $file) {
            $size += filesize($file);
        }
        
        return $size;
    }
    
    /**
     * Helper: Check if file matches pattern
     * 
     * @param string $file File path
     * @param string $pattern Pattern to match
     * @return bool
     */
    private function matches_pattern($file, $pattern) {
        $pattern = str_replace('*', '.*', $pattern);
        return preg_match('/' . $pattern . '$/i', $file);
    }
    
    /**
     * Helper: Format bytes
     * 
     * @param int $bytes Bytes
     * @return string Formatted size
     */
    private function format_bytes($bytes) {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }
    
    /**
     * Helper: Get manifest
     * 
     * @param string $dir Component directory
     * @return array|null Manifest data
     */
    private function get_manifest($dir) {
        $manifest_file = $dir . '/manifest.json';
        if (!file_exists($manifest_file)) {
            $manifest_file = $dir . '/component.json';
        }
        
        if (!file_exists($manifest_file)) {
            return null;
        }
        
        return json_decode(file_get_contents($manifest_file), true);
    }
    
    /**
     * Helper: Clean up temporary directory
     * 
     * @param string $dir Directory path
     */
    private function cleanup_temp($dir) {
        if (strpos($dir, 'gmkb_validate_') !== false) {
            $this->delete_directory($dir);
        }
    }
    
    /**
     * Helper: Delete directory recursively
     * 
     * @param string $dir Directory path
     */
    private function delete_directory($dir) {
        if (!is_dir($dir)) {
            return;
        }
        
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                $this->delete_directory($path);
            } else {
                unlink($path);
            }
        }
        
        rmdir($dir);
    }
    
    /**
     * Add error
     * 
     * @param string $message Error message
     */
    private function add_error($message) {
        $this->errors[] = $message;
    }
    
    /**
     * Add warning
     * 
     * @param string $message Warning message
     */
    private function add_warning($message) {
        $this->warnings[] = $message;
    }
    
    /**
     * Get validation result
     * 
     * @return array Result
     */
    private function get_result() {
        return [
            'valid' => empty($this->errors),
            'errors' => $this->errors,
            'warnings' => $this->warnings,
            'error_count' => count($this->errors),
            'warning_count' => count($this->warnings)
        ];
    }
}
