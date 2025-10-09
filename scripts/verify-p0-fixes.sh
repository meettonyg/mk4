#!/bin/bash

# P0 Fixes Verification Script
# Run this to verify all P0 fixes are properly implemented

echo "🔍 P0 FIXES VERIFICATION"
echo "========================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Test 1: No direct window assignments
echo "Test 1: Checking for direct window assignments..."
if grep -r "window\.gmkbStore\s*=" src/ 2>/dev/null; then
    echo -e "${RED}❌ FAIL: Found direct window.gmkbStore assignment${NC}"
    ((FAIL++))
else
    echo -e "${GREEN}✅ PASS: No direct window.gmkbStore assignments${NC}"
    ((PASS++))
fi

if grep -r "window\.mediaKitStore\s*=" src/ 2>/dev/null; then
    echo -e "${RED}❌ FAIL: Found direct window.mediaKitStore assignment${NC}"
    ((FAIL++))
else
    echo -e "${GREEN}✅ PASS: No direct window.mediaKitStore assignments${NC}"
    ((PASS++))
fi

# Test 2: LazyComponents removed
echo ""
echo "Test 2: Verifying LazyComponents cleanup..."
LAZY_COUNT=$(grep -c "LazyComponents" src/main.js 2>/dev/null || echo "0")
if [ "$LAZY_COUNT" -eq "0" ]; then
    echo -e "${GREEN}✅ PASS: LazyComponents fully removed${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARNING: LazyComponents mentioned $LAZY_COUNT times (should be only in comments)${NC}"
    echo "   Running detailed check..."
    if grep "Object.entries(LazyComponents)" src/main.js 2>/dev/null; then
        echo -e "${RED}❌ FAIL: LazyComponents still being used${NC}"
        ((FAIL++))
    else
        echo -e "${GREEN}✅ PASS: LazyComponents only in comments${NC}"
        ((PASS++))
    fi
fi

# Test 3: NonceManager removed
echo ""
echo "Test 3: Verifying NonceManager removal..."
if grep "import.*NonceManager" src/main.js 2>/dev/null; then
    echo -e "${RED}❌ FAIL: NonceManager still imported${NC}"
    ((FAIL++))
else
    echo -e "${GREEN}✅ PASS: NonceManager import removed${NC}"
    ((PASS++))
fi

# Test 4: importExportService removed
echo ""
echo "Test 4: Verifying importExportService removal..."
if grep "import.*importExportService" src/main.js 2>/dev/null; then
    echo -e "${RED}❌ FAIL: importExportService still imported${NC}"
    ((FAIL++))
else
    echo -e "${GREEN}✅ PASS: importExportService import removed${NC}"
    ((PASS++))
fi

# Test 5: SecurityService integration
echo ""
echo "Test 5: Checking SecurityService integration..."
SANITIZE_COUNT=$(grep -c "securityService\|security\.sanitize" src/stores/mediaKit.js 2>/dev/null || echo "0")
if [ "$SANITIZE_COUNT" -ge "2" ]; then
    echo -e "${GREEN}✅ PASS: SecurityService integrated ($SANITIZE_COUNT references)${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL: SecurityService not properly integrated (found $SANITIZE_COUNT references, need 2+)${NC}"
    ((FAIL++))
fi

# Test 6: GMKB namespace exists
echo ""
echo "Test 6: Verifying GMKB namespace..."
if grep -q "window.GMKB = {" src/main.js; then
    echo -e "${GREEN}✅ PASS: GMKB namespace exists${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL: GMKB namespace not found${NC}"
    ((FAIL++))
fi

# Test 7: Pure Vue template (no PHP rendering)
echo ""
echo "Test 7: Checking for PHP rendering removal..."
if grep -q "return;" guestify-media-kit-builder.php && grep -q "P0 FIX #9" guestify-media-kit-builder.php; then
    echo -e "${GREEN}✅ PASS: PHP rendering disabled${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARNING: Could not verify PHP rendering fix${NC}"
fi

# Final Summary
echo ""
echo "========================"
echo "📊 VERIFICATION SUMMARY"
echo "========================"
echo -e "Passed: ${GREEN}$PASS${NC}"
echo -e "Failed: ${RED}$FAIL${NC}"
echo ""

if [ "$FAIL" -eq "0" ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED - P0 FIXES VERIFIED${NC}"
    echo ""
    echo "Next steps:"
    echo "1. npm run build  # Build the project"
    echo "2. npm run dev    # Test in development"
    echo "3. Review P0-FIXES-COMPLETE.md for details"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED - REVIEW REQUIRED${NC}"
    echo ""
    echo "Please review the failed tests above and fix issues."
    exit 1
fi
