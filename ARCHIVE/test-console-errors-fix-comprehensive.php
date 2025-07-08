<?php
/**
 * Comprehensive Console Error Fix Validation Test
 * 
 * Tests all root-level fixes implemented to resolve console errors:
 * - Missing template files
 * - Component type mapping/aliases
 * - REST API enhancements  
 * - Dynamic loader improvements
 * 
 * Usage: Add this to your WordPress admin and run the tests
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit('Direct access not allowed');
}

/**
 * Console Error Fix Test Suite
 */
class GMKB_Console_Error_Fix_Tests {
    
    private $test_results = [];
    private $plugin_instance;
    private $component_discovery;
    
    public function __construct() {
        $this->plugin_instance = Guestify_Media_Kit_Builder::get_instance();
        $this->component_discovery = $this->plugin_instance->get_component_discovery();
    }
    
    /**
     * Run all tests and return results
     */
    public function run_all_tests() {
        $this->test_results = [];
        
        // Phase 1: Component Template Infrastructure Tests
        $this->test_missing_template_files();
        $this->test_component_discovery_aliases();
        
        // Phase 2: REST API Enhancement Tests  
        $this->test_rest_api_alias_resolution();
        $this->test_rest_api_error_handling();
        
        // Phase 3: Component Type Mapping Tests
        $this->test_bio_biography_mapping();
        $this->test_authority_hook_template();
        
        // Phase 4: Integration Tests
        $this->test_end_to_end_component_loading();
        
        return $this->get_results_summary();
    }
    
    /**
     * Test 1: Verify all components have template.php files
     */
    private function test_missing_template_files() {
        $this->add_test_result('Missing Template Files Check', function() {
            $this->component_discovery->scan();
            $components = $this->component_discovery->getComponents();
            
            $missing_templates = [];
            $total_components = 0;
            
            foreach ($components as $name => $component) {
                $total_components++;
                $template_path = GMKB_PLUGIN_DIR . 'components/' . $name . '/template.php';
                
                if (!file_exists($template_path)) {
                    $missing_templates[] = $name;
                }
            }
            
            if (empty($missing_templates)) {
                return [
                    'status' => 'PASS',
                    'message' => "All {$total_components} components have template.php files",
                    'details' => ['total_components' => $total_components]
                ];
            } else {
                return [
                    'status' => 'FAIL', 
                    'message' => count($missing_templates) . ' components missing template.php',
                    'details' => ['missing' => $missing_templates]
                ];
            }
        });
    }
    
    /**
     * Test 2: Verify ComponentDiscovery alias functionality
     */
    private function test_component_discovery_aliases() {
        $this->add_test_result('Component Discovery Aliases', function() {
            $this->component_discovery->scan();
            
            // Test key alias mappings
            $test_mappings = [
                'bio' => 'biography',
                'authority' => 'authority-hook',
                'social-links' => 'social'
            ];
            
            $alias_results = [];
            foreach ($test_mappings as $alias => $expected) {
                $resolved = $this->component_discovery->resolveComponentType($alias);
                $component = $this->component_discovery->getComponentByType($alias);
                
                $alias_results[$alias] = [
                    'resolved_to' => $resolved,
                    'expected' => $expected,
                    'component_found' => !is_null($component),
                    'correct_resolution' => $resolved === $expected
                ];
            }
            
            $passed = array_filter($alias_results, function($result) {
                return $result['correct_resolution'] && $result['component_found'];
            });
            
            if (count($passed) === count($test_mappings)) {
                return [
                    'status' => 'PASS',
                    'message' => 'All component aliases resolve correctly',
                    'details' => $alias_results
                ];
            } else {
                return [
                    'status' => 'FAIL',
                    'message' => 'Some component aliases failed to resolve',
                    'details' => $alias_results
                ];
            }
        });
    }
    
