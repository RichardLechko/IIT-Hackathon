"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const { user, isAuthenticated, isBusiness } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for analytics
  const mockData = {
    restaurantName: "Green Leaf Cafe",
    totalDeals: 48,
    claimedDeals: 37,
    totalSavings: 1245.75,
    wasteReduction: 178.5, // in kg
    co2Reduction: 321.3,   // in kg of CO2 equivalent
    recentDeals: [
      { id: 1, title: "Pasta Special", posted: "2023-04-01", claimed: true, original: 15.99, discounted: 7.99, claimTime: "2023-04-01 18:30" },
      { id: 2, title: "Breakfast Bundle", posted: "2023-04-03", claimed: true, original: 12.99, discounted: 5.99, claimTime: "2023-04-03 10:15" },
      { id: 3, title: "Sandwich Pack", posted: "2023-04-05", claimed: true, original: 9.99, discounted: 4.50, claimTime: "2023-04-05 16:45" },
      { id: 4, title: "Pizza Deal", posted: "2023-04-06", claimed: false, original: 18.99, discounted: 9.50, claimTime: null },
      { id: 5, title: "Salad Box", posted: "2023-04-07", claimed: true, original: 11.99, discounted: 5.99, claimTime: "2023-04-07 12:10" }
    ],
    monthlySavings: [
      { month: "Jan", amount: 210.50, count: 18 },
      { month: "Feb", amount: 185.25, count: 15 },
      { month: "Mar", amount: 301.75, count: 24 },
      { month: "Apr", amount: 275.50, count: 21 },
      { month: "May", amount: 340.25, count: 27 },
      { month: "Jun", amount: 390.75, count: 31 }
    ],
    foodCategories: [
      { category: "Pasta", amount: 25 },
      { category: "Sandwiches", amount: 18 },
      { category: "Salads", amount: 15 },
      { category: "Desserts", amount: 12 },
      { category: "Breakfast", amount: 20 },
    ],
    customerTypes: [
      { type: "Regular customers", percentage: 65 },
      { type: "Shelters", percentage: 25 },
      { type: "Food banks", percentage: 10 }
    ],
    timeOfDay: [
      { time: "Morning (6-11AM)", percentage: 20 },
      { time: "Lunch (11AM-2PM)", percentage: 35 },
      { time: "Afternoon (2-5PM)", percentage: 15 },
      { time: "Evening (5-9PM)", percentage: 30 }
    ]
  };

  // Redirect non-business users
  useEffect(() => {
    if (isAuthenticated() && !isBusiness()) {
      router.push('/');
    }
  }, [isAuthenticated, isBusiness, router]);

  // Prepare chart data
  const monthlyChartData = {
    labels: mockData.monthlySavings.map(item => item.month),
    datasets: [
      {
        label: 'Food Saved (USD)',
        data: mockData.monthlySavings.map(item => item.amount),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1
      }
    ]
  };

  const foodCategoryData = {
    labels: mockData.foodCategories.map(item => item.category),
    datasets: [
      {
        label: 'Items Saved',
        data: mockData.foodCategories.map(item => item.amount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const customerTypeData = {
    labels: mockData.customerTypes.map(item => item.type),
    datasets: [
      {
        label: 'Customer Distribution',
        data: mockData.customerTypes.map(item => item.percentage),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const timeOfDayData = {
    labels: mockData.timeOfDay.map(item => item.time),
    datasets: [
      {
        label: 'Deal Claims by Time',
        data: mockData.timeOfDay.map(item => item.percentage),
        backgroundColor: [
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e5e7eb' // text-gray-200
        }
      },
      title: {
        display: true,
        color: '#e5e7eb' // text-gray-200
      }
    },
    scales: {
      y: {
        ticks: {
          color: '#9ca3af' // text-gray-400
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)' // text-gray-600 with opacity
        }
      },
      x: {
        ticks: {
          color: '#9ca3af' // text-gray-400
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)' // text-gray-600 with opacity
        }
      }
    }
  };

  // Stat card component
  const StatCard = ({ title, value, description, icon }) => (
    <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
      <div className="flex items-center">
        <div className="bg-blue-900 p-3 rounded-full mr-4">
          <span className="text-blue-300">{icon}</span>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-300">{title}</h3>
          <p className="text-2xl font-bold text-white">{value}</p>
          {description && <p className="text-sm text-gray-400 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );

  // Deal row component
  const DealRow = ({ deal }) => (
    <tr className="bg-gray-800 border-b border-gray-700">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{deal.title}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{deal.posted}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <span className={`px-2 py-1 rounded text-xs ${deal.claimed ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
          {deal.claimed ? 'Claimed' : 'Available'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${deal.original.toFixed(2)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400">${deal.discounted.toFixed(2)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{deal.claimTime || 'N/A'}</td>
    </tr>
  );

  // Tab navigation
  const TabButton = ({ id, label, active }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-t-lg font-medium ${
        active 
          ? 'bg-gray-800 text-white border-t-2 border-l-2 border-r-2 border-gray-700 border-b-0' 
          : 'bg-gray-900 text-gray-400 hover:text-gray-300'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
        <div className="w-16 h-1 bg-blue-500 mb-8"></div>
        
        {/* Tab navigation */}
        <div className="flex border-b border-gray-700 mb-8">
          <TabButton id="overview" label="Overview" active={activeTab === 'overview'} />
          <TabButton id="deals" label="Deal History" active={activeTab === 'deals'} />
          <TabButton id="impact" label="Environmental Impact" active={activeTab === 'impact'} />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard 
                title="Total Deals" 
                value={mockData.totalDeals} 
                description="All-time deals posted" 
                icon="📊" 
              />
              <StatCard 
                title="Claimed Deals" 
                value={mockData.claimedDeals} 
                description={`${Math.round((mockData.claimedDeals / mockData.totalDeals) * 100)}% claim rate`} 
                icon="✅" 
              />
              <StatCard 
                title="Food Value Saved" 
                value={`$${mockData.totalSavings.toFixed(2)}`} 
                description="Total retail value" 
                icon="💵" 
              />
              <StatCard 
                title="Waste Reduced" 
                value={`${mockData.wasteReduction.toFixed(1)} kg`} 
                description="Food waste prevented" 
                icon="♻️" 
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
                <h2 className="text-xl font-bold text-white mb-4">Monthly Savings</h2>
                <div className="h-80">
                  <Bar data={monthlyChartData} options={chartOptions} />
                </div>
              </div>
              <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
                <h2 className="text-xl font-bold text-white mb-4">Food Categories</h2>
                <div className="h-80">
                  <Pie data={foodCategoryData} />
                </div>
              </div>
            </div>

            {/* Customer Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
                <h2 className="text-xl font-bold text-white mb-4">Customer Types</h2>
                <div className="h-80">
                  <Pie data={customerTypeData} />
                </div>
              </div>
              <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
                <h2 className="text-xl font-bold text-white mb-4">Deal Claims by Time</h2>
                <div className="h-80">
                  <Pie data={timeOfDayData} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deals Tab */}
        {activeTab === 'deals' && (
          <div>
            <div className="bg-gray-800 border-2 border-gray-700 rounded p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Recent Deal History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Deal Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date Posted
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Original Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Discounted Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Claim Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {mockData.recentDeals.map((deal) => (
                      <DealRow key={deal.id} deal={deal} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
                <h2 className="text-xl font-bold text-white mb-4">Best Performing Deals</h2>
                <ul className="space-y-4">
                  <li className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-300">Pasta Special</span>
                    <span className="text-green-400">92% claim rate</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-300">Breakfast Bundle</span>
                    <span className="text-green-400">88% claim rate</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-300">Sandwich Pack</span>
                    <span className="text-green-400">85% claim rate</span>
                  </li>
                  <li className="flex justify-between border-b border-gray-700 pb-2">
                    <span className="text-gray-300">Pizza Deal</span>
                    <span className="text-green-400">80% claim rate</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
                <h2 className="text-xl font-bold text-white mb-4">Customer Feedback</h2>
                <ul className="space-y-4">
                  <li className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-gray-300 italic">"The pasta was amazing and such a great deal!"</p>
                    <p className="text-gray-500 text-sm mt-1">- Sarah J., April 2nd</p>
                  </li>
                  <li className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-gray-300 italic">"Love the breakfast bundle, perfect for our shelter residents."</p>
                    <p className="text-gray-500 text-sm mt-1">- Hope Shelter, April 4th</p>
                  </li>
                  <li className="border-l-4 border-blue-500 pl-4 py-2">
                    <p className="text-gray-300 italic">"Thank you for helping reduce food waste in our community!"</p>
                    <p className="text-gray-500 text-sm mt-1">- Michael T., April 7th</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Environmental Impact Tab */}
        {activeTab === 'impact' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <StatCard 
                title="Food Waste Prevented" 
                value={`${mockData.wasteReduction.toFixed(1)} kg`} 
                description="Total food saved from landfill" 
                icon="🍽️" 
              />
              <StatCard 
                title="CO2 Emissions Avoided" 
                value={`${mockData.co2Reduction.toFixed(1)} kg`} 
                description="Carbon footprint reduction" 
                icon="🌱" 
              />
              <StatCard 
                title="Water Saved" 
                value="12,400 L" 
                description="Water that would have been wasted" 
                icon="💧" 
              />
            </div>

            <div className="bg-gray-800 border-2 border-gray-700 rounded p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Your Environmental Impact</h2>
              <p className="text-gray-300 mb-6">
                Food waste is a major contributor to climate change. When food decomposes in landfills, it produces methane, 
                a greenhouse gas 25 times more potent than carbon dioxide. By saving food through our platform, you're making 
                a significant positive impact on the environment.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-700 p-4 rounded border border-gray-600">
                  <h3 className="text-lg font-medium text-white mb-2">Equivalent To</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <span className="mr-2">🚗</span>
                      <span>Driving 789 fewer miles</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">💡</span>
                      <span>156 days of electricity for one home</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">🌲</span>
                      <span>5.3 trees planted and grown for 10 years</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-700 p-4 rounded border border-gray-600">
                  <h3 className="text-lg font-medium text-white mb-2">Resources Saved</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <span className="mr-2">💧</span>
                      <span>12,400 liters of water</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">⚡</span>
                      <span>453 kWh of energy</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">🚜</span>
                      <span>89 sq. meters of farmland utilized fully</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gray-700 p-4 rounded border border-gray-600">
                  <h3 className="text-lg font-medium text-white mb-2">Social Impact</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center">
                      <span className="mr-2">🍽️</span>
                      <span>Approximately 143 meals provided</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">👨‍👩‍👧‍👦</span>
                      <span>Helped feed 65 people in need</span>
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">💰</span>
                      <span>$1,245 saved by customers/donated to shelters</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 border-2 border-gray-700 rounded p-6">
              <h2 className="text-xl font-bold text-white mb-4">Sustainability Certification Progress</h2>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-gray-300 mb-6">
                You're 75% of the way to earning our "Green Restaurant" certification. 
                Save 25% more food to achieve this status and receive a digital badge for your website and social media.
              </p>
              <h3 className="text-lg font-medium text-white mb-2">Upcoming Sustainability Goals</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <span className="mr-2 text-yellow-400">⭐</span>
                  <span>Save 200kg of food waste (22kg remaining)</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-yellow-400">⭐</span>
                  <span>Reach 50 donations to local shelters (13 remaining)</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2 text-yellow-400">⭐</span>
                  <span>Maintain at least 80% claim rate for 3 months (2 months remaining)</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
