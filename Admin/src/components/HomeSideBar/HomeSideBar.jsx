import React, { useState } from 'react';
import './HomeSideBar.css';
import { Link } from 'react-router-dom';
import { FaHome, FaUsersCog, FaUsers, FaListUl, FaList, FaEdit, FaPlus } from 'react-icons/fa';

const HomeSideBar = () => {
  const [activeSection, setActiveSection] = useState(null);

  const handleSectionClick = (section) => {
    setActiveSection(prevSection => (prevSection === section ? null : section));
  };

  return (
    <div className='home-s-br-container'>
      <Link to={'/'} style={{ textDecoration: 'none' }}>
        <div className="home-s-br-card">
          <FaHome className='home-s-br-icon' />
          <p>Home</p>
        </div>
      </Link>


      <div
        className={`home-s-br-card ${activeSection === 'election' ? 'active' : ''}`}
        onClick={() => handleSectionClick('election')}
      >
        <FaListUl className='home-s-br-icon' />
        <p>Election</p>
        {activeSection === 'election' && (
          <div className='home-s-br-sublinks'>
            <Link to={'/election-list'}><FaList className='home-s-br-sublink-icon' /> Election List</Link>
            <Link to={'/update-election'}><FaEdit className='home-s-br-sublink-icon' /> Update Election</Link>
            <Link to={'/add-election'}><FaPlus className='home-s-br-sublink-icon' /> Add Election</Link>
          </div>
        )}
      </div>

      <Link to={'/candidate-review'} style={{ textDecoration: 'none' }}>
        <div className="home-s-br-card">
          <FaUsersCog className='home-s-br-icon' />
          <p>Candidates</p>
        </div>
      </Link>

      <div
        className={`home-s-br-card ${activeSection === 'party' ? 'active' : ''}`}
        onClick={() => handleSectionClick('party')}
      >
        <FaUsers className='home-s-br-icon' />
        <p>Party</p>
        {activeSection === 'party' && (
          <div className='home-s-br-sublinks'>
            <Link to={'/party-list'}><FaList className='home-s-br-sublink-icon' /> Party List</Link>
            <Link to={'/update-party'}><FaEdit className='home-s-br-sublink-icon' /> Update Party</Link>
            <Link to={'/add-party'}><FaPlus className='home-s-br-sublink-icon' /> Add Party</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeSideBar;
