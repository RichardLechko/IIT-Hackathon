"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, USER_TYPES } from "@/context/authContext";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    // In a real app, you would send this data to your backend
    console.log("Restaurant form submitted:", formData);

    // Use the auth context to log the user in as a business
    login(formData, USER_TYPES.BUSINESS);

    // Redirect to home page
    router.push("/");
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className={labelClass}>
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className={inputClass}
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
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
              />
            </div>

            <div>
              <label htmlFor="businessName" className={labelClass}>
                Business Name
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                required
                className={inputClass}
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Your Restaurant Name"
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
              />
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
              />
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
                className="bg-blue-600 text-white py-2 px-6 border border-blue-500 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Create Account
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
