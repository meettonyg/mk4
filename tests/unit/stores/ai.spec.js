/**
 * Unit tests for AI Store (Pinia)
 *
 * @package GMKB
 * @subpackage Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAIStore } from '../../../src/stores/ai';

describe('AI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers();
  });

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const store = useAIStore();

      expect(store.generationHistory).toEqual([]);
      expect(store.cachedResults).toEqual({});
      expect(store.authorityHook).toEqual({
        who: '',
        what: '',
        when: '',
        how: '',
        where: '',
        why: ''
      });
      expect(store.impactIntro).toEqual({
        credentials: [],
        achievements: []
      });
      expect(store.preferences).toEqual({
        defaultTone: 'professional',
        defaultLength: 'medium',
        defaultPOV: 'third'
      });
      expect(store.isGenerating).toBe(false);
      expect(store.lastError).toBe(null);
    });
  });

  describe('Authority Hook', () => {
    it('updates individual fields', () => {
      const store = useAIStore();

      store.updateAuthorityHook('who', 'busy entrepreneurs');
      expect(store.authorityHook.who).toBe('busy entrepreneurs');

      store.updateAuthorityHook('what', 'scale their business');
      expect(store.authorityHook.what).toBe('scale their business');
    });

    it('ignores invalid fields', () => {
      const store = useAIStore();

      store.updateAuthorityHook('invalidField', 'test');
      expect(store.authorityHook.invalidField).toBeUndefined();
    });

    it('sets entire authority hook', () => {
      const store = useAIStore();

      store.setAuthorityHook({
        who: 'entrepreneurs',
        what: 'grow revenue',
        how: 'strategic marketing'
      });

      expect(store.authorityHook.who).toBe('entrepreneurs');
      expect(store.authorityHook.what).toBe('grow revenue');
      expect(store.authorityHook.how).toBe('strategic marketing');
      // Others remain default
      expect(store.authorityHook.when).toBe('');
    });

    it('generates summary from authority hook', () => {
      const store = useAIStore();

      store.setAuthorityHook({
        who: 'startups',
        what: 'build products',
        how: 'agile methods'
      });

      expect(store.authorityHookSummary).toContain('startups');
      expect(store.authorityHookSummary).toContain('build products');
    });

    it('returns empty string when no hook data', () => {
      const store = useAIStore();

      expect(store.authorityHookSummary).toBe('');
    });

    it('validates authority hook has minimum data', () => {
      const store = useAIStore();

      expect(store.hasValidAuthorityHook).toBe(false);

      store.updateAuthorityHook('who', 'entrepreneurs');
      expect(store.hasValidAuthorityHook).toBe(true);
    });

    it('resets authority hook', () => {
      const store = useAIStore();

      store.setAuthorityHook({
        who: 'test',
        what: 'test',
        how: 'test'
      });

      store.resetAuthorityHook();

      expect(store.authorityHook.who).toBe('');
      expect(store.authorityHook.what).toBe('');
      expect(store.authorityHook.how).toBe('');
    });
  });

  describe('Impact Intro (Credentials/Achievements)', () => {
    it('adds credentials', () => {
      const store = useAIStore();

      store.addCredential('PhD in Marketing');
      store.addCredential('MBA from Harvard');

      expect(store.impactIntro.credentials).toHaveLength(2);
      expect(store.impactIntro.credentials).toContain('PhD in Marketing');
    });

    it('prevents duplicate credentials', () => {
      const store = useAIStore();

      store.addCredential('PhD');
      store.addCredential('PhD');

      expect(store.impactIntro.credentials).toHaveLength(1);
    });

    it('removes credentials by index', () => {
      const store = useAIStore();

      store.setCredentials(['PhD', 'MBA', 'CPA']);
      store.removeCredential(1);

      expect(store.impactIntro.credentials).toEqual(['PhD', 'CPA']);
    });

    it('sets credentials array', () => {
      const store = useAIStore();
      const creds = ['PhD', 'MBA', 'CPA'];

      store.setCredentials(creds);

      expect(store.impactIntro.credentials).toEqual(creds);
      // Verify it's a copy, not reference
      creds.push('Another');
      expect(store.impactIntro.credentials).toHaveLength(3);
    });

    it('generates credentials summary', () => {
      const store = useAIStore();

      store.setCredentials(['PhD', 'MBA']);

      expect(store.credentialsSummary).toBe('PhD, MBA');
    });

    it('adds achievements', () => {
      const store = useAIStore();

      store.addAchievement('Featured in Forbes');
      store.addAchievement('Keynote at TED');

      expect(store.impactIntro.achievements).toHaveLength(2);
    });

    it('removes achievements by index', () => {
      const store = useAIStore();

      store.setAchievements(['Forbes', 'TED', 'Inc 500']);
      store.removeAchievement(0);

      expect(store.impactIntro.achievements).toEqual(['TED', 'Inc 500']);
    });
  });

  describe('Caching', () => {
    it('stores and retrieves cached results', () => {
      const store = useAIStore();
      const content = { text: 'Generated content' };

      store.cacheResult('test-key', content);
      const cached = store.getCachedResult('test-key');

      expect(cached).toEqual(content);
    });

    it('returns null for non-existent keys', () => {
      const store = useAIStore();

      expect(store.getCachedResult('non-existent')).toBe(null);
    });

    it('expires cached results after TTL', () => {
      const store = useAIStore();

      store.cacheResult('test-key', 'content');

      // Advance time past TTL (30 minutes)
      vi.advanceTimersByTime(31 * 60 * 1000);

      expect(store.getCachedResult('test-key')).toBe(null);
    });

    it('hasCachedResult checks validity', () => {
      const store = useAIStore();

      expect(store.hasCachedResult('test-key')).toBe(false);

      store.cacheResult('test-key', 'content');
      expect(store.hasCachedResult('test-key')).toBe(true);

      // Expire it
      vi.advanceTimersByTime(31 * 60 * 1000);
      expect(store.hasCachedResult('test-key')).toBe(false);
    });

    it('clears cache', () => {
      const store = useAIStore();

      store.cacheResult('key1', 'content1');
      store.cacheResult('key2', 'content2');

      store.clearCache();

      expect(store.cachedResults).toEqual({});
    });
  });

  describe('Generation History', () => {
    it('adds entries to history', () => {
      const store = useAIStore();

      store.addToHistory({
        type: 'biography',
        params: { name: 'John' },
        content: 'John is an expert...'
      });

      expect(store.generationHistory).toHaveLength(1);
      expect(store.generationHistory[0].type).toBe('biography');
      expect(store.generationHistory[0].timestamp).toBeDefined();
    });

    it('adds entries to front of history (most recent first)', () => {
      const store = useAIStore();

      store.addToHistory({ type: 'biography', params: {}, content: 'First' });
      store.addToHistory({ type: 'topics', params: {}, content: 'Second' });

      expect(store.generationHistory[0].type).toBe('topics');
      expect(store.generationHistory[1].type).toBe('biography');
    });

    it('limits history to 10 entries', () => {
      const store = useAIStore();

      for (let i = 0; i < 15; i++) {
        store.addToHistory({ type: 'test', params: {}, content: `Content ${i}` });
      }

      expect(store.generationHistory).toHaveLength(10);
    });

    it('filters history by type', () => {
      const store = useAIStore();

      store.addToHistory({ type: 'biography', params: {}, content: 'Bio' });
      store.addToHistory({ type: 'topics', params: {}, content: 'Topics' });
      store.addToHistory({ type: 'biography', params: {}, content: 'Bio 2' });

      const bios = store.getHistoryByType('biography');
      expect(bios).toHaveLength(2);
      expect(bios.every(h => h.type === 'biography')).toBe(true);
    });

    it('clears history', () => {
      const store = useAIStore();

      store.addToHistory({ type: 'test', params: {}, content: 'Test' });
      store.clearHistory();

      expect(store.generationHistory).toEqual([]);
    });
  });

  describe('Generation State', () => {
    it('sets generating state', () => {
      const store = useAIStore();

      store.setGenerating(true, 'biography');
      expect(store.isGenerating).toBe(true);
      expect(store.currentGenerationType).toBe('biography');

      store.setGenerating(false);
      expect(store.isGenerating).toBe(false);
      expect(store.currentGenerationType).toBe(null);
    });

    it('sets and clears errors', () => {
      const store = useAIStore();

      store.setError('API failed');
      expect(store.lastError).toBe('API failed');

      store.clearError();
      expect(store.lastError).toBe(null);
    });
  });

  describe('Usage Tracking', () => {
    it('updates usage from API response', () => {
      const store = useAIStore();

      store.updateUsage({
        remaining: 5,
        limit: 10,
        reset_time: 3600
      });

      expect(store.usage.remaining).toBe(5);
      expect(store.usage.limit).toBe(10);
      expect(store.usage.resetTime).toBe(3600);
    });

    it('calculates usage percentage', () => {
      const store = useAIStore();

      store.updateUsage({ remaining: 3, limit: 10 });
      expect(store.usagePercentage).toBe(70);
    });

    it('detects rate limited state', () => {
      const store = useAIStore();

      expect(store.isRateLimited).toBe(false);

      store.updateUsage({ remaining: 0, limit: 10 });
      expect(store.isRateLimited).toBe(true);
    });
  });

  describe('Preferences', () => {
    it('updates preferences', () => {
      const store = useAIStore();

      store.updatePreferences({
        defaultTone: 'casual',
        defaultLength: 'short'
      });

      expect(store.preferences.defaultTone).toBe('casual');
      expect(store.preferences.defaultLength).toBe('short');
      // Unchanged preference remains
      expect(store.preferences.defaultPOV).toBe('third');
    });
  });

  describe('Load from Profile Data', () => {
    it('loads authority hook from profile data', () => {
      const store = useAIStore();

      store.loadFromProfileData({
        hook_who: 'entrepreneurs',
        hook_what: 'build businesses',
        guest_title: 'Marketing Expert'
      });

      expect(store.authorityHook.who).toBe('entrepreneurs');
      expect(store.authorityHook.what).toBe('build businesses');
    });

    it('loads credentials from comma-separated string', () => {
      const store = useAIStore();

      store.loadFromProfileData({
        credentials: 'PhD, MBA, CPA'
      });

      expect(store.impactIntro.credentials).toEqual(['PhD', 'MBA', 'CPA']);
    });

    it('loads credentials from array', () => {
      const store = useAIStore();

      store.loadFromProfileData({
        credentials: ['PhD', 'MBA']
      });

      expect(store.impactIntro.credentials).toEqual(['PhD', 'MBA']);
    });

    it('handles null/undefined profile data', () => {
      const store = useAIStore();

      store.loadFromProfileData(null);
      store.loadFromProfileData(undefined);

      // Should not throw and state should remain unchanged
      expect(store.authorityHook.who).toBe('');
    });
  });

  describe('Reset All', () => {
    it('resets all state to defaults', () => {
      const store = useAIStore();

      // Set various state
      store.setAuthorityHook({ who: 'test', what: 'test' });
      store.setCredentials(['PhD']);
      store.addToHistory({ type: 'test', params: {}, content: 'Test' });
      store.cacheResult('key', 'value');
      store.setGenerating(true, 'test');
      store.setError('error');

      // Reset
      store.resetAll();

      // Verify all reset
      expect(store.generationHistory).toEqual([]);
      expect(store.cachedResults).toEqual({});
      expect(store.authorityHook.who).toBe('');
      expect(store.impactIntro.credentials).toEqual([]);
      expect(store.isGenerating).toBe(false);
      expect(store.lastError).toBe(null);
    });
  });
});
