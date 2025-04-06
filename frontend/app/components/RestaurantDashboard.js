"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from 'uuid';
import Anthropic from "@anthropic-ai/sdk";

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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [dealImages, setDealImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [foodInspection, setFoodInspection] = useState(null);
  const [inspectionLoading, setInspectionLoading] = useState(false);
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
    setNewDeal({ ...newDeal, [name]: value });
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
        
        // Upload image to Supabase storage
        const { data, error } = await supabase.storage
          .from('deal-images')
          .upload(filePath, file);
        
        if (error) {
          console.error('Upload error:', error);
          return null;
        }
        
        return data;
      } catch (err) {
        console.error(`Error uploading image ${index}:`, err);
        return null;
      }
    });
    
    return Promise.all(uploadPromises);
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
        
        // Reset form and refresh deals
        setNewDeal({
          title: "",
          description: "",
          quantity: "",
          pickup_start: "",
          pickup_end: "",
          original_price: "",
        });
        setDealImages([]);
        setImagePreview([]);
        setFoodInspection(null);
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
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded border border-blue-500 transition duration-200"
                    >
                      Analyze Food
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
                    <p className="text-gray-300 text-sm">{foodInspection}</p>
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
