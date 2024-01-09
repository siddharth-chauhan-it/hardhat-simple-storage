// imports
const { ethers, run, network } = require("hardhat");

// async main
async function main() {
  /********************* Deployment of contract *********************/
  const SimpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
  console.log("------------------Deploying Contract------------------");
  const simpleStorage = await SimpleStorageFactory.deploy();
  await simpleStorage.waitForDeployment();
  const contractAddress = await simpleStorage.getAddress();
  console.log(`Deployed contract to: ${contractAddress}`);

  /********************* Verification of contract *********************/
  if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
    console.log("------------------Waiting for 6 blocks to be mined------------------");
    await simpleStorage.deploymentTransaction().wait(6); // Wait for 6 block before verifying
    await verify(contractAddress, []);
  }

  /********************* Interacting with contract *********************/
  // Read the current value
  const currentValue = await simpleStorage.retrieve();
  console.log(`Current value: ${currentValue}`);
  // Update the current value
  const transactionResponseForStore = await simpleStorage.store(7);
  const transactionReceiptForStore = await transactionResponseForStore.wait(1);
  const updatedValue = await simpleStorage.retrieve();
  console.log(`Updated value: ${updatedValue}`);
}

// verify
async function verify(contractAddress, args) {
  console.log("------------------Verifying Contract------------------");
  try {
    // run([task]:[subtask], {parameters})
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
}

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
