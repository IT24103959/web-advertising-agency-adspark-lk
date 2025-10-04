"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "../../../context/AuthContext";
import AdvertisementService from "../../../services/advertisementService";

export default function AdvertisementDetailPage({ params }) {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [advertisement, setAdvertisement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const advertisementId = params.id;

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (advertisementId) {
      loadAdvertisement();
    }
  }, [user, router, advertisementId]);

  const loadAdvertisement = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await AdvertisementService.getAdvertisement(advertisementId);
      setAdvertisement(data);
    } catch (err) {
      setError(err.message || "Failed to load advertisement");
      console.error("Error loading advertisement:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await AdvertisementService.deleteAdvertisement(advertisementId);
      router.push("/advertisements");
    } catch (err) {
      setError(err.message || "Failed to delete advertisement");
      console.error("Error deleting advertisement:", err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getProgressBar = () => {
    if (!advertisement)
      return { percentage: 0, status: "Not Started", color: "bg-gray-300" };

    const now = new Date();
    const start = new Date(advertisement.startDate);
    const end = new Date(advertisement.endDate);

    if (now < start) {
      return { percentage: 0, status: "Not Started", color: "bg-gray-300" };
    } else if (now > end) {
      return { percentage: 100, status: "Completed", color: "bg-green-500" };
    } else {
      const total = end - start;
      const elapsed = now - start;
      const percentage = Math.round((elapsed / total) * 100);
      return { percentage, status: "In Progress", color: "bg-blue-500" };
    }
  };

  const isInternalUser =
    user?.role === "GRAPHIC_DESIGNER" ||
    user?.role === "ADMIN" ||
    user?.role === "MANAGER";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Loading advertisement details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !advertisement) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                {error}
              </div>
              <div className="space-x-2">
                <button
                  onClick={loadAdvertisement}
                  className="text-red-600 hover:text-red-800 underline text-sm"
                >
                  Try again
                </button>
                <Link
                  href="/advertisements"
                  className="text-red-600 hover:text-red-800 underline text-sm"
                >
                  Back to Advertisements
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = getProgressBar();
  const daysRemaining = AdvertisementService.getDaysRemaining(
    advertisement?.endDate
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/advertisements"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Advertisements
          </Link>
        </div>

        {advertisement && (
          <>
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-3xl">
                      {AdvertisementService.getFormatIcon(advertisement.format)}
                    </span>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {advertisement.title}
                      </h1>
                      <p className="text-gray-600">
                        Campaign ID: {advertisement.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${AdvertisementService.getStatusColor(
                        advertisement.status
                      )}`}
                    >
                      {advertisement.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${AdvertisementService.getPriorityColor(
                        advertisement.priorityLevel
                      )}`}
                    >
                      {advertisement.priorityLevelDisplay} Priority
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      {advertisement.format}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {isInternalUser && advertisement.canBeEdited && (
                  <div className="flex space-x-2 mt-4 lg:mt-0">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete Campaign
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  {error}
                </div>
              </div>
            )}

            {/* Campaign Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Progress
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Status: {progress.status}
                  </span>
                  <span className="text-sm font-medium">
                    {progress.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${progress.color} transition-all duration-300`}
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">
                    Start:{" "}
                    {AdvertisementService.formatDate(advertisement.startDate)}
                  </span>
                  <span
                    className={`font-medium ${
                      daysRemaining > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {daysRemaining > 0
                      ? `${daysRemaining} days remaining`
                      : daysRemaining === 0
                      ? "Ends today"
                      : "Campaign expired"}
                  </span>
                  <span className="text-gray-600">
                    End:{" "}
                    {AdvertisementService.formatDate(advertisement.endDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Campaign Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Description
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {advertisement.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Budget
                      </label>
                      <p className="mt-1 text-lg font-semibold text-green-600">
                        {AdvertisementService.formatCurrency(
                          advertisement.budget
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Duration
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {advertisement.durationDays} days
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Target Audience
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {advertisement.targetAudience}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Campaign Objectives
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {advertisement.campaignObjectives}
                    </p>
                  </div>

                  {advertisement.tags && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Tags
                      </label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {advertisement.tags.split(",").map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {advertisement.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Notes
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {advertisement.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Client Information
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Client Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {advertisement.clientName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {advertisement.clientEmail}
                    </p>
                  </div>

                  {advertisement.clientPhone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Phone
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {advertisement.clientPhone}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      Project Management
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Created by:
                        </span>
                        <span className="text-sm text-gray-900">
                          {advertisement.createdByUsername}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm text-gray-900">
                          {AdvertisementService.formatDate(
                            advertisement.createdAt
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Last updated:
                        </span>
                        <span className="text-sm text-gray-900">
                          {AdvertisementService.formatDate(
                            advertisement.updatedAt
                          )}
                        </span>
                      </div>
                      {advertisement.assignedToUsername && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Assigned to:
                          </span>
                          <span className="text-sm text-gray-900">
                            {advertisement.assignedToUsername}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Metrics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {advertisement.totalViews?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {advertisement.totalClicks?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {advertisement.totalImpressions?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-600">Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {(advertisement.clickThroughRate * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600">CTR</div>
                </div>
              </div>
            </div>

            {/* Work Progress */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Work Progress
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Estimated Hours
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {advertisement.estimatedHours || 0} hours
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Actual Hours
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {advertisement.actualHours || 0} hours
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Assets
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {advertisement.assets?.length || 0} files
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Advertisement
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "{advertisement?.title}"? This
                action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
