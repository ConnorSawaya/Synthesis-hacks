import test from 'node:test';
import assert from 'node:assert/strict';
import { createResilientStorage } from './storage.js';

test('uses in-memory storage when the browser blocks localStorage access', () => {
  const storage = createResilientStorage(() => {
    throw new Error('Storage access is blocked');
  });

  storage.setItem('progress', '{"xp":25}');
  assert.equal(storage.getItem('progress'), '{"xp":25}');
  storage.removeItem('progress');
  assert.equal(storage.getItem('progress'), null);
});

test('falls back to memory when persistent storage methods begin throwing', () => {
  const blockedStorage = {
    getItem() {
      throw new Error('Storage read failed');
    },
    setItem() {
      throw new Error('Storage write failed');
    },
    removeItem() {
      throw new Error('Storage remove failed');
    },
  };
  const storage = createResilientStorage(() => blockedStorage);

  storage.setItem('progress', '{"xp":50}');
  assert.equal(storage.getItem('progress'), '{"xp":50}');
  storage.removeItem('progress');
  assert.equal(storage.getItem('progress'), null);
});

test('uses available browser storage while it remains writable', () => {
  const entries = new Map();
  const persistentStorage = {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  };
  const storage = createResilientStorage(() => persistentStorage);

  storage.setItem('progress', '{"xp":75}');
  assert.equal(storage.getItem('progress'), '{"xp":75}');
  assert.equal(entries.get('progress'), '{"xp":75}');
});
