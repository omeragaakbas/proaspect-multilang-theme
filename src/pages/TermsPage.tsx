import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { FileText } from 'lucide-react';

export const TermsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <FileText className="h-16 w-16 text-primary mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">Algemene Voorwaarden</h1>
              <p className="text-muted-foreground">
                Laatst bijgewerkt: {new Date().toLocaleDateString('nl-NL')}
              </p>
            </div>

            <div className="prose prose-slate max-w-none">
              <h2>1. Definities</h2>
              <p>
                In deze algemene voorwaarden wordt verstaan onder:
              </p>
              <ul>
                <li><strong>ProAspect:</strong> de dienstverlener, gevestigd te 's-Gravenhage</li>
                <li><strong>Gebruiker:</strong> de natuurlijke of rechtspersoon die gebruik maakt van de diensten</li>
                <li><strong>Diensten:</strong> alle diensten die ProAspect aanbiedt via haar platform</li>
              </ul>

              <h2>2. Toepasselijkheid</h2>
              <p>
                Deze algemene voorwaarden zijn van toepassing op alle aanbiedingen, overeenkomsten en diensten van ProAspect, tenzij uitdrukkelijk schriftelijk anders is overeengekomen.
              </p>

              <h2>3. Account en Registratie</h2>
              <p>
                Voor het gebruik van onze diensten is registratie vereist. U bent verantwoordelijk voor:
              </p>
              <ul>
                <li>Het verstrekken van correcte en volledige informatie</li>
                <li>Het geheimhouden van uw inloggegevens</li>
                <li>Alle activiteiten die plaatsvinden onder uw account</li>
              </ul>

              <h2>4. Dienstverlening</h2>
              <p>
                ProAspect spant zich in om de diensten zo goed mogelijk te leveren, maar kan geen garantie geven dat:
              </p>
              <ul>
                <li>De diensten te allen tijde zonder onderbrekingen beschikbaar zijn</li>
                <li>De diensten foutloos functioneren</li>
                <li>Eventuele gebreken worden verholpen</li>
              </ul>

              <h2>5. Prijzen en Betaling</h2>
              <p>
                Alle prijzen zijn exclusief BTW tenzij anders vermeld. Betaling geschiedt conform de gekozen betalingsmethode. Bij niet-tijdige betaling behoudt ProAspect zich het recht voor om de toegang tot de diensten op te schorten.
              </p>

              <h2>6. Intellectueel Eigendom</h2>
              <p>
                Alle intellectuele eigendomsrechten met betrekking tot de diensten berusten bij ProAspect. Het is niet toegestaan om zonder voorafgaande schriftelijke toestemming:
              </p>
              <ul>
                <li>De software te kopiëren of te verveelvoudigen</li>
                <li>De broncode te decompileren of te wijzigen</li>
                <li>De diensten te verhuren of in sublicentie te geven</li>
              </ul>

              <h2>7. Privacy en Gegevensbescherming</h2>
              <p>
                ProAspect verwerkt persoonsgegevens conform de privacyverklaring en de AVG. Meer informatie vindt u in onze privacyverklaring.
              </p>

              <h2>8. Aansprakelijkheid</h2>
              <p>
                ProAspect is niet aansprakelijk voor:
              </p>
              <ul>
                <li>Indirecte schade, gevolgschade of bedrijfsschade</li>
                <li>Verlies van gegevens of winstderving</li>
                <li>Schade door onbevoegd gebruik van uw account</li>
              </ul>
              <p>
                De totale aansprakelijkheid van ProAspect is in alle gevallen beperkt tot het bedrag dat in het betreffende geval door de aansprakelijkheidsverzekering wordt uitbetaald.
              </p>

              <h2>9. Opzegging</h2>
              <p>
                U kunt uw account te allen tijde opzeggen via de instellingen. Bij opzegging blijft u verantwoordelijk voor betaling van alle kosten tot de datum van opzegging.
              </p>

              <h2>10. Wijzigingen</h2>
              <p>
                ProAspect behoudt zich het recht voor deze voorwaarden te wijzigen. Wijzigingen worden ten minste 30 dagen van tevoren aangekondigd via e-mail.
              </p>

              <h2>11. Toepasselijk Recht</h2>
              <p>
                Op deze algemene voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Den Haag.
              </p>

              <h2>12. Contact</h2>
              <p>
                Voor vragen over deze algemene voorwaarden kunt u contact opnemen met:
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
