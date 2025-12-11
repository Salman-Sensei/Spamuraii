import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import EmailScan from "./pages/EmailScan";
import UrlScan from "./pages/UrlScan";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/email" element={<EmailScan />} />
          <Route path="/url" element={<UrlScan />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
