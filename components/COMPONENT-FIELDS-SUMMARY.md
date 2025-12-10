# Component Content Fields - Quick Summary

**Date Created:** October 14, 2025  
**Purpose:** Quick reference for all component content fields

---

## 📋 Complete Component List

### 1. **Biography** - Personal profile with social links
- Personal Info (Name, Title, Location)
- Biography Text
- Profile Image (with Media Library)
- Social Links (LinkedIn, Twitter, Website)

### 2. **Hero** - Landing page hero section
- Hero Content (Title, Subtitle)
- Call to Action (Button Text, URL)
- Background Image (with Media Library)
- Layout (Alignment)

### 3. **Stats** - Statistical displays
- Section Settings (Title, Description)
- Statistics (Repeatable: Value, Label, Prefix, Suffix, Icon)
- Display Options (Columns, Style, Show Icons)

### 4. **Topics** - Areas of expertise list
- Section Settings (Title, Description)
- Topics List (Repeatable text inputs)
- Display Options (Columns, Show Icons)

### 5. **Contact** - Contact information
- Section Content (Title, Description)
- Contact Info (Email, Phone, Website, Address)
- Social Media Links (LinkedIn, Twitter, Instagram, Facebook)

### 6. **Testimonials** - Client testimonials carousel
- Section Settings (Title, Description)
- Testimonials (Repeatable: Quote, Author, Title, Image)
- Carousel Options (Autoplay, Interval)

### 7. **Social Links** - Social media connections
- Section Settings (Title, Description)
- 8 Social Networks (Facebook, Twitter, LinkedIn, Instagram, YouTube, TikTok, GitHub, Pinterest)
- Display Options (Show Labels)

### 8. **Photo Gallery** - Image grid
- Section Settings (Title, Description)
- Photos (Repeatable: URL, Caption) - Max 12
- Display Options (Columns)

### 9. **Booking Calendar** - Meeting scheduler
- Section Settings (Title, Description)
- Calendar Integration (Service, URL)
- Fallback Form (Available Times)

### 10. **Call to Action** - Action prompt
- Headlines (Title, Description)
- Buttons (Primary & Secondary)
- Background (Color, Image)

### 11. **Guest Intro** - Guest profile display
- Guest Information (Name, Title, Company)
- Profile Image (with Media Library)
- Introduction Text
- Key Talking Points (Repeatable, Optional)
- Guest Links (Website, LinkedIn, Book, Optional)
- Display Options (Layout, Image Position)

### 12. **Logo Grid** - Partner/client logos
- Section Settings (Title, Description)
- Logos (Repeatable: URL, Name, Link) - Max 12
- Display Options (Grid Columns)

### 13. **Podcast Player** - Podcast episodes
- Section Settings (Title, Description)
- Episodes (Repeatable: Title, Description, Audio URL, Spotify, Apple, Duration) - Max 5

### 14. **Questions** - FAQ component
- Section Settings (Title, Description)
- Questions & Answers (Repeatable: Question, Answer)

### 15. **Topics & Questions** - Combined topics and interview questions
- Display Mode (Topics/Questions/Combined)
- Topics (5 fixed text fields)
- Questions (10 fixed text fields)

### 16. **Video Intro** - Video embed
- Section Settings (Title, Description)
- Video URL (YouTube, Vimeo, or direct)
- Thumbnail (Optional)

---

## 🔑 Key Patterns

### Repeatable Items
Components with dynamic lists:
- **Stats** (unlimited)
- **Topics** (unlimited)
- **Testimonials** (unlimited)
- **Photo Gallery** (max 12)
- **Logo Grid** (max 12)
- **Podcast Player** (max 5)
- **Questions** (unlimited)
- **Guest Intro - Key Points** (unlimited, optional)

### Media Library Integration
Components with WordPress Media Library button:
- Biography (Profile Image)
- Hero (Background Image)
- Guest Intro (Profile Image)

### Conditional Fields
Fields that appear/hide based on other fields:
- **Testimonials**: Autoplay Interval (only when Autoplay enabled)
- **Booking Calendar**: Fallback Form (only when no Calendar URL)
- **Guest Intro**: Key Talking Points list (only when checkbox enabled)
- **Guest Intro**: Guest Links (only when checkbox enabled)

### Default Values
Components with meaningful defaults:
- Most components have sensible default titles
- Stats defaults to 4 columns
- Topics defaults to 3 columns
- Testimonials autoplay enabled by default
- Social Links labels hidden by default

---

## 📁 File Location

Full documentation: `COMPONENT-CONTENT-FIELDS-REFERENCE.md`

This file contains:
- Complete field specifications
- Field types and placeholders
- Data key mappings
- Legacy compatibility notes
- Editor template integration details

---

## 🎯 Usage Notes

1. **All editors use 300ms debounce** on input changes
2. **Required fields** are marked with asterisk (*)
3. **Legacy compatibility** maintained for Biography component data keys
4. **Dark mode support** built into all editors
5. **Array filtering** removes empty entries before saving
6. **Help text** provided for complex fields

---

## 🔄 Component Updates

To add new fields to a component:
1. Update the `*Editor.vue` file
2. Add field to `localData.ref()`
3. Include in `updateComponent()` data object
4. Update this documentation
5. Test field persistence and retrieval
