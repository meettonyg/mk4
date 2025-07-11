<?php
// Debug script to find the syntax error around line 354
$file = 'includes/enqueue.php';
$content = file_get_contents($file);
$lines = explode("\n", $content);

echo "Examining lines around 354:\n\n";

// Show lines 350-360 to see the context
for ($i = 349; $i <= 359; $i++) {
    if (isset($lines[$i])) {
        $lineNum = $i + 1;
        echo sprintf("%3d: %s\n", $lineNum, $lines[$i]);
        if ($lineNum == 354) {
            echo "     ^^^^ ERROR LINE ^^^^\n";
        }
    }
}

echo "\nLooking for class structure issues:\n";

// Find unclosed braces or method definitions
$braceCount = 0;
$inClass = false;
$currentMethod = '';

for ($i = 0; $i < count($lines); $i++) {
    $line = trim($lines[$i]);
    $lineNum = $i + 1;
    
    if (strpos($line, 'class ') === 0) {
        $inClass = true;
        echo "Line $lineNum: Found class declaration: $line\n";
    }
    
    if ($inClass && ($lineNum >= 350 && $lineNum <= 360)) {
        if (strpos($line, 'private') !== false || strpos($line, 'public') !== false || strpos($line, 'protected') !== false) {
            echo "Line $lineNum: Method/Property: $line\n";
        }
        
        if (strpos($line, '{') !== false) {
            $braceCount += substr_count($line, '{');
        }
        if (strpos($line, '}') !== false) {
            $braceCount -= substr_count($line, '}');
        }
        
        echo "Line $lineNum: Brace count: $braceCount\n";
    }
}
?>