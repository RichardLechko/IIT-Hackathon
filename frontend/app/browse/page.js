"use client";
import { useEffect } from 'react';
import { useAuth, USER_TYPES } from '../../context/authContext';
import { useRouter } from 'next/navigation';

export default function BrowsePage() {
  const { user, isAuthenticated, isCustomer } = useAuth();
  const router = useRouter();

  // Protected route - redirect if not authenticated as customer
  useEffect(() => {
    if (!isAuthenticated() || !isCustomer()) {
      router.push('/login');
    }
  }, [isAuthenticated, isCustomer, router]);

  // Show loading or unauthorized message while checking auth
  if (!isAuthenticated() || !isCustomer()) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Checking authorization...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Browse Deals</h1>
          <div className="w-16 h-1 bg-blue-500 my-4"></div>
          <p className="text-gray-400">Find great food deals near you in Chicago</p>
        </div>

        {/* Placeholder for deals - you'll replace this with actual data */}
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-gray-800 border-2 border-gray-700 rounded p-6">
              <div className="h-40 bg-gray-700 rounded mb-4 flex items-center justify-center">
                <p className="text-gray-500">Food Image</p>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Restaurant Name</h3>
              <p className="text-gray-400 mb-2">Delicious meal description goes here. This would be replaced with actual data.</p>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <span className="text-gray-400 line-through mr-2">$12.99</span>
                  <span className="text-blue-400 font-bold">$5.99</span>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded border border-blue-500 hover:bg-blue-700 transition-colors">
                  View Deal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}