import { useCompany } from "./Layout";
import "./About.css";

const About = () => {
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
    <div className="about-page">
      <div className="coming-soon-container">
        <h1>About Us</h1>
        <p>This page is coming soon...</p>
      </div>
    </div>
  );
};

export default About;
