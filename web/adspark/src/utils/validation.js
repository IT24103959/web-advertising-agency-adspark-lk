// Utility functions for form validation and common helpers

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters, with at least one letter and one number
  const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return re.test(password);
};

export const validatePhoneNumber = (phone) => {
  // Basic phone number validation (allows +1234567890 format)
  const re = /^\+?[1-9]\d{1,14}$/;
  return re.test(phone);
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Role options for internal users
export const INTERNAL_ROLES = [
  { value: "SYSTEM_ADMIN", label: "System Administrator" },
  { value: "MARKETING_MANAGER", label: "Marketing Manager" },
  { value: "GRAPHIC_DESIGNER", label: "Graphic Designer" },
  { value: "IT_SUPPORT", label: "IT Support" },
  { value: "CUSTOMER_SUPPORT", label: "Customer Support" },
  { value: "FINANCE_TEAM", label: "Finance Team" },
];

// Business type options for external users
export const BUSINESS_TYPES = [
  { value: "Retail", label: "Retail" },
  { value: "E-commerce", label: "E-commerce" },
  { value: "Technology", label: "Technology" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance" },
  { value: "Education", label: "Education" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Services", label: "Services" },
  { value: "Other", label: "Other" },
];

// Industry options for external users
export const INDUSTRIES = [
  { value: "E-commerce", label: "E-commerce" },
  { value: "Technology", label: "Technology" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance" },
  { value: "Education", label: "Education" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Food & Beverage", label: "Food & Beverage" },
  { value: "Real Estate", label: "Real Estate" },
  { value: "Automotive", label: "Automotive" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Other", label: "Other" },
];

// Department options for internal users
export const DEPARTMENTS = [
  { value: "Administration", label: "Administration" },
  { value: "Marketing", label: "Marketing" },
  { value: "Design", label: "Design" },
  { value: "IT", label: "IT" },
  { value: "Customer Support", label: "Customer Support" },
  { value: "Finance", label: "Finance" },
  { value: "HR", label: "HR" },
];

// Office location options for internal users
export const OFFICE_LOCATIONS = [
  { value: "California Office", label: "California Office" },
  { value: "New York Office", label: "New York Office" },
  { value: "London Office", label: "London Office" },
  { value: "Singapore Office", label: "Singapore Office" },
  { value: "Remote", label: "Remote" },
];

// Format form errors for display
export const formatFormErrors = (errors) => {
  if (typeof errors === "string") {
    return [errors];
  }
  if (Array.isArray(errors)) {
    return errors;
  }
  if (typeof errors === "object") {
    return Object.values(errors).flat();
  }
  return ["An unknown error occurred"];
};
