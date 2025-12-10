# Component Content Fields Reference

**Last Updated:** October 14, 2025  
**Purpose:** Comprehensive listing of all editable fields within the Content tab for each component

---

## Biography Component ✨ REFACTORED

**Purpose:** Tell your professional story - identity and narrative focus
**Total Fields:** 4 (simplified from 8)

**Note:** Profile images and social links removed - use dedicated components instead.

### Personal Information Section
- **Full Name** (text)
  - Field ID: `bio-name`
  - Data Key: `name`, `fullName`
  - Placeholder: "Enter full name..."

- **Title / Role** (text)
  - Field ID: `bio-title`
  - Data Key: `title`, `role`
  - Placeholder: "e.g., CEO, Author, Speaker..."

- **Location** (text)
  - Field ID: `bio-location`
  - Data Key: `location`
  - Placeholder: "City, Country"

### Biography Text Section
- **Biography** (textarea, 8 rows)
  - Field ID: `bio-text`
  - Data Keys: `biography`, `bio`, `content`
  - Placeholder: "Enter biography text..."

### Removed Sections (Use Dedicated Components)
- ~~Profile Image~~ → Use separate image component
- ~~Social Links~~ → Use Social Links Component

---

## Hero Component

### Hero Content Section
- **Title** (text)
  - Field ID: `hero-title`
  - Data Key: `title`
  - Placeholder: "Enter headline..."

- **Subtitle** (textarea, 3 rows)
  - Field ID: `hero-subtitle`
  - Data Key: `subtitle`
  - Placeholder: "Enter subheading..."

### Call to Action Section
- **Button Text** (text)
  - Field ID: `hero-cta-text`
  - Data Key: `ctaText`
  - Placeholder: "Get in Touch"

- **Button URL** (url)
  - Field ID: `hero-cta-url`
  - Data Key: `ctaUrl`
  - Placeholder: "#contact"

### Background Image Section
- **Background Image URL** (url)
  - Field ID: `hero-bg-image`
  - Data Key: `backgroundImage`
  - Placeholder: "https://example.com/background.jpg"
  - **Media Library Button:** "Choose from Media Library"
  - **Image Preview:** Shows when URL is present

### Layout Section
- **Content Alignment** (select)
  - Field ID: `hero-alignment`
  - Data Key: `alignment`
  - Options: Left, Center, Right
  - Default: Center

---

## Stats Component

### Section Settings Section
- **Section Title** (text)
  - Field ID: `stats-title`
  - Data Key: `title`
  - Placeholder: "e.g., By The Numbers"
  - Default: "By The Numbers"

- **Description** (textarea, 3 rows)
  - Field ID: `stats-description`
  - Data Key: `description`
  - Placeholder: "Optional description text..."

### Statistics Section
**Repeatable Items** (Array: `stats`)

Each stat item contains:
- **Value** (text)
  - Data Key: `stats[n].value`
  - Placeholder: "e.g., 10,000+"

- **Label** (text)
  - Data Key: `stats[n].label`
  - Placeholder: "e.g., Happy Customers"

- **Prefix** (text)
  - Data Key: `stats[n].prefix`
  - Placeholder: "$ or #"

- **Suffix** (text)
  - Data Key: `stats[n].suffix`
  - Placeholder: "% or +"

- **Icon (Emoji)** (text)
  - Data Key: `stats[n].icon`
  - Placeholder: "📊 or 🎯"

**Actions:**
- **Add Statistic Button:** "+ Add Statistic"
- **Remove Button:** × (per stat item)

### Display Options Section
- **Columns** (select)
  - Field ID: `columns`
  - Data Key: `columns`
  - Options: 2, 3, 4 Columns
  - Default: 4

- **Display Style** (select)
  - Field ID: `style`
  - Data Key: `style`
  - Options: Default, Cards, Minimal, Bold
  - Default: Default

- **Show Icons** (checkbox)
  - Data Key: `showIcons`
  - Default: true

---

## Topics Component

### Section Settings Section
- **Section Title** (text)
  - Field ID: `topics-title`
  - Data Key: `title`
  - Placeholder: "e.g., Areas of Expertise"
  - Default: "Areas of Expertise"

- **Description** (textarea, 3 rows)
  - Field ID: `topics-description`
  - Data Key: `description`
  - Placeholder: "Optional description text..."

