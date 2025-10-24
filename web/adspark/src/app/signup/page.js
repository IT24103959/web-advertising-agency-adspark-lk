"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateRequired,
  validateUrl,
  INTERNAL_ROLES,
  BUSINESS_TYPES,
  INDUSTRIES,
  DEPARTMENTS,
  OFFICE_LOCATIONS,
  formatFormErrors,
} from "../../utils/validation";

export default function SignupPage() {
  const [userType, setUserType] = useState("external"); // 'external' or 'internal'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState([]);
  const [formData, setFormData] = useState({
    // Common fields
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",

    // External user fields
    companyName: "",
    companyAddress: "",
    businessType: "",
    industry: "",
    websiteUrl: "",

    // Internal user fields
    role: "",
    employeeId: "",
    department: "",
    officeLocation: "",
    accessLevel: 1,
  });

  const { signupExternal, signupInternal, error, clearError } = useAuth();
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 1 : value,
    }));

    // Clear errors when user starts typing
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = [];

    // Common validations
    if (!validateRequired(formData.username)) {
      errors.push("Username is required");
    }
    if (!validateRequired(formData.email)) {
      errors.push("Email is required");
    } else if (!validateEmail(formData.email)) {
      errors.push("Please enter a valid email address");
    }
    if (!validateRequired(formData.password)) {
      errors.push("Password is required");
    } else if (!validatePassword(formData.password)) {
      errors.push(
        "Password must be at least 8 characters with letters and numbers"
      );
    }
    if (!validateRequired(formData.firstName)) {
      errors.push("First name is required");
    }
    if (!validateRequired(formData.lastName)) {
      errors.push("Last name is required");
    }
    if (!validateRequired(formData.phoneNumber)) {
      errors.push("Phone number is required");
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      errors.push("Please enter a valid phone number (e.g., +1234567890)");
    }

    // Type-specific validations
    if (userType === "external") {
      if (!validateRequired(formData.companyName)) {
        errors.push("Company name is required");
      }
      if (!validateRequired(formData.companyAddress)) {
        errors.push("Company address is required");
      }
      if (!validateRequired(formData.businessType)) {
        errors.push("Business type is required");
      }
      if (!validateRequired(formData.industry)) {
        errors.push("Industry is required");
      }
      if (formData.websiteUrl && !validateUrl(formData.websiteUrl)) {
        errors.push("Please enter a valid website URL");
      }
    } else {
      if (!validateRequired(formData.role)) {
        errors.push("Role is required");
      }
      if (!validateRequired(formData.employeeId)) {
        errors.push("Employee ID is required");
      }
      if (!validateRequired(formData.department)) {
        errors.push("Department is required");
      }
      if (!validateRequired(formData.officeLocation)) {
        errors.push("Office location is required");
      }
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

    try {
      let result;

      if (userType === "external") {
        const externalData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          companyName: formData.companyName,
          companyAddress: formData.companyAddress,
          businessType: formData.businessType,
          industry: formData.industry,
          websiteUrl: formData.websiteUrl || undefined,
        };
        result = await signupExternal(externalData);
      } else {
        const internalData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          role: formData.role,
          employeeId: formData.employeeId,
          department: formData.department,
          officeLocation: formData.officeLocation,
          accessLevel: formData.accessLevel,
        };
        result = await signupInternal(internalData);
      }

      if (result.success) {
        // Redirect to login page with success message
        router.push("/login?message=Registration successful! Please log in.");
      } else {
        setFormErrors(formatFormErrors(result.error || "Registration failed"));
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
        <h2 className="text-center text-xl text-black">Create your account</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* User Type Toggle */}
          <div className="mb-6">
            <div className="flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => setUserType("external")}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
                  userType === "external"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-black border-gray-200 hover:bg-gray-50"
                }`}
              >
                Client Account
              </button>
              <button
                type="button"
                onClick={() => setUserType("internal")}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg border-t border-r border-b ${
                  userType === "internal"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-black border-gray-200 hover:bg-gray-50"
                }`}
              >
                Employee Account
              </button>
            </div>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username *
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-black">
                At least 8 characters with letters and numbers
              </p>
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number *
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                placeholder="+1234567890"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* External User Fields */}
            {userType === "external" && (
              <>
                <div>
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Name *
                  </label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="companyAddress"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Company Address *
                  </label>
                  <textarea
                    id="companyAddress"
                    name="companyAddress"
                    rows={3}
                    required
                    value={formData.companyAddress}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="businessType"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Business Type *
                    </label>
                    <select
                      id="businessType"
                      name="businessType"
                      required
                      value={formData.businessType}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Business Type</option>
                      {BUSINESS_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="industry"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Industry *
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      required
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Industry</option>
                      {INDUSTRIES.map((industry) => (
                        <option key={industry.value} value={industry.value}>
                          {industry.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="websiteUrl"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Website URL
                  </label>
                  <input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.websiteUrl}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </>
            )}

            {/* Internal User Fields */}
            {userType === "internal" && (
              <>
                <div>
                  <label
                    htmlFor="employeeId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Employee ID *
                  </label>
                  <input
                    id="employeeId"
                    name="employeeId"
                    type="text"
                    required
                    placeholder="EMP001"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Role</option>
                    {INTERNAL_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Department *
                    </label>
                    <select
                      id="department"
                      name="department"
                      required
                      value={formData.department}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="officeLocation"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Office Location *
                    </label>
                    <select
                      id="officeLocation"
                      name="officeLocation"
                      required
                      value={formData.officeLocation}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Office</option>
                      {OFFICE_LOCATIONS.map((location) => (
                        <option key={location.value} value={location.value}>
                          {location.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="accessLevel"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Access Level *
                  </label>
                  <select
                    id="accessLevel"
                    name="accessLevel"
                    required
                    value={formData.accessLevel}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={1}>Level 1 - Basic</option>
                    <option value={2}>Level 2 - Standard</option>
                    <option value={3}>Level 3 - Advanced</option>
                    <option value={4}>Level 4 - Manager</option>
                    <option value={5}>Level 5 - Administrator</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-black">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
