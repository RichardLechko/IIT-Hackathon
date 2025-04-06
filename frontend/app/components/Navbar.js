"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, USER_TYPES } from "@/context/authContext";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { user, userType, isAuthenticated, isCustomer, isBusiness, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isLandingPage, setIsLandingPage] = useState(false);
  
  // Check if we're on the landing page
  useEffect(() => {
    setIsLandingPage(pathname === '/');
  }, [pathname]);
  
  // Links for guest users
  const guestLinks = [
    { href: isLandingPage ? "#how-it-works" : "/#how-it-works", label: "How It Works" },
    { href: isLandingPage ? "#for-businesses" : "/#for-businesses", label: "For Businesses" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/login", label: "Login" },
  ];
  
  // Links for signed-in customers
  const customerLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/browse", label: "Browse Deals" },
    { href: "/orders", label: "My Orders" }, 
    { href: "/leaderboard", label: "Leaderboard" },
  ];
  
  // Links for signed-in restaurants/businesses
  const businessLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/analytics", label: "Analytics" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];
  
  // Determine which links to show based on authentication state
  const navLinks =
    isAuthenticated() && isCustomer() ? customerLinks :
    isAuthenticated() && isBusiness() ? businessLinks :
    guestLinks;
  
  const NavLink = ({ href, label }) => {
    // For regular navigation links or hash links from non-landing pages
    return (
      <Link
        href={href}
        className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
      >
        {label}
      </Link>
    );
  };
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Handle logout with redirection
  const handleLogout = () => {
    logout();
    router.push('/');
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <Link href="/" className="text-2xl font-bold text-white">
            NowOrNever
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <div className="flex items-center space-x-4">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
            {isAuthenticated() ? (
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
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={toggleMobileMenu} 
            className="text-gray-300 hover:text-blue-400"
            aria-label="Toggle menu"
          >
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
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          
          {isAuthenticated() ? (
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="px-3 py-2 text-gray-300 text-sm">
                Hi, {user.name}
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/signup"
              className="block w-full text-center bg-blue-600 text-white mt-2 px-4 py-2 rounded text-base font-medium hover:bg-blue-700 border border-blue-500"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          )}
        </div>
      )}
    </header>
  );
}