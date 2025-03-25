import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '../../firebase'; 
import { useNavigate } from 'react-router-dom'; 
import Header from '../components/Navbar';
import Footer from '../components/Footer';
import { FaGoogle } from "react-icons/fa";

const AuthComponent = () => {
  const navigate = useNavigate(); // Initialize navigation

  // State for form toggling and form data
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);

  // Shared navigation method after successful authentication
  const navigateAfterAuth = () => {
    navigate('/'); // Redirect to home page
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Google Sign-In Successful', result.user);
      navigateAfterAuth(); // Navigate after successful Google sign-in
    } catch (error) {
      setError(error.message);
    }
  };

  // Password Reset Handler
  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setError('Password reset email sent. Check your inbox.');
    } catch (error) {
      setError(error.message);
    }
  };

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login Successful', userCredential.user);
      navigateAfterAuth(); // Navigate after successful login
    } catch (error) {
      setError(error.message);
    }
  };

  // Signup Handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Optional: Update profile with username
      // await updateProfile(user, { displayName: username });

      console.log('Signup Successful', user);
      navigateAfterAuth(); // Navigate after successful signup
    } catch (error) {
      setError(error.message);
    }
  };

  // Toggle between Login and Signup
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        {/* Title and Mode Toggle */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">
            {forgotPasswordMode 
              ? 'Reset Password' 
              : (isLogin ? 'Login' : 'Create Account')}
          </h2>
          {!forgotPasswordMode && (
            <p 
              onClick={toggleAuthMode} 
              className="text-blue-600 cursor-pointer hover:underline mt-2"
            >
              {isLogin 
                ? 'Need an account? Sign Up' 
                : 'Already have an account? Log In'}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={forgotPasswordMode ? handlePasswordReset : (isLogin ? handleLogin : handleSignup)}>
          {/* Username Field (for Signup) */}
          {!isLogin && !forgotPasswordMode && (
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 mb-2">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Choose a username"
                required
              />
            </div>
          )}

          {/* Email Field */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field (not shown in Forgot Password mode) */}
          {!forgotPasswordMode && (
            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-600"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          )}

          {/* Confirm Password Field (only for Signup) */}
          {!isLogin && !forgotPasswordMode && (
            <div className="mb-4">
              <label htmlFor="confirm-password" className="block text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
                required
                minLength={8}
              />
            </div>
          )}

          {/* Forgot Password Link */}
          {isLogin && !forgotPasswordMode && (
            <div className="text-right mb-4">
              <button
                type="button"
                onClick={() => setForgotPasswordMode(true)}
                className="text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            {forgotPasswordMode 
              ? 'Send Reset Link' 
              : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        {/* Divider */}
        {!forgotPasswordMode && (
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
        )}

        {/* Google Sign-In */}
        {!forgotPasswordMode && (
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center bg-white border border-gray-300 py-2 rounded-md hover:bg-gray-50 transition duration-300"
          >
            <FaGoogle className="mr-2 text-blue-600" />
            {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
          </button>
        )}

        {/* Back to Login/Signup from Forgot Password */}
        {forgotPasswordMode && (
          <button
            onClick={() => {
              setForgotPasswordMode(false);
              setIsLogin(true);
            }}
            className="w-full mt-4 text-blue-600 hover:underline"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default AuthComponent;