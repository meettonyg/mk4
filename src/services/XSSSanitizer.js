/**
 * P0 FIX #9: XSS Sanitization Service
 * 
 * Sanitizes user input to prevent XSS (Cross-Site Scripting) attacks
 * Critical for components that display user-generated content
 * 
 * @package GMKB
 * @version 1.0.0
 */

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
 * Use this for text that should not contain any HTML
 * 
 * @param {string} text - Text to sanitize
 * @returns {string} Escaped text
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize URL to prevent XSS
 * 
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL or empty string if dangerous
 */
export function sanitizeURL(url) {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:'
  ];

  if (dangerousProtocols.some(proto => trimmed.startsWith(proto))) {
    console.warn('Blocked dangerous URL:', url);
    return '';
  }

  // Allow only http, https, mailto, and relative URLs
  if (!trimmed.startsWith('http://') && 
      !trimmed.startsWith('https://') && 
      !trimmed.startsWith('mailto:') &&
      !trimmed.startsWith('/') &&
      !trimmed.startsWith('#')) {
    console.warn('Blocked non-standard URL:', url);
    return '';
  }

  return url;
}

/**
 * Sanitize component data before rendering
 * Recursively sanitizes all string values in component data
 * 
 * @param {Object} componentData - Component data object
 * @param {Object} options - Sanitization options
 * @returns {Object} Sanitized component data
 */
export function sanitizeComponentData(componentData, options = {}) {
  if (!componentData || typeof componentData !== 'object') {
    return componentData;
  }

  const {
    htmlFields = ['content', 'description', 'bio', 'text', 'body'],
    urlFields = ['url', 'link', 'href', 'src', 'image'],
    textFields = ['title', 'name', 'label', 'email', 'phone']
  } = options;

  const sanitized = Array.isArray(componentData) ? [] : {};

  Object.entries(componentData).forEach(([key, value]) => {
    const keyLower = key.toLowerCase();

    // Recursively sanitize objects and arrays
    if (value && typeof value === 'object') {
      sanitized[key] = sanitizeComponentData(value, options);
      return;
    }

    // Skip non-string values
    if (typeof value !== 'string') {
      sanitized[key] = value;
      return;
    }

    // Sanitize based on field type
    if (htmlFields.some(field => keyLower.includes(field))) {
      sanitized[key] = sanitizeHTML(value);
    } else if (urlFields.some(field => keyLower.includes(field))) {
      sanitized[key] = sanitizeURL(value);
    } else if (textFields.some(field => keyLower.includes(field))) {
      sanitized[key] = sanitizeText(value);
    } else {
      // Default: treat as plain text
      sanitized[key] = sanitizeText(value);
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
  stripHTML
};
