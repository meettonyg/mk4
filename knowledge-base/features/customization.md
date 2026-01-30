# Advanced Customization

Fine-tune every detail of your media kit's appearance and behavior.

## Overview

While themes and brand kits handle most visual styling, advanced customization gives you granular control over specific elements. This guide covers:
- Component-level settings
- Layout adjustments
- Custom CSS (advanced)
- Visibility controls

## Component-Level Customization

### Accessing Component Settings

1. Click on any component to select it
2. Open the **Settings** panel on the right
3. Navigate to the **Design** tab

### Common Component Settings

#### Spacing
Control the space around your component:
- **Padding** - Space inside the component
- **Margin** - Space outside the component
- **Section spacing** - Vertical gaps between sections

#### Alignment
Position content within the component:
- Left, Center, Right alignment
- Top, Middle, Bottom vertical alignment

#### Width
Control how wide the component appears:
- Full width
- Contained (max-width)
- Custom percentage

#### Background
Set component backgrounds:
- Color (from brand kit or custom)
- Image background
- Gradient (on supported components)

## Layout Customization

### Reordering Components

Drag and drop to reorder:
1. Hover over component to see the drag handle
2. Click and drag to new position
3. Release to drop

### Section Grouping

Group related components:
- Components in the same section flow together
- Add section dividers between groups
- Apply consistent spacing

### Responsive Behavior

Control how components adapt to screen size:
- Preview in Desktop, Tablet, and Mobile views
- Some settings can be device-specific
- Test thoroughly on actual devices

## Visibility Controls

### Hiding Components

Temporarily hide components without deleting:
1. Select the component
2. Click the **visibility** icon (eye)
3. Hidden components appear dimmed in editor

### Conditional Visibility

Control when components appear:
- **Show on mobile only** - For mobile-specific content
- **Hide on mobile** - For desktop-optimized content
- **Draft status** - Keep in progress but not published

## Typography Customization

### Text Styling

For components with text:
- **Font size** - Heading levels and body text
- **Font weight** - Bold, normal, light
- **Line height** - Space between lines
- **Letter spacing** - Space between characters

### Heading Hierarchy

Maintain proper heading structure:
- H1 - Main page title (usually in Hero)
- H2 - Section headings
- H3 - Subsection headings
- H4+ - Additional levels as needed

## Color Customization

### Using Brand Kit Colors

When a Brand Kit is linked:
- Primary color applies to key elements
- Secondary color for accents
- Text colors for readability

### Custom Colors

Override for specific elements:
- Enter hex codes directly (#FF5733)
- Use the color picker
- Match exact brand specifications

### Color Accessibility

Ensure readability:
- Sufficient contrast between text and background
- Test with accessibility tools
- Don't rely on color alone for meaning

## Custom CSS (Advanced)

For users comfortable with CSS:

### Accessing Custom CSS

1. Go to **Settings** > **Advanced**
2. Find **Custom CSS** section
3. Enter your CSS rules
4. Save and preview

### Example Custom CSS

```css
/* Custom font for headings */
.media-kit h1, .media-kit h2, .media-kit h3 {
  font-family: 'Your Font', sans-serif;
}

/* Custom button style */
.media-kit .cta-button {
  border-radius: 50px;
  text-transform: uppercase;
}

/* Custom spacing */
.media-kit .section {
  padding: 60px 0;
}
```

### CSS Best Practices

- Use `.media-kit` prefix to scope styles
- Test on all devices
- Don't override core functionality
- Document your customizations

## Export and Embed Customization

### Embed Settings

When embedding your media kit:
- **Width** - Fixed or responsive
- **Height** - Auto or fixed
- **Scrolling** - Enable or disable

### Export Options

When exporting:
- PDF formatting options
- Image quality settings
- Content selection

## Best Practices

### Start with Themes
Themes provide a solid foundation. Customize on top, don't start from scratch.

### Use Brand Kits
Centralize color management in Brand Kits rather than custom colors everywhere.

### Test Responsively
Always preview changes on multiple device sizes.

### Document Changes
Keep notes on custom CSS and unusual settings for future reference.

### Keep It Simple
More customization isn't always better. Focus on what improves the experience.

## Troubleshooting

### Styles Not Applying

- Check for conflicting settings
- Ensure CSS syntax is correct
- Try clearing browser cache
- Verify the component is published, not draft

### Layout Issues

- Check responsive preview on each device
- Verify spacing settings
- Look for conflicting width settings

### Reset to Default

To undo customizations:
- Individual settings: Look for "reset" option
- Theme: Reapply the theme
- Custom CSS: Remove custom code

## Related Features

- [Themes](./themes.md) - Pre-built visual styles
- [Brand Kits](./brand-kits.md) - Centralized branding
- [Components](../components/overview.md) - Component-specific options
