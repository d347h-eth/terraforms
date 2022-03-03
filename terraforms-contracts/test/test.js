const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Terraforms", function () {
  let PerlinNoiseFactory,
    perlinNoiseContract, 
    TerraformContractFactory, 
    terraformContract, 
    TerraformsDataFactory, 
    terraformsDataContract;

  beforeEach(async function () {
    // Deploy PerlinNoise Contract
    PerlinNoiseFactory = await ethers.getContractFactory("PerlinNoise");
    perlinNoiseContract = await PerlinNoiseFactory.deploy();
    expect(perlinNoiseContract.address).not.null;

    // Deploy TerraformsData Contract
    TerraformsDataFactory = await ethers.getContractFactory("TerraformsData");
    terraformsDataContract = await TerraformsDataFactory.deploy(
      // _terraformsSVGAddress
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

  it("Should return the new greeting once it's changed", async function () {


    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
