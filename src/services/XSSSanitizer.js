/**
 * P0 FIX #9: XSS Sanitization Service
 * 
 * ROOT FIX: Proper data type detection and routing
 * Each sanitization method has a single responsibility
 * Data flows to the correct sanitizer based on its type
 * 
 * IMPORTANT: This module has side effects and must not be tree-shaken
 * 
 * @package GMKB
 * @version 2.0.0
 */

// Mark as side-effect to prevent tree-shaking
if (typeof window !== 'undefined') {
  window.__GMKB_XSS_SANITIZER_LOADED__ = true;
}

/**
 * Sanitize HTML string to prevent XSS
 * Removes dangerous tags and attributes while preserving safe content
 * 
 * @param {string} html - HTML string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html, options = {}) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const {
    allowedTags = [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
      'span', 'div', 'img'
    ],
    allowedAttributes = {
      'a': ['href', 'title', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      '*': ['class', 'id', 'style']
    },
    allowedStyles = [
      'color', 'background-color', 'font-size', 'font-weight',
      'text-align', 'padding', 'margin', 'border'
    ]
  } = options;

  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Process all elements
  const walker = document.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_ELEMENT,
    null
  );

  const nodesToRemove = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const tagName = node.tagName.toLowerCase();

    // Check if tag is allowed
    if (!allowedTags.includes(tagName)) {
      nodesToRemove.push(node);
      continue;
    }

    // Process attributes
    const attributes = Array.from(node.attributes);
    attributes.forEach(attr => {
      const attrName = attr.name.toLowerCase();
      
      // Check if attribute is allowed for this tag
      const tagAllowedAttrs = allowedAttributes[tagName] || [];
      const globalAllowedAttrs = allowedAttributes['*'] || [];
      const isAllowed = tagAllowedAttrs.includes(attrName) || 
                       globalAllowedAttrs.includes(attrName);

      if (!isAllowed) {
        node.removeAttribute(attr.name);
      } else {
        // Sanitize attribute values
        const sanitizedValue = sanitizeAttributeValue(attrName, attr.value, allowedStyles);
        if (sanitizedValue !== attr.value) {
          node.setAttribute(attr.name, sanitizedValue);
        }
      }
    });

    // Remove event handlers
    removeEventHandlers(node);
  }

  // Remove disallowed nodes
  nodesToRemove.forEach(node => {
    node.parentNode.removeChild(node);
  });

  return doc.body.innerHTML;
}

/**
 * Sanitize attribute value to prevent XSS
 * 
 * @param {string} attrName - Attribute name
 * @param {string} attrValue - Attribute value
 * @param {Array} allowedStyles - Allowed style properties
 * @returns {string} Sanitized value
 */
function sanitizeAttributeValue(attrName, attrValue, allowedStyles) {
  if (!attrValue) return '';

  // Sanitize href to prevent javascript: and data: URIs
  if (attrName === 'href') {
    const value = attrValue.trim().toLowerCase();
    if (value.startsWith('javascript:') || 
        value.startsWith('data:') || 
        value.startsWith('vbscript:')) {
      return '#';
    }
  }

  // Sanitize style attribute
  if (attrName === 'style') {
    return sanitizeStyleAttribute(attrValue, allowedStyles);
  }

  // Remove any script-like content from other attributes
  if (/<script|javascript:|onerror|onload/i.test(attrValue)) {
    return '';
  }

  return attrValue;
}

/**
 * Sanitize style attribute
 * 
 * @param {string} styleString - Style attribute value
 * @param {Array} allowedStyles - Allowed style properties
 * @returns {string} Sanitized style
 */
