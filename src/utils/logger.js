/**
 * Simple Logger Utility
 */
export const logger = {
  info: (...args) => console.log('i', ...args),
  warn: (...args) => console.warn('!', ...args),
  error: (...args) => console.error('-', ...args),
  success: (...args) => console.log('+', ...args),
  debug: (...args) => {
    if (window.gmkbData?.debugMode) {
      console.log('🐛', ...args);
    }
  }
};
