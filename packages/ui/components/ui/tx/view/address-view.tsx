import { AddressIcon } from '../../address-icon';
import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { CopyToClipboardIconButton } from '../../copy-to-clipboard-icon-button';
import { AddressComponent } from '../../address-component';
import { bech32mAddress } from '@penumbra-zone/bech32m/penumbra';

interface AddressViewProps {
  view: AddressView | undefined;
  copyable?: boolean;
}

// Renders an address or an address view.
// If the view is given and is "visible", the account information will be displayed instead.
export const AddressViewComponent = ({ view, copyable = true }: AddressViewProps) => {
  if (!view?.addressView.value?.address) return <></>;

  const encodedAddress = bech32mAddress(view.addressView.value.address);

  const accountIndex =
    view.addressView.case === 'decoded' ? view.addressView.value.index?.account : undefined;
  const isOneTimeAddress =
    view.addressView.case === 'decoded'
      ? !view.addressView.value.index?.randomizer.every(v => v === 0) // Randomized (and thus, a one-time address) if the randomizer is not all zeros.
      : undefined;

  const addressIndexLabel = isOneTimeAddress ? 'IBC Deposit Address for Account #' : 'Account #';

  copyable = isOneTimeAddress ? false : copyable;

  return (
    <div className='flex items-center gap-2 overflow-hidden'>
      {accountIndex !== undefined ? (
        <>
          <AddressIcon address={view.addressView.value.address} size={14} />
          <span className='break-keep font-bold'>
            {addressIndexLabel}
            {accountIndex}
          </span>
        </>
      ) : (
        <AddressComponent address={view.addressView.value.address} />
      )}

      {copyable && <CopyToClipboardIconButton text={encodedAddress} />}
    </div>
  );
};
