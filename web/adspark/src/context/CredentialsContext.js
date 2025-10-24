// Credentials context for managing Basic Auth credentials securely
"use client";

import { createContext, useContext, useState } from "react";

const CredentialsContext = createContext({});

export const useCredentials = () => {
  const context = useContext(CredentialsContext);
  if (!context) {
    throw new Error("useCredentials must be used within a CredentialsProvider");
  }
  return context;
};

export const CredentialsProvider = ({ children }) => {
  const [credentials, setCredentials] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const storeCredentials = (username, password) => {
    setCredentials({ username, password });
    // Store temporarily in session storage (more secure than localStorage for passwords)
    sessionStorage.setItem(
      "adspark_temp_credentials",
      JSON.stringify({ username, password })
    );
  };

  const clearCredentials = () => {
    setCredentials(null);
    sessionStorage.removeItem("adspark_temp_credentials");
  };

  const getStoredCredentials = () => {
    if (credentials) return credentials;

    try {
      const stored = sessionStorage.getItem("adspark_temp_credentials");
      if (stored) {
        const parsedCredentials = JSON.parse(stored);
        setCredentials(parsedCredentials);
        return parsedCredentials;
      }
    } catch (error) {
      console.error("Error retrieving stored credentials:", error);
    }
    return null;
  };

  const requestCredentials = (action) => {
    return new Promise((resolve, reject) => {
      const storedCreds = getStoredCredentials();
      if (storedCreds) {
        resolve(storedCreds);
        return;
      }

      setPendingAction({ action, resolve, reject });
      setShowCredentialsModal(true);
    });
  };

  const handleCredentialsSubmit = (username, password) => {
    storeCredentials(username, password);
    setShowCredentialsModal(false);

    if (pendingAction) {
      pendingAction.resolve({ username, password });
      setPendingAction(null);
    }
  };

  const handleCredentialsCancel = () => {
    setShowCredentialsModal(false);

    if (pendingAction) {
      pendingAction.reject(new Error("User cancelled credential input"));
      setPendingAction(null);
    }
  };

  const value = {
    credentials,
    storeCredentials,
    clearCredentials,
    getStoredCredentials,
    requestCredentials,
    showCredentialsModal,
    handleCredentialsSubmit,
    handleCredentialsCancel,
    pendingAction,
  };

  return (
    <CredentialsContext.Provider value={value}>
      {children}
    </CredentialsContext.Provider>
  );
};

// Credentials Modal Component
export const CredentialsModal = () => {
  const {
    showCredentialsModal,
    handleCredentialsSubmit,
    handleCredentialsCancel,
  } = useCredentials();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!showCredentialsModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    setError("");
    handleCredentialsSubmit(username, password);
    setUsername("");
    setPassword("");
  };

  const handleCancel = () => {
    setUsername("");
    setPassword("");
    setError("");
    handleCredentialsCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Authentication Required
        </h2>
        <p className="text-black mb-6">
          Please enter your credentials to access asset management features.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-black"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Enter your username"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-black"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-black bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Authenticate
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-black">
            Your credentials are temporarily stored in this session for asset
            management operations.
          </p>
        </div>
      </div>
    </div>
  );
};
