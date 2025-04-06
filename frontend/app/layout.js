import "./globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { AuthProvider } from "@/context/authContext";

export const metadata = {
  title: "NowOrNever - Reducing Food Waste",
  description: "Join our community to reduce food waste and make a positive impact on the environment.",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#1E293B", // Dark blue to match your theme
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}