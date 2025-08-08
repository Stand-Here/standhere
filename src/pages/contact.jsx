import React, { useState } from "react";

export default function Contact({ isDarkMode = true }) {
  const textColor = isDarkMode ? "#fff" : "#000";
  const cardColor = isDarkMode ? "#005050" : "#FFFFFF";
  const linkColor = isDarkMode ? "#80cfff" : "#007acc";

  const sectionStyle = {
    maxWidth: "800px",
    margin: "2rem auto",
    padding: "2rem",
    color: textColor,
    backgroundColor: cardColor,
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    lineHeight: "1.6",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    margin: "0.5rem 0 1rem 0",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  };

  const buttonStyle = {
    backgroundColor: linkColor,
    color: "#246d72ff",
    padding: "0.75rem 1.5rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "1rem",
  };

  const bgGradient = isDarkMode
    ? "linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)"
    : "linear-gradient(135deg, #EAF2F8 0%, #FFFFFF 100%)";

  const [form, setForm] = useState({ email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    window.location.href = `mailto:standhere.contact@gmail.com?subject=Website Feedback&body=From: ${form.email}%0D%0A%0D%0A${form.message}`;
  };

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
          <h2>Contact Us</h2>
          <p>
            We'd love to hear from you! Whether you have feedback, questions,
            feature requests, or just want to say hello — drop us a message
            using the form below.
          </p>
          <p>
            Alternatively, you can also email us directly at{" "}
            <a
              href="mailto:standhere.contact@gmail.com"
              style={{ color: linkColor }}
            >
              standhere.contact@gmail.com
            </a>
            .
          </p>

          <form onSubmit={handleSubmit}>
            <label>
              Your Email:
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="you@example.com"
              />
            </label>
            <label>
              Your Message:
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                style={{ ...inputStyle, minHeight: "120px" }}
                placeholder="Write your message here..."
              />
            </label>
            <button type="submit" style={buttonStyle}>
              Send Message
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
