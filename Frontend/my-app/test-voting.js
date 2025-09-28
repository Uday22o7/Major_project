// Test script to verify voting functionality
const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Voting Functionality...\n");

    try {
        // Get the deployed contract
        const VotingContract = await ethers.getContractFactory("VotingContract");
        const contract = VotingContract.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

        console.log("📋 Contract Address:", await contract.getAddress());

        // Get test accounts
        const [owner, voter1, voter2] = await ethers.getSigners();
        console.log("👤 Test Accounts:");
        console.log("Owner:", await owner.getAddress());
        console.log("Voter 1:", await voter1.getAddress());
        console.log("Voter 2:", await voter2.getAddress());

        const testElectionId = 1;
        const testCandidateId = 1;

        console.log("\n🗳️  Testing Vote Function...");

        // Test 1: Cast a vote
        console.log("Test 1: Casting vote...");
        try {
            const tx1 = await contract.connect(voter1).vote(testElectionId, testCandidateId, await voter1.getAddress());
            await tx1.wait();
            console.log("✅ Vote cast successfully! Transaction:", tx1.hash);
        } catch (error) {
            console.log("❌ Vote failed:", error.message);
        }

        // Test 2: Check vote count
        console.log("\nTest 2: Checking vote count...");
        try {
            const voteCount = await contract.getVoteCount(testElectionId, testCandidateId);
            console.log("✅ Vote count for candidate", testCandidateId, ":", voteCount.toString());
        } catch (error) {
            console.log("❌ Get vote count failed:", error.message);
        }

        // Test 3: Check if voter has voted
        console.log("\nTest 3: Checking if voter has voted...");
        try {
            const hasVoted = await contract.hasVotedInElection(testElectionId, await voter1.getAddress());
            console.log("✅ Has voter1 voted?", hasVoted);
        } catch (error) {
            console.log("❌ Check voted status failed:", error.message);
        }

        // Test 4: Try to vote again (should fail)
        console.log("\nTest 4: Trying to vote again (should fail)...");
        try {
            await contract.connect(voter1).vote(testElectionId, testCandidateId, await voter1.getAddress());
            console.log("❌ Error: Should not be able to vote twice!");
        } catch (error) {
            console.log("✅ Correctly prevented duplicate voting:", error.message);
        }

        // Test 5: Another voter votes
        console.log("\nTest 5: Another voter casting vote...");
        try {
            const tx2 = await contract.connect(voter2).vote(testElectionId, testCandidateId, await voter2.getAddress());
            await tx2.wait();
            console.log("✅ Second vote cast successfully! Transaction:", tx2.hash);
        } catch (error) {
            console.log("❌ Second vote failed:", error.message);
        }

        // Final vote count
        console.log("\nTest 6: Final vote count...");
        try {
            const finalVoteCount = await contract.getVoteCount(testElectionId, testCandidateId);
            console.log("✅ Final vote count for candidate", testCandidateId, ":", finalVoteCount.toString());
        } catch (error) {
            console.log("❌ Final vote count failed:", error.message);
        }

        console.log("\n🎉 Voting tests completed!");
        console.log("\n📋 Next Steps:");
        console.log("1. Start your React app: npm start");
        console.log("2. Connect MetaMask to Hardhat network (Chain ID: 31337)");
        console.log("3. Import test accounts into MetaMask");
        console.log("4. Test the voting interface!");

    } catch (error) {
        console.error("❌ Test failed:", error.message);
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



