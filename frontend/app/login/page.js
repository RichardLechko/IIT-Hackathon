"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth, USER_TYPES } from "../../context/authContext";
import { useRouter } from "next/navigation";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, you would validate credentials with your backend
    // For this demo, we'll simulate a successful login
    try {
      // Simulate successful login
      const userData = {
        id: '123',
        name: formData.email.split('@')[0], // Just use the username part of email as name
        email: formData.email,
      };
      
      // Assume it's a customer for now - in a real app you'd determine this from backend
      login(userData, USER_TYPES.CUSTOMER);
      
      // Redirect to home page initially, later we can change this to dashboard
      router.push('/');
    } catch (err) {
      setError("Invalid login credentials");
    }
  };

  const inputClass = "mt-1 block w-full bg-gray-800 border border-gray-700 rounded py-2 px-3 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500";
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
              Sign In
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Access your account to manage your food orders
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </a>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 border border-blue-500 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}