### Topics List Section
**Repeatable Items** (Array: `topics`)

Each topic is a simple text input:
- **Topic Text** (text)
  - Data Key: `topics[n]`
  - Placeholder: "Enter topic..."
  - CSS Class: `topic-input`

**Actions:**
- **Add Topic Button:** "+ Add Topic"
- **Remove Button:** × (per topic)

### Display Options Section
- **Columns (Desktop)** (select)
  - Field ID: `columns`
  - Data Key: `columns`
  - Options: 2, 3, 4 Columns
  - Default: 3

- **Show Icons** (checkbox)
  - Data Key: `showIcons`
  - Default: false

---

## Contact Component

### Section Content Section
- **Section Title** (text)
  - Field ID: `contact-title`
  - Data Key: `title`
  - Placeholder: "e.g., Get in Touch"
  - Default: "Get in Touch"

- **Description** (textarea, 3 rows)
  - Field ID: `contact-description`
  - Data Key: `description`
  - Placeholder: "Brief introduction text..."

### Contact Information Section
- **Email** (email)
  - Field ID: `contact-email`
  - Data Key: `email`
  - Placeholder: "contact@example.com"

- **Phone** (tel)
  - Field ID: `contact-phone`
  - Data Key: `phone`
  - Placeholder: "+1 (555) 123-4567"

- **Website** (url)
  - Field ID: `contact-website`
  - Data Key: `website`
  - Placeholder: "https://example.com"

- **Address** (textarea, 2 rows)
  - Field ID: `contact-address`
  - Data Key: `address`
  - Placeholder: "123 Main St, City, State 12345"

### Social Media Links Section
- **LinkedIn** (url)
  - Field ID: `contact-linkedin`
  - Data Key: `linkedin`
  - Placeholder: "https://linkedin.com/in/username"

- **Twitter/X** (url)
  - Field ID: `contact-twitter`
  - Data Key: `twitter`
  - Placeholder: "https://twitter.com/username"

- **Instagram** (url)
  - Field ID: `contact-instagram`
  - Data Key: `instagram`
  - Placeholder: "https://instagram.com/username"

- **Facebook** (url)
  - Field ID: `contact-facebook`
  - Data Key: `facebook`
  - Placeholder: "https://facebook.com/username"

---

## Testimonials Component

### Section Settings Section
- **Section Title** (text)
  - Field ID: `testimonials-title`
  - Data Key: `title`
  - Placeholder: "e.g., What People Say"
  - Default: "What People Say"

- **Description** (textarea, 2 rows)
  - Field ID: `testimonials-description`
  - Data Key: `description`
  - Placeholder: "Optional description..."

### Testimonials Section
**Repeatable Items** (Array: `testimonials`)

Each testimonial contains:
- **Quote*** (textarea, 3 rows)
  - Data Key: `testimonials[n].text`
  - Placeholder: "Testimonial text..."
  - Required field

- **Author Name*** (text)
  - Data Key: `testimonials[n].author`
  - Placeholder: "John Doe"
  - Required field

- **Author Title** (text)
  - Data Key: `testimonials[n].title`
  - Placeholder: "CEO, Company Name"

- **Author Image URL** (url)
  - Data Key: `testimonials[n].image`
  - Placeholder: "https://example.com/photo.jpg"

**Actions:**
- **Add Testimonial Button:** "+ Add Testimonial"
- **Remove Button:** × (per testimonial)

### Carousel Options Section
- **Auto-play Carousel** (checkbox)
  - Data Key: `autoplay`
  - Default: true

- **Auto-play Interval (ms)** (number)
  - Field ID: `autoplay-interval`
  - Data Key: `autoplayInterval`
  - Min: 2000
  - Step: 1000
  - Placeholder: "5000"
  - Default: 5000
  - Only visible when autoplay is enabled

---

## Social Links Component

### Section Settings Section
- **Section Title** (text)
  - Field ID: `social-title`
  - Data Key: `title`
  - Placeholder: "e.g., Connect With Me"
  - Default: "Connect With Me"

- **Description** (textarea, 2 rows)
  - Field ID: `social-description`
  - Data Key: `description`
  - Placeholder: "Optional description..."

### Social Networks Section
Each network includes an icon and placeholder:

- **Facebook** (url)
  - Icon: 👤
  - Data Key: `facebook`
  - Placeholder: "https://facebook.com/username"

