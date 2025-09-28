import { buildApiUrl, API_CONFIG } from "../config/api";

// JWT Token management utilities
let tokenRefreshTimeout = null;

export const getToken = () => {
  return localStorage.getItem("jwtToken");
};

export const setToken = (token) => {
  localStorage.setItem("jwtToken", token);
};

export const removeToken = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("tokenTimestamp");
  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
    tokenRefreshTimeout = null;
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Set token with expiration tracking
export const setTokenWithExpiration = (tokenData) => {
  const { access_token, expires_in } = tokenData;
  setToken(access_token);

  // Store token timestamp
  const timestamp = Date.now();
  localStorage.setItem("tokenTimestamp", timestamp.toString());

  // Update user data with new expiration
  const user = getUser() || {};
  localStorage.setItem(
    "user",
    JSON.stringify({
      ...user,
      expires_in: expires_in,
      token_type: tokenData.token_type || "bearer",
    })
  );

  // Schedule token refresh
  scheduleTokenRefresh(expires_in);
};

// Check if token is expired or about to expire
export const isTokenExpired = () => {
  const user = getUser();
  const timestamp = localStorage.getItem("tokenTimestamp");

  if (!user?.expires_in || !timestamp) {
    return true;
  }

  const tokenAge = (Date.now() - parseInt(timestamp)) / 1000; // in seconds
  const expiresIn = user.expires_in;

  // Consider token expired if it has less than 60 seconds remaining
  return tokenAge >= expiresIn - 60;
};

// Refresh token API call
export const refreshToken = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No token available for refresh");
  }

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.REFRESH), {
      method: "POST",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();

    // Update token and schedule next refresh
    setTokenWithExpiration(data);

    return data;
  } catch (error) {
    console.error("Token refresh error:", error);
    // If refresh fails, logout user
    removeToken();
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
    throw error;
  }
};

// Schedule automatic token refresh
export const scheduleTokenRefresh = (expiresIn) => {
  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
  }

  // Schedule refresh 5 minutes before expiration (or at 80% of the expiration time, whichever is sooner)
  const refreshTime = Math.max(300, Math.floor(expiresIn * 0.8)) * 1000;

  tokenRefreshTimeout = setTimeout(async () => {
    try {
      await refreshToken();
    } catch (error) {
      console.error("Scheduled token refresh failed:", error);
    }
  }, refreshTime);
};

// Initialize token management on app load
export const initializeAuth = () => {
  const token = getToken();
  const user = getUser();
  const timestamp = localStorage.getItem("tokenTimestamp");

  if (!token || !user?.expires_in || !timestamp) {
    return;
  }

  const tokenAge = (Date.now() - parseInt(timestamp)) / 1000; // in seconds
  const remainingTime = user.expires_in - tokenAge;

  if (remainingTime <= 0) {
    // Token already expired, remove it
    removeToken();
    return;
  }

  if (remainingTime <= 60) {
    // Token expires in less than 60 seconds, refresh immediately
    refreshToken().catch((error) => {
      console.error("Initial token refresh failed:", error);
    });
  } else {
    // Schedule refresh based on remaining time
    scheduleTokenRefresh(remainingTime);
  }
};

// API utility for authenticated requests with automatic token refresh
export const apiRequest = async (url, options = {}) => {
  let token = getToken();

  // Check if token is expired and try to refresh
  if (isTokenExpired()) {
    try {
      await refreshToken();
      token = getToken();
    } catch (error) {
      console.error("Token refresh failed in apiRequest:", error);
      return;
    }
  }

  // Check if body is FormData to handle file uploads properly
  const isFormData = options.body instanceof FormData;

  const defaultHeaders = {
    // Don't set Content-Type for FormData - let browser set it with boundary
    ...(isFormData ? {} : API_CONFIG.DEFAULT_HEADERS),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers: defaultHeaders,
  };

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      // Token expired or invalid, try refresh once
      try {
        await refreshToken();
        const newToken = getToken();

        // Retry the request with new token
        const retryConfig = {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };

        const retryResponse = await fetch(url, retryConfig);
        if (retryResponse.status === 401) {
          throw new Error("Authentication failed after token refresh");
        }

        return retryResponse;
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        removeToken();
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        return;
      }
    }

    return response;
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Login API call
export const loginUser = async (email, password) => {
  const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
    method: "POST",
    headers: {
      ...API_CONFIG.DEFAULT_HEADERS,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Login failed");
  }

  const data = await response.json();
  return data;
};

