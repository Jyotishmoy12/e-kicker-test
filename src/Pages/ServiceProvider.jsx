import React, { useState } from "react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import Footer from "../components/Footer";
import Header from "../components/Navbar";

// Input validation schemas
const registrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*()]/, "Password must contain at least one special character"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  service: z.string().min(2, "Service name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters")
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

const ServiceProvider = () => {
  const [isRegister, setIsRegister] = useState(true);
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    phone: "", 
    service: "", 
    location: "" 
  });
  const [emailForReset, setEmailForReset] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    try {
      if (isRegister) {
        registrationSchema.parse(form);
      } else {
        loginSchema.parse({ email: form.email, password: form.password });
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setMessage("");
    
    // Validate form before submission
    if (!validateForm()) return;

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
        await setDoc(doc(db, "service_providers", userCredential.user.uid), {
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service,
          location: form.location,
          createdAt: new Date()
        });
        setMessage("Registration successful!");
        navigate('/repairing');
      } else {
        await signInWithEmailAndPassword(auth, form.email, form.password);
        setMessage("Login successful!");
        navigate('/repairing');
      }
    } catch (error) {
      // Provide more user-friendly error messages
      const errorMap = {
        'auth/email-already-in-use': 'Email is already registered',
        'auth/invalid-credential': 'Invalid email or password',
        'auth/too-many-requests': 'Too many login attempts. Please try again later.'
      };
      setMessage(errorMap[error.code] || error.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailForReset) {
      return setMessage("Please enter your email to reset password.");
    }
    
    try {
      await sendPasswordResetEmail(auth, emailForReset);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (error) {
      const errorMap = {
        'auth/user-not-found': 'No account associated with this email',
        'auth/invalid-email': 'Invalid email address'
      };
      setMessage(errorMap[error.code] || error.message);
    }
  };
  
  return (
    <>
      <Header/>
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105 duration-300 my-10">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <form onSubmit={handleAuth} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <input 
                    type="text" 
                    name="name" 
                    placeholder="Full Name" 
                    value={form.name}
                    onChange={handleChange} 
                    className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
                </div>
                <div>
                  <input 
                    type="text" 
                    name="phone" 
                    placeholder="Phone Number" 
                    value={form.phone}
                    onChange={handleChange} 
                    className={`w-full p-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone[0]}</p>}
                </div>
                <div>
                  <input 
                    type="text" 
                    name="service" 
                    placeholder="Service you provide" 
                    value={form.service}
                    onChange={handleChange} 
                    className={`w-full p-3 border rounded-lg ${errors.service ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  {errors.service && <p className="text-red-500 text-sm mt-1">{errors.service[0]}</p>}
                </div>
                <div>
                  <input 
                    type="text" 
                    name="location" 
                    placeholder="Please fill your pincode, district, state"   
                    value={form.location}
                    onChange={handleChange} 
                    className={`w-full p-3 border rounded-lg ${errors.location ? 'border-red-500' : 'border-gray-300'}`} 
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location[0]}</p>}
                </div>
              </>
            )}
            <div>
              <input 
                type="email" 
                name="email" 
                placeholder="Email" 
                value={form.email}
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                placeholder="Password" 
                value={form.password}
                onChange={handleChange} 
                className={`w-full p-3 border rounded-lg pr-10 ${errors.password ? 'border-red-500' : 'border-gray-300'}`} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password[0]}</p>}
            </div>
            <button 
              type="submit" 
              className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              {isRegister ? "Register" : "Login"}
            </button>
          </form>
          <div className="text-center mt-4">
            <p 
              className="text-sm text-blue-600 cursor-pointer hover:underline" 
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister 
                ? "Already have an account? Login" 
                : "Don't have an account? Register"}
            </p>
            {!isRegister && (
              <div className="mt-4">
                <input 
                  type="email" 
                  placeholder="Enter email to reset password" 
                  value={emailForReset}
                  onChange={(e) => setEmailForReset(e.target.value)} 
                  className="w-full p-3 border rounded-lg mb-2" 
                />
                <button 
                  onClick={handleForgotPassword} 
                  className="w-full p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>
          {message && (
            <p className={`text-center mt-4 ${
              message.includes('successful') ? 'text-green-600' : 'text-red-500'
            }`}>
              {message}
            </p>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default ServiceProvider;