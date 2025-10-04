"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export default function ClientDashboard() {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const router = useRouter();

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
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.firstName} {user.lastName}!
              </h2>
              <p className="text-gray-600">
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
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Company Information
                </h3>
                <div className="space-y-2 text-sm">
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
                <p className="text-gray-600">{user.companyAddress}</p>
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
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">
                    Create Campaign
                  </div>
                  <div className="text-sm text-gray-600">
                    Start a new advertising campaign
                  </div>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">
                    View Analytics
                  </div>
                  <div className="text-sm text-gray-600">
                    Check campaign performance
                  </div>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">
                    Billing & Payments
                  </div>
                  <div className="text-sm text-gray-600">
                    Manage payments and invoices
                  </div>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">Support</div>
                  <div className="text-sm text-gray-600">
                    Get help and support
                  </div>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">My Campaigns</div>
                  <div className="text-sm text-gray-600">
                    View all active campaigns
                  </div>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">Asset Library</div>
                  <div className="text-sm text-gray-600">
                    Manage marketing assets
                  </div>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">
                    Account Settings
                  </div>
                  <div className="text-sm text-gray-600">
                    Update profile and preferences
                  </div>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="font-medium text-gray-900">Reports</div>
                  <div className="text-sm text-gray-600">
                    Download detailed reports
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity Placeholder */}
          <div className="mt-6 bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity to display.</p>
                <p className="text-sm mt-2">
                  Start by creating your first advertising campaign!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
