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