"use client";
import { useState, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, USER_TYPES } from "@/context/authContext";
import { getSupabase } from "@/lib/supabase";

// Memoized form components for better performance
const FormInput = memo(({ id, name, type, required, value, onChange, placeholder, label, disabled = false, maxLength, pattern, title }) => {
  const inputClass = "mt-1 block w-full bg-gray-800 border border-gray-700 rounded py-2 px-3 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
  const labelClass = "block text-sm font-medium text-gray-300";
  
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        className={inputClass}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        pattern={pattern}
        title={title}
      />
      {id === 'password' && (
        <p className="mt-1 text-xs text-gray-400">
          Minimum 8 characters
        </p>
      )}
    </div>
  );
});

FormInput.displayName = "FormInput";

// Error message component
const ErrorMessage = memo(({ message }) => {
  if (!message) return null;
  
  return (
    <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm">
      {message}
    </div>
  );
});

ErrorMessage.displayName = "ErrorMessage";

// Location status component
const LocationStatus = memo(({ status }) => {
  if (!status) return null;
  
  const isError = status.includes("error") || status.includes("denied");
  const textColor = isError ? "text-red-400" : "text-blue-400";
  
  return (
    <p className={`mt-1 text-xs ${textColor}`}>
      {status}
    </p>
  );
});

LocationStatus.displayName = "LocationStatus";

// Loading indicator component
const LoadingIndicator = memo(() => (
  <div className="flex justify-center my-2">
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
  </div>
));

LoadingIndicator.displayName = "LoadingIndicator";

