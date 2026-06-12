import { ReactNode } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function UserLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
