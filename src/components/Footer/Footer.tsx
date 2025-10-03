import React from 'react';
import { Link } from 'react-router-dom';
import { ProAspectDark } from '@/components/ProAspectDark';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <ProAspectDark className="mb-4" />
            <p className="text-gray-400 text-sm mb-4">
              Professionele tijd- en facturatieoplossing voor Nederlandse ZZP'ers.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>De Werf 7-C, 's-Gravenhage</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>070 - 73 70 73 5</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>info@proaspect.nl</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/features/time-tracking" className="hover:text-primary transition-colors">Tijdregistratie</Link>
              </li>
              <li>
                <Link to="/features/invoicing" className="hover:text-primary transition-colors">Facturatie</Link>
              </li>
              <li>
                <Link to="/features/reporting" className="hover:text-primary transition-colors">Rapportage</Link>
              </li>
              <li>
                <Link to="/features/mobile-app" className="hover:text-primary transition-colors">Mobile App</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/support/help-center" className="hover:text-primary transition-colors">Help Center</Link>
              </li>
              <li>
                <Link to="/support/api-docs" className="hover:text-primary transition-colors">API Documentatie</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-primary transition-colors">Status</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Bedrijf</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">Over Ons</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-primary transition-colors">Voorwaarden</Link>
              </li>
              <li>
                <a href="https://www.proaspect.nl" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                  www.proaspect.nl
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 ProAspect. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  );
};