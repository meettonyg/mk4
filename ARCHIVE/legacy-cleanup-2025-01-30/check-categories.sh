#!/bin/bash
# Quick script to show remaining component categories

echo "Checking remaining components..."

# Social component
if [ -f "components/social/component.json" ]; then
    echo "Social: $(grep '"category"' components/social/component.json)"
fi

# Contact component  
if [ -f "components/contact/component.json" ]; then
    echo "Contact: $(grep '"category"' components/contact/component.json)"
fi

# Stats component
if [ -f "components/stats/component.json" ]; then
    echo "Stats: $(grep '"category"' components/stats/component.json)"
fi

# Testimonials component
if [ -f "components/testimonials/component.json" ]; then
    echo "Testimonials: $(grep '"category"' components/testimonials/component.json)"
fi

# Call to Action
if [ -f "components/call-to-action/component.json" ]; then
    echo "CTA: $(grep '"category"' components/call-to-action/component.json)"
fi

# Media components
for comp in photo-gallery video-intro podcast-player logo-grid; do
    if [ -f "components/$comp/component.json" ]; then
        echo "$comp: $(grep '"category"' components/$comp/component.json)"
    fi
done
