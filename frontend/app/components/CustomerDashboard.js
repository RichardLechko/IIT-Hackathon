"use client";
import { useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState("Chicago Loop");
  
  // Sample data for food deals
  const deals = [
    {
      id: 1,
      restaurantName: "Pasta Palace",
      description: "Handmade pasta with signature sauces - takeout only",
      originalPrice: 16.99,
      discountedPrice: 6.99,
      imageUrl: "/pasta.jpg",
      closingTime: "8:00 PM",
      distance: "0.3 miles",
      tags: ["Italian", "Pasta"]
    },
    {
      id: 2,
      restaurantName: "Green Garden",
      description: "Farm-to-table vegetarian bowls and smoothies",
      originalPrice: 12.99,
      discountedPrice: 5.50,
      imageUrl: "/salad.jpg",
      closingTime: "9:30 PM",
      distance: "0.8 miles",
      tags: ["Vegetarian", "Healthy"]
    },
    {
      id: 3,
      restaurantName: "Taco Fiesta",
      description: "Authentic street tacos and fresh salsa",
      originalPrice: 14.99,
      discountedPrice: 7.25,
      imageUrl: "/tacos.jpg",
      closingTime: "10:00 PM",
      distance: "1.2 miles",
      tags: ["Mexican", "Spicy"]
    },
    {
      id: 4,
      restaurantName: "Burger Barn",
      description: "Gourmet burgers with house-made pickles",
      originalPrice: 15.99,
      discountedPrice: 8.99,
      imageUrl: "/burger.jpg", 
      closingTime: "9:00 PM",
      distance: "0.5 miles",
      tags: ["American", "Burgers"]
    }
  ];
  
  // Saved deals for the user
  const savedDeals = [
    {
      id: 5,
      restaurantName: "Sushi Supreme",
      description: "Chef's selection of premium sushi rolls",
      originalPrice: 22.99,
      discountedPrice: 12.50,
      closingTime: "9:30 PM",
      savingPercentage: "45%"
    }
  ];
  
  // Component for individual deal card
  const DealCard = ({ deal }) => (
    <div className="bg-gray-800 border-2 border-gray-700 rounded overflow-hidden">
      <div className="h-48 bg-gray-700 flex items-center justify-center">
        <p className="text-gray-500">Food Image</p>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white text-xl font-semibold">{deal.restaurantName}</h3>
          <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">
            {calculateDiscount(deal.originalPrice, deal.discountedPrice)}% OFF
          </span>
        </div>
        <p className="text-gray-400 mb-4">{deal.description}</p>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="mr-4">Closes at {deal.closingTime}</span>
          <span>{deal.distance}</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-400 line-through mr-2">${deal.originalPrice.toFixed(2)}</span>
            <span className="text-blue-400 font-bold">${deal.discountedPrice.toFixed(2)}</span>
          </div>
          <button 
            onClick={() => handleViewDeal(deal.id)} 
            className="bg-blue-600 text-white px-4 py-2 rounded border border-blue-500 hover:bg-blue-700 transition-colors"
          >
            View Deal
          </button>
        </div>
      </div>
    </div>
  );
  
  // Component for activity item
  const ActivityItem = ({ deal }) => (
    <div className="flex items-center justify-between border-b border-gray-700 py-4">
      <div>
        <h3 className="text-white font-medium">{deal.restaurantName}</h3>
        <p className="text-gray-400 text-sm">{deal.description}</p>
      </div>
      <div className="text-right">
        <p className="text-blue-400 font-bold">Saved {deal.savingPercentage}</p>
        <p className="text-gray-500 text-sm">Closes at {deal.closingTime}</p>
      </div>
    </div>
  );
  
  // Function to calculate discount percentage
  const calculateDiscount = (original, discounted) => {
    return Math.round(((original - discounted) / original) * 100);
  };
  
  // Function to handle viewing a deal
  const handleViewDeal = (dealId) => {
    console.log(`Viewing deal ${dealId}`);
    // In a real app, this would navigate to the deal details page
    // router.push(`/deals/${dealId}`);
  };
  
  // Function to handle browsing all deals
  const handleBrowseDeals = () => {
    console.log("Browsing all deals");
    // router.push('/browse');
  };
  
  // Function to handle viewing orders
  const handleViewOrders = () => {
    console.log("Viewing orders");
    // router.push('/orders');
  };
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}</h1>
        <div className="w-16 h-1 bg-blue-500 mb-8"></div>
        
        {/* Location selector */}
        <div className="mb-8 flex items-center">
          <span className="text-gray-400 mr-3">Your location:</span>
          <select 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option>Chicago Loop</option>
            <option>Wicker Park</option>
            <option>Logan Square</option>
            <option>Lincoln Park</option>
            <option>West Loop</option>
          </select>
        </div>
        
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
            <h2 className="text-xl font-bold text-white mb-4">Nearby Deals</h2>
            <p className="text-gray-400 mb-6">Discover food deals available near your location.</p>
            <button 
              onClick={handleBrowseDeals} 
              className="bg-blue-600 text-white px-4 py-2 rounded border border-blue-500 hover:bg-blue-700 transition-colors"
            >
              Browse Deals
            </button>
          </div>
          
          <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
            <h2 className="text-xl font-bold text-white mb-4">My Orders</h2>
            <p className="text-gray-400 mb-6">View and manage your past and upcoming orders.</p>
            <button 
              onClick={handleViewOrders}
              className="bg-blue-600 text-white px-4 py-2 rounded border border-blue-500 hover:bg-blue-700 transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
        
        {/* Deals near you */}
        <h2 className="text-2xl font-bold text-white mb-4">Deals Near You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {deals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
        
        {/* Recent Activity */}
        <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
          {savedDeals.length > 0 ? (
            <div>
              {savedDeals.map(deal => (
                <ActivityItem key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No recent activity yet. Start browsing deals to get started!</p>
          )}
        </div>
      </div>
    </div>
  );
}