"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Haversine distance formula
function calculateDistanceMiles(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lat2 - lng2);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;
  return +(distanceKm * 0.621371).toFixed(1);
}

export default function BrowsePage() {
  const { user, isAuthenticated, isCustomer } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isCustomer()) {
      router.push("/login");
    } else {
      fetchDeals();
    }
  }, [isAuthenticated, isCustomer, user]);

  const fetchDeals = async () => {
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
  .select("*, restaurant_id")
  .eq("claimed", false); // ✅ only unclaimed deals


    if (dealsError) {
      console.error("Error fetching deals:", dealsError.message);
      return;
    }

    const dealsWithExtras = await Promise.all(
      dealsData.map(async (deal) => {
        const { data: restaurantData } = await supabase
          .from("users")
          .select("name, lat, lng")
          .eq("id", deal.restaurant_id)
          .eq("is_restaurant", true)
          .single();

        let imageUrl = null;
        const { data: imageList } = await supabase.storage
          .from("deal-images")
          .list(`${deal.id}`, { limit: 1 });

        if (imageList && imageList.length > 0) {
          const { data: publicUrl } = supabase.storage
            .from("deal-images")
            .getPublicUrl(`${deal.id}/${imageList[0].name}`);
          imageUrl = publicUrl.publicUrl;
        }

        const distance =
          restaurantData?.lat && restaurantData?.lng
            ? calculateDistanceMiles(
                userData.lat,
                userData.lng,
                restaurantData.lat,
                restaurantData.lng
              )
            : null;

        return {
          ...deal,
          restaurantName: restaurantData?.name || "Unknown Restaurant",
          distance,
          imageUrl,
        };
      })
    );

    const sorted = dealsWithExtras
      .filter((d) => d.distance !== null)
      .sort((a, b) => a.distance - b.distance);

    setDeals(sorted);
    setLoading(false);
  };

  const handleViewDeal = (dealId) => {
    router.push(`/deals/${dealId}`);
  };

  const calculateDiscount = (original, discounted) => {
    if (!original || !discounted) return 0;
    return Math.round(((original - discounted) / original) * 100);
  };

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

        {loading ? (
          <p className="text-gray-400">Loading deals...</p>
        ) : deals.length === 0 ? (
          <p className="text-gray-400">No deals found.</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <div key={deal.id} className="bg-gray-800 border-2 border-gray-700 rounded p-6">
                <div className="h-40 bg-gray-700 rounded mb-4 overflow-hidden flex items-center justify-center">
                  {deal.imageUrl ? (
                    <img
                      src={deal.imageUrl}
                      alt="Deal Image"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <p className="text-gray-500">No Image</p>
                  )}
                </div>
                <h3 className="text-white text-xl font-semibold mb-2">
                  {deal.restaurantName}
                </h3>
                <p className="text-gray-400 mb-2">{deal.title}</p>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                  <span>Closes at {new Date(deal.pickup_end).toLocaleTimeString()}</span>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
