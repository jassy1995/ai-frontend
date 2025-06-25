import { Route, Routes } from "react-router-dom";

import DashboardLayout from "./layouts/dashboard-layout";
import StreamingChat from "./pages/stream-chat";

import HomePage from "@/pages/home";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />} path="/">
        <Route element={<StreamingChat />} path="/" />
        <Route element={<DocsPage />} path="/docs" />
        <Route element={<PricingPage />} path="/pricing" />
        <Route element={<BlogPage />} path="/blog" />
        <Route element={<AboutPage />} path="/about" />
        <Route element={<HomePage />} path="/home" />
      </Route>
    </Routes>
  );
}
