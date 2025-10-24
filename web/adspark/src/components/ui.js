// Reusable components for the AdSpark application

export function LoadingSpinner({ size = "large", message = "Loading..." }) {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-12 w-12",
    large: "h-32 w-32",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div
          className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600 mx-auto`}
        ></div>
        <p className="mt-4 text-black">{message}</p>
      </div>
    </div>
  );
}

export function ErrorMessage({ errors, className = "" }) {
  if (!errors || (Array.isArray(errors) && errors.length === 0)) {
    return null;
  }

  const errorArray = Array.isArray(errors) ? errors : [errors];

  return (
    <div
      className={`p-3 bg-red-50 border border-red-200 rounded-md ${className}`}
    >
      <div className="text-sm text-red-700">
        {errorArray.length === 1 ? (
          errorArray[0]
        ) : (
          <ul className="list-disc list-inside space-y-1">
            {errorArray.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function SuccessMessage({ message, className = "" }) {
  if (!message) return null;

  return (
    <div
      className={`p-3 bg-green-50 border border-green-200 rounded-md ${className}`}
    >
      <div className="text-sm text-green-700">{message}</div>
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const baseClasses =
    "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  const variantClasses = {
    primary:
      "text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300",
    secondary:
      "text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    success:
      "text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300",
    danger:
      "text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300",
  };

  const sizeClasses = {
    small: "px-3 py-2 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${
        sizeClasses[size]
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {children}
        </div>
      ) : (
        children
      )}
    </button>
  );
}

export function Input({
  label,
  error,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-black"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
          error ? "border-red-300" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  required = false,
  options = [],
  placeholder = "Select an option",
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-black"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 ${
          error ? "border-red-300" : "border-gray-300"
        }`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-black"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 ${
          error ? "border-red-300" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
