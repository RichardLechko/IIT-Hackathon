"use client";
import { useState, memo } from 'react';
import { userLeaderboard, restaurantLeaderboard } from './data';

// Memoized components for better performance
const LeaderboardTable = memo(({ displayLeaderboard, activeTab }) => (
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
));

const PointsExplanation = memo(() => (
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
));

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('users');

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

        <LeaderboardTable displayLeaderboard={displayLeaderboard} activeTab={activeTab} />
        <PointsExplanation />
      </div>
    </div>
  );
}