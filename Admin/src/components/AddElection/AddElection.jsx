import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './AddElection.css';

const AddElection = () => {
  const [electionType, setElectionType] = useState("");
  const navigate = useNavigate();  // Initialize navigate function

  const handleTypeChange = (event) => {
    const selectedType = event.target.value;
    setElectionType(selectedType);

    // Redirect to general election
    if (selectedType === "General Election") {
      navigate("/general-election");
    }
  };

  return (
    <div className="add-election-container">
      <h2>Select Election Type</h2>
      <select
        value={electionType}
        onChange={handleTypeChange}
        className="election-type-dropdown"
      >
        <option value="" disabled>
          Choose Election Type
        </option>
        <option value="General Election">General Election</option>
      </select>
      {electionType && <p>You selected: {electionType}</p>}
    </div>
  );
};

export default AddElection;
