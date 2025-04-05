"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function RestaurantHome() {
  const { user, isBusiness, logout, login } = useAuth();
  const router = useRouter();
  const [foodItems, setFoodItems] = useState([]);
  const [newFoodItem, setNewFoodItem] = useState({
    name: "",
    description: "",
    quantity: "",
    expiryTime: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-create a restaurant user for development
  useEffect(() => {
    if (!user) {
      const testUser = {
        id: "123",
        name: "Test Restaurant",
        email: "test.restaurant@example.com",
      };

      console.log("Development mode: Creating default restaurant user");
      login(testUser, "business");
    }
  }, [user, login]);

  // Redirect if not a business user
  //   useEffect(() => {
  //     if (!isBusiness()) {
  //       router.push('/');
  //     }
  //   }, [isBusiness, router]);

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would fetch from an API
    setFoodItems([
      {
        id: 1,
        name: "Fresh Baguettes",
        description: "Freshly baked baguettes from today",
        quantity: "15 pieces",
        expiryTime: "Today, 8 PM",
        imageUrl: "/food/baggette.png",
        postedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Mixed Salad",
        description: "Fresh salad with seasonal vegetables",
        quantity: "8 portions",
        expiryTime: "Today, 9 PM",
        imageUrl: "/food/salad.png",
        postedAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewFoodItem({ ...newFoodItem, image: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFoodItem({ ...newFoodItem, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // In a real app, this would upload to a server
    // For now, we'll simulate an API call
    setTimeout(() => {
      const newItem = {
        id: foodItems.length + 1,
        ...newFoodItem,
        imageUrl: imagePreview || "/placeholder-food.jpg",
        postedAt: new Date().toISOString(),
      };

      setFoodItems([newItem, ...foodItems]);
      setNewFoodItem({
        name: "",
        description: "",
        quantity: "",
        expiryTime: "",
        image: null,
      });
      setImagePreview(null);
      setIsLoading(false);
    }, 1000);
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
          <div className="flex items-center gap-4">
            <span className="text-gray-300">
              Welcome, {user.name || "Restaurant"}
            </span>
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded border border-gray-600 transition duration-200 ease-in-out"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Post New Food Item Form */}
          <div className="bg-gray-800 p-6 rounded border-2 border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white border-b border-gray-700 pb-2">
              Post Leftover Food
            </h2>
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  Food Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newFoodItem.name}
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
                  value={newFoodItem.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  Quantity
                </label>
                <input
                  type="text"
                  name="quantity"
                  value={newFoodItem.quantity}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="e.g., 5 portions, 2 kg"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  Expiry Time
                </label>
                <input
                  type="text"
                  name="expiryTime"
                  value={newFoodItem.expiryTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  placeholder="e.g., Today, 8 PM"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-300 font-medium mb-2">
                  Food Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-300"
                  required
                />
              </div>

              {imagePreview && (
                <div className="mb-4">
                  <p className="text-gray-300 font-medium mb-2">Preview:</p>
                  <div className="relative w-full h-48 border border-gray-600 rounded overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Food preview"
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded font-medium border border-blue-500 transition duration-200 ease-in-out"
              >
                {isLoading ? "Posting..." : "Post Food Item"}
              </button>
            </form>
          </div>

          {/* Posted Food Items */}
          <div className="bg-gray-800 p-6 rounded border-2 border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-white border-b border-gray-700 pb-2">
              Your Posted Items
            </h2>

            {foodItems.length === 0 ? (
              <p className="text-gray-400">
                You haven't posted any food items yet.
              </p>
            ) : (
              <div className="space-y-4 mt-4">
                {foodItems.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-700 rounded p-4 hover:bg-gray-700 transition duration-200 bg-gray-800"
                  >
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 border border-gray-600 rounded overflow-hidden">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">
                          {item.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {item.description}
                        </p>
                        <div className="mt-2 text-sm">
                          <p>
                            <span className="font-medium text-gray-300">
                              Quantity:
                            </span>{" "}
                            <span className="text-gray-400">
                              {item.quantity}
                            </span>
                          </p>
                          <p>
                            <span className="font-medium text-gray-300">
                              Expires:
                            </span>{" "}
                            <span className="text-gray-400">
                              {item.expiryTime}
                            </span>
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            Posted: {new Date(item.postedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
