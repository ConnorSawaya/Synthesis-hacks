function createMemoryStorage() {
  const entries = new Map();

  return {
    getItem(key) {
      const normalizedKey = String(key);
      return entries.has(normalizedKey) ? entries.get(normalizedKey) : null;
    },
    setItem(key, value) {
      entries.set(String(key), String(value));
    },
    removeItem(key) {
      entries.delete(String(key));
    },
  };
}

export function createResilientStorage(getStorage = () => globalThis.localStorage) {
  const memoryStorage = createMemoryStorage();
  let persistentStorage;

  try {
    persistentStorage = getStorage();
  } catch {
    persistentStorage = undefined;
  }

  return {
    getItem(key) {
      if (!persistentStorage) return memoryStorage.getItem(key);

      try {
        return persistentStorage.getItem(key);
      } catch {
        persistentStorage = undefined;
        return memoryStorage.getItem(key);
      }
    },
    setItem(key, value) {
      if (persistentStorage) {
        try {
          persistentStorage.setItem(key, value);
          return;
        } catch {
          persistentStorage = undefined;
        }
      }

      memoryStorage.setItem(key, value);
    },
    removeItem(key) {
      if (persistentStorage) {
        try {
          persistentStorage.removeItem(key);
          return;
        } catch {
          persistentStorage = undefined;
        }
      }

      memoryStorage.removeItem(key);
    },
  };
}