    /**
     * Test 3: REST API alias resolution
     */
    private function test_rest_api_alias_resolution() {
        $this->add_test_result('REST API Alias Resolution', function() {
            // Test the REST API controller directly
            if (!class_exists('GMKB_REST_Templates_Controller')) {
                return [
                    'status' => 'FAIL',
                    'message' => 'GMKB_REST_Templates_Controller class not found'
                ];
            }
            
            // Create a mock request for 'bio' component
            $request = new WP_REST_Request('GET', '/guestify/v1/templates/bio');
            $request->set_param('type', 'bio');
            
            $controller = new GMKB_REST_Templates_Controller();
            $response = $controller->get_single_template($request);
            
            if (is_wp_error($response)) {
                return [
                    'status' => 'FAIL',
                    'message' => 'REST API returned error: ' . $response->get_error_message(),
                    'details' => ['error_code' => $response->get_error_code()]
                ];
            }
            
            $data = $response->get_data();
            
            if ($data['success'] && isset($data['resolved_from_alias']) && $data['resolved_from_alias']) {
                return [
                    'status' => 'PASS',
                    'message' => 'REST API correctly resolved bio -> biography alias',
                    'details' => [
                        'requested_type' => $data['type'],
                        'actual_type' => $data['actual_type'],
                        'resolved_from_alias' => $data['resolved_from_alias']
                    ]
                ];
            } else {
                return [
                    'status' => 'FAIL',
                    'message' => 'REST API did not handle alias resolution properly',
                    'details' => $data
                ];
            }
        });
    }
    
    /**
     * Test 4: REST API error handling 
     */
    private function test_rest_api_error_handling() {
        $this->add_test_result('REST API Error Handling', function() {
            // Test with non-existent component
            $request = new WP_REST_Request('GET', '/guestify/v1/templates/nonexistent');
            $request->set_param('type', 'nonexistent-component');
            
            $controller = new GMKB_REST_Templates_Controller();
            $response = $controller->get_single_template($request);
            
            if (is_wp_error($response)) {
                $error_data = $response->get_error_data();
                if (isset($error_data['status']) && $error_data['status'] === 404) {
                    return [
                        'status' => 'PASS',
                        'message' => 'REST API correctly returns 404 for non-existent components',
                        'details' => [
                            'error_code' => $response->get_error_code(),
                            'error_message' => $response->get_error_message()
                        ]
                    ];
                }
            }
            
            return [
                'status' => 'FAIL',
                'message' => 'REST API did not handle non-existent component properly',
                'details' => is_wp_error($response) ? $response->get_error_message() : 'No error returned'
            ];
        });
    }
    
    /**
     * Test 5: Specific bio -> biography mapping
     */
    private function test_bio_biography_mapping() {
        $this->add_test_result('Bio -> Biography Mapping', function() {
            // Test that the specific 'bio' error from console logs is fixed
            $biography_path = GMKB_PLUGIN_DIR . 'components/biography/template.php';
            $authority_hook_path = GMKB_PLUGIN_DIR . 'components/authority-hook/template.php';
            
            $results = [
                'biography_template_exists' => file_exists($biography_path),
                'authority_hook_template_exists' => file_exists($authority_hook_path),
                'bio_resolves_to_biography' => $this->component_discovery->resolveComponentType('bio') === 'biography',
                'biography_component_exists' => !is_null($this->component_discovery->getComponent('biography'))
            ];
            
            $all_passed = !in_array(false, $results, true);
            
            return [
                'status' => $all_passed ? 'PASS' : 'FAIL',
                'message' => $all_passed ? 'Bio -> Biography mapping fully functional' : 'Some bio mapping issues remain',
                'details' => $results
            ];
        });
    }
    
