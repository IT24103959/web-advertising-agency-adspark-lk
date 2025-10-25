"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useCredentials } from "../../context/CredentialsContext";
import AnalyticsService from "../../services/analyticsService";
import {
  AnalyticsOverview,
  LineChart,
  PerformanceIndicator,
  TopPerformingAds,
  RecentEvents,
  AnalyticsLoadingSkeleton,
} from "../../components/AnalyticsComponents";

export default function AnalyticsPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const { getStoredCredentials } = useCredentials();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push("/auth/login");
        return;
      }

      // Check if user has permission to view analytics (CLIENT or MARKETING_MANAGER)
      const hasPermission =
        user?.client ||
        (user?.internalUser &&
          (user.internalUser.role === "MARKETING_MANAGER" ||
            user.internalUser.role === "SYSTEM_ADMIN"));

      if (!hasPermission) {
        router.push("/dashboard/internal");
        return;
      }
    }
  }, [isLoggedIn, user, loading, router]);

  useEffect(() => {
    if (isLoggedIn && user) {
      fetchAnalyticsData();
    }
  }, [isLoggedIn, user, refreshKey]);

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    try {
      const credentials = {
        username: user.username,
        password: user.password,
      };

      if (!credentials) {
        // For logged-in users without credentials, show helpful message
        if (user?.client && !user?.internalUser) {
          setAnalyticsError(
            "Analytics access requires additional permissions. Please contact your account manager for detailed analytics access."
          );
        } else {
          setAnalyticsError(
            "Authentication required for analytics access. Please contact support."
          );
        }
        setAnalyticsLoading(false);
        return;
      }

      const result = await AnalyticsService.getDashboardSummary(credentials);

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setAnalyticsError(result.error);
      }
    } catch (error) {
      setAnalyticsError("Failed to fetch analytics data");
      console.error("Analytics fetch error:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (
    !isLoggedIn ||
    (!user?.client &&
      !(
        user?.internalUser &&
        (user.internalUser.role === "MARKETING_MANAGER" ||
          user.internalUser.role === "SYSTEM_ADMIN")
      ))
  ) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href={
                  user?.client ? "/dashboard/client" : "/dashboard/internal"
                }
                className="text-blue-600 hover:text-blue-700 mr-4"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={analyticsLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <svg
                  className={`h-4 w-4 mr-2 ${
                    analyticsLoading ? "animate-spin" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
              <span className="text-sm text-gray-600">
                {user?.client ? user.firstName : user?.internalUser?.firstName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Error State */}
          {analyticsError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error loading analytics data
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{analyticsError}</p>
                  <div className="mt-3">
                    <button
                      onClick={handleRefresh}
                      className="text-sm bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {analyticsLoading && <AnalyticsLoadingSkeleton />}

          {/* Analytics Data */}
          {!analyticsLoading && analyticsData && (
            <div className="space-y-6">
              {/* Overview Metrics */}
              <AnalyticsOverview data={analyticsData.overview} />

              {/* Performance Indicator */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PerformanceIndicator
                  ctr={analyticsData.overview.overallCTR}
                  title="Overall Performance"
                />

                <TopPerformingAds
                  ads={analyticsData.topPerformingAds}
                  title="Top Performing Ads"
                />

                <RecentEvents
                  events={analyticsData.recentEvents}
                  title="Recent Activity"
                />
              </div>

              {/* Trend Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <LineChart
                  data={analyticsData.trends.clicks}
                  title="Click Trends"
                  color="green"
                />

                <LineChart
                  data={analyticsData.trends.views}
                  title="View Trends"
                  color="purple"
                />

                <LineChart
                  data={analyticsData.trends.impressions}
                  title="Impression Trends"
                  color="blue"
                />
              </div>

              {/* Additional Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Summary Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Performance Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-600">
                        Total Engagements
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {(
                          analyticsData.overview.totalClicks +
                          analyticsData.overview.totalViews
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-600">
                        View Rate
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {analyticsData.overview.overallViewRate.toFixed(2)}%
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-600">
                        Avg. Impressions per Ad
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {analyticsData.overview.totalAdvertisements > 0
                          ? Math.round(
                              analyticsData.overview.totalImpressions /
                                analyticsData.overview.totalAdvertisements
                            )
                          : 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    {user?.internalUser && (
                      <Link
                        href="/advertisements/create"
                        className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <svg
                          className="h-5 w-5 text-blue-600 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-blue-700">
                          Create New Advertisement
                        </span>
                      </Link>
                    )}

                    <Link
                      href="/advertisements"
                      className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <svg
                        className="h-5 w-5 text-green-600 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium text-green-700">
                        View All Advertisements
                      </span>
                    </Link>

                    {user?.client && (
                      <Link
                        href="/payments"
                        className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <svg
                          className="h-5 w-5 text-purple-600 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        <span className="text-sm font-medium text-purple-700">
                          View Payments
                        </span>
                      </Link>
                    )}

                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <svg
                        className="h-5 w-5 text-gray-400 mr-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!analyticsLoading && !analyticsError && !analyticsData && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
                No analytics data
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Analytics data will appear here once advertisements start
                receiving interactions.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
