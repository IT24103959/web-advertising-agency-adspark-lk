"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function Home() {
  const { user, isLoggedIn, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isLoggedIn && user) {
      // Redirect logged-in users to their appropriate dashboard
      if (user.internalUser) {
        router.push("/dashboard/internal");
      } else if (user.client) {
        router.push("/dashboard/client");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isLoggedIn, user, loading, router]);

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

  // Show landing page for non-logged-in users
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">AdSpark</h1>
            <div className="flex items-center space-x-4">
              <Link
                href="/advertisments"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Featured Ads
              </Link>
              <Link
                href="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to <span className="text-blue-600">AdSpark</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Your comprehensive web-based advertising agency platform. Create,
            manage, and track your advertising campaigns with ease.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link
                href="/signup"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
              >
                Get Started
              </Link>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <Link
                href="/login"
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Everything you need for advertising success
            </h2>
          </div>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Advert Creation & Management
              </h3>
              <p className="mt-2 text-gray-600">
                Create, upload, edit, and schedule multi-format advertisements
                with our intuitive tools.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Performance Analytics
              </h3>
              <p className="mt-2 text-gray-600">
                Track views, clicks, engagement metrics, and generate
                comprehensive reports.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Asset Library
              </h3>
              <p className="mt-2 text-gray-600">
                Store, organize, search, and reuse your design assets
                efficiently.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                User Management
              </h3>
              <p className="mt-2 text-gray-600">
                Secure role-based access control for different user types and
                permissions.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Payment & Billing
              </h3>
              <p className="mt-2 text-gray-600">
                Automated payment processing, billing integration, and
                advertisement activation.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Customer Support
              </h3>
              <p className="mt-2 text-gray-600">
                Integrated support system with live chat, helpdesk, and
                knowledge base.
              </p>
            </div>
          </div>
        </div>

        {/* User Types Section */}
        <div className="mt-20 bg-white rounded-lg shadow">
          <div className="px-6 py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Choose Your Account Type
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Client Account
                </h3>
                <p className="text-gray-600 mb-6">
                  For businesses and advertisers looking to create and manage
                  advertising campaigns.
                </p>
                <Link
                  href="/signup"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium inline-block"
                >
                  Sign Up as Client
                </Link>
              </div>
              <div className="text-center p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Employee Account
                </h3>
                <p className="text-gray-600 mb-6">
                  For AdSpark team members including designers, managers, and
                  support staff.
                </p>
                <Link
                  href="/signup"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium inline-block"
                >
                  Sign Up as Employee
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
