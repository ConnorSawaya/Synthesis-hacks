import test from 'node:test';
import assert from 'node:assert/strict';
import { isMarketUnlocked } from './progression.js';
import { getLessonCashReward } from '../data/lessons.js';

test('market features stay locked before the Module 1 quiz is passed', () => {
  assert.equal(isMarketUnlocked([{ lessonId: 'module-1-lesson-1', score: 100 }]), false);
});

test('market features unlock when the Module 1 quiz is passed', () => {
  assert.equal(isMarketUnlocked([{ lessonId: 'module-1-quiz', score: 80 }]), true);
});

test('lesson cash rewards are stronger before the market unlocks', () => {
  assert.equal(getLessonCashReward({ type: 'lesson' }, false), 125);
  assert.equal(getLessonCashReward({ type: 'quiz' }, false), 500);
});

test('lesson cash rewards stay available after the market unlocks', () => {
  assert.equal(getLessonCashReward({ type: 'lesson' }, true), 60);
  assert.equal(getLessonCashReward({ type: 'quiz' }, true), 150);
});
