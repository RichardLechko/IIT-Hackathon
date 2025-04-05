"use client";
import Link from "next/link";
import { useAuth, USER_TYPES } from "@/context/authContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, userType, isAuthenticated, isCustomer, logout } = useAuth();
  const router = useRouter();

  // Links for guest users
  const guestLinks = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#for-businesses", label: "For Businesses" },
    { href: "#for-shelters", label: "For Shelters" },
    { href: "/login", label: "Login" },
  ];

  // Links for signed-in customers
  const customerLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/browse", label: "Browse Deals" },
    { href: "/saved", label: "Saved Items" },
    { href: "/orders", label: "My Orders" },
    { href: "/donate", label: "Donate" },
  ];

  // Determine which links to show based on authentication state
  const navLinks =
    isAuthenticated() && isCustomer() ? customerLinks : guestLinks;

  const NavLink = ({ href, label }) => {
    // For hash links on the landing page
    if (href.startsWith('#')) {
      return (
        <a
          href={href}
          className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
        >
          {label}
        </a>
      );
    }
    
    // For regular navigation links
    return (
      <Link
        href={href}
        className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
      >
        {label}
      </Link>
    );
  };

  // Handle logout with redirection
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            NowOrNever
          </Link>
        </div>

        <div className="hidden md:block">
          <div className="flex items-center space-x-4">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}

            {isAuthenticated() && isCustomer() ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 px-3 py-2 text-sm">
                  Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-gray-700 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-600 border border-gray-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 border border-blue-500"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>

        <div className="md:hidden">
          <button className="text-gray-300 hover:text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}