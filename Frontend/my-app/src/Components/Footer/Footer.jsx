import React from 'react';
import './Footer.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';


const Footer = () => {
  return (
    <footer className="footer">


      <div className="footer-bottom">
        <p>Copyright © 2025 | Designed with ❤️ by the ChainVote Team.</p>
        <ul className="footer-nav">
          <li>Home</li>
          <li>About</li>
          <li>Services</li>
          <li>Pricing</li>
          <li>Blog</li>
          <li>Contact</li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
