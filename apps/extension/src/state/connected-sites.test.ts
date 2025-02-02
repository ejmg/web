import { beforeEach, describe, expect, test, vi } from 'vitest';
import { create, StoreApi, UseBoundStore } from 'zustand';
import { AllSlices, initializeStore } from '.';
import { localDefaults } from '@penumbra-zone/storage/chrome/local';
import { LocalStorageState, OriginRecord } from '@penumbra-zone/storage/chrome/types';
import { ExtensionStorage } from '@penumbra-zone/storage/chrome/base';
import {
  mockLocalExtStorage,
  mockSessionExtStorage,
} from '@penumbra-zone/storage/chrome/test-utils/mock';
import { UserChoice } from '@penumbra-zone/types/user-choice';
import { allSitesFilteredOutSelector } from './connected-sites';

describe('Connected Sites Slice', () => {
  let useStore: UseBoundStore<StoreApi<AllSlices>>;
  let localStorage: ExtensionStorage<LocalStorageState>;

  beforeEach(() => {
    localStorage = mockLocalExtStorage();
    useStore = create<AllSlices>()(initializeStore(mockSessionExtStorage(), localStorage));
  });

  test('the default is populated from local storage', () => {
    expect(useStore.getState().connectedSites.filter).toBeUndefined();
    expect(useStore.getState().connectedSites.knownSites).toEqual([]);
  });

  describe('knownSites', () => {
    beforeEach(() => {
      useStore.setState(state => ({
        ...state,
        connectedSites: {
          ...state.connectedSites,
          knownSites: localDefaults.knownSites,
          frontendUrl: localDefaults.frontendUrl,
        },
      }));
    });

    describe('setFilter', () => {
      test('filter can be set', () => {
        const testUrl = 'https://test';
        useStore.getState().connectedSites.setFilter(testUrl);
        expect(useStore.getState().connectedSites.filter).toBe(testUrl);
      });

      test('setting filter matches properly', () => {
        const testUrl = localDefaults.knownSites[0]!.origin;
        useStore.getState().connectedSites.setFilter(testUrl);
        expect(useStore.getState().connectedSites.filter).toBe(testUrl);
        expect(allSitesFilteredOutSelector(useStore.getState())).toBe(false);
      });

      test('setting filter removes properly', () => {
        const testUrl = 'https://test';
        useStore.getState().connectedSites.setFilter(testUrl);
        expect(useStore.getState().connectedSites.filter).toBe(testUrl);
        expect(allSitesFilteredOutSelector(useStore.getState())).toBe(true);
      });
    });

    describe('discardKnownSite', () => {
      test('discarding known site removes it from storage', async () => {
        const deletant = localDefaults.knownSites[0]!;
        await expect(
          useStore.getState().connectedSites.discardKnownSite(deletant),
        ).resolves.not.toThrow();

        await expect(localStorage.get('knownSites')).resolves.toEqual([]);
      });

      test('discarding unknown site has no effect on storage', async () => {
        const deletant: OriginRecord = {
          origin: 'https://test',
          choice: UserChoice.Ignored,
          date: Date.now(),
        };

        await expect(
          useStore.getState().connectedSites.discardKnownSite(deletant),
        ).resolves.not.toThrow();

        expect(useStore.getState().connectedSites.knownSites).toMatchObject(
          localDefaults.knownSites,
        );
      });
    });
  });

  describe('setFrontendUrl', () => {
    test('updates the frontendUrl in storage', async () => {
      const newFrontendUrl = 'https://example.com/test';
      useStore.getState().connectedSites.setFrontendUrl(newFrontendUrl);

      await vi.waitFor(() =>
        expect(localStorage.get('frontendUrl')).resolves.toEqual(newFrontendUrl),
      );
    });
  });
});
