<?php
// Simple line reader to find the issue
$content = file_get_contents('includes/enqueue.php');
$lines = explode("\n", $content);

echo "Lines 350-360:\n";
for ($i = 349; $i <= 359; $i++) {
    if (isset($lines[$i])) {
        echo ($i + 1) . ": " . $lines[$i] . "\n";
    }
}
?>