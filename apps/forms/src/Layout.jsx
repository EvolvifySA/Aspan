import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  LogOut,
  Menu,
  ShieldCheck,
  FileDown,
  Edit3,
  FileSearch,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Gerenciar Cadastros", url: "/admin/forms", icon: ClipboardList },
  { title: "Editar Situacao", url: "/admin/forms/editar-situacao", icon: Edit3 },
  { title: "Revisar Migracao", url: "/admin/forms/revisar-migracao", icon: FileSearch },
  { title: "Gerar Relatorios", url: "/admin/forms/gerar-relatorios", icon: FileDown },
  { title: "Graficos", url: "/admin/forms/graficos", icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(58,93,171,0.14),_transparent_35%),linear-gradient(135deg,#f7f9fc_0%,#eef3fb_48%,#fff7f4_100%)]">
        <Sidebar className="z-30 border-r border-slate-200/80 bg-white/95 backdrop-blur">
          <SidebarHeader className="border-b border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3a5dab] to-[#e74325] shadow-lg">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                  ASPAN
                </p>
                <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                Navegacao
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="mb-1">
                          <Link
                            to={item.url}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                              isActive
                                ? "bg-slate-900 text-white shadow-md"
                                : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="relative z-0 flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur md:sticky md:top-0 md:z-10">
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="rounded-xl p-2 hover:bg-slate-100 md:hidden">
                  <Menu className="h-5 w-5" />
                </SidebarTrigger>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Formularios
                  </p>
                  <h1 className="text-lg font-bold text-slate-900">
                    {location.pathname === "/admin/forms" ? "Gerenciar Cadastros" : "ASPAN Forms"}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user && (
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                )}
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>
            </div>
          </header>

          <section className="flex-1 overflow-auto px-4 pb-8 pt-4 md:px-6 md:pt-6">
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </SidebarProvider>
  );
}
