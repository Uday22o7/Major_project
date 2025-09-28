import React, { useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import './AddParty.css';
import Party from '../Party/Party';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const AddParty = () => {
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    headquarter: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/v1/parties`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      swal('Success!', response.data.message || 'Party added successfully!', 'success');
      setFormData({
        name: '',
        abbreviation: '',
        headquarter: ''
      });
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add the party. Please try again.';
      swal('Error!', errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Party />
      <div className="add-party">
        <div className="form-container">
          <h1>ADD NEW PARTY</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Party Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="abbreviation"
              placeholder="Party Abbreviation"
              value={formData.abbreviation}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="headquarter"
              placeholder="Headquarter"
              value={formData.headquarter}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Add Party'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddParty;