- **Twitter/X** (url)
  - Icon: 🐦
  - Data Key: `twitter`
  - Placeholder: "https://twitter.com/username"

- **LinkedIn** (url)
  - Icon: 💼
  - Data Key: `linkedin`
  - Placeholder: "https://linkedin.com/in/username"

- **Instagram** (url)
  - Icon: 📷
  - Data Key: `instagram`
  - Placeholder: "https://instagram.com/username"

- **YouTube** (url)
  - Icon: 📺
  - Data Key: `youtube`
  - Placeholder: "https://youtube.com/@channel"

- **TikTok** (url)
  - Icon: 🎵
  - Data Key: `tiktok`
  - Placeholder: "https://tiktok.com/@username"

- **GitHub** (url)
  - Icon: 💻
  - Data Key: `github`
  - Placeholder: "https://github.com/username"

- **Pinterest** (url)
  - Icon: 📌
  - Data Key: `pinterest`
  - Placeholder: "https://pinterest.com/username"

### Display Options Section
- **Show Network Names** (checkbox)
  - Data Key: `showLabels`
  - Default: false

---

## Photo Gallery Component

### Section Settings Section
- **Title** (text)
  - Data Key: `title`
  - Placeholder: "Photo Gallery"
  - Default: "Photo Gallery"

- **Description** (textarea, 2 rows)
  - Data Key: `description`

### Photos Section
**Repeatable Items** (Array: `photos`, max 12)

Each photo contains:
- **Image URL*** (url)
  - Data Key: `photos[n].url`
  - Required field

- **Caption** (text)
  - Data Key: `photos[n].caption`

**Actions:**
- **Add Photo Button:** "+ Add Photo" (only shown if < 12 photos)
- **Remove Button:** × (per photo)

### Display Options Section
- **Columns** (select)
  - Data Key: `columns`
  - Options: 2, 3, 4 Columns
  - Default: 3

---

## Field Type Reference

### Common Field Types Used:
- **text** - Single line text input
- **textarea** - Multi-line text input (with row specification)
- **url** - URL input with validation
- **email** - Email input with validation
- **tel** - Telephone input
- **number** - Numeric input (with min, max, step options)
- **select** - Dropdown selection
- **checkbox** - Boolean toggle

### Common Patterns:
- **Media Library Integration**: Available for image fields in Biography and Hero components
- **Image Preview**: Shown when URL is present for image fields
- **Repeatable Items**: Stats, Topics, Testimonials, and Photos use array-based repeatable fields
- **Required Fields**: Marked with * (e.g., testimonial quote and author)
- **Default Values**: Most section titles have sensible defaults
- **Debounced Updates**: All fields use 300ms debounce on input

---

## Data Key Mapping

### Legacy Compatibility
Some components maintain multiple data keys for backward compatibility:

**Biography Component:**
- `name` ↔ `fullName`
- `title` ↔ `role`
- `biography` ↔ `bio` ↔ `content`

**Note:** Legacy fields for `imageUrl`, `profileImage`, and social links (`linkedin`, `twitter`, `website`) are no longer editable but remain for backward compatibility.

These dual mappings ensure data integrity when migrating from older formats.

---

## Booking Calendar Component

### Section Settings Section
- **Title** (text)
  - Data Key: `title`
  - Placeholder: "Book a Meeting"
  - Default: "Book a Meeting"

- **Description** (textarea, 2 rows)
  - Data Key: `description`

### Calendar Integration Section
- **Calendar Service** (select)
  - Data Key: `calendar_service`
  - Options: None (Use Form), Calendly, Google Calendar
  - Default: "" (None)

- **Calendar URL** (url)
  - Data Keys: `calendar_url`, `calendly_url`
  - Placeholder: "https://calendly.com/username"
  - Help Text: "Your Calendly or Google Calendar booking link"

### Fallback Form Settings Section
**Only visible when no calendar URL is provided**

- **Available Times (one per line)** (textarea, 4 rows)
  - Data Key: `available_times` (array)
  - Placeholder: "9:00 AM\n10:00 AM\n2:00 PM"
  - Converted from newline-separated text to array

---

## Call to Action Component

### Headlines Section
- **Title** (text)
  - Field ID: `cta-title`
  - Data Key: `title`
  - Placeholder: "e.g., Ready to Get Started?"
  - Default: "Ready to Take Action?"

