import React from 'react';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HelpCircle, BookOpen, Video, MessageCircle, Search, FileText } from 'lucide-react';

export const HelpCenterPage = () => {
  const resources = [
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: 'Kennisbank',
      description: 'Uitgebreide handleidingen en tutorials',
      link: '/faq'
    },
    {
      icon: <Video className="h-8 w-8 text-primary" />,
      title: 'Video Tutorials',
      description: 'Leer ProAspect kennen met video-instructies',
      link: '#'
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-primary" />,
      title: 'Contact Support',
      description: 'Stel je vraag aan ons support team',
      link: '/contact'
    },
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: 'Documentatie',
      description: 'Technische documentatie en API referentie',
      link: '/support/api-docs'
    }
  ];

  const popularTopics = [
    'Hoe maak ik mijn eerste factuur?',
    'Tijdregistratie starten en stoppen',
    'Klanten toevoegen aan ProAspect',
    'BTW tarieven instellen',
    'Terugkerende facturen opzetten',
    'Rapporten exporteren'
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Help Center
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Vind antwoorden op al je vragen over ProAspect
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  placeholder="Zoek in onze kennisbank..."
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Hoe kunnen we je helpen?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {resources.map((resource, index) => (
                <Link
                  key={index}
                  to={resource.link}
                  className="p-6 border rounded-lg hover:shadow-lg transition-shadow text-center"
                >
                  <div className="mb-4 flex justify-center">{resource.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground text-sm">{resource.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Topics */}
        <section className="py-20 px-4 bg-muted/50">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Populaire Onderwerpen
            </h2>
            <div className="space-y-3">
              {popularTopics.map((topic, index) => (
                <Link
                  key={index}
                  to="/faq"
                  className="block p-4 bg-background border rounded-lg hover:shadow-md transition-shadow"
                >
                  <span className="text-foreground hover:text-primary">{topic}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-4">
              Kan je het antwoord niet vinden?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Ons support team helpt je graag verder
            </p>
            <Button asChild size="lg">
              <Link to="/contact">Neem Contact Op</Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
