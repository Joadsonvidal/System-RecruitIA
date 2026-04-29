import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "./contexts/AppContext";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Pipeline from "./pages/Pipeline";
import Candidates from "./pages/Candidates";
import Jobs from "./pages/Jobs";
import CalendarPage from "./pages/CalendarPage";
import Messages from "./pages/Messages";
import SettingsPage from "./pages/SettingsPage";
import SettingsUsersPage from "./pages/SettingsUsersPage";
import SettingsPermissionsPage from "./pages/SettingsPermissionsPage";
import PricingPage from "./pages/PricingPage";
import TimeClockPage from "./pages/TimeClockPage";
import TimeClockAdminPage from "./pages/TimeClockAdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/ponto"
              element={
                <ProtectedRoute>
                  <TimeClockPage />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <AppProvider>
                    <AppLayout />
                  </AppProvider>
                </ProtectedRoute>
              }
            >
              <Route path="/ponto/admin" element={<TimeClockAdminPage />} />
              <Route path="/" element={<Dashboard />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/users" element={<SettingsUsersPage />} />
              <Route path="/settings/permissions" element={<SettingsPermissionsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
