import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">🛡️ Spamurai</div>
      <nav className="sidebar-nav">
        <NavLink end to="/" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          Dashboard
        </NavLink>
        <NavLink to="/email" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          Email Scan
        </NavLink>
        <NavLink to="/url" className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}>
          URL Scan
        </NavLink>
      </nav>
    </aside>
  );
}
