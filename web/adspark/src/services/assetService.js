// Asset management API service functions with Basic Auth support

const API_BASE_URL = "http://localhost:8080/api";

// Helper function to create Basic Auth header
const createBasicAuthHeader = (username, password) => {
  const credentials = btoa(`${username}:${password}`);
  return `Basic ${credentials}`;
};

// Helper function to get auth headers for current user
const getAuthHeaders = (user) => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  // For Basic Auth, we need the username and password
  // Since we don't store the password, we'll need to handle this differently
  // For now, we'll assume the password is stored temporarily or passed as parameter
  const headers = {
    "Content-Type": "application/json",
  };

  // Note: In a real application, you might want to store a token instead
  // For Basic Auth, we'll need the user to provide credentials when needed
  return headers;
};

// Asset API service class
export class AssetService {
  static async createAsset(assetData, file, credentials) {
    if (!credentials || !credentials.username || !credentials.password) {
      throw new Error("Basic Auth credentials required");
    }

    const formData = new FormData();

    // Append asset metadata
    formData.append("name", assetData.name);
    formData.append("description", assetData.description);
    formData.append("type", assetData.type);
    formData.append("tags", assetData.tags);
    if (assetData.isPublic !== undefined) {
      formData.append("isPublic", assetData.isPublic);
    }

    // Append file
    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/assets`, {
        method: "POST",
        headers: {
          Authorization: createBasicAuthHeader(
            credentials.username,
            credentials.password
          ),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating asset:", error);
      throw error;
    }
  }

  static async searchAssets(searchParams = {}, credentials) {
    if (!credentials || !credentials.username || !credentials.password) {
      throw new Error("Basic Auth credentials required");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/assets/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: createBasicAuthHeader(
            credentials.username,
            credentials.password
          ),
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error searching assets:", error);
      throw error;
    }
  }

  static async getAsset(assetId, credentials) {
    if (!credentials || !credentials.username || !credentials.password) {
      throw new Error("Basic Auth credentials required");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/assets/${assetId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: createBasicAuthHeader(
            credentials.username,
            credentials.password
          ),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching asset:", error);
      throw error;
    }
  }

  static async downloadAsset(assetId, credentials) {
    if (!credentials || !credentials.username || !credentials.password) {
      throw new Error("Basic Auth credentials required");
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/assets/${assetId}/download`,
        {
          method: "GET",
          headers: {
            Authorization: createBasicAuthHeader(
              credentials.username,
              credentials.password
            ),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.blob();
    } catch (error) {
      console.error("Error downloading asset:", error);
      throw error;
    }
  }

  // Helper method to get asset file URL
  static getAssetFileUrl(fileUrl) {
    if (fileUrl && fileUrl.startsWith("/api/")) {
      return `${API_BASE_URL.replace("/api", "")}${fileUrl}`;
    }
    return fileUrl;
  }

  // Helper method to format file size
  static formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  // Helper method to get file type icon
  static getFileTypeIcon(fileType) {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎥";
    if (fileType.startsWith("audio/")) return "🎵";
    if (fileType.includes("pdf")) return "📄";
    return "📁";
  }
}

// Asset-related utility functions
export const ASSET_TYPES = [
  { value: "TEMPLATE", label: "Template" },
  { value: "IMAGE", label: "Image" },
  { value: "VIDEO", label: "Video" },
  { value: "AUDIO", label: "Audio" },
  { value: "DOCUMENT", label: "Document" },
  { value: "OTHER", label: "Other" },
];

export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB for images
  VIDEO: 100 * 1024 * 1024, // 100MB for videos
  AUDIO: 50 * 1024 * 1024, // 50MB for audio
  DOCUMENT: 10 * 1024 * 1024, // 10MB for documents
  OTHER: 5 * 1024 * 1024, // 5MB for other files
};

export const ALLOWED_FILE_TYPES = {
  IMAGE: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
  ],
  VIDEO: ["video/mp4", "video/avi", "video/mov", "video/wmv", "video/webm"],
  AUDIO: ["audio/mp3", "audio/wav", "audio/ogg", "audio/aac"],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  OTHER: ["application/zip", "application/x-rar-compressed", "text/plain"],
};

// Validation functions
export const validateAssetFile = (file, assetType) => {
  const errors = [];

  if (!file) {
    errors.push("File is required");
    return errors;
  }

  // Check file size
  const maxSize = MAX_FILE_SIZES[assetType] || MAX_FILE_SIZES.OTHER;
  if (file.size > maxSize) {
    errors.push(
      `File size must be less than ${AssetService.formatFileSize(maxSize)}`
    );
  }

  // Check file type
  const allowedTypes =
    ALLOWED_FILE_TYPES[assetType] || ALLOWED_FILE_TYPES.OTHER;
  if (!allowedTypes.includes(file.type)) {
    errors.push(
      `File type ${
        file.type
      } is not allowed for ${assetType.toLowerCase()} assets`
    );
  }

  return errors;
};

export const validateAssetData = (assetData) => {
  const errors = [];

  if (!assetData.name || assetData.name.trim().length === 0) {
    errors.push("Asset name is required");
  }

  if (!assetData.description || assetData.description.trim().length === 0) {
    errors.push("Asset description is required");
  }

  if (!assetData.type || assetData.type.trim().length === 0) {
    errors.push("Asset type is required");
  }

  if (assetData.name && assetData.name.length > 100) {
    errors.push("Asset name must be less than 100 characters");
  }

  if (assetData.description && assetData.description.length > 500) {
    errors.push("Asset description must be less than 500 characters");
  }

  return errors;
};
