import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Search, Settings, Sun, Moon, Lightbulb, Briefcase, Users, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Insight, Job, Customer } from "@shared/schema";

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
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [, navigate] = useLocation();
  const userId = "test-user-plumber"; // TODO: Get from auth

  // Fetch recent insights and jobs for notifications
  const { data: insights = [] } = useQuery<Insight[]>({
    queryKey: [`/api/insights/${userId}`],
  });

  const { data: jobs = [] } = useQuery<Job[]>({
    queryKey: [`/api/jobs/${userId}`],
  });

  // Mutation to mark insight as viewed
  const markInsightViewed = useMutation({
    mutationFn: async (insightId: string) => {
      return await apiRequest('PATCH', `/api/insights/${userId}/${insightId}`, { viewed: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/insights/${userId}`] });
    },
  });

  // Generate notifications from recent data - only show unviewed insights
  const notifications = [
    // Unviewed insights (max 5)
    ...insights
      .filter(i => i.status === 'active' && i.createdAt && !i.viewed)
      .slice(0, 5)
      .map(insight => ({
        id: insight.id,
        type: 'insight' as const,
        title: insight.title,
        message: insight.priority === 'high' ? 'High priority insight' : 'New insight available',
        time: insight.createdAt!,
        link: '/insights',
        icon: Lightbulb,
      })),
    // Recent jobs (last 2) - jobs are always considered "new" for now
    ...jobs
      .filter(j => j.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 2)
      .map(job => ({
        id: job.id,
        type: 'job' as const,
        title: `${job.jobType} job`,
        message: `${job.customerName} - £${job.revenue}`,
        time: job.createdAt!,
        link: '/jobs',
        icon: Briefcase,
      })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  const notificationCount = notifications.length;

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    console.log(`Theme switched to ${!isDark ? "dark" : "light"} mode`);
  };

  const handleNotificationClick = async (notificationId: string, type: 'insight' | 'job', link: string) => {
    // Mark insight as viewed if it's an insight notification
    if (type === 'insight') {
      try {
        await markInsightViewed.mutateAsync(notificationId);
      } catch (error) {
        console.error('Failed to mark insight as viewed:', error);
      }
    }
    // Navigate to the link
    navigate(link);
    setNotificationsOpen(false);
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
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <div className="relative">
              <Button variant="ghost" size="icon" className="hover-elevate" data-testid="button-notifications">
                <Bell className="w-4 h-4" />
              </Button>
              {notificationCount > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs bg-destructive text-destructive-foreground">
                  {notificationCount}
                </Badge>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="font-semibold text-sm">Notifications</h4>
              <Badge variant="secondary" className="text-xs">{notificationCount}</Badge>
            </div>
            <ScrollArea className="max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification, index) => {
                    const Icon = notification.icon;
                    return (
                      <button
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification.id, notification.type, notification.link)}
                        className="w-full p-4 hover-elevate active-elevate-2 flex items-start gap-3 text-left transition-colors"
                        data-testid={`notification-${index}`}
                      >
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.time), { addSuffix: true })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
            {notifications.length > 0 && (
              <>
                <Separator />
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full text-xs" 
                    size="sm"
                    onClick={() => setNotificationsOpen(false)}
                    data-testid="button-close-notifications"
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>

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
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover-elevate" 
          onClick={() => navigate('/settings')}
          data-testid="button-settings"
        >
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