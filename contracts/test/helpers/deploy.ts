import { ethers } from "hardhat";
import type { Contract, ContractFactory, Signer } from "ethers";

export interface KWATTDeployOptions {
  initialOwner: string;
  minter: string;
  initialSupply: bigint;
}

export interface DeployedKWATT {
  token: Contract;
  address: string;
  deployer: Signer;
  initialOwner: string;
  minter: string;
}

/**
 * Helper de deploy padronizado para KWATT.
 * Usado por todos os testes e scripts de deploy.
 */
export async function deployKWATT(opts: KWATTDeployOptions): Promise<DeployedKWATT> {
  const [deployer] = await ethers.getSigners();
  const Factory: ContractFactory = await ethers.getContractFactory("KWATT");
  const token = await Factory.deploy(opts.initialOwner, opts.minter, opts.initialSupply);
  await token.waitForDeployment();
  const address = await token.getAddress();

  return {
    token,
    address,
    deployer,
    initialOwner: opts.initialOwner,
    minter: opts.minter,
  };
}

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ONE_ETHER = 10n ** 18n;
