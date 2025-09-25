import React from 'react';
import { ProAspectLogo } from '@/components/ProAspectLogo';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <ProAspectLogo className="mb-4 filter invert" />
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
                <a href="#" className="hover:text-primary transition-colors">Tijdregistratie</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Facturatie</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Rapportage</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Mobile App</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-primary transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">API Documentatie</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Contact</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Status</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Bedrijf</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-primary transition-colors">Over Ons</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Voorwaarden</a>
              </li>
              <li>
                <a href="#" className="flex items-center gap-1 hover:text-primary transition-colors">
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