import { Link, useLocation } from "wouter";
import { 
  BarChart3, 
  Briefcase, 
  Users, 
  TrendingUp, 
  User, 
  Lightbulb,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import trackd_logo from "@assets/trackd logo.png";

interface SidebarProps {
  className?: string;
}

const navigationItems = [
  { path: "/", icon: BarChart3, label: "Dashboard" },
  { path: "/jobs", icon: Briefcase, label: "Jobs" },
  { path: "/customers", icon: Users, label: "Customers" },
  { path: "/competitors", icon: TrendingUp, label: "Competitors" },
  { path: "/profile", icon: User, label: "Profile" },
  { path: "/insights", icon: Lightbulb, label: "Insights" },
];

export default function Sidebar({ className = "" }: SidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
      isCollapsed ? "w-16" : "w-64"
    } ${className}`}>
      {/* Header */}
      <div className="relative p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center justify-center">
            <img 
              src={trackd_logo} 
              alt="trackd logo" 
              className="h-20 w-full object-contain"
            />
          </div>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center">
            <img 
              src="/attached_assets/trackd logo_1758666477917.png" 
              alt="trackd logo" 
              className="h-8 w-full object-contain"
            />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-2 right-2 text-sidebar-foreground hover-elevate"
          data-testid="button-sidebar-toggle"
        >
          {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </Button>
      </div>
      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start hover-elevate ${
                      isCollapsed ? "px-2" : "px-3"
                    } ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground"}`}
                    data-testid={`link-nav-${item.label.toLowerCase()}`}
                  >
                    <Icon className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-muted-foreground">
            v1.0.0 - Analytics for Trades
          </div>
        </div>
      )}
    </div>
  );
}