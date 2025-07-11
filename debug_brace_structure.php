<?php
$content = file_get_contents('includes/enqueue.php');
$lines = explode("\n", $content);

echo "Precise analysis of lines 1280-1295:\n\n";

for ($i = 1279; $i <= 1294 && $i < count($lines); $i++) {
    $line_num = $i + 1;
    $line_content = $lines[$i];
    
    echo sprintf("%4d: '%s'\n", $line_num, $line_content);
    
    if ($line_num == 1291) {
        echo "      ^^^^^ ERROR LINE 1291 ^^^^^\n";
    }
    
    // Show only closing braces
    if (trim($line_content) === '}') {
        echo "      --> STANDALONE CLOSING BRACE\n";
    }
}

echo "\n\nMethod structure analysis:\n";
$in_get_critical_css = false;
for ($i = 1200; $i < count($lines); $i++) {
    $line = trim($lines[$i]);
    $line_num = $i + 1;
    
    if (strpos($line, 'get_critical_css') !== false) {
        $in_get_critical_css = true;
        echo "Line $line_num: START get_critical_css method\n";
    }
    
    if ($in_get_critical_css && $line === '}') {
        echo "Line $line_num: CLOSING BRACE - could be method end\n";
    }
    
    if ($line_num > 1295) break;
}
?>