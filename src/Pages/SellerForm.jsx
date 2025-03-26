import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import Header from '../components/Navbar';
import Footer from '../components/Footer';

const SellerForm = () => {
  // Toggle between login and registration view
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Multi-step form state
  const [registrationStep, setRegistrationStep] = useState(1);
  const totalSteps = 3;

  // State for seller login (email and password)
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // State for seller registration (additional details)
  const [sellerData, setSellerData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
    gstNumber: '',
    panNumber: '',
    address:''
  });

  // Define validation schemas
  const loginSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters')
  });

  // Registration schema
  const registerSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phoneNumber: Yup.string().required('Phone number is required')
      .matches(/^\d{10}$/, 'Phone number must be 10 digits'),
    password: Yup.string().required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    accountNumber: Yup.string().required('Account number is required'),
    ifscCode: Yup.string().required('IFSC code is required'),
    branchName: Yup.string().required('Branch name is required'),
    gstNumber: Yup.string()
    .required('GST number is required')
    .matches(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
      'Invalid GST number format'
    ),
    panNumber: Yup.string().required('PAN number is required')
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN number format'),
    address: Yup.string().required('Address is required')
  });

  // Define fields for each step of registration
  const stepFields = {
    1: ['fullName', 'email', 'phoneNumber', 'password', 'confirmPassword'],
    2: ['accountNumber', 'ifscCode', 'branchName'],
    3: ['gstNumber', 'panNumber', 'address']
  };

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  // Load saved form data on initial render
  useEffect(() => {
    const savedData = localStorage.getItem('sellerRegistrationData');
    if (savedData && !isLogin) {
      try {
        setSellerData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error parsing saved data:', error);
        localStorage.removeItem('sellerRegistrationData');
      }
    }
  }, [isLogin]);

  // Save form data when it changes
  useEffect(() => {
    if (!isLogin) {
      localStorage.setItem('sellerRegistrationData', JSON.stringify(sellerData));
    }
  }, [sellerData, isLogin]);

  // Handle login form changes
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      });
    }
  };

  // Handle registration form changes
  const handleRegisterChange = (e) => {
    setSellerData({
      ...sellerData,
      [e.target.name]: e.target.value
    });
    // Clear error for this field when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      });
    }
  };

  // Step navigation functions
  const nextStep = async () => {
    const currentStepFields = stepFields[registrationStep];
    const currentStepData = {};
    
    // Extract data for current step fields
    currentStepFields.forEach(field => {
      currentStepData[field] = sellerData[field];
    });
    
    try {
      // Create a validation schema for just the current step fields
      const stepValidationSchema = Yup.object().shape(
        currentStepFields.reduce((schema, field) => {
          schema[field] = registerSchema.fields[field];
          return schema;
        }, {})
      );
      
      // Validate only the current step fields
      await stepValidationSchema.validate(currentStepData, { abortEarly: false });
      
      // If validation passes, move to next step
      setRegistrationStep(prev => Math.min(prev + 1, totalSteps));
      setErrors({});
    } catch (error) {
      // Handle validation errors
      const validationErrors = {};
      error.inner.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      setErrors(validationErrors);
    }
  };
  
  const prevStep = () => {
    setRegistrationStep(prev => Math.max(prev - 1, 1));
  };

  // Handle seller login with Firebase Auth
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Validate form
      await loginSchema.validate(loginData, { abortEarly: false });
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginData.email,
        loginData.password
      );
      // Successful sign in returns the user
      const user = userCredential.user;
      toast.success('Login successful');
      navigate(`/seller-profile/${user.uid}`);
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Yup validation errors
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
      } else if (error.code) {
        // Firebase auth errors
        switch(error.code) {
          case 'auth/user-not-found':
            setErrors({ email: 'No account found with this email' });
            break;
          case 'auth/wrong-password':
            setErrors({ password: 'Incorrect password' });
            break;
          case 'auth/too-many-requests':
            setErrors({ password: 'Too many failed attempts. Try again later.' });
            break;
          default:
            toast.error('Login failed: ' + error.message);
        }
      } else {
        toast.error('An unexpected error occurred');
      }
      console.error('Error during seller login:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle seller registration with Firebase Auth and Firestore
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Validate the entire form before submission
      await registerSchema.validate(sellerData, { abortEarly: false });
      
      if (!acceptedTerms) {
        setErrors({ terms: 'You must accept the terms and conditions' });
        setIsSubmitting(false);
        return;
      }
      
      // Create a new auth record with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        sellerData.email,
        sellerData.password
      );
      const user = userCredential.user;
      
      // Create a seller profile document in Firestore
      await setDoc(doc(db, 'sellers', user.uid), {
        fullName: sellerData.fullName,
        email: sellerData.email,
        phoneNumber: sellerData.phoneNumber,
        accountNumber: sellerData.accountNumber,
        ifscCode: sellerData.ifscCode,
        branchName: sellerData.branchName,
        gstNumber: sellerData.gstNumber,
        panNumber: sellerData.panNumber,
        verified: false, 
        address: sellerData.address,
        createdAt: new Date()
      });
      
      // Clear saved form data
      localStorage.removeItem('sellerRegistrationData');
      
      toast.success('Seller registered successfully');
      navigate(`/seller-profile/${user.uid}`);
    } catch (error) {
      if (error.name === 'ValidationError') {
        // Yup validation errors
        const validationErrors = {};
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
        setErrors(validationErrors);
        
        // If there are errors, go to the first step with errors
        for (let step = 1; step <= totalSteps; step++) {
          const stepHasErrors = stepFields[step].some(field => validationErrors[field]);
          if (stepHasErrors) {
            setRegistrationStep(step);
            break;
          }
        }
      } else if (error.code) {
        // Firebase auth errors
        switch (error.code) {
          case 'auth/email-already-in-use':
            setErrors({ email: 'This email is already registered' });
            setRegistrationStep(1); // Go back to email step
            break;
          case 'auth/weak-password':
            setErrors({ password: 'Password is too weak' });
            setRegistrationStep(1); // Go back to password step
            break;
          default:
            toast.error('Registration failed: ' + error.message);
        }
      } else {
        toast.error('An unexpected error occurred');
      }
      console.error('Error creating seller profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate email
      await Yup.string().email('Invalid email').required('Email is required').validate(resetEmail);
      
      // Send password reset email
      await sendPasswordResetEmail(auth, resetEmail);
      
      toast.success('Password reset email sent. Please check your inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error) {
      if (error.name === 'ValidationError') {
        setErrors({ resetEmail: error.message });
      } else {
        switch (error.code) {
          case 'auth/user-not-found':
            setErrors({ resetEmail: 'No account found with this email' });
            break;
          case 'auth/invalid-email':
            setErrors({ resetEmail: 'Invalid email address' });
            break;
          case 'auth/too-many-requests':
            setErrors({ resetEmail: 'Too many reset attempts. Please try again later.' });
            break;
          default:
            toast.error('Password reset failed: ' + error.message);
        }
      }
      console.error('Password reset error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Render field with error message
  const renderField = (name, label, type = 'text', placeholder = '', autoComplete = '') => {
    const isPasswordField = type === 'password';
    const showHidePassword = isPasswordField && 
      (name === 'password' ? showPassword : showConfirmPassword);
    
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block mb-1 font-medium text-gray-700">{label}</label>
        <div className="relative">
          <input
            id={name}
            type={isPasswordField && showHidePassword ? 'text' : type}
            name={name}
            value={isLogin ? loginData[name] || '' : sellerData[name] || ''}
            onChange={isLogin ? handleLoginChange : handleRegisterChange}
            className={`w-full border rounded p-2 ${errors[name] ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={placeholder}
            autoComplete={autoComplete}
          />
          {isPasswordField && (
            <button
              type="button"
              className="absolute right-2 top-2 text-gray-500 text-sm"
              onClick={() => {
                if (name === 'password') {
                  setShowPassword(!showPassword);
                } else if (name === 'confirmPassword') {
                  setShowConfirmPassword(!showConfirmPassword);
                }
              }}
            >
              {(name === 'password' && showPassword) || (name === 'confirmPassword' && showConfirmPassword) ? 
                'Hide' : 'Show'}
            </button>
          )}
        </div>
        {errors[name] && <p className="text-red-500 text-sm mt-1">{errors[name]}</p>}
        
        {/* Password strength meter */}
        {isPasswordField && name === 'password' && !isLogin && sellerData.password && (
          <div className="mt-2">
            <div className="h-1.5 flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 rounded ${
                    i < checkPasswordStrength(sellerData.password) 
                      ? i < 2 ? 'bg-red-400' : i < 3 ? 'bg-yellow-400' : 'bg-green-500' 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs mt-1 text-gray-600">
              {checkPasswordStrength(sellerData.password) === 0 ? 'Enter a password' :
               checkPasswordStrength(sellerData.password) < 2 ? 'Weak' : 
               checkPasswordStrength(sellerData.password) < 3 ? 'Medium' : 
               checkPasswordStrength(sellerData.password) < 4 ? 'Strong' : 'Very Strong'}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          {/* Toggle Buttons */}
          <div className="flex justify-around mb-6 border-b">
            <button
              type="button"
              className={`px-4 py-2 ${isLogin ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-500'}`}
              onClick={() => {
                setIsLogin(true);
                setErrors({});
              }}
            >
              Login
            </button>
            <button
              type="button"
              className={`px-4 py-2 ${!isLogin ? 'border-b-2 border-blue-600 font-bold text-blue-600' : 'text-gray-500'}`}
              onClick={() => {
                setIsLogin(false);
                setErrors({});
              }}
            >
              Register
            </button>
          </div>
          {showForgotPassword && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Reset Password</h2>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <label htmlFor="resetEmail" className="block mb-1 font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      id="resetEmail"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (errors.resetEmail) {
                          setErrors({ ...errors, resetEmail: undefined });
                        }
                      }}
                      className={`w-full border rounded p-2 ${errors.resetEmail ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter your registered email"
                    />
                    {errors.resetEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.resetEmail}</p>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Sending...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

{isLogin ? (
            // Seller Login Form
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Seller Login</h2>
              
              {renderField('email', 'Email', 'email', 'Enter your email', 'email')}
              {renderField('password', 'Password', 'password', 'Enter your password', 'current-password')}
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          ) : (
            // Seller Registration Form
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Seller Registration</h2>
              
              {/* Step indicator */}
              <div className="flex items-center justify-between mb-6">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step < registrationStep ? 'bg-green-500 text-white' : 
                        step === registrationStep ? 'bg-blue-600 text-white' : 
                        'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step < registrationStep ? '✓' : step}
                    </div>
                    <div className="text-xs mt-1 text-gray-600">
                      {step === 1 ? 'Account' : step === 2 ? 'Banking' : 'Business'}
                    </div>
                  </div>
                ))}
                <div className="absolute left-0 right-0 h-0.5 bg-gray-200" style={{ top: '50%', zIndex: 0 }} />
              </div>
              
              {/* Step 1: Account Information */}
              {registrationStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Account Information</h3>
                  {renderField('fullName', 'Full Name', 'text', 'Enter your full name', 'name')}
                  {renderField('email', 'Email', 'email', 'Enter your email', 'email')}
                  {renderField('phoneNumber', 'Phone Number', 'tel', 'Enter 10-digit phone number', 'tel')}
                  {renderField('password', 'Password', 'password', 'Create a password', 'new-password')}
                  {renderField('confirmPassword', 'Confirm Password', 'password', 'Confirm your password', 'new-password')}
                  {renderField('address', 'Address', 'address', 'Enter your address')}
                </div>
              )}
              
              {/* Step 2: Banking Information */}
              {registrationStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Banking Information</h3>
                  {renderField('accountNumber', 'Account Number', 'text', 'Enter your account number')}
                  {renderField('ifscCode', 'IFSC Code', 'text', 'Enter bank IFSC code')}
                  {renderField('branchName', 'Branch Name', 'text', 'Enter bank branch name')}
                </div>
              )}
              
              {/* Step 3: Business Information */}
              {registrationStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Business Information</h3>
                  {renderField('gstNumber', 'GST Number', 'text', 'Enter your GST number')}
                  {renderField('panNumber', 'PAN Number', 'text', 'Enter your PAN number')}
                  
                  <div className="mt-6">
                    <div className="flex items-center">
                      <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                        I agree to the <a href="/termsofuse" className="text-blue-600 hover:underline">Terms and Conditions</a>
                      </label>
                    </div>
                    {errors.terms && <p className="text-red-500 text-sm mt-1">{errors.terms}</p>}
                  </div>
                </div>
              )}
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                {registrationStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
                
                {registrationStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !acceptedTerms}
                  >
                    {isSubmitting ? 'Registering...' : 'Complete Registration'}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerForm;