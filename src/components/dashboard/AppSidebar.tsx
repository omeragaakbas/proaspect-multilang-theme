import { Clock, Users, FileText, FolderOpen, Settings, BarChart3, Home, CheckCircle } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '@/components/ui/sidebar';

const menuItems = [
  { 
    title: 'Dashboard', 
    url: '/dashboard', 
    icon: Home,
    exact: true
  },
  { 
    title: 'Tijdregistratie', 
    url: '/dashboard/time', 
    icon: Clock 
  },
  { 
    title: 'Klanten', 
    url: '/dashboard/clients', 
    icon: Users 
  },
  { 
    title: 'Projecten', 
    url: '/dashboard/projects', 
    icon: FolderOpen 
  },
  { 
    title: 'Facturen', 
    url: '/dashboard/invoices', 
    icon: FileText 
  },
  { 
    title: 'Goedkeuringen', 
    url: '/dashboard/approvals', 
    icon: CheckCircle 
  },
  { 
    title: 'Rapporten', 
    url: '/dashboard/reports', 
    icon: BarChart3 
  },
];

const settingsItems = [
  { 
    title: 'Instellingen', 
    url: '/dashboard/settings', 
    icon: Settings 
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { profile } = useAuth();
  const currentPath = location.pathname;

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavClasses = (isItemActive: boolean) =>
    isItemActive 
      ? 'bg-primary text-primary-foreground font-medium' 
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';

  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>ProAspect</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.exact}
                      className={({ isActive }) => getNavClasses(isActive)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className={({ isActive }) => getNavClasses(isActive)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info */}
        {profile && (
          <div className="mt-auto p-4 border-t">
            <div className="text-sm">
              <p className="font-medium">{profile.name}</p>
              <p className="text-muted-foreground text-xs">{profile.email}</p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}