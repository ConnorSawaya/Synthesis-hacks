import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchFinanceNewsFeed } from './financeDataService.js';

test('static demo uses bundled news without requesting an API', async () => {
  let requestedUrl;
  const feed = await fetchFinanceNewsFeed({}, {
    env: { VITE_DEMO_MODE: 'true' },
    fetchImpl: async (url) => {
      requestedUrl = url;
      throw new Error('The demo should not request a server');
    },
  });

  assert.equal(requestedUrl, undefined);
  assert.equal(feed.mode, 'simulation_fallback');
  assert.equal(feed.provider, null);
  assert.ok(feed.articles.length > 0);
});
