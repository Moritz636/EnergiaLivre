import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("=== KWATT Deployment — Polygon Amoy Testnet ===");
  console.log("Deployer:", deployer.address);
  console.log("Balance :", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "MATIC");
  console.log("Chain ID:", network.chainId);

  const initialOwner = process.env.KWATT_INITIAL_OWNER ?? deployer.address;
  const minter = process.env.KWATT_MINTER_ROLE_HOLDER ?? deployer.address;
  const initialSupply = ethers.parseUnits(process.env.KWATT_INITIAL_SUPPLY ?? "1000000000", 18);

  const Factory = await ethers.getContractFactory("KWATT");
  const token = await Factory.deploy(initialOwner, minter, initialSupply);
  await token.waitForDeployment();
  const address = await token.getAddress();

  console.log("\nKWATT deployed to:", address);
  console.log("View on Amoy Polygonscan: https://amoy.polygonscan.com/address/" + address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