    /**
     * Test 6: Authority Hook template creation
     */
    private function test_authority_hook_template() {
        $this->add_test_result('Authority Hook Template', function() {
            $template_path = GMKB_PLUGIN_DIR . 'components/authority-hook/template.php';
            
            if (!file_exists($template_path)) {
                return [
                    'status' => 'FAIL',
                    'message' => 'Authority Hook template.php file not found'
                ];
            }
            
            // Check template content
            $template_content = file_get_contents($template_path);
            $required_elements = [
                'mk-component',
                'authority-hook-component',
                'editable-element',
                'data-component="authority-hook"',
                'authority-who',
                'authority-what',
                'authority-when',
                'authority-how'
            ];
            
            $missing_elements = [];
            foreach ($required_elements as $element) {
                if (strpos($template_content, $element) === false) {
                    $missing_elements[] = $element;
                }
            }
            
            if (empty($missing_elements)) {
                return [
                    'status' => 'PASS',
                    'message' => 'Authority Hook template contains all required elements',
                    'details' => [
                        'file_size' => strlen($template_content),
                        'required_elements_found' => count($required_elements)
                    ]
                ];
            } else {
                return [
                    'status' => 'FAIL',
                    'message' => 'Authority Hook template missing required elements',
                    'details' => ['missing_elements' => $missing_elements]
                ];
            }
        });
    }
    
    /**
     * Test 7: End-to-end component loading simulation
     */
    private function test_end_to_end_component_loading() {
        $this->add_test_result('End-to-End Component Loading', function() {
            // Simulate the full component loading process
            $test_components = ['bio', 'authority-hook', 'biography', 'social'];
            $loading_results = [];
            
            foreach ($test_components as $component_type) {
                $resolved_type = $this->component_discovery->resolveComponentType($component_type);
                $template_path = GMKB_PLUGIN_DIR . 'components/' . $resolved_type . '/template.php';
                
                $loading_results[$component_type] = [
                    'resolved_to' => $resolved_type,
                    'template_exists' => file_exists($template_path),
                    'can_load_component' => $this->component_discovery->componentExists($component_type),
                    'rest_api_path' => "/wp-json/guestify/v1/templates/{$component_type}"
                ];
            }
            
            $successful_loads = array_filter($loading_results, function($result) {
                return $result['template_exists'] && $result['can_load_component'];
            });
            
            $success_rate = (count($successful_loads) / count($test_components)) * 100;
            
            return [
                'status' => $success_rate >= 95 ? 'PASS' : 'FAIL',
                'message' => "Component loading success rate: {$success_rate}%",
                'details' => [
                    'success_rate' => $success_rate,
                    'successful_components' => count($successful_loads),
                    'total_tested' => count($test_components),
                    'results' => $loading_results
                ]
            ];
        });
    }
    
    /**
     * Helper method to add test results
     */
    private function add_test_result($test_name, $test_function) {
        try {
            $result = $test_function();
            $result['test_name'] = $test_name;
            $result['timestamp'] = current_time('mysql');
        } catch (Exception $e) {
            $result = [
                'test_name' => $test_name,
                'status' => 'ERROR',
                'message' => 'Test threw exception: ' . $e->getMessage(),
                'timestamp' => current_time('mysql')
            ];
        }
        
        $this->test_results[] = $result;
    }
    
    /**
     * Get formatted results summary
     */
    public function get_results_summary() {
        $total_tests = count($this->test_results);
        $passed_tests = count(array_filter($this->test_results, function($result) {
            return $result['status'] === 'PASS';
        }));
        $failed_tests = count(array_filter($this->test_results, function($result) {
            return $result['status'] === 'FAIL';
        }));
        $error_tests = count(array_filter($this->test_results, function($result) {
            return $result['status'] === 'ERROR';
        }));
        
        $success_rate = $total_tests > 0 ? ($passed_tests / $total_tests) * 100 : 0;
        
        return [
            'summary' => [
                'total_tests' => $total_tests,
                'passed' => $passed_tests,
                'failed' => $failed_tests,
                'errors' => $error_tests,
                'success_rate' => round($success_rate, 1),
                'overall_status' => $success_rate >= 95 ? 'EXCELLENT' : ($success_rate >= 80 ? 'GOOD' : 'NEEDS_WORK')
            ],
            'detailed_results' => $this->test_results,
            'recommendations' => $this->generate_recommendations()
        ];
    }
    
