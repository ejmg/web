import { createPromiseClient, ServiceImpl } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { createProxyImpl, noContextHandler } from '@penumbra-zone/transport-dom/proxy';
import { rethrowImplErrors } from './utils/rethrow-impl-errors';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { Query as IbcChannelService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/channel/v1/query_connect';
import { Query as IbcConnectionService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/connection/v1/query_connect';
import { QueryService as AppService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/app/v1/app_connect';
import { QueryService as CompactBlockService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/compact_block/v1/compact_block_connect';
import {
  QueryService as DexService,
  SimulationService as DexSimulationService,
} from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1/dex_connect';
import { QueryService as GovernanceService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/governance/v1/governance_connect';
import { QueryService as SctService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/sct/v1/sct_connect';
import { QueryService as ShieldedPoolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/shielded_pool/v1/shielded_pool_connect';
import { QueryService as StakingService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/stake/v1/stake_connect';
import { TendermintProxyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/util/tendermint_proxy/v1/tendermint_proxy_connect';
import { CustodyService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1/custody_connect';
import { ViewService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1/view_connect';
import { custodyImpl } from '@penumbra-zone/services/custody-service';
import { sctImpl } from '@penumbra-zone/services/sct-service';
import { stakingImpl } from '@penumbra-zone/services/staking-service';
import { viewImpl } from '@penumbra-zone/services/view-service';

import { localExtStorage } from '@penumbra-zone/storage/chrome/local';
import { ServiceType } from '@bufbuild/protobuf';

export const getRpcImpls = async () => {
  const grpcEndpoint = await localExtStorage.get('grpcEndpoint');
  if (!grpcEndpoint) throw new Error('gRPC endpoint not set yet');

  type RpcImplTuple<T extends ServiceType> = [T, Partial<ServiceImpl<T>>];

  const penumbraProxies: RpcImplTuple<ServiceType>[] = [
    AppService,
    CompactBlockService,
    DexService,
    DexSimulationService,
    GovernanceService,
    IbcClientService,
    IbcChannelService,
    IbcConnectionService,
    ShieldedPoolService,
    TendermintProxyService,
  ].map(
    serviceType =>
      [
        serviceType,
        createProxyImpl(
          serviceType,
          createPromiseClient(serviceType, createGrpcWebTransport({ baseUrl: grpcEndpoint })),
          noContextHandler,
        ),
      ] as const,
  );

  const rpcImpls: RpcImplTuple<ServiceType>[] = [
    // rpc local implementations
    [CustodyService, rethrowImplErrors(CustodyService, custodyImpl)],
    [SctService, rethrowImplErrors(SctService, sctImpl)],
    [StakingService, rethrowImplErrors(StakingService, stakingImpl)],
    [ViewService, rethrowImplErrors(ViewService, viewImpl)],
    // rpc remote proxies
    ...penumbraProxies,
  ] as const;

  return rpcImpls;
};
