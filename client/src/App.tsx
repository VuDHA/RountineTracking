import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppLayout } from "./layout/app-layout";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import Dashboard from "@/pages/dashboard";
import CalendarPage from "@/pages/calendar";
import StatisticsPage from "@/pages/statistics";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

// Wrapper components to use with ProtectedRoute
const DashboardWithLayout = () => (
  <AppLayout>
    <Dashboard />
  </AppLayout>
);

const CalendarWithLayout = () => (
  <AppLayout>
    <CalendarPage />
  </AppLayout>
);

const StatisticsWithLayout = () => (
  <AppLayout>
    <StatisticsPage />
  </AppLayout>
);

const SettingsWithLayout = () => (
  <AppLayout>
    <NotFound />
  </AppLayout>
);

function Router() {
  return (
    <Switch>
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/" component={DashboardWithLayout} />
      <ProtectedRoute path="/calendar" component={CalendarWithLayout} />
      <ProtectedRoute path="/statistics" component={StatisticsWithLayout} />
      <ProtectedRoute path="/settings" component={SettingsWithLayout} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
