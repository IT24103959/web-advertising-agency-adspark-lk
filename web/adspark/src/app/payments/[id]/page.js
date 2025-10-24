"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import PaymentService from "../../../services/paymentService";

export default function PaymentDetailPage({ params }) {
  const { user } = useAuth();
  const router = useRouter();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: "CREDIT_CARD",
    transactionId: "",
    lastFourDigits: "",
    bankName: "",
  });

  const paymentId = params.id;

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Check if user has permission to view payments
    const isFinanceTeam = user.role === "FINANCE_TEAM";
    const isClient = user.client;

    if (!isFinanceTeam && !isClient) {
      router.push("/dashboard/internal");
      return;
    }

    if (paymentId) {
      loadPayment();
    }
  }, [user, router, paymentId]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await PaymentService.getPaymentStatus(paymentId);
      setPayment(data);
    } catch (err) {
      setError(err.message || "Failed to load payment");
      console.error("Error loading payment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();

    try {
      setProcessing(true);
      setError("");

      // Validate form
      const validation =
        PaymentService.validatePaymentProcessingData(paymentForm);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return;
      }

      const result = await PaymentService.processPayment(
        paymentId,
        paymentForm
      );

      // Refresh payment data
      await loadPayment();
      setShowPaymentModal(false);

      // Reset form
      setPaymentForm({
        paymentMethod: "CREDIT_CARD",
        transactionId: "",
        lastFourDigits: "",
        bankName: "",
      });
    } catch (err) {
      setError(err.message || "Failed to process payment");
      console.error("Error processing payment:", err);
    } finally {
      setProcessing(false);
    }
  };

  const generateTransactionId = () => {
    const transactionId = PaymentService.generateTransactionId();
    setPaymentForm((prev) => ({
      ...prev,
      transactionId,
    }));
  };

  const isFinanceTeam = user?.role === "FINANCE_TEAM";
  const isClient = user?.client;
  const canProcessPayment =
    isClient && payment && !payment.paid && payment.status === "PENDING";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payment details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !payment) {
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
                  onClick={loadPayment}
                  className="text-red-600 hover:text-red-800 underline text-sm"
                >
                  Try again
                </button>
                <Link
                  href="/payments"
                  className="text-red-600 hover:text-red-800 underline text-sm"
                >
                  Back to Payments
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const daysUntilDue = PaymentService.getDaysUntilDue(payment?.dueDate);
  const urgency = PaymentService.getPaymentUrgency(payment);

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

        {payment && (
          <>
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-3xl">💳</span>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {payment.paymentReference}
                      </h1>
                      <p className="text-gray-600">
                        Invoice: {payment.invoiceNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${PaymentService.getStatusColor(
                        payment.status
                      )}`}
                    >
                      {PaymentService.getPaymentStatusText(payment)}
                    </span>
                    {urgency !== "low" && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${PaymentService.getUrgencyColor(
                          urgency
                        )}`}
                      >
                        {urgency === "high" ? "URGENT" : "Due Soon"}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      {PaymentService.formatCurrency(payment.amount)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {canProcessPayment && (
                  <div className="flex space-x-2 mt-4 lg:mt-0">
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                    >
                      Pay Now
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

            {/* Payment Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Payment Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Payment Information
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Amount
                      </label>
                      <p className="mt-1 text-lg font-semibold text-green-600">
                        {PaymentService.formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Status
                      </label>
                      <p className="mt-1">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${PaymentService.getStatusColor(
                            payment.status
                          )}`}
                        >
                          {PaymentService.getPaymentStatusText(payment)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Payment Reference
                    </label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">
                      {payment.paymentReference}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Invoice Number
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {payment.invoiceNumber}
                    </p>
                  </div>

                  {payment.transactionId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Transaction ID
                      </label>
                      <p className="mt-1 text-sm text-gray-900 font-mono">
                        {payment.transactionId}
                      </p>
                    </div>
                  )}

                  {payment.paymentMethod && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Payment Method
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {PaymentService.getPaymentMethodIcon(
                          payment.paymentMethod
                        )}{" "}
                        {PaymentService.getPaymentMethodDisplay(
                          payment.paymentMethod
                        )}
                      </p>
                    </div>
                  )}

                  {payment.lastFourDigits && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Card Ending
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        ****{payment.lastFourDigits}
                      </p>
                    </div>
                  )}

                  {payment.bankName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Bank
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {payment.bankName}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Timeline
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Created
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {PaymentService.formatDateTime(payment.createdAt)}
                    </p>
                  </div>

                  {payment.dueDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Due Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {PaymentService.formatDate(payment.dueDate)}
                        {daysUntilDue !== null && (
                          <span
                            className={`ml-2 text-xs ${
                              daysUntilDue < 0
                                ? "text-red-600"
                                : daysUntilDue <= 3
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            (
                            {daysUntilDue < 0
                              ? `${Math.abs(daysUntilDue)} days overdue`
                              : daysUntilDue === 0
                              ? "Due today"
                              : `${daysUntilDue} days remaining`}
                            )
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {payment.paidDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Paid Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {PaymentService.formatDateTime(payment.paidDate)}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Last Updated
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {PaymentService.formatDateTime(payment.updatedAt)}
                    </p>
                  </div>

                  {payment.daysSinceCreated !== undefined && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Days Since Created
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {payment.daysSinceCreated} days
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Client and Advertisement Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Client Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Client Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {payment.clientFullName || payment.clientUsername}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Username
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {payment.clientUsername}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {payment.clientEmail}
                    </p>
                  </div>

                  {payment.clientCompanyName && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">
                        Company
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {payment.clientCompanyName}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Advertisement Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Advertisement
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Campaign Title
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {payment.advertisementTitle}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Advertisement ID
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {payment.advertisementId}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Client Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {payment.advertisementClientName}
                    </p>
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/advertisements/${payment.advertisementId}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Advertisement Details →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Gateway Response */}
            {payment.gatewayResponse && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Gateway Response
                </h2>
                <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto">
                  {JSON.stringify(payment.gatewayResponse, null, 2)}
                </pre>
              </div>
            )}

            {/* Description */}
            {payment.description && (
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Description
                </h2>
                <p className="text-sm text-gray-900">{payment.description}</p>
              </div>
            )}
          </>
        )}

        {/* Payment Processing Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Process Payment
              </h3>
              <form onSubmit={handleProcessPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={paymentForm.paymentMethod}
                    onChange={handlePaymentFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="PAYPAL">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction ID
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      name="transactionId"
                      value={paymentForm.transactionId}
                      onChange={handlePaymentFormChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter transaction ID"
                      required
                    />
                    <button
                      type="button"
                      onClick={generateTransactionId}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                {(paymentForm.paymentMethod === "CREDIT_CARD" ||
                  paymentForm.paymentMethod === "DEBIT_CARD") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Four Digits
                    </label>
                    <input
                      type="text"
                      name="lastFourDigits"
                      value={paymentForm.lastFourDigits}
                      onChange={handlePaymentFormChange}
                      maxLength="4"
                      pattern="\d{4}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234"
                    />
                  </div>
                )}

                {paymentForm.paymentMethod === "BANK_TRANSFER" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={paymentForm.bankName}
                      onChange={handlePaymentFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bank name"
                    />
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    disabled={processing}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing
                      ? "Processing..."
                      : `Pay ${PaymentService.formatCurrency(
                          payment?.amount || 0
                        )}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
