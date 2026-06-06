import { expect } from "chai";
import { ethers } from "hardhat";
import { deployKWATT, ONE_ETHER, ZERO_ADDRESS } from "./helpers/deploy";

const MINTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MINTER_ROLE"));
const PAUSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PAUSER_ROLE"));
const DEFAULT_ADMIN_ROLE = ethers.ZeroHash;

const INITIAL_SUPPLY = 1_000_000n * ONE_ETHER;

describe("KWATT — EnergiaLivre Token", function () {
  async function fixture() {
    const [owner, minter, pauser, user1, user2, attacker] = await ethers.getSigners();
    const { token, address } = await deployKWATT({
      initialOwner: owner.address,
      minter: minter.address,
      initialSupply: INITIAL_SUPPLY,
    });
    return { token, address, owner, minter, pauser, user1, user2, attacker };
  }

  describe("Metadata", function () {
    it("tem nome KWATT", async () => {
      const { token } = await fixture();
      expect(await token.name()).to.equal("KWATT");
    });
    it("tem símbolo KWATT", async () => {
      const { token } = await fixture();
      expect(await token.symbol()).to.equal("KWATT");
    });
    it("tem 18 decimais", async () => {
      const { token } = await fixture();
      expect(await token.decimals()).to.equal(18);
    });
  });

  describe("Constructor", function () {
    it("emite o supply inicial para o owner", async () => {
      const { token, owner } = await fixture();
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });
    it("reverte se initialOwner for zero address", async () => {
      const [, minter] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("KWATT");
      await expect(
        Factory.deploy(ZERO_ADDRESS, minter.address, INITIAL_SUPPLY)
      ).to.be.revertedWithCustomError(Factory, "ZeroAddress");
    });
    it("reverte se minter for zero address", async () => {
      const [owner] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("KWATT");
      await expect(
        Factory.deploy(owner.address, ZERO_ADDRESS, INITIAL_SUPPLY)
      ).to.be.revertedWithCustomError(Factory, "ZeroAddress");
    });
    it("reverte se initialSupply > MAX_SUPPLY", async () => {
      const [owner, minter] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("KWATT");
      const tooMuch = (1_000_000_001n) * ONE_ETHER;
      await expect(
        Factory.deploy(owner.address, minter.address, tooMuch)
      ).to.be.revertedWithCustomError(Factory, "MaxSupplyExceeded");
    });
  });

  describe("Roles", function () {
    it("owner tem DEFAULT_ADMIN_ROLE", async () => {
      const { token, owner } = await fixture();
      expect(await token.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.equal(true);
    });
    it("minter tem MINTER_ROLE", async () => {
      const { token, minter } = await fixture();
      expect(await token.hasRole(MINTER_ROLE, minter.address)).to.equal(true);
    });
    it("owner tem PAUSER_ROLE", async () => {
      const { token, owner } = await fixture();
      expect(await token.hasRole(PAUSER_ROLE, owner.address)).to.equal(true);
    });
  });

  describe("Mint", function () {
    it("minter pode mintar para qualquer endereço", async () => {
      const { token, minter, user1 } = await fixture();
      await expect(token.connect(minter).mint(user1.address, 1000n * ONE_ETHER))
        .to.emit(token, "TokensMinted");
      expect(await token.balanceOf(user1.address)).to.equal(1000n * ONE_ETHER);
    });
    it("não-minter não pode mintar (reverts com AccessControl)", async () => {
      const { token, user1, attacker } = await fixture();
      await expect(
        token.connect(attacker).mint(user1.address, 1n)
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });
    it("reverte ao mintar para zero address", async () => {
      const { token, minter } = await fixture();
      await expect(
        token.connect(minter).mint(ZERO_ADDRESS, 1n)
      ).to.be.revertedWithCustomError(token, "ZeroAddress");
    });
    it("reverte ao mintar amount=0", async () => {
      const { token, minter, user1 } = await fixture();
      await expect(
        token.connect(minter).mint(user1.address, 0n)
      ).to.be.revertedWithCustomError(token, "ZeroAmount");
    });
    it("reverte se ultrapassar MAX_SUPPLY", async () => {
      const { token, minter, user1 } = await fixture();
      // já tem INITIAL_SUPPLY minted. Tentar passar do cap.
      const remaining = await token.MAX_SUPPLY() - INITIAL_SUPPLY + 1n;
      await expect(
        token.connect(minter).mint(user1.address, remaining)
      ).to.be.revertedWithCustomError(token, "MaxSupplyExceeded");
    });
  });

  describe("Burn (ERC20Burnable)", function () {
    it("owner pode queimar próprios tokens", async () => {
      const { token, owner } = await fixture();
      await token.connect(owner).burn(100n * ONE_ETHER);
      expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - 100n * ONE_ETHER);
    });
    it("reduz totalSupply", async () => {
      const { token, owner } = await fixture();
      const before = await token.totalSupply();
      await token.connect(owner).burn(50n * ONE_ETHER);
      expect(await token.totalSupply()).to.equal(before - 50n * ONE_ETHER);
    });
  });

  describe("Transfer", function () {
    it("transfere normalmente", async () => {
      const { token, owner, user1 } = await fixture();
      await token.connect(owner).transfer(user1.address, 100n * ONE_ETHER);
      expect(await token.balanceOf(user1.address)).to.equal(100n * ONE_ETHER);
    });
    it("reverte quando paused", async () => {
      const { token, owner, user1 } = await fixture();
      await token.connect(owner).pause();
      await expect(
        token.connect(owner).transfer(user1.address, 1n)
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });
  });

  describe("Pause / Unpause", function () {
    it("pauser pode pausar e despausar", async () => {
      const { token, owner } = await fixture();
      await token.connect(owner).pause();
      expect(await token.paused()).to.equal(true);
      await token.connect(owner).unpause();
      expect(await token.paused()).to.equal(false);
    });
    it("não-pauser não pode pausar", async () => {
      const { token, attacker } = await fixture();
      await expect(
        token.connect(attacker).pause()
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Permit (EIP-2612)", function () {
    it("permite approve via signature (gasless)", async () => {
      const { token, owner, user1, user2 } = await fixture();
      const value = 100n * ONE_ETHER;
      const deadline = ethers.MaxUint256;
      const nonce = await token.nonces(owner.address);
      const domain = {
        name: await token.name(),
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await token.getAddress(),
      };
      const types = {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };
      const sig = await owner.signTypedData(domain, types, {
        owner: owner.address,
        spender: user1.address,
        value,
        nonce,
        deadline,
      });
      const { v, r, s } = ethers.Signature.from(sig);
      await token.permit(owner.address, user1.address, value, deadline, v, r, s);
      expect(await token.allowance(owner.address, user1.address)).to.equal(value);

      // user1 pode gastar
      await token.connect(user1).transferFrom(owner.address, user2.address, value);
      expect(await token.balanceOf(user2.address)).to.equal(value);
    });
  });

  describe("Votes (EIP-5805)", function () {
    it("delegate transfere poder de voto", async () => {
      const { token, owner, user1 } = await fixture();
      await token.connect(owner).delegate(user1.address);
      expect(await token.delegates(owner.address)).to.equal(user1.address);
      expect(await token.getVotes(user1.address)).to.equal(INITIAL_SUPPLY);
    });
    it("sem delegate, getVotes = 0", async () => {
      const { token, owner } = await fixture();
      expect(await token.getVotes(owner.address)).to.equal(0n);
    });
  });

  describe("Invariantes básicos", function () {
    it("soma de balances = totalSupply", async () => {
      const { token, owner, user1, user2, minter } = await fixture();
      await token.connect(owner).transfer(user1.address, 100n * ONE_ETHER);
      await token.connect(owner).transfer(user2.address, 50n * ONE_ETHER);
      await token.connect(minter).mint(user2.address, 10n * ONE_ETHER);
      const sum =
        (await token.balanceOf(owner.address)) +
        (await token.balanceOf(user1.address)) +
        (await token.balanceOf(user2.address));
      expect(sum).to.equal(await token.totalSupply());
    });
    it("totalSupply nunca excede MAX_SUPPLY", async () => {
      const { token, minter, user1 } = await fixture();
      // tenta explorar com várias mint até saturar
      const cap = await token.MAX_SUPPLY();
      const current = await token.totalSupply();
      const remaining = cap - current;
      if (remaining > 0n) {
        await token.connect(minter).mint(user1.address, remaining);
      }
      expect(await token.totalSupply()).to.be.lte(cap);
    });
  });
});
