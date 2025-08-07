import React from "react";

export default function About({ isDarkMode = true }) {
  const textColor = isDarkMode ? "#fff" : "#000";
  const cardColor = isDarkMode ? "#005050" : "#FFFFFF";

  const linkColor = isDarkMode ? "#80cfff" : "#007acc";

  const sectionStyle = {
    maxWidth: "800px",
    margin: "2rem auto",
    padding: "1rem",
    color: textColor,
    backgroundColor: cardColor,
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    lineHeight: "1.5",
  };

  return (
    <div style={{ padding: "2rem" }}>
      <section style={sectionStyle}>
        <h2>About</h2>
        <p>
          Stand Here is a simple, creative experience. Discover random spots
          around the world and imagine the stories behind them.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2>Privacy Policy</h2>
        <p>
          We respect your privacy. This website does not collect personal data
          except for cookies necessary to run Google AdSense and essential site
          functionality.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2>Contact</h2>
        <p>
          Have questions or feedback? Reach out at{" "}
          <a
            href="mailto:contact@standhere.com"
            style={{ color: linkColor }}
          >
            contact@standhere.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
