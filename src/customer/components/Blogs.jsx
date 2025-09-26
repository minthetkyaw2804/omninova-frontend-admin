import { useCompany } from "./Layout";
import "./Blogs.css";

const Blogs = () => {
  const { companyData } = useCompany();

  if (!companyData) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading company information...</p>
      </div>
    );
  }

  return (
    <div className="blogs-page">
      <div className="coming-soon-container">
        <h1>Blogs</h1>
        <p>This page is coming soon...</p>
      </div>
    </div>
  );
};

export default Blogs;
