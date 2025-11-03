<?php
/**
 * TEST SCRIPT: Verify URL Detection Regex Fix
 * 
 * This script tests the fixed regex patterns to ensure they correctly
 * detect media kit URLs in all variations.
 * 
 * Run this from command line: php test-url-detection.php
 */

// Test cases - all should return TRUE (match)
$should_match = array(
    '/media-kit',                       // No slash, no query
    '/media-kit/',                      // Slash, no query
    '/media-kit?mkcg_id=123',           // No slash, with query
    '/media-kit/?mkcg_id=123',          // Slash, with query (THE BUG FIX)
    '/media-kit?mkcg_id=32372',         // Original failing case
    '/media-kit/?mkcg_id=32372',        // Original failing case with slash
    '/media-kit&test=1',                // No slash, with ampersand
    '/media-kit/&test=1',               // Slash, with ampersand
    '/tools/media-kit',                 // Tools path, no slash
    '/tools/media-kit/',                // Tools path, with slash
    '/tools/media-kit?id=1',            // Tools path, with query
    '/tools/media-kit/?id=1',           // Tools path, slash + query
    '/guestify-media-kit',              // Alt name, no slash
    '/guestify-media-kit/',             // Alt name, with slash
    '/guestify-media-kit?id=1',         // Alt name, with query
    '/guestify-media-kit/?id=1',        // Alt name, slash + query
);

// Test cases - all should return FALSE (no match)
$should_not_match = array(
    '/tools/topics',                    // Wrong tool
    '/tools/topics/',                   // Wrong tool with slash
    '/tools/questions',                 // Wrong tool
    '/tools/offer-generator',           // Wrong tool
    '/media',                           // Partial match
    '/media-kits',                      // Plural
    '/my-media-kit',                    // Prefix
    '/category/app/page/9/',            // Completely different
    '/wp-admin/post.php',               // Admin page
);

echo "\n";
echo "======================================\n";
echo "URL DETECTION REGEX TEST\n";
echo "======================================\n\n";

// Test the fixed patterns
$pattern1 = '#/tools/media-kit($|/|\?|&)#';
$pattern2 = '#^/media-kit($|/|\?|&)#';
$pattern3 = '#^/guestify-media-kit($|/|\?|&)#';

function test_url($uri, $expected_match, $pattern1, $pattern2, $pattern3) {
    $matches = (
        preg_match($pattern1, $uri) !== 0 ||
        preg_match($pattern2, $uri) !== 0 ||
        preg_match($pattern3, $uri) !== 0
    );
    
    $result = ($matches === $expected_match) ? '✅ PASS' : '❌ FAIL';
    $status = $matches ? 'MATCHED' : 'NO MATCH';
    
    printf("%-50s %s (%s)\n", $uri, $result, $status);
    
    return ($matches === $expected_match);
}

echo "SHOULD MATCH (Expected: TRUE)\n";
echo "-----------------------------------\n";
$pass_count = 0;
$total = count($should_match);

foreach ($should_match as $uri) {
    if (test_url($uri, true, $pattern1, $pattern2, $pattern3)) {
        $pass_count++;
    }
}

echo "\n";
echo "SHOULD NOT MATCH (Expected: FALSE)\n";
echo "-----------------------------------\n";
$pass_not_count = 0;
$total_not = count($should_not_match);

foreach ($should_not_match as $uri) {
    if (test_url($uri, false, $pattern1, $pattern2, $pattern3)) {
        $pass_not_count++;
    }
}

echo "\n";
echo "======================================\n";
echo "TEST RESULTS\n";
echo "======================================\n";
printf("Should Match:     %d/%d passed\n", $pass_count, $total);
printf("Should Not Match: %d/%d passed\n", $pass_not_count, $total_not);
printf("\nOVERALL: %d/%d tests passed\n", 
    $pass_count + $pass_not_count, 
    $total + $total_not
);

if ($pass_count === $total && $pass_not_count === $total_not) {
    echo "\n✅ ALL TESTS PASSED! Regex fix is working correctly.\n";
} else {
    echo "\n❌ SOME TESTS FAILED! Review the results above.\n";
}

echo "\n";
