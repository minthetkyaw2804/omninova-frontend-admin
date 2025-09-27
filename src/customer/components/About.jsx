import { useCompany } from "./Layout";
import "./About.css";

const About = () => {
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
    <div className="about-page">
      <div className="customer-coming-soon-container">
        <h1>About Us</h1>
        <p>This page is coming soon...</p>
      </div>
    </div>
  );
};

export default About;
