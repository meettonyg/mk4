#!/bin/bash
# Cleanup script for old design panel PHP files

echo "Moving remaining old design panel PHP files to archive..."

# Array of component names
components=(
    "booking-calendar"
    "call-to-action"
    "contact"
    "guest-intro"
    "logo-grid"
    "photo-gallery"
    "podcast-player"
    "questions"
    "social"
    "stats"
    "testimonials"
    "video-intro"
)

# Move each file
for component in "${components[@]}"; do
    if [ -f "components/$component/design-panel.php" ]; then
        mv "components/$component/design-panel.php" "ARCHIVE/old-design-panels/$component-design-panel.php"
        echo "Moved $component/design-panel.php"
    fi
done

echo "All old design panel PHP files moved to ARCHIVE/old-design-panels/"