function sanitizeStyleAttribute(styleString, allowedStyles) {
  if (!styleString) return '';

  const styles = styleString.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const sanitizedStyles = styles
    .map(style => {
      const [property, value] = style.split(':').map(s => s.trim());
      
      // Check if property is allowed
      if (!allowedStyles.includes(property.toLowerCase())) {
        return null;
      }

      // Block dangerous values
      if (/javascript:|expression\(|import|@import/i.test(value)) {
        return null;
      }

      return `${property}: ${value}`;
    })
    .filter(Boolean);

  return sanitizedStyles.join('; ');
}

/**
 * Remove event handler attributes from element
 * 
 * @param {Element} element - DOM element
 */
function removeEventHandlers(element) {
  const eventAttrs = Array.from(element.attributes)
    .filter(attr => attr.name.toLowerCase().startsWith('on'));

  eventAttrs.forEach(attr => {
    element.removeAttribute(attr.name);
  });
}

/**
 * Sanitize plain text (escape HTML)
 * This function ONLY handles plain text that should never contain HTML
 * URLs should NEVER come here - they go to sanitizeURL
 * 
 * @param {string} text - Text to sanitize
 * @returns {string} Escaped text
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // This function's single responsibility is HTML escaping
  // It should NOT check for URLs - that's a caller's responsibility
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize URL to prevent XSS
 * ROOT FIX: Properly validates URLs without breaking them
 * 
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL or empty string if dangerous
 */
export function sanitizeURL(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  // Block dangerous protocols (check lowercase but preserve original case)
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:'
  ];

  const lowerCheck = trimmed.toLowerCase();
  if (dangerousProtocols.some(proto => lowerCheck.startsWith(proto))) {
    console.warn('Blocked dangerous URL:', url);
    return '';
  }

  // Allow safe protocols and relative URLs
  const safePatterns = [
    /^https?:\/\//i,     // http:// or https://
    /^mailto:/i,         // mailto:
    /^tel:/i,            // tel:
    /^\/[^\/]/,          // Relative URL starting with single /
    /^#/,                // Hash anchor
    /^[^:]+$/            // No protocol (relative path)
  ];

  if (!safePatterns.some(pattern => pattern.test(trimmed))) {
    console.warn('Blocked non-standard URL:', url);
    return '';
  }

  // Return original URL with case preserved
  return url;
}

/**
 * ROOT FIX: Detect data type and route to correct sanitizer
 * This is the key architectural fix - proper type detection
 * 
 * @param {*} value - Value to detect type for
 * @param {string} fieldName - Field name for context
 * @returns {string} Detected type: 'url', 'html', 'text', or 'unknown'
 */
export function detectDataType(value, fieldName = '') {
  if (!value || typeof value !== 'string') {
    return 'unknown';
  }
  
  const fieldLower = fieldName.toLowerCase();
  
  // CRITICAL FIX: Comprehensive field type mapping (single source of truth)
  const fieldTypeMap = {
    // URL fields - EXPANDED LIST
    url: 'url',
    href: 'url',
    src: 'url',
    link: 'url',
    image: 'url',
    photo: 'url',
    guid: 'url',
    avatar: 'url',
    thumbnail: 'url',
    website: 'url',
    website_url: 'url',
    '1_website': 'url',
    '2_website': 'url',
    social: 'url',
    twitter: 'url',
    facebook: 'url',
    linkedin: 'url',
    instagram: 'url',
    youtube: 'url',
    '1_twitter': 'url',
    '1_facebook': 'url',
    '1_linkedin': 'url',
    '1_instagram': 'url',
    guest_youtube: 'url',
    podcast_url: 'url',
    download_url: 'url',
    media_url: 'url',
    video_url: 'url',
    audio_url: 'url',
    headshot: 'url',
    logo: 'url',
    company_logo: 'url',
    personal_brand_logo: 'url',
    profile_photo: 'url',
    video_intro: 'url',
    
    // HTML fields
    content: 'html',
    description: 'html',
    bio: 'html',
    biography: 'html',
    biography_long: 'html',
    body: 'html',
    excerpt: 'html',
    summary: 'html',
    introduction: 'html',
    
    // Text fields
    title: 'text',
    name: 'text',
    label: 'text',
    email: 'text',
    phone: 'text',
    caption: 'text',
    alt: 'text',
    first_name: 'text',
    last_name: 'text',
    company: 'text',
    position: 'text',
    professional_title: 'text',
    address: 'text',
    location: 'text',
    skype: 'text'
  };
  
  // Check explicit field mapping first
  // CRITICAL: Check exact match first, then partial match
  if (fieldTypeMap[fieldLower]) {
    return fieldTypeMap[fieldLower];
  }
  
  // Check partial matches (for compound field names)
  for (const [key, type] of Object.entries(fieldTypeMap)) {
    if (fieldLower.includes(key)) {
      return type;
    }
  }
  
  // Heuristic detection based on content
  if (/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(value.trim())) {
    return 'url';
  }
  
  if (/<[a-z][\s\S]*>/i.test(value)) {
    return 'html';
  }
  
  // Default to text for safety
  return 'text';
}

