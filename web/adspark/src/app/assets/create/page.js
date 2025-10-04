"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useCredentials } from "../../../context/CredentialsContext";
import {
  AssetService,
  ASSET_TYPES,
  validateAssetFile,
  validateAssetData,
} from "../../../services/assetService";
import {
  LoadingSpinner,
  ErrorMessage,
  SuccessMessage,
  Button,
  Input,
  Select,
  Textarea,
} from "../../../components/ui";

export default function CreateAssetPage() {
  const { user, isLoggedIn, loading: authLoading, logout } = useAuth();
  const { requestCredentials } = useCredentials();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    tags: "",
    isPublic: false,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  // Check authentication and permissions
  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        router.push("/login");
        return;
      }

      // Only GRAPHIC_DESIGNER role can create assets
      if (user?.role !== "GRAPHIC_DESIGNER") {
        router.push("/assets");
        return;
      }
    }
  }, [isLoggedIn, user, authLoading, router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear errors when user types
    if (errors.length > 0) {
      setErrors([]);
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    // Create preview for images
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Clear errors
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const validationErrors = [];

    // Validate asset data
    const assetErrors = validateAssetData(formData);
    validationErrors.push(...assetErrors);

    // Validate file
    if (!selectedFile) {
      validationErrors.push("File is required");
    } else {
      const fileErrors = validateAssetFile(selectedFile, formData.type);
      validationErrors.push(...fileErrors);
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);
    setSuccessMessage("");

    try {
      const credentials = await requestCredentials("create_asset");

      const result = await AssetService.createAsset(
        formData,
        selectedFile,
        credentials
      );

      setSuccessMessage("Asset created successfully!");

      // Reset form
      setFormData({
        name: "",
        description: "",
        type: "",
        tags: "",
        isPublic: false,
      });
      setSelectedFile(null);
      setFilePreview(null);

      // Redirect to asset details page after a short delay
      setTimeout(() => {
        router.push(`/assets/${result.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error creating asset:", error);
      setErrors([error.message || "Failed to create asset"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (authLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!isLoggedIn || user?.role !== "GRAPHIC_DESIGNER") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/dashboard/internal">
                <h1 className="text-2xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer">
                  AdSpark
                </h1>
              </Link>
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                Create Asset
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/assets"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Back to Assets
              </Link>
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
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Asset
            </h1>
            <p className="mt-2 text-gray-600">
              Upload and organize design assets, templates, and media files for
              the asset library
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <SuccessMessage message={successMessage} className="mb-6" />
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <ErrorMessage errors={errors} className="mb-6" />
          )}

          {/* Create Asset Form */}
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Asset Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    id="name"
                    name="name"
                    label="Asset Name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter asset name..."
                    className="col-span-1"
                  />

                  <Select
                    id="type"
                    name="type"
                    label="Asset Type"
                    required
                    value={formData.type}
                    onChange={handleInputChange}
                    options={ASSET_TYPES}
                    placeholder="Select asset type"
                    className="col-span-1"
                  />
                </div>

                <Textarea
                  id="description"
                  name="description"
                  label="Description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe this asset..."
                  rows={4}
                />

                <Input
                  id="tags"
                  name="tags"
                  label="Tags"
                  type="text"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="Enter tags separated by commas (e.g., banner, template, campaign)"
                />

                <div className="flex items-center">
                  <input
                    id="isPublic"
                    name="isPublic"
                    type="checkbox"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isPublic"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Make this asset publicly accessible
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  File Upload
                </h3>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    {filePreview ? (
                      <div className="mb-4">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg shadow-sm"
                        />
                      </div>
                    ) : (
                      <div className="mb-4">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}

                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>
                          {selectedFile ? "Change file" : "Upload a file"}
                        </span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip,.rar,.txt"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>

                    {selectedFile ? (
                      <div className="mt-2">
                        <p className="text-sm text-gray-900 font-medium">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {AssetService.formatFileSize(selectedFile.size)} •{" "}
                          {selectedFile.type}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF, MP4, PDF up to 100MB
                      </p>
                    )}
                  </div>
                </div>

                {formData.type && (
                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                    <strong>File requirements for {formData.type}:</strong>
                    <ul className="mt-1 list-disc list-inside space-y-1">
                      {formData.type === "IMAGE" && (
                        <>
                          <li>Supported formats: JPEG, PNG, GIF, WebP, SVG</li>
                          <li>Maximum size: 5MB</li>
                        </>
                      )}
                      {formData.type === "VIDEO" && (
                        <>
                          <li>Supported formats: MP4, AVI, MOV, WMV, WebM</li>
                          <li>Maximum size: 100MB</li>
                        </>
                      )}
                      {formData.type === "AUDIO" && (
                        <>
                          <li>Supported formats: MP3, WAV, OGG, AAC</li>
                          <li>Maximum size: 50MB</li>
                        </>
                      )}
                      {formData.type === "DOCUMENT" && (
                        <>
                          <li>Supported formats: PDF, DOC, DOCX</li>
                          <li>Maximum size: 10MB</li>
                        </>
                      )}
                      {formData.type === "TEMPLATE" && (
                        <>
                          <li>Any file type accepted</li>
                          <li>Maximum size: 5MB</li>
                        </>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Link
                  href="/assets"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  disabled={
                    !selectedFile ||
                    !formData.name ||
                    !formData.description ||
                    !formData.type
                  }
                >
                  {isSubmitting ? "Creating Asset..." : "Create Asset"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
