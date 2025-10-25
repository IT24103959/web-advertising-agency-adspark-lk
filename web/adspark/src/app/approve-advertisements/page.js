"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useCredentials } from "../../context/CredentialsContext";

export default function ApproveAdvertisements() {
  const { user, isLoggedIn, loading } = useAuth();
  const { getStoredCredentials } = useCredentials();
  const router = useRouter();
  const [advertisements, setAdvertisements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingIds, setApprovingIds] = useState(new Set());

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      // Check if user is a marketing manager
      if (!user?.internalUser || user.role !== "MARKETING_MANAGER") {
        router.push("/dashboard/internal");
        return;
      }

      fetchPendingAdvertisements();
    }
  }, [isLoggedIn, user, loading, router]);

  const fetchPendingAdvertisements = async () => {
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

      const response = await fetch("/api/adverts/pending-approval", {
        method: "GET",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch pending advertisements: ${response.status}`
        );
      }

      const data = await response.json();
      setAdvertisements(data);
    } catch (error) {
      console.error("Error fetching pending advertisements:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (advertId) => {
    try {
      setApprovingIds((prev) => new Set([...prev, advertId]));

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

      const response = await fetch(`/api/adverts/${advertId}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Remove the approved advertisement from the list
        setAdvertisements((prev) => prev.filter((ad) => ad.id !== advertId));
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to approve advertisement: ${errorText}`);
      }
    } catch (error) {
      console.error("Error approving advertisement:", error);
      setError(error.message);
    } finally {
      setApprovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(advertId);
        return newSet;
      });
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
        return "bg-red-100 text-red-800";
      case 2:
        return "bg-yellow-100 text-yellow-800";
      case 3:
        return "bg-green-100 text-green-800";
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

  if (!isLoggedIn || !user?.internalUser || user.role !== "MARKETING_MANAGER") {
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
                Approve Advertisements
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
          {/* Stats Bar */}
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {advertisements.length}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchPendingAdvertisements}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                Loading pending advertisements...
              </p>
            </div>
          ) : advertisements.length === 0 ? (
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No Pending Advertisements
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                All advertisements have been approved or there are no pending
                requests.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {advertisements.map((advert) => (
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
                            ID: {advert.id}
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          {advert.status}
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                            <strong>Created By:</strong> {advert.createdByEmail}
                          </div>
                        </div>
                      </div>

                      {/* Assignment Information */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          Assignment
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>Assigned To:</strong>{" "}
                            {advert.assignedToUsername}
                          </div>
                          <div>
                            <strong>Email:</strong> {advert.assignedToEmail}
                          </div>
                          <div>
                            <strong>Tags:</strong> {advert.tags}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes Section */}
                    {advert.notes && advert.notes !== "None" && (
                      <div className="mb-6 bg-blue-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Notes
                        </h4>
                        <p className="text-sm text-gray-700">{advert.notes}</p>
                      </div>
                    )}

                    {/* Approval Button */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleApprove(advert.id)}
                          disabled={approvingIds.has(advert.id)}
                          className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          {approvingIds.has(advert.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Approving...</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span>Approve Advertisement</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
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
