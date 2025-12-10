# Hero Component - Assessment

**Date:** October 14, 2025  
**Status:** ⚠️ NEEDS DISCUSSION

---

## Current Fields

### Section 1: Hero Content
1. **Title** - Main headline
2. **Subtitle** - Supporting text

### Section 2: Call to Action
3. **Button Text** - CTA button label
4. **Button URL** - CTA destination

### Section 3: Background Image
5. **Background Image URL** - Hero background
6. **Media Library Button** - Image selector

### Section 4: Layout
7. **Content Alignment** - Left/Center/Right

**Total Fields:** 6 (plus media library integration)

---

## Analysis

### 🤔 **Key Question: Should Hero have CTA buttons?**

**We already have a Call-to-Action component:**
- Primary button
- Secondary button (optional)
- Background color
- Background image

**Hero component also has:**
- Button text
- Button URL

**This creates duplication in button/CTA functionality.**

### 🤔 **Key Question: Should Hero have background images?**

**Multiple components have background images:**
- Hero (has media library integration)
- Call-to-Action (has background image field)
- Potentially others

**This creates duplication in image management.**

---

## Options to Consider

### **Option 1: Keep Hero As-Is** ✅
**Reasoning:** Hero is a special "landing page" component that traditionally includes:
- Title + Subtitle (unique to hero)
- CTA button (standard hero feature)
- Background image (standard hero feature)
- Alignment (layout control)

**Pros:**
- Matches user expectations for "hero sections"
- All-in-one landing page component
- Common web design pattern

**Cons:**
- Duplicates CTA functionality
- Duplicates image management

---

### **Option 2: Remove CTA from Hero**
**Make hero just headline + background**

**REMOVE:**
- Button Text
- Button URL

**KEEP:**
- Title
- Subtitle
- Background Image
- Alignment

**User would:** Add separate CTA component below Hero

**Pros:**
- No CTA duplication
- Single purpose components

**Cons:**
- Breaks traditional hero pattern
- More components to manage
- Less convenient

---

### **Option 3: Remove Background Image from Hero**
**Make hero just headline + CTA**

**REMOVE:**
- Background Image URL
- Media Library Button

**KEEP:**
- Title
- Subtitle
- Button Text
- Button URL
- Alignment

**User would:** Use Design tab or separate image component

**Pros:**
- No image duplication
- Simpler content management

**Cons:**
- Hero without background is less impactful
- Background is a core hero feature

---

### **Option 4: Simplify to Title + Subtitle Only**
**Ultra-minimal hero**

**REMOVE:**
- Button Text
- Button URL  
- Background Image
- Media Library

**KEEP:**
- Title
- Subtitle
- Alignment

**User would:** Add CTA and image components separately

**Pros:**
- Zero duplication
- Maximum composability

**Cons:**
- Loses "hero" identity
- Becomes just a "heading" component

---

## My Recommendation

### **Option 1: Keep Hero As-Is** ⭐

**Reasoning:**

1. **Hero is a distinct pattern** - A hero section IS traditionally title + background + CTA. It's not just component duplication, it's a recognized web design pattern.

2. **Different context** - Hero CTA is part of the hero narrative, while Call-to-Action component is a standalone conversion element.

3. **User expectations** - When users add a "Hero," they expect it to be complete, not requiring 3 separate components.

4. **Background is essential** - A hero without a background image loses its visual impact. This isn't duplication, it's core functionality.

5. **Convenience matters** - Having an all-in-one hero component is valuable, even if it means some field overlap.

---

## Comparison

### Hero Component:
- **Purpose:** Landing page section (first thing visitors see)
- **Context:** Introduction/welcome
- **CTA:** Integrated into hero narrative
- **Image:** Background (large, impactful)

### Call-to-Action Component:
- **Purpose:** Conversion point (anywhere on page)
- **Context:** Standalone persuasion
- **CTA:** Primary + optional secondary buttons
- **Image:** Optional background

**These serve different purposes despite field overlap.**

---

## Verdict

**NO CHANGES NEEDED** ✅

Hero component should remain as-is because:
- It's a recognized web design pattern
- Field overlap is intentional (different contexts)
- User convenience outweighs strict separation
- Background + CTA are core to hero identity

---

**Status:** APPROVED AS-IS  
**Next:** Assess Logo Grid Component
