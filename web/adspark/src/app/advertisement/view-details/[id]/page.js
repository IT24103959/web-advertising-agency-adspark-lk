"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdvertisementViewDetails({ params }) {
  const router = useRouter();
  const [advertisement, setAdvertisement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const advertisementId = resolvedParams.id;

  useEffect(() => {
    if (advertisementId) {
      fetchAdvertisementDetails();
    }
  }, [advertisementId]);

  const fetchAdvertisementDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/adverts/public/${advertisementId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch advertisement details: ${response.status}`
        );
      }

      const data = await response.json();
      setAdvertisement(data);
    } catch (error) {
      console.error("Error fetching advertisement details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFormatIcon = (format) => {
    switch (format) {
      case "BANNER":
        return (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "IMAGE":
        return (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "VIDEO":
        return (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
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
          <p className="mt-4 text-gray-600">Loading advertisement details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Advertisement
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchAdvertisementDetails}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/advertisments"
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Back to Advertisements
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!advertisement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📢</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Advertisement Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested advertisement could not be found.
          </p>
          <Link
            href="/advertisments"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Advertisements
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/advertisments"
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
          </div>
        </div>
      </header>

      {/* Navigation Breadcrumb */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <svg
                className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <Link
                href="/advertisments"
                className="text-gray-500 hover:text-gray-700"
              >
                Advertisements
              </Link>
            </li>
            <li className="flex items-center">
              <svg
                className="flex-shrink-0 h-4 w-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-700 font-medium">
                {advertisement.title}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-white overflow-hidden shadow-xl rounded-lg">
          {/* Header Section */}
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getFormatIcon(advertisement.format)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{advertisement.title}</h1>
                  <p className="text-blue-100 mt-1">ID: {advertisement.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    advertisement.status
                  )}`}
                >
                  {advertisement.status}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white">
                  {advertisement.format}
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8">
            {/* Description */}
            {advertisement.description && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-700 text-lg leading-relaxed">
                  {advertisement.description}
                </p>
              </div>
            )}

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Campaign Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Campaign Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Campaign Duration
                    </label>
                    <p className="text-gray-900">
                      {advertisement.durationDays} days
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Start Date
                    </label>
                    <p className="text-gray-900">
                      {formatDate(advertisement.startDate)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      End Date
                    </label>
                    <p className="text-gray-900">
                      {formatDate(advertisement.endDate)}
                    </p>
                  </div>
                  {advertisement.tags && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Tags
                      </label>
                      <p className="text-gray-900">{advertisement.tags}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Target & Objectives */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Campaign Focus
                </h3>
                <div className="space-y-4">
                  {advertisement.targetAudience && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Target Audience
                      </label>
                      <p className="text-gray-900">
                        {advertisement.targetAudience}
                      </p>
                    </div>
                  )}
                  {advertisement.campaignObjectives && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Campaign Objectives
                      </label>
                      <p className="text-gray-900">
                        {advertisement.campaignObjectives}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Created
                  </label>
                  <p className="text-gray-900">
                    {formatDate(advertisement.createdAt)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Last Updated
                  </label>
                  <p className="text-gray-900">
                    {formatDate(advertisement.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {advertisement.notes && (
              <div className="mt-8 bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Additional Notes
                </h3>
                <p className="text-gray-700">{advertisement.notes}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <Link
                href="/advertisments"
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Back to Advertisements
              </Link>
              <div className="text-sm text-gray-500">
                Advertisement #{advertisement.id}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
