import test from 'node:test';
import assert from 'node:assert/strict';
import { getRouterBasename } from './routing.js';

test('keeps root deployments at the root router path', () => {
  assert.equal(getRouterBasename('/'), '/');
});

test('removes the trailing slash from a project-site router base', () => {
  assert.equal(getRouterBasename('/Synthesis-hacks/'), '/Synthesis-hacks');
});
