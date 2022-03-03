const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Terraforms", function () {
  let factory, 
    perlinNoiseContract, 
    charactersContract,
    svgContract,
    terraformsDataContract;

  beforeEach(async function () {
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
      // _terraformsZonesAddress 
      // _terraformsCharsAddress
    );
    expect(terraformsDataContract.address).not.null;

    // // Deploy Terraform Contract
    // TerraformContractFactory = await ethers.getContractFactory("Terraforms");

    // [owner, addr1, addr2, addr3, addr4, ...addrs] = await ethers.getSigners();

    // terraformContract = await TerraformContractFactory.deploy(
    //   address _terraformsDataAddress, 
    //   address _terraformsAugmentationsAddress
    // );

    // expect(terraformContract.address).not.null;
  });

  it("Should evolve over time", async function () {
    // 
  });
});
