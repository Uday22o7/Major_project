import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CandidateReview.css';
import axios from 'axios';
import Review from '../Review/Review'
const BASE_URL = import.meta.env.VITE_BASE_URL;

const CandidateReview = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/v1/candidates`);
      if (response.data.success) {
        setCandidates(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (id) => {
    navigate(`/candidate-profile/${id}`);
  };

  if (loading) {
    return (
      <>
        <Review />
        <div className="candidate-review-container">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading candidates...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Review />
      <div className="candidate-review-container">
        <h1 className='headcndt'>All Candidates</h1>

        {candidates.length > 0 ? (
          <table className="candidate-table">
            <thead>
              <tr>
                <th>Candidate Name</th>
                <th>Political Party</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr key={candidate._id} onClick={() => handleRowClick(candidate._id)}>
                  <td className="candidate-name">
                    {candidate.user?.firstName} {candidate.user?.lastName}
                  </td>
                  <td className="candidate-party">
                    {candidate.party?.name || 'No Party'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-candidates">
            <p>No candidates found.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default CandidateReview;
