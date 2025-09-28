import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CandidateProfile.css';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

const CandidateProfile = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidateProfile();
  }, [id]);

  const fetchCandidateProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/v1/candidates/profile/${id}`);
      setCandidate(response.data.data);
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this candidate? This action cannot be undone.')) {
      try {
        await axios.delete(`${BASE_URL}/api/v1/candidates/${id}`);
        alert('Candidate deleted successfully!');
        navigate('/candidates');
      } catch (error) {
        console.error('Error deleting candidate:', error);
        alert('Failed to delete candidate. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="candidate-profile-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading candidate profile...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="candidate-profile-container">
        <div className="error-container">
          <p>Candidate not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-profile-container">
      <h1 className='adcanproh1'>Candidate Profile</h1>

      <div className="profile-details">
        <div className="info-card">
          <h2>{candidate.user?.firstName} {candidate.user?.lastName}</h2>

          <div className="info-grid">
            <div className="info-item">
              <label>Email:</label>
              <span>{candidate.user?.email || 'Not provided'}</span>
            </div>

            <div className="info-item">
              <label>Phone:</label>
              <span>{candidate.user?.phone || 'Not provided'}</span>
            </div>

            <div className="info-item">
              <label>Political Party:</label>
              <span>{candidate.party?.name || 'No Party'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button onClick={handleDelete} className="delete-button">
          Delete Candidate
        </button>
        <button onClick={() => navigate('/candidates')} className="back-button">
          Back to Candidates
        </button>
      </div>
    </div>
  );
};

export default CandidateProfile;
