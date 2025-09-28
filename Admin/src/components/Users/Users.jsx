import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Users.css"; // Import the corresponding CSS file
const BASE_URL = import.meta.env.VITE_BASE_URL;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/users`);
      setUsers(response.data.data);
      console.log(response.data.data);

      setFilteredUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Filter users by type
  const filterUsers = (type) => {
    setFilterType(type);
    let filtered = users;

    if (type === "candidates") {
      filtered = users.filter(user => user.isCandidate);
    } else if (type === "normal") {
      filtered = users.filter(user => !user.isCandidate);
    }

    if (searchTerm) {
      filtered = filtered.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  // Handle delete user
  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`${BASE_URL}/api/v1/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // Handle approve user
  const handleApprove = async (userId) => {
    if (window.confirm("Are you sure you want to approve this user for voting?")) {
      try {
        await axios.put(`${BASE_URL}/api/v1/users/approve/${userId}`);
        fetchUsers();
        alert("User approved successfully!");
      } catch (error) {
        console.error("Error approving user:", error);
        alert("Error approving user. Please try again.");
      }
    }
  };

  // Handle approve candidate
  const handleCandidateApprove = async (userId) => {
    if (window.confirm("Are you sure you want to approve this candidate for elections?")) {
      try {
        await axios.put(`${BASE_URL}/api/v1/users/approve-candidate/${userId}`);
        fetchUsers();
        alert("Candidate approved successfully!");
      } catch (error) {
        console.error("Error approving candidate:", error);
        alert("Error approving candidate. Please try again.");
      }
    }
  };


  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    filterUsers(filterType);
  };

  return (
    <div className="users-container">
      <h1 className="ad-usr-h1">User Management</h1>

      <div className="filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>


        <div className="filter-buttons">
          <button onClick={() => filterUsers("all")} className={filterType === "all" ? "active" : ""}>
            All Users
          </button>
          <button onClick={() => filterUsers("candidates")} className={filterType === "candidates" ? "active" : ""}>
            Candidates
          </button>
          <button onClick={() => filterUsers("normal")} className={filterType === "normal" ? "active" : ""}>
            Normal Users
          </button>
        </div>
      </div>

      <div className="user-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user._id} className="user-card">
              <img
                className="ad-usr-img"
                src={user.profilePhoto || '/default-avatar.svg'}
                alt={`${user.firstName} ${user.lastName}`}
                onError={(e) => {
                  if (e.target.src !== '/default-avatar.svg') {
                    e.target.src = '/default-avatar.svg';
                  }
                }}
              />
              <div className="user-info">
                <h3>
                  {user.firstName} {user.lastName}
                </h3>
                <p><span>Age:</span> {user.age || 'Not specified'}</p>
                <p><span>Email:</span> {user.email}</p>
                <p><span>Phone:</span> {user.phone}</p>
                <p><span>Gender:</span> {user.gender || 'Not specified'}</p>
                <p><span>Location:</span> {user.location || 'Not specified'}</p>
                {!user.isCandidate && (
                  <p className={`approval-status ${user.isApproved ? 'approved' : 'pending'}`}>
                    {user.isApproved ? '✓ Voter Approved' : '⏳ Voter Pending'}
                  </p>
                )}
                {user.isCandidate && (
                  <p className={`candidate-status ${user.candidateApproved ? 'approved' : 'pending'}`}>
                    {user.candidateApproved ? '✓ Candidate Approved' : '⏳ Candidate Pending'}
                  </p>
                )}
                {user.identityDocument && (
                  <div className="document-section">
                    <p>Identity Document:</p>
                    <a
                      href={`${BASE_URL}/uploads/${user.identityDocument}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="document-link"
                    >
                      View Document
                    </a>
                  </div>
                )}
              </div>
              <div className="user-actions">
                {!user.isCandidate && !user.isApproved && (
                  <button className="ad-usr-approve-button" onClick={() => handleApprove(user._id)}>
                    Approve Voter
                  </button>
                )}
                {user.isCandidate && !user.candidateApproved && (
                  <button className="ad-usr-candidate-approve-button" onClick={() => handleCandidateApprove(user._id)}>
                    Approve Candidate
                  </button>
                )}
                <button className="ad-usr-delete-button" onClick={() => handleDelete(user._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default Users;
