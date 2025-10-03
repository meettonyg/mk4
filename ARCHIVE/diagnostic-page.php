<!DOCTYPE html>
<html>
<head>
    <title>Media Kit Diagnostic Tool</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #295cff;
            padding-bottom: 10px;
        }
        .form-group {
            margin: 20px 0;
        }
        label {
            display: block;
            font-weight: 600;
            margin-bottom: 8px;
            color: #555;
        }
        input[type="number"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        button {
            background: #295cff;
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
        }
        button:hover {
            background: #1e4ed8;
        }
        .results {
            margin-top: 30px;
            padding: 20px;
            background: #f9f9f9;
            border-radius: 4px;
            border-left: 4px solid #295cff;
        }
        .error {
            background: #fee;
            border-left-color: #f44;
        }
        .success {
            background: #efe;
            border-left-color: #4f4;
        }
        pre {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 20px;
            border-radius: 4px;
            overflow-x: auto;
            max-height: 600px;
        }
        .status {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 14px;
            font-weight: 600;
        }
        .status.good {
            background: #d4edda;
            color: #155724;
        }
        .status.bad {
            background: #f8d7da;
            color: #721c24;
        }
        .status.warn {
            background: #fff3cd;
            color: #856404;
        }
        .quick-links {
            margin: 20px 0;
            padding: 15px;
            background: #e7f3ff;
            border-radius: 4px;
        }
        .quick-links a {
            display: inline-block;
            margin-right: 15px;
            color: #295cff;
            text-decoration: none;
            font-weight: 600;
        }
        .quick-links a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Media Kit Diagnostic Tool</h1>
        
        <p>This tool helps diagnose frontend display issues by inspecting the actual media kit data structure.</p>
        
        <div class="form-group">
            <label for="postId">Enter Post ID:</label>
            <input type="number" id="postId" placeholder="e.g., 32372">
        </div>
        
        <button onclick="runDiagnostic()">Run Diagnostic</button>
        
        <div class="quick-links">
            <strong>Quick Links:</strong>
            <a href="#" onclick="loadPost(32372); return false;">Test with 32372</a>
            <a href="<?php echo home_url('/wp-json/gmkb/v1/debug/32372'); ?>" target="_blank">API Debug View</a>
            <a href="<?php echo admin_url('edit.php?post_type=guests'); ?>">View All Guests</a>
        </div>
        
        <div id="results"></div>
    </div>

    <script>
    function loadPost(id) {
        document.getElementById('postId').value = id;
        runDiagnostic();
    }

    async function runDiagnostic() {
        const postId = document.getElementById('postId').value;
        const resultsDiv = document.getElementById('results');
        
        if (!postId) {
            resultsDiv.innerHTML = '<div class="results error">Please enter a post ID</div>';
            return;
        }
        
        resultsDiv.innerHTML = '<div class="results">Loading...</div>';
        
        try {
            // Call the debug endpoint
            const response = await fetch(`/wp-json/gmkb/v1/debug/${postId}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            // Build results HTML
            let html = '<div class="results success">';
            html += '<h2>✅ Diagnostic Results for Post ' + postId + '</h2>';
            
            // Basic info
            html += '<h3>Post Information</h3>';
            html += '<p><strong>Title:</strong> ' + data.post_title + '</p>';
            html += '<p><strong>Type:</strong> ' + data.post_type + '</p>';
            html += '<p><strong>Has State:</strong> ' + (data.has_state ? '✅ Yes' : '❌ No') + '</p>';
            
            if (data.structure) {
                html += '<h3>Structure Analysis</h3>';
                html += '<table style="width:100%; border-collapse: collapse;">';
                html += '<tr style="background: #f0f0f0;"><th style="padding:8px; text-align:left;">Property</th><th style="padding:8px; text-align:left;">Status</th></tr>';
                
                const addRow = (label, hasIt, count) => {
                    const status = hasIt ? 'good' : 'bad';
                    const text = hasIt ? `✅ Yes (${count})` : '❌ No';
                    return `<tr><td style="padding:8px;">${label}</td><td style="padding:8px;"><span class="status ${status}">${text}</span></td></tr>`;
                };
                
                html += addRow('Sections', data.structure.has_sections, data.structure.section_count);
                html += addRow('Components', data.structure.has_components, data.structure.component_count);
                html += addRow('Saved Components', data.structure.has_saved_components, data.structure.saved_component_count);
                html += addRow('Layout Array', data.structure.has_layout, data.structure.layout_count);
                html += '</table>';
            }
            
            // Sections detail
            if (data.sections && data.sections.length > 0) {
                html += '<h3>Sections Detail</h3>';
                data.sections.forEach((section, idx) => {
                    html += `<div style="margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #295cff;">`;
                    html += `<strong>Section ${idx}:</strong> ${section.section_id}<br>`;
                    html += `<strong>Type:</strong> ${section.section_type}<br>`;
                    html += `<strong>Components:</strong> ${section.component_ref_count}<br>`;
                    if (section.component_refs.length > 0) {
                        html += '<ul style="margin: 5px 0;">';
                        section.component_refs.forEach(ref => {
                            const refId = typeof ref === 'string' ? ref : (ref.component_id || 'Unknown');
                            html += `<li>${refId}</li>`;
                        });
                        html += '</ul>';
                    }
                    html += '</div>';
                });
            }
            
            // Components detail
            if (data.components && data.components.length > 0) {
                html += '<h3>Components Detail</h3>';
                data.components.forEach(comp => {
                    html += `<div style="margin: 10px 0; padding: 10px; background: #f9f9f9; border-left: 3px solid #10b981;">`;
                    html += `<strong>${comp.id}</strong> (${comp.type})<br>`;
                    html += `<strong>Section:</strong> ${comp.section_id}<br>`;
                    html += `<strong>Has Props:</strong> ${comp.has_props ? '✅' : '❌'}<br>`;
                    html += `<strong>Has Settings:</strong> ${comp.has_settings ? '✅' : '❌'}<br>`;
                    html += `<strong>Has Data:</strong> ${comp.has_data ? '✅' : '❌'}<br>`;
                    
                    // Show props if available
                    if (comp.props) {
                        html += '<details style="margin-top: 10px;"><summary style="cursor:pointer; font-weight:600;">View Props</summary>';
                        html += '<pre style="font-size: 12px; max-height: 200px;">' + JSON.stringify(comp.props, null, 2) + '</pre>';
                        html += '</details>';
                    }
                    
                    html += '</div>';
                });
            }
            
            // Raw state
            html += '<details style="margin-top: 20px;"><summary style="cursor:pointer; font-weight:600; font-size: 16px;">🔍 View Raw State (Technical)</summary>';
            html += '<pre>' + JSON.stringify(data.raw_state, null, 2) + '</pre>';
            html += '</details>';
            
            html += '</div>';
            
            resultsDiv.innerHTML = html;
            
        } catch (error) {
            resultsDiv.innerHTML = '<div class="results error"><h2>❌ Error</h2><p>' + error.message + '</p></div>';
        }
    }
    </script>
</body>
</html>
