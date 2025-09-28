import React from 'react';
import './Review.css';
import { Link } from 'react-router-dom';

const Review = () => {
    return (
        <div className='dashboardd-container'>
            <div className='cardonee'>
                <Link to={`/candidates`}>All Candidates</Link>
            </div>

            <div className="cardtwoo">
                <Link to='/update-candidate'>Update Candidate</Link>
            </div>

            <div className="cardtreee">
                <Link to={`/add-candidate`}>Add Candidate</Link>
            </div>
        </div>
    )
}

export default Review;
