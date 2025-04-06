"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { supabase } from "@/lib/supabase";

export default function ViewDealPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [deal, setDeal] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDealDetails = async () => {
      try {
        const { data: dealData, error: dealError } = await supabase
          .from("deals")
          .select("*")
          .eq("id", id)
          .single();

        if (dealError || !dealData) throw dealError;
        setDeal(dealData);

        const { data: restaurantData } = await supabase
          .from("users")
          .select("name")
          .eq("id", dealData.restaurant_id)
          .eq("is_restaurant", true)
          .single();

        if (restaurantData) {
          setRestaurant(restaurantData.name);
        }

        const { data: imageList } = await supabase.storage
          .from("deal-images")
          .list(`${dealData.id}`, { limit: 1 });

        if (imageList && imageList.length > 0) {
          const { data: publicUrl } = supabase.storage
            .from("deal-images")
            .getPublicUrl(`${dealData.id}/${imageList[0].name}`);
          setImageUrl(publicUrl.publicUrl);
        }
      } catch (err) {
        console.error("Error loading deal:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDealDetails();
  }, [id]);

  const handleClaimDeal = async () => {
    if (!user || !id || deal.claimed) return;

    setClaiming(true);
    setError("");

    try {
      await supabase.from("claims").insert([
        {
          deal_id: Number(id),
          customer_id: user.id,
          claimed_at: new Date().toISOString(),
          confirmed: false,
        },
      ]);

      await supabase
        .from("deals")
        .update({ claimed: true })
        .eq("id", id);

      setClaimed(true);
      setShowReceipt(true);
    } catch (err) {
      console.error("Error claiming deal:", err);
      setError("Something went wrong while claiming this deal.");
    } finally {
      setClaiming(false);
    }
  };

  const calculateDiscount = (original, discounted) => {
    if (!original || !discounted) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

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
    <div className="min-h-screen bg-gray-900 py-16 px-6 relative">
      {/* Receipt Popup */}
      {showReceipt && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-w-md w-full p-6 text-white text-center animate-fade-in">
            <h2 className="text-2xl font-bold mb-2">🎉 Deal Claimed!</h2>
            <p className="text-blue-400 mb-4 font-medium">{deal.title}</p>
            <div className="text-sm text-gray-300 mb-4">
              <p>Restaurant: <span className="text-white">{restaurant}</span></p>
              <p>Pickup: {new Date(deal.pickup_start).toLocaleTimeString()} – {new Date(deal.pickup_end).toLocaleTimeString()}</p>
              <p>Total: <span className="text-blue-300 font-semibold">${deal.updated_price?.toFixed(2)}</span></p>
            </div>
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded border border-blue-500"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Main Deal UI */}
      <div className="max-w-3xl mx-auto bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
        <div className="h-64 bg-gray-700 flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Deal"
              className="w-full h-full object-cover"
            />
          ) : (
            <p className="text-gray-500">No Image Available</p>
          )}
        </div>

        <div className="p-8">
          <h1 className="text-4xl font-bold text-white mb-1">{deal.title}</h1>
          {restaurant && <p className="text-blue-400 text-sm mb-4">{restaurant}</p>}
          <div className="w-20 h-1 bg-blue-500 mb-6"></div>

          <p className="text-gray-300 text-lg mb-6">{deal.description}</p>

          <div className="space-y-2 text-gray-400 text-sm mb-6">
            <p><span className="text-blue-400 font-medium">Quantity:</span> {deal.quantity}</p>
            <p><span className="text-blue-400 font-medium">Pickup:</span> {new Date(deal.pickup_start).toLocaleTimeString()} – {new Date(deal.pickup_end).toLocaleTimeString()}</p>
            <p><span className="text-blue-400 font-medium">Original Price:</span> <span className="line-through">${deal.original_price?.toFixed(2)}</span></p>
            <p><span className="text-blue-400 font-medium">Discounted Price:</span> <span className="text-blue-300 font-semibold">${deal.updated_price?.toFixed(2)}</span></p>
            <p><span className="text-blue-400 font-medium">You Save:</span> {calculateDiscount(deal.original_price, deal.updated_price)}%</p>
          </div>

          {claimed ? (
            <p className="text-green-400 font-semibold">
              ✔️ Already Claimed
            </p>
          ) : (
            <button
              onClick={handleClaimDeal}
              disabled={claiming || deal.claimed}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-3 rounded border border-blue-500 transition-colors"
            >
              {claiming ? "Claiming..." : deal.claimed ? "Already Claimed" : "Claim Deal"}
            </button>
          )}

          {error && <p className="text-red-400 mt-4">{error}</p>}
        </div>
      </div>
    </div>
  );
}
