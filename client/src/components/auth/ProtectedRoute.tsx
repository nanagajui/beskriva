import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Redirect, Route, type RouteProps } from "wouter";

export default function ProtectedRoute(props: RouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Route {...props} />;
} 