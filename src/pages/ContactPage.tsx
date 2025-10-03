import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Footer/Footer';
import { useToast } from '@/hooks/use-toast';

export const ContactPage: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simuleer formulier verzenden
    setTimeout(() => {
      toast({
        title: "Bericht verzonden!",
        description: "We nemen zo spoedig mogelijk contact met je op.",
      });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Neem contact met ons op</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Wij staan klaar om al je vragen te beantwoorden en je te helpen het beste uit ProAspect te halen.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Contact informatie</h2>
              <p className="text-muted-foreground mb-8">
                Heb je een vraag, suggestie of wil je gewoon even kennismaken? 
                Je kunt ons bereiken via onderstaande kanalen of het contactformulier invullen.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Adres</h4>
                    <p className="text-muted-foreground">De Werf 7-C</p>
                    <p className="text-muted-foreground">2544 EH 's-Gravenhage</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">E-mail</h4>
                    <p className="text-muted-foreground">info@proaspect.nl</p>
                    <p className="text-muted-foreground">support@proaspect.nl</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Telefoon</h4>
                    <p className="text-muted-foreground">070 - 73 70 73 5</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Openingstijden</h4>
                    <p className="text-muted-foreground">Maandag t/m vrijdag: 09:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <div className="bg-card p-8 rounded-xl shadow-sm border border-border">
                <h3 className="text-2xl font-bold mb-6">Stuur ons een bericht</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Voornaam</label>
                      <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Achternaam</label>
                      <input 
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">E-mailadres</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Onderwerp</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Kies een onderwerp</option>
                      <option value="general">Algemene vraag</option>
                      <option value="support">Support</option>
                      <option value="sales">Sales</option>
                      <option value="other">Anders</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bericht</label>
                    <textarea 
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                    ></textarea>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Verzenden...' : 'Versturen'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Map Section */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="h-64 bg-muted rounded-xl flex items-center justify-center border border-border">
              <p className="text-muted-foreground">Google Maps kaart kan hier worden ingeladen</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">Veelgestelde vragen</h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              {['Hoe kan ik een account aanmaken?', 'Wat kost ProAspect?', 'Kan ik mijn gegevens exporteren?'].map((question, i) => (
                <div key={i} className="bg-card p-6 rounded-lg shadow-sm border border-border">
                  <h4 className="font-medium mb-2 flex items-center justify-between">
                    {question}
                    <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0">+</Button>
                  </h4>
                  <div className="hidden">
                    <p className="text-muted-foreground">
                      Hier komt het antwoord op de veelgestelde vraag.
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-10">
              <p className="text-muted-foreground mb-4">Staat je vraag er niet tussen?</p>
              <div className="flex justify-center">
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Live chat starten
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};
