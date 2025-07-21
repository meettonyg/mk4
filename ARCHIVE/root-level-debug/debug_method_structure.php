<?php
$content = file_get_contents('includes/enqueue.php');
$lines = explode("\n", $content);

echo "Checking specific areas around the brace issues:\n\n";

// Look for the legacy_enqueue_scripts method pattern
for ($i = 0; $i < count($lines); $i++) {
    $line = trim($lines[$i]);
    if (strpos($line, 'legacy_enqueue_scripts') !== false) {
        echo "Found legacy_enqueue_scripts at line " . ($i + 1) . "\n";
        // Show surrounding lines
        for ($j = max(0, $i - 2); $j <= min(count($lines) - 1, $i + 50); $j++) {
            $marker = ($j == $i) ? " <-- FOUND METHOD" : "";
            echo sprintf("%3d: %s%s\n", $j + 1, $lines[$j], $marker);
        }
        break;
    }
}

echo "\n\nLooking for the specific debug log pattern:\n";
for ($i = 0; $i < count($lines); $i++) {
    $line = trim($lines[$i]);
    if (strpos($line, 'WordPress-compatible loading eliminates ES6') !== false) {
        echo "Found debug pattern at line " . ($i + 1) . "\n";
        // Show surrounding lines
        for ($j = max(0, $i - 5); $j <= min(count($lines) - 1, $i + 10); $j++) {
            $marker = ($j == $i) ? " <-- FOUND DEBUG LINE" : "";
            echo sprintf("%3d: %s%s\n", $j + 1, $lines[$j], $marker);
        }
        break;
    }
}
?>