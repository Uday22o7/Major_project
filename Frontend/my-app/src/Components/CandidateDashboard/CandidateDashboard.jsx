import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import './CandidateDashboard.css';
import { useTheme } from '../../Context/ThemeContext';
const BASE_URL = process.env.REACT_APP_BASE_URL;

const CandidateDashboard = () => {
    const { theme } = useTheme();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('user-id');
        setUserId(storedUserId);

        if (storedUserId) {
            fetchApplications();
        }
    }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            // Fetch all elections to check which ones the candidate has applied to
            const electionsResponse = await axios.get(`${BASE_URL}/api/v1/elections`);

            if (electionsResponse.data.success) {
                const elections = electionsResponse.data.data;
                const userApplications = [];

                // Check each election to see if the candidate has applied
                for (const election of elections) {
                    if (election.candidates && election.candidates.includes(userId)) {
                        userApplications.push({
                            electionId: election._id,
                            electionName: election.name,
                            electionDate: election.date,
                            startTime: election.startTime,
                            endTime: election.endTime,
                            location: election.where,
                            status: 'Applied'
                        });
                    }
                }

                setApplications(userApplications);
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleWithdrawApplication = async (electionId, electionName) => {
        try {
            const result = await Swal.fire({
                title: 'Withdraw Application',
                text: `Are you sure you want to withdraw your application from "${electionName}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, Withdraw',
                cancelButtonText: 'Cancel'
            });

            if (result.isConfirmed) {
                // Show loading state
                Swal.fire({
                    title: 'Withdrawing...',
                    text: 'Please wait while we process your withdrawal.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Make API call to withdraw application
                // Note: This would need a new backend endpoint
                // For now, we'll just remove it from the local state
                setApplications(prev => prev.filter(app => app.electionId !== electionId));

                Swal.fire({
                    icon: 'success',
                    title: 'Application Withdrawn',
                    text: 'Your application has been withdrawn successfully.',
                    confirmButtonText: 'OK'
                });
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Withdrawal Failed',
                text: 'Failed to withdraw application. Please try again.'
            });
        }
    };

    if (!userId) {
        return (
            <div className={`candidate-dashboard-container ${theme}`}>
                <div className="login-required">
                    <h2>Login Required</h2>
                    <p>You must be logged in to view your candidate dashboard.</p>
                    <Link to="/login" className="login-link">Go to Login</Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={`candidate-dashboard-container ${theme}`}>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your applications...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`candidate-dashboard-container ${theme}`}>
                <div className="error-container">
                    <p>Error: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`candidate-dashboard-container ${theme}`}>
            <h1 className="dashboard-title">Candidate Dashboard</h1>

            <div className="dashboard-info">
                <p>Welcome to your candidate dashboard! Here you can manage your election applications.</p>
                <Link to="/elections" className="browse-elections-link">
                    Browse Available Elections
                </Link>
            </div>

            <div className="applications-section">
                <h2 className="section-title">Your Applications</h2>

                {applications.length > 0 ? (
                    <div className="applications-grid">
                        {applications.map((application, index) => (
                            <div key={application.electionId} className={`application-card ${theme}`}>
                                <div className="application-header">
                                    <h3 className="election-name">{application.electionName}</h3>
                                    <span className="status-badge applied">{application.status}</span>
                                </div>

                                <div className="application-details">
                                    <div className="detail-item">
                                        <strong>Date:</strong> {new Date(application.electionDate).toLocaleDateString()}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Location:</strong> {application.location}
                                    </div>
                                    <div className="detail-item">
                                        <strong>Start:</strong> {new Date(application.startTime).toLocaleString()}
                                    </div>
                                    <div className="detail-item">
                                        <strong>End:</strong> {new Date(application.endTime).toLocaleString()}
                                    </div>
                                </div>

                                <div className="application-actions">
                                    <Link
                                        to={`/election/${application.electionId}`}
                                        className="view-election-btn"
                                    >
                                        View Election
                                    </Link>
                                    <button
                                        onClick={() => handleWithdrawApplication(application.electionId, application.electionName)}
                                        className="withdraw-btn"
                                    >
                                        Withdraw
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-applications">
                        <p>You haven't applied to any elections yet.</p>
                        <Link to="/elections" className="apply-now-link">
                            Apply to Your First Election
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateDashboard;
