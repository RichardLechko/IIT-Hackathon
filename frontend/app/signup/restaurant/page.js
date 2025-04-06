"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, USER_TYPES } from "@/context/authContext";
import { supabase } from "@/lib/supabase";
import bcrypt from 'bcryptjs';

export default function RestaurantSignup() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    address: "",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle location checkbox change
  const handleLocationCheckbox = (e) => {
    const isChecked = e.target.checked;
    setUseCurrentLocation(isChecked);
    
    if (isChecked) {
      getCurrentLocation();
    } else {
      // Clear the address field if user unchecks the box
      setFormData(prev => ({ ...prev, address: "" }));
      setCoordinates({ lat: null, lng: null });
      setLocationStatus("");
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    setLocationStatus("Requesting location...");
    
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        // Attempt to reverse geocode to get address
        try {
          // This is a simple example using a free geocoding API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
            setLocationStatus("Location found");
          } else {
            setLocationStatus("Location found, but couldn't get address");
          }
        } catch (error) {
          console.error("Error getting address:", error);
          setLocationStatus("Location coordinates captured (address lookup failed)");
          // Just use the coordinates without address
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        setLocationStatus(
          error.code === 1
            ? "Location permission denied"
            : "Error getting location"
        );
        setUseCurrentLocation(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    // Input validation
    if (!formData.name.trim()) {
      setError("Business name is required");
      setIsLoading(false);
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }
    
    if (!validatePhoneNumber(formData.phoneNumber)) {
      setError("Please enter a valid phone number (e.g., (312) 555-1234)");
      setIsLoading(false);
      return;
    }
    
    if (!validatePassword(formData.password)) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }
    
    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(formData.password, salt);
      
      // Insert user data into Supabase
      const { data, error } = await supabase
        .from('users')
        .insert([
          { 
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password_hash: hashedPassword,
            phone_number: formData.phoneNumber.trim(),
            is_restaurant: true,
            lat: coordinates.lat, 
            lng: coordinates.lng,
            created_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (error) {
        // Check for duplicate email error
        if (error.code === '23505') {
          throw new Error("This email is already registered. Please use a different email or log in.");
        }
        throw error;
      }
      
      if (data && data[0]) {
        // Use the auth context to log the user in
        login({
          id: data[0].id,
          name: data[0].name,
          email: data[0].email,
          businessName: formData.businessName
        }, USER_TYPES.BUSINESS);
        
        // Redirect to home page
        router.push('/');
      }
    } catch (err) {
      console.error('Error creating restaurant account:', err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "mt-1 block w-full bg-gray-800 border border-gray-700 rounded py-2 px-3 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-300";

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded border-2 border-gray-700 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-6">
            <Link href="/" className="text-2xl font-bold text-white">
              NowOrNever
            </Link>
            <div className="w-16 h-1 bg-blue-500 mx-auto my-4"></div>
            <h2 className="text-3xl font-bold text-white">
              Restaurant Sign Up
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Join us to reduce food waste in Chicago
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className={labelClass}>
                Business Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={inputClass}
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Restaurant Name"
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={inputClass}
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                title="Please enter a valid email address"
              />
            </div>

            <div>
              <label htmlFor="address" className={labelClass}>
                Business Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                className={inputClass}
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, Chicago, IL"
                disabled={useCurrentLocation}
                maxLength={200}
              />
              <div className="mt-2 flex items-center">
                <input
                  id="useCurrentLocation"
                  name="useCurrentLocation"
                  type="checkbox"
                  checked={useCurrentLocation}
                  onChange={handleLocationCheckbox}
                  className="h-4 w-4 bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500 rounded"
                />
                <label htmlFor="useCurrentLocation" className="ml-2 text-sm text-gray-400">
                  Use current location
                </label>
              </div>
              {locationStatus && (
                <p className={`mt-1 text-xs ${
                  locationStatus.includes("error") || locationStatus.includes("denied") 
                    ? "text-red-400" 
                    : "text-blue-400"
                }`}>
                  {locationStatus}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phoneNumber" className={labelClass}>
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className={inputClass}
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="(312) 555-1234"
                pattern="\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}"
                title="Please enter a valid phone number"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={inputClass}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                minLength={8}
                title="Password must be at least 8 characters long"
              />
              <p className="mt-1 text-xs text-gray-400">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={inputClass}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <Link
                href="/signup"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Back
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white py-2 px-6 border border-blue-500 rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}