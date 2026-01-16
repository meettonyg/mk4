/**
 * Shared constants for tool components
 *
 * @package GMKB
 * @subpackage Tools/Shared
 */

// Injection key for sharing profile data between EmbeddedToolWrapper and Generator
export const EMBEDDED_PROFILE_DATA_KEY = Symbol('embeddedProfileData');

// Injection key to indicate component is inside embedded wrapper (auto-hide chrome)
export const IS_EMBEDDED_CONTEXT_KEY = Symbol('isEmbeddedContext');
