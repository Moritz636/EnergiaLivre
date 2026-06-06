import { ethers } from "hardhat";

async function main() {
  const name = process.env.KWATT_NAME ?? "KWATT";
  const symbol = process.env.KWATT_SYMBOL ?? "KWATT";
  const initialSupplyStr = process.env.KWATT_INITIAL_SUPPLY ?? "1000000000";
  const initialSupply = ethers.parseUnits(initialSupplyStr, 18);
  const initialOwner = process.env.KWATT_INITIAL_OWNER;
  const minter = process.env.KWATT_MINTER_ROLE_HOLDER;

  if (!initialOwner || !minter) {
    throw new Error("KWATT_INITIAL_OWNER e KWATT_MINTER_ROLE_HOLDER sao obrigatorios no .env");
  }

  console.log("Deploying KWATT...");
  console.log("  initialOwner :", initialOwner);
  console.log("  minter       :", minter);
  console.log("  initialSupply:", initialSupplyStr, "tokens");

  const Factory = await ethers.getContractFactory("KWATT");
  const token = await Factory.deploy(initialOwner, minter, initialSupply);
  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log("KWATT deployed to:", address);
  console.log("\nProximo passo: verificar no Polygonscan");
  console.log("  npm run verify:amoy    (para Amoy testnet)");
  console.log("  npm run verify:polygon (para Polygon mainnet)");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
