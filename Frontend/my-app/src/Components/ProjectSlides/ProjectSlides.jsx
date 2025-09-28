import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProjectSlides.css';
import { useTheme } from '../../Context/ThemeContext';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const ProjectSlides = () => {
    const { theme } = useTheme();
    const [projects, setProjects] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/v1/projects`);
                setProjects(response.data.data || []);
            } catch (err) {
                setError('Failed to load projects');
                console.error('Error fetching projects:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % projects.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
    };

    if (loading) {
        return (
            <div className={`project-slides-container ${theme}`}>
                <div className="loading-message">Loading projects...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`project-slides-container ${theme}`}>
                <div className="error-message">{error}</div>
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className={`project-slides-container ${theme}`}>
                <div className="error-message"></div>
            </div>
        );
    }

    return (
        <div className={`project-slides-container ${theme}`}>
            <div className="project-slide-wrapper">
                <div
                    className="project-slides"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {projects.map((project, index) => (
                        <div key={project._id || index} className={`project-slide ${theme}`}>
                            <h2>{project.title}</h2>
                            <h4>By {project.candidateName || 'Unknown Author'}</h4>
                            <p>{project.description}</p>
                            {project.image && (
                                <div className="project-image">
                                    <img src={project.image} alt={project.title} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {projects.length > 1 && (
                <div className="navigation-arrows">
                    <button className="prev-arrow" onClick={prevSlide}>
                        ←
                    </button>
                    <button className="next-arrow" onClick={nextSlide}>
                        →
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectSlides;