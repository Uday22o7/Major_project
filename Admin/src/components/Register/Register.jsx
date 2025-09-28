import React, { useState } from 'react';
import axios from 'axios';
import './AdminRegister.css';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

// Use fallback URL if environment variable is not set
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

const Register = () => {
  const [formData, setFormData] = useState({
    adminId: '', // New field for Admin ID
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { adminId, name, email, password, phone } = formData;
  const navigate = useNavigate();  // Initialize the navigate function

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${BASE_URL}/api/v1/admins/`, formData);
      alert('Admin registered successfully');
      navigate('/login');  // Use navigate() to redirect to /login
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.status === 400) {
        setError('Invalid input data. Please check all fields.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Admin Registration</h2>
      {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="adminId" className="form-label">Admin ID</label>
          <input
            type="text"
            id="adminId"
            name="adminId"
            value={adminId}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter Admin ID"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone" className="form-label">Phone</label>
          <input
            type="text"
            id="phone"
            name="phone"
            value={phone}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter your phone number"
            required
          />
        </div>
        <button type="submit" className="register-button" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register;
