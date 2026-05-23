export function getPassedLessonCount(completedLessons) {
  return completedLessons.filter((lesson) => lesson.score >= 80).length;
}

export function getLevelFromXP(xp) {
  return Math.floor(xp / 100) + 1;
}

export function hasPassedLesson(completedLessons, lessonId) {
  return completedLessons.some((lesson) => lesson.lessonId === lessonId && lesson.score >= 80);
}

export function isChallengeUnlocked(completedLessons) {
  return getPassedLessonCount(completedLessons) >= 1;
}

export function isMarketUnlocked(completedLessons) {
  return hasPassedLesson(completedLessons, 'module-1-quiz');
}
