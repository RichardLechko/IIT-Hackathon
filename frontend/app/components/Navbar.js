import Link from 'next/link';

export default function Navbar() {
  const navLinks = [
    { href: "#how-it-works", label: "How It Works" },
    { href: "#for-businesses", label: "For Businesses" },
    { href: "#for-shelters", label: "For Shelters" },
    { href: "/login", label: "Login" },
  ];

  const NavLink = ({ href, label }) => (
    <Link 
      href={href} 
      className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium"
    >
      {label}
    </Link>
  );

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
            <Link 
              href="/signup" 
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 border border-blue-500"
            >
              Sign Up
            </Link>
          </div>
        </div>
        
        <div className="md:hidden">
          <button className="text-gray-300 hover:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}