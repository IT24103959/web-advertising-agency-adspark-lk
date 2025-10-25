"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useCredentials } from "../../../context/CredentialsContext";
import AnalyticsService, {
  formatNumber,
  formatPercentage,
} from "../../../services/analyticsService";
import { MetricsCard } from "../../../components/AnalyticsComponents";

export default function ClientDashboard() {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const { getStoredCredentials } = useCredentials();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      // Check if user is actually a client
      if (!user?.client) {
        // If not client, redirect to appropriate dashboard
        if (user?.internalUser) {
          router.push("/dashboard/internal");
        } else {
          router.push("/login");
        }
      }
    }
  }, [isLoggedIn, user, loading, router]);

  const fetchAnalyticsData = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      // For clients, we'll try to get analytics but handle gracefully if credentials aren't available
      const credentials = {
        username: user.username,
        password: user.password,
      };

      if (!credentials) {
        // For logged-in clients, we can skip analytics if no credentials are provided
        // This prevents the credentials modal from showing for already logged-in users
        console.log("Analytics unavailable - no credentials provided");
        setAnalyticsLoading(false);
        return;
      }

      const result = await AnalyticsService.getDashboardSummary(credentials);
      if (result.success) {
        setAnalyticsData(result.data.overview);
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
      // Don't show credentials modal for logged-in clients
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [getStoredCredentials]);

  // Fetch analytics data when user is loaded
  useEffect(() => {
    if (isLoggedIn && user?.client) {
      fetchAnalyticsData();
    }
  }, [isLoggedIn, user?.client, fetchAnalyticsData]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

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

  if (!isLoggedIn || !user?.client) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AdSpark</h1>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                Client Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-black">
                Welcome, {user.firstName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Analytics Overview */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Campaign Analytics
            </h2>
            {analyticsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow p-6 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : analyticsData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricsCard
                  title="My Advertisements"
                  value={formatNumber(analyticsData.totalAdvertisements)}
                  icon={
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  colorClass="bg-blue-500"
                />

                <MetricsCard
                  title="Total Impressions"
                  value={formatNumber(analyticsData.totalImpressions)}
                  icon={
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  colorClass="bg-green-500"
                />

                <MetricsCard
                  title="Total Clicks"
                  value={formatNumber(analyticsData.totalClicks)}
                  icon={
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  colorClass="bg-purple-500"
                />

                <MetricsCard
                  title="Click-Through Rate"
                  value={formatPercentage(analyticsData.overallCTR)}
                  icon={
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  colorClass="bg-yellow-500"
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No analytics data yet
                </h3>
                <p className="mt-1 text-sm text-black">
                  Start creating advertisements to see your performance metrics.
                </p>
              </div>
            )}
          </div>

          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.firstName} {user.lastName}!
              </h2>
              <p className="text-black">
                AdSpark Client Dashboard - Manage your advertising campaigns and
                view performance
              </p>
            </div>
          </div>

          {/* Company & User Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Company Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg text-black font-medium mb-4">
                  Company Information
                </h3>
                <div className="space-y-2 text-black text-sm">
                  <div>
                    <strong>Company:</strong> {user.companyName}
                  </div>
                  <div>
                    <strong>Business Type:</strong> {user.businessType}
                  </div>
                  <div>
                    <strong>Industry:</strong> {user.industry}
                  </div>
                  {user.websiteUrl && (
                    <div>
                      <strong>Website:</strong>
                      <a
                        href={user.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-blue-600 hover:text-blue-700"
                      >
                        {user.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-2 text-black text-sm">
                  <div>
                    <strong>Email:</strong> {user.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {user.phoneNumber}
                  </div>
                  <div>
                    <strong>Username:</strong> {user.username}
                  </div>
                  <div>
                    <strong>Status:</strong>
                    <span className="ml-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Account Details
                </h3>
                <div className="space-y-2 text-black text-sm">
                  <div>
                    <strong>Client ID:</strong> {user.id}
                  </div>
                  <div>
                    <strong>Member Since:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Last Login:</strong>{" "}
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Account Type:</strong> Client
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Address */}
          {user.companyAddress && (
            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Company Address
                </h3>
                <p className="text-black">{user.companyAddress}</p>
              </div>
            </div>
          )}

          {/* Client Quick Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/advert-details"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                >
                  <div className="font-medium text-gray-900">
                    Create Advertisement
                  </div>
                  <div className="text-sm text-black">
                    Start a new advertisement
                  </div>
                </Link>

                <Link
                  href="/analytics"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                >
                  <div className="font-medium text-gray-900">
                    View Analytics
                  </div>
                  <div className="text-sm text-black">
                    Check advertisement performance
                  </div>
                </Link>

                <Link
                  href="/support"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                >
                  <div className="font-medium text-gray-900">Support</div>
                  <div className="text-sm text-black">Get help and support</div>
                </Link>

                <Link
                  href="/advertisements"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                >
                  <div className="font-medium text-gray-900">
                    My Advertisements
                  </div>
                  <div className="text-sm text-black">
                    View all your advertising campaigns
                  </div>
                </Link>

                <Link
                  href="/payments"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                >
                  <div className="font-medium text-gray-900">My Payments</div>
                  <div className="text-sm text-black">
                    View and process your payments
                  </div>
                </Link>

                {/* Show Asset Library only if user has stored credentials */}
                {getStoredCredentials() && (
                  <Link
                    href="/assets"
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                  >
                    <div className="font-medium text-gray-900">
                      Asset Library
                    </div>
                    <div className="text-sm text-black">
                      Browse marketing assets and templates
                    </div>
                  </Link>
                )}

                <Link
                  href="/advertisments"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                >
                  <div className="font-medium text-gray-900">Featured Ads</div>
                  <div className="text-sm text-black">
                    Browse all public advertisements
                  </div>
                </Link>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">
                    Account Settings
                  </div>
                  <div className="text-sm text-black">
                    Update profile and preferences
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
