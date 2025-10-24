"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../../context/AuthContext";
import { useCredentials } from "../../../../context/CredentialsContext";
import AnalyticsService, {
  formatNumber,
  formatPercentage,
  formatDate,
} from "../../../../services/analyticsService";
import {
  MetricsCard,
  PerformanceIndicator,
} from "../../../../components/AnalyticsComponents";

export default function AdvertisementAnalyticsPage({ params }) {
  const { user, isLoggedIn, loading } = useAuth();
  const { getStoredCredentials } = useCredentials();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const advertisementId = params.id;

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
    if (isLoggedIn && user && advertisementId) {
      fetchAnalyticsData();
    }
  }, [isLoggedIn, user, advertisementId, refreshKey]);

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    setAnalyticsError(null);

    try {
      const credentials = getStoredCredentials();
      const result = await AnalyticsService.getAdvertisementMetrics(
        advertisementId,
        credentials
      );

      if (result.success) {
        setAnalyticsData(result.data);
      } else {
        setAnalyticsError(result.error);
      }
    } catch (error) {
      setAnalyticsError("Failed to fetch advertisement analytics");
      console.error("Advertisement analytics fetch error:", error);
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
                href="/analytics"
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
                Advertisement Analytics
              </h1>
              {analyticsData && (
                <span className="ml-3 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                  {analyticsData.advertisementTitle}
                </span>
              )}
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
              <Link
                href={`/advertisements/${advertisementId}`}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Advertisement
              </Link>
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
          {analyticsLoading && (
            <div className="space-y-6">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow p-6 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Data */}
          {!analyticsLoading && analyticsData && (
            <div className="space-y-6">
              {/* Advertisement Info Banner */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Advertisement
                    </h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {analyticsData.advertisementTitle}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {analyticsData.advertisementId}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Tracking Period
                    </h3>
                    <p className="text-sm text-gray-900">
                      {formatDate(analyticsData.periodStart)} -{" "}
                      {formatDate(analyticsData.periodEnd)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {Math.ceil(
                        (new Date(analyticsData.periodEnd) -
                          new Date(analyticsData.periodStart)) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Top Demographics
                    </h3>
                    <p className="text-sm text-gray-900">
                      {analyticsData.topCountry} • {analyticsData.topDeviceType}
                    </p>
                    <p className="text-sm text-gray-600">
                      {analyticsData.topBrowserType}
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  colorClass="bg-blue-500"
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
                  colorClass="bg-green-500"
                />

                <MetricsCard
                  title="Total Views"
                  value={formatNumber(analyticsData.totalViews)}
                  icon={
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1v-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  colorClass="bg-purple-500"
                />

                <MetricsCard
                  title="Unique Users"
                  value={formatNumber(analyticsData.uniqueUsers)}
                  icon={
                    <svg
                      className="h-6 w-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  }
                  colorClass="bg-yellow-500"
                />
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PerformanceIndicator
                  ctr={analyticsData.clickThroughRate}
                  title="Click-Through Rate"
                />

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Rate Metrics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">View Rate</span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPercentage(analyticsData.viewRate)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-purple-500 transition-all duration-300"
                        style={{
                          width: `${Math.min(analyticsData.viewRate, 100)}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Conversion Rate
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPercentage(analyticsData.conversionRate)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-green-500 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            analyticsData.conversionRate,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Engagement Info
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Avg. Session Duration
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {analyticsData.avgSessionDuration || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Impressions to Click
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {analyticsData.totalClicks > 0
                          ? `${Math.round(
                              analyticsData.totalImpressions /
                                analyticsData.totalClicks
                            )}:1`
                          : "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Clicks to View
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {analyticsData.totalViews > 0
                          ? `${Math.round(
                              analyticsData.totalClicks /
                                analyticsData.totalViews
                            )}:1`
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Demographics and Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Audience Demographics */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Audience Demographics
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-blue-600 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-blue-900">
                          Top Country
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-blue-900">
                        {analyticsData.topCountry}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-600 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v1h1V6H5zm3 6a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4zm2 2v1h1v-1h-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-green-900">
                          Top Device Type
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-900">
                        {analyticsData.topDeviceType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
                      <div className="flex items-center">
                        <svg
                          className="h-5 w-5 text-purple-600 mr-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm8 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V8z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-sm font-medium text-purple-900">
                          Top Browser
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-purple-900">
                        {analyticsData.topBrowserType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Performance Insights
                  </h3>
                  <div className="space-y-4">
                    {analyticsData.clickThroughRate >= 3.0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          <strong>Excellent CTR!</strong> This advertisement is
                          performing above industry average.
                        </p>
                      </div>
                    )}

                    {analyticsData.clickThroughRate < 1.0 &&
                      analyticsData.totalImpressions > 100 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                          <p className="text-sm text-yellow-800">
                            <strong>Optimization Opportunity:</strong> Consider
                            improving ad copy or targeting for better CTR.
                          </p>
                        </div>
                      )}

                    {analyticsData.totalImpressions === 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Getting Started:</strong> This advertisement
                          is ready to start receiving impressions.
                        </p>
                      </div>
                    )}

                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Tracking Period</span>
                        <span className="font-medium text-gray-900">
                          {Math.ceil(
                            (new Date(analyticsData.periodEnd) -
                              new Date(analyticsData.periodStart)) /
                              (1000 * 60 * 60 * 24)
                          )}{" "}
                          days
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-medium text-gray-900">
                          {new Date().toLocaleString()}
                        </span>
                      </div>
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
                Analytics data for this advertisement will appear once it starts
                receiving interactions.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
