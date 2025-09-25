import React from 'react';
import { ProAspectLogo } from '@/components/ProAspectLogo';
import { Button } from '@/components/ui/button';
import { Clock, Users, FileText, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ProAspectLogo size="md" />
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a 
            href="#" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Clock className="h-4 w-4" />
            Tijdregistratie
          </a>
          <a 
            href="#" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Users className="h-4 w-4" />
            Klanten
          </a>
          <a 
            href="#" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileText className="h-4 w-4" />
            Facturen
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <a href="/login">Login</a>
          </Button>
          <Button variant="hero" size="sm">
            <a href="/dashboard">Start Gratis</a>
          </Button>
        </div>
      </div>
    </header>
  );
};