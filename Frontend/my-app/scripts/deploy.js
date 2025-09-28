const hre = require("hardhat");

async function main() {
    // Get the contract factory
    const VotingContract = await hre.ethers.getContractFactory("VotingContract");

    // Deploy the contract
    const votingContract = await VotingContract.deploy();

    // Wait for deployment to finish
    await votingContract.waitForDeployment();

    const contractAddress = await votingContract.getAddress();
    console.log("VotingContract deployed to:", contractAddress);

    // Save the contract address to a file
    const fs = require('fs');
    const contractInfo = {
        address: contractAddress,
        network: hre.network.name,
        timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
        'contract-info.json',
        JSON.stringify(contractInfo, null, 2)
    );

    console.log("Contract info saved to contract-info.json");
    console.log("✅ Contract deployed successfully!");
    console.log("📋 Next steps:");
    console.log("1. Copy the contract address above");
    console.log("2. Update src/services/blockchainService.js with the new address");
    console.log("3. Start your React app and test the voting");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });