// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title ChainVote - Multiple votes per election (no per-wallet restriction)
contract VotingContract {
    struct Vote {
        uint256 electionId;
        uint256 candidateId;
        address voter;
        uint256 timestamp;
    }

    // Votes per candidate in each election
    mapping(uint256 => mapping(uint256 => uint256)) public voteCounts; // electionId => (candidateId => count)

    // Optional: store vote receipts for auditing/analytics
    mapping(uint256 => Vote[]) public votes; // electionId => Vote[]

    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId, address indexed voter);

    /// @notice Cast a vote for a candidate within a specific election
    function vote(uint256 _electionId, uint256 _candidateId, address _voter) public {
        require(_voter != address(0), "Invalid voter address");
        require(_candidateId > 0, "Invalid candidate ID");

        voteCounts[_electionId][_candidateId]++;

        votes[_electionId].push(Vote({
            electionId: _electionId,
            candidateId: _candidateId,
            voter: _voter,
            timestamp: block.timestamp
        }));

        emit VoteCast(_electionId, _candidateId, _voter);
    }

    // Note: per-wallet voting restriction intentionally removed as requested

    /// @notice Get total votes for a candidate within an election
    function getVoteCount(uint256 _electionId, uint256 _candidateId) public view returns (uint256) {
        return voteCounts[_electionId][_candidateId];
    }

    /// @notice Get total number of votes cast in an election (sum across candidates)
    function getTotalVotes(uint256 _electionId) public view returns (uint256) {
        return votes[_electionId].length;
    }

    /// @notice Return all vote receipts recorded on-chain for an election
    function getVotesForElection(uint256 _electionId) public view returns (Vote[] memory) {
        return votes[_electionId];
    }
}
