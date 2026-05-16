import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useAuth } from "@/hooks/use-auth";
import { useAdminTheme } from "@/hooks/use-admin-theme";
import { Aperture } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminGuard,
});

function AdminGuard() {
  useAdminTheme();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!loading && !session && !isLoginPage) {
      navigate({ to: "/admin/login" });
    }
  }, [session, loading, navigate, isLoginPage]);

  // Login page renders without the AdminLayout wrapper
  if (isLoginPage) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f3ef]">
        <Aperture className="h-8 w-8 animate-spin text-[#C9A96E]" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
