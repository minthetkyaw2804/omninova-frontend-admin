import { buildApiUrl, API_CONFIG } from "../config/api";

// Fetch company data - the only existing API for customer panel
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