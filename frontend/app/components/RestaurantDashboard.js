"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import Anthropic from "@anthropic-ai/sdk";



function Typewriter({ text, speed = 20 }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    // Convert text safely to a trimmed string.
    const fullText = text ? text.toString().trim() : "";
    setDisplayed("");
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      // Calculate the current index based on speed.
      const currentIndex = Math.min(Math.floor(progress / speed), fullText.length);
      setDisplayed(fullText.slice(0, currentIndex));
      if (currentIndex < fullText.length) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [text, speed]);

  return <p className="text-gray-300 text-sm">{displayed}</p>;
}



// Initialize Anthropic - this would typically use environment variables
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true
});

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
    updated_price: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dealImages, setDealImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [foodInspection, setFoodInspection] = useState(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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
    
    // Apply specific sanitization based on field type
    switch (name) {
      case 'quantity':
        // Force quantity to be an integer by removing decimals
        const sanitizedQuantity = value === '' ? '' : Math.floor(parseFloat(value)) || '';
        setNewDeal({ ...newDeal, [name]: sanitizedQuantity.toString() });
        break;
        
      case 'original_price':
      case 'updated_price':
        // Only allow valid numbers with up to 2 decimal places for price
        // Regex allows empty string, digits, and up to 2 decimal places
        if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
          setNewDeal({ ...newDeal, [name]: value });
        }
        break;
        
        case 'title':
          const limitedTitle = value.slice(0, 100); // limit without trimming live input
          setNewDeal({ ...newDeal, [name]: limitedTitle });
          break;
        
        
      case 'description':
        // Limit description length
        const sanitizedDesc = value.slice(0, 500); // Limit to 500 chars
        setNewDeal({ ...newDeal, [name]: sanitizedDesc });
        break;
        
      default:
        // Default handler for other fields like dates
        setNewDeal({ ...newDeal, [name]: value });
    }
  };

  const formatLocalTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const formatDateTimeForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  // Function to analyze food images with our API route
  const analyzeFoodImage = async () => {
    // Use imagePreview length as a more reliable indicator
    if (imagePreview.length === 0) {
      setFoodInspection("No images to analyze.");
      return;
    }

    setInspectionLoading(true);
    setFoodInspection(null);

    try {
      // Get the current dealImages - make a local reference to avoid closure issues
      const currentImages = [...dealImages];

      // Convert all images to base64
      const imagePromises = currentImages.map(async (file) => {
        const base64Image = await fileToBase64(file);
        return {
          imageData: base64Image.split(',')[1],
          mediaType: file.type
        };
      });

      const images = await Promise.all(imagePromises);

      // Call our API endpoint with all images
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze images');
      }

      const data = await response.json();
      setFoodInspection(data.result);
    } catch (error) {
      console.error("Error analyzing food images:", error);
      setFoodInspection(`Error: ${error.message}`);
    } finally {
      setInspectionLoading(false);
    }
  };

  // Modify the fileToBase64 function to be more robust
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("File is undefined"));
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Update handleFileChange to not auto-analyze
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Add new files to the state
    setDealImages(prevImages => [...prevImages, ...files]);

    // Generate preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prevPreviews => [...prevPreviews, ...newPreviews]);

    // Don't auto-analyze - let user click the button
  };

  const handleTakePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const removeImage = (index) => {
    // Create a copy of the current dealImages before modifying it
    const remainingImages = [...dealImages];
    remainingImages.splice(index, 1);

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreview[index]);

    // Update state
    setDealImages(remainingImages);
    setImagePreview(prevPreviews => prevPreviews.filter((_, i) => i !== index));

    // Re-analyze remaining images if any exist
    if (remainingImages.length > 0) {
      // Small delay to ensure state has updated
      setTimeout(() => analyzeFoodImage(), 100);
    } else {
      setFoodInspection(null);
    }
  };

  const uploadImages = async (dealId) => {
    const uploadPromises = dealImages.map(async (file, index) => {
      try {
        const imageId = uuidv4();
        const filePath = `${dealId}/${imageId}.jpg`;
  
        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from('deal-images')
          .upload(filePath, file);
  
        if (error) {
          console.error('Upload error:', error);
          return null;
        }
  
        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('deal-images')
          .getPublicUrl(filePath);
  
        const publicUrl = publicUrlData.publicUrl;
  
        // Save the first uploaded image URL to the deal
        if (index === 0) {
          await supabase
            .from('deals')
            .update({ image_url: publicUrl })
            .eq('id', dealId);
        }
  
        return publicUrl;
      } catch (err) {
        console.error(`Error uploading image ${index}:`, err);
        return null;
      }
    });
  
    return Promise.all(uploadPromises);
  };
  
  // New function to delete a deal
  const handleDeleteDeal = async (dealId) => {
    if (!dealId) return;
    
    setIsDeleting(true);
    
    try {
      // Remove from database
      const { error } = await supabase
        .from('deals')
        .delete()
        .eq('id', dealId);
      
      if (error) throw error;
      
      // Update local state
      setDeals(deals.filter(deal => deal.id !== dealId));
      
    } catch (err) {
      console.error("Error deleting deal:", err);
      // You could add an error notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      // Validate required fields
      if (!newDeal.title.trim()) {
        throw new Error("Title is required");
      }
      
      // Ensure quantity is a positive integer
      const quantity = parseInt(newDeal.quantity, 10);
      if (isNaN(quantity) || quantity < 1) {
        throw new Error("Quantity must be a positive whole number");
      }
      
      // Ensure prices are valid numbers
      const originalPrice = parseFloat(newDeal.original_price);
      const currentPrice = parseFloat(newDeal.updated_price);
      
      if (isNaN(originalPrice) || originalPrice < 0) {
        throw new Error("Original price must be a valid number");
      }
      
      if (isNaN(currentPrice) || currentPrice < 0) {
        throw new Error("Current price must be a valid number");
      }
      
      if (currentPrice > originalPrice) {
        throw new Error("Current price cannot be higher than original price");
      }
      
      // Validate dates
      const pickupStart = new Date(newDeal.pickup_start);
      const pickupEnd = new Date(newDeal.pickup_end);
      
      if (isNaN(pickupStart.getTime()) || isNaN(pickupEnd.getTime())) {
        throw new Error("Please select valid pickup times");
      }
      
      if (pickupEnd <= pickupStart) {
        throw new Error("Pickup end time must be after start time");
      }
      
      // Create ISO strings that preserve the selected local time
      const startISO = new Date(
        Date.UTC(
          pickupStart.getFullYear(),
          pickupStart.getMonth(),
          pickupStart.getDate(),
          pickupStart.getHours(),
          pickupStart.getMinutes()
        )
      ).toISOString();
      
      const endISO = new Date(
        Date.UTC(
          pickupEnd.getFullYear(),
          pickupEnd.getMonth(),
          pickupEnd.getDate(),
          pickupEnd.getHours(),
          pickupEnd.getMinutes()
        )
      ).toISOString();
  
      const dealData = {
        title: newDeal.title.trim(),
        description: newDeal.description.trim(),
        quantity: quantity,
        pickup_start: startISO,
        pickup_end: endISO,
        original_price: originalPrice,
        updated_price: currentPrice, // To maintain compatibility with customer dashboard
        claimed: false,
        restaurant_id: user.id,
      };
  
      const { data, error } = await supabase
        .from('deals')
        .insert([dealData])
        .select();
      
      if (error) throw error;
      
      if (data && data[0]) {
        const dealId = data[0].id;
        
        // Upload images if any
        if (dealImages.length > 0) {
          await uploadImages(dealId);
        }
        
        // Reset form
        setNewDeal({
          title: "",
          description: "",
          quantity: "",
          pickup_start: "",
          pickup_end: "",
          original_price: "",
          updated_price: "",
        });
        setDealImages([]);
        setImagePreview([]);
        setFoodInspection(null);
        fetchDeals();
      }
    } catch (err) {
      console.error("Error creating deal:", err);
      // You could add an error state here to display user-friendly errors
      // setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleAnalyzeImages = () => {
    if (imagePreview.length > 0) {
      analyzeFoodImage();
    } else {
      setFoodInspection("No images to analyze.");
    }
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
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
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-medium mb-2">
                    Current Price
                  </label>
                  <input
                    type="number"
                    name="updated_price"
                    value={newDeal.updated_price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
  <label className="block text-gray-300 font-medium mb-2">
    Pickup Date
  </label>
  <input
    type="date"
    name="pickup_date"
    value={newDeal.pickup_date || new Date().toISOString().split('T')[0]}
    onChange={handleInputChange}
    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
    required
  />
</div>

<div className="mb-4">
  <label className="block text-gray-300 font-medium mb-2">
    Pickup Start Time
  </label>
  <input
    type="time"
    name="pickup_start_time"
    value={newDeal.pickup_start_time || "12:00"}
    onChange={handleInputChange}
    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
    required
  />
</div>

<div className="mb-4">
  <label className="block text-gray-300 font-medium mb-2">
    Pickup End Time
  </label>
  <input
    type="time"
    name="pickup_end_time"
    value={newDeal.pickup_end_time || "13:00"}
    onChange={handleInputChange}
    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
    required
  />
</div>


              {/* Image Upload Section */}
              <div className="mb-6">
                <label className="block text-gray-300 font-medium mb-2">
                  Deal Images
                </label>
                <div className="flex space-x-3 mb-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded border border-gray-600 transition duration-200"
                  >
                    Upload Image
                  </button>
                  <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded border border-gray-600 transition duration-200"
                  >
                    Take Photo
                  </button>
                  {imagePreview.length > 0 && (
                    <button
                    type="button"
                    onClick={handleAnalyzeImages}
                    className="relative bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded border transition duration-200 overflow-hidden"
                  >
                    <span className="absolute inset-0 pointer-events-none bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-40 rounded"></span>
                    <span className="relative">Analyze Food</span>
                  </button>
                  
                  
                  
                  )}
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  multiple
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                {/* Image preview section */}
                {imagePreview.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {imagePreview.map((src, index) => (
                      <div key={index} className="relative bg-gray-700 rounded p-1">
                        <img
                          src={src}
                          alt={`Preview ${index}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full h-6 w-6 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Food Inspection Results */}
                {inspectionLoading && (
                  <div className="mt-4 p-3 bg-gray-700 rounded border border-gray-600">
                    <div className="animate-pulse flex space-x-2 items-center">
                      <div className="h-4 w-4 bg-blue-500 rounded-full"></div>
                      <p className="text-gray-300">Analyzing food image...</p>
                    </div>
                  </div>
                )}

{foodInspection && !inspectionLoading && (
  <div className="mt-4 p-4 bg-gray-700 rounded border border-blue-500">
    <h3 className="font-semibold text-white text-sm mb-2">Food Safety Analysis:</h3>
    <Typewriter text={foodInspection} speed={20} />
  </div>
)}

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
                  <div key={deal.id} className="bg-gray-700 p-4 rounded border border-gray-600 relative">
                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteDeal(deal.id)}
                      disabled={isDeleting}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full h-6 w-6 flex items-center justify-center"
                      title="Delete Deal"
                    >
                      ×
                    </button>
                    
                    <h3 className="text-white font-semibold pr-6">{deal.title}</h3>
                    {deal.description && <p className="text-gray-300 mt-1">{deal.description}</p>}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-sm text-gray-400">Qty: {deal.quantity}</span>
                      <span className="text-sm text-gray-400">
                        Original: ${parseFloat(deal.original_price).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-400">
                        Current: ${parseFloat(deal.updated_price || deal.updated_price || 0).toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatLocalTime(deal.pickup_start)} - {formatLocalTime(deal.pickup_end)}
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