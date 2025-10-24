"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      // Redirect to appropriate dashboard based on user type
      if (user?.internalUser) {
        router.push("/dashboard/internal");
      } else if (user?.client) {
        router.push("/dashboard/client");
      }
    }
  }, [isLoggedIn, user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Redirecting to your dashboard...
        </h1>
      </div>
    </div>
  );
}
