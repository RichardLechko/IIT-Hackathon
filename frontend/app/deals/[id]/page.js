"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ViewDealPage() {
  const { id } = useParams();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeal = async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error loading deal:", error.message);
      } else {
        setDeal(data);
      }
      setLoading(false);
    };

    if (id) fetchDeal();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400">
        Deal not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-16 px-6">
      <div className="max-w-3xl mx-auto bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-10">
        <h1 className="text-4xl font-bold text-white mb-2">{deal.title}</h1>
        <div className="w-20 h-1 bg-blue-500 mb-6"></div>

        <p className="text-gray-300 text-lg mb-6">{deal.description}</p>

        <div className="space-y-2 text-gray-400 text-sm mb-8">
          <p>
            <span className="text-blue-400 font-medium">Quantity:</span>{" "}
            {deal.quantity}
          </p>
          <p>
            <span className="text-blue-400 font-medium">Pickup:</span>{" "}
            {new Date(deal.pickup_start).toLocaleTimeString()} –{" "}
            {new Date(deal.pickup_end).toLocaleTimeString()}
          </p>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-3 rounded border border-blue-500 transition-colors">
          Claim Deal
        </button>
      </div>
    </div>
  );
}
