import React from "react";
{/* WE HAVE TO CHANE EVERYTHING IN HERE */}
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
          <h2>About</h2>
          <p>
            Stand Here is your instant ticket to anywhere. With a single click, you’ll be able to immerse yourself in a random corner of the world, from quiet village streets to bustling city squares.

            Each location comes with a delightfully odd list of “things you brought” to spark your imagination and set the scene. It’s entirely up to you where the journey goes next!
            </p>
        </section>
         <section style={{ ...sectionStyle, position: "relative"}}>
          <h2 style={{ marginRight: "3.5rem" }}>The Creators</h2>
          {/*top right linkedin badges*/}
          <div
            style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            display: "flex",
            gap: 14,
            }}
        >

        {/* Diya */}
        <a
        href="https://www.linkedin.com/in/diya-kannan/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Diya Kannan on LinkedIn"
        style={{ textDecoration: "none", color: textColor }}
        >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#65a8eb"
                d="M20.447 20.452H17.2v-5.57c0-1.328-.024-3.037-1.852-3.037-1.853 0-2.136 1.448-2.136 2.944v5.663H9.065V9h3.12v1.561h.044c.434-.82 1.494-1.685 3.074-1.685 3.291 0 3.898 2.167 3.898 4.986v6.59zM5.337 7.433a1.81 1.81 0 1 1 0-3.62 1.81 1.81 0 0 1 0 3.62zM6.96 20.452H3.71V9h3.25v11.452zM22.226 0H1.771C.792 0 0 .774 0 1.73v20.54C0 23.226.792 24 1.771 24h20.455C23.205 24 24 23.226 24 22.27V1.73C24 .774 23.205 0 22.226 0z"
            />
            </svg>
            <small style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: 2 }}>Diya</small>
        </div>
        </a>


        {/* Lakshyaa */}
        <a
        href="https://www.linkedin.com/in/lakshyaa-nathan-aa117b215/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Lakshyaa Nathan on LinkedIn"
        style={{ textDecoration: "none", color: textColor }}
        >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#65a8eb"
                d="M20.447 20.452H17.2v-5.57c0-1.328-.024-3.037-1.852-3.037-1.853 0-2.136 1.448-2.136 2.944v5.663H9.065V9h3.12v1.561h.044c.434-.82 1.494-1.685 3.074-1.685 3.291 0 3.898 2.167 3.898 4.986v6.59zM5.337 7.433a1.81 1.81 0 1 1 0-3.62 1.81 1.81 0 0 1 0 3.62zM6.96 20.452H3.71V9h3.25v11.452zM22.226 0H1.771C.792 0 0 .774 0 1.73v20.54C0 23.226.792 24 1.771 24h20.455C23.205 24 24 23.226 24 22.27V1.73C24 .774 23.205 0 22.226 0z"
            />
            </svg>
            <small style={{ fontSize: "0.75rem", opacity: 0.85, marginTop: 2 }}>
            Lakshyaa
            </small>
        </div>
        </a>
    </div>


          <p>
            Stand Here was built by Diya Kannan and Lakshyaa Nathan, two computer science undergraduates with a shared love for technology, storytelling, and the thrill of discovering new places. What started as a fun side project quickly became a creative way to blend code, maps, and imagination into something people of all ages can enjoy.
          </p>
          <p>
            Our goal is simple: to inspire curiosity, spark creativity, and make the world feel a little smaller, one random spot at a time. Whether you’re here to discover hidden corners of the globe or to dream up adventures that never were, we hope you’ll find a little bit of magic in every click.
          </p>
        </section>
      </div>
    </div>
  );
}
