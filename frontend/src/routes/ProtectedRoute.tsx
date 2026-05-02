// src/routes/ProtectedRoute.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useRole } from "../context/RoleContext";
import { ReactNode, useEffect, useState } from "react";
import { UserRole } from "@/types";

export type AllowedRoles = UserRole[];

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: AllowedRoles;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { role } = useRole();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Wait a tick to ensure role is loaded from context/localStorage
  useEffect(() => {
    setLoading(false);
  }, [role]);

  if (loading) return null; // prevent flash redirect

  // Not logged in
  if (!role) return <Navigate to="/login" replace state={{ from: location }} />;

  // Role not allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their own dashboard based on role
    switch (role) {
      case "admin":
        return <Navigate to="/dashboard/admin" replace />;
      case "manager":
        return <Navigate to="/dashboard/manager" replace />;
      case "staff":
        return <Navigate to="/dashboard/staff" replace />;
      case "user":
        return <Navigate to="/dashboard/user" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