// Geocoding service with caching - lazy initialized
let geocodeServiceInstance = null;
const getGeocodeService = () => {
  if (!geocodeServiceInstance) {
    geocodeServiceInstance = {
      cache: new Map(),
      
      async reverseGeocode(lat, lng) {
        const cacheKey = `${lat},${lng}`;
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
          return this.cache.get(cacheKey);
        }
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { 
              headers: { 'Accept-Language': 'en' },
              cache: 'force-cache'
            }
          );
          
          if (!response.ok) {
            throw new Error(`Geocoding failed with status: ${response.status}`);
          }
          
          const data = await response.json();
          const address = data?.display_name || '';
          
          // Cache the result
          this.cache.set(cacheKey, address);
          
          return address;
        } catch (error) {
          console.error("Geocoding error:", error);
          return '';
        }
      }
    };
  }
  return geocodeServiceInstance;
};

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
  const [hashingPassword, setHashingPassword] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  // Improved location handling
  useEffect(() => {
    setIsMounted(true);
    
    // Clean up function to clear geolocation timeout
    return () => {
      if (window.geoTimeoutId) {
        clearTimeout(window.geoTimeoutId);
      }
    };
  }, []);


  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleLocationCheckbox = useCallback((e) => {
    const isChecked = e.target.checked;
    setUseCurrentLocation(isChecked);
    
    if (isChecked) {
      // Wrap in a check to ensure we're in a browser environment
      if (typeof window !== 'undefined' && window.navigator.geolocation) {
        getCurrentLocation();
      } else {
        setLocationStatus("Geolocation is not supported");
        setUseCurrentLocation(false);
      }
    } else {
      // Clear location-related states when unchecked
      setFormData(prev => ({ ...prev, address: "" }));
      setCoordinates({ lat: null, lng: null });
      setLocationStatus("");
    }
  }, []);

  const getCurrentLocation = useCallback(() => {
    // Ensure we're in a browser environment and geolocation is supported
    if (typeof window === 'undefined' || !window.navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser");
      setUseCurrentLocation(false);
      return;
    }
    
    setLocationStatus("Requesting location...");
    
    // Clear any existing geolocation timeouts
    if (window.geoTimeoutId) {
      clearTimeout(window.geoTimeoutId);
    }

    // More robust geolocation options
    const options = {
      enableHighAccuracy: true, 
      timeout: 40000,  // 10 seconds
      maximumAge: 50000 // 30 seconds
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        try {
          setLocationStatus("Finding address...");
          const geocodeService = getGeocodeService();
          const address = await geocodeService.reverseGeocode(latitude, longitude);
          
          if (address) {
            setFormData(prev => ({ ...prev, address }));
            setLocationStatus("Location found successfully");
          } else {
            setLocationStatus("Location found, but couldn't get precise address");
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          setLocationStatus("Location coordinates captured (address lookup failed)");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Error getting location";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location or enter address manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        setLocationStatus(errorMessage);
        setUseCurrentLocation(false);
        setCoordinates({ lat: null, lng: null });
      },
      options
    );

    // Backup timeout
    window.geoTimeoutId = setTimeout(() => {
      setLocationStatus("Location request timed out. Please try again or enter address manually.");
      setUseCurrentLocation(false);
    }, 15000);
  }, []);

  // Clean up geolocation timeout on unmount
  useEffect(() => {
    return () => {
      if (window.geoTimeoutId) {
        clearTimeout(window.geoTimeoutId);
      }
    };
  }, []);

  // Validation functions - memoized for performance
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePassword = useCallback((password) => {
    return password.length >= 8;
  }, []);

  const validatePhoneNumber = useCallback((phone) => {
    const phoneRegex = /^\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}$/;
    return phoneRegex.test(phone);
  }, []);

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
      const supabase = getSupabase();
      
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email.trim().toLowerCase())
        .single();
      
      if (existingUser) {
        setError("This email is already registered. Please use a different email or log in.");
        setIsLoading(false);
        return;
      }
      
      // Load bcrypt dynamically to prevent initial page load delay
      setHashingPassword(true);
      // Dynamic import of bcrypt for better initial page load time
      const bcryptModule = await import('bcryptjs');
      const bcrypt = bcryptModule.default;
      
      // Hash the password with optimal security settings
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(formData.password, salt);
      setHashingPassword(false);
      
      // Insert user data into Supabase
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password_hash: hashedPassword,
            phone_number: formData.phoneNumber.trim(),
            is_restaurant: true,
            lat: coordinates.lat,
            lng: coordinates.lng,
            created_at: new Date().toISOString(),
          },
        ])
        .select();
      
      if (error) {
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
        
        // Redirect to restaurant dashboard
        router.push('/');
      }
    } catch (err) {
      console.error('Error creating restaurant account:', err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

          <ErrorMessage message={error} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput
              id="name"
              name="name"
              type="text"
              required={true}
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Restaurant Name"
              label="Business Name"
              maxLength={100}
            />

            <FormInput
              id="email"
              name="email"
              type="email"
              required={true}
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              label="Email Address"
              pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
              title="Please enter a valid email address"
            />

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-300">
                Business Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded py-2 px-3 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, Chicago, IL"
                disabled={useCurrentLocation}
                maxLength={200}
              />
              {isMounted && (
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
              )}
              <LocationStatus status={locationStatus} />
            </div>

            <FormInput
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required={true}
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="(312) 555-1234"
              label="Phone Number"
              pattern="\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}"
              title="Please enter a valid phone number"
            />

            <FormInput
              id="password"
              name="password"
              type="password"
              required={true}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              label="Password"
              minLength={8}
              title="Password must be at least 8 characters long"
            />

            <FormInput
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required={true}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              label="Confirm Password"
            />

            <div className="flex items-center justify-between pt-4">
              <Link
                href="/signup"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                Back
              </Link>
              <button
                type="submit"
                disabled={isLoading || hashingPassword}
                className="bg-blue-600 text-white py-2 px-6 border border-blue-500 rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || hashingPassword ? (
                  <span className="flex items-center">
                    <span className="mr-2">
                      {hashingPassword ? "Securing Password..." : "Creating Account..."}
                    </span>
                    <LoadingIndicator />
                  </span>
                ) : (
                  "Create Account"
                )}
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