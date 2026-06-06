/**
 * lib/web3/provider.ts
 * Provider RPC para Polygon PoS / Amoy testnet
 *
 * Strategy:
 *  - Em producao: usar Alchemy ou Infura (via env var)
 *  - Fallback: Polygonscan public RPC (rate limited, so para dev)
 *  - Singleton: 1 instancia por processo Node
 */

import { JsonRpcProvider } from 'ethers';

const POLYGON_PUBLIC_RPC = 'https://polygon-rpc.com';
const AMOY_PUBLIC_RPC = 'https://rpc-amoy.polygon.technology';

export type NetworkKey = 'polygon' | 'amoy' | 'localhost';

const providers: Partial<Record<NetworkKey, JsonRpcProvider>> = {};

function getEnvRpc(network: NetworkKey): string | undefined {
  if (network === 'polygon') {
    return process.env.POLYGON_RPC_URL || process.env.NEXT_PUBLIC_POLYGON_RPC_URL;
  }
  if (network === 'amoy') {
    return process.env.AMOY_RPC_URL || process.env.NEXT_PUBLIC_AMOY_RPC_URL;
  }
  return undefined;
}

export function getProvider(network: NetworkKey = 'polygon'): JsonRpcProvider {
  if (providers[network]) return providers[network]!;

  const envRpc = getEnvRpc(network);
  const fallback = network === 'amoy' ? AMOY_PUBLIC_RPC : POLYGON_PUBLIC_RPC;
  const url = envRpc || fallback;

  const provider = new JsonRpcProvider(url, undefined, {
    staticNetwork: true,
    batchMaxCount: 5,
  });

  providers[network] = provider;
  return provider;
}

export function getActiveNetwork(): NetworkKey {
  // Default Polygon mainnet. Override via env em dev/staging.
  return (process.env.NEXT_PUBLIC_KWATT_NETWORK as NetworkKey) || 'polygon';
}