// Logout API call
export const logoutUser = async () => {
  const token = getToken();

  if (!token) {
    // No token, just clear localStorage
    removeToken();
    return { message: "Logged out successfully" };
  }

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGOUT), {
      method: "GET",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    // Always clear local storage after API call, regardless of response
    removeToken();

    if (!response.ok) {
      console.warn("Logout API failed, but local session cleared:", data);
    }

    return data;
  } catch (error) {
    // If API call fails, still clear local storage
    removeToken();
    console.warn(
      "Logout API request failed, but local session cleared:",
      error
    );
    return { message: "Logged out successfully" };
  }
};

// Fetch company data including logo
export const fetchCompanyData = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.COMPANY), {
      method: "GET",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch company data: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Company data fetch error:", error);
    throw error;
  }
};

// Fetch all users/admins
export const fetchAllUsers = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.USERS), {
      method: "GET",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch users: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Users fetch error:", error);
    throw error;
  }
};

// Fetch all blogs
export const fetchBlogs = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.BLOGS), {
      method: "GET",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch blogs: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Blogs fetch error:", error);
    throw error;
  }
};

// Fetch single blog by ID
export const fetchBlogById = async (blogId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.BLOGS}/${blogId}`),
      {
        method: "GET",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch blog: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Blog fetch error:", error);
    throw error;
  }
};

// Create new blog
export const createBlog = async (formData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.BLOGS), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // Don't set Content-Type for FormData - browser will set it automatically
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to create blog: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Blog creation error:", error);
    throw error;
  }
};

// Update blog by ID
export const updateBlog = async (blogId, blogData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.BLOGS}/${blogId}`),
      {
        method: "PUT",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(blogData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to update blog: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Blog update error:", error);
    throw error;
  }
};

// Add images to blog by ID
export const addBlogImages = async (blogId, images) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const formData = new FormData();

    // Add all images to FormData
    images.forEach((image) => {
      formData.append("images[]", image);
    });

    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.BLOG_IMAGES}/${blogId}/images`),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it automatically
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to add blog images: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Blog images addition error:", error);
    throw error;
  }
};

// Delete blog image by image ID
export const deleteBlogImage = async (imageId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.BLOG_IMAGE_DELETE}/${imageId}`),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to delete blog image: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Blog image deletion error:", error);
    throw error;
  }
};

// Delete blog by ID
export const deleteBlogById = async (blogId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.BLOGS}/${blogId}`),
      {
        method: "DELETE",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete blog: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Blog deletion error:", error);
    throw error;
  }
};

// Fetch single user/admin details by ID
export const fetchUserById = async (userId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`),
      {
        method: "GET",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch user details: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("User details fetch error:", error);
    throw error;
  }
};

// Delete user/admin by ID
export const deleteUserById = async (userId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`),
      {
        method: "DELETE",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete user: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("User deletion error:", error);
    throw error;
  }
};

// Register new admin
export const registerAdmin = async (adminData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.REGISTER), {
      method: "POST",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(adminData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to register admin: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Admin registration error:", error);
    throw error;
  }
};

// Update admin by ID
export const updateAdmin = async (userId, adminData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${userId}`),
      {
        method: "PUT",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(adminData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to update admin: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Admin update error:", error);
    throw error;
  }
};

// Update current admin profile
export const updateProfile = async (profileData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.EDIT_PROFILE),
      {
        method: "PUT",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to update profile: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
};

// Change password for current admin
export const changePassword = async (passwordData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    // Use fetch directly to handle 401 without automatic logout for incorrect password
    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.CHANGE_PASSWORD),
      {
        method: "POST",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific error for incorrect password
      if (
        response.status === 401 &&
        errorData.message === "Incorrect Password!"
      ) {
        const error = new Error("Incorrect Password!");
        error.isIncorrectPassword = true;
        throw error;
      }

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to change password: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Password change error:", error);
    throw error;
  }
};

// Change password for other admin by ID
export const changeUserPassword = async (userId, passwordData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${userId}/change-password`),
      {
        method: "POST",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message ||
          `Failed to change user password: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("User password change error:", error);
    throw error;
  }
};

