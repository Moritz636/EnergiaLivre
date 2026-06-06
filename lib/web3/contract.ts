/**
 * lib/web3/contract.ts
 * Instancia do smart contract KWATT (server-side, read-only por padrao)
 */

import { Contract, formatUnits, parseUnits, type BigNumberish } from 'ethers';
import { getProvider, getActiveNetwork, type NetworkKey } from './provider';
import { KWATT_MINIMAL_ABI } from './abi';
import { KWATT_SYMBOL, KWATT_DECIMALS } from '../tokenomics';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const KWATT_DEPLOYED_PLACEHOLDER = ZERO_ADDRESS;

export interface ContractInstance {
  contract: Contract;
  address: string;
  network: NetworkKey;
  chainId: number;
  isDeployed: boolean;
  decimals: number;
}

let cached: Partial<Record<NetworkKey, ContractInstance>> = {};

/**
 * Resolve o endereco do contrato a partir do DB (token_contracts)
 * ou do env (NEXT_PUBLIC_KWATT_CONTRACT_ADDRESS).
 * Fallback: ZERO_ADDRESS (placeholder pre-deploy).
 */
async function resolveContractAddress(network: NetworkKey): Promise<string> {
  // 1) env var (build-time override)
  const envAddr = process.env.NEXT_PUBLIC_KWATT_CONTRACT_ADDRESS;
  if (envAddr && envAddr !== ZERO_ADDRESS) return envAddr;

  // 2) Supabase (token_contracts)
  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();
    const { data } = await supabase
      .from('token_contracts')
      .select('contract_address, chain_id')
      .eq('network', network === 'amoy' ? 'polygon-amoy' : 'polygon-mainnet')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (data?.contract_address && data.contract_address !== ZERO_ADDRESS) {
      return data.contract_address;
    }
  } catch (e) {
    // Supabase nao disponivel em build — silencioso.
  }

  return ZERO_ADDRESS;
}

export async function getKWATTContract(networkOverride?: NetworkKey): Promise<ContractInstance> {
  const network = networkOverride || getActiveNetwork();
  if (cached[network] && cached[network]!.address !== ZERO_ADDRESS) {
    return cached[network]!;
  }

  const address = await resolveContractAddress(network);
  const provider = getProvider(network);
  const network_ = await provider.getNetwork();
  const chainId = Number(network_.chainId);
  const contract = new Contract(address, KWATT_MINIMAL_ABI, provider);

  const instance: ContractInstance = {
    contract,
    address,
    network,
    chainId,
    isDeployed: address !== ZERO_ADDRESS,
    decimals: KWATT_DECIMALS,
  };

  cached[network] = instance;
  return instance;
}

/**
 * Helpers de formatacao (inteiros em wei <-> string legivel)
 */
export function formatKWATT(wei: BigNumberish | bigint | string | number, decimals: number = KWATT_DECIMALS): string {
  return formatUnits(wei as any, decimals);
}

export function parseKWATT(amount: string | number, decimals: number = KWATT_DECIMALS): bigint {
  return parseUnits(String(amount), decimals);
}

export const KWATT_DISPLAY = {
  symbol: KWATT_SYMBOL,
  decimals: KWATT_DECIMALS,
};
