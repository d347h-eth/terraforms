require("@nomiclabs/hardhat-waffle");
const fs = require('fs');

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts")
  .setAction(async (args, hre) => {
    const accounts = await hre.hre.ethers.getSigners();

    for (const account of accounts) {
      console.log(account.address);
    }
  });

task("deploy", "Compiles and deploys all contracts")
  .setAction(async (args, hre) => {
    const network = hre.network;
    const ethers = hre.ethers;
    // Make sure everything's up-to-date
    await hre.run('compile');
    
    let factory;

    // Deploy contracts
    await network.provider.send("evm_increaseTime", [0]);

    // Deploy Augmentations Contract
    factory = await ethers.getContractFactory("TerraformsAugmentations");
    const augmentationsContract = await factory.deploy();
    console.log("TerraformsAugmentations deployed to:", augmentationsContract.address);

    // Deploy Characters Contract
    factory = await ethers.getContractFactory("TerraformsCharacters");
    const charactersContract = await factory.deploy();
    console.log("TerraformsCharacters deployed to:", charactersContract.address);

    // Deploy TerraformsSVG Contract
    factory = await ethers.getContractFactory("TerraformsSVG");
    const svgContract = await factory.deploy(charactersContract.address);
    console.log("TerraformsSVG deployed to:", svgContract.address);

    // Deploy PerlinNoise Contract
    factory = await ethers.getContractFactory("PerlinNoise");
    const perlinNoiseContract = await factory.deploy();
    console.log("PerlinNoise deployed to:", perlinNoiseContract.address);

    // Deploy Zones Contract
    factory = await ethers.getContractFactory("TerraformsZones");
    const zonesContract = await factory.deploy();
    console.log("TerraformsZones deployed to:", zonesContract.address);

    // Deploy TerraformsData Contract
    factory = await ethers.getContractFactory("TerraformsData");
    const terraformsDataContract = await factory.deploy(
      svgContract.address,
      perlinNoiseContract.address,
      zonesContract.address,
      charactersContract.address
    );
    console.log("TerraformsData deployed to:", terraformsDataContract.address);

    // Deploy Terraforms Contract
    factory = await ethers.getContractFactory("Terraforms");

    const terraformsContract = await factory.deploy(
      terraformsDataContract.address,
      augmentationsContract.address
    );

    console.log("Terraforms deployed to:", terraformsContract.address);

    // Deploy Terraforms Altered Contract
    factory = await ethers.getContractFactory("TerraformsAltered");

    [owner, ...users] = await ethers.getSigners();

    const terraformsAlteredContract = await factory.deploy(
      terraformsDataContract.address,
      augmentationsContract.address
    );

    console.log("TerraformsAltered deployed to:", terraformsAlteredContract.address);

    return {
      augmentationsContract,
      charactersContract,
      svgContract,
      perlinNoiseContract,
      zonesContract,
      terraformsDataContract,
      terraformsContract,
      terraformsAlteredContract,
    }
  });

task("mint", "Mints all supply")
  .addOptionalParam("supply", "Supply target for minting", "11104")
  .setAction(async (args, hre) => {
    const contracts = await hre.run('deploy');
    const supply = parseInt(args.supply);

    let amount = Math.ceil(supply / users.length);
    let minted = 0;

    for (let user of users) {
      if (supply == minted) {
        break;
      } 
      
      if ((minted + amount) >= supply) {
        amount = supply - minted
      }

      tx = await contracts.terraformsAlteredContract
        .connect(user)
        .mint(amount, { value: ethers.utils.parseEther("1600") });
      await tx.wait();

      minted += amount;

      console.log(`Minting progress: ${minted}/${supply}`);
    }

    console.log(`Minted ${minted} Terraforms`);

    return { supply: minted, ...contracts };
  });

task("snapshot", "Builds the castle and let it decay")
  .addOptionalParam("supply", "Supply target for minting", "11104")
  .addOptionalParam("years", "Amount of years", "1000")
  .addOptionalParam("interval", "Interval between snapshots in years", "1")
  .setAction(async (args, hre) => {
    const contracts = await hre.run('mint', { supply: args.supply });

    const DAY = 24 * 60 * 60;
    const YEAR = 365 * DAY;

    let time = 0;

    const timeTravel = async (seconds) => {
      // Update EVM clock
      await network.provider.send("evm_increaseTime", [seconds]);
      // Mine a new block
      await network.provider.send("evm_mine");
      // Update time so we can revert it later
      time = time + seconds; 
    }
    
    // GENESIS
    await timeTravel(7 * DAY);

    tx = await contracts.terraformsAlteredContract.connect(owner).setSeed();
    receipt = await tx.wait();

    console.log("Seed:", (await contracts.terraformsAlteredContract.seed()).toString());

    if (fs.existsSync(`./snapshot`)) {
      fs.rmSync(`./snapshot`, { recursive: true, force: true });
    }

    fs.mkdirSync(`./snapshot`);

    const sample = async (tokenId, year) => {
      if (!fs.existsSync(`./snapshot/${year}`)) {
        fs.mkdirSync(`./snapshot/${year}`);
      }
    
      fs.writeFileSync(
        `./snapshot/${year}/${tokenId}.html`,
        await contracts.terraformsAlteredContract.tokenHTML(tokenId)
      );
      
      let tokenUri = await contracts.terraformsAlteredContract.tokenURI(tokenId);
      let metadata = JSON.parse(
        Buffer.from(tokenUri.replace('data:application/json;base64,', ''), 'base64').toString(
          'ascii',
        ),
      );

      fs.writeFileSync(
        `./snapshot/${year}/${tokenId}.json`,
        JSON.stringify(metadata)
      );
    }

    let y = 0;

    const years = parseInt(args.years);
    const supply = parseInt(args.supply);
    const interval = parseInt(args.interval);

    while (y <= years) {
      for (let i = 1; i <= supply; i++) {
        console.log(`Sampling token #${i} at year ${y}`);
        await sample(i, y);
      }

      y += interval;
      await timeTravel(interval * YEAR);
    }
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: false,
        runs: 800,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
      allowUnlimitedContractSize: true,
      gas: 1_000_000_000_000,
      blockGasLimit: 1_000_000_000_000,
      timeout: 0
    },
  },
  mocha: {
    timeout: 0
  }
};