- **Description** (textarea, 3 rows)
  - Field ID: `cta-description`
  - Data Key: `description`
  - Placeholder: "Supporting text for your call to action..."

### Buttons Section
**Primary Button:**
- **Button Text** (text)
  - Data Key: `button_text`
  - Placeholder: "Button text"

- **Button URL** (url)
  - Data Key: `button_url`
  - Placeholder: "https://"

**Secondary Button (Optional):**
- **Button Text** (text)
  - Data Key: `secondary_button_text`
  - Placeholder: "Button text"

- **Button URL** (url)
  - Data Key: `secondary_button_url`
  - Placeholder: "https://"

### Background Section
- **Background Color** (color + text)
  - Field ID: `background-color`
  - Data Key: `background_color`
  - Default: "#3b82f6"
  - Two-part input: color swatch (48px) + text input

- **Background Image URL** (url)
  - Field ID: `background-image`
  - Data Key: `background_image`
  - Placeholder: "https://example.com/image.jpg"

---

## Guest Intro Component

### Guest Information Section
- **Guest Name** (text)
  - Field ID: `guest-name`
  - Data Key: `name`
  - Placeholder: "Full name of the guest"

- **Title / Position** (text)
  - Field ID: `guest-title`
  - Data Key: `title`
  - Placeholder: "e.g., CEO of Company, Author, Speaker"

- **Company/Organization** (text)
  - Field ID: `company`
  - Data Key: `company`
  - Placeholder: "Company or organization name"

### Profile Image Section
- **Profile Image URL** (text)
  - Field ID: `profile-image`
  - Data Key: `imageUrl`
  - Placeholder: "Profile image URL"
  - **Media Library Button:** "Choose from Media Library"

- **Image Position** (select)
  - Field ID: `image-position`
  - Data Key: `imagePosition`
  - Options: Left, Right, Top
  - Default: Left

### Introduction Text Section
- **Introduction** (textarea, 6 rows)
  - Field ID: `intro-text`
  - Data Key: `introduction`
  - Placeholder: "Brief introduction about the guest..."

### Key Talking Points Section
- **Show Key Talking Points** (checkbox)
  - Data Key: `showKeyPoints`
  - Default: true

**Repeatable Items** (Array: `keyPoints`, only visible when checkbox enabled)

Each point is a simple text input:
- **Key Point Text** (text)
  - Data Key: `keyPoints[n]`
  - Placeholder: "Key discussion point..."
  - CSS Class: `point-input`

**Actions:**
- **Add Talking Point Button:** "+ Add Talking Point"
- **Remove Button:** × (per point)

### Guest Links Section
- **Show Guest Links** (checkbox)
  - Data Key: `showLinks`
  - Default: true

**Only visible when checkbox enabled:**

- **Website URL** (text)
  - Field ID: `website-url`
  - Data Key: `websiteUrl`
  - Placeholder: "Personal/Company website"

- **LinkedIn URL** (text)
  - Field ID: `linkedin-url`
  - Data Key: `linkedinUrl`
  - Placeholder: "LinkedIn profile"

- **Book/Product URL** (text)
  - Field ID: `book-url`
  - Data Key: `bookUrl`
  - Placeholder: "Book/Product link"

### Display Options Section
- **Layout Style** (select)
  - Field ID: `layout`
  - Data Key: `layout`
  - Options: Side by Side, Centered, Card Style, Minimal
  - Default: "side-by-side"

---

## Logo Grid Component

### Section Settings Section
- **Section Title** (text)
  - Field ID: `logo-title`
  - Data Key: `title`
  - Placeholder: "e.g., Featured In"
  - Default: "Featured In"

- **Description** (textarea, 2 rows)
  - Field ID: `logo-description`
  - Data Key: `description`
  - Placeholder: "Optional description..."

### Logos Section
**Repeatable Items** (Array: `logos`, max 12)

Each logo contains:
- **Image URL*** (url)
  - Data Key: `logos[n].url`
  - Placeholder: "https://example.com/logo.png"
  - Required field

- **Logo Name** (text)
  - Data Key: `logos[n].name`
  - Placeholder: "Company name"

- **Link URL (Optional)** (url)
  - Data Key: `logos[n].link`
  - Placeholder: "https://company.com"

**Actions:**
- **Add Logo Button:** "+ Add Logo" (only shown if < 12 logos)
- **Remove Button:** × (per logo)

