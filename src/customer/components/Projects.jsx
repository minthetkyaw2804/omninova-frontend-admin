import { useCompany } from "./Layout";
import "./Projects.css";

const Projects = () => {
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
    <div className="projects-page">
      <div className="customer-coming-soon-container">
        <h1>Projects</h1>
        <p>This page is coming soon...</p>
      </div>
    </div>
  );
};

export default Projects;
