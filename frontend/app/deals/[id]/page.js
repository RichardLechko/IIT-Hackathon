"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, memo } from "react";
import { useAuth } from "@/context/authContext";
import { getSupabase } from "@/lib/supabase";

// Memoized ClaimButton component for better performance
const ClaimButton = memo(({ onClaimDeal, claiming, claimed }) => {
  return claimed ? (
    <p className="text-green-400 font-semibold">
      ✔️ Already Claimed
    </p>
  ) : (
    <button
      onClick={onClaimDeal}
      disabled={claiming || claimed}
      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-3 rounded border border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {claiming ? "Claiming..." : claimed ? "Already Claimed" : "Claim Deal"}
    </button>
  );
});

ClaimButton.displayName = "ClaimButton";

// Memoized DealImage component
const DealImage = memo(({ imageUrl, altText }) => (
  <div className="h-64 bg-gray-700 flex items-center justify-center overflow-hidden">
    {imageUrl ? (
      <img
        src={imageUrl}
        alt={altText}
        className="w-full h-full object-cover"
        loading="eager" // Prioritize loading this image
      />
    ) : (
      <p className="text-gray-500">No Image Available</p>
    )}
  </div>
));

DealImage.displayName = "DealImage";

// Memoized Receipt component
const ReceiptPopup = memo(({ show, deal, restaurant, onClose }) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-w-md w-full p-6 text-white text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">🎉 Deal Claimed!</h2>
        <p className="text-blue-400 mb-4 font-medium">{deal.title}</p>
        <div className="text-sm text-gray-300 mb-4">
          <p>Restaurant: <span className="text-white">{restaurant}</span></p>
          <p>Pickup: {formatTime(deal.pickup_start)} – {formatTime(deal.pickup_end)}</p>
          <p>Total: <span className="text-blue-300 font-semibold">${formatPrice(deal.updated_price)}</span></p>
        </div>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded border border-blue-500"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
});

ReceiptPopup.displayName = "ReceiptPopup";

// Helper function for price formatting
const formatPrice = (price) => {
  if (price === null || price === undefined) return "0.00";
  return parseFloat(price).toFixed(2);
};

// Helper function for time formatting
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

// Calculate discount percentage
const calculateDiscount = (original, discounted) => {
  if (!original || !discounted) return 0;
  return Math.round(((original - discounted) / original) * 100);
};

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

  // Fetch deal details with proper error handling
  useEffect(() => {
    let isMounted = true;
    
    const fetchDealDetails = async () => {
      try {
        const supabase = getSupabase();
        
        // Fetch deal data
        const { data: dealData, error: dealError } = await supabase
          .from("deals")
          .select("*")
          .eq("id", id)
          .single();

        if (dealError) throw dealError;
        if (!dealData) throw new Error("Deal not found");
        
        if (isMounted) {
          setDeal(dealData);
          setClaimed(dealData.claimed || false);
        }

        // Fetch restaurant data
        const { data: restaurantData, error: restaurantError } = await supabase
          .from("users")
          .select("name")
          .eq("id", dealData.restaurant_id)
          .eq("is_restaurant", true)
          .single();

        if (!restaurantError && restaurantData && isMounted) {
          setRestaurant(restaurantData.name);
        }

        // Fetch image data
        try {
          const { data: imageList, error: imageError } = await supabase.storage
            .from("deal-images")
            .list(`${dealData.id}`, { limit: 1 });

          if (!imageError && imageList && imageList.length > 0 && isMounted) {
            const { data: publicUrl } = supabase.storage
              .from("deal-images")
              .getPublicUrl(`${dealData.id}/${imageList[0].name}`);
            
            if (publicUrl && isMounted) {
              setImageUrl(publicUrl.publicUrl);
            }
          }
        } catch (imageErr) {
          console.error("Image fetch error:", imageErr);
          // Don't fail the whole page for image error
        }
      } catch (err) {
        console.error("Error loading deal:", err.message);
        if (isMounted) setError("Failed to load deal details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (id) fetchDealDetails();
    
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Memoized function to handle claiming a deal
  const handleClaimDeal = useCallback(async () => {
    if (!user || !id || claimed) return;

    setClaiming(true);
    setError("");

    try {
      const supabase = getSupabase();
      
      // Start transaction
      // Insert claim record
      const { error: claimError } = await supabase.from("claims").insert([
        {
          deal_id: Number(id),
          customer_id: user.id,
          claimed_at: new Date().toISOString(),
          confirmed: false,
        },
      ]);

      if (claimError) throw claimError;

      // Update deal status
      const { error: dealError } = await supabase
        .from("deals")
        .update({ claimed: true })
        .eq("id", id);

      if (dealError) throw dealError;

      setClaimed(true);
      setShowReceipt(true);
    } catch (err) {
      console.error("Error claiming deal:", err);
      setError("Something went wrong while claiming this deal. Please try again.");
    } finally {
      setClaiming(false);
    }
  }, [user, id, claimed]);

  // Handler to redirect after claiming
  const handleBackToDashboard = useCallback(() => {
    router.push("/");
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        <div className="animate-pulse flex space-x-4 items-center">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animation-delay-200"></div>
          <div className="w-3 h-3 bg-blue-400 rounded-full animation-delay-500"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <p className="text-red-400 mb-4">Deal not found or has been removed.</p>
        <button 
          onClick={() => router.push('/browse')}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded"
        >
          Browse Available Deals
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-16 px-6 relative">
      {/* Receipt Popup */}
      <ReceiptPopup 
        show={showReceipt} 
        deal={deal} 
        restaurant={restaurant} 
        onClose={handleBackToDashboard} 
      />

      {/* Main Deal UI */}
      <div className="max-w-3xl mx-auto bg-gray-800 border border-gray-700 rounded-xl shadow-lg overflow-hidden">
        <DealImage imageUrl={imageUrl} altText={deal.title} />

        <div className="p-8">
          <h1 className="text-4xl font-bold text-white mb-1">{deal.title}</h1>
          {restaurant && <p className="text-blue-400 text-sm mb-4">{restaurant}</p>}
          <div className="w-20 h-1 bg-blue-500 mb-6"></div>

          <p className="text-gray-300 text-lg mb-6">{deal.description || "No description available."}</p>

          <div className="space-y-2 text-gray-400 text-sm mb-6">
            <p><span className="text-blue-400 font-medium">Quantity:</span> {deal.quantity}</p>
            <p><span className="text-blue-400 font-medium">Pickup:</span> {formatTime(deal.pickup_start)} – {formatTime(deal.pickup_end)}</p>
            <p><span className="text-blue-400 font-medium">Original Price:</span> <span className="line-through">${formatPrice(deal.original_price)}</span></p>
            <p><span className="text-blue-400 font-medium">Discounted Price:</span> <span className="text-blue-300 font-semibold">${formatPrice(deal.updated_price)}</span></p>
            <p><span className="text-blue-400 font-medium">You Save:</span> {calculateDiscount(deal.original_price, deal.updated_price)}%</p>
          </div>

          <ClaimButton 
            onClaimDeal={handleClaimDeal} 
            claiming={claiming} 
            claimed={claimed}
          />

          {error && (
            <p className="text-red-400 mt-4 p-2 bg-red-900/20 border border-red-800/30 rounded">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}