### Display Options Section
- **Grid Columns** (select)
  - Field ID: `columns`
  - Data Key: `columns`
  - Options: Auto (Responsive), 3 Columns, 4 Columns, 6 Columns
  - Default: "auto"

---

## Podcast Player Component

### Section Settings Section
- **Title** (text)
  - Data Key: `title`
  - Placeholder: "Podcast Episodes"
  - Default: "Podcast Episodes"

- **Description** (textarea, 2 rows)
  - Data Key: `description`

### Episodes Section
**Repeatable Items** (Array: `episodes`, max 5)

Each episode contains:
- **Title*** (text)
  - Data Key: `episodes[n].title`
  - Required field

- **Description** (textarea, 2 rows)
  - Data Key: `episodes[n].description`

- **Audio URL** (url)
  - Data Key: `episodes[n].audio_url`
  - Placeholder: "https://example.com/episode.mp3"

- **Spotify URL** (url)
  - Data Key: `episodes[n].spotify_url`

- **Apple Podcasts URL** (url)
  - Data Key: `episodes[n].apple_url`

- **Duration** (text)
  - Data Key: `episodes[n].duration`
  - Placeholder: "45:30"

**Actions:**
- **Add Episode Button:** "+ Add Episode" (only shown if < 5 episodes)
- **Remove Button:** × (per episode)

---

## Questions Component

### Section Settings Section
- **Section Title** (text)
  - Field ID: `questions-title`
  - Data Key: `title`
  - Placeholder: "e.g., Frequently Asked Questions"
  - Default: "Frequently Asked Questions"

- **Description** (textarea, 2 rows)
  - Field ID: `questions-description`
  - Data Key: `description`
  - Placeholder: "Optional description..."

### Questions & Answers Section
**Repeatable Items** (Array: `questions`)

Each Q&A pair contains:
- **Question*** (text)
  - Data Key: `questions[n].question`
  - Placeholder: "Your question here..."
  - Required field

- **Answer*** (textarea, 3 rows)
  - Data Key: `questions[n].answer`
  - Placeholder: "Your answer here..."
  - Required field

**Actions:**
- **Add Question Button:** "+ Add Question"
- **Remove Button:** × (per question)
- **Item Header:** Shows as "Q1", "Q2", etc.

---

## Topics & Questions Component

### Display Mode Section
- **Default View** (select)
  - Data Key: `displayMode`
  - Options: Topics Only, Questions Only, Topics & Questions
  - Default: "combined"

- **Show Mode Selector** (checkbox)
  - Data Key: `showModeSelector`
  - Default: true

### Topics Section
- **Topics Title** (text)
  - Data Key: `topicsTitle`
  - Placeholder: "Topics of Expertise"
  - Default: "Topics of Expertise"

- **Topic 1-5** (text, 5 fields)
  - Data Keys: `topic_1` through `topic_5`
  - Each field labeled "Topic 1", "Topic 2", etc.

### Questions Section
- **Questions Title** (text)
  - Data Key: `questionsTitle`
  - Placeholder: "Interview Questions"
  - Default: "Interview Questions"

- **Question 1-10** (text, 10 fields)
  - Data Keys: `question_1` through `question_10`
  - Each field labeled "Question 1", "Question 2", etc.

---

## Video Intro Component

### Section Settings Section
- **Title** (text)
  - Data Key: `title`
  - Placeholder: "e.g., Watch My Introduction"
  - Default: "Watch My Introduction"

- **Description** (textarea, 2 rows)
  - Data Key: `description`
  - Placeholder: "Optional..."

### Video URL Section
**Help Text:** "Supports YouTube, Vimeo, or direct video URLs"

- **Video URL*** (url)
  - Data Keys: `video_url`, `url`
  - Placeholder: "https://youtube.com/watch?v=..."
  - Required field

- **Thumbnail URL (Optional)** (url)
  - Data Keys: `thumbnail`, `poster`
  - Placeholder: "https://example.com/thumb.jpg"

---

## Component Editor Template Integration

Most components use the `ComponentEditorTemplate` wrapper which provides:
- Consistent tabbed interface (Content, Design, Typography)
- Close/Back button handling
- Dark mode support
- Responsive layout

The content fields documented above appear within the `#content` template slot of each editor.

**Note:** The Guest Intro component uses a custom editor structure with its own tab implementation, but follows similar patterns.
