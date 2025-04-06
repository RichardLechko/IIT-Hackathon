"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('users');

  // Mock data for users
  const userLeaderboard = [
    { id: 1, name: "Emma Johnson", location: "Seattle, WA", points: 4250, foodSaved: "85 kg", imageUrl: "/avatars/user1.jpg" },
    { id: 2, name: "Marcus Chen", location: "Portland, OR", points: 3840, foodSaved: "76 kg", imageUrl: "/avatars/user2.jpg" },
    { id: 3, name: "Sophia Rodriguez", location: "San Francisco, CA", points: 3620, foodSaved: "72 kg", imageUrl: "/avatars/user3.jpg" },
    { id: 4, name: "Jamal Williams", location: "Chicago, IL", points: 3175, foodSaved: "63 kg", imageUrl: "/avatars/user4.jpg" },
    { id: 5, name: "Priya Patel", location: "Austin, TX", points: 2990, foodSaved: "60 kg", imageUrl: "/avatars/user5.jpg" },
    { id: 6, name: "Noah Kim", location: "New York, NY", points: 2840, foodSaved: "57 kg", imageUrl: "/avatars/user6.jpg" },
    { id: 7, name: "Lena Müller", location: "Denver, CO", points: 2720, foodSaved: "54 kg", imageUrl: "/avatars/user7.jpg" },
    { id: 8, name: "David Thompson", location: "Boston, MA", points: 2580, foodSaved: "52 kg", imageUrl: "/avatars/user8.jpg" },
    { id: 9, name: "Maria Garcia", location: "Los Angeles, CA", points: 2430, foodSaved: "49 kg", imageUrl: "/avatars/user9.jpg" },
    { id: 10, name: "Kevin O'Brien", location: "Minneapolis, MN", points: 2250, foodSaved: "45 kg", imageUrl: "/avatars/user10.jpg" },
  ];

  // Mock data for restaurants
  const restaurantLeaderboard = [
    { id: 1, name: "Green Table Bistro", location: "Seattle, WA", points: 12450, foodSaved: "249 kg", imageUrl: "/restaurants/rest1.jpg" },
    { id: 2, name: "Sustainable Eats", location: "Portland, OR", points: 11280, foodSaved: "226 kg", imageUrl: "/restaurants/rest2.jpg" },
    { id: 3, name: "Zero Waste Kitchen", location: "San Francisco, CA", points: 10750, foodSaved: "215 kg", imageUrl: "/restaurants/rest3.jpg" },
    { id: 4, name: "Fresh & Conscious", location: "Austin, TX", points: 9840, foodSaved: "197 kg", imageUrl: "/restaurants/rest4.jpg" },
    { id: 5, name: "Eco Bites", location: "Chicago, IL", points: 9370, foodSaved: "187 kg", imageUrl: "/restaurants/rest5.jpg" },
    { id: 6, name: "The Mindful Plate", location: "New York, NY", points: 8920, foodSaved: "178 kg", imageUrl: "/restaurants/rest6.jpg" },
    { id: 7, name: "Harvest Community", location: "Boston, MA", points: 8450, foodSaved: "169 kg", imageUrl: "/restaurants/rest7.jpg" },
    { id: 8, name: "Conscious Cuisine", location: "Denver, CO", points: 7980, foodSaved: "160 kg", imageUrl: "/restaurants/rest8.jpg" },
    { id: 9, name: "Planet Friendly Foods", location: "Los Angeles, CA", points: 7540, foodSaved: "151 kg", imageUrl: "/restaurants/rest9.jpg" },
    { id: 10, name: "Green Gourmet", location: "Minneapolis, MN", points: 7120, foodSaved: "142 kg", imageUrl: "/restaurants/rest10.jpg" },
  ];

  // Determine which leaderboard to display based on active tab
  const displayLeaderboard = activeTab === 'users' ? userLeaderboard : restaurantLeaderboard;
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          NowOrNever Green Champions
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Recognizing those making the biggest impact in reducing food waste
        </p>

        {/* Toggle between users and restaurants */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 text-sm font-medium rounded-l-lg ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Individual Champions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('restaurants')}
              className={`px-6 py-3 text-sm font-medium rounded-r-lg ${
                activeTab === 'restaurants'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Restaurant Champions
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {activeTab === 'users' ? 'User' : 'Restaurant'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Green Points
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Food Saved
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {displayLeaderboard.map((entry, index) => (
                  <tr key={entry.id} className={index < 3 ? "bg-gray-750" : ""}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${index < 3 ? "font-bold" : ""}`}>
                        {index === 0 && <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-500 text-gray-900 rounded-full mr-2">1</span>}
                        {index === 1 && <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-400 text-gray-900 rounded-full mr-2">2</span>}
                        {index === 2 && <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-700 text-white rounded-full mr-2">3</span>}
                        {index > 2 && <span className="pl-2 text-gray-300">{index + 1}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300">
                            {entry.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">{entry.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{entry.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{entry.points.toLocaleString()}</div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-1">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{
                          width: `${(entry.points / displayLeaderboard[0].points) * 100}%`
                        }}></div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {entry.foodSaved}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Explanation of points system */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-white">How Green Points Work</h2>
          <p className="text-gray-400 mb-3">
            Green Points are awarded based on the amount of food saved from going to waste:
          </p>
          <ul className="list-disc pl-5 text-gray-400 mb-4">
            <li>50 points for each meal purchased that would have been wasted</li>
            <li>Bonus points for frequent orders and referring friends</li>
            <li>Special achievements for reaching milestone amounts of food saved</li>
          </ul>
          <p className="text-gray-400">
            Together, our community has saved over <span className="font-bold text-blue-400">5,240 kg</span> of food 
            from landfills this year!
          </p>
        </div>
      </div>
    </div>
  );
}