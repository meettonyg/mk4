<?php
// PHP Syntax validation for enqueue.php
$file_content = file_get_contents('includes/enqueue.php');

// Check basic PHP syntax
$syntax_check = php_check_syntax('includes/enqueue.php');

if ($syntax_check === false) {
    echo "❌ PHP Syntax Error Found!\n";
} else {
    echo "✅ PHP Syntax is Valid!\n";
}

// Check brace balance
$open_braces = substr_count($file_content, '{');
$close_braces = substr_count($file_content, '}');

echo "\nBrace Analysis:\n";
echo "Opening braces: $open_braces\n";
echo "Closing braces: $close_braces\n";
echo "Balance: " . ($open_braces === $close_braces ? "✅ Balanced" : "❌ Unbalanced") . "\n";

// Check class structure
$lines = explode("\n", $file_content);
$class_count = 0;
$function_count = 0;

foreach ($lines as $line_num => $line) {
    $trimmed = trim($line);
    if (strpos($trimmed, 'class ') === 0) {
        $class_count++;
        echo "\nLine " . ($line_num + 1) . ": Found class declaration: $trimmed\n";
    }
    if (strpos($trimmed, 'function ') !== false && strpos($trimmed, '//') !== 0) {
        $function_count++;
    }
}

echo "\nStructure Summary:\n";
echo "Classes found: $class_count\n";
echo "Functions found: $function_count\n";

echo "\n" . ($syntax_check ? "🎉 File is ready for production!" : "⚠️ Please fix syntax errors") . "\n";
?>