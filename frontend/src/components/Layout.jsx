import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import "../App.css";

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  );
}
