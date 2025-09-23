"""
Batch move Vue renderers to their component directories
"""
import os
import shutil
import json

# Define the component mappings
components = {
    'testimonials': 'TestimonialsRenderer.vue',
    'call-to-action': 'CallToActionRenderer.vue',
    'questions': 'QuestionsRenderer.vue',
    'stats': 'StatsRenderer.vue',
    'video-intro': 'VideoIntroRenderer.vue',
    'photo-gallery': 'PhotoGalleryRenderer.vue',
    'podcast-player': 'PodcastPlayerRenderer.vue',
    'booking-calendar': 'BookingCalendarRenderer.vue',
    'authority-hook': 'AuthorityHookRenderer.vue',
    'guest-intro': 'GuestIntroRenderer.vue',
    'logo-grid': 'LogoGridRenderer.vue'
}

# Source and destination paths
src_dir = 'src/vue/components/renderers/'
components_dir = 'components/'

def move_renderer(component_type, renderer_file):
    """Move a Vue renderer to its component directory"""
    src_path = os.path.join(src_dir, renderer_file)
    dest_dir = os.path.join(components_dir, component_type)
    dest_path = os.path.join(dest_dir, renderer_file)
    
    # Create directory if it doesn't exist
    os.makedirs(dest_dir, exist_ok=True)
    
    # Copy the file if source exists
    if os.path.exists(src_path):
        shutil.copy2(src_path, dest_path)
        print(f"✓ Moved {renderer_file} to {component_type}/")
        return True
    else:
        print(f"✗ Source not found: {src_path}")
        return False

def create_component_json(component_type, renderer_file, name, description, category):
    """Create component.json manifest file"""
    manifest = {
        "type": component_type,
        "name": name,
        "description": description,
        "category": category,
        "version": "1.0.0",
        "renderers": {
            "php": "template.php",
            "javascript": "renderer.js",
            "vue": renderer_file
        },
        "styles": "styles.css",
        "schema": "schema.json",
        "supports": {
            "serverRender": True,
            "vueRender": True,
            "inlineEdit": True,
            "designPanel": True
        }
    }
    
    dest_dir = os.path.join(components_dir, component_type)
    manifest_path = os.path.join(dest_dir, 'component.json')
    
    # Only create if it doesn't exist
    if not os.path.exists(manifest_path):
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        print(f"✓ Created component.json for {component_type}")
    else:
        print(f"⚠ component.json already exists for {component_type}")

# Component metadata
component_metadata = {
    'testimonials': ('Testimonials', 'Client testimonials carousel', 'social-proof'),
    'call-to-action': ('Call to Action', 'Call to action section with buttons', 'conversion'),
    'questions': ('FAQ', 'Frequently asked questions accordion', 'content'),
    'stats': ('Statistics', 'Display key statistics and numbers', 'social-proof'),
    'video-intro': ('Video Introduction', 'Embedded video player', 'media'),
    'photo-gallery': ('Photo Gallery', 'Image gallery with lightbox', 'media'),
    'podcast-player': ('Podcast Player', 'Podcast episodes player', 'media'),
    'booking-calendar': ('Booking Calendar', 'Appointment booking calendar', 'conversion'),
    'authority-hook': ('Authority Hook', 'Establish credibility and authority', 'social-proof'),
    'guest-intro': ('Guest Introduction', 'Guest speaker introduction', 'content'),
    'logo-grid': ('Logo Grid', 'Display client or partner logos', 'social-proof')
}

# Move all components
print("Moving Vue renderers to component directories...")
print("-" * 50)

for component_type, renderer_file in components.items():
    # Move the renderer
    success = move_renderer(component_type, renderer_file)
    
    # Create component.json if move was successful
    if success and component_type in component_metadata:
        name, desc, category = component_metadata[component_type]
        create_component_json(component_type, renderer_file, name, desc, category)
    
    print()

print("-" * 50)
print("Migration complete!")
print("\nNext steps:")
print("1. Delete src/vue/components/renderers/ directory")
print("2. Update ComponentRenderer.vue imports to use component directories")
print("3. Test the build process")
