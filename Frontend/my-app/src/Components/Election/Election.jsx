import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { FaArrowUp } from 'react-icons/fa';
import './Election.css';
import { useTheme } from '../../Context/ThemeContext';
const BASE_URL = process.env.REACT_APP_BASE_URL;

const Election = () => {
  const { theme } = useTheme();
  const [elections, setElections] = useState([]);
  const [countdowns, setCountdowns] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user information from localStorage
    const storedUserId = localStorage.getItem('user-id');
    const storedUserRole = localStorage.getItem('user-role');
    const storedIsCandidate = localStorage.getItem('user-isCandidate');

    setUserId(storedUserId);
    setUserRole(storedUserRole || (storedIsCandidate === 'true' ? 'candidate' : 'voter'));
  }, []);

  const fetchElectionData = async () => {
    try {
      setLoading(true);
      // Fetch all elections from the main elections endpoint
      const response = await axios.get(`${BASE_URL}/api/v1/elections`);
      if (response.data.success) {
        setElections(response.data.data);
      } else {
        setError('Failed to fetch elections');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElectionData();

    // Scroll event to toggle the visibility of the Scroll to Top button
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateCountdowns = (electionList) => {
    const newCountdowns = {};
    electionList.forEach(election => {
      const now = new Date();
      const startTime = new Date(election.startTime);
      const endTime = new Date(election.endTime);

      if (now < startTime) {
        const timeLeft = startTime - now;
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        newCountdowns[election._id] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else if (now >= startTime && now <= endTime) {
        newCountdowns[election._id] = 'Election has started!';
      } else {
        newCountdowns[election._id] = 'Election has ended!';
      }
    });
    setCountdowns(newCountdowns);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      calculateCountdowns(elections);
    }, 1000);

    return () => clearInterval(interval);
  }, [elections]);

  const handleApply = async (electionId, electionName) => {
    // Check if user is logged in
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Login Required',
        text: 'You must be logged in to apply for elections.'
      });
      return;
    }

    // Check if user is a candidate
    if (userRole !== 'candidate') {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Only candidates can apply for elections.'
      });
      return;
    }

    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Apply for Election',
        text: `Are you sure you want to apply for "${electionName}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Apply!',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        // Show loading state
        Swal.fire({
          title: 'Applying...',
          text: 'Please wait while we process your application.',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        // Make API call to apply for election
        const response = await axios.post(`${BASE_URL}/api/v1/elections/${electionId}/apply`, {
          userId: userId
        });

        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'Application Submitted!',
            text: response.data.message || 'Your application has been submitted successfully.',
            confirmButtonText: 'Great!'
          });

          // Refresh elections data to show updated status
          fetchElectionData();
        } else {
          throw new Error(response.data.message || 'Application failed');
        }
      }
    } catch (error) {
      console.error('Application error:', error);

      let errorMessage = 'Failed to submit application. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Application Failed',
        text: errorMessage
      });
    }
  };

  const renderElections = () => {
    const userLocation = localStorage.getItem('user-location');
    const filteredElections = userLocation
      ? elections.filter(election => election.where.toLowerCase() === userLocation.toLowerCase())
      : elections;

    return (
      <div>
        <h2 className="el-lst-title">
          {userLocation ? `Elections for ${userLocation}` : 'All Elections'}
        </h2>
        {userLocation && (
          <p className="location-filter-info">
            Showing only elections for your registered location: <strong>{userLocation}</strong>
          </p>
        )}
        {filteredElections.length > 0 ? (
          <div className={`el-lst-table ${theme}`}>
            {filteredElections.map(election => (
              <div key={election._id} className={`el-lst-item ${theme}`}>
                <Link to={`/election/${election._id}`}>
                  <table className={`el-lst-details ${theme}`}>
                    <tbody>
                      <tr>
                        <td style={{ width: '20%' }}><strong>Election Name:</strong></td>
                        <td style={{ width: '80%' }} className='el-lst-name'>
                          {election.name}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ width: '20%' }}><strong>Location:</strong></td>
                        <td style={{ width: '80%' }}>{election.where}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '20%' }}><strong>Date:</strong></td>
                        <td style={{ width: '80%' }}>{new Date(election.date).toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '20%' }}><strong>Start:</strong></td>
                        <td style={{ width: '80%' }}>{new Date(election.startTime).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '20%' }}><strong>End:</strong></td>
                        <td style={{ width: '80%' }}>{new Date(election.endTime).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td style={{ width: '20%' }}><strong>Status:</strong></td>
                        <td style={{ width: '80%' }}>{countdowns[election._id]}</td>
                      </tr>
                    </tbody>
                  </table>
                </Link>

                {/* Apply Button for Candidates */}
                {userRole === 'candidate' && (
                  <div className="election-actions">
                    <button
                      onClick={() => handleApply(election._id, election.name)}
                      className="el-lst-apply-btn"
                      disabled={new Date() > new Date(election.endTime)}
                      title={new Date() > new Date(election.endTime) ? 'Election has ended' : 'Apply for this election'}
                    >
                      {new Date() > new Date(election.endTime) ? 'Election Ended' : 'Apply'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="el-lst-empty">
            {userLocation
              ? `No elections found for your location (${userLocation}).`
              : 'No elections found.'
            }
          </p>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className={`el-lst-container ${theme}`}>
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading elections...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className={`el-lst-container ${theme}`}>
      <div className="error-container">
        <p>Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className={`el-lst-container ${theme}`}>
      <h1 className={`el-lst-title ${theme}`}>Elections</h1>


      {/* User Role Info */}
      {userId && (
        <div className="user-role-info">
          <p>Logged in as: <strong>{userRole === 'candidate' ? 'Candidate' : 'Voter'}</strong></p>
          {userRole === 'candidate' && (
            <p className="candidate-info">You can apply for elections using the Apply button below each election.</p>
          )}
        </div>
      )}

      {renderElections()}

      {showScrollTop && (
        <button onClick={scrollToTop} className="scroll-to-top-btn">
          <FaArrowUp />
        </button>
      )}
    </div>
  );
};

export default Election;
