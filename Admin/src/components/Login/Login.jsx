import React, { useState, useContext } from 'react';
import './loginStyle.css';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      alert('Login successful');
      setRedirect(true);
    } catch (error) {
      console.error('Login error:', error);
      if (error.message) {
        setError(error.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect to home if login is successful
  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <div className="admin-login-container">
      <h2 className="admin-login-title">Admin Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Email"
          className="admin-login-input"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={handleChange}
          placeholder="Password"
          className="admin-login-input"
          required
        />
        <button type="submit" className="admin-login-button" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <div className="admin-login-register-link">
          <p><Link to="/register">Register Here</Link></p>
        </div>
      </form>
    </div>
  );
};

export default AdminLogin;