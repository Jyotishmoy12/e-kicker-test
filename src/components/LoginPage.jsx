import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { FaGoogle } from 'react-icons/fa'; // Google logo

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false); // State to toggle the Forgot Password form
  const [resetEmail, setResetEmail] = useState(''); // Email for password reset
  const [resetMessage, setResetMessage] = useState(''); // Success or error message for password reset
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = useCallback((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase()), []);

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Validation checks
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to Home page after successful login
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google sign-in handler
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setIsLoading(true);
      await signInWithPopup(auth, provider);
      navigate('/'); // Redirect to Home page after Google login
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setResetMessage(''); // Clear any previous messages
    setError(''); // Clear any error messages

    if (!validateEmail(resetEmail)) {
      setError('Please enter a valid email address for password reset');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage('Password reset email sent! Please check your inbox.');
    } catch (error) {
      setError('Error sending password reset email. Please try again later.');
    }
  };

  return (
    <div>
      {!showForgotPassword ? (
        // Login Form
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {error && <div className="text-red-500">{error}</div>}

          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </button>

          <div className="mt-2 text-center">
            <button
              type="button"
              className="text-blue-700"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>
        </form>
      ) : (
        // Forgot Password Form
        <form onSubmit={handlePasswordReset}>
          <div className="mb-4">
            <label htmlFor="resetEmail" className="block">Enter your email to reset password</label>
            <input
              type="email"
              id="resetEmail"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>

          {error && <div className="text-red-500">{error}</div>}
          {resetMessage && <div className="text-green-500">{resetMessage}</div>}

          <button
            type="submit"
            className="w-full p-2 bg-blue-500 text-white rounded"
            disabled={isLoading}
          >
            {isLoading ? 'Sending Reset Email...' : 'Send Reset Email'}
          </button>

          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-blue-700"
              onClick={() => setShowForgotPassword(false)}
            >
              Back to Login
            </button>
          </div>
        </form>
      )}

      <div className="mt-4 text-center">
        <button onClick={handleGoogleSignIn} className="w-full p-2 border rounded text-blue-700">
           Log In with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
