import { LocalStorageState } from '@penumbra-zone/storage/chrome/types';
import { ExtensionStorage } from '@penumbra-zone/storage/chrome/base';
import { AllSlices, SliceCreator } from '.';

export interface NetworkSlice {
  grpcEndpoint: string | undefined;
  fullSyncHeight?: number;
  setGRPCEndpoint: (endpoint: string) => Promise<void>;
}

export const createNetworkSlice =
  (local: ExtensionStorage<LocalStorageState>): SliceCreator<NetworkSlice> =>
  set => {
    return {
      grpcEndpoint: undefined,
      fullSyncHeight: undefined,
      setGRPCEndpoint: async (endpoint: string) => {
        set(state => {
          state.network.grpcEndpoint = endpoint;
        });

        await local.set('grpcEndpoint', endpoint);
      },
    };
  };

export const networkSelector = (state: AllSlices) => state.network;
