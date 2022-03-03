const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Terraforms", function () {
  let factory, 
    augmentationsContract,
    perlinNoiseContract, 
    charactersContract,
    svgContract,
    terraformsDataContract;

  beforeEach(async function () {
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
    // TODO: find it

    // Deploy TerraformsData Contract
    factory = await ethers.getContractFactory("TerraformsData");
    terraformsDataContract = await factory.deploy(
      svgContract.address,
      perlinNoiseContract.address,
      augmentationsContract.address, // Should be zonesContract which I haven't found yet
      charactersContract.address
    );
    expect(terraformsDataContract.address).not.null;

    // // Deploy Terraform Contract
    factory = await ethers.getContractFactory("Terraforms");

    [owner, user1, user2, user3, user4, ...users] = await ethers.getSigners();

    terraformContract = await factory.deploy(
      terraformsDataContract.address,
      augmentationsContract.address
    );

    expect(terraformContract.address).not.null;
  });

  it("Should evolve over time", async function () {
    // 
  });
});
