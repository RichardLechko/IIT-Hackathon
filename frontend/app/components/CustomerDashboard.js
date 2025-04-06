"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Haversine distance formula
function calculateDistanceMiles(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  return +(distanceKm * 0.621371).toFixed(1);
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [location, setLocation] = useState("Chicago Loop");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDealsWithRestaurants = async () => {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("lat, lng")
        .eq("id", user?.id)
        .single();

      if (userError || !userData?.lat || !userData?.lng) {
        console.error("User location error:", userError?.message || "Missing lat/lng");
        return;
      }

      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("*, restaurant_id");

      if (dealsError) {
        console.error("Error fetching deals:", dealsError.message);
        return;
      }

      const dealsWithRestaurantNames = await Promise.all(
        dealsData.map(async (deal) => {
          const { data: restaurantData } = await supabase
            .from("users")
            .select("name, lat, lng")
            .eq("id", deal.restaurant_id)
            .eq("is_restaurant", true)
            .single();

          const distance = restaurantData?.lat && restaurantData?.lng
            ? calculateDistanceMiles(userData.lat, userData.lng, restaurantData.lat, restaurantData.lng)
            : null;

          return {
            ...deal,
            restaurantName: restaurantData?.name || "Unknown Restaurant",
            distance,
          };
        })
      );

      const sorted = dealsWithRestaurantNames
        .filter((d) => d.distance !== null)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4);

      setDeals(sorted);
      setLoading(false);
    };

    if (user) {
      fetchDealsWithRestaurants();
    }
  }, [user]);

  const savedDeals = [
    {
      id: 5,
      restaurantName: "Sushi Supreme",
      description: "Chef's selection of premium sushi rolls",
      originalPrice: 22.99,
      discountedPrice: 12.5,
      closingTime: "9:30 PM",
      savingPercentage: "45%",
    },
  ];

  const DealCard = ({ deal }) => (
    <div className="bg-gray-800 border-2 border-gray-700 rounded overflow-hidden">
      <div className="h-48 bg-gray-700 flex items-center justify-center">
        <p className="text-gray-500">Food Image</p>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white text-xl font-semibold">
            {deal.restaurantName}
          </h3>
          <span className="bg-blue-900 text-blue-300 text-xs px-2 py-1 rounded">
            {calculateDiscount(deal.original_price, deal.updated_price)}% OFF
          </span>
        </div>
        <p className="text-gray-400 mb-4">{deal.title}</p>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="mr-4">
            Closes at {new Date(deal.pickup_end).toLocaleTimeString()}
          </span>
          <span>{deal.distance} mi</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-gray-400 line-through mr-2">
              ${deal.original_price?.toFixed(2)}
            </span>
            <span className="text-blue-400 font-bold">
              ${deal.updated_price?.toFixed(2)}
            </span>
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

  const calculateDiscount = (original, discounted) => {
    if (!original || !discounted) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

  const handleViewDeal = (dealId) => {
    router.push(`/deals/${dealId}`);
  };

  const handleBrowseDeals = () => {
    console.log("Browsing all deals");
    // router.push('/browse');
  };

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
            <p className="text-gray-400 mb-6">
              Discover food deals available near your location.
            </p>
            <button
              onClick={handleBrowseDeals}
              className="bg-blue-600 text-white px-4 py-2 rounded border border-blue-500 hover:bg-blue-700 transition-colors"
            >
              Browse Deals
            </button>
          </div>

          <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
            <h2 className="text-xl font-bold text-white mb-4">My Orders</h2>
            <p className="text-gray-400 mb-6">
              View and manage your past and upcoming orders.
            </p>
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
          {loading ? (
            <p className="text-gray-400">Loading deals...</p>
          ) : deals.length > 0 ? (
            deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
          ) : (
            <p className="text-gray-400">No deals found near you.</p>
          )}
        </div>

        {/* Recent Activity */}
        <h2 className="text-2xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
          {savedDeals.length > 0 ? (
            <div>
              {savedDeals.map((deal) => (
                <ActivityItem key={deal.id} deal={deal} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">
              No recent activity yet. Start browsing deals to get started!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
