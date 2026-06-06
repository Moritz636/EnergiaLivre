/**
 * lib/web3/server.ts
 * Helpers server-side para consulta on-chain.
 * Tudo read-only — escrita eh feita por admin via script Node separado.
 */

import { formatUnits } from 'ethers';
import { getKWATTContract, formatKWATT, ZERO_ADDRESS } from './contract';
import { getProvider } from './provider';

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;       // formatted
  totalSupplyRaw: string;    // wei
  isDeployed: boolean;
  network: string;
  chainId: number;
  paused: boolean;
}

export interface HolderBalance {
  address: string;
  balance: string;    // formatted
  balanceRaw: string; // wei
}

/**
 * Info publica do token (name, symbol, supply, paused).
 * Em ambiente pre-deploy retorna placeholder.
 */
export async function getTokenInfo(): Promise<TokenInfo> {
  const { contract, address, network, chainId, isDeployed } = await getKWATTContract();

  if (!isDeployed) {
    return {
      address: ZERO_ADDRESS,
      name: 'KWATT',
      symbol: 'KWATT',
      decimals: 18,
      totalSupply: '0',
      totalSupplyRaw: '0',
      isDeployed: false,
      network,
      chainId,
      paused: false,
    };
  }

  const [name, symbol, decimals, totalSupply, paused] = await Promise.all([
    contract.name() as Promise<string>,
    contract.symbol() as Promise<string>,
    contract.decimals() as Promise<bigint>,
    contract.totalSupply() as Promise<bigint>,
    contract.paused() as Promise<boolean>,
  ]);

  const dec = Number(decimals);
  return {
    address,
    name,
    symbol,
    decimals: dec,
    totalSupply: formatUnits(totalSupply, dec),
    totalSupplyRaw: totalSupply.toString(),
    isDeployed: true,
    network,
    chainId,
    paused,
  };
}

/**
 * Saldo on-chain de um endereco.
 */
export async function getOnChainBalance(walletAddress: string): Promise<HolderBalance> {
  const { contract, isDeployed, decimals } = await getKWATTContract();

  if (!isDeployed) {
    return { address: walletAddress, balance: '0', balanceRaw: '0' };
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    throw new Error('Endereco de carteira invalido');
  }

  const raw = (await contract.balanceOf(walletAddress)) as bigint;
  return {
    address: walletAddress,
    balance: formatUnits(raw, decimals),
    balanceRaw: raw.toString(),
  };
}

/**
 * Numero de blocos ate o bloco atual.
 */
export async function getCurrentBlock(network: 'polygon' | 'amoy' = 'polygon'): Promise<number> {
  const provider = getProvider(network);
  return Number(await provider.getBlockNumber());
}

/**
 * Helper de formatacao seguro (re-exportado).
 */
export { formatKWATT } from './contract';
