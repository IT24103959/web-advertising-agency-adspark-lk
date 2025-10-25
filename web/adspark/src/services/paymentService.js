// Payment Service for handling API operations

const API_BASE_URL = "http://localhost:8080/api";
// Proxy URL for development (to avoid CORS issues)
const API_PROXY_BASE = "/api";

// Helper function to create Basic Auth headers
const createAuthHeaders = (credentials) => {
  if (!credentials) {
    throw new Error("Authentication required");
  }

  return {
    "Content-Type": "application/json",
    Authorization:
      "Basic " + btoa(`${credentials.username}:${credentials.password}`),
  };
};

class PaymentService {
  /**
   * Create a new payment (FINANCE_TEAM only)
   * @param {Object} paymentData - Payment data
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} Created payment
   */
  static async createPayment(paymentData, credentials) {
    const headers = createAuthHeaders(credentials);

    // Validate required fields
    const requiredFields = [
      "amount",
      "invoiceNumber",
      "advertisementId",
      "clientUserId",
    ];
    for (const field of requiredFields) {
      if (
        paymentData[field] === null ||
        paymentData[field] === undefined ||
        paymentData[field] === ""
      ) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate amount
    if (paymentData.amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }

    // Validate invoice number format
    if (!paymentData.invoiceNumber.match(/^INV-\d{4}-\d{3}$/)) {
      throw new Error("Invoice number must be in format INV-YYYY-XXX");
    }

    console.log("Creating payment with data:", paymentData);
    try {
      const response = await fetch(`${API_PROXY_BASE}/payments`, {
        method: "POST",
        headers,
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. Only finance team members can create payments."
          );
        }
        throw new Error(`Failed to create payment: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection."
        );
      }
      throw error;
    }
  }

  /**
   * Process payment (CLIENT users only)
   * @param {number} paymentId - Payment ID
   * @param {Object} paymentData - Payment processing data
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} Payment processing result
   */
  static async processPayment(paymentId, paymentData, credentials) {
    if (!credentials) {
      throw new Error("Authentication required");
    }

    const authHeader =
      "Basic " + btoa(`${credentials.username}:${credentials.password}`);

    // Validate required fields
    if (!paymentData.paymentMethod) {
      throw new Error("Payment method is required");
    }

    if (!paymentData.transactionId) {
      throw new Error("Transaction ID is required");
    }

    try {
      const response = await fetch(
        `${API_PROXY_BASE}/payments/${paymentId}/pay`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. You can only process your own payments."
          );
        } else if (response.status === 404) {
          throw new Error("Payment not found");
        }
        throw new Error(`Failed to process payment: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection."
        );
      }
      throw error;
    }
  }

  /**
   * Get payment status by ID
   * @param {number} paymentId - Payment ID
   * @param {Object} credentials - User credentials
   * @returns {Promise<Object>} Payment status details
   */
  static async getPaymentStatus(paymentId, credentials) {
    if (!credentials) {
      throw new Error("Authentication required");
    }

    const authHeader =
      "Basic " + btoa(`${credentials.username}:${credentials.password}`);

    try {
      const response = await fetch(
        `${API_PROXY_BASE}/payments/${paymentId}/status`,
        {
          method: "GET",
          headers: {
            Authorization: authHeader,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 404) {
          throw new Error("Payment not found");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. You can only view your own payments."
          );
        }
        throw new Error(`Failed to get payment status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection."
        );
      }
      throw error;
    }
  }

  /**
   * Get payment summaries (role-based: clients see their own, finance team sees all)
   * @param {Object} credentials - User credentials
   * @returns {Promise<Array>} Array of payment summaries
   */
  static async getPaymentSummaries(credentials) {
    if (!credentials) {
      throw new Error("Authentication required");
    }

    const authHeader =
      "Basic " + btoa(`${credentials.username}:${credentials.password}`);

    try {
      // Use proxy route to avoid CORS issues in development
      const response = await fetch(`${API_PROXY_BASE}/payments/summary`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(
          `Failed to get payment summaries: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Unable to connect to server. Please check your connection."
        );
      }
      throw error;
    }
  }

