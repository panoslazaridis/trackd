import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, Settings, Sun, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  className?: string;
}

export default function Header({ user, className = "" }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const [notifications] = useState(3); // Mock notification count

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    console.log(`Theme switched to ${!isDark ? "dark" : "light"} mode`);
  };

  return (
    <header className={`bg-card border-b border-card-border px-4 py-3 flex items-center justify-between ${className}`}>
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search jobs, customers, insights..."
            className="pl-10 bg-background"
            data-testid="input-search"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-notifications">
            <Bell className="w-4 h-4" />
          </Button>
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground">
              {notifications}
            </Badge>
          )}
        </div>

        {/* Theme Toggle */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          className="hover-elevate"
          data-testid="button-theme-toggle"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-settings">
          <Settings className="w-4 h-4" />
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-3 ml-2 pl-2 border-l border-border">
          <Avatar className="w-8 h-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          {user && (
            <div className="hidden md:block">
              <p className="text-sm font-medium text-foreground" data-testid="text-user-name">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}