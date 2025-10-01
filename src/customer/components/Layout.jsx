import { useState, useEffect, createContext, useContext } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { fetchCompanyData } from "../utils/customerApi";
import "./Layout.css";

// Create context for company data
const CompanyContext = createContext();

// Custom hook to use company data
export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};

const Layout = ({ children }) => {
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        setLoading(true);

        const result = await fetchCompanyData();

        // Extract data from the API response - handle the nested structure
        const data = result.data || result;
        console.log("📊 Extracted data:", data);

        // Ensure all required fields exist with fallbacks
        const safeData = {
          name: data.name || "Omninova",
          about_us:
            data.about_us ||
            "We are a dynamic web development company dedicated to creating exceptional digital experiences.",
          vision:
            data.vision ||
            "To become the leading provider of innovative web solutions.",
          goal:
            data.goal ||
            "To democratize professional web development for businesses of all sizes.",
          logo_url: data.logo_url || null,
          founded_date: data.founded_date || "2025-09-05",
          address: data.address || "123 Innovation Street, TechPark District",
          social_media: data.social_media || [],
          contacts: data.contacts || [],
        };

        setCompanyData(safeData);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching company data:", err);
        setError(err.message);

        // Set fallback data for development
        setCompanyData({
          name: "Omninova",
          about_us:
            "We are a dynamic web development company dedicated to creating exceptional digital experiences through innovative website design and development services.",
          vision:
            "We envision a digital landscape where every business can access premium web solutions that elevate their brand and drive growth.",
          goal: "Our primary goal is to democratize professional web development by providing businesses of all sizes with access to high-quality, affordable website solutions.",
          logo_url: null,
          founded_date: "2025-09-05",
          address: "123 Innovation Street, TechPark District",
          social_media: [
            {
              platform_name: "Instagram",
              page_url: "https://www.instagram.com/omninova.tech",
            },
            {
              platform_name: "Facebook",
              page_url: "https://www.facebook.com/OmninovaOfficial",
            },
            {
              platform_name: "LinkedIn",
              page_url: "https://www.linkedin.com/company/omninov",
            },
          ],
          contacts: [
            {
              department: "Customer Support",
              phone_number: "1 (202) 555-0143",
            },
            { department: "Sales", phone_number: "+1 (202) 555-0178" },
            {
              department: "Technical Support",
              phone_number: "+1 (202) 555-0488",
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, []);

  if (loading) {
    return (
      <div className="customer-loading-container">
        <div className="tech-loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-core">
            <div className="core-pulse"></div>
          </div>
        </div>
        <h2 className="loading-title">Welcome to Omninova</h2>
        <p className="loading-subtitle">Initializing digital experience...</p>
      </div>
    );
  }

  if (error && !companyData) {
    return (
      <div className="customer-error-container">
        <p>Error: {error}</p>
        <p>Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <CompanyContext.Provider value={{ companyData, loading, error }}>
      <div className="layout">
        <Navbar />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </CompanyContext.Provider>
  );
};

export default Layout;
