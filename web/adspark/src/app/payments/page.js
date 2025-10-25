"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useCredentials } from "../../context/CredentialsContext";
import PaymentService from "../../services/paymentService";

export default function PaymentsPage() {
  const { user } = useAuth();
  const { getStoredCredentials } = useCredentials();
  const router = useRouter();
  const [payments, setPayments] = useState([]);
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

    // Check if user has permission to view payments
    const isFinanceTeam = user.role === "FINANCE_TEAM";
    const isClient = user.client;

    if (!isFinanceTeam && !isClient) {
      router.push("/dashboard/internal");
      return;
    }

    loadPayments();
  }, [user, router]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const credentials = {
        username: user.username,
        password: user.password,
      };
      if (!credentials) {
        // For logged-in clients without credentials, show helpful message instead of modal
        if (user.client && !user.internalUser) {
          setError(
            "Payment management requires additional permissions. Please contact your account manager for access to payment features."
          );
        } else {
          setError(
            "Authentication required for payment management. Please contact support."
          );
        }
        setLoading(false);
        return;
      }

      const data = await PaymentService.getPaymentSummaries(credentials);
      setPayments(data);
    } catch (err) {
      setError(err.message || "Failed to load payments");
      console.error("Error loading payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPayments = payments
    .filter((payment) => {
      // Filter by status
      if (filter !== "all" && payment.status !== filter) return false;

      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          payment.paymentReference.toLowerCase().includes(term) ||
          payment.invoiceNumber.toLowerCase().includes(term) ||
          payment.clientUsername.toLowerCase().includes(term) ||
          payment.clientFullName?.toLowerCase().includes(term) ||
          payment.advertisementTitle.toLowerCase().includes(term)
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
        sortBy === "paidDate" ||
        sortBy === "dueDate"
      ) {
        aValue = aValue ? new Date(aValue) : new Date(0);
        bValue = bValue ? new Date(bValue) : new Date(0);
      }

      // Handle numeric sorting
      if (sortBy === "amount") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusBadge = (payment) => {
    const statusText = PaymentService.getPaymentStatusText(payment);
    const statusClasses = PaymentService.getStatusColor(payment.status);
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses}`}
      >
        {statusText}
      </span>
    );
  };

  const getUrgencyBadge = (payment) => {
    const urgency = PaymentService.getPaymentUrgency(payment);
    const urgencyClasses = PaymentService.getUrgencyColor(urgency);

    if (urgency === "low") return null; // Don't show low urgency badges

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyClasses}`}
      >
        {urgency === "high" ? "URGENT" : "Due Soon"}
      </span>
    );
  };

  const isFinanceTeam = user?.role === "FINANCE_TEAM";
  const totalPending = payments.reduce(
    (sum, p) => (p.status === "PENDING" ? sum + p.amount : sum),
    0
  );
  const totalPaid = payments.reduce(
    (sum, p) => (p.isPaid ? sum + p.amount : sum),
    0
  );
  const overdueCount = payments.filter((p) => p.isOverdue).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading payments...</p>
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
                {isFinanceTeam ? "Payment Management" : "My Payments"}
              </h1>
              <p className="mt-1 text-gray-600">
                {isFinanceTeam
                  ? "Manage all client payments and invoices"
                  : "View and process your payments"}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              {isFinanceTeam && (
                <Link
                  href="/payments/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Payment
                </Link>
              )}
              <button
                onClick={loadPayments}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Refresh
              </button>
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
              onClick={loadPayments}
              className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">
              Total Payments
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {payments.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">
              Pending Amount
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {PaymentService.formatCurrency(totalPending)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Paid Amount</div>
            <div className="text-2xl font-bold text-green-600">
              {PaymentService.formatCurrency(totalPaid)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-500">Overdue</div>
            <div className="text-2xl font-bold text-red-600">
              {overdueCount}
            </div>
          </div>
        </div>

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
                placeholder="Search payments..."
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
                <option value="PENDING">Pending</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
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
                <option value="amount">Amount</option>
                <option value="dueDate">Due Date</option>
                <option value="status">Status</option>
                <option value="paymentReference">Reference</option>
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

        {/* Payments Table */}
        {filteredAndSortedPayments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">💳</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payments found
            </h3>
            <p className="text-gray-600 mb-4">
              {payments.length === 0
                ? "No payments have been created yet."
                : "No payments match your current filters."}
            </p>
            {isFinanceTeam && payments.length === 0 && (
              <Link
                href="/payments/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create First Payment
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    {isFinanceTeam && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Advertisement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {payment.paymentReference}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.invoiceNumber}
                          </div>
                          <div className="text-xs text-gray-400">
                            Created:{" "}
                            {PaymentService.formatDate(payment.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {PaymentService.formatCurrency(payment.amount)}
                        </div>
                        {payment.dueDate && (
                          <div className="text-xs text-gray-500">
                            Due: {PaymentService.formatDate(payment.dueDate)}
                          </div>
                        )}
                      </td>
                      {isFinanceTeam && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.clientFullName || payment.clientUsername}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.clientEmail}
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.advertisementTitle}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {payment.advertisementId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          {getStatusBadge(payment)}
                          {getUrgencyBadge(payment)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/payments/${payment.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          View Details
                        </Link>
                        {!payment.isPaid && !isFinanceTeam && (
                          <Link
                            href={`/payments/${payment.id}/pay`}
                            className="text-green-600 hover:text-green-900"
                          >
                            Pay Now
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
