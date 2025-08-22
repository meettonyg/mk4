#!/bin/bash

# Script to help migrate console.log statements to use GMKBDebug
# This creates a report of files that need updating

echo "🔍 Finding console.log statements in JavaScript files..."
echo "=================================================="
echo ""

# Find all JS files with console.log statements
echo "Files with console.log statements:"
echo ""

# Search for console.log in js directory
find js -name "*.js" -type f | while read file; do
    count=$(grep -c "console\.log" "$file" 2>/dev/null || echo 0)
    if [ $count -gt 0 ]; then
        echo "📄 $file: $count occurrences"
        
        # Show specific lines with context
        echo "   Lines with console.log:"
        grep -n "console\.log" "$file" | head -5 | while IFS=: read -r line_num line_content; do
            # Trim whitespace
            trimmed=$(echo "$line_content" | sed 's/^[[:space:]]*//')
            echo "     Line $line_num: $trimmed"
        done
        
        if [ $count -gt 5 ]; then
            echo "     ... and $((count - 5)) more"
        fi
        echo ""
    fi
done

echo ""
echo "=================================================="
echo "Summary of console statements by type:"
echo ""

# Count different types of console statements
log_count=$(find js -name "*.js" -type f -exec grep -h "console\.log" {} \; | wc -l)
error_count=$(find js -name "*.js" -type f -exec grep -h "console\.error" {} \; | wc -l)
warn_count=$(find js -name "*.js" -type f -exec grep -h "console\.warn" {} \; | wc -l)
debug_count=$(find js -name "*.js" -type f -exec grep -h "console\.debug" {} \; | wc -l)

echo "console.log:   $log_count"
echo "console.error: $error_count"
echo "console.warn:  $warn_count"
echo "console.debug: $debug_count"
echo ""
echo "Total:         $((log_count + error_count + warn_count + debug_count))"

echo ""
echo "=================================================="
echo "Recommended categories for common patterns:"
echo ""
echo "🎛️  'Showing controls' → GMKBDebug.log('hover', ...)"
echo "✅  'initialized', 'ready' → GMKBDebug.log('init', ...)"
echo "🔄  'Processing', 'Rendering' → GMKBDebug.log('render', ...)"
echo "💾  'Saving', 'saved' → GMKBDebug.log('save', ...)"
echo "🔧  'Control action' → GMKBDebug.log('controls', ...)"
echo "📊  'State change' → GMKBDebug.log('state', ...)"
echo "❌  'Error', 'Failed' → GMKBDebug.log('error', ...)"

echo ""
echo "=================================================="
echo "Next steps:"
echo "1. Wrap console.log statements with GMKBDebug conditionals"
echo "2. Use appropriate categories for each log type"
echo "3. Test with GMKBDebug.enable() and GMKBDebug.disable()"
echo ""
