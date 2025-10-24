"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { validateRequired, formatFormErrors } from "../../utils/validation";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const { login, error, clearError, isLoggedIn, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success message from signup
  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      redirectToDashboard(user);
    }
  }, [isLoggedIn, user]);

  const redirectToDashboard = (userData) => {
    if (userData.internalUser) {
      // Internal users go to internal dashboard
      router.push("/dashboard/internal");
    } else if (userData.client) {
      // External clients go to client dashboard
      router.push("/dashboard/client");
    } else {
      // Fallback to general dashboard
      router.push("/dashboard");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
    if (error) {
      clearError();
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const validateForm = () => {
    const errors = [];

    if (!validateRequired(formData.username)) {
      errors.push("Username is required");
    }
    if (!validateRequired(formData.password)) {
      errors.push("Password is required");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setFormErrors([]);
    setSuccessMessage("");

    try {
      const result = await login(formData.username, formData.password);

      if (result.success && result.user) {
        // Redirect based on user type
        redirectToDashboard(result.user);
      } else {
        setFormErrors(formatFormErrors(result.error || "Login failed"));
      }
    } catch (error) {
      setFormErrors(["An unexpected error occurred. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-gray-900 mb-2">
          AdSpark
        </h1>
        <h2 className="text-center text-xl text-black">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="text-sm text-green-700">{successMessage}</div>
            </div>
          )}

          {/* Error Messages */}
          {(formErrors.length > 0 || error) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="text-sm text-red-700">
                {formErrors.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1">
                    {formErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                ) : (
                  error
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-black"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
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
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-black">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </form>

          {/* Demo Users Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-black mb-2">Demo Users:</h3>
            <div className="text-xs text-black space-y-1">
              <div>
                <strong>Client:</strong> username: rob, password: rob123@abc
              </div>
              <div>
                <strong>Employee:</strong> username: alice, password: alice123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
