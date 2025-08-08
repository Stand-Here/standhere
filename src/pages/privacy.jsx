import React from "react";

export default function Privacy({ isDarkMode = true }) {
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
    lineHeight: "1.6",
  };

  const bgGradient = isDarkMode
    ? "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)"
    : "linear-gradient(135deg, #EAF2F8 0%, #FFFFFF 100%)";

  return (
    <div>
      {/* Background gradient layer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
          background: bgGradient,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background 0.5s ease",
        }}
      />

      <div style={{ padding: "2rem" }}>
        <section style={sectionStyle}>
          <h2>Privacy Policy</h2>
          <p>
            This website respects your privacy. We do not collect any personal
            information directly from visitors.
          </p>
          <p>
            However, we use third-party services, including{" "}
            <a
              href="https://www.google.com/adsense"
              style={{ color: linkColor }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google AdSense
            </a>
            , to serve advertisements. These services may use cookies and similar
            technologies to display personalized ads based on your browsing
            behavior.
          </p>
          <p>
            You can opt out of personalized advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              style={{ color: linkColor }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>
            . For more information on how Google uses your data, see their{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              style={{ color: linkColor }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy & Terms
            </a>
            .
          </p>
          <p>
            This site may also use cookies for basic functionality and
            performance improvements. You may disable cookies in your browser
            settings, but this may affect how some features function.
          </p>
          <p>
            We do not store, share, or sell your personal information. If you
            have questions, feel free to contact us at{" "}
            <a
              href="mailto:standhere.contact@gmail.com"
              style={{ color: linkColor }}
            >
              standhere.contact@gmail.com
            </a>
            .
          </p>
          <p><strong>Effective Date:</strong> August 7, 2025</p>
        </section>
      </div>
    </div>
  );
}
