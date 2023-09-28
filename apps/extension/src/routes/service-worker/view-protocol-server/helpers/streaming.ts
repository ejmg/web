import { OUTGOING_GRPC_MESSAGE, StreamResponse } from 'penumbra-transport';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { ViewProtocolReq, ViewProtocolRes } from './generic';
import { MethodKind } from '@bufbuild/protobuf';

const streamingMethods = Object.values(ViewProtocolService.methods)
  .filter(m => m.kind === MethodKind.ServerStreaming)
  .map(m => m.I.typeName);

export const isStreamingMethod = (req: ViewProtocolReq): boolean => {
  return streamingMethods.includes(req.requestTypeName);
};

export const streamResponse = (
  req: ViewProtocolReq,
  result: { value: ViewProtocolRes; done: false } | { done: true },
): StreamResponse<typeof ViewProtocolService> => {
  return {
    type: OUTGOING_GRPC_MESSAGE,
    sequence: req.sequence,
    requestTypeName: req.requestTypeName,
    serviceTypeName: req.serviceTypeName,
    stream: result,
  };
};