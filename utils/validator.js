// utils/validator.js

/**
 * Simple JSON Schema validator for React Native.
 * @param {Object} schema - The schema object (e.g., registerSchema.body)
 * @param {Object} data - The data to validate
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validate = (schema, data) => {
  const errors = {};
  const { properties, required = [] } = schema;

  if (!properties) return { isValid: true, errors: {} };

  // Check required fields
  required.forEach((field) => {
    if (
      data[field] === undefined ||
      data[field] === null ||
      data[field] === ""
    ) {
      errors[field] = "This field is required";
    }
  });

  // Check properties
  Object.keys(properties).forEach((field) => {
    const value = data[field];
    const rules = properties[field];

    if (value !== undefined && value !== null && value !== "") {
      // Email format check
      if (rules.format === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors[field] = "Invalid email format";
        }
      }

      // Min length check
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `Must be at least ${rules.minLength} characters`;
      }

      // Enum check
      if (rules.enum && !rules.enum.includes(value)) {
        errors[field] = `Must be one of: ${rules.enum.join(", ")}`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
