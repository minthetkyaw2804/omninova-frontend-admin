// Function to detect local IP and return appropriate base URL
const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Try to get local IP from various sources
  const hostname = window.location.hostname;

  // Check if running on local IP starting with 10.60.34.
  if (hostname.startsWith("10.60.34.")) {
    return "http://10.60.34.21";
  }

  // Default to external IP
  return "http://162.84.221.21";
};

// API Configuration for Customer Panel
export const API_CONFIG = {
  // Base URL for your API - automatically detected based on local IP
  BASE_URL: getBaseUrl(),

  // Customer API Endpoints
  ENDPOINTS: {
    COMPANY_DETAILS: "/api/customer/company-details",
    BLOGS: "/api/customer/blogs",
    BLOG_DETAILS: "/api/customer/blogs",
    PROJECTS: "/api/customer/projects",
    PROJECT_DETAILS: "/api/customer/projects",
    PROJECT_TYPES: "/api/customer/project-types",
  },

  // Request timeout in milliseconds
  TIMEOUT: 60000,

  // Default headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};