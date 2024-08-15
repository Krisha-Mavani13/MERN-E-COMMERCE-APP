import React from "react";
import about from "../assest/about.jpeg";

const About = () => {
  return (
    <div className="row contactus">
      <div className="w-200px">
        <img src={about} alt="contactus" style={{ width: "100%" }} />
      </div>
    </div>
  );
};

export default About;