  /**
   * Format currency value
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }

  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  static formatDate(dateString) {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format date and time for display
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date and time string
   */
  static formatDateTime(dateString) {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Get status color class for UI
   * @param {string} status - Payment status
   * @returns {string} CSS class name
   */
  static getStatusColor(status) {
    const statusColors = {
      PENDING: "text-yellow-700 bg-yellow-100",
      PROCESSING: "text-blue-700 bg-blue-100",
      COMPLETED: "text-green-700 bg-green-100",
      FAILED: "text-red-700 bg-red-100",
      CANCELLED: "text-black bg-gray-100",
      REFUNDED: "text-purple-700 bg-purple-100",
    };
    return statusColors[status] || "text-black bg-gray-100";
  }

  /**
   * Get payment method display name
   * @param {string} method - Payment method
   * @returns {string} Display name
   */
  static getPaymentMethodDisplay(method) {
    const methodNames = {
      CREDIT_CARD: "Credit Card",
      DEBIT_CARD: "Debit Card",
      BANK_TRANSFER: "Bank Transfer",
      PAYPAL: "PayPal",
      CASH: "Cash",
      CHECK: "Check",
    };
    return methodNames[method] || method;
  }

  /**
   * Get payment method icon
   * @param {string} method - Payment method
   * @returns {string} Icon emoji or symbol
   */
  static getPaymentMethodIcon(method) {
    const methodIcons = {
      CREDIT_CARD: "💳",
      DEBIT_CARD: "💳",
      BANK_TRANSFER: "🏦",
      PAYPAL: "💰",
      CASH: "💵",
      CHECK: "📄",
    };
    return methodIcons[method] || "💳";
  }

  /**
   * Calculate days until due date
   * @param {string} dueDate - Due date string
   * @returns {number} Days until due (negative if overdue)
   */
  static getDaysUntilDue(dueDate) {
    if (!dueDate) return null;

    try {
      const due = new Date(dueDate);
      const now = new Date();
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if payment is overdue
   * @param {string} dueDate - Due date string
   * @param {boolean} isPaid - Whether payment is completed
   * @returns {boolean} True if overdue
   */
  static isOverdue(dueDate, isPaid) {
    if (!dueDate || isPaid) return false;
    return this.getDaysUntilDue(dueDate) < 0;
  }

  /**
   * Validate payment creation data
   * @param {Object} data - Payment data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validatePaymentData(data) {
    const errors = [];

    // Required field validation
    if (!data.amount || data.amount <= 0) {
      errors.push("Amount must be greater than 0");
    }

    if (!data.invoiceNumber?.trim()) {
      errors.push("Invoice number is required");
    } else if (!data.invoiceNumber.match(/^INV-\d{4}-\d{3}$/)) {
      errors.push("Invoice number must be in format INV-YYYY-XXX");
    }

    if (!data.advertisementId) {
      errors.push("Advertisement is required");
    }

    if (!data.clientUserId) {
      errors.push("Client is required");
    }

    // Due date validation (if provided)
    if (data.dueDate) {
      const dueDate = new Date(data.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.push("Invalid due date");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate payment processing data
   * @param {Object} data - Payment processing data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validatePaymentProcessingData(data) {
    const errors = [];

    if (!data.paymentMethod) {
      errors.push("Payment method is required");
    }

    if (!data.transactionId?.trim()) {
      errors.push("Transaction ID is required");
    }

    // Payment method specific validation
    if (
      data.paymentMethod === "CREDIT_CARD" ||
      data.paymentMethod === "DEBIT_CARD"
    ) {
      if (data.lastFourDigits && !/^\d{4}$/.test(data.lastFourDigits)) {
        errors.push("Last four digits must be 4 numbers");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate next invoice number
   * @returns {string} Next invoice number in format INV-YYYY-XXX
   */
  static generateInvoiceNumber() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 999) + 1;
    return `INV-${year}-${random.toString().padStart(3, "0")}`;
  }

  /**
   * Generate transaction ID
   * @returns {string} Transaction ID
   */
  static generateTransactionId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `TXN_${timestamp}_${random.toString().padStart(6, "0")}`;
  }

  /**
   * Get payment status text
   * @param {Object} payment - Payment object
   * @returns {string} Status description
   */
  static getPaymentStatusText(payment) {
    if (payment.isPaid || payment.status === "COMPLETED") {
      return "Paid";
    } else if (payment.isOverdue) {
      return "Overdue";
    } else if (payment.status === "PENDING") {
      return "Pending Payment";
    } else if (payment.status === "PROCESSING") {
      return "Processing";
    } else if (payment.status === "FAILED") {
      return "Failed";
    } else if (payment.status === "CANCELLED") {
      return "Cancelled";
    }
    return payment.status || "Unknown";
  }

  /**
   * Get urgency level for payment
   * @param {Object} payment - Payment object
   * @returns {string} Urgency level (high, medium, low)
   */
  static getPaymentUrgency(payment) {
    if (payment.isOverdue) return "high";

    const daysUntilDue = this.getDaysUntilDue(payment.dueDate);
    if (daysUntilDue === null) return "low";
    if (daysUntilDue <= 3) return "high";
    if (daysUntilDue <= 7) return "medium";
    return "low";
  }

  /**
   * Get urgency color class
   * @param {string} urgency - Urgency level
   * @returns {string} CSS class name
   */
  static getUrgencyColor(urgency) {
    const urgencyColors = {
      high: "text-red-700 bg-red-100",
      medium: "text-yellow-700 bg-yellow-100",
      low: "text-green-700 bg-green-100",
    };
    return urgencyColors[urgency] || "text-black bg-gray-100";
  }
}

export default PaymentService;
