const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Terraforms", function () {
  let factory, 
    augmentationsContract,
    perlinNoiseContract, 
    zonesContract,
    charactersContract,
    svgContract,
    terraformsDataContract,
    terraformsContract,
    terraformsAlteredContract;

  it("Should compile contracts", async function () {
    await network.provider.send("evm_increaseTime", [0]);

    // Deploy Augmentations Contract
    factory = await ethers.getContractFactory("TerraformsAugmentations");
    augmentationsContract = await factory.deploy();
    expect(augmentationsContract.address).not.null;

    // Deploy Characters Contract
    factory = await ethers.getContractFactory("TerraformsCharacters");
    charactersContract = await factory.deploy();
    expect(charactersContract.address).not.null;

    // Deploy TerraformsSVG Contract
    factory = await ethers.getContractFactory("TerraformsSVG");
    svgContract = await factory.deploy(charactersContract.address);
    expect(svgContract.address).not.null;

    // Deploy PerlinNoise Contract
    factory = await ethers.getContractFactory("PerlinNoise");
    perlinNoiseContract = await factory.deploy();
    expect(perlinNoiseContract.address).not.null;

    // Deploy Zones Contract
    factory = await ethers.getContractFactory("TerraformsZones");
    zonesContract = await factory.deploy();
    expect(zonesContract.address).not.null;

    // Deploy TerraformsData Contract
    factory = await ethers.getContractFactory("TerraformsData");
    terraformsDataContract = await factory.deploy(
      svgContract.address,
      perlinNoiseContract.address,
      zonesContract.address,
      charactersContract.address
    );
    expect(terraformsDataContract.address).not.null;

    // Deploy Terraforms Contract
    factory = await ethers.getContractFactory("Terraforms");

    [owner, user1, user2, user3, user4, ...users] = await ethers.getSigners();

    terraformsContract = await factory.deploy(
      terraformsDataContract.address,
      augmentationsContract.address
    );

    expect(terraformsContract.address).not.null;

    // Deploy Terraforms Altered Contract
    factory = await ethers.getContractFactory("TerraformsAltered");

    [owner, user1, user2, user3, user4, ...users] = await ethers.getSigners();

    terraformsAlteredContract = await factory.deploy(
      terraformsDataContract.address,
      augmentationsContract.address
    );

    expect(terraformsAlteredContract.address).not.null;
  });
});
