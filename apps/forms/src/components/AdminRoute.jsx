import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

function LoadingState() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );
}

export default function AdminRoute() {
  const { isLoading, isAdmin } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      const redirect = encodeURIComponent(location.pathname);
      window.location.href = `/admin/login?redirect=${redirect}`;
    }
  }, [isAdmin, isLoading, location.pathname]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!isAdmin) {
    return null;
  }

  return <Outlet />;
}