/**
 * ROOT FIX: Main sanitization entry point with proper type routing
 * This ensures data goes through the correct sanitization pipeline
 * 
 * @param {*} value - Value to sanitize
 * @param {string} fieldName - Field name for type detection
 * @param {string} forceType - Force a specific type (optional)
 * @returns {*} Sanitized value
 */
export function sanitizeValue(value, fieldName = '', forceType = null) {
  if (value === null || value === undefined) {
    return value;
  }
  
  if (typeof value !== 'string') {
    return value; // Non-string values pass through
  }
  
  // Determine the type
  const type = forceType || detectDataType(value, fieldName);
  
  // Route to appropriate sanitizer
  switch (type) {
    case 'url':
      return sanitizeURL(value);
    case 'html':
      return sanitizeHTML(value);
    case 'text':
      return sanitizeText(value);
    default:
      // Unknown type - default to text sanitization for safety
      return sanitizeText(value);
  }
}

/**
 * Sanitize component data before rendering
 * ROOT FIX: Uses proper type detection for each field
 * 
 * @param {Object} componentData - Component data object
 * @param {Object} options - Sanitization options
 * @returns {Object} Sanitized component data
 */
export function sanitizeComponentData(componentData, options = {}) {
  if (!componentData || typeof componentData !== 'object') {
    return componentData;
  }

  const sanitized = Array.isArray(componentData) ? [] : {};

  Object.entries(componentData).forEach(([key, value]) => {
    // Handle nested objects recursively
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Special handling for known object structures
      if (key === 'photo' || key === 'image') {
        // Photo/image objects have specific field types
        sanitized[key] = {
          ...value,
          url: sanitizeValue(value.url, 'url'),
          src: sanitizeValue(value.src, 'src'),
          guid: sanitizeValue(value.guid, 'guid'),
          caption: sanitizeValue(value.caption, 'caption'),
          alt: sanitizeValue(value.alt, 'alt'),
          title: sanitizeValue(value.title, 'title')
        };
      } else {
        // Recursive sanitization for other objects
        sanitized[key] = sanitizeComponentData(value, options);
      }
    } else if (Array.isArray(value)) {
      // Handle arrays
      sanitized[key] = value.map(item => 
        typeof item === 'object' ? sanitizeComponentData(item, options) : sanitizeValue(item, key)
      );
    } else if (typeof value === 'string') {
      // ROOT FIX: Use proper type detection for string values
      sanitized[key] = sanitizeValue(value, key);
    } else {
      // Non-string primitives pass through
      sanitized[key] = value;
    }
  });

  return sanitized;
}

/**
 * Sanitize entire state before rendering
 * Use this when loading state from untrusted sources
 * 
 * @param {Object} state - Application state
 * @returns {Object} Sanitized state
 */
export function sanitizeState(state) {
  if (!state || typeof state !== 'object') {
    return state;
  }

  const sanitized = { ...state };

  // Sanitize components
  if (sanitized.components && typeof sanitized.components === 'object') {
    sanitized.components = Object.entries(sanitized.components).reduce((acc, [id, component]) => {
      acc[id] = {
        ...component,
        data: sanitizeComponentData(component.data || {}),
        props: sanitizeComponentData(component.props || {})
      };
      return acc;
    }, {});
  }

  // Sanitize global settings (if contains user input)
  if (sanitized.globalSettings && typeof sanitized.globalSettings === 'object') {
    sanitized.globalSettings = sanitizeComponentData(sanitized.globalSettings);
  }

  return sanitized;
}

/**
 * Check if string contains potential XSS
 * Use for validation before sanitization
 * 
 * @param {string} str - String to check
 * @returns {boolean} True if contains potential XSS
 */
export function containsXSS(str) {
  if (!str || typeof str !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /vbscript:/i,
    /data:text\/html/i
  ];

  return xssPatterns.some(pattern => pattern.test(str));
}

/**
 * Strip all HTML tags from string
 * Most aggressive sanitization - use when HTML is never needed
 * 
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export function stripHTML(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// Export all functions
export default {
  sanitizeHTML,
  sanitizeText,
  sanitizeURL,
  sanitizeComponentData,
  sanitizeState,
  containsXSS,
  stripHTML,
  detectDataType,
  sanitizeValue
};
