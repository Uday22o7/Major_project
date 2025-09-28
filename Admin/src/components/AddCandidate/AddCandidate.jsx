import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import swal from 'sweetalert';
import './AddCandidate.css';
const BASE_URL = import.meta.env.VITE_BASE_URL;

const AddCandidate = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        party: ''
    });
    const [parties, setParties] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch available parties
        const fetchParties = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/v1/parties`);
                if (response.data.success) {
                    setParties(response.data.parties);
                }
            } catch (error) {
                console.error('Error fetching parties:', error);
            }
        };
        fetchParties();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log('Submitting form data:', formData);
            
            // First create the user
            const userData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                isCandidate: true
            };

            console.log('Creating user with data:', userData);
            const userResponse = await axios.post(`${BASE_URL}/api/v1/users`, userData);
            console.log('User creation response:', userResponse.data);

            if (userResponse.data.success) {
                // Then create the candidate
                const candidateData = {
                    user: userResponse.data.user._id,
                    party: formData.party,
                    isVerified: true // Auto-approve admin-created candidates
                };

                console.log('Creating candidate with data:', candidateData);
                const candidateResponse = await axios.post(`${BASE_URL}/api/v1/candidates`, candidateData);
                console.log('Candidate creation response:', candidateResponse.data);

                if (candidateResponse.data.success) {
                    swal('Success!', 'Candidate added successfully!', 'success');
                    navigate('/candidates');
                } else {
                    swal('Error!', 'Failed to create candidate profile', 'error');
                }
            } else {
                swal('Error!', 'Failed to create user account', 'error');
            }
        } catch (error) {
            console.error('Full error details:', error);
            console.error('Error response:', error.response);
            const errorMsg = error.response?.data?.message || 'Failed to add candidate. Please try again.';
            swal('Error!', errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-candidate-container">
            <h1>Add New Candidate</h1>
            <form onSubmit={handleSubmit} className="candidate-form">
                <div className="form-group">
                    <label>First Name *</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Last Name *</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Phone *</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Political Party *</label>
                    <select
                        name="party"
                        value={formData.party}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a Party</option>
                        {parties.map((party) => (
                            <option key={party._id} value={party._id}>
                                {party.name} ({party.abbreviation})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={() => navigate('/candidates')} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="submit-btn">
                        {loading ? 'Adding...' : 'Add Candidate'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCandidate;
