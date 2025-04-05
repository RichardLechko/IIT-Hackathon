import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <section className="bg-gray-800 py-20 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center">
            <div className="w-1/2">
              <h1 className="text-5xl font-bold mb-4 text-white">
                NowOrNever
              </h1>
              <div className="w-20 h-1 bg-blue-500 mb-6"></div>
              <h2 className="text-3xl font-semibold mb-6 text-gray-300">
                Rescue Food, Save Money, Help Chicago
              </h2>
              <p className="text-xl mb-8 max-w-md text-gray-400">
                Connect with nearby restaurants and shops to grab expiring food at bargain prices, or donate meals to local shelters.
              </p>
              <div className="flex space-x-4">
                <Link href="/signup" className="bg-blue-600 text-white px-6 py-3 rounded text-lg font-medium border border-blue-500 hover:bg-blue-700 transition-colors">
                  Find Food Near You
                </Link>
                <Link href="/business-signup" className="bg-gray-800 text-gray-200 px-6 py-3 rounded text-lg font-medium border border-gray-600 hover:bg-gray-700 transition-colors">
                  Register Your Business
                </Link>
              </div>
            </div>
            <div className="w-1/2 flex justify-center">
              <div className="w-full max-w-md h-96 bg-gray-700 rounded border-2 border-gray-600 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-400 font-medium">App Screenshot</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">Why Choose NowOrNever</h2>
            <div className="w-16 h-1 bg-blue-500 mx-auto my-4"></div>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Our innovative features help reduce food waste in Chicago while saving you money.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 p-8 rounded border-2 border-gray-700">
              <div className="h-14 w-14 bg-gray-700 rounded-full flex items-center justify-center mb-4 border border-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-7 w-7 text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Proximity Matching</h3>
              <p className="text-gray-400 leading-relaxed">
                Find food near you that's available right now. We connect you with deals that are close enough to reach before they expire.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-800 p-8 rounded border-2 border-gray-700">
              <div className="h-14 w-14 bg-gray-700 rounded-full flex items-center justify-center mb-4 border border-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-7 w-7 text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Real-time Bargaining</h3>
              <p className="text-gray-400 leading-relaxed">
                Negotiate prices directly with businesses for even better deals. Make offers on food that would otherwise go to waste.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-800 p-8 rounded border-2 border-gray-700">
              <div className="h-14 w-14 bg-gray-700 rounded-full flex items-center justify-center mb-4 border border-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-7 w-7 text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Shelter Donations</h3>
              <p className="text-gray-400 leading-relaxed">
                Pay it forward by donating meals to Chicago shelters. Help those in need while reducing food waste in our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">How It Works</h2>
            <div className="w-16 h-1 bg-blue-500 mx-auto my-4"></div>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              NowOrNever makes it easy to rescue food and make a difference in Chicago.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-8 bg-gray-900 border-2 border-gray-700 rounded">
              <div className="h-14 w-14 bg-gray-700 rounded-full flex items-center justify-center mb-4 border border-blue-500">
                <span className="text-blue-400 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Browse Nearby Deals</h3>
              <p className="text-gray-400 leading-relaxed">
                Discover restaurants and shops with surplus food in your Chicago neighborhood.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-8 bg-gray-900 border-2 border-gray-700 rounded">
              <div className="h-14 w-14 bg-gray-700 rounded-full flex items-center justify-center mb-4 border border-blue-500">
                <span className="text-blue-400 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Make an Offer</h3>
              <p className="text-gray-400 leading-relaxed">
                Bargain for the best price or accept the listed discount. Pay securely through the app.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-8 bg-gray-900 border-2 border-gray-700 rounded">
              <div className="h-14 w-14 bg-gray-700 rounded-full flex items-center justify-center mb-4 border border-blue-500">
                <span className="text-blue-400 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Pickup or Donate</h3>
              <p className="text-gray-400 leading-relaxed">
                Pick up your food during the specified time window or donate it to a local shelter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Businesses */}
      <section className="py-16 bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center">
            <div className="w-1/2">
              <h2 className="text-3xl font-bold text-white mb-2">For Chicago Businesses</h2>
              <div className="w-16 h-1 bg-blue-500 mb-6"></div>
              <p className="text-lg text-gray-400 mb-8">
                Join our mission to reduce food waste while recovering costs on surplus inventory.
              </p>
              <div className="p-8 border-2 border-gray-700 rounded bg-gray-800 mb-8">
                <ul className="space-y-6">
                  <li className="flex items-center">
                    <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center mr-4 border border-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-blue-400">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300 font-medium">Reduce waste and boost sustainability efforts</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center mr-4 border border-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-blue-400">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300 font-medium">Recover costs on food that would otherwise be discarded</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center mr-4 border border-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-blue-400">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300 font-medium">Attract new customers who may become regulars</span>
                  </li>
                  <li className="flex items-center">
                    <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center mr-4 border border-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 text-blue-400">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300 font-medium">Support local shelters and give back to the community</span>
                  </li>
                </ul>
              </div>
              <div>
                <Link href="/business-signup" className="bg-blue-600 text-white px-6 py-3 rounded text-lg font-medium hover:bg-blue-700 border border-blue-500 transition-colors">
                  Register Your Business
                </Link>
              </div>
            </div>
            <div className="w-1/2 flex justify-center">
              <div className="w-full max-w-md h-80 bg-gray-800 rounded border-2 border-gray-700 overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-400 font-medium">Business Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chicago Map Section */}
      <section className="py-16 bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center">
            <div className="w-1/2">
              <h2 className="text-3xl font-bold text-white mb-2">Serving All Chicago Neighborhoods</h2>
              <div className="w-16 h-1 bg-blue-500 mb-6"></div>
              <p className="text-lg text-gray-400 mb-8">
                NowOrNever is available throughout Chicago, connecting local businesses with customers and shelters to reduce food waste city-wide.
              </p>
              <div className="bg-gray-900 p-6 rounded border-2 border-gray-700">
                <p className="text-white font-bold mb-4">Most Active Areas:</p>
                <ul className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <li className="text-gray-300 font-medium flex items-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                    Loop
                  </li>
                  <li className="text-gray-300 font-medium flex items-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                    Wicker Park
                  </li>
                  <li className="text-gray-300 font-medium flex items-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                    Logan Square
                  </li>
                  <li className="text-gray-300 font-medium flex items-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                    Lincoln Park
                  </li>
                  <li className="text-gray-300 font-medium flex items-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                    West Loop
                  </li>
                  <li className="text-gray-300 font-medium flex items-center">
                    <div className="h-3 w-3 bg-blue-500 rounded-full mr-3"></div>
                    Hyde Park
                  </li>
                </ul>
              </div>
            </div>
            <div className="w-1/2 flex justify-center">
              <div className="w-full max-w-md h-80 rounded border-2 border-gray-700 overflow-hidden">
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <p className="text-gray-400 font-medium">Chicago Map Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="py-16 bg-gray-800 border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Join the NowOrNever Movement Today</h2>
          <div className="w-16 h-1 bg-blue-500 mx-auto my-4"></div>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Be part of the solution to food waste in Chicago. Start saving money and making a difference.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup" className="bg-blue-600 text-white px-8 py-4 rounded text-lg font-medium border border-blue-500 hover:bg-blue-700 transition-colors">
              Sign Up as a Customer
            </Link>
            <Link href="/business-signup" className="bg-gray-700 text-white px-8 py-4 rounded text-lg font-medium border border-gray-600 hover:bg-gray-600 transition-colors">
              Register Your Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}