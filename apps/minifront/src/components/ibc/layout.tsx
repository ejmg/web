import { Card } from '@penumbra-zone/ui/components/ui/card';
import { IbcOutForm } from './ibc-out/ibc-out-form';
import { IbcInForm } from './ibc-in/ibc-in-form';
import { LongArrowIcon } from './long-arrow';

export const IbcLayout = () => {
  return (
    <>
      <div className="fixed inset-0 z-[-100] size-full bg-[url('penumbra-logo.svg')] bg-[length:160vmax] bg-fixed bg-[top_50%_left_25vw] bg-no-repeat" />
      <div className='flex flex-1 flex-col gap-4 md:flex-row md:place-content-around'>
        <Card light className='relative overflow-visible md:self-start'>
          <LongArrowIcon
            direction='right'
            // Negative calculated margin giving lint issue
            /* eslint-disable-next-line tailwindcss/enforces-negative-arbitrary-values */
            className='invisible absolute inset-y-0 right-0 my-auto -mr-[calc(30vw-3px)] size-[30vw] text-stone-300 md:visible'
          />
          <IbcInForm />
        </Card>
        <Card gradient className='relative overflow-visible md:mt-40 md:self-start'>
          <LongArrowIcon
            direction='left'
            // Negative calculated margin giving lint issue
            /* eslint-disable-next-line tailwindcss/enforces-negative-arbitrary-values */
            className='invisible absolute inset-y-0 left-0 my-auto -ml-[calc(30vw-3px)] size-[30vw] text-stone-700 md:visible'
          />
          <IbcOutForm />
        </Card>
      </div>
    </>
  );
};
