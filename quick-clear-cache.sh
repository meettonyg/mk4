#!/bin/bash
# Quick cache clear for icon update

# Clear WordPress transients
php -r "
require_once 'C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4/../../../../wp-load.php';

// Clear component discovery cache
\$cache_key = 'gmkb_component_discovery_' . md5('C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4/components/');
delete_transient(\$cache_key);
delete_transient('gmkb_components_cache');
delete_transient('gmkb_component_registry');

echo 'Cache cleared. Refresh browser with Ctrl+Shift+R\n';
"
