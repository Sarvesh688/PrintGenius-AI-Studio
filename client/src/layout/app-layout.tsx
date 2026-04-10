import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import Header from "@/components/header";

const AppLayout = () => {
  return (
    <SidebarProvider className="min-h-screen">
      <AppSidebar />
      <main className="w-full mx-auto flex flex-col h-full">
        <Header />
        <div className="flex-1">
          <Outlet />
        </div>
      </main>

    </SidebarProvider>
  );
};

export default AppLayout;


