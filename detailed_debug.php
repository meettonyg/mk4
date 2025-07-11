<?php
$file_content = file_get_contents('includes/enqueue.php');
$lines = explode("\n", $file_content);

// Find lines 340-370 to get better context
$start = 339; // 0-based, so line 340
$end = 369;   // line 370

echo "Examining lines " . ($start + 1) . " to " . ($end + 1) . ":\n\n";

for ($i = $start; $i <= $end && $i < count($lines); $i++) {
    $line_num = $i + 1;
    $line_content = $lines[$i];
    
    echo sprintf("%3d: %s\n", $line_num, $line_content);
    
    // Highlight potential issues
    if ($line_num == 354) {
        echo "     ^^^^^ ERROR LINE 354 ^^^^^\n";
    }
    
    // Check for common syntax issues
    if (strpos($line_content, 'private') !== false) {
        echo "     -> Contains 'private'\n";
    }
    if (strpos($line_content, 'function') !== false) {
        echo "     -> Contains 'function'\n";
    }
}

echo "\n\nLooking for brace balance issues around the error:\n";
$brace_count = 0;
for ($i = max(0, $start - 10); $i <= min(count($lines) - 1, $end + 10); $i++) {
    $line = $lines[$i];
    $brace_count += substr_count($line, '{') - substr_count($line, '}');
    
    if ($i >= $start - 5 && $i <= $end + 5) {
        echo sprintf("Line %3d: Brace balance: %2d | %s\n", $i + 1, $brace_count, trim($line));
    }
}
?>