import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CompanySidebar } from "@/components/vc/company-sidebar";

export default function VcLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <CompanySidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
