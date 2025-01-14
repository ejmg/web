export const Prefixes = {
  passet: 'passet',
  pauctid: 'pauctid',
  penumbra: 'penumbra',
  penumbrafullviewingkey: 'penumbrafullviewingkey',
  penumbragovern: 'penumbragovern',
  penumbraspendkey: 'penumbraspendkey',
  penumbravalid: 'penumbravalid',
  penumbrawalletid: 'penumbrawalletid',
  plpid: 'plpid',
} as const;

export type Prefix = keyof typeof Prefixes;
