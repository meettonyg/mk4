<?php
/**
 * GMKB Database State Inspector
 * 
 * This tool allows you to inspect what's actually saved in the database
 * for a specific post ID to diagnose persistence issues.
 */

// Add this to the AJAX handlers
add_action('wp_ajax_gmkb_inspect_state', 'gmkb_inspect_database_state');

function gmkb_inspect_database_state() {
    // Verify nonce
    if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'gmkb_nonce')) {
        wp_send_json_error('Invalid nonce');
        return;
    }
    
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    
    if (!$post_id) {
        wp_send_json_error('No post ID provided');
        return;
    }
    
    // Get the raw state from database
    $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
    
    if (empty($saved_state)) {
        wp_send_json_success(array(
            'message' => 'No saved state found',
            'post_id' => $post_id,
            'state_exists' => false
        ));
        return;
    }
    
    // Analyze the state structure
    $analysis = array(
        'post_id' => $post_id,
        'state_exists' => true,
        'is_array' => is_array($saved_state),
        'top_level_keys' => array_keys($saved_state),
        'components_analysis' => array(),
        'sections_analysis' => array(),
        'raw_size' => strlen(serialize($saved_state))
    );
    
    // Analyze components
    if (isset($saved_state['components'])) {
        $components = $saved_state['components'];
        $analysis['components_analysis'] = array(
            'exists' => true,
            'type' => gettype($components),
            'is_array' => is_array($components),
            'is_empty_array' => is_array($components) && empty($components),
            'count' => is_array($components) ? count($components) : 0,
            'component_ids' => is_array($components) ? array_keys($components) : array(),
            'first_5_ids' => is_array($components) ? array_slice(array_keys($components), 0, 5) : array()
        );
        
        // Sample component structure
        if (is_array($components) && !empty($components)) {
            $first_id = array_keys($components)[0];
            $first_component = $components[$first_id];
            $analysis['components_analysis']['sample_component'] = array(
                'id' => $first_id,
                'type' => isset($first_component['type']) ? $first_component['type'] : 'not_set',
                'has_data' => isset($first_component['data']),
                'has_props' => isset($first_component['props']),
                'has_sectionId' => isset($first_component['sectionId']),
                'keys' => array_keys($first_component)
            );
        }
    } else {
        $analysis['components_analysis'] = array(
            'exists' => false,
            'message' => 'No components key in saved state'
        );
    }
    
    // Analyze sections
    if (isset($saved_state['sections']) && is_array($saved_state['sections'])) {
        $sections = $saved_state['sections'];
        $analysis['sections_analysis'] = array(
            'count' => count($sections),
            'sections' => array()
        );
        
        foreach ($sections as $section) {
            $section_info = array(
                'id' => isset($section['section_id']) ? $section['section_id'] : 'unknown',
                'type' => isset($section['section_type']) ? $section['section_type'] : 'unknown',
                'component_count' => isset($section['components']) ? count($section['components']) : 0
            );
            
            if (isset($section['components']) && is_array($section['components'])) {
                $section_info['component_refs'] = array();
                foreach ($section['components'] as $comp_ref) {
                    if (is_string($comp_ref)) {
                        $section_info['component_refs'][] = $comp_ref;
                    } else if (is_array($comp_ref) && isset($comp_ref['component_id'])) {
                        $section_info['component_refs'][] = $comp_ref['component_id'];
                    }
                }
            }
            
            $analysis['sections_analysis']['sections'][] = $section_info;
        }
    } else {
        $analysis['sections_analysis'] = array(
            'count' => 0,
            'message' => 'No sections or sections not an array'
        );
    }
    
    wp_send_json_success($analysis);
}

// Console helper function
?>
<script>
window.inspectDatabaseState = async function(postId) {
    if (!postId) {
        postId = window.gmkbData?.postId || window.apiService?.postId;
    }
    
    if (!postId) {
        console.error('No post ID available');
        return;
    }
    
    console.log('Inspecting database state for post:', postId);
    
    const formData = new FormData();
    formData.append('action', 'gmkb_inspect_state');
    formData.append('nonce', window.gmkbData?.nonce || '');
    formData.append('post_id', postId);
    
    try {
        const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('=== Database State Analysis ===');
            console.log('Post ID:', result.data.post_id);
            console.log('State exists:', result.data.state_exists);
            
            if (result.data.components_analysis) {
                console.log('\n📦 Components Analysis:');
                console.log('  Exists:', result.data.components_analysis.exists);
                console.log('  Count:', result.data.components_analysis.count);
                console.log('  Type:', result.data.components_analysis.type);
                console.log('  Component IDs:', result.data.components_analysis.first_5_ids);
                
                if (result.data.components_analysis.sample_component) {
                    console.log('  Sample component:', result.data.components_analysis.sample_component);
                }
            }
            
            if (result.data.sections_analysis) {
                console.log('\n📐 Sections Analysis:');
                console.log('  Count:', result.data.sections_analysis.count);
                if (result.data.sections_analysis.sections) {
                    result.data.sections_analysis.sections.forEach(section => {
                        console.log(`  - ${section.id}: ${section.component_count} components`);
                    });
                }
            }
            
            console.log('\nFull analysis:', result.data);
            return result.data;
        } else {
            console.error('Failed to inspect state:', result.data);
        }
    } catch (error) {
        console.error('Error inspecting state:', error);
    }
};

console.log('Database inspector loaded. Use: inspectDatabaseState()');
</script>