// Upload company logo
// Update company data
export const updateCompanyData = async (companyData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.COMPANY), {
      method: "PUT",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(companyData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to update company: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Company update error:", error);
    throw error;
  }
};

export const uploadCompanyLogo = async (logoFile) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const formData = new FormData();
    formData.append("logo", logoFile);

    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.COMPANY_LOGO),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - browser will set it automatically
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to upload logo: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Logo upload error:", error);
    throw error;
  }
};

// Fetch all project types
export const fetchProjectTypes = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_TYPES),
      {
        method: "GET",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch project types: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Project types fetch error:", error);
    throw error;
  }
};

// Fetch single project type by ID
export const fetchProjectTypeById = async (projectTypeId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.PROJECT_TYPES}/${projectTypeId}`),
      {
        method: "GET",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch project type: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Project type fetch error:", error);
    throw error;
  }
};

// Create new project type
export const createProjectType = async (projectTypeData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_TYPES),
      {
        method: "POST",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectTypeData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to create project type: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Update project type by ID
export const updateProjectType = async (projectTypeId, projectTypeData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.PROJECT_TYPES}/${projectTypeId}`),
      {
        method: "PUT",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectTypeData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to update project type: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Delete project type by ID
export const deleteProjectType = async (projectTypeId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.PROJECT_TYPES}/${projectTypeId}`),
      {
        method: "DELETE",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete project type: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Projects API

// Fetch all projects
export const fetchProjects = async () => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS), {
      method: "GET",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch projects: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// Create new project
export const createProject = async (formData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type for FormData - browser will set it automatically
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to create project: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Project creation error:", error);
    throw error;
  }
};

// Fetch single project details
export const fetchProjectDetails = async (projectId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}`),
      {
        method: "GET",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to fetch project details: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Project details fetch error:", error);
    throw error;
  }
};

// Update project details
export const updateProjectDetails = async (projectId, projectData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}/details`),
      {
        method: "PUT",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to update project: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Project update error:", error);
    throw error;
  }
};

// Update project thumbnail
export const updateProjectThumbnail = async (projectId, thumbnailFile) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);

    const response = await fetch(
      buildApiUrl(
        `${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}/new-thumbnail`
      ),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to update thumbnail: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Thumbnail update error:", error);
    throw error;
  }
};

// Create project feature
export const createProjectFeature = async (projectId, featureData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const formData = new FormData();
    formData.append("title", featureData.title);
    formData.append("description", featureData.description);

    // Append multiple images
    featureData.images.forEach((image, index) => {
      formData.append("images[]", image);
    });

    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}/features`),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to create feature: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Feature creation error:", error);
    throw error;
  }
};

// Update project feature details
export const updateProjectFeatureDetails = async (featureId, featureData) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`/api/admin/project-features/${featureId}/details`),
      {
        method: "PUT",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(featureData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to update feature: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Feature update error:", error);
    throw error;
  }
};

// Add images to project feature
export const addProjectFeatureImages = async (featureId, images) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const formData = new FormData();

    // Append multiple images
    images.forEach((image) => {
      formData.append("images[]", image);
    });

    const response = await fetch(
      buildApiUrl(`/api/admin/project-features/${featureId}/images`),
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle validation errors
      if (response.status === 422 && errorData.errors) {
        const error = new Error(errorData.message || "Validation failed");
        error.validationErrors = errorData.errors;
        throw error;
      }

      throw new Error(
        errorData.message || `Failed to add images: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Feature image addition error:", error);
    throw error;
  }
};

// Delete project feature image
export const deleteProjectFeatureImage = async (imageId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`/api/admin/project-feature-images/${imageId}`),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete image: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Feature image deletion error:", error);
    throw error;
  }
};

// Delete project feature
export const deleteProjectFeature = async (featureId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`/api/admin/project-features/${featureId}`),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete feature: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Feature deletion error:", error);
    throw error;
  }
};

// Delete project by ID
export const deleteProject = async (projectId) => {
  const token = getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const response = await fetch(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.PROJECTS}/${projectId}`),
      {
        method: "DELETE",
        headers: {
          ...API_CONFIG.DEFAULT_HEADERS,
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to delete project: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Project deletion error:", error);
    throw error;
  }
};
