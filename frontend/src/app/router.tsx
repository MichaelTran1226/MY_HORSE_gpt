import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { OtpPage } from "@/features/auth/pages/OtpPage";
import { ActorDashboardPage } from "@/features/auth/pages/ActorDashboardPage";
import { Forbidden403Page } from "@/features/auth/pages/Forbidden403Page";
import { readUser, type Role } from "@/features/auth/roles";
import { SessionBoundary } from "@/features/auth/SessionBoundary";

const destinations: Record<string, Partial<Record<Role, string>>> = {
  horses: { CLUB_MANAGER: "Horse registry", HORSE_OWNER: "My Horses" },
  training: { HEAD_TRAINER: "Training Plans", HORSE_OWNER: "Training journal" },
  health: { VETERINARIAN: "Herd health", HORSE_OWNER: "Health updates" },
  stables: { GROOM: "Stall map" },
  racing: { HEAD_TRAINER: "Race registration" },
  accounts: { CLUB_MANAGER: "Staff accounts" },
};
function LegacyRoute({ area }: { area?: string }) {
  const user = readUser();
  if (!user) return <Navigate to="/login" replace />;
  if (!area) return <Navigate to="/app" replace />;
  const page = destinations[area]?.[user.role];
  return (
    <Navigate
      to={page ? "/app?page=" + encodeURIComponent(page) : "/forbidden-403"}
      replace
    />
  );
}
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/verify-otp", element: <OtpPage /> },
  {
    path: "/app",
    element: (
      <SessionBoundary>
        <ActorDashboardPage />
      </SessionBoundary>
    ),
  },
  { path: "/forbidden-403", element: <Forbidden403Page /> },
  { path: "/", element: <LegacyRoute /> },
  { path: "/dashboard", element: <LegacyRoute /> },
  ...Object.keys(destinations).map((area) => ({
    path: "/" + area,
    element: <LegacyRoute area={area} />,
  })),
  { path: "*", element: <LegacyRoute /> },
]);
