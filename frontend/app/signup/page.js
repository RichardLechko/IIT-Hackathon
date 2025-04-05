"use client";
import { useState } from "react";
import Link from "next/link";

export default function Signup() {
  const [userType, setUserType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    address: "",
    phoneNumber: "",
  });
  const [step, setStep] = useState(1);

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setStep(2);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend
    console.log("Form submitted:", userType, formData);
    // Redirect to success page or dashboard
    alert(`${userType} account created successfully!`);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded border-2 border-gray-700 overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-6">
            <Link href="/" className="text-2xl font-bold text-white">
              NowOrNever
            </Link>
            <div className="w-16 h-1 bg-blue-500 mx-auto my-4"></div>
            <h2 className="text-3xl font-bold text-white">
              Create an Account
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Join the movement to reduce food waste in Chicago
            </p>
          </div>

          <div>
            <p className="text-center mb-6 text-gray-300">
              Choose account type:
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/signup/restaurant"
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-700 rounded hover:border-blue-500 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-10 w-10 text-blue-400 mb-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span className="font-medium text-white">
                  Restaurant / Business
                </span>
                <span className="text-sm text-gray-400 mt-1">
                  I want to reduce food waste
                </span>
              </Link>
              <Link
                href="/signup/customer"
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-700 rounded hover:border-blue-500 bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-10 w-10 text-blue-400 mb-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="font-medium text-white">Customer</span>
                <span className="text-sm text-gray-400 mt-1">
                  I want to discover deals
                </span>
              </Link>
            </div>
          </div>

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