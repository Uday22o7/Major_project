// Simple test script to verify blockchain integration
const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Blockchain Voting Integration...\n");

    // Get the deployed contract
    const VotingContract = await ethers.getContractFactory("VotingContract");
    const contract = VotingContract.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

    console.log("📋 Contract Address:", await contract.getAddress());
    console.log("🔗 Network: Hardhat Local");

    // Test data
    const testElectionId = 1;
    const testCandidateId = 1;
    const [owner, voter1, voter2] = await ethers.getSigners();

    console.log("\n👤 Test Accounts:");
    console.log("Owner:", await owner.getAddress());
    console.log("Voter 1:", await voter1.getAddress());
    console.log("Voter 2:", await voter2.getAddress());

    try {
        // Test 1: Cast a vote
        console.log("\n🗳️  Test 1: Casting vote...");
        const tx1 = await contract.connect(voter1).vote(testElectionId, testCandidateId, await voter1.getAddress());
        await tx1.wait();
        console.log("✅ Vote cast successfully!");

        // Test 2: Check vote count
        console.log("\n📊 Test 2: Checking vote count...");
        const voteCount = await contract.getVoteCount(testElectionId, testCandidateId);
        console.log("Vote count for candidate", testCandidateId, ":", voteCount.toString());

        // Test 3: Check if voter has voted
        console.log("\n🔍 Test 3: Checking if voter has voted...");
        const hasVoted = await contract.hasVotedInElection(testElectionId, await voter1.getAddress());
        console.log("Has voter1 voted?", hasVoted);

        // Test 4: Try to vote again (should fail)
        console.log("\n🚫 Test 4: Trying to vote again (should fail)...");
        try {
            await contract.connect(voter1).vote(testElectionId, testCandidateId, await voter1.getAddress());
            console.log("❌ Error: Should not be able to vote twice!");
        } catch (error) {
            console.log("✅ Correctly prevented duplicate voting:", error.message);
        }

        // Test 5: Another voter votes
        console.log("\n🗳️  Test 5: Another voter casting vote...");
        const tx2 = await contract.connect(voter2).vote(testElectionId, testCandidateId, await voter2.getAddress());
        await tx2.wait();
        console.log("✅ Second vote cast successfully!");

        // Final vote count
        const finalVoteCount = await contract.getVoteCount(testElectionId, testCandidateId);
        console.log("\n📈 Final vote count for candidate", testCandidateId, ":", finalVoteCount.toString());

        console.log("\n🎉 All tests passed! Blockchain voting is working correctly!");
        console.log("\n📋 Next Steps:");
        console.log("1. Start your React app: npm start");
        console.log("2. Connect MetaMask to Hardhat network (Chain ID: 31337)");
        console.log("3. Import test accounts into MetaMask");
        console.log("4. Test the voting interface!");

    } catch (error) {
        console.error("❌ Test failed:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });







