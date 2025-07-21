<?php
$content = file_get_contents('includes/enqueue.php');
$lines = explode("\n", $content);

echo "Analyzing lines around 1291 for brace balance:\n\n";

// Show lines 1285-1295 to see the context
for ($i = 1284; $i <= 1294 && $i < count($lines); $i++) {
    $line_num = $i + 1;
    $line_content = $lines[$i];
    
    echo sprintf("%4d: %s\n", $line_num, $line_content);
    
    if ($line_num == 1291) {
        echo "      ^^^^^ ERROR LINE 1291 ^^^^^\n";
    }
}

echo "\n\nBrace balance analysis from line 1280-1300:\n";
$brace_count = 0;
for ($i = 1279; $i <= 1299 && $i < count($lines); $i++) {
    $line = $lines[$i];
    $open_braces = substr_count($line, '{');
    $close_braces = substr_count($line, '}');
    $brace_count += $open_braces - $close_braces;
    
    $line_num = $i + 1;
    echo sprintf("Line %4d: %2d braces | %s\n", $line_num, $brace_count, trim($line));
}

echo "\n\nLooking for class and method boundaries:\n";
for ($i = 1280; $i <= 1300 && $i < count($lines); $i++) {
    $line = trim($lines[$i]);
    $line_num = $i + 1;
    
    if (strpos($line, '}') !== false && strlen($line) <= 5) {
        echo "Line $line_num: Standalone closing brace: '$line'\n";
    }
    
    if (strpos($line, 'class ') === 0) {
        echo "Line $line_num: Class declaration: $line\n";
    }
    
    if (strpos($line, 'function ') !== false) {
        echo "Line $line_num: Function declaration: $line\n";
    }
}
?>