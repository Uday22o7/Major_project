import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ElectionDetailes.css';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import vote from '../Assests/online-voting.png';
import { useTheme } from '../../Context/ThemeContext';
import MetaMaskConnection from '../MetaMaskConnection/MetaMaskConnection';
import blockchainService from '../../services/blockchainService';
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:3000';

const ElectionDetails = () => {
  const { theme } = useTheme();
  const { id } = useParams(); // Get the election ID from the URL
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [votedCandidateId, setVotedCandidateId] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        setLoading(true);
        // Fetch election details
        const electionResponse = await axios.get(`${BASE_URL}/api/v1/elections/election/${id}`);

        if (!electionResponse.data.success) {
          throw new Error('Failed to fetch election data');
        }

        const electionData = electionResponse.data.data;
        setElection(electionData);

        // Fetch candidates for this election
        const candidatesResponse = await axios.get(`${BASE_URL}/api/v1/elections/${id}/candidates`);

        if (candidatesResponse.data.success) {
          setCandidates(candidatesResponse.data.data);
        } else {
          setCandidates([]);
        }

        // Check if the user has already voted
        const userId = localStorage.getItem('user-id');
        if (electionData.results && electionData.results.voteDistribution) {
          const votedCandidate = electionData.results.voteDistribution.find(candidate =>
            candidate.voters.includes(userId)
          );
          if (votedCandidate) {
            setVotedCandidateId(votedCandidate.candidateId);
          }
        }
      } catch (err) {
        console.error('Error fetching election data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();
  }, [id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (election) {
        const now = new Date();
        const startTime = new Date(election.startTime);
        const endTime = new Date(election.endTime);
        let timeLeft = startTime - now;

        if (timeLeft > 0) {
          const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else if (now >= startTime && now <= endTime) {
          setCountdown('Election has started!');
        } else {
          setCountdown('Election has ended!');
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [election]);

  if (loading) return (
    <div className={`election-details-container ${theme}`}>
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading election details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={`election-details-container ${theme}`}>
      <div className="error-container">
        <p>Error: {error}</p>
      </div>
    </div>
  );

  if (!election) return (
    <div className={`election-details-container ${theme}`}>
      <div className="error-container">
        <p>No election details found.</p>
      </div>
    </div>
  );

  const handleRowClick = (candidateId) => {
    navigate(`/candidate/${candidateId}`);
  };

  const handleWalletConnected = (address) => {
    setWalletConnected(true);
    setWalletAddress(address);
  };

  const handleWalletDisconnected = () => {
    setWalletConnected(false);
    setWalletAddress('');
  };

  const handleVote = async (candidate, candidateId) => {
    if (isVoting) return;
    const now = new Date();
    const startTime = new Date(election.startTime);
    const endTime = new Date(election.endTime);

    if (now < startTime) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Voting has not started yet!'
      });
      return;
    }

    if (now > endTime) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Voting has ended!'
      });
      return;
    }

    // Check user age from localStorage (if available)
    const userAge = localStorage.getItem('user-age');
    if (userAge && parseInt(userAge) < 18) {
      Swal.fire({
        icon: 'error',
        title: 'Age Restriction',
        text: 'You must be at least 18 years old to vote!'
      });
      return;
    }

    // Check if user is approved for voting
    const userApproved = localStorage.getItem('user-approved');
    if (userApproved === 'false' || userApproved === null) {
      Swal.fire({
        icon: 'error',
        title: 'Approval Required',
        text: 'Your account needs to be approved by an administrator before you can vote!'
      });
      return;
    }

    // Check if user location matches election location
    const userLocation = localStorage.getItem('user-location');
    if (userLocation && userLocation.toLowerCase() !== election.where.toLowerCase()) {
      Swal.fire({
        icon: 'error',
        title: 'Location Mismatch',
        text: `You can only vote in elections for your registered location (${userLocation}). This election is for ${election.where}.`
      });
      return;
    }

    if (votedCandidateId) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'You have already voted in this election!'
      });
      return;
    }

    if (!candidate.isVerified) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'This candidate is not a verified Candidate!'
      });
      return;
    }

    // Check if wallet is connected
    if (!walletConnected) {
      Swal.fire({
        icon: 'warning',
        title: 'Wallet Required',
        text: 'Please connect your MetaMask wallet to vote.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const token = localStorage.getItem('auth-token');
    const userId = localStorage.getItem('user-id');

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'You need to be logged in to vote'
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to change your vote! This will create a blockchain transaction.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, vote on blockchain!'
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        setIsVoting(true);
        console.log('Starting vote process...', { electionId: election._id, candidateId, walletAddress });

        // Show loading for blockchain transaction
        Swal.fire({
          title: 'Processing Vote...',
          text: 'Please confirm the transaction in MetaMask',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Cast vote on blockchain
        console.log('Calling blockchainService.castVote...');
        const blockchainResult = await blockchainService.castVote(
          election._id,
          candidateId,
          walletAddress
        );
        console.log('Blockchain result:', blockchainResult);

        if (!blockchainResult.success) {
          throw new Error(blockchainResult.error);
        }

        // Submit vote to backend
        console.log('Submitting to backend...', `${BASE_URL}/api/v1/elections/${election._id}/vote/${candidateId}`);
        await axios.post(
          `${BASE_URL}/api/v1/elections/${election._id}/vote/${candidateId}`,
          {
            voterId: userId,
            electionId: election._id,
            blockchainTxHash: blockchainResult.transactionHash
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Backend submission successful');

        setVotedCandidateId(candidateId);
        Swal.fire({
          icon: 'success',
          title: 'Vote Recorded!',
          text: `Your vote has been recorded on blockchain. Transaction: ${blockchainResult.transactionHash}`,
          confirmButtonText: 'OK'
        });
      } catch (error) {
        console.error('Error voting:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        Swal.fire({
          icon: 'error',
          title: 'Voting Failed',
          text: error.response?.data?.message || error.message || 'There was a problem submitting your vote.',
          confirmButtonText: 'OK'
        });
      } finally {
        setIsVoting(false);
      }
    });
  };

  return (
    <div className={`election-details-container ${theme}`}>
      <h2 className={`election-title ${theme}`}>{election.name}</h2>
      <h4 className="election-date">{new Date(election.date).toLocaleDateString()}</h4>
      <p className={`election-description ${theme}`}><b>Location: </b>{election.where}</p>
      {(() => {
        const userLocation = localStorage.getItem('user-location');
        if (userLocation) {
          const canVote = userLocation.toLowerCase() === election.where.toLowerCase();
          return (
            <div className={`location-validation ${canVote ? 'valid' : 'invalid'}`}>
              {canVote ? (
                <p className="valid-location">✅ You can vote in this election (Location matches)</p>
              ) : (
                <p className="invalid-location">❌ You cannot vote in this election (Location mismatch: {userLocation} vs {election.where})</p>
              )}
            </div>
          );
        }
        return null;
      })()}
      <p className={`election-description ${theme}`}><b>Starts at: </b>{new Date(election.startTime).toLocaleString()}</p>
      <p className={`election-description ${theme}`}><b>Ends at: </b>{new Date(election.endTime).toLocaleString()}</p>
      <p className={`election-description ${theme}`}><b>Description: </b><br />{election.description}</p>
      <p className={`election-description ${theme}`}><b>Rules: </b><br />{election.rules}</p>
      <p><strong>Countdown:</strong> {countdown}</p>

      <div className="blockchain-voting-section">
        <h3 className={`blockchain-title ${theme}`}>🔗 Blockchain Voting</h3>
        <p className={`blockchain-description ${theme}`}>
          Your vote will be recorded on the blockchain for maximum transparency and security.
        </p>
        <MetaMaskConnection
          onWalletConnected={handleWalletConnected}
          onWalletDisconnected={handleWalletDisconnected}
        />
      </div>

      <h3 className={`candidates-title ${theme}`}>Candidates</h3>
      {candidates.length > 0 ? (
        <table className={`candidates-table ${theme}`}>
          <thead>
            <tr>
              <th>#</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Vote</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate, index) => (
              <tr key={candidate._id} style={{ cursor: 'pointer' }}>
                <td onClick={() => handleRowClick(candidate.user._id)}>{index + 1}</td>
                <td onClick={() => handleRowClick(candidate.user._id)}>
                  <img
                    className='profile'
                    src={candidate.user.profilePhoto || '/default-avatar.png'}
                    alt={candidate.user.firstName}
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                </td>
                <td onClick={() => handleRowClick(candidate.user._id)}>
                  {candidate.user.firstName} {candidate.user.lastName}
                </td>
                <td>
                  <div className="voteee" onClick={(e) => { e.stopPropagation(); handleVote(candidate, candidate._id); }}>
                    <img src={vote} alt="Vote" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="no-candidates">
          <p>No candidates have applied for this election yet.</p>
        </div>
      )}
    </div>
  );
};

export default ElectionDetails;
