import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BusinessProvider } from "@/contexts/BusinessContext";
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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/customers" component={Customers} />
      <Route path="/competitors" component={Competitors} />
      <Route path="/profile" component={Profile} />
      <Route path="/insights" component={Insights} />
      <Route path="/subscription" component={Subscription} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Mock user data - TODO: remove mock functionality  
  const mockUser = {
    name: "John Smith",
    email: "john@plumbingpro.co.uk",
    avatar: "",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BusinessProvider>
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
          </div>
          <TrialExpiryModal />
          <Toaster />
        </BusinessProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
