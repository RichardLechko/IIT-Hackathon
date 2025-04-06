"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      // Reset loading and error states
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("claims")
          .select("*, deals(*, users(name))")
          .eq("customer_id", user.id)
          .order("claimed_at", { ascending: false });

        if (error) {
          throw error;
        }

        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading your orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center">
        Error loading orders: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      {orders.length === 0 ? (
        <p>You haven't claimed any deals yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(({ id, claimed_at, deals }) => (
            <div 
              key={id} 
              className="border rounded-lg p-4 shadow-md"
            >
              <h2 className="text-xl font-semibold">{deals.title}</h2>
              <p className="text-gray-600">
                {deals.users?.name || "Unknown Restaurant"}
              </p>
              <p className="mb-2">{deals.description}</p>
              
              <div className="text-sm text-gray-500 mb-2">
                <p>Claimed: {new Date(claimed_at).toLocaleString()}</p>
                <p>
                  Pickup window:{" "}
                  {new Date(deals.pickup_start).toLocaleTimeString()} -{" "}
                  {new Date(deals.pickup_end).toLocaleTimeString()}
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">
                  ${deals.updated_price?.toFixed(2)}
                </span>
                <button
                  onClick={() => router.push(`/deals/${deals.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded border border-blue-500 text-white"
                >
                  View Deal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}