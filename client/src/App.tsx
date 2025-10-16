import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BusinessProvider } from "@/contexts/BusinessContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TrialBanner from "@/components/TrialBanner";
import TrialExpiryModal from "@/components/TrialExpiryModal";
import Dashboard from "@/pages/Dashboard";
import Jobs from "@/pages/Jobs";
import Customers from "@/pages/Customers";
import Competitors from "@/pages/Competitors";
import Profile from "@/pages/Profile";
import Insights from "@/pages/Insights";
import Subscription from "@/pages/subscription";
import Settings from "@/pages/Settings";
import Signup from "@/pages/Signup";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        {() => isAuthenticated ? <Redirect to="/" /> : <Login />}
      </Route>
      <Route path="/signup">
        {() => isAuthenticated ? <Redirect to="/" /> : <Signup />}
      </Route>
      <Route path="/">
        {() => !isAuthenticated ? <Redirect to="/login" /> : <Dashboard />}
      </Route>
      <Route path="/jobs">
        {() => !isAuthenticated ? <Redirect to="/login" /> : <Jobs />}
      </Route>
      <Route path="/customers">
        {() => !isAuthenticated ? <Redirect to="/login" /> : <Customers />}
      </Route>
      <Route path="/competitors">
        {() => !isAuthenticated ? <Redirect to="/login" /> : <Competitors />}
      </Route>
      <Route path="/profile">
        {() => !isAuthenticated ? <Redirect to="/login" /> : <Profile />}
      </Route>
      <Route path="/insights">
        {() => !isAuthenticated ? <Redirect to="/login" /> : <Insights />}
      </Route>
      <Route path="/subscription">
        {() => !isAuthenticated ? <Redirect to="/login" /> : <Subscription />}
      </Route>
      <Route path="/settings">
        {() => !isAuthenticated ? <Redirect to="/login" /> : <Settings />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// Main app content with sidebar (only shown when authenticated)
function AppContent() {
  const { isAuthenticated, userId } = useAuth();
  
  // Mock user data - TODO: fetch from API based on userId
  const mockUser = {
    name: "User",
    email: "user@trackd.app",
    avatar: "",
  };

  if (!isAuthenticated) {
    return <Router />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header user={mockUser} />
        
        {/* Trial Banner */}
        <TrialBanner />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Router />
        </main>
      </div>
      <TrialExpiryModal />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BusinessProvider>
            <AppContent />
            <Toaster />
          </BusinessProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
