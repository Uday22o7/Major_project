# Admin Panel Setup Instructions

## Environment Configuration

To fix the admin login and register issues, you need to create a `.env` file in the Admin directory with the following content:

```
VITE_BASE_URL=http://localhost:3000
```

## Steps to Fix Admin Authentication:

1. **Create Environment File:**
   - Navigate to the `Admin` directory
   - Create a new file named `.env`
   - Add the line: `VITE_BASE_URL=http://localhost:3000`

2. **Backend Configuration:**
   - Ensure your backend server is running on port 3000
   - Create a `.env` file in the Backend directory with the following content:
     ```
     # API URL prefix for all routes
     API_URL=/api/v1
     
     # MongoDB connection string
     CONNECTION_STRING=mongodb://localhost:27017/your_database_name
     
     # Server port
     PORT=3000
     
     # JWT secret key for token signing
     SECRET_KEY=your_super_secret_jwt_key_here
     ```
   - The backend should be accessible at `http://localhost:3000`

3. **Database Connection:**
   - Ensure MongoDB is running and accessible
   - Verify the CONNECTION_STRING environment variable in the backend

## Fixed Issues:

✅ **Environment Variable Handling:** Added fallback URL if VITE_BASE_URL is not set
✅ **Error Handling:** Improved error messages and handling in both login and register components
✅ **Loading States:** Added loading indicators during authentication requests
✅ **API Response Handling:** Fixed authService to properly handle backend response structure
✅ **Network Error Handling:** Added specific handling for network connectivity issues

## Testing the Fix:

1. Start the backend server: `npm start` (in Backend directory)
2. Start the admin frontend: `npm run dev` (in Admin directory)
3. Try registering a new admin account
4. Try logging in with the registered credentials

## Troubleshooting:

- If you get "Network error", check that the backend is running on port 3000
- If you get "Invalid credentials", verify the admin account exists in the database
- If you get CORS errors, ensure the backend CORS configuration includes the admin frontend URL
