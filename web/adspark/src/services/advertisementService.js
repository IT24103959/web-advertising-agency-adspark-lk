// Advertisement Service for handling API operations
import { CredentialsContext } from "../context/CredentialsContext";

const API_BASE_URL = "http://localhost:8080/api";

class AdvertisementService {
  /**
   * Create a new advertisement (Internal users only)
   * @param {Object} advertisementData - Advertisement data
   * @returns {Promise<Object>} Created advertisement
   */
  static async createAdvertisement(advertisementData) {
    const credentials = await CredentialsContext.getCredentials();

    if (!credentials) {
      throw new Error("Authentication required");
    }

    const authHeader =
      "Basic " + btoa(`${credentials.username}:${credentials.password}`);

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "clientName",
      "clientEmail",
      "budget",
      "format",
      "startDate",
      "endDate",
    ];
    for (const field of requiredFields) {
      if (!advertisementData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate date format and logic
    const startDate = new Date(advertisementData.startDate);
    const endDate = new Date(advertisementData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    if (endDate <= startDate) {
      throw new Error("End date must be after start date");
    }

    // Validate budget
    if (advertisementData.budget <= 0) {
      throw new Error("Budget must be greater than 0");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(advertisementData.clientEmail)) {
      throw new Error("Invalid email format");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/adverts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(advertisementData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          CredentialsContext.clearCredentials();
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. Only internal users can create advertisements."
          );
        }
        throw new Error(`Failed to create advertisement: ${errorText}`);
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
   * Get advertisement by ID
   * @param {number} id - Advertisement ID
   * @returns {Promise<Object>} Advertisement details
   */
  static async getAdvertisement(id) {
    const credentials = await CredentialsContext.getCredentials();

    if (!credentials) {
      throw new Error("Authentication required");
    }

    const authHeader =
      "Basic " + btoa(`${credentials.username}:${credentials.password}`);

    try {
      const response = await fetch(`${API_BASE_URL}/adverts/${id}`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          CredentialsContext.clearCredentials();
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 404) {
          throw new Error("Advertisement not found");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. You can only view your own advertisements."
          );
        }
        throw new Error(`Failed to get advertisement: ${response.statusText}`);
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
   * Delete advertisement (Internal users only)
   * @param {number} id - Advertisement ID
   * @returns {Promise<string>} Success message
   */
  static async deleteAdvertisement(id) {
    const credentials = await CredentialsContext.getCredentials();

    if (!credentials) {
      throw new Error("Authentication required");
    }

    const authHeader =
      "Basic " + btoa(`${credentials.username}:${credentials.password}`);

    try {
      const response = await fetch(`${API_BASE_URL}/adverts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          CredentialsContext.clearCredentials();
          throw new Error("Authentication failed. Please log in again.");
        } else if (response.status === 403) {
          throw new Error(
            "Access denied. Only internal users can delete advertisements."
          );
        } else if (response.status === 404) {
          throw new Error("Advertisement not found");
        }
        throw new Error(
          `Failed to delete advertisement: ${response.statusText}`
        );
      }

      return (await response.text()) || "Advertisement deleted successfully";
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
   * Get client's advertisement summaries
   * @returns {Promise<Array>} Array of advertisement summaries
   */
  static async getClientAdvertisementSummaries() {
    const credentials = await CredentialsContext.getCredentials();

    if (!credentials) {
      throw new Error("Authentication required");
    }

    const authHeader =
      "Basic " + btoa(`${credentials.username}:${credentials.password}`);

    try {
      const response = await fetch(`${API_BASE_URL}/adverts/my-summary`, {
        method: "GET",
        headers: {
          Authorization: authHeader,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          CredentialsContext.clearCredentials();
          throw new Error("Authentication failed. Please log in again.");
        }
        throw new Error(`Failed to get advertisements: ${response.statusText}`);
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
   * Get all public advertisements (No authentication required)
   * @returns {Promise<Array>} List of public advertisements
   */
  static async getPublicAdvertisements() {
    try {
      const response = await fetch(`${API_BASE_URL}/adverts/public`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get public advertisements: ${response.statusText}`
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
   * Format date for input fields
   * @param {string} dateString - ISO date string
   * @returns {string} YYYY-MM-DD formatted string
   */
  static formatDateForInput(dateString) {
    try {
      return new Date(dateString).toISOString().split("T")[0];
    } catch (error) {
      return "";
    }
  }

  /**
   * Get status color class for UI
   * @param {string} status - Advertisement status
   * @returns {string} CSS class name
   */
  static getStatusColor(status) {
    const statusColors = {
      DRAFT: "text-gray-500 bg-gray-100",
      PENDING: "text-yellow-700 bg-yellow-100",
      APPROVED: "text-green-700 bg-green-100",
      PUBLISHED: "text-blue-700 bg-blue-100",
      COMPLETED: "text-purple-700 bg-purple-100",
      CANCELLED: "text-red-700 bg-red-100",
    };
    return statusColors[status] || "text-gray-500 bg-gray-100";
  }

  /**
   * Get priority color class for UI
   * @param {number} priorityLevel - Priority level (1=High, 2=Medium, 3=Low)
   * @returns {string} CSS class name
   */
  static getPriorityColor(priorityLevel) {
    const priorityColors = {
      1: "text-red-700 bg-red-100", // High
      2: "text-yellow-700 bg-yellow-100", // Medium
      3: "text-green-700 bg-green-100", // Low
    };
    return priorityColors[priorityLevel] || "text-gray-500 bg-gray-100";
  }

  /**
   * Get format icon for UI
   * @param {string} format - Advertisement format
   * @returns {string} Icon name or emoji
   */
  static getFormatIcon(format) {
    const formatIcons = {
      IMAGE: "🖼️",
      VIDEO: "🎥",
      AUDIO: "🎵",
      TEXT: "📝",
      BANNER: "🏷️",
      SOCIAL: "📱",
    };
    return formatIcons[format] || "📄";
  }

  /**
   * Calculate days remaining until end date
   * @param {string} endDate - End date string
   * @returns {number} Days remaining (negative if expired)
   */
  static getDaysRemaining(endDate) {
    try {
      const end = new Date(endDate);
      const now = new Date();
      const diffTime = end - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Validate advertisement data
   * @param {Object} data - Advertisement data to validate
   * @returns {Object} Validation result with isValid and errors
   */
  static validateAdvertisementData(data) {
    const errors = [];

    // Required field validation
    if (!data.title?.trim()) errors.push("Title is required");
    if (!data.description?.trim()) errors.push("Description is required");
    if (!data.clientName?.trim()) errors.push("Client name is required");
    if (!data.clientEmail?.trim()) errors.push("Client email is required");
    if (!data.budget || data.budget <= 0)
      errors.push("Budget must be greater than 0");
    if (!data.format) errors.push("Format is required");
    if (!data.startDate) errors.push("Start date is required");
    if (!data.endDate) errors.push("End date is required");

    // Email validation
    if (
      data.clientEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.clientEmail)
    ) {
      errors.push("Invalid email format");
    }

    // Phone validation (if provided)
    if (data.clientPhone && !/^[\+]?[\d\s\-\(\)]+$/.test(data.clientPhone)) {
      errors.push("Invalid phone format");
    }

    // Date validation
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);

      if (isNaN(startDate.getTime())) errors.push("Invalid start date");
      if (isNaN(endDate.getTime())) errors.push("Invalid end date");

      if (
        !isNaN(startDate.getTime()) &&
        !isNaN(endDate.getTime()) &&
        endDate <= startDate
      ) {
        errors.push("End date must be after start date");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export default AdvertisementService;
