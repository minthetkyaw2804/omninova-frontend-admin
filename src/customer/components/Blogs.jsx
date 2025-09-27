import { useCompany } from "./Layout";
import "./Blogs.css";

const Blogs = () => {
  const { companyData } = useCompany();

  if (!companyData) {
    return (
      <div className="customer-loading-container">
        <div className="customer-loading-spinner"></div>
        <p>Loading company information...</p>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      <div className="customer-coming-soon-container">
        <h1>Blogs</h1>
        <p>This page is coming soon...</p>
      </div>
    </div>
  );
};

export default Blogs;
