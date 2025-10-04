"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";

export default function InternalDashboard() {
  const { user, isLoggedIn, loading, logout } = useAuth();
  const router = useRouter();

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
      SYSTEM_ADMINISTRATOR: "System Administrator",
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
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <div className="font-medium text-gray-900">Analytics</div>
                      <div className="text-sm text-gray-600">
                        View performance reports
                      </div>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <div className="font-medium text-gray-900">Campaigns</div>
                      <div className="text-sm text-gray-600">
                        Manage ad campaigns
                      </div>
                    </button>
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
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <div className="font-medium text-gray-900">Billing</div>
                      <div className="text-sm text-gray-600">
                        Manage invoices
                      </div>
                    </button>
                    <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                      <div className="font-medium text-gray-900">Payments</div>
                      <div className="text-sm text-gray-600">
                        Track payments
                      </div>
                    </button>
                  </>
                )}

                {user.role === "SYSTEM_ADMINISTRATOR" && (
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
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
