"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RestaurantHome() {
  const { user, isBusiness, logout } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [newDeal, setNewDeal] = useState({
    title: "",
    description: "",
    quantity: "",
    pickup_start: "",
    pickup_end: "",
    original_price: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing deals for this restaurant
  useEffect(() => {
    if (user) {
      fetchDeals();
    }
  }, [user]);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .eq('restaurant_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDeals(data || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDeal({ ...newDeal, [name]: value });
  };

  const formatDateTimeForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const dealData = {
        title: newDeal.title,
        description: newDeal.description,
        quantity: parseInt(newDeal.quantity, 10),
        pickup_start: new Date(newDeal.pickup_start).toISOString(),
        pickup_end: new Date(newDeal.pickup_end).toISOString(),
        original_price: parseFloat(newDeal.original_price),
        claimed: false,
        restaurant_id: user.id,
        // Remove any id field if it exists
        // Let Supabase handle the id generation
      };

      const { data, error } = await supabase
        .from('deals')
        .insert([dealData])
        .select();
      
      if (error) throw error;
      
      if (data) {
        // Reset form and refresh deals
        setNewDeal({
          title: "",
          description: "",
          quantity: "",
          pickup_start: "",
          pickup_end: "",
          original_price: "",
        });
        fetchDeals();
      }
    } catch (err) {
      console.error('Error creating deal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Show loading indicator while user is being created
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Restaurant Dashboard
            </h1>
            <div className="w-16 h-1 bg-blue-500 my-4"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Post New Deal Form */}
          <div className="bg-gray-800 p-6 rounded border-2 border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white border-b border-gray-700 pb-2">
              Post New Deal
            </h2>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={newDeal.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={newDeal.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  rows="3"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={newDeal.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  required
                  min="1"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  Original Price
                </label>
                <input
                  type="number"
                  name="original_price"
                  value={newDeal.original_price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  step="0.01"
                  min="0"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  Pickup Start
                </label>
                <input
                  type="datetime-local"
                  name="pickup_start"
                  value={newDeal.pickup_start}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  Pickup End
                </label>
                <input
                  type="datetime-local"
                  name="pickup_end"
                  value={newDeal.pickup_end}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-medium border border-blue-500 transition duration-200 ease-in-out"
              >
                {isLoading ? "Creating Deal..." : "Create Deal"}
              </button>
            </form>
          </div>

          {/* Active Deals */}
          <div className="bg-gray-800 p-6 rounded border-2 border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white border-b border-gray-700 pb-2">
              Your Active Deals
            </h2>
            <div className="space-y-4">
              {deals.length === 0 ? (
                <p className="text-gray-400">No active deals. Create your first deal now!</p>
              ) : (
                deals.map((deal) => (
                  <div key={deal.id} className="bg-gray-700 p-4 rounded border border-gray-600">
                    <h3 className="text-white font-semibold">{deal.title}</h3>
                    {deal.description && <p className="text-gray-300 mt-1">{deal.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-sm text-gray-400">Qty: {deal.quantity}</span>
                      <span className="text-sm text-gray-400">Price: ${deal.original_price}</span>
                      <span className="text-sm text-gray-400">
                        {new Date(deal.pickup_start).toLocaleString()} - {new Date(deal.pickup_end).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className={`text-sm px-2 py-1 rounded ${deal.claimed ? "bg-green-900 text-green-300" : "bg-blue-900 text-blue-300"}`}>
                        {deal.claimed ? "Claimed" : "Available"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
