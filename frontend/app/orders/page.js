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

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("claims")
        .select("*, deals(*, users(name))")
        .eq("customer_id", user.id)
        .order("claimed_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error.message);
        return;
      }

      setOrders(data);
      setLoading(false);
    };

    fetchOrders();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">My Orders</h1>
        <div className="w-16 h-1 bg-blue-500 mb-8"></div>

        {orders.length === 0 ? (
          <p className="text-gray-400">You haven't claimed any deals yet.</p>
        ) : (
          <div className="space-y-6">
            {orders.map(({ id, claimed_at, deals }) => (
              <div
                key={id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-white"
              >
                <h2 className="text-xl font-semibold mb-1">{deals.title}</h2>
                <p className="text-blue-400 text-sm mb-3">
                  {deals.users?.name || "Unknown Restaurant"}
                </p>
                <p className="text-gray-300 mb-2">{deals.description}</p>
                <div className="text-sm text-gray-400 mb-2">
                  <p>Claimed: {new Date(claimed_at).toLocaleString()}</p>
                  <p>
                    Pickup window:{" "}
                    {new Date(deals.pickup_start).toLocaleTimeString()} -{" "}
                    {new Date(deals.pickup_end).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-blue-300 font-bold">
                    ${deals.updated_price?.toFixed(2)}
                  </p>
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
    </div>
  );
}
