"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useCredentials } from "../../../context/CredentialsContext";
import { AssetService } from "../../../services/assetService";
import { LoadingSpinner, ErrorMessage, Button } from "../../../components/ui";

export default function AssetDetailPage() {
  const { user, isLoggedIn, loading: authLoading, logout } = useAuth();
  const { requestCredentials } = useCredentials();
  const router = useRouter();
  const params = useParams();
  const assetId = params.id;

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

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

  // Load asset details
  useEffect(() => {
    if (isLoggedIn && user && assetId) {
      loadAsset();
    }
  }, [isLoggedIn, user, assetId]);

  const loadAsset = async () => {
    if (!user || !assetId) return;

    setLoading(true);
    setError(null);

    try {
      const credentials = await requestCredentials("get_asset");
      const assetData = await AssetService.getAsset(assetId, credentials);
      setAsset(assetData);
    } catch (error) {
      console.error("Error loading asset:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!asset || !user) return;

    setDownloading(true);
    try {
      const credentials = await requestCredentials("download_asset");
      const blob = await AssetService.downloadAsset(asset.id, credentials);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        asset.name + (asset.fileExtension ? `.${asset.fileExtension}` : "");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading asset:", error);
      setError(error.message);
    } finally {
      setDownloading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (authLoading || loading) {
    return <LoadingSpinner message="Loading asset..." />;
  }

  if (!isLoggedIn || (!user?.client && !user?.internalUser)) {
    return null; // Will redirect via useEffect
  }

  if (error && !asset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Asset Not Found
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/assets"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Back to Assets
          </Link>
        </div>
      </div>
    );
  }

  if (!asset) {
    return <LoadingSpinner message="Loading asset..." />;
  }

  const canCreateAssets = user?.role === "GRAPHIC_DESIGNER";

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
                Asset Details
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/assets"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Back to Assets
              </Link>
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
          {/* Error Message */}
          {error && <ErrorMessage errors={error} className="mb-6" />}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Asset Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {asset.fileType.startsWith("image/") ? (
                    <img
                      src={AssetService.getAssetFileUrl(asset.fileUrl)}
                      alt={asset.name}
                      className="w-full h-full object-contain bg-gray-50"
                    />
                  ) : asset.fileType.startsWith("video/") ? (
                    <video
                      controls
                      className="w-full h-full object-contain bg-gray-50"
                      src={AssetService.getAssetFileUrl(asset.fileUrl)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : asset.fileType.startsWith("audio/") ? (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="text-center">
                        <div className="text-6xl mb-4">🎵</div>
                        <audio controls className="w-full max-w-md">
                          <source
                            src={AssetService.getAssetFileUrl(asset.fileUrl)}
                            type={asset.fileType}
                          />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="text-center">
                        <div className="text-6xl mb-4">
                          {AssetService.getFileTypeIcon(asset.fileType)}
                        </div>
                        <p className="text-gray-600">Preview not available</p>
                        <p className="text-sm text-gray-500">
                          {asset.fileType}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Asset Information */}
            <div className="lg:col-span-1 space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {asset.name}
                </h1>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Type:
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {asset.type}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      File Size:
                    </span>
                    <span className="text-sm text-gray-900">
                      {asset.fileSizeFormatted}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Format:
                    </span>
                    <span className="text-sm text-gray-900">
                      {asset.fileExtension?.toUpperCase()}
                    </span>
                  </div>

                  {asset.width && asset.height && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Dimensions:
                      </span>
                      <span className="text-sm text-gray-900">
                        {asset.width} × {asset.height}
                      </span>
                    </div>
                  )}

                  {asset.durationSeconds && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        Duration:
                      </span>
                      <span className="text-sm text-gray-900">
                        {Math.floor(asset.durationSeconds / 60)}:
                        {(asset.durationSeconds % 60)
                          .toString()
                          .padStart(2, "0")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-500">
                      Public:
                    </span>
                    <span className="text-sm text-gray-900">
                      {asset.isPublic ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={handleDownload}
                    loading={downloading}
                    className="w-full"
                  >
                    {downloading ? "Downloading..." : "Download Asset"}
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {asset.description}
                </p>
              </div>

              {/* Tags */}
              {asset.tags && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {asset.tags.split(",").map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Creator & Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created by:</span>
                    <span className="text-gray-900 font-medium">
                      {asset.userFullName}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Username:</span>
                    <span className="text-gray-900">@{asset.userName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="text-gray-900">
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Last updated:</span>
                    <span className="text-gray-900">
                      {new Date(asset.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Downloads:</span>
                    <span className="text-gray-900">{asset.downloadCount}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Usage count:</span>
                    <span className="text-gray-900">{asset.usageCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
