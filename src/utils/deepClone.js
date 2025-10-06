/**
 * Deep Clone Utility
 * 
 * Provides robust deep cloning that handles edge cases better than JSON.parse(JSON.stringify())
 * - Handles Date objects
 * - Handles Arrays properly
 * - Handles nested objects
 * - More performant for deeply nested structures
 * 
 * @package GMKB
 * @version 1.0.0
 */

/**
 * Deep clone an object, handling edge cases
 * 
 * @param {*} obj - Object to clone
 * @returns {*} Deep cloned object
 */
export function deepClone(obj) {
  // Handle primitives and null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  
  // Handle Arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  // Handle Objects
  const clonedObj = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }
  
  return clonedObj;
}

/**
 * Generate a collision-resistant unique ID
 * Uses crypto.randomUUID() if available, falls back to strong alternative
 * 
 * @param {string} prefix - Optional prefix for the ID
 * @returns {string} Unique ID
 */
let idCounter = 0;

export function generateUniqueId(prefix = 'id') {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback: Combine timestamp, random, and counter for collision resistance
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 11);
  const counter = (++idCounter).toString(36);
  
  return `${prefix}_${timestamp}_${randomPart}_${counter}`;
}

/**
 * Compare two objects for deep equality
 * More efficient than JSON.stringify comparison
 * 
 * @param {*} obj1 - First object
 * @param {*} obj2 - Second object
 * @returns {boolean} True if objects are deeply equal
 */
export function deepEqual(obj1, obj2) {
  // Handle primitives and null
  if (obj1 === obj2) return true;
  
  if (obj1 === null || obj2 === null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  // Handle Arrays
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
  
  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false;
    return obj1.every((item, index) => deepEqual(item, obj2[index]));
  }
  
  // Handle Objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => 
    keys2.includes(key) && deepEqual(obj1[key], obj2[key])
  );
}
