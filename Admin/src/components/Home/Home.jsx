import React, { useState, useEffect } from 'react'; // For state and effect hooks
import './Home.css'; // Import the CSS file
import axios from 'axios'; // For making API requests
import Employee from '../../assets/employee.gif';
import Debate from '../../assets/debate.gif';
import CandidateVerifications from '../../assets/identityverification.png';
import CompliantReview from '../../assets/badreview.gif';
import ProjectReview from '../../assets/project.gif';
import { Link } from 'react-router-dom';

// Use fallback URL if environment variable is not set
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

const Home = () => {
  // State hooks to store data for the requested metrics only
  const [userCount, setUserCount] = useState(0);
  const [totalElections, setTotalElections] = useState(0);
  const [activeElections, setActiveElections] = useState(0);
  const [closedElections, setClosedElections] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [totalParties, setTotalParties] = useState(0);

  // Fetch data on page load
  useEffect(() => {
    // Fetch user count
    axios.get(`${BASE_URL}/api/v1/users/get/count`)
      .then(res => setUserCount(res.data))
      .catch(err => console.error('Error fetching user count:', err));

    // Fetch total elections count
    axios.get(`${BASE_URL}/api/v1/elections/get/count`)
      .then(res => setTotalElections(res.data))
      .catch(err => console.error('Error fetching total elections count:', err));

    // Fetch active elections count
    axios.get(`${BASE_URL}/api/v1/elections/get/active/count`)
      .then(res => setActiveElections(res.data.count))
      .catch(err => console.error('Error fetching active elections count:', err));

    // Fetch closed elections count
    axios.get(`${BASE_URL}/api/v1/elections/get/closed/count`)
      .then(res => setClosedElections(res.data.count))
      .catch(err => console.error('Error fetching closed elections count:', err));

    // Fetch total candidates count
    axios.get(`${BASE_URL}/api/v1/candidates/get/count`)
      .then(res => setTotalCandidates(res.data))
      .catch(err => console.error('Error fetching candidates count:', err));

    // Fetch total parties count
    axios.get(`${BASE_URL}/api/v1/parties/get/count`)
      .then(res => setTotalParties(res.data.count))
      .catch(err => console.error('Error fetching parties count:', err));
  }, []);

  return (
    <div className="home-container">
      <div className="dashboard">
        <h3 className='ad-dash'>Admin Dashboard</h3>
        <div className="stats-container">
          {/* Total Users */}
          <div className="stat-card">
            <Link to='/users'>
              <img src={Employee} alt="Users" className="stat-icon" />
              <h4>Total Users</h4>
              <p className="stat-count">{userCount}</p>
            </Link>
          </div>

          {/* Total Elections */}
          <div className="stat-card">
            <Link to='/election-list'>
              <img src={Debate} alt="Elections" className="stat-icon" />
              <h4>Total Elections</h4>
              <p className="stat-count">{totalElections}</p>
            </Link>
          </div>

          {/* Active Elections */}
          <div className="stat-card">
            <Link to='/election-list'>
              <img src={CandidateVerifications} alt="Active Elections" className="stat-icon" />
              <h4>Active Elections</h4>
              <p className="stat-count">{activeElections}</p>
            </Link>
          </div>

          {/* Closed Elections */}
          <div className="stat-card">
            <Link to='/election-list'>
              <img src={CompliantReview} alt="Closed Elections" className="stat-icon" />
              <h4>Closed Elections</h4>
              <p className="stat-count">{closedElections}</p>
            </Link>
          </div>

          {/* Total Candidates */}
          <div className="stat-card">
            <Link to='/candidate-review'>
              <img src={ProjectReview} alt="Candidates" className="stat-icon" />
              <h4>Total Candidates</h4>
              <p className="stat-count">{totalCandidates}</p>
            </Link>
          </div>

          {/* Total Parties */}
          <div className="stat-card">
            <Link to='/party'>
              <img src={Employee} alt="Parties" className="stat-icon" />
              <h4>Total Parties</h4>
              <p className="stat-count">{totalParties}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
