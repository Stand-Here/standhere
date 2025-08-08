// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import Privacy from "./pages/privacy";

export default function App() {
  return (
    <Router>
      {/* Header with branding and navigation */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1.5rem",
          backgroundColor: "transparent",
          color: "#FFFFFF",
          fontSize: "0.9rem", // Smaller base font
        }}
      >
        <div
          style={{
            fontWeight: "bold",
            fontSize: "1.2rem", // Smaller logo text
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span role="img" aria-label="earth">
            🌍
          </span>
          <span>Stand Here.</span>
        </div>

        <nav style={{ display: "flex", gap: "1rem" }}>
          <Link to="/" style={{ color: "#FFFFFF", textDecoration: "none", fontSize: "0.9rem" }}>
            Home
          </Link>
          <Link to="/about" style={{ color: "#FFFFFF", textDecoration: "none", fontSize: "0.9rem" }}>
            About
          </Link>
          <Link to="/contact" style={{ color: "#FFFFFF", textDecoration: "none", fontSize: "0.9rem" }}>
            Contact
          </Link>
          <Link
            to="/privacy-policy"
            style={{ color: "#FFFFFF", textDecoration: "none", fontSize: "0.9rem" }}
          >
            Privacy Policy
          </Link>
        </nav>
      </header>

      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<Privacy />} />
      </Routes>
    </Router>
  );
}
