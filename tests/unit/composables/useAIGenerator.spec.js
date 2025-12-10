/**
 * Unit tests for useAIGenerator composable
 *
 * @package GMKB
 * @subpackage Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAIGenerator } from '../../../src/composables/useAIGenerator';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined)
};
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  configurable: true
});

describe('useAIGenerator', () => {
  beforeEach(() => {
    // Create fresh Pinia instance for each test
    setActivePinia(createPinia());

    // Reset mocks
    vi.clearAllMocks();
    mockFetch.mockReset();

    // Setup default window globals
    window.gmkbData = {
      restUrl: '/wp-json/gmkb/v2/',
      restNonce: 'test-nonce-123',
      postId: '12345'
    };
  });

  afterEach(() => {
    delete window.gmkbData;
    delete window.gmkbPublicData;
    delete window.gmkbPublicNonce;
  });

  describe('Initialization', () => {
    it('initializes with default state', () => {
      const generator = useAIGenerator('biography');

      expect(generator.isGenerating.value).toBe(false);
      expect(generator.generatedContent.value).toBe(null);
      expect(generator.error.value).toBe(null);
      expect(generator.usageRemaining.value).toBe(null);
    });

    it('accepts different content types', () => {
      const types = ['biography', 'topics', 'questions', 'tagline', 'guest_intro', 'offers'];

      types.forEach(type => {
        const generator = useAIGenerator(type);
        expect(generator).toBeDefined();
        expect(generator.generate).toBeInstanceOf(Function);
      });
    });
  });

  describe('Context Detection', () => {
    it('detects builder context when postId is present', () => {
      window.gmkbData = { postId: '123' };
      const generator = useAIGenerator('biography');

      expect(generator.getContext()).toBe('builder');
    });

    it('detects public context when no postId', () => {
      window.gmkbData = {};
      const generator = useAIGenerator('biography');

      expect(generator.getContext()).toBe('public');
    });

    it('detects public context when gmkbData is missing', () => {
      delete window.gmkbData;
      const generator = useAIGenerator('biography');

      expect(generator.getContext()).toBe('public');
    });
  });

  describe('Field Validation', () => {
    it('validates biography requires name or authorityHook', () => {
      const generator = useAIGenerator('biography');

      expect(generator.validateFields({}).valid).toBe(false);
      expect(generator.validateFields({ name: 'John' }).valid).toBe(true);
      expect(generator.validateFields({ authorityHook: 'Expert' }).valid).toBe(true);
    });

    it('validates topics requires expertise or authorityHook', () => {
      const generator = useAIGenerator('topics');

      expect(generator.validateFields({}).valid).toBe(false);
      expect(generator.validateFields({ expertise: 'Marketing' }).valid).toBe(true);
      expect(generator.validateFields({ authorityHook: 'Expert' }).valid).toBe(true);
    });

    it('validates questions requires topics or authorityHook', () => {
      const generator = useAIGenerator('questions');

      expect(generator.validateFields({}).valid).toBe(false);
      expect(generator.validateFields({ topics: ['Topic 1'] }).valid).toBe(true);
    });

    it('validates tagline requires authorityHook or name', () => {
      const generator = useAIGenerator('tagline');

      expect(generator.validateFields({}).valid).toBe(false);
      expect(generator.validateFields({ name: 'John' }).valid).toBe(true);
      expect(generator.validateFields({ authorityHook: 'Expert' }).valid).toBe(true);
    });

    it('validates guest_intro requires biography or credentials', () => {
      const generator = useAIGenerator('guest_intro');

      expect(generator.validateFields({}).valid).toBe(false);
      expect(generator.validateFields({ biography: 'John is...' }).valid).toBe(true);
      expect(generator.validateFields({ credentials: ['PhD'] }).valid).toBe(true);
    });

    it('returns error message for invalid params', () => {
      const generator = useAIGenerator('biography');
      const result = generator.validateFields({});

      expect(result.valid).toBe(false);
      expect(result.message).toContain('required');
    });

    it('handles null/undefined params', () => {
      const generator = useAIGenerator('biography');

      expect(generator.validateFields(null).valid).toBe(false);
      expect(generator.validateFields(undefined).valid).toBe(false);
    });
  });

  describe('Generation', () => {
    it('makes API request with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { content: 'Generated biography text' },
          usage: { remaining: 9, reset_time: 3600 }
        })
      });

      const generator = useAIGenerator('biography');
      await generator.generate({ name: 'John Smith', tone: 'professional' });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];

      expect(url).toContain('ai/generate');
      expect(options.method).toBe('POST');
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.headers['X-WP-Nonce']).toBe('test-nonce-123');

      const body = JSON.parse(options.body);
      expect(body.type).toBe('biography');
      expect(body.params.name).toBe('John Smith');
      expect(body.context).toBe('builder');
    });

    it('sets isGenerating during API call', async () => {
      let resolvePromise;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockFetch.mockReturnValueOnce(pendingPromise);

      const generator = useAIGenerator('biography');
      const generatePromise = generator.generate({ name: 'John' });

      // Should be generating
      expect(generator.isGenerating.value).toBe(true);

      // Resolve the fetch
      resolvePromise({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { content: 'Bio' }
        })
      });

      await generatePromise;

      // Should no longer be generating
      expect(generator.isGenerating.value).toBe(false);
    });

    it('stores generated content', async () => {
      const content = 'John Smith is a renowned expert...';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { content }
        })
      });

      const generator = useAIGenerator('biography');
      await generator.generate({ name: 'John' });

      expect(generator.generatedContent.value).toBe(content);
      expect(generator.hasContent.value).toBe(true);
    });

    it('updates usage information', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { content: 'Bio' },
          usage: { remaining: 2, reset_time: 1800 }
        })
      });

      const generator = useAIGenerator('biography');
      await generator.generate({ name: 'John' });

      expect(generator.usageRemaining.value).toBe(2);
      expect(generator.resetTime.value).toBe(1800);
    });

    it('throws on validation failure', async () => {
      const generator = useAIGenerator('biography');

      await expect(generator.generate({})).rejects.toThrow('required');
      expect(generator.error.value).toContain('required');
      expect(generator.hasError.value).toBe(true);
    });

    it('handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({
          message: 'Rate limit exceeded'
        })
      });

      const generator = useAIGenerator('biography');

      await expect(generator.generate({ name: 'John' })).rejects.toThrow('Rate limit exceeded');
      expect(generator.error.value).toBe('Rate limit exceeded');
      expect(generator.isGenerating.value).toBe(false);
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const generator = useAIGenerator('biography');

      await expect(generator.generate({ name: 'John' })).rejects.toThrow('Network error');
      expect(generator.error.value).toBe('Network error');
    });
  });

  describe('Caching', () => {
    it('returns cached result on subsequent calls', async () => {
      const content = 'Cached biography';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { content }
        })
      });

      const generator = useAIGenerator('biography');
      const params = { name: 'John', tone: 'professional' };

      // First call - should hit API
      await generator.generate(params);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call with same params - should use cache
      await generator.generate(params);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still only 1 call

      expect(generator.generatedContent.value).toBe(content);
    });
  });

  describe('Clipboard', () => {
    it('copies generated content to clipboard', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { content: 'Copy this text' }
        })
      });

      const generator = useAIGenerator('biography');
      await generator.generate({ name: 'John' });

      const result = await generator.copyToClipboard();

      expect(result).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledWith('Copy this text');
    });

    it('returns false when no content to copy', async () => {
      const generator = useAIGenerator('biography');
      const result = await generator.copyToClipboard();

      expect(result).toBe(false);
      expect(mockClipboard.writeText).not.toHaveBeenCalled();
    });
  });

  describe('Reset', () => {
    it('resets all state', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { content: 'Bio' }
        })
      });

      const generator = useAIGenerator('biography');
      await generator.generate({ name: 'John' });

      expect(generator.generatedContent.value).not.toBe(null);

      generator.reset();

      expect(generator.generatedContent.value).toBe(null);
      expect(generator.rawContent.value).toBe(null);
      expect(generator.error.value).toBe(null);
    });
  });

  describe('Computed Properties', () => {
    it('hasContent reflects content state', async () => {
      const generator = useAIGenerator('biography');

      expect(generator.hasContent.value).toBe(false);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { content: 'Bio' }
        })
      });

      await generator.generate({ name: 'John' });
      expect(generator.hasContent.value).toBe(true);

      generator.reset();
      expect(generator.hasContent.value).toBe(false);
    });

    it('isRateLimited reflects usage state', async () => {
      const generator = useAIGenerator('biography');

      expect(generator.isRateLimited.value).toBe(false);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: { content: 'Bio' },
          usage: { remaining: 0, reset_time: 3600 }
        })
      });

      await generator.generate({ name: 'John' });
      expect(generator.isRateLimited.value).toBe(true);
    });
  });
});
