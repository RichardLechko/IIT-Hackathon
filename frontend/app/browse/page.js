"use client";
import { useEffect, useState, useCallback, memo, useMemo } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

// Memoized distance calculation function
const calculateDistanceMiles = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  
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
};

// Format price helper
const formatPrice = (price) => {
  if (price === null || price === undefined) return "0.00";
  return parseFloat(price).toFixed(2);
};

// Calculate discount percentage
const calculateDiscount = (original, discounted) => {
  if (!original || !discounted) return 0;
  return Math.round(((original - discounted) / original) * 100);
};

// Format time helper
const formatTime = (isoTime) => {
  try {
    return new Date(isoTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  } catch (e) {
    console.error("Time formatting error:", e);
    return "N/A";
  }
};

// Memoized DealCard component for better rendering performance
const DealCard = memo(({ deal, onViewDeal }) => (
  <div className="bg-gray-800 border-2 border-gray-700 rounded p-6 flex flex-col">
    <div className="h-40 bg-gray-700 rounded mb-4 overflow-hidden flex items-center justify-center">
      {deal.imageUrl ? (
        <img
          src={deal.imageUrl}
          alt={`${deal.title} from ${deal.restaurantName}`}
          className="w-full h-full object-cover"
          loading="lazy"
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
      <span>Closes at {formatTime(deal.pickup_end)}</span>
      <span>{deal.distance} mi</span>
    </div>
    <div className="flex justify-between items-center mt-auto">
      <div>
        <span className="text-gray-400 line-through mr-2">
          ${formatPrice(deal.original_price)}
        </span>
        <span className="text-blue-400 font-bold">
          ${formatPrice(deal.updated_price)}
        </span>
      </div>
      <button
        onClick={() => onViewDeal(deal.id)}
        className="bg-blue-600 text-white px-4 py-2 rounded border border-blue-500 hover:bg-blue-700 transition-colors"
      >
        View Deal
      </button>
    </div>
  </div>
));

DealCard.displayName = "DealCard";

// Loading component
const LoadingIndicator = memo(() => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-pulse flex space-x-2">
      <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
      <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
      <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
    </div>
    <p className="text-gray-400 ml-3">Loading deals...</p>
  </div>
));

LoadingIndicator.displayName = "LoadingIndicator";

// Empty state component
const EmptyState = memo(() => (
  <div className="text-center py-12">
    <p className="text-gray-400 mb-4">No deals available at the moment.</p>
    <p className="text-gray-500 text-sm">Check back later for new deals from restaurants in your area.</p>
  </div>
));

EmptyState.displayName = "EmptyState";

export default function BrowsePage() {
  const { user, isAuthenticated, isCustomer } = useAuth();
  const router = useRouter();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized function to handle viewing a deal
  const handleViewDeal = useCallback((dealId) => {
    router.push(`/deals/${dealId}`);
  }, [router]);

  // Fetch deals with better error handling and caching
  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabase();
      
      // Get user location
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("lat, lng")
        .eq("id", user?.id)
        .single();

      if (userError) throw new Error(userError.message);
      if (!userData?.lat || !userData?.lng) throw new Error("Location information not available. Please update your profile.");

      // Get available deals
      const { data: dealsData, error: dealsError } = await supabase
        .from("deals")
        .select("*, restaurant_id")
        .eq("claimed", false);

      if (dealsError) throw new Error(dealsError.message);
      if (!dealsData || dealsData.length === 0) {
        setDeals([]);
        setLoading(false);
        return;
      }

      // Create a map of restaurant IDs to query more efficiently
      const restaurantIds = [...new Set(dealsData.map(deal => deal.restaurant_id))];
      
      // Fetch all restaurants in a single query
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from("users")
        .select("id, name, lat, lng")
        .in("id", restaurantIds)
        .eq("is_restaurant", true);
        
      if (restaurantsError) throw new Error(restaurantsError.message);
      
      // Create a lookup map for restaurants
      const restaurantMap = new Map();
      restaurantsData?.forEach(restaurant => {
        restaurantMap.set(restaurant.id, restaurant);
      });

      // Process deals with restaurant data
      const dealsWithRestaurants = await Promise.all(
        dealsData.map(async (deal) => {
          const restaurant = restaurantMap.get(deal.restaurant_id);
          
          // Calculate distance
          const distance = restaurant?.lat && restaurant?.lng
            ? calculateDistanceMiles(
                userData.lat,
                userData.lng,
                restaurant.lat,
                restaurant.lng
              )
            : null;

          // Get deal image if available
          let imageUrl = null;
          try {
            const { data: imageList } = await supabase.storage
              .from("deal-images")
              .list(`${deal.id}`, { limit: 1 });

            if (imageList && imageList.length > 0) {
              const { data: publicUrl } = supabase.storage
                .from("deal-images")
                .getPublicUrl(`${deal.id}/${imageList[0].name}`);
              imageUrl = publicUrl.publicUrl;
            }
          } catch (imgError) {
            console.error("Error fetching image:", imgError);
            // Don't fail the entire deal if image loading fails
          }

          return {
            ...deal,
            restaurantName: restaurant?.name || "Unknown Restaurant",
            distance,
            imageUrl,
          };
        })
      );

      // Sort by distance and filter out deals with null distance
      const sorted = dealsWithRestaurants
        .filter(d => d.distance !== null)
        .sort((a, b) => a.distance - b.distance);

      setDeals(sorted);
    } catch (err) {
      console.error("Error fetching deals:", err);
      setError(err.message || "Failed to load deals. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Auth check and initial data load
  useEffect(() => {
    let isMounted = true;
    
    const checkAuthAndLoadDeals = async () => {
      if (!isAuthenticated() || !isCustomer()) {
        router.push("/login");
        return;
      }
      
      if (isMounted) {
        await fetchDeals();
      }
    };
    
    checkAuthAndLoadDeals();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isCustomer, router, fetchDeals]);

  // Auth loading state
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

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded text-red-200">
            <p className="text-sm">{error}</p>
            <button 
              onClick={fetchDeals} 
              className="mt-2 text-blue-400 hover:underline text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Content area */}
        {loading ? (
          <LoadingIndicator />
        ) : deals.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {deals.map(deal => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onViewDeal={handleViewDeal} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}