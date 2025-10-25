"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import {
  useCredentials,
  CredentialsModal,
} from "../../../context/CredentialsContext";
import PaymentService from "../../../services/paymentService";
import AdvertisementService from "../../../services/advertisementService";

export default function CreatePaymentPage() {
  const { user } = useAuth();
  const { getStoredCredentials } = useCredentials();
  const router = useRouter();
  const [formData, setFormData] = useState({
    amount: "",
    invoiceNumber: "",
    advertisementId: "",
    clientUserId: "",
    dueDate: "",
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [advertisements, setAdvertisements] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [credentialsModal, setCredentialsModal] = useState({
    isOpen: false,
    onSuccess: null,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user has permission to create payments
    if (user.role !== "FINANCE_TEAM") {
      router.push("/dashboard/internal");
      return;
    }

    loadInitialData();
  }, [user, router]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);

      // Check for credentials
      const credentials = {
        username: user.username,
        password: user.password,
      };
      if (!credentials) {
        setLoadingData(false);
        setCredentialsModal({
          isOpen: true,
          onSuccess: () => {
            setCredentialsModal({ isOpen: false, onSuccess: null });
            loadInitialData();
          },
        });
        return;
      }

      // Generate default invoice number
      const defaultInvoiceNumber = PaymentService.generateInvoiceNumber();
      setFormData((prev) => ({ ...prev, invoiceNumber: defaultInvoiceNumber }));

      // Load advertisements and clients from API
      try {
        const [advertisementsData, clientsData] = await Promise.all([
          AdvertisementService.getClientAdvertisementSummaries(credentials),
          // For clients, we can use a subset of user data - this would need a proper endpoint
          // For now, let's extract unique clients from advertisements
          AdvertisementService.getClientAdvertisementSummaries(credentials),
        ]);

        setAdvertisements(advertisementsData);

        // Extract unique clients from advertisements
        const uniqueClients = advertisementsData.reduce((clients, ad) => {
          // Check if client already exists by ID
          if (!clients.find((c) => c.id === ad.clientId)) {
            clients.push({
              id: ad.clientId,
              username: ad.clientName,
              fullName: ad.clientName,
              email: ad.clientEmail || `${ad.clientName}@example.com`,
            });
          }
          return clients;
        }, []);

        setClients(uniqueClients);
      } catch (apiError) {
        console.error("Error fetching data from API:", apiError);
        setSubmitError("Failed to load advertisements and clients data");
      }
    } catch (err) {
      setSubmitError("Failed to load initial data");
      console.error("Error loading initial data:", err);
    } finally {
      setLoadingData(false);
    }
  };

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

    // Auto-populate amount and client when advertisement is selected
    if (name === "advertisementId" && value) {
      const selectedAd = advertisements.find((ad) => ad.id === Number(value));
      if (selectedAd) {
        const selectedClient = clients.find(
          (client) => client.username === selectedAd.clientName
        );
        setFormData((prev) => ({
          ...prev,
          amount: selectedAd.budget,
          clientUserId: selectedClient ? selectedClient.id : "",
        }));
      }
    }
  };

  const validateForm = () => {
    const validation = PaymentService.validatePaymentData(formData);
    const errorMap = {};

    validation.errors.forEach((error) => {
      if (error.includes("Client")) {
        errorMap.client = error;
      } else if (error.includes("Advertisement")) {
        errorMap.advertisement = error;
      } else if (error.includes("Amount")) {
        errorMap.amount = error;
      } else if (error.includes("Invoice")) {
        errorMap.invoiceNumber = error;
      } else if (error.includes("due date")) {
        errorMap.dueDate = error;
      } else {
        // Default mapping for other errors
        const field = error.toLowerCase().split(" ")[0];
        errorMap[field] = error;
      }
    });

    setErrors(errorMap);
    return validation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for credentials
    const credentials = {
      username: user.username,
      password: user.password,
    };
    if (!credentials) {
      setCredentialsModal({
        isOpen: true,
        onSuccess: () => {
          setCredentialsModal({ isOpen: false, onSuccess: null });
          handleSubmit(e);
        },
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setSubmitError("");

      // Prepare data for submission
      const submitData = {
        ...formData,
        amount: Number(formData.amount),
        advertisementId: Number(formData.advertisementId),
        clientUserId: Number(formData.clientUserId),
      };

      // Convert dueDate to the required format (YYYY-MM-DDTHH:mm:ss)
      if (formData.dueDate) {
        submitData.dueDate = `${formData.dueDate}T00:00:00`;
      }

      console.log("clients: ", clients);

      // Validate that required numeric fields are valid
      if (!submitData.clientUserId || submitData.clientUserId === 0) {
        setSubmitError("Please select a client");
        return;
      }

      if (!submitData.advertisementId || submitData.advertisementId === 0) {
        setSubmitError("Please select an advertisement");
        return;
      }

      // Remove empty fields
      if (!submitData.dueDate) delete submitData.dueDate;
      if (!submitData.description) delete submitData.description;

      console.log("Submitting payment data:", submitData);

      const result = await PaymentService.createPayment(
        submitData,
        credentials
      );

      // Redirect to the created payment detail page
      router.push(`/payments/${result.id}`);
    } catch (err) {
      setSubmitError(err.message || "Failed to create payment");
      console.error("Error creating payment:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInvoiceNumber = () => {
    const newInvoiceNumber = PaymentService.generateInvoiceNumber();
    setFormData((prev) => ({ ...prev, invoiceNumber: newInvoiceNumber }));
  };

  // Get tomorrow's date as minimum due date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDueDate = tomorrow.toISOString().split("T")[0];

  const selectedAd = advertisements.find(
    (ad) => ad.id === Number(formData.advertisementId)
  );
  const selectedClient = clients.find(
    (client) => client.id === Number(formData.clientUserId)
  );

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Loading payment creation form...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/payments"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Payments
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Create New Payment
          </h1>
          <p className="mt-1 text-gray-600">
            Create a payment request for a client advertisement
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
            {/* Payment Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="invoiceNumber"
                      value={formData.invoiceNumber}
                      onChange={handleInputChange}
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.invoice ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="INV-YYYY-XXX"
                    />
                    <button
                      type="button"
                      onClick={generateNewInvoiceNumber}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                    >
                      Generate
                    </button>
                  </div>
                  {errors.invoice && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.invoice}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Format: INV-YYYY-XXX
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (USD) *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0.01"
                    step="0.01"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.amount ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    min={minDueDate}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Optional - leave blank for no due date
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Payment description or notes"
                  />
                </div>
              </div>
            </div>

            {/* Advertisement Selection */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Advertisement Selection
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Advertisement *
                  </label>
                  <select
                    name="advertisementId"
                    value={formData.advertisementId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.advertisement
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Select an advertisement</option>
                    {advertisements.map((ad) => (
                      <option key={ad.id} value={ad.id}>
                        {ad.title} - {ad.clientName} (
                        {PaymentService.formatCurrency(ad.budget)})
                      </option>
                    ))}
                  </select>
                  {errors.advertisement && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.advertisement}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client *
                  </label>
                  <select
                    name="clientUserId"
                    value={formData.clientUserId}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.client ? "border-red-300" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.fullName} ({client.username}) - {client.email}
                      </option>
                    ))}
                  </select>
                  {errors.client && (
                    <p className="mt-1 text-sm text-red-600">{errors.client}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Section */}
            {(selectedAd || selectedClient) && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Preview
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedAd && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Advertisement:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedAd.title}
                      </span>
                    </div>
                  )}
                  {selectedClient && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Client:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {selectedClient.fullName} ({selectedClient.email})
                      </span>
                    </div>
                  )}
                  {formData.amount && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Amount:
                      </span>
                      <span className="ml-2 text-lg font-semibold text-green-600">
                        {PaymentService.formatCurrency(formData.amount)}
                      </span>
                    </div>
                  )}
                  {formData.dueDate && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Due Date:
                      </span>
                      <span className="ml-2 text-sm text-gray-900">
                        {PaymentService.formatDate(formData.dueDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/payments"
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-center transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating Payment..." : "Create Payment"}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            💡 Payment Creation Tips
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • Select an advertisement to auto-populate the amount and client
            </li>
            <li>• Invoice numbers are auto-generated but can be customized</li>
            <li>• Due dates are optional - leave blank for no due date</li>
            <li>
              • The client will receive a notification to process the payment
            </li>
          </ul>
        </div>
      </div>

      {/* Credentials Modal */}
      <CredentialsModal
        isOpen={credentialsModal.isOpen}
        onClose={() => setCredentialsModal({ isOpen: false, onSuccess: null })}
        onSuccess={credentialsModal.onSuccess}
      />
    </div>
  );
}
