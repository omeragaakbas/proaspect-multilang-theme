import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProAspectLogo } from '@/components/ProAspectLogo';
import { Button } from '@/components/ui/button';
import { Clock, Users, FileText, Settings, LogOut, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const Header: React.FC = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const { t } = useTranslation();
  const isAdmin = userRole?.role === 'ADMIN';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/">
            <ProAspectLogo size="md" />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {!user ? (
            <>
              <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('header.features')}
              </Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('header.pricing')}
              </Link>
              <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('header.faq')}
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('header.about')}
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                {t('header.contact')}
              </Link>
            </>
          ) : (
            <>
              {isAdmin ? (
                <>
                  <Link to="/dashboard/invoices" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <FileText className="h-4 w-4" />
                    {t('nav.invoices')}
                  </Link>
                  <Link to="/dashboard/approvals" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <CheckCircle className="h-4 w-4" />
                    {t('nav.approvals')}
                  </Link>
                  <Link to="/dashboard/contractors" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Users className="h-4 w-4" />
                    {t('nav.contractors')}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard/time" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Clock className="h-4 w-4" />
                    {t('nav.timeTracking')}
                  </Link>
                  <Link to="/dashboard/clients" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <Users className="h-4 w-4" />
                    {t('nav.clients')}
                  </Link>
                  <Link to="/dashboard/invoices" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <FileText className="h-4 w-4" />
                    {t('nav.invoices')}
                  </Link>
                </>
              )}
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {!loading && (
            <>
              {user ? (
                <>
                  <Link to="/dashboard/settings">
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">
                      {t('nav.dashboard')}
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="mr-1 h-3 w-3" />
                    {t('auth.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      {t('auth.login')}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="hero" size="sm">
                      {t('header.tryFree')}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
