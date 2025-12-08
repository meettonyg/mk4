# Component Documentation Index

This directory contains comprehensive documentation for all Media Kit Builder components.

## 📚 Documentation Files

### 1. **COMPONENT-CONTENT-FIELDS-REFERENCE.md**
Complete, detailed reference of all content fields for every component.

**Contents:**
- Field specifications for all 16 components
- Field types, IDs, and data keys
- Placeholders and default values
- Repeatable item structures
- Legacy compatibility mappings
- Field type reference guide

**Use this when:**
- Adding new fields to components
- Understanding data structure
- Debugging field persistence
- Ensuring consistency across components

---

### 2. **COMPONENT-FIELDS-SUMMARY.md**
Quick reference guide with high-level overview of all components.

**Contents:**
- List of all 16 components with brief descriptions
- Key patterns (repeatable items, media library, conditional fields)
- Default values summary
- Usage notes and best practices
- Component update guidelines

**Use this when:**
- Getting quick overview of available components
- Understanding component patterns
- Looking up default values
- Planning new component development

---

## 🎯 All Components

1. **Biography** - Personal profile section
2. **Hero** - Landing page hero
3. **Stats** - Statistical displays
4. **Topics** - Expertise areas
5. **Contact** - Contact information
6. **Testimonials** - Client testimonials
7. **Social Links** - Social media
8. **Photo Gallery** - Image grid
9. **Booking Calendar** - Meeting scheduler
10. **Call to Action** - Action prompts
11. **Guest Intro** - Guest profiles
12. **Logo Grid** - Partner logos
13. **Podcast Player** - Podcast episodes
14. **Questions** - FAQ section
15. **Topics & Questions** - Combined T&Q
16. **Video Intro** - Video embeds

---

## 🔍 Quick Search

### By Feature

**Media Library Integration:**
- Biography (Profile Image)
- Hero (Background Image)
- Guest Intro (Profile Image)

**Repeatable Items (Unlimited):**
- Stats
- Topics
- Testimonials
- Questions
- Guest Intro (Key Points)

**Repeatable Items (Limited):**
- Photo Gallery (max 12)
- Logo Grid (max 12)
- Podcast Player (max 5)

**Social Media Fields:**
- Biography (3 platforms)
- Contact (4 platforms)
- Social Links (8 platforms)

**Conditional Visibility:**
- Testimonials (Autoplay Interval)
- Booking Calendar (Fallback Form)
- Guest Intro (Key Points, Links)

---

## 📝 Component Structure

### Standard Editor Structure
Most components follow this pattern:

```
ComponentEditor.vue
├── ComponentEditorTemplate wrapper
│   ├── #content slot
│   │   ├── Section 1: Main Settings
│   │   ├── Section 2: Content Fields
│   │   └── Section 3: Display Options
│   ├── #design slot (handled by template)
│   └── #typography slot (handled by template)
└── Script setup
    ├── props (componentId)
    ├── localData (reactive state)
    ├── loadComponentData()
    ├── updateComponent() (debounced)
    └── event handlers
```

### Field Naming Conventions
- **IDs**: kebab-case (e.g., `bio-name`)
- **Data Keys**: camelCase (e.g., `fullName`)
- **Labels**: Title Case with context (e.g., "Full Name")
- **Placeholders**: Descriptive examples (e.g., "Enter full name...")

---

## 🛠️ Development Guidelines

### Adding New Fields
1. Add to editor template (`#content` slot)
2. Add to `localData.ref()` with default value
3. Add to `loadComponentData()` with fallback
4. Include in `updateComponent()` data object
5. Update component's `schema.json` if needed
6. Update this documentation
7. Test persistence and retrieval

### Field Best Practices
- Use semantic HTML input types
- Provide meaningful placeholders
- Set appropriate defaults
- Include help text for complex fields
- Filter empty values before saving
- Maintain legacy data key compatibility

### Testing Checklist
- [ ] Field appears in editor
- [ ] Data persists on save
- [ ] Data loads correctly
- [ ] Empty values filtered
- [ ] Default values work
- [ ] Dark mode styling
- [ ] Debounce works (300ms)
- [ ] Legacy keys compatible (if applicable)

---

## 📊 Statistics

- **Total Components**: 16
- **Total Unique Content Fields**: 100+
- **Components with Repeatable Items**: 9
- **Components with Media Library**: 3
- **Components with Conditional Fields**: 3
- **Field Types Used**: 8 (text, textarea, url, email, tel, number, select, checkbox)

---

## 🔗 Related Files

### Component Definitions
Each component directory contains:
- `component.json` - Component metadata
- `schema.json` - Data schema and options
- `*Editor.vue` - Content editor
- `*Renderer.vue` - Display component
- `template.php` - Server-side render
- `styles.css` - Component styles

### Core System Files
- `includes/api/ComponentDiscoveryAPI.php` - Component discovery
- `src/stores/mediaKit.js` - State management
- `src/vue/components/sidebar/editors/ComponentEditorTemplate.vue` - Editor wrapper

---

## 📅 Maintenance

**Last Updated:** October 14, 2025  
**Next Review:** When adding new components or fields

**Update Triggers:**
- New component added
- New fields added to existing component
- Field behavior changed
- Data structure modified
- Legacy compatibility issue found

---

## 💡 Tips

1. **Use the Summary** for quick lookups
2. **Use the Reference** for detailed specs
3. **Check patterns** before implementing new features
4. **Maintain consistency** across components
5. **Document changes** immediately
6. **Test thoroughly** before deploying

---

*For questions or suggestions about this documentation, contact the development team.*
