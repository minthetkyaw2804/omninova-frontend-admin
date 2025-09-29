import { buildApiUrl, API_CONFIG } from "../config/api";

// Fetch company data
export const fetchCompanyData = async () => {
  try {
    console.log("🚀 Fetching company data from API...");

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.COMPANY_DETAILS), {
      method: "GET",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch company data: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Company data fetched successfully:", result);

    return result;
  } catch (error) {
    console.error("❌ Error fetching company data:", error);
    throw error;
  }
};

// Fetch all blogs
export const fetchBlogs = async () => {
  try {
    console.log("🚀 Fetching blogs from API...");

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.BLOGS), {
      method: "GET",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Blogs fetched successfully:", result);

    return result;
  } catch (error) {
    console.error("❌ Error fetching blogs:", error);
    throw error;
  }
};

// Fetch blog details by ID
export const fetchBlogDetails = async (blogId) => {
  try {
    console.log(`🚀 Fetching blog details for ID: ${blogId}`);

    const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.BLOG_DETAILS}/${blogId}`), {
      method: "GET",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blog details: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Blog details fetched successfully:", result);

    return result;
  } catch (error) {
    console.error("❌ Error fetching blog details:", error);
    throw error;
  }
};

// Fetch all projects
export const fetchProjects = async () => {
  try {
    console.log("🚀 Fetching projects from API...");

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROJECTS), {
      method: "GET",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Projects fetched successfully:", result);

    return result;
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    throw error;
  }
};

// Fetch all project types
export const fetchProjectTypes = async () => {
  try {
    console.log("🚀 Fetching project types from API...");

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROJECT_TYPES), {
      method: "GET",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project types: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Project types fetched successfully:", result);

    return result;
  } catch (error) {
    console.error("❌ Error fetching project types:", error);
    throw error;
  }
};

// Fetch project details by ID
export const fetchProjectDetails = async (projectId) => {
  try {
    console.log(`🚀 Fetching project details for ID: ${projectId}`);

    const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.PROJECT_DETAILS}/${projectId}`), {
      method: "GET",
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch project details: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Project details fetched successfully:", result);

    return result;
  } catch (error) {
    console.error("❌ Error fetching project details:", error);
    throw error;
  }
};