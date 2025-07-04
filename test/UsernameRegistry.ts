import { expect } from "chai";
import { ethers } from "hardhat";

describe("UsernameRegistry", function () {
  let registry: any;
  let owner: any;
  let addr1: any;
  let addr2: any;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory("UsernameRegistry");
    registry = await Registry.deploy();
    // await registry.deployed(); // Hardhat v2.18+ 不再需要
  });

  it("should allow a user to register a username", async function () {
    await expect(registry.connect(addr1).register("alice"))
      .to.emit(registry, "Registered")
      .withArgs(addr1.address, "alice");
    expect(await registry.getUsername(addr1.address)).to.equal("alice");
    expect(await registry.myUsername()).to.equal(""); // owner未注册
    expect(await registry.connect(addr1).myUsername()).to.equal("alice");
  });

  it("should not allow double registration from the same address", async function () {
    await registry.connect(addr1).register("alice");
    await expect(registry.connect(addr1).register("bob")).to.be.revertedWith("Already registered");
  });

  it("should not allow empty username", async function () {
    await expect(registry.connect(addr1).register("")).to.be.revertedWith("Username cannot be empty");
  });

  it("should return empty string for unregistered address", async function () {
    expect(await registry.getUsername(addr2.address)).to.equal("");
  });
}); 