import { Clock, Users, FileText, FolderOpen, Settings, BarChart3, Home, CheckCircle, Receipt, Key, Shield, Lock, RefreshCw } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

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

export function AppSidebar() {
  const location = useLocation();
  const { profile } = useAuth();
  const { t } = useTranslation();
  const currentPath = location.pathname;

  const menuItems = [
    { title: t('nav.dashboard'), url: '/dashboard', icon: Home, exact: true },
    { title: t('nav.timeTracking'), url: '/dashboard/time', icon: Clock },
    { title: t('nav.clients'), url: '/dashboard/clients', icon: Users },
    { title: t('nav.projects'), url: '/dashboard/projects', icon: FolderOpen },
    { title: t('nav.invoices'), url: '/dashboard/invoices', icon: FileText },
    { title: t('nav.recurringInvoices'), url: '/dashboard/recurring-invoices', icon: RefreshCw },
    { title: t('nav.expenses'), url: '/dashboard/expenses', icon: Receipt },
    { title: t('nav.reports'), url: '/dashboard/reports', icon: BarChart3 },
    { title: t('nav.approvals'), url: '/dashboard/approvals', icon: CheckCircle },
  ];

  const collaborationItems = [
    { title: t('nav.team'), url: '/dashboard/team', icon: Users },
    { title: t('nav.clientPortal'), url: '/dashboard/client-portal', icon: Key },
  ];

  const settingsItems = [
    { title: t('nav.auditLogs'), url: '/dashboard/audit-logs', icon: Shield },
    { title: t('nav.security'), url: '/dashboard/security', icon: Lock },
    { title: t('nav.settings'), url: '/dashboard/settings', icon: Settings },
  ];

  const getNavClasses = (isActive: boolean) =>
    isActive
      ? 'bg-primary text-primary-foreground font-medium'
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';

  return (
    <Sidebar className="w-64" collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>ProAspect</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.url}>
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

        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.team')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {collaborationItems.map((item) => (
                <SidebarMenuItem key={item.url}>
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

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.url}>
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

        <div className="mt-auto border-t">
          <div className="p-3">
            <LanguageSwitcher />
          </div>
          {profile && (
            <div className="p-4 pt-0">
              <div className="text-sm">
                <p className="font-medium">{profile.name}</p>
                <p className="text-muted-foreground text-xs">{profile.email}</p>
              </div>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
