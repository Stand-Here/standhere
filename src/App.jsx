// src/App.jsx
// MAIN PAGE HERE (w/ links to the home and about pages)
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import Privacy from "./pages/privacy";

export default function App() {
  return (
    <Router>
      {/* navigation bar */}
    <nav
  style={{
    padding: "1rem",
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    backgroundColor: "transparent", // optional
  }}
>
  <Link to="/" style={{ color: "#FFFFFF", textDecoration: "none" }}>
    Home
  </Link>
  <Link to="/about" style={{ color: "#FFFFFF", textDecoration: "none" }}>
    About
  </Link>
  <Link to="/contact" style={{ color: "#FFFFFF", textDecoration: "none" }}>
    Contact
  </Link>
  <Link to="/privacy-policy" style={{ color: "#FFFFFF", textDecoration: "none" }}>
    Privacy Policy
  </Link>
</nav>


      {/* Route definitions */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<Privacy />} />
       
      </Routes>
    </Router>
  );
}
