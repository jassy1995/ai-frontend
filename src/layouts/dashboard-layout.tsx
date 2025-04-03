import { Outlet } from "react-router-dom";

import Sidebar from "@/components/sidebar";

export default function DashboardLayout() {
  return (
    <div className="h-screen overflow-hidden grid grid-cols-[auto_1fr] gap-0 bg-[#f0f7ff] dark:bg-gray-800/30">
      <Sidebar />
      <div className="h-screen">
        <div
          className="h-full flex flex-col overflow-y-auto bg-white dark:bg-black/80 pt-2 border-l border-default-200/50 dark:border-default-50"
          id="main"
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
