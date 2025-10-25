"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useCredentials } from "../../context/CredentialsContext";

export default function CurrentAdvertDetails() {
  const { user, isLoggedIn, loading } = useAuth();
  const { getStoredCredentials } = useCredentials();
  const router = useRouter();
  const [advertDetails, setAdvertDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      // Check if user is actually an internal user
      if (!user?.internalUser) {
        router.push("/login");
        return;
      }
    }
  }, [isLoggedIn, user, loading, router]);

  useEffect(() => {
    if (isLoggedIn && user?.internalUser) {
      fetchAdvertDetails();
    }
  }, [isLoggedIn, user]);

  const fetchAdvertDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const credentials = {
        username: user.username,
        password: user.password,
      };

      if (!credentials) {
        setError("No authentication credentials found");
        return;
      }

      const authString = btoa(
        `${credentials.username}:${credentials.password}`
      );

      const response = await fetch("/api/current-advert-details", {
        method: "GET",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch advertisement details: ${response.status}`
        );
      }

      const data = await response.json();
      setAdvertDetails(data);
    } catch (error) {
      console.error("Error fetching advertisement details:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getPriorityColor = (level) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case "BANNER":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "IMAGE":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "VIDEO":
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/internal"
                className="text-gray-600 hover:text-gray-900"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Advertisement Details
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.firstName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Loading advertisement details...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Error Loading Data
              </h3>
              <p className="mt-1 text-sm text-gray-500">{error}</p>
              <button
                onClick={fetchAdvertDetails}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : advertDetails.length === 0 ? (
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
                No Advertisement Details
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No advertisement details have been created yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {advertDetails.map((advert) => (
                <div
                  key={advert.id}
                  className="bg-white overflow-hidden shadow rounded-lg"
                >
                  <div className="px-4 py-5 sm:p-6">
                    {/* Header Section */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getFormatIcon(advert.format)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {advert.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Campaign: {advert.campaignName}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                            advert.priorityLevel
                          )}`}
                        >
                          {advert.priorityLevelDisplay} Priority
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {advert.format}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Description
                      </h4>
                      <p className="text-sm text-gray-700">
                        {advert.description}
                      </p>
                    </div>

                    {/* Grid Layout for Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Client Information */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Client Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Name:</strong> {advert.clientName}
                          </div>
                          <div>
                            <strong>Email:</strong> {advert.clientEmail}
                          </div>
                          <div>
                            <strong>Phone:</strong> {advert.clientPhone}
                          </div>
                          <div>
                            <strong>Username:</strong> {advert.clientUsername}
                          </div>
                        </div>
                      </div>

                      {/* Campaign Details */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Campaign Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Budget:</strong>{" "}
                            {formatCurrency(advert.budget)}
                          </div>
                          <div>
                            <strong>Duration:</strong> {advert.durationDays}{" "}
                            days
                          </div>
                          <div>
                            <strong>Start Date:</strong>{" "}
                            {formatDate(advert.startDate)}
                          </div>
                          <div>
                            <strong>End Date:</strong>{" "}
                            {formatDate(advert.endDate)}
                          </div>
                          {advert.durationSeconds && (
                            <div>
                              <strong>Duration:</strong>{" "}
                              {advert.durationSeconds} seconds
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Target Audience */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Target Audience
                        </h4>
                        <p className="text-sm text-gray-700">
                          {advert.targetAudience}
                        </p>
                      </div>

                      {/* Campaign Objectives */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Campaign Objectives
                        </h4>
                        <p className="text-sm text-gray-700">
                          {advert.campaignObjectives}
                        </p>
                      </div>

                      {/* Project Details */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Project Details
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Estimated Hours:</strong>{" "}
                            {advert.estimatedHours}
                          </div>
                          <div>
                            <strong>Created:</strong>{" "}
                            {formatDate(advert.createdAt)}
                          </div>
                          <div>
                            <strong>Updated:</strong>{" "}
                            {formatDate(advert.updatedAt)}
                          </div>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Additional Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          {advert.clickUrl && (
                            <div>
                              <strong>Click URL:</strong>
                              <a
                                href={advert.clickUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 text-blue-600 hover:text-blue-800 break-all"
                              >
                                {advert.clickUrl}
                              </a>
                            </div>
                          )}
                          <div>
                            <strong>Tags:</strong> {advert.tags}
                          </div>
                          <div>
                            <strong>Keywords:</strong> {advert.keywords}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {advert.notes && (
                      <div className="mt-6 bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Notes
                        </h4>
                        <p className="text-sm text-gray-700">{advert.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
