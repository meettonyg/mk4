#!/bin/bash
echo "Fixing npm vulnerabilities in Media Kit Builder"
echo "================================================"
echo ""

cd "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo "1. Running npm audit to see detailed vulnerability report:"
npm audit

echo ""
echo "2. Attempting to automatically fix vulnerabilities:"
npm audit fix

echo ""
echo "3. If some vulnerabilities remain, trying with force flag (use with caution):"
echo "   Run 'npm audit fix --force' only if you're comfortable with potential breaking changes"

echo ""
echo "4. Checking final status:"
npm audit

echo ""
echo "================================================"
echo "Vulnerability fix process complete!"
echo ""
echo "NOTES:"
echo "- Some vulnerabilities may be in dev dependencies only (less critical)"
echo "- Critical vulnerabilities should be addressed before production"
echo "- Check if updates broke anything before building"
