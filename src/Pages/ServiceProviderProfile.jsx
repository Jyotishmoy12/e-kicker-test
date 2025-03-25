import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { Edit, Save, Camera, MapPin, Phone, Mail, LogOut } from "lucide-react";
import { z } from "zod";
import Header from "../components/Navbar";
import Footer from "../components/Footer";

// Profile update validation schema
const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  service: z.string().min(2, "Service name must be at least 2 characters"),
  location: z.string().min(2, "Location must be at least 2 characters"),
  description: z.string().max(500, "Description must be 500 characters or less").optional()
});

const ServiceProviderProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    location: "",
    description: "",
    profilePicture: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate('/');
          return;
        }

        const docRef = doc(db, "service_providers", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile({
            ...docSnap.data(),
            email: user.email
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Validate profile update
  const validateProfile = () => {
    try {
      profileUpdateSchema.parse({
        name: profile.name,
        phone: profile.phone,
        service: profile.service,
        location: profile.location,
        description: profile.description
      });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  // Save profile updates
  const handleSaveProfile = async () => {
    if (!validateProfile()) return;

    try {
      const user = auth.currentUser;
      const profileData = {
        name: profile.name,
        phone: profile.phone,
        service: profile.service,
        location: profile.location,
        description: profile.description
      };

      // Upload profile picture if selected
      if (profileImage) {
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        await uploadBytes(storageRef, profileImage);
        const downloadURL = await getDownloadURL(storageRef);
        profileData.profilePicture = downloadURL;
      }

      // Update Firestore document
      const docRef = doc(db, "service_providers", user.uid);
      await updateDoc(docRef, profileData);

      // Update local state and exit editing mode
      setProfile(prev => ({
        ...prev,
        ...profileData
      }));
      setIsEditing(false);
      setProfileImage(null);
      setPreviewImage(null);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await auth.signOut();
      console.log("Successfully logged out");
      navigate('/service-provider');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Render profile image or placeholder
  const renderProfileImage = () => {
    if (previewImage) return previewImage;
    return profile.profilePicture || "/api/placeholder/200/200";
  };

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 relative">
        <button 
          onClick={handleLogout}
          className="absolute top-4 right-4 text-red-500 hover:text-red-600 transition cursor-pointer"
        >
         <LogOut/>
        </button>

        <div className="relative flex justify-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-200 relative">
            <img 
              src={renderProfileImage()} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <label className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center cursor-pointer">
                <Camera className="text-white" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        </div>

        <div className="text-center mb-6">
          {isEditing ? (
            <>
              <input 
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                placeholder="Your Name"
                className={`w-full text-2xl font-bold text-center mb-2 border-b ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name[0]}</p>}
            </>
          ) : (
            <h2 className="text-2xl font-bold">{profile.name}</h2>
          )}
          <p className="text-gray-600">{profile.email}</p>
        </div>

        <div className="space-y-4">
          {[
            { 
              icon: <Phone />, 
              field: "phone", 
              placeholder: "Phone Number" 
            },
            { 
              icon: <Mail />, 
              field: "service", 
              placeholder: "Service Name" 
            },
            { 
              icon: <MapPin />, 
              field: "location", 
              placeholder: "Location" 
            }
          ].map(({ icon, field, placeholder }) => (
            <div key={field} className="flex items-center">
              <div className="mr-4 text-blue-500">{icon}</div>
              {isEditing ? (
                <div className="flex-grow">
                  <input 
                    type="text"
                    name={field}
                    value={profile[field]}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className={`w-full border-b ${errors[field] ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors[field] && <p className="text-red-500 text-sm">{errors[field][0]}</p>}
                </div>
              ) : (
                <p className="flex-grow">{profile[field]}</p>
              )}
            </div>
          ))}

          <div className="mt-4">
            <label className="block text-gray-700 mb-2">Description</label>
            {isEditing ? (
              <textarea 
                name="description"
                value={profile.description || ""}
                onChange={handleInputChange}
                placeholder="Tell us about your service..."
                className="w-full border rounded-lg p-2 h-24"
              />
            ) : (
              <p className="text-gray-600">
                {profile.description || "No description available"}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          {isEditing ? (
            <button 
              onClick={handleSaveProfile}
              className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              <Save className="mr-2" /> Save Profile
            </button>
          ) : (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <Edit className="mr-2" /> Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default ServiceProviderProfile;