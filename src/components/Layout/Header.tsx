import React from 'react';
import { Link } from 'react-router-dom';
import { ProAspectLogo } from '@/components/ProAspectLogo';
import { Button } from '@/components/ui/button';
import { Clock, Users, FileText, Settings, LogOut, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Header: React.FC = () => {
  const { user, signOut, loading } = useAuth();

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

        <nav className="hidden md:flex items-center gap-6">
          {user && (
            <>
              <Link 
                to="/dashboard/time" 
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Clock className="h-4 w-4" />
                Tijdregistratie
              </Link>
              <Link 
                to="/dashboard/clients" 
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Users className="h-4 w-4" />
                Klanten
              </Link>
              <Link 
                to="/dashboard/invoices" 
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="h-4 w-4" />
                Facturen
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
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
                      Dashboard
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleSignOut}>
                    <LogOut className="mr-1 h-3 w-3" />
                    Uitloggen
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Inloggen
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="hero" size="sm">
                      Gratis proberen
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