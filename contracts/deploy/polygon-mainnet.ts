import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("=== KWATT Deployment — Polygon Mainnet ===");
  console.log("Deployer:", deployer.address);
  console.log("Balance :", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC");
  console.log("Chain ID:", network.chainId);

  if (network.chainId !== 137n) {
    throw new Error("Esta na rede errada. Use --network polygon");
  }

  const initialOwner = process.env.KWATT_INITIAL_OWNER;
  const minter = process.env.KWATT_MINTER_ROLE_HOLDER;

  if (!initialOwner || !minter) {
    throw new Error("KWATT_INITIAL_OWNER e KWATT_MINTER_ROLE_HOLDER sao obrigatorios no .env para mainnet");
  }

  if (initialOwner === deployer.address) {
    console.warn("ATENCAO: initialOwner = deployer. Use uma multisig em producao (Gnosis Safe).");
  }

  const initialSupply = ethers.parseUnits(process.env.KWATT_INITIAL_SUPPLY ?? "1000000000", 18);

  console.log("Confirmando parametros:");
  console.log("  initialOwner :", initialOwner);
  console.log("  minter       :", minter);
  console.log("  initialSupply:", ethers.formatEther(initialSupply), "KWATT");

  const Factory = await ethers.getContractFactory("KWATT");
  console.log("Enviando transacao de deploy...");
  const token = await Factory.deploy(initialOwner, minter, initialSupply);
  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log("\nKWATT deployed to:", address);
  console.log("View on Polygonscan: https://polygonscan.com/address/" + address);
  console.log("\nProximo passo:");
  console.log("  1. Aguardar ~30s para propagacao");
  console.log("  2. npm run verify:polygon");
  console.log("  3. Transferir ownership das chaves de deploy para cold storage");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
