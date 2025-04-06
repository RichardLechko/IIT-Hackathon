"use client";
import { useState, useEffect, useCallback, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, USER_TYPES } from "@/context/authContext";
import { getSupabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

// Memoized form components for better performance
const FormInput = memo(
  ({
    id,
    name,
    type,
    required,
    value,
    onChange,
    placeholder,
    label,
    disabled = false,
  }) => {
    const inputClass =
      "mt-1 block w-full bg-gray-800 border border-gray-700 rounded py-2 px-3 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
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
        />
      </div>
    );
  }
);

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

  return <p className={`mt-1 text-xs ${textColor}`}>{status}</p>;
});

LocationStatus.displayName = "LocationStatus";

// Geocoding service with caching
const geocodeService = {
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
        { headers: { "Accept-Language": "en" } }
      );

      const data = await response.json();
      const address = data?.display_name || "";

      // Cache the result
      this.cache.set(cacheKey, address);

      return address;
    } catch (error) {
      console.error("Geocoding error:", error);
      return "";
    }
  },
};

export default function CustomerSignup() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [locationStatus, setLocationStatus] = useState("");

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Handle location checkbox change - memoized for better performance
  const handleLocationCheckbox = useCallback((e) => {
    const isChecked = e.target.checked;
    setUseCurrentLocation(isChecked);

    if (isChecked) {
      getCurrentLocation();
    } else {
      // Clear the address field if user unchecks the box
      setFormData((prev) => ({ ...prev, address: "" }));
      setCoordinates({ lat: null, lng: null });
      setLocationStatus("");
    }
  }, []);

  // Get current location with optimized error handling and debouncing
  const getCurrentLocation = useCallback(() => {
    setLocationStatus("Requesting location...");

    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser");
      return;
    }

    // Clear any existing geolocation timeouts
    if (window.geoTimeoutId) {
      clearTimeout(window.geoTimeoutId);
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });

        // Attempt to reverse geocode to get address
        try {
          setLocationStatus("Finding address...");
          const address = await geocodeService.reverseGeocode(
            latitude,
            longitude
          );

          if (address) {
            setFormData((prev) => ({ ...prev, address }));
            setLocationStatus("Location found");
          } else {
            setLocationStatus("Location found, but couldn't get address");
          }
        } catch (error) {
          console.error("Error getting address:", error);
          setLocationStatus(
            "Location coordinates captured (address lookup failed)"
          );
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

    // Set a backup timeout in case geolocation takes too long
    window.geoTimeoutId = setTimeout(() => {
      setLocationStatus(
        "Location request timed out. Please try again or enter address manually."
      );
      setUseCurrentLocation(false);
    }, 20000);
  }, []);

  // Clean up geolocation timeout on unmount
  useEffect(() => {
    return () => {
      if (window.geoTimeoutId) {
        clearTimeout(window.geoTimeoutId);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Validate password strength - at least 8 characters
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const supabase = getSupabase();

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", formData.email.trim().toLowerCase())
        .single();

      if (existingUser) {
        setError(
          "Email already in use. Please use a different email or login."
        );
        setIsLoading(false);
        return;
      }

      // Hash the password with optimal security settings
      const salt = await bcrypt.genSalt(12); // Increased from 10 to 12 for better security
      const hashedPassword = await bcrypt.hash(formData.password, salt);

      // Insert user data into Supabase
      const { data, error } = await supabase
        .from("users")
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password_hash: hashedPassword,
            phone_number: formData.phoneNumber.trim(),
            is_restaurant: false,
            lat: coordinates.lat,
            lng: coordinates.lng,
            created_at: new Date().toISOString(),
          },
        ])
        .select();

      if (error) throw error;

      if (data && data[0]) {
        // Use the auth context to log the user in
        login(
          {
            id: data[0].id,
            name: data[0].name,
            email: data[0].email,
          },
          USER_TYPES.CUSTOMER
        );

        // Redirect to home page
        router.push("/");
      }
    } catch (err) {
      console.error("Error creating customer account:", err);
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
            <h2 className="text-3xl font-bold text-white">Customer Sign Up</h2>
            <p className="mt-2 text-sm text-gray-400">
              Join us to discover great food deals in Chicago
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
              placeholder="John Doe"
              label="Full Name"
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
            />

            <FormInput
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required={true}
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="(312) 555-1234"
              label="Phone Number"
            />

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-300"
              >
                Address (for finding nearby deals)
              </label>
              <input
                id="address"
                name="address"
                type="text"
                className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded py-2 px-3 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, Chicago, IL"
                disabled={useCurrentLocation}
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
                <label
                  htmlFor="useCurrentLocation"
                  className="ml-2 text-sm text-gray-400"
                >
                  Use current location
                </label>
              </div>
              <LocationStatus status={locationStatus} />
            </div>

            <FormInput
              id="password"
              name="password"
              type="password"
              required={true}
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              label="Password"
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
