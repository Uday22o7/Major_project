import React from 'react';
import './Welcome.css';
import rotatingimg from '../Assests/rotating-img.png';
import face from '../Assests/face.png';
import platform from '../Assests/platform.png';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../../Context/ThemeContext';

const Welcome = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/contact');
  };

  return (
    <div className={`welcome-container ${theme}`}>
      <section className={`hero ${theme}`}>
        <div className="hero-left">
          <div className="badge">
            <span className="badge-dot" />
            <span>Blockchain-Powered Security</span>
          </div>

          <h1 className="hero-title">
            Secure Digital <span className="accent">Voting</span>
            <br /> Made Simple
          </h1>

          <p className="hero-subtitle">
            Experience the future of democracy with our blockchain-based voting platform. Transparent,
            secure, and verifiable elections for the digital age.
          </p>

          <div className="btn-box hero-cta">
            {/* Keep existing buttons and routes exactly */}
            <Link to="/dashboard" className="btn">Start Now</Link>
            <button type="button" className="btn" onClick={handleClick}>Contact Us</button>
          </div>

          <ul className="stats">
            <li>
              <strong>10K+</strong>
              <span>Votes Cast</span>
            </li>
            <li>
              <strong>100%</strong>
              <span>Transparent</span>
            </li>
            <li>
              <strong>24/7</strong>
              <span>Available</span>
            </li>
          </ul>
        </div>

        <div className="hero-right">
          <div className="hero-media">
            <img src={'/Homepage_image.png'} alt="Platform Graphic" className="media-bg" />

            <div className="chip secure">
              <span className="chip-icon">🔒</span>
              <div>
                <div className="chip-title">Secure</div>
                <div className="chip-sub">256-bit encryption</div>
              </div>
            </div>

            <div className="chip instant">
              <span className="chip-icon">⚡</span>
              <div>
                <div className="chip-title">Instant</div>
                <div className="chip-sub">Real-time results</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Welcome;
