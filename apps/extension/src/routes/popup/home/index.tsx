import { SelectAccount } from '@penumbra-zone/ui/components/ui/select-account';
import { IndexHeader } from './index-header';
import { useStore } from '../../../state';
import { BlockSync } from './block-sync';
import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { addrByIndexSelector, getActiveWallet } from '../../../state/wallets';
import { needsLogin } from '../popup-needs';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { ExternalLink } from 'lucide-react';

export interface PopupLoaderData {
  fullSyncHeight?: number;
}

// Because Zustand initializes default empty (prior to persisted storage synced),
// We need to manually check storage for accounts & password in the loader.
// Will redirect to onboarding or password check if necessary.
export const popupIndexLoader = async (): Promise<Response | PopupLoaderData> => {
  const redirect = await needsLogin();
  if (redirect) return redirect;

  return {
    fullSyncHeight: await localExtStorage.get('fullSyncHeight'),
  };
};

export const PopupIndex = () => {
  const activeWallet = useStore(getActiveWallet);
  const getAddrByIndex = useStore(addrByIndexSelector);
  const frontendUrl = useStore(state => state.connectedSites.frontendUrl);

  return (
    <>
      <BlockSync />

      <div className='flex h-full grow flex-col items-stretch justify-between bg-logo bg-left-bottom px-[30px] pb-[30px]'>
        <IndexHeader />

        <div className='flex flex-col gap-8'>
          {activeWallet && <SelectAccount getAddrByIndex={getAddrByIndex} />}
        </div>

        {!!frontendUrl && (
          <a href={frontendUrl} target='_blank' rel='noreferrer'>
            <Button className='flex w-full items-center gap-2' variant='gradient'>
              Manage portfolio <ExternalLink size={16} />
            </Button>
          </a>
        )}
      </div>
    </>
  );
};
