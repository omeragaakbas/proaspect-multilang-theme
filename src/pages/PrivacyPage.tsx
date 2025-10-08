import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { Shield } from 'lucide-react';

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">Privacyverklaring</h1>
              <p className="text-muted-foreground">
                Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
              </p>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2>1. Inleiding</h2>
              <p>
                ProAspect respecteert de privacy van alle gebruikers van haar site en draagt er zorg voor dat de persoonlijke informatie die u ons verschaft vertrouwelijk wordt behandeld.
              </p>

              <h2>2. Gebruik van verzamelde gegevens</h2>
              <p>
                Wij gebruiken uw gegevens voor de volgende doeleinden:
              </p>
              <ul>
                <li>Om onze diensten te leveren en te verbeteren</li>
                <li>Voor facturatie en administratie</li>
                <li>Om u te informeren over wijzigingen in onze diensten</li>
                <li>Voor klantenondersteuning</li>
              </ul>

              <h2>3. Welke gegevens verzamelen wij?</h2>
              <p>
                ProAspect verzamelt de volgende persoonsgegevens:
              </p>
              <ul>
                <li>Naam en contactgegevens</li>
                <li>Bedrijfsgegevens (indien van toepassing)</li>
                <li>Financiële gegevens voor facturatie</li>
                <li>Gebruiksgegevens van onze diensten</li>
              </ul>

              <h2>4. Beveiliging</h2>
              <p>
                Wij nemen passende beveiligingsmaatregelen om misbruik van en ongeautoriseerde toegang tot uw persoonlijke gegevens te beperken. Wij zorgen ervoor dat alleen de noodzakelijke personen toegang hebben tot uw gegevens.
              </p>

              <h2>5. Cookies</h2>
              <p>
                ProAspect maakt gebruik van cookies om de gebruikservaring te verbeteren. Een cookie is een klein tekstbestand dat bij het eerste bezoek aan deze website wordt opgeslagen in de browser van uw computer, tablet of smartphone.
              </p>

              <h2>6. Gegevens inzien, aanpassen of verwijderen</h2>
              <p>
                U heeft het recht om uw persoonsgegevens in te zien, te corrigeren of te verwijderen. U kunt een verzoek tot inzage, correctie of verwijdering sturen naar info@proaspect.nl.
              </p>

              <h2>7. AVG Compliance</h2>
              <p>
                ProAspect is volledig AVG (Algemene Verordening Gegevensbescherming) compliant. Wij verwerken uw gegevens conform de geldende wet- en regelgeving.
              </p>

              <h2>8. Wijzigingen in deze privacyverklaring</h2>
              <p>
                ProAspect behoudt zich het recht voor om wijzigingen aan te brengen in deze privacyverklaring. Het verdient aanbeveling om deze privacyverklaring geregeld te raadplegen.
              </p>

              <h2>9. Contact</h2>
              <p>
                Als u vragen heeft over deze privacyverklaring, neem dan contact met ons op:
              </p>
              <ul>
                <li>Email: info@proaspect.nl</li>
                <li>Telefoon: 070 - 73 70 73 5</li>
                <li>Adres: De Werf 7-C, 's-Gravenhage</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
