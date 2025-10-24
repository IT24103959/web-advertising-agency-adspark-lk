"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import { useCredentials } from "../../../context/CredentialsContext";
import AdvertisementService from "../../../services/advertisementService";

export default function CreateAdvertisementPage() {
  const { user } = useAuth();
  const { getStoredCredentials } = useCredentials();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    budget: "",
    format: "IMAGE",
    targetAudience: "",
    campaignObjectives: "",
    startDate: "",
    endDate: "",
    durationDays: "",
    tags: "",
    notes: "",
    priorityLevel: 2, // Medium priority by default
    estimatedHours: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user has permission to create advertisements
    if (
      user.role !== "GRAPHIC_DESIGNER" &&
      user.role !== "ADMIN" &&
      user.role !== "MANAGER"
    ) {
      router.push("/dashboard/client");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    // Auto-calculate duration when dates change
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end > start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setFormData((prev) => ({ ...prev, durationDays: diffDays.toString() }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const validation = AdvertisementService.validateAdvertisementData(formData);
    setErrors(
      validation.errors.reduce((acc, error) => {
        const field = error.toLowerCase().split(" ")[0];
        acc[field] = error;
        return acc;
      }, {})
    );
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setSubmitError("");

      // Check for credentials
      const credentials = getStoredCredentials();
      if (!credentials) {
        setLoading(false);
        // For logged-in users without credentials, show helpful error
        if (user.client && !user.internalUser) {
          setSubmitError(
            "Advertisement creation requires additional permissions. Please contact your account manager for access."
          );
        } else {
          setSubmitError(
            "Authentication required for advertisement creation. Please contact support."
          );
        }
        return;
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        budget: Number(formData.budget),
        priorityLevel: Number(formData.priorityLevel),
        estimatedHours: formData.estimatedHours
          ? Number(formData.estimatedHours)
          : null,
        durationDays: Number(formData.durationDays),
      };

      const result = await AdvertisementService.createAdvertisement(
        submitData,
        credentials
      );

      // Redirect to the advertisements listing page
      router.push("/advertisements");
    } catch (err) {
      setSubmitError(err.message || "Failed to create advertisement");
      console.error("Error creating advertisement:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = [
    { value: "IMAGE", label: "Image Campaign" },
    { value: "VIDEO", label: "Video Campaign" },
    { value: "AUDIO", label: "Audio Campaign" },
    { value: "TEXT", label: "Text Campaign" },
    { value: "BANNER", label: "Banner Campaign" },
    { value: "SOCIAL", label: "Social Media Campaign" },
  ];

  const priorityOptions = [
    { value: 1, label: "High Priority" },
    { value: 2, label: "Medium Priority" },
    { value: 3, label: "Low Priority" },
  ];

  // Get tomorrow's date as minimum start date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minStartDate = tomorrow.toISOString().split("T")[0];

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

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Advertisement
          </h1>
          <p className="mt-1 text-gray-600">
            Create a new advertising campaign for a client
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                {submitError}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Campaign Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.title ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Enter campaign title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.description ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Describe the campaign objectives and requirements"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Format *
                  </label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {formatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level *
                  </label>
                  <select
                    name="priorityLevel"
                    value={formData.priorityLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget (USD) *
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min="1"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.budget ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                  {errors.budget && (
                    <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    value={formData.estimatedHours}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Estimated work hours"
                  />
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Client Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.clientname ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Client's name"
                  />
                  {errors.clientname && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.clientname}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Email *
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={formData.clientEmail}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.clientemail ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="client@example.com"
                  />
                  {errors.clientemail && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.clientemail}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Phone
                  </label>
                  <input
                    type="tel"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Campaign Details */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Details
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience *
                  </label>
                  <input
                    type="text"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Young adults 18-35, professionals, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Objectives *
                  </label>
                  <textarea
                    name="campaignObjectives"
                    value={formData.campaignObjectives}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What are the main goals of this campaign?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={minStartDate}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.startdate ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.startdate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.startdate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      min={formData.startDate || minStartDate}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.enddate ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.enddate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.enddate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      name="durationDays"
                      value={formData.durationDays}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      placeholder="Auto-calculated"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., summer, promotional, sale (comma-separated)"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate multiple tags with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional requirements, preferences, or notes..."
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/advertisements"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating Campaign..." : "Create Advertisement"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
