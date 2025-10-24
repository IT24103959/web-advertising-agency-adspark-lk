"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useCredentials } from "../../../context/CredentialsContext";
import AnalyticsService, {
  formatNumber,
  formatPercentage,
} from "../../../services/analyticsService";
import { MetricsCard } from "../../../components/AnalyticsComponents";

export default function InternalDashboard() {
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

      // Check if user is actually an internal user
      if (!user?.internalUser) {
        // If not internal user, redirect to appropriate dashboard
        if (user?.client) {
          router.push("/dashboard/client");
        } else {
          router.push("/login");
        }
      }
    }
  }, [isLoggedIn, user, loading, router]);

  // Fetch analytics data for marketing managers and admins
  useEffect(() => {
    if (
      isLoggedIn &&
      user?.internalUser &&
      (user.internalUser.role === "MARKETING_MANAGER" ||
        user.internalUser.role === "SYSTEM_ADMIN")
    ) {
      fetchAnalyticsData();
    }
  }, [isLoggedIn, user]);

  const fetchAnalyticsData = async () => {
    setAnalyticsLoading(true);
    try {
      const credentials = getStoredCredentials();
      const result = await AnalyticsService.getDashboardSummary(credentials);
      if (result.success) {
        setAnalyticsData(result.data.overview);
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
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

  if (!isLoggedIn || !user?.internalUser) {
    return null; // Will redirect via useEffect
  }

  const getRoleDisplayName = (role) => {
    const roleMap = {
      SYSTEM_ADMIN: "System Administrator",
      MARKETING_MANAGER: "Marketing Manager",
      GRAPHIC_DESIGNER: "Graphic Designer",
      IT_SUPPORT: "IT Support",
      CUSTOMER_SUPPORT: "Customer Support",
      FINANCE_TEAM: "Finance Team",
    };
    return roleMap[role] || role;
  };

  const getAccessLevelText = (level) => {
    const levels = {
      1: "Basic Access",
      2: "Standard Access",
      3: "Advanced Access",
      4: "Manager Access",
      5: "Administrator Access",
    };
    return levels[level] || `Level ${level}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AdSpark</h1>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                Employee Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
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
          {/* Analytics Overview for Marketing Managers */}
          {(user?.internalUser?.role === "MARKETING_MANAGER" ||
            user?.internalUser?.role === "SYSTEM_ADMIN") && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  Analytics Overview
                </h2>
                <Link
                  href="/analytics"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Detailed Analytics →
                </Link>
              </div>
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
                    title="Total Advertisements"
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
                    title="Overall CTR"
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
                    No analytics data yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Analytics data will appear once advertisements are created
                    and receiving interactions.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.firstName} {user.lastName}!
              </h2>
              <p className="text-gray-600">
                AdSpark Employee Dashboard - Manage your advertising campaigns
                and tasks
              </p>
            </div>
          </div>

          {/* User Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Profile Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Profile Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Role:</strong> {getRoleDisplayName(user.role)}
                  </div>
                  <div>
                    <strong>Employee ID:</strong> {user.employeeId}
                  </div>
                  <div>
                    <strong>Department:</strong> {user.department}
                  </div>
                  <div>
                    <strong>Office:</strong> {user.officeLocation}
                  </div>
                  <div>
                    <strong>Access Level:</strong>{" "}
                    {getAccessLevelText(user.accessLevel)}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Contact Information
                </h3>
                <div className="space-y-2 text-sm">
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
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Account ID:</strong> {user.id}
                  </div>
                  <div>
                    <strong>Created:</strong>{" "}
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Last Login:</strong>{" "}
                    {new Date(user.lastLogin).toLocaleDateString()}
                  </div>
                  <div>
                    <strong>Account Type:</strong> Internal Employee
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role-Based Quick Actions */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {user.role === "GRAPHIC_DESIGNER" && (
                  <>
                    <Link
                      href="/assets"
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                    >
                      <div className="font-medium text-gray-900">
                        Asset Library
                      </div>
                      <div className="text-sm text-gray-600">
                        Browse and manage design assets
                      </div>
                    </Link>
                    <Link
                      href="/assets/create"
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                    >
                      <div className="font-medium text-gray-900">
                        Create Asset
                      </div>
                      <div className="text-sm text-gray-600">
                        Upload new design assets
                      </div>
                    </Link>
                    <Link
                      href="/advertisements"
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                    >
                      <div className="font-medium text-gray-900">
                        Advertisements
                      </div>
                      <div className="text-sm text-gray-600">
                        View and manage campaigns
                      </div>
                    </Link>
                    <Link
                      href="/advertisements/create"
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                    >
                      <div className="font-medium text-gray-900">
                        Create Advertisement
                      </div>
                      <div className="text-sm text-gray-600">
                        Create new ad campaigns
                      </div>
                    </Link>
                  </>
                )}

                {user.role === "MARKETING_MANAGER" && (
                  <>
                    <Link
                      href="/analytics"
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                    >
                      <div className="font-medium text-gray-900">Analytics</div>
                      <div className="text-sm text-gray-600">
                        View performance reports
                      </div>
                    </Link>
                    <Link
                      href="/advertisements"
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                    >
                      <div className="font-medium text-gray-900">Campaigns</div>
                      <div className="text-sm text-gray-600">
                        Manage ad campaigns
                      </div>
                    </Link>
                  </>
                )}

                {user.role === "CUSTOMER_SUPPORT" && (
                  <>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <div className="font-medium text-gray-900">
                        Support Tickets
                      </div>
                      <div className="text-sm text-gray-600">
                        Handle client issues
                      </div>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <div className="font-medium text-gray-900">Live Chat</div>
                      <div className="text-sm text-gray-600">
                        Client support chat
                      </div>
                    </button>
                  </>
                )}

                {user.role === "FINANCE_TEAM" && (
                  <>
                    <Link
                      href="/payments"
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                    >
                      <div className="font-medium text-gray-900">
                        Payment Management
                      </div>
                      <div className="text-sm text-gray-600">
                        View and manage all payments
                      </div>
                    </Link>
                    <Link
                      href="/payments/create"
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                    >
                      <div className="font-medium text-gray-900">
                        Create Payment
                      </div>
                      <div className="text-sm text-gray-600">
                        Create new payment requests
                      </div>
                    </Link>
                  </>
                )}

                {user.role === "SYSTEM_ADMIN" && (
                  <>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <div className="font-medium text-gray-900">
                        User Management
                      </div>
                      <div className="text-sm text-gray-600">
                        Manage system users
                      </div>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <div className="font-medium text-gray-900">
                        System Settings
                      </div>
                      <div className="text-sm text-gray-600">
                        Configure system
                      </div>
                    </button>
                  </>
                )}

                {user.role === "IT_SUPPORT" && (
                  <>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <div className="font-medium text-gray-900">
                        System Monitor
                      </div>
                      <div className="text-sm text-gray-600">
                        Monitor system health
                      </div>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <div className="font-medium text-gray-900">
                        Support Tickets
                      </div>
                      <div className="text-sm text-gray-600">
                        Technical support
                      </div>
                    </button>
                  </>
                )}

                {/* Asset Library and Advertisement access for non-GRAPHIC_DESIGNER internal users */}
                {user.role !== "GRAPHIC_DESIGNER" && (
                  <>
                    <Link
                      href="/assets"
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                    >
                      <div className="font-medium text-gray-900">
                        Asset Library
                      </div>
                      <div className="text-sm text-gray-600">
                        Browse design assets and templates
                      </div>
                    </Link>
                    <Link
                      href="/advertisements"
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                    >
                      <div className="font-medium text-gray-900">
                        Advertisements
                      </div>
                      <div className="text-sm text-gray-600">
                        View advertising campaigns
                      </div>
                    </Link>
                  </>
                )}

                {/* Common actions for all internal users */}
                <Link
                  href="/advertisments"
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left block"
                >
                  <div className="font-medium text-gray-900">Featured Ads</div>
                  <div className="text-sm text-gray-600">
                    Browse all public advertisements
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
