#!/bin/bash
echo "Fixing Media Kit Builder Vulnerabilities"
echo "========================================="
echo ""

cd "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo "Step 1: Fixing the critical vulnerability (form-data) safely"
npm audit fix

echo ""
echo "Step 2: Checking production vulnerabilities only"
npm audit --production

echo ""
echo "Step 3: Final audit report"
npm audit

echo ""
echo "========================================="
echo "ANALYSIS:"
echo "- form-data vulnerability should be fixed"
echo "- esbuild is a dev dependency (build tool only)"
echo "- esbuild vulnerability doesn't affect your production bundle"
echo ""
echo "You can now safely run: npm run build"
