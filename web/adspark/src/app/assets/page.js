"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useCredentials } from "../../context/CredentialsContext";
import { AssetService, ASSET_TYPES } from "../../services/assetService";
import {
  LoadingSpinner,
  ErrorMessage,
  Button,
  Input,
  Select,
} from "../../components/ui";

export default function AssetBrowsePage() {
  const { user, isLoggedIn, loading: authLoading, logout } = useAuth();
  const { requestCredentials } = useCredentials();
  const router = useRouter();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    description: "",
    type: "",
    tags: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false,
  });

  // Check authentication and redirect if needed
  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      // Check if user has access to assets
      if (!user?.client && !user?.internalUser) {
        router.push("/dashboard");
        return;
      }
    }
  }, [isLoggedIn, user, authLoading, router]);

  // Load assets on component mount
  useEffect(() => {
    if (isLoggedIn && user) {
      searchAssets();
    }
  }, [isLoggedIn, user]);

  const searchAssets = async (filters = searchFilters, page = 0) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const credentials = await requestCredentials("search_assets");

      const searchParams = {
        ...filters,
        page,
        size: pagination.pageSize,
      };

      // Remove empty filters
      Object.keys(searchParams).forEach((key) => {
        if (
          searchParams[key] === "" ||
          searchParams[key] === null ||
          searchParams[key] === undefined
        ) {
          delete searchParams[key];
        }
      });

      const response = await AssetService.searchAssets(
        searchParams,
        credentials
      );

      setAssets(response.assets || []);
      setPagination({
        currentPage: response.currentPage || 0,
        pageSize: response.pageSize || 20,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        hasNext: response.hasNext || false,
        hasPrevious: response.hasPrevious || false,
      });
    } catch (error) {
      console.error("Error searching assets:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchAssets(searchFilters, 0);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      name: "",
      description: "",
      type: "",
      tags: "",
    };
    setSearchFilters(emptyFilters);
    searchAssets(emptyFilters, 0);
  };

  const handlePageChange = (newPage) => {
    searchAssets(searchFilters, newPage);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const canCreateAssets = user?.role === "GRAPHIC_DESIGNER";

  if (authLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!isLoggedIn || (!user?.client && !user?.internalUser)) {
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
                href={user.client ? "/dashboard/client" : "/dashboard/internal"}
              >
                <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                  AdSpark
                </h1>
              </Link>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                Asset Library
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {canCreateAssets && (
                <Link
                  href="/assets/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm"
                >
                  Create Asset
                </Link>
              )}
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
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Asset Library</h1>
            <p className="mt-2 text-gray-600">
              Browse and search design assets, templates, and media files
            </p>
          </div>

          {/* Search Filters */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="Asset Name"
                  type="text"
                  value={searchFilters.name}
                  onChange={(e) => handleFilterChange("name", e.target.value)}
                  placeholder="Search by name..."
                />

                <Input
                  label="Description"
                  type="text"
                  value={searchFilters.description}
                  onChange={(e) =>
                    handleFilterChange("description", e.target.value)
                  }
                  placeholder="Search by description..."
                />

                <Select
                  label="Asset Type"
                  value={searchFilters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  options={ASSET_TYPES}
                  placeholder="All Types"
                />

                <Input
                  label="Tags"
                  type="text"
                  value={searchFilters.tags}
                  onChange={(e) => handleFilterChange("tags", e.target.value)}
                  placeholder="Search by tags..."
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <Button type="submit" loading={loading}>
                    Search Assets
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleClearFilters}
                  >
                    Clear Filters
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  {pagination.totalElements} asset(s) found
                </div>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && <ErrorMessage errors={error} className="mb-6" />}

          {/* Assets Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : assets.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No assets found
              </h3>
              <p className="text-gray-600 mb-6">
                {Object.values(searchFilters).some(
                  (filter) => filter.trim() !== ""
                )
                  ? "Try adjusting your search filters to find assets."
                  : "No assets have been created yet."}
              </p>
              {canCreateAssets && (
                <Link
                  href="/assets/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create First Asset
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-t-lg overflow-hidden">
                    {asset.thumbnailUrl ? (
                      <img
                        src={AssetService.getAssetFileUrl(asset.thumbnailUrl)}
                        alt={asset.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                        <span className="text-4xl">
                          {AssetService.getFileTypeIcon(asset.fileType)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="text-lg font-medium text-gray-900 truncate"
                        title={asset.name}
                      >
                        {asset.name}
                      </h3>
                      <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded flex-shrink-0">
                        {asset.type}
                      </span>
                    </div>

                    <p
                      className="text-sm text-gray-600 mb-3 line-clamp-2"
                      title={asset.description}
                    >
                      {asset.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{asset.fileSizeFormatted}</span>
                      <span>{asset.fileExtension?.toUpperCase()}</span>
                    </div>

                    {asset.tags && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {asset.tags
                            .split(",")
                            .slice(0, 3)
                            .map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          {asset.tags.split(",").length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              +{asset.tags.split(",").length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>By {asset.userFullName}</span>
                      <span>
                        {new Date(asset.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-3 rounded-md text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  variant="secondary"
                  disabled={!pagination.hasPrevious}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={!pagination.hasNext}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {pagination.currentPage * pagination.pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        (pagination.currentPage + 1) * pagination.pageSize,
                        pagination.totalElements
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {pagination.totalElements}
                    </span>{" "}
                    results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <Button
                      variant="secondary"
                      disabled={!pagination.hasPrevious}
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                      className="rounded-l-md"
                    >
                      Previous
                    </Button>

                    {/* Page numbers */}
                    {Array.from(
                      { length: Math.min(5, pagination.totalPages) },
                      (_, i) => {
                        const pageNum =
                          i + Math.max(0, pagination.currentPage - 2);
                        if (pageNum >= pagination.totalPages) return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.currentPage
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum + 1}
                          </button>
                        );
                      }
                    )}

                    <Button
                      variant="secondary"
                      disabled={!pagination.hasNext}
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                      className="rounded-r-md"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
