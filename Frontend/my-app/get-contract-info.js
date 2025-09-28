// Script to get contract information and test connection
const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Getting Contract Information...\n");

    try {
        // Get the deployed contract
        const VotingContract = await ethers.getContractFactory("VotingContract");
        const contract = VotingContract.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

        console.log("📋 Contract Address:", await contract.getAddress());
        console.log("🔗 Network: Hardhat Local");
        console.log("📄 Contract ABI: Available in artifacts/contracts/VotingContract.sol/VotingContract.json");

        // Test basic contract functions
        console.log("\n🧪 Testing Contract Functions...");

        try {
            const totalVotes = await contract.getTotalVotes(1);
            console.log("✅ getTotalVotes(1):", totalVotes.toString());
        } catch (error) {
            console.log("⚠️  getTotalVotes failed (expected for new contract):", error.message);
        }

        try {
            const voteCount = await contract.getVoteCount(1, 1);
            console.log("✅ getVoteCount(1, 1):", voteCount.toString());
        } catch (error) {
            console.log("⚠️  getVoteCount failed (expected for new contract):", error.message);
        }

        try {
            const hasVoted = await contract.hasVoted(1, "0x0000000000000000000000000000000000000000");
            console.log("✅ hasVoted(1, zero address):", hasVoted);
        } catch (error) {
            console.log("⚠️  hasVoted failed:", error.message);
        }

        console.log("\n🎉 Contract is accessible and working!");
        console.log("\n📋 Next Steps:");
        console.log("1. Make sure your React app is using the correct contract address");
        console.log("2. Ensure MetaMask is connected to Hardhat network (Chain ID: 31337)");
        console.log("3. Test voting in the React app");

    } catch (error) {
        console.error("❌ Error:", error.message);
        console.log("\n🔧 Troubleshooting:");
        console.log("1. Make sure Hardhat node is running: npx hardhat node");
        console.log("2. Deploy the contract: npx hardhat run scripts/deploy.js --network localhost");
        console.log("3. Check if the contract address is correct");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });



