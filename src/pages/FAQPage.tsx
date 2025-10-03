import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const FAQPage: React.FC = () => {
  const faqCategories = [
    {
      category: 'Algemeen',
      questions: [
        {
          question: 'Wat is ProAspect?',
          answer: 'ProAspect is een compleet platform voor ZZP\'ers en freelancers om hun bedrijf te beheren. Van tijdregistratie tot facturatie, alles in één overzichtelijke omgeving.'
        },
        {
          question: 'Voor wie is ProAspect geschikt?',
          answer: 'ProAspect is ideaal voor ZZP\'ers, freelancers, consultants en kleine bedrijven die hun administratie willen stroomlijnen en meer tijd willen besteden aan hun core business.'
        },
        {
          question: 'Heb ik technische kennis nodig?',
          answer: 'Nee, ProAspect is ontworpen om intuïtief en gebruiksvriendelijk te zijn. Je kunt direct aan de slag zonder technische kennis.'
        }
      ]
    },
    {
      category: 'Prijzen & Betaling',
      questions: [
        {
          question: 'Hoeveel kost ProAspect?',
          answer: 'We hebben verschillende plannen vanaf €19 per maand. Bekijk onze prijzenpagina voor alle details en opties.'
        },
        {
          question: 'Is er een gratis proefperiode?',
          answer: 'Ja, alle plannen komen met een gratis proefperiode van 14 dagen. Je kunt alle features testen zonder creditcard.'
        },
        {
          question: 'Kan ik maandelijks opzeggen?',
          answer: 'Ja, alle abonnementen zijn maandelijks opzegbaar. Er zit geen minimum looptijd aan vast.'
        },
        {
          question: 'Welke betaalmethoden accepteren jullie?',
          answer: 'We accepteren iDEAL, creditcards (Visa, Mastercard), en automatische incasso voor terugkerende betalingen.'
        }
      ]
    },
    {
      category: 'Features & Functionaliteit',
      questions: [
        {
          question: 'Kan ik facturen versturen vanuit ProAspect?',
          answer: 'Ja, je kunt professionele facturen maken en direct versturen via email. Ook kun je automatische herinneringen instellen.'
        },
        {
          question: 'Werkt ProAspect op mobiel?',
          answer: 'Ja, ProAspect is volledig responsive en werkt op alle apparaten - desktop, tablet en smartphone.'
        },
        {
          question: 'Kunnen meerdere gebruikers samenwerken?',
          answer: 'Ja, vanaf het Professional plan kun je teamleden toevoegen en samen werken in één account.'
        },
        {
          question: 'Is er een API beschikbaar?',
          answer: 'Ja, vanaf het Professional plan hebben we een API beschikbaar voor integraties met andere tools.'
        }
      ]
    },
    {
      category: 'Beveiliging & Privacy',
      questions: [
        {
          question: 'Is mijn data veilig?',
          answer: 'Ja, we gebruiken enterprise-grade beveiliging met SSL-encryptie. Alle data wordt veilig opgeslagen in de cloud met dagelijkse backups.'
        },
        {
          question: 'Waar worden mijn gegevens opgeslagen?',
          answer: 'Al je gegevens worden veilig opgeslagen in datacenters binnen de EU, in overeenstemming met de AVG wetgeving.'
        },
        {
          question: 'Wie heeft toegang tot mijn data?',
          answer: 'Alleen jij en eventuele teamleden die je zelf toegang geeft. Wij kijken nooit in je data zonder toestemming.'
        }
      ]
    },
    {
      category: 'Support & Hulp',
      questions: [
        {
          question: 'Hoe kan ik contact opnemen?',
          answer: 'Je kunt ons bereiken via email, telefoon of het contactformulier op onze website. We streven ernaar binnen 24 uur te reageren.'
        },
        {
          question: 'Is er een kennisbank beschikbaar?',
          answer: 'Ja, we hebben een uitgebreide kennisbank met handleidingen, video tutorials en veelgestelde vragen.'
        },
        {
          question: 'Krijg ik hulp bij het instellen?',
          answer: 'Ja, we helpen je graag op weg. Bij het Enterprise plan is er zelfs persoonlijke onboarding en training inbegrepen.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Veelgestelde Vragen
              </h1>
              <p className="text-xl text-muted-foreground">
                Vind snel antwoorden op de meest gestelde vragen over ProAspect.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mb-12">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">
                    {category.category}
                  </h2>
                  <Accordion type="single" collapsible className="space-y-4">
                    {category.questions.map((item, itemIndex) => (
                      <AccordionItem
                        key={itemIndex}
                        value={`item-${categoryIndex}-${itemIndex}`}
                        className="bg-card border border-border rounded-lg px-6"
                      >
                        <AccordionTrigger className="text-left font-semibold hover:no-underline text-foreground">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Staat je vraag er niet bij?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Neem gerust contact met ons op. We helpen je graag verder!
              </p>
              <a
                href="/contact"
                className="inline-flex items-center px-8 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Neem contact op
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
