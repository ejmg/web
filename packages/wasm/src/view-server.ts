import { ViewServer as WasmViewServer } from '@penumbra-zone/wasm-bundler';
import {
  NctUpdates,
  ScanResult,
  ScanResultSchema,
  StateCommitmentTree,
  ViewServerInterface,
} from 'penumbra-types';
import { validateSchema } from 'penumbra-types/src/validation';
import { CompactBlock } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/chain/v1alpha1/chain_pb';

interface ViewServerProps {
  fullViewingKey: string;
  epochDuration: bigint;
  getStoredTree: () => Promise<StateCommitmentTree>;
}

export class ViewServer implements ViewServerInterface {
  private constructor(
    private wasmViewServer: WasmViewServer,
    private readonly fullViewingKey: string,
    private readonly epochDuration: bigint,
    private readonly getStoredTree: () => Promise<StateCommitmentTree>,
  ) {}

  static async initialize({
    fullViewingKey,
    epochDuration,
    getStoredTree,
  }: ViewServerProps): Promise<ViewServer> {
    return new this(
      new WasmViewServer(fullViewingKey, epochDuration, await getStoredTree()),
      fullViewingKey,
      epochDuration,
      getStoredTree,
    );
  }

  // Decrypts blocks with viewing key for notes, swaps, and updates revealed for user
  // Makes update to internal state-commitment-tree as a side effect.
  // Should extract updates and save locally.
  scanBlock(compactBlock: CompactBlock): ScanResult {
    const result = this.wasmViewServer.scan_block_without_updates(
      compactBlock.toJson(),
    ) as ScanResult;
    return validateSchema(ScanResultSchema, result);
  }

  // If a sync fails, the state of the wasmViewServer should reset to the one set in storage
  async resetTreeToStored() {
    this.wasmViewServer = new WasmViewServer(
      this.fullViewingKey,
      this.epochDuration,
      await this.getStoredTree(),
    );
  }

  getNctRoot(): string {
    const result = this.wasmViewServer.get_nct_root() as { inner: string };
    return result.inner;
  }

  // As blocks are scanned, the internal wasmViewServer tree is being updated.
  // Passing the locally stored last position/forgotten allows us to see the
  // changes in that tree since that last stored checkpoint.
  async updatesSinceCheckpoint(): Promise<NctUpdates> {
    const { last_position, last_forgotten } = await this.getStoredTree();
    const scanResult = this.wasmViewServer.get_updates(last_position, last_forgotten) as ScanResult;
    return validateSchema(ScanResultSchema, scanResult).nct_updates;
  }
}