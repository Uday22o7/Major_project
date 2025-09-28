import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Candidates.css';
import vote from '../Assests/online-voting.png';
import { Link } from 'react-router-dom';
import { useTheme } from '../../Context/ThemeContext';
const BASE_URL = process.env.REACT_APP_BASE_URL;

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/candidates`);
        setCandidates(response.data.data);
        setFilteredCandidates(response.data.data); // Initialize with all candidates
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Search bar filter
  useEffect(() => {
    setFilteredCandidates(
      candidates.filter((candidate) =>
      (candidate.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
  }, [searchTerm, candidates]);

  if (loading)
    return (
      <p className="err-load">
        <i className="fas fa-spinner"></i>
        Loading...
      </p>
    );

  if (error) return <p>Error: {error}</p>;

  return (
    <div className={`candidates-container ${theme}`}>
      <h1 className={`candidates-title ${theme}`}>All Politicians</h1>

      <div className={`search-container ${theme}`}>
        <input
          type="text"
          className={`candidates-search-input ${theme}`}
          placeholder="Search for a politician..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCandidates.length > 0 ? (
        <div className={`candidates-grid ${theme}`}>
          {filteredCandidates.map(candidate => {
            if (!candidate.user) return null; // Skip candidates without a user

            return (
              <div key={candidate._id} className={`candidate-card ${theme}`}>
                <Link to={`/candidate/${candidate.user._id}`}>
                  <div className="candidate-image">
                    <img
                      src={candidate.user.profilePhoto || '/default-avatar.png'}
                      alt={`${candidate.user.firstName}'s profile`}
                      onError={(e) => {
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  </div>
                  <div className="candidate-info">
                    <h3 className="candidate-name">
                      {candidate.user.firstName} {candidate.user.lastName}
                    </h3>
                    <div className="candidate-details">
                      <div className="detail-row">
                        <span className="detail-label">City:</span>
                        <span className="detail-value">{candidate.user.city || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">District:</span>
                        <span className="detail-value">{candidate.user.district || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Skills:</span>
                        <span className="detail-value">{candidate.skills?.join(', ') || 'N/A'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Party:</span>
                        <span className="detail-value">{candidate.party?.name || 'Independent'}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`status-badge ${candidate.isVerified ? 'verified' : 'pending'}`}>
                          {candidate.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-candidates">
          <i className="fas fa-user-slash"></i>
          <p>No Politicians Found</p>
        </div>
      )}
    </div>
  );
};

export default Candidates;
