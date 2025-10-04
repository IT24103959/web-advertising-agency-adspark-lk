"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthContext } from "../../context/AuthContext";
import AdvertisementService from "../../services/advertisementService";
import AnalyticsService from "../../services/analyticsService";

export default function AdvertisementsPage() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadAdvertisements();
  }, [user, router]);

  const loadAdvertisements = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await AdvertisementService.getClientAdvertisementSummaries();
      setAdvertisements(data);
    } catch (err) {
      setError(err.message || "Failed to load advertisements");
      console.error("Error loading advertisements:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedAdvertisements = advertisements
    .filter((ad) => {
      // Filter by status
      if (filter !== "all" && ad.status !== filter) return false;

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          ad.title.toLowerCase().includes(term) ||
          ad.description.toLowerCase().includes(term) ||
          ad.format.toLowerCase().includes(term) ||
          ad.tags?.toLowerCase().includes(term)
        );
      }

      return true;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date sorting
      if (
        sortBy === "createdAt" ||
        sortBy === "startDate" ||
        sortBy === "endDate"
      ) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle numeric sorting
      if (sortBy === "budget" || sortBy === "durationDays") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusBadge = (status) => {
    const statusClasses = AdvertisementService.getStatusColor(status);
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses}`}
      >
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priorityLevel, priorityDisplay) => {
    const priorityClasses =
      AdvertisementService.getPriorityColor(priorityLevel);
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${priorityClasses}`}
      >
        {priorityDisplay}
      </span>
    );
  };

  const getProgressBar = (ad) => {
    const now = new Date();
    const start = new Date(ad.startDate);
    const end = new Date(ad.endDate);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your advertisements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Advertisements
              </h1>
              <p className="mt-1 text-gray-600">
                View and manage your advertising campaigns
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="text-sm text-gray-500">
                Total: {advertisements.length} campaigns
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
            <button
              onClick={loadAdvertisements}
              className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by title, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PUBLISHED">Published</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">Created Date</option>
                <option value="title">Title</option>
                <option value="budget">Budget</option>
                <option value="startDate">Start Date</option>
                <option value="endDate">End Date</option>
                <option value="status">Status</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Advertisements Grid */}
        {filteredAndSortedAdvertisements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📢</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No advertisements found
            </h3>
            <p className="text-gray-600 mb-4">
              {advertisements.length === 0
                ? "You don't have any advertisements yet."
                : "No advertisements match your current filters."}
            </p>
            {advertisements.length === 0 && (
              <p className="text-sm text-gray-500">
                Contact our team to create your first advertising campaign.
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedAdvertisements.map((ad) => {
              const progress = getProgressBar(ad);
              const daysRemaining = AdvertisementService.getDaysRemaining(
                ad.endDate
              );

              return (
                <Link
                  key={ad.id}
                  href={`/advertisements/${ad.id}`}
                  onClick={() => {
                    // Track impression when advertisement is clicked from listing
                    AnalyticsService.trackClick(ad.id, {
                      sessionId: AnalyticsService.getSessionId(),
                    }).catch((error) =>
                      console.error("Failed to track click:", error)
                    );
                  }}
                >
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                    {/* Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">
                            {AdvertisementService.getFormatIcon(ad.format)}
                          </span>
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-1">
                              {ad.title}
                            </h3>
                            <p className="text-sm text-gray-600">{ad.format}</p>
                          </div>
                        </div>
                        {getStatusBadge(ad.status)}
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {ad.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Budget</span>
                          <span className="font-semibold text-green-600">
                            {AdvertisementService.formatCurrency(ad.budget)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Priority
                          </span>
                          {getPriorityBadge(
                            ad.priorityLevel,
                            ad.priorityLevelDisplay
                          )}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            Duration
                          </span>
                          <span className="text-sm font-medium">
                            {ad.durationDays} days
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="px-6 pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">
                          Campaign Progress
                        </span>
                        <span className="text-sm font-medium">
                          {progress.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${progress.color}`}
                          style={{ width: `${progress.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {AdvertisementService.formatDate(ad.startDate)} -{" "}
                          {AdvertisementService.formatDate(ad.endDate)}
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            daysRemaining > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {daysRemaining > 0
                            ? `${daysRemaining} days left`
                            : daysRemaining === 0
                            ? "Ends today"
                            : "Expired"}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="border-t border-gray-200 px-6 py-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {ad.totalViews.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Views</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {ad.totalClicks.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">Clicks</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-gray-900">
                            {ad.totalAssets}
                          </div>
                          <div className="text-xs text-gray-500">Assets</div>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-6 py-3 bg-gray-50 rounded-b-lg">
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                          Created{" "}
                          {AdvertisementService.formatDate(ad.createdAt)}
                        </span>
                        <span>by {ad.createdByUsername}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
