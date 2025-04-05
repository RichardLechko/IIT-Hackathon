"use client";
import { useAuth, USER_TYPES } from "@/context/authContext";
import LandingPage from "./components/LandingPage";
import CustomerDashboard from "./components/CustomerDashboard";
import RestaurantDashboard from "./components/RestaurantDashboard";

export default function Home() {
  const { isAuthenticated, isCustomer, isBusiness } = useAuth();

  // Render different content based on authentication state
  if (isAuthenticated() && isCustomer()) {
    return (
      <>
        <CustomerDashboard />
      </>
    );
  }

  // When your teammate creates the RestaurantDashboard component,
  // you can replace this placeholder with it
  if (isAuthenticated() && isBusiness()) {
    return (
      <>
        <RestaurantDashboard />
      </>
    );
  }

  // Default: render landing page for guests
  return <LandingPage />;
}
