import { run, network } from "hardhat";

async function main() {
  const address = process.env.KWATT_ADDRESS;
  if (!address) {
    throw new Error("KWATT_ADDRESS env var nao definida");
  }
  console.log("Verifying KWATT at", address, "on", network.name);
  try {
    await run("verify:verify", {
      address,
      constructorArguments: [
        process.env.KWATT_INITIAL_OWNER,
        process.env.KWATT_MINTER_ROLE_HOLDER,
        ethers.parseUnits(process.env.KWATT_INITIAL_SUPPLY ?? "1000000000", 18),
      ],
    });
    console.log("Verificado com sucesso!");
  } catch (e: any) {
    if (e?.message?.includes("Already Verified")) {
      console.log("Contrato ja verificado.");
    } else {
      throw e;
    }
  }
}

import { ethers } from "ethers";
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
