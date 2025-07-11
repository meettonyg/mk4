<?php
// Direct approach to find line 354 issue
$content = file_get_contents('includes/enqueue.php');
$lines = explode("\n", $content);

echo "Total lines in file: " . count($lines) . "\n\n";

if (isset($lines[353])) { // Line 354 is index 353
    echo "Line 354 content:\n";
    echo "'" . $lines[353] . "'\n\n";
    
    echo "Context (lines 350-358):\n";
    for ($i = 349; $i <= 357; $i++) {
        if (isset($lines[$i])) {
            $marker = ($i == 353) ? " <-- ERROR LINE" : "";
            echo sprintf("%3d: %s%s\n", $i + 1, $lines[$i], $marker);
        }
    }
    
    // Check for specific issues
    echo "\nChecking for common syntax issues:\n";
    
    // Check if there's an unclosed method/function before line 354
    for ($i = 340; $i <= 360; $i++) {
        if (isset($lines[$i])) {
            $line = trim($lines[$i]);
            if (empty($line)) continue;
            
            if (strpos($line, 'function') !== false && strpos($line, '{') === false && strpos($line, ';') === false) {
                echo "Line " . ($i + 1) . ": Possible unclosed function declaration: $line\n";
            }
            
            if (strpos($line, 'private') !== false || strpos($line, 'public') !== false) {
                echo "Line " . ($i + 1) . ": Method/property declaration: $line\n";
            }
        }
    }
} else {
    echo "Line 354 does not exist in the file!\n";
}
?>