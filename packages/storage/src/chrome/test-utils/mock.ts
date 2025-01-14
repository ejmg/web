import { ExtensionStorage, IStorage } from '../base';
import { localDefaults } from '../local';
import { sessionDefaults, SessionStorageState } from '../session';
import { LocalStorageState } from '../types';

// Helpful for testing interactions with session & local storage
export class MockStorageArea implements IStorage {
  private store = new Map<string, unknown>();

  async get(key: string): Promise<Record<string, unknown>> {
    return new Promise(resolve => {
      const value = this.store.get(key);
      if (value !== undefined) {
        resolve({ [key]: value });
      } else {
        resolve({});
      }
    });
  }

  async remove(key: string): Promise<void> {
    return new Promise(resolve => {
      this.store.delete(key);
      resolve();
    });
  }

  async set(items: Record<string, unknown>): Promise<void> {
    return new Promise(resolve => {
      for (const key in items) {
        this.store.set(key, items[key]);
      }
      resolve();
    });
  }

  onChanged = {
    addListener() {
      // no-op
    },
    removeListener() {
      // no-op
    },
  };
}

enum MockStorageVersion {
  V1 = 'V1',
}

export const mockSessionExtStorage = () =>
  new ExtensionStorage<SessionStorageState>(
    new MockStorageArea(),
    sessionDefaults,
    MockStorageVersion.V1,
    {},
  );

export const mockLocalExtStorage = () =>
  new ExtensionStorage<LocalStorageState>(
    new MockStorageArea(),
    localDefaults,
    MockStorageVersion.V1,
    {},
  );