    /**
     * Generate recommendations based on test results
     */
    private function generate_recommendations() {
        $recommendations = [];
        
        foreach ($this->test_results as $result) {
            if ($result['status'] === 'FAIL') {
                switch ($result['test_name']) {
                    case 'Missing Template Files Check':
                        $recommendations[] = 'Create missing template.php files for components listed in test details';
                        break;
                    case 'Component Discovery Aliases':
                        $recommendations[] = 'Fix component alias resolution in ComponentDiscovery class';
                        break;
                    case 'REST API Alias Resolution':
                        $recommendations[] = 'Verify REST API template controller alias handling';
                        break;
                    case 'Bio -> Biography Mapping':
                        $recommendations[] = 'Check specific bio -> biography alias mapping implementation';
                        break;
                    case 'Authority Hook Template':
                        $recommendations[] = 'Create or fix authority-hook component template.php file';
                        break;
                    case 'End-to-End Component Loading':
                        $recommendations[] = 'Review complete component loading pipeline for errors';
                        break;
                }
            }
        }
        
        if (empty($recommendations)) {
            $recommendations[] = '✅ All tests passed! Console errors should be resolved.';
            $recommendations[] = '🧪 Test the Media Kit Builder in browser to confirm fixes.';
            $recommendations[] = '📊 Monitor browser console for any remaining errors.';
        } else {
            $recommendations[] = '🔧 Address the failed tests above to complete the console error fixes.';
            $recommendations[] = '🔄 Re-run tests after making corrections.';
        }
        
        return $recommendations;
    }
}

// Auto-run tests if accessed directly in admin
if (is_admin() && current_user_can('manage_options')) {
    $test_suite = new GMKB_Console_Error_Fix_Tests();
    $results = $test_suite->run_all_tests();
    
    // Display results
    echo '<div style="max-width: 1200px; margin: 20px; font-family: monospace;">';
    echo '<h1>🔧 Media Kit Builder Console Error Fix Test Results</h1>';
    
    // Summary
    $summary = $results['summary'];
    $status_color = $summary['overall_status'] === 'EXCELLENT' ? '#10b981' : 
                   ($summary['overall_status'] === 'GOOD' ? '#f59e0b' : '#ef4444');
    
    echo '<div style="background: ' . $status_color . '; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">';
    echo '<h2>Overall Status: ' . $summary['overall_status'] . '</h2>';
    echo '<p><strong>Success Rate:</strong> ' . $summary['success_rate'] . '%</p>';
    echo '<p><strong>Tests:</strong> ' . $summary['passed'] . ' passed, ' . $summary['failed'] . ' failed, ' . $summary['errors'] . ' errors</p>';
    echo '</div>';
    
    // Detailed Results
    echo '<h3>📊 Detailed Test Results</h3>';
    foreach ($results['detailed_results'] as $result) {
        $status_color = $result['status'] === 'PASS' ? '#10b981' : 
                       ($result['status'] === 'FAIL' ? '#ef4444' : '#f59e0b');
        
        echo '<div style="border: 2px solid ' . $status_color . '; margin: 10px 0; padding: 15px; border-radius: 6px;">';
        echo '<h4 style="color: ' . $status_color . '; margin: 0 0 10px 0;">';
        echo $result['status'] . ': ' . $result['test_name'];
        echo '</h4>';
        echo '<p>' . $result['message'] . '</p>';
        
        if (isset($result['details'])) {
            echo '<details><summary>View Details</summary>';
            echo '<pre>' . print_r($result['details'], true) . '</pre>';
            echo '</details>';
        }
        echo '</div>';
    }
    
    // Recommendations
    echo '<h3>💡 Recommendations</h3>';
    echo '<ul>';
    foreach ($results['recommendations'] as $recommendation) {
        echo '<li>' . $recommendation . '</li>';
    }
    echo '</ul>';
    
    echo '</div>';
}
