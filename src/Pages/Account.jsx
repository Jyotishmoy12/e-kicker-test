import React, { useState } from 'react';
import SignUpPage from '../components/SignUpPage';
import LoginPage from '../components/LoginPage';
import Navbar from '../components/Navbar';

const Account = () => {
  const [isSignUp, setIsSignUp] = useState(true); // Initially show the SignUpPage

  const toggleForm = () => {
    setIsSignUp((prev) => !prev); // Toggle between SignUp and Login
  };

  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl border border-blue-100/50 p-8 transform transition-all duration-300 hover:scale-105">
            <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
              {isSignUp ? 'Sign Up' : 'Log In'}
            </h2>

            {/* Conditionally render either SignUpPage or LoginPage */}
            {isSignUp ? (
              <SignUpPage />
            ) : (
              <LoginPage />
            )}

            {/* Button to toggle between forms */}
            <div className="text-center mt-4">
              <button
                onClick={toggleForm}
                className="text-blue-700 hover:text-yellow-600 transition duration-300"
              >
                {isSignUp
                  ? 'Already have an account? Log in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
  
};

export default Account;
