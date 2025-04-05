"use client";
import { useAuth, USER_TYPES } from '@/context/authContext';
import LandingPage from './components/LandingPage';
import CustomerDashboard from './components/CustomerDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function Home() {
  const { isAuthenticated, isCustomer, isBusiness } = useAuth();
  
  // Render different content based on authentication state
  if (isAuthenticated() && isCustomer()) {
    return (
      <>
        <CustomerDashboard />
      </>
    );
  }
  
  // If user is a business, you would return a BusinessDashboard here
  // This will be handled by your teammate
  if (isAuthenticated() && isBusiness()) {
    return (
      <>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-3xl font-bold mb-4">Business Dashboard</h1>
            <p className="text-gray-400">Your business dashboard is being developed.</p>
          </div>
        </div>
      </>
    );
  }
  
  // Default: render landing page for guests
  return <LandingPage />;
}