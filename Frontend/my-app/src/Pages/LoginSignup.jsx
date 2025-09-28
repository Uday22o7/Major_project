import React, { useEffect, useState } from 'react';
import axios from 'axios';
import swal from 'sweetalert';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './CSS/LoginSignup.css';
import { Link } from 'react-router-dom';
const BASE_URL = process.env.REACT_APP_BASE_URL;

const LoginSignup = () => {
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [parties, setParties] = useState([]);
    const [state, setState] = useState("Login");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        address: "",
        email: "",
        password: "",
        phone: "",
        gender: "",
        age: "",
        location: "",
        identityDocument: null,
        isCandidate: false,
        politicalParty: ""
    });

    useEffect(() => {
        // Fetch political parties for candidate registration (resilient to response shapes)
        const fetchParties = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/v1/parties`);
                const payload = res?.data;
                const list = Array.isArray(payload)
                    ? payload
                    : (Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload?.parties) ? payload.parties : []));
                setParties(Array.isArray(list) ? list : []);
            } catch (err1) {
                try {
                    // fallback to older endpoint if exists
                    const res2 = await axios.get(`${BASE_URL}/api/v1/parties/party`);
                    const payload2 = res2?.data;
                    const list2 = Array.isArray(payload2)
                        ? payload2
                        : (Array.isArray(payload2?.data) ? payload2.data : (Array.isArray(payload2?.parties) ? payload2.parties : []));
                    setParties(Array.isArray(list2) ? list2 : []);
                } catch (err2) {
                    console.error('Error fetching parties:', err2);
                    setParties([]);
                }
            }
        };
        fetchParties();
    }, []);

    const changeHandler = (e) => {
        const { name, value, type, checked, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value)
        }));
    };

    const validatePassword = () => {
        const password = formData.password;
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!regex.test(password)) {
            setPasswordError(
                "Password must be at least 8 characters long, include uppercase, lowercase, number, and special character."
            );
        } else {
            setPasswordError("");
        }
    };

    const validateConfirmPassword = () => {
        if (formData.password !== formData.confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
        } else {
            setConfirmPasswordError("");
        }
    };

    const validateAge = () => {
        const age = parseInt(formData.age);
        if (isNaN(age) || age < 18) {
            return "You must be at least 18 years old to register and vote.";
        }
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (state === "Login") {
            await login();
        } else {
            validatePassword();
            validateConfirmPassword();
            const ageError = validateAge();
            if (!passwordError && !confirmPasswordError && !ageError) {
                await signup();
            } else {
                if (ageError) {
                    toast.error(ageError);
                }
                console.log("Fix errors before submitting.");
            }
        }
    };

    const login = async () => {
        console.log("Login Function Executed", { email: formData.email, password: formData.password });

        try {
            const response = await fetch(`${BASE_URL}/api/v1/users/login`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });

            // Check if response is OK
            if (!response.ok) {
                const errorResponse = await response.text();
                throw new Error(errorResponse);
            }

            const responseData = await response.json();

            // Save user data to localStorage
            localStorage.setItem('auth-token', responseData.token);
            localStorage.setItem('user-id', responseData.user._id);
            localStorage.setItem('user-name', responseData.user.firstName);
            localStorage.setItem('user-isCandidate', responseData.user.isCandidate);
            localStorage.setItem('user-age', responseData.user.age);
            localStorage.setItem('user-approved', responseData.user.isApproved);
            localStorage.setItem('user-location', responseData.user.location);
            toast.success("Login successful!");
            window.location.replace("/");
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error message:', error.message);

            // Try to parse error response if it's JSON
            let errorMessage = 'Login failed. Please try again.';
            try {
                const errorData = JSON.parse(error.message);
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (parseError) {
                // If not JSON, use the raw message
                errorMessage = error.message;
            }

            // Display specific error messages
            if (errorMessage.includes('not verified') || errorMessage.includes('admin approval')) {
                toast.error('Your account is being verified. Please try again in a moment.');
            } else if (errorMessage.includes('not found') || errorMessage.includes('user not found')) {
                toast.error('No account found with this email. Please check your email or register first.');
            } else if (errorMessage.includes('Password is wrong') || errorMessage.includes('password')) {
                toast.error('Invalid password. Please check your password and try again.');
            } else if (errorMessage.includes('Email and password are required')) {
                toast.error('Please enter both email and password.');
            } else {
                toast.error(`Login failed: ${errorMessage}`);
            }
        }
    };

    const signup = async () => {
        console.log("Signup Function Executed", formData);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('firstName', formData.firstName);
            formDataToSend.append('lastName', formData.lastName);
            formDataToSend.append('address', formData.address);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('password', formData.password);
            formDataToSend.append('phone', formData.phone);
            formDataToSend.append('gender', formData.gender);
            formDataToSend.append('age', formData.age);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('isCandidate', formData.isCandidate.toString());
            if (formData.politicalParty) {
                formDataToSend.append('politicalParty', formData.politicalParty);
            }
            if (formData.identityDocument) {
                formDataToSend.append('identityDocument', formData.identityDocument);
            }

            const response = await fetch(`${BASE_URL}/api/v1/users/register`, {
                method: 'POST',
                body: formDataToSend,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Registration response not ok:', response.status, errorText);
                throw new Error(`Registration failed: ${response.status} ${errorText}`);
            }

            const responseData = await response.json();

            if (responseData && responseData.success) {
                toast.success("Registration successful! Please login.");
                setState("Login");
                // Clear form data
                setFormData({
                    firstName: "",
                    lastName: "",
                    address: "",
                    email: "",
                    password: "",
                    phone: "",
                    gender: "",
                    age: "",
                    location: "",
                    identityDocument: null,
                    isCandidate: false,
                    politicalParty: ""
                });
            } else {
                console.error('Registration failed:', responseData);
                toast.error(responseData.message || "Registration failed");
            }
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('An error occurred during registration. Please try again later.');
        }
    };

    return (
        <div className='loginsignup'>
            <ToastContainer />
            <div className="loginsignup-container">
                <h1>{state}</h1>
                <form onSubmit={handleSubmit}>
                    <div className="loginsignup-fields">
                        {state === "Sign Up" && (
                            <div className='signup-container'>
                                <div className='form-row'>
                                    <input
                                        name='firstName'
                                        value={formData.firstName}
                                        onChange={changeHandler}
                                        type="text"
                                        placeholder='Your First Name'
                                        required
                                    />
                                    <input
                                        name='lastName'
                                        value={formData.lastName}
                                        onChange={changeHandler}
                                        type="text"
                                        placeholder='Your Last Name'
                                        required
                                    />
                                </div>

                                <div className='form-row'>
                                    <input
                                        name='address'
                                        value={formData.address}
                                        onChange={changeHandler}
                                        type="text"
                                        placeholder='Your Address'
                                        required
                                    />
                                </div>

                                <div className='form-row'>
                                    <input
                                        name='email'
                                        value={formData.email}
                                        onChange={changeHandler}
                                        type="email"
                                        placeholder='Your Email'
                                        required
                                    />
                                    <input
                                        name='phone'
                                        value={formData.phone}
                                        onChange={changeHandler}
                                        type="text"
                                        placeholder='Phone Number'
                                        required
                                    />
                                </div>

                                <div className='form-row'>
                                    <input
                                        name='age'
                                        value={formData.age}
                                        onChange={changeHandler}
                                        type="number"
                                        placeholder='Age (Must be 18+)'
                                        min="18"
                                        max="120"
                                        required
                                    />
                                    <input
                                        name='location'
                                        value={formData.location}
                                        onChange={changeHandler}
                                        type="text"
                                        placeholder='Location/Region'
                                        required
                                    />
                                </div>

                                <div className='form-row'>
                                    <label className="re-gender-label">Gender:</label>
                                    <div className="re-gender-options">
                                        <label>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Male"
                                                checked={formData.gender === "Male"}
                                                onChange={changeHandler}
                                                required
                                            />
                                            Male
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Female"
                                                checked={formData.gender === "Female"}
                                                onChange={changeHandler}
                                                required
                                            />
                                            Female
                                        </label>
                                        <label>
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="Other"
                                                checked={formData.gender === "Other"}
                                                onChange={changeHandler}
                                                required
                                            />
                                            Other
                                        </label>
                                    </div>
                                </div>

                                <div className='form-row'>
                                    <label className="document-upload-label">Identity Document (ID Card, Passport, etc.):</label>
                                    <input
                                        name='identityDocument'
                                        onChange={changeHandler}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        required
                                        style={{ marginTop: '5px' }}
                                    />
                                    <small style={{ color: '#666', fontSize: '12px' }}>
                                        Upload a clear photo or scan of your identity document (PDF, JPG, PNG)
                                    </small>
                                </div>

                                <div className='form-row'>
                                    <label className='checkbox'>
                                        <input
                                            className='checkbox-check'
                                            name='isCandidate'
                                            checked={formData.isCandidate}
                                            onChange={changeHandler}
                                            type="checkbox"
                                        />
                                        <p className='can'>Are you a Candidate?</p>
                                    </label>
                                </div>

                                {formData.isCandidate && (
                                    <div className='form-row'>
                                        <select
                                            name="politicalParty"
                                            value={formData.politicalParty}
                                            onChange={changeHandler}
                                            required
                                        >
                                            <option value="">Select a Political Party</option>
                                            {Array.isArray(parties) && parties.map((party) => (
                                                <option key={party._id || party.id} value={party._id || party.id}>
                                                    {party.name || party.abbreviation || party.partyName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={state === "Sign Up" ? "login-container" : "full-width"}>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={changeHandler}
                                type="email"
                                placeholder="Email Address"
                                required
                            />

                            {state === "Sign Up" && passwordError && <p className="error-message">{passwordError}</p>}
                            <input
                                name="password"
                                value={formData.password}
                                onChange={changeHandler}
                                type="password"
                                placeholder="Password"
                                required
                                onBlur={state === "Sign Up" ? validatePassword : undefined}
                            />

                            {state === "Sign Up" && confirmPasswordError && (
                                <p className="error-message">{confirmPasswordError}</p>
                            )}
                            {state === "Sign Up" && (
                                <input
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={changeHandler}
                                    type="password"
                                    placeholder="Confirm Password"
                                    required
                                    onBlur={validateConfirmPassword}
                                />
                            )}
                        </div>
                    </div>

                    <div className="loginsignup-agree">
                        <input type="checkbox" required />
                        <p>By continuing, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.</p>
                    </div>

                    <button type="submit">{state === "Login" ? "Login" : "Register"}</button>

                    {state === "Sign Up" ? (
                        <p className='loginsignup-login'>
                            Already have an account? <span onClick={() => { setState("Login") }}>Login here</span>
                        </p>
                    ) : (
                        <>
                            <div className='forgot-password'>
                                <Link to={'/forgot-password'}>Forgot Password</Link>
                            </div>
                            <p className='loginsignup-login'>
                                Don't have an account? <span onClick={() => { setState("Sign Up") }}>Register here</span>
                            </p>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default LoginSignup